import { useEffect } from "react";

interface useOnClickOutsideParams {
  ref: React.RefObject<HTMLElement>;
  handler: (event: MouseEvent) => void;
}

export const useOnClickOutside = ({
  ref,
  handler,
}: useOnClickOutsideParams) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};
