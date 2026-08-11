interface PendoVisitor {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface PendoAccount {
  id: string;
  [key: string]: unknown;
}

interface PendoOptions {
  visitor: PendoVisitor;
  account?: PendoAccount;
}

interface PendoSDK {
  initialize(options: PendoOptions): void;
  identify(options: PendoOptions): void;
  updateOptions(options: PendoOptions): void;
  clearSession(): void;
  track(eventName: string, properties?: Record<string, unknown>): void;
  pageLoad(): void;
}

declare const pendo: PendoSDK;
