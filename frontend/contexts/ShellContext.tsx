"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ShellActions {
  onUpload: () => void;
  onNewMap: () => void;
  setOnUpload: (fn: () => void) => void;
  setOnNewMap: (fn: () => void) => void;
}

const ShellContext = createContext<ShellActions>({
  onUpload: () => {},
  onNewMap: () => {},
  setOnUpload: () => {},
  setOnNewMap: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [onUpload, setOnUploadFn] = useState<() => void>(() => () => {});
  const [onNewMap, setOnNewMapFn] = useState<() => void>(() => () => {});

  const setOnUpload = useCallback((fn: () => void) => {
    setOnUploadFn(() => fn);
  }, []);

  const setOnNewMap = useCallback((fn: () => void) => {
    setOnNewMapFn(() => fn);
  }, []);

  return (
    <ShellContext.Provider value={{ onUpload, onNewMap, setOnUpload, setOnNewMap }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}