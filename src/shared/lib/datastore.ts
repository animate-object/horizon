import { debounce, keyBy, partition } from "lodash";
import { Storage } from "../storage";

type EntityType = "tool" | "toolset" | "pastSession";
type UUID = string;
type ISO8601Date = string;

interface BaseEntity {
  type: EntityType;
  id: UUID;
}

interface Auditable {
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
}

export interface ToolDefinition extends BaseEntity, Auditable {
  type: "tool";
  name: string;
  url: string;
}

export interface Toolset extends BaseEntity, Auditable {
  type: "toolset";
  toolIds: UUID[];
  name: string;
}

export interface PastSession extends BaseEntity, Auditable {
  type: "pastSession";
  taskDescription: string;
  durationMinutes: number;
  startedAt: ISO8601Date;
  toolIds: UUID[];
}

export type Entity = ToolDefinition | Toolset | PastSession;

export function isToolDefinition(e: Entity): e is ToolDefinition {
  return e.type === "tool";
}

export function isToolset(e: Entity): e is Toolset {
  return e.type === "toolset";
}

export function isSession(e: Entity): e is PastSession {
  return e.type === "pastSession";
}

function ISONow(): ISO8601Date {
  return new Date().toISOString();
}

export const AuditableFactory = {
  create: (): Auditable => {
    const now = ISONow();
    return {
      createdAt: now,
      updatedAt: now,
    };
  },
  update: <A extends Auditable = Auditable>(a: A): A => ({
    ...a,
    updatedAt: ISONow(),
  }),
};

function _createEntity(): Omit<BaseEntity, "type"> {
  return {
    id: crypto.randomUUID(),
  };
}

export const EntityFactory = {
  create: _createEntity(),
  createAuditable: (): Omit<BaseEntity, "type"> & Auditable => ({
    ...AuditableFactory.create(),
    ..._createEntity(),
  }),
};

type BaseFields = "id" | "type" | "createdAt" | "updatedAt";

export const ToolFactory = {
  create: (args: Omit<ToolDefinition, BaseFields>): ToolDefinition => ({
    type: "tool",
    ...EntityFactory.createAuditable(),
    ...args,
  }),
  update: (
    tool: ToolDefinition,
    args: Partial<Omit<ToolDefinition, BaseFields>>
  ): ToolDefinition => AuditableFactory.update({ ...tool, ...args }),
};

export const ToolsetFactory = {
  create: (args: Omit<Toolset, BaseFields>): Toolset => ({
    type: "toolset",
    ...EntityFactory.createAuditable(),
    ...args,
  }),
  update: (
    toolset: Toolset,
    args: Partial<Omit<Toolset, BaseFields>>
  ): Toolset => AuditableFactory.update({ ...toolset, ...args }),
};

export const PastSessionFactory = {
  create: (args: Omit<PastSession, BaseFields>): PastSession => ({
    type: "pastSession",
    ...EntityFactory.createAuditable(),
    ...args,
  }),
  update: (
    session: PastSession,
    args: Partial<Omit<PastSession, BaseFields>>
  ): PastSession => AuditableFactory.update({ ...session, ...args }),
};

type Datastore = Record<UUID, Entity>;

const EMPTY_STORE = {};

export class DataLoader {
  private latest: Datastore | undefined;

  constructor() {
    this.load();
  }

  public async load(): Promise<Datastore> {
    this.latest = await Storage.get<Datastore>(
      Storage.keys.Datastore,
      EMPTY_STORE
    );
    return this.latest;
  }

  private write_ = async (dataStore: Datastore): Promise<void> => {
    await Storage.set(Storage.keys.Datastore, dataStore);
    this.load();
    return;
  };

  public writeDebounced = debounce(this.write_, 500, { trailing: true });

  public queueWrite = (dataStore: Datastore) => {
    this.latest = dataStore;
    this.writeDebounced(dataStore);
  };

  public async getStore(): Promise<Datastore> {
    if (this.latest == null) return this.load();
    return Promise.resolve(this.latest);
  }

  public async get<T extends EntityType>(
    id: UUID,
    type: T
  ): Promise<Extract<Entity, { type: T }> | undefined> {
    const store = await this.getStore();
    const e = store[id];
    if (e == null) return;
    if (e.type === type) {
      return e as Extract<Entity, { type: T }>;
    }
    throw Error(`Type mismatch for stored entity ${id} - ${e.type} != ${type}`);
  }

  public async upsert<E extends Entity>(e: E): Promise<E> {
    await this.queueWrite({ ...this.latest, [e.id]: e });
    return e;
  }

  public async delete(id: UUID) {
    const store = await this.getStore();
    if (!store.hasOwnProperty(id)) return;
    delete store[id];
  }

  public async allToolDefinitions(
    store_: Datastore | undefined = undefined
  ): Promise<ToolDefinition[]> {
    const store = store_ ?? (await this.getStore());
    return Object.values(store).filter((e) => e.type === "tool");
  }

  public async upsertToolDefinitions(
    definitions: Array<{ url: string; name?: string; id?: string }>
  ): Promise<ToolDefinition[]> {
    const store = await this.getStore();
    const [known, unknown] = partition(definitions, (d) => d.id != null);
    const knownTools = known.map((d) => store[d.id!])!;
    const otherDefs = await this.allToolDefinitions(store);
    const lookup = keyBy(otherDefs, (def: ToolDefinition) => def.url);

    let upsertedDefinitions: ToolDefinition[] = [
      ...(knownTools as ToolDefinition[]),
    ];
    for (const def of unknown) {
      if (lookup[def.url] != null) {
        upsertedDefinitions.push(lookup[def.url]);
      }
      upsertedDefinitions.push(
        await this.upsert(
          ToolFactory.create({
            url: def.url,
            name: def.name ?? def.url,
          })
        )
      );
    }
    return upsertedDefinitions;
  }
}
