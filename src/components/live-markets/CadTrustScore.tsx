"use client";

import { ShieldCheck } from "lucide-react";

interface CadTrustScoreProps {
  ratingBezero: string | null | undefined;
  ratingSylvera: string | null | undefined;
  isCcpAligned: boolean | null | undefined;
  variant?: "row" | "compact";
}

function ratingColor(value: string): string {
  const v = value.toUpperCase().trim();
  if (["A", "A+", "AA", "AAA"].includes(v)) return "bg-emerald-50 text-emerald-700";
  if (["B+", "B", "BB", "BBB"].includes(v)) return "bg-sky-50 text-sky-700";
  if (["C+", "C", "CC", "CCC"].includes(v)) return "bg-amber-50 text-amber-700";
  if (["D", "E", "F"].includes(v)) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export function CadTrustScore({
  ratingBezero,
  ratingSylvera,
  isCcpAligned,
  variant = "row",
}: CadTrustScoreProps) {
  const hasAny =
    (ratingBezero && ratingBezero.trim()) ||
    (ratingSylvera && ratingSylvera.trim()) ||
    isCcpAligned;

  if (!hasAny) {
    return (
      <span className="text-[11px] text-gray-400">—</span>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {ratingBezero && ratingBezero.trim() && (
          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${ratingColor(ratingBezero)}`}>
            BZ:{ratingBezero}
          </span>
        )}
        {ratingSylvera && ratingSylvera.trim() && (
          <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${ratingColor(ratingSylvera)}`}>
            SV:{ratingSylvera}
          </span>
        )}
        {isCcpAligned && (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-label="CCP Aligned" />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {ratingBezero && ratingBezero.trim() && (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${ratingColor(ratingBezero)}`}>
          BeZero: {ratingBezero}
        </span>
      )}
      {ratingSylvera && ratingSylvera.trim() && (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${ratingColor(ratingSylvera)}`}>
          Sylvera: {ratingSylvera}
        </span>
      )}
      {isCcpAligned && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700">
          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
          CCP
        </span>
      )}
    </div>
  );
}
