import { useEffect, useState } from "react";

export function useSetWidth() {
  const [width, setWidth] = useState<number>(window.innerWidth);

  function checkWidthOfWindow() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", checkWidthOfWindow);
    return () => {
      window.removeEventListener("resize", checkWidthOfWindow);
    };
  }, []);
  return width;
}