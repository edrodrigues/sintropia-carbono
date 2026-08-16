"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function VolumeFilterToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMinVolume = searchParams.get("volume") !== "all";

  const toggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMinVolume) {
      params.set("volume", "all");
    } else {
      params.delete("volume");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, isMinVolume]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={isMinVolume}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          isMinVolume ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isMinVolume ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-xs text-gray-600 select-none">
        {isMinVolume ? "Ativos com > 1 tonelada" : "Todos os ativos"}
      </span>
    </div>
  );
}
