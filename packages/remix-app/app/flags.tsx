import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

import type { Deferrable } from "./utils";
import { InlineDeferred } from "./utils";

let flagsContext = createContext<Record<string, boolean> | undefined>(
  undefined
);

export function useFlag(flag: string) {
  let flags = useContext(flagsContext);
  if (!flags) return false;
  return !!flags[flag];
}

export function Flags({
  children,
  flags,
}: PropsWithChildren<{ flags: Deferrable<Record<string, boolean>> }>) {
  let parentFlags = useContext(flagsContext);
  return (
    <InlineDeferred data={flags} fallback={children} error={children}>
      {(value) => (
        <flagsContext.Provider value={{ ...parentFlags, ...value }}>
          {children}
        </flagsContext.Provider>
      )}
    </InlineDeferred>
  );
}
