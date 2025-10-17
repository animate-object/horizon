export enum MessageType {
  sessionStarted = "session-started",
}

export interface Message {
  type: MessageType;
}

export const MessageBuilder = {
  sessionStarted: (): Message => ({ type: MessageType.sessionStarted }),
};

export enum AlarmType {
  sessionFinished = "session-finished",
  sessionAlmostFinished = "session-almost-finished",
}
