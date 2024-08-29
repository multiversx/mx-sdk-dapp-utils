type SafeWindowType<T extends Window = Window> = {
  [K in keyof T]?: T[K];
};

export const safeWindow: SafeWindowType =
  typeof window !== "undefined" ? window : ({} as SafeWindowType);
