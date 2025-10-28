export const prefixLogger = (prefix: string) => {
  return {
    info: (message: string, ...args: unknown[]) =>
      console.info(`${prefix} ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) =>
      console.warn(`${prefix} ${message}`, ...args),
    error: (message: string, ...args: unknown[]) =>
      console.error(`${prefix} ${message}`, ...args),
    debug: (message: string, ...args: unknown[]) =>
      console.debug(`${prefix} ${message}`, ...args),
    log: (message: string, ...args: unknown[]) =>
      console.log(`${prefix} ${message}`, ...args),
  };
};
