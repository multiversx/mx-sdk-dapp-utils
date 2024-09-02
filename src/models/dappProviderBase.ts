import type { Transaction, SignableMessage } from "@multiversx/sdk-core";
import { Nullable } from "../types";

export interface IDAppProviderOptions {
  callbackUrl?: string;
  [key: string]: any;
}

export interface IDAppProviderAccount {
  address: string;
  signature?: string;
  multisig?: string;
  impersonate?: string;
  [key: string]: unknown;
}

export interface IDAppProviderBase {
  login?(options?: IDAppProviderOptions): Promise<IDAppProviderAccount | null>;
  logout(options?: IDAppProviderOptions): Promise<boolean>;
  getAccount(): Promise<IDAppProviderAccount | null>;
  signTransaction(
    transaction: Transaction,
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction | undefined>>;
  signTransactions(
    transactions: Transaction[],
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction[]>>;
  signMessage(
    message: SignableMessage,
    options?: IDAppProviderOptions
  ): Promise<Nullable<SignableMessage>>;
}
