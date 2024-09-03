import type { Transaction, Message } from "@multiversx/sdk-core";
import type { Nullable } from "../types";

export interface IDAppProviderOptions {
  callbackUrl?: string;
  [key: string]: any;
}

export interface IDAppProviderAccount {
  address: string;
  name?: string;
  signature?: string;
  multisig?: string;
  impersonate?: string;
  [key: string]: unknown;
}

export interface IDAppProviderBase {
  login?(options?: IDAppProviderOptions): Promise<IDAppProviderAccount | null>;
  logout(options?: IDAppProviderOptions): Promise<boolean>;
  getAccount(): IDAppProviderAccount | null;
  isInitialized(): boolean;
  isConnected?(): boolean;
  signTransaction(
    transaction: Transaction,
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction | undefined>>;
  signTransactions(
    transactions: Transaction[],
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction[]>>;
  signMessage(
    messageToSign: string,
    options?: IDAppProviderOptions
  ): Promise<Nullable<Message>>;
}
