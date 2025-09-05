"use client";

import { useEffect, useState } from "react";

export function useDesktopBreakpoint() {
  const query = "(min-width: 768px)";
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== isDesktop) {
      setIsDesktop(media.matches);
    }

    const listener = () => setIsDesktop(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [isDesktop, query]);

  return isDesktop;
}
