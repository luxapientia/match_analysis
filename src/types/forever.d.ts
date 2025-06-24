declare module 'forever' {
  interface ForeverOptions {
    max?: number;
    silent?: boolean;
    killTree?: boolean;
    minUptime?: number;
    spinSleepTime?: number;
    sourceDir?: string;
    logFile?: string;
    outFile?: string;
    errFile?: string;
    command?: string;
    args?: string[];
  }

  function startDaemon(options: ForeverOptions): void;
  function startDaemon(script: string, options?: ForeverOptions): void;
  function start(script: string, options?: ForeverOptions): void;
  function stopAll(): Promise<void>;

  export { ForeverOptions, startDaemon, start, stopAll };
  export default { startDaemon, start, stopAll };
} 