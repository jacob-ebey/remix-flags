export interface Logger {
  captureException(error: unknown): void;
}
