export enum MessageType {
  sessionStarted = "session-started",
  landingViewed = "landing-viewed",
  endSession = "end-session",
}

export interface Message {
  type: MessageType;
}

export const MessageBuilder = {
  sessionStarted: (): Message => ({ type: MessageType.sessionStarted }),
  endSession: (): Message => ({ type: MessageType.endSession }),
  landingViewed: (): Message => ({ type: MessageType.landingViewed }),
};

export const ResponseBuilder = {
  taskComplete: (): { type: string } => ({ type: "task-complete" }),
};

export enum AlarmType {
  sessionFinished = "session-finished",
  sessionAlmostFinished = "session-almost-finished",
}
