"use client";

import { useEffect } from "react";

export function StrictModeFix() {
  useEffect(() => {
    const removeExtensions = () => {
      document.body.removeAttribute("data-new-gr-c-s-check-loaded");
      document.body.removeAttribute("data-gr-ext-installed");
      document.body.removeAttribute("data-gr-c-s-check-loaded");
    };

    removeExtensions();

    const observer = new MutationObserver(removeExtensions);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-new-gr-c-s-check-loaded", "data-gr-ext-installed", "data-gr-c-s-check-loaded"],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
