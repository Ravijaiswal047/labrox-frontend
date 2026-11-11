import { createContext, useContext } from "react";

export const NABLFilterContext = createContext(null);

export const useNABLFilters = () => {
  const ctx = useContext(NABLFilterContext);
  if (!ctx) {
    throw new Error("useNABLFilters must be used inside NABL Document Control");
  }
  return ctx;
};
