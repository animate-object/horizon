export enum MessageType {
  sessionStarted = "session-started",
  landingViewed = "landing-viewed",
}

export interface Message {
  type: MessageType;
}

export const MessageBuilder = {
  sessionStarted: (): Message => ({ type: MessageType.sessionStarted }),
  landingViewed: (): Message => ({ type: MessageType.landingViewed }),
};

export enum AlarmType {
  sessionFinished = "session-finished",
  sessionAlmostFinished = "session-almost-finished",
}
