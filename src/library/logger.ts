export interface Logger {
  enabled: boolean;
  setEnabled(enabled: boolean): void;

  log(...params: any[]): void;
  info(...params: any[]): void;
  warn(...params: any[]): void;
  error(...params: any[]): void;
}

const logger = {
  enabled: true,
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  },
  log(...params: any[]): void {
    if (!this.enabled) return;
    console.log("[vue-models | log]", ...params);
  },
  info(...params: any[]): void {
    if (!this.enabled) return;
    console.info("[vue-models | info]", ...params);
  },
  warn(...params: any[]): void {
    if (!this.enabled) return;
    console.warn("[vue-models | warning]", ...params);
  },
  error(...params: any[]): void {
    if (!this.enabled) return;
    console.error("[vue-models | error]", ...params);
  },
};

export default logger;
