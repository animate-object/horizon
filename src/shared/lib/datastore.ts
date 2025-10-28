import { debounce, keyBy, orderBy, partition, take, values } from "lodash";
import { Storage, StorageKeys } from "@/shared/lib/storage";

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
  endedEarlyAt?: ISO8601Date;
  mode: "standard" | "free";
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

type Datastore<E extends Entity> = Record<UUID, E>;

const EMPTY_STORE = {};

export class DataLoader<E extends Entity> {
  private latest: Datastore<E> | undefined;
  private key: StorageKeys;

  constructor(key: StorageKeys) {
    this.key = key;
    this.load();
  }

  private async waitTilLoaded(maxAttempts = 10, timeout = 250): Promise<void> {
    let attempts = 0;
    while (this.latest == undefined && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
      attempts++;
    }
    return;
  }

  private async load(): Promise<Datastore<E>> {
    this.latest = await Storage.get<Datastore<E>>(this.key, EMPTY_STORE);
    return this.latest;
  }

  private async write_(dataStore: Datastore<E>): Promise<void> {
    await Storage.set(this.key, dataStore);
    this.load();
    return;
  }

  protected async setLatest(datastore: Datastore<E>) {
    this.latest = datastore;
  }

  public writeDebounced = debounce(this.write_, 500, { trailing: true });

  public queueWrite = (dataStore: Datastore<E>) => {
    this.latest = dataStore;
    this.writeDebounced(dataStore);
  };

  public async getStore(): Promise<Datastore<E>> {
    if (this.latest == null) return this.load();
    return Promise.resolve(this.latest);
  }

  public async get(id: UUID): Promise<E | undefined> {
    const store = await this.getStore();
    return store[id] as E | undefined;
  }

  public async upsert(e: E): Promise<E> {
    await this.waitTilLoaded();
    this.queueWrite({ ...this.latest, [e.id]: e });
    return e;
  }

  public async waitForUpsert(e: E): Promise<E> {
    await this.waitTilLoaded();
    await this.write_({ ...this.latest, [e.id]: e });
    return e;
  }

  public async delete(id: UUID) {
    const store = await this.getStore();
    if (!store.hasOwnProperty(id)) return;
    delete store[id];
  }
}

export class ToolLoader extends DataLoader<ToolDefinition> {
  constructor() {
    super(StorageKeys.DatastoreTools);
  }

  public async listAll(
    store_: Datastore<ToolDefinition> | undefined = undefined
  ): Promise<ToolDefinition[]> {
    const store = store_ ?? (await this.getStore());
    return Object.values(store).filter((e) => e.type === "tool");
  }

  public async upsertMany(
    definitions: Array<{ url: string; name?: string; id?: string }>
  ): Promise<ToolDefinition[]> {
    const store = await this.getStore();
    const [known, unknown] = partition(definitions, (d) => d.id != null);
    const knownTools = known.map((d) => store[d.id!])!;
    const otherDefs = await this.listAll(store);
    const lookup = keyBy(otherDefs, (def: ToolDefinition) => def.url);

    let upsertedDefinitions: ToolDefinition[] = [
      ...(knownTools as ToolDefinition[]),
    ];
    for (const def of unknown) {
      if (lookup[def.url] != null) {
        upsertedDefinitions.push(lookup[def.url]);
        continue;
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

export class PastSessionLoader extends DataLoader<PastSession> {
  constructor() {
    super(StorageKeys.DatastorePastSessions);
  }

  public async recentSessions(count: number = 50): Promise<PastSession[]> {
    const data = await this.getStore();
    const sorted = orderBy(values(data), ["startedAt"], ["desc"]);
    const trimmed = take(sorted, count);
    return trimmed;
  }

  public async addRecentSession(
    session: PastSession,
    keep: number = 50
  ): Promise<void> {
    const recent = await this.recentSessions(keep - 1);
    this.setLatest(keyBy(recent, (session) => session.id));
    this.upsert(session);
  }
}

export class ToolsetLoader extends DataLoader<Toolset> {
  constructor() {
    super(StorageKeys.DatastoreToolsets);
  }
}
