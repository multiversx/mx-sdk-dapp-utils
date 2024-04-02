import { ResponseTypeMap } from "../types/crossWindowProviderTypes";
import {
  CrossWindowProviderRequestEnums,
  CrossWindowProviderResponseEnums,
} from "../enums/crossWindowProviderEnums";

export const responseTypeMap: ResponseTypeMap = {
  [CrossWindowProviderRequestEnums.signTransactionsRequest]:
    CrossWindowProviderResponseEnums.signTransactionsResponse,
  [CrossWindowProviderRequestEnums.guardTransactionsRequest]:
    CrossWindowProviderResponseEnums.guardTransactionsResponse,
  [CrossWindowProviderRequestEnums.signMessageRequest]:
    CrossWindowProviderResponseEnums.signMessageResponse,
  [CrossWindowProviderRequestEnums.loginRequest]:
    CrossWindowProviderResponseEnums.loginResponse,
  [CrossWindowProviderRequestEnums.logoutRequest]:
    CrossWindowProviderResponseEnums.disconnectResponse,
  [CrossWindowProviderRequestEnums.cancelAction]:
    CrossWindowProviderResponseEnums.cancelResponse,
  [CrossWindowProviderRequestEnums.finalizeHandshakeRequest]:
    CrossWindowProviderResponseEnums.noneResponse,
  [CrossWindowProviderRequestEnums.finalizeResetStateRequest]:
    CrossWindowProviderResponseEnums.resetStateResponse,
};

type SafeWindowType<T extends Window = Window> = {
  [K in keyof T]?: T[K];
};

export const safeWindow: SafeWindowType =
  typeof window !== "undefined" ? window : ({} as SafeWindowType);
