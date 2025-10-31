export enum MessageType {
  sessionStarted = "session-started",
  landingViewed = "landing-viewed",
  endSession = "end-session",
  testBlocklist = "test-block-list",
  openExtensionView = "open-extension-view",
}

interface BaseMessage {
  type: MessageType;
}

export interface TestBlockListMessage extends BaseMessage {
  type: MessageType.testBlocklist;
  url: string;
}

export interface SessionStartedMessage extends BaseMessage {
  type: MessageType.sessionStarted;
}

export interface LandingViewedMessage extends BaseMessage {
  type: MessageType.landingViewed;
}

export interface EndSessionMessage extends BaseMessage {
  type: MessageType.endSession;
}

export interface OpenExtensionView extends BaseMessage {
  type: MessageType.openExtensionView;
  view: "landing" | "blocked";
}

export type Message =
  | TestBlockListMessage
  | SessionStartedMessage
  | LandingViewedMessage
  | EndSessionMessage
  | OpenExtensionView;

export const MessageBuilder = {
  sessionStarted: (): SessionStartedMessage => ({
    type: MessageType.sessionStarted,
  }),
  endSession: (): EndSessionMessage => ({ type: MessageType.endSession }),
  landingViewed: (): LandingViewedMessage => ({
    type: MessageType.landingViewed,
  }),
  testBlockList: (url: string): TestBlockListMessage => ({
    type: MessageType.testBlocklist,
    url,
  }),
  openExtensionView: (view: OpenExtensionView["view"]): OpenExtensionView => ({
    type: MessageType.openExtensionView,
    view,
  }),
};

export type DecisionResponse = { type: "decision"; decision: boolean };

export const ResponseBuilder = {
  taskComplete: (): { type: "task-complete" } => ({ type: "task-complete" }),
  decision: (decision: boolean): DecisionResponse => ({
    type: "decision",
    decision,
  }),
};

export enum AlarmType {
  sessionFinished = "session-finished",
  sessionAlmostFinished = "session-almost-finished",
}
