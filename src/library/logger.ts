import { deepCopy } from './utils';

export interface Logger {
  enabled: boolean;
  setEnabled(enabled: boolean): void;

  log(...params: any[]): void;
  info(...params: any[]): void;
  warn(...params: any[]): void;
  error(...params: any[]): void;
  group(...params: any[]): void;
  groupEnd(...params: any[]): void;
}

const logger = {
  enabled: true,
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  },
  log(...params: any[]): void {
    if (!this.enabled) return;
    console.log('[vue-models | log]', ...deepCopy(params));
  },
  info(...params: any[]): void {
    if (!this.enabled) return;
    console.info('[vue-models | info]', ...deepCopy(params));
  },
  warn(...params: any[]): void {
    if (!this.enabled) return;
    console.warn('[vue-models | warning]', ...deepCopy(params));
  },
  error(...params: any[]): void {
    if (!this.enabled) return;
    console.error('[vue-models | error]', ...deepCopy(params));
  },
  group(...params: any[]): void {
    console.groupCollapsed('[vue-models]', ...deepCopy(params));
  },
  endGroup(): void {
    console.groupEnd();
  },
};

export default logger;
