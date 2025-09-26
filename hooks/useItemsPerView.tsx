// hooks/useItemsPerView.ts
import { useEffect, useState } from "react";
export default function useItemsPerView() {
  const [n, setN] = useState(4);
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setN(1);
      else if (w < 1024) setN(2);
      else setN(4);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return n;
}
