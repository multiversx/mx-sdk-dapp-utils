import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
  SignMessageStatusEnum,
} from "../enums";
import type { IPlainTransactionObject } from "@multiversx/sdk-core";

export type ReplyWithPostMessageObjectType = {
  [CrossWindowProviderResponseEnums.handshakeResponse]: boolean;
  [CrossWindowProviderResponseEnums.loginResponse]: {
    address: string;
    accessToken?: string;
    /**
     * used in De-Fi wallet extension as wallet name
     * */
    name?: string;
    signature?: string;
    /**
     * contract address for alternate multisig login
     * */
    multisig?: string;
    /**
     * custom address for alternate login
     * */
    impersonate?: string;
  };
  [CrossWindowProviderResponseEnums.disconnectResponse]: boolean;
  [CrossWindowProviderResponseEnums.cancelResponse]: {
    address: string;
  };
  [CrossWindowProviderResponseEnums.signTransactionsResponse]: IPlainTransactionObject[];
  [CrossWindowProviderResponseEnums.guardTransactionsResponse]: IPlainTransactionObject[];
  [CrossWindowProviderResponseEnums.signMessageResponse]: {
    signature?: string;
    status: SignMessageStatusEnum;
  };
  [CrossWindowProviderResponseEnums.noneResponse]: null;
  [CrossWindowProviderResponseEnums.resetStateResponse]: boolean;
};

export type ReplyWithPostMessagePayloadType<
  K extends keyof ReplyWithPostMessageObjectType
> = {
  data?: ReplyWithPostMessageObjectType[K];
  error?: string;
};

export type ReplyWithPostMessageType = {
  [K in keyof ReplyWithPostMessageObjectType]: {
    type: K;
    payload: ReplyWithPostMessagePayloadType<K>;
  };
}[keyof ReplyWithPostMessageObjectType];

export type ResponseTypeMap = {
  [CrossWindowProviderRequestEnums.signTransactionsRequest]: CrossWindowProviderResponseEnums.signTransactionsResponse;
  [CrossWindowProviderRequestEnums.signMessageRequest]: CrossWindowProviderResponseEnums.signMessageResponse;
  [CrossWindowProviderRequestEnums.loginRequest]: CrossWindowProviderResponseEnums.loginResponse;
  [CrossWindowProviderRequestEnums.logoutRequest]: CrossWindowProviderResponseEnums.disconnectResponse;
  [CrossWindowProviderRequestEnums.guardTransactionsRequest]: CrossWindowProviderResponseEnums.guardTransactionsResponse;
  [CrossWindowProviderRequestEnums.cancelAction]: CrossWindowProviderResponseEnums.cancelResponse;
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: CrossWindowProviderResponseEnums.noneResponse;
  [CrossWindowProviderRequestEnums.finalizeResetStateRequest]: CrossWindowProviderResponseEnums.resetStateResponse;
};

export type RequestPayloadType = {
  [CrossWindowProviderRequestEnums.loginRequest]: {
    token: string | undefined;
  };
  [CrossWindowProviderRequestEnums.logoutRequest]: undefined;
  [CrossWindowProviderRequestEnums.signTransactionsRequest]: IPlainTransactionObject[];
  [CrossWindowProviderRequestEnums.guardTransactionsRequest]: IPlainTransactionObject[];
  [CrossWindowProviderRequestEnums.signMessageRequest]: {
    message: string;
  };
  [CrossWindowProviderRequestEnums.cancelAction]: undefined;
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]: undefined;
  [CrossWindowProviderRequestEnums.finalizeResetStateRequest]: undefined;
};

export type RequestMessageType = {
  [K in keyof RequestPayloadType]: {
    type: K;
    payload: RequestPayloadType[K];
  };
}[keyof RequestPayloadType];

export type ReplyWithPostMessageEventType = {
  [K in keyof ReplyWithPostMessageObjectType]: {
    type: CrossWindowProviderResponseEnums;
    payload: ReplyWithPostMessageObjectType[K];
  };
}[keyof ReplyWithPostMessageObjectType];

export interface PostMessageParamsType<
  T extends CrossWindowProviderRequestEnums
> {
  type: T;
  payload: RequestPayloadType[keyof RequestPayloadType];
}

export interface PostMessageReturnType<
  T extends CrossWindowProviderRequestEnums
> {
  type: ResponseTypeMap[T] | CrossWindowProviderResponseEnums.cancelResponse;
  payload: ReplyWithPostMessagePayloadType<ResponseTypeMap[T]>;
}
