import { useMemo } from "react";

export const useMac = () => {
  const isMac = useMemo(() => {
    if (typeof navigator !== "undefined") {
      return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    }
    return false;
  }, []);

  return isMac;
};
