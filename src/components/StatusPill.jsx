import React from "react";

export default function StatusPill({ label, value, live = false, timestamp, tone = "default" }) {
  const toneClass =
    tone === "live" ? "border-emerald-300 text-emerald-700 bg-emerald-50"
    : tone === "warn" ? "border-amber-300 text-amber-700 bg-amber-50"
    : tone === "down" ? "border-rose-300 text-rose-700 bg-rose-50"
    : "border-border text-muted-foreground bg-card";
  return (
    <span className={`status-pill ${toneClass}`}>
      {live && <span className="live-dot bg-emerald-500 animate-pulse" />}
      <span className="uppercase tracking-wide text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[11px] text-foreground">{value}</span>
      {timestamp && <span className="font-mono text-[10px] text-muted-foreground">{timestamp}</span>}
    </span>
  );
}