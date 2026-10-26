import React from "react";
import { AlertTriangle } from "lucide-react";
import StatusPill from "./StatusPill";

const STATES = {
  LOW: { text: "text-emerald-700", soft: "bg-emerald-50", bar: "bg-emerald-500", border: "border-emerald-200" },
  MODERATE: { text: "text-amber-700", soft: "bg-amber-50", bar: "bg-amber-500", border: "border-amber-200" },
  ELEVATED: { text: "text-orange-700", soft: "bg-orange-50", bar: "bg-orange-500", border: "border-orange-200" },
  HIGH: { text: "text-rose-700", soft: "bg-rose-50", bar: "bg-rose-500", border: "border-rose-200" },
  "INSUFFICIENT DATA": { text: "text-slate-600", soft: "bg-slate-100", bar: "bg-slate-400", border: "border-slate-200" },
};

export default function RiskCard({ risk }) {
  const cat = risk.risk_category;
  const c = STATES[cat] || STATES["INSUFFICIENT DATA"];
  const insufficient = cat === "INSUFFICIENT DATA";
  const pct = risk.risk_probability_pct;

  return (
    <div className={`bento-card border ${c.border}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Status */}
        <div className="min-w-0">
          <div className="section-eyebrow mb-2">Nitrate Risk · Next 72 Hours</div>
          <div className={`font-display ${c.text} leading-none`} style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)" }}>
            {cat}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full bg-secondary border border-border text-secondary-foreground">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Prototype estimate
            </span>
            <StatusPill label="Confidence" value={risk.data_confidence} live tone={risk.data_confidence === "LOW" ? "warn" : "live"} />
          </div>
          <p className="text-xs text-muted-foreground mt-3 max-w-md leading-relaxed">
            This is an experimental estimate based on available environmental indicators and is not a validated nitrate forecasting model.
          </p>
        </div>

        {/* Probability panel */}
        <div className={`lg:w-72 shrink-0 rounded-lg border p-4 ${c.soft}`}>
          {insufficient ? (
            <>
              <div className="section-eyebrow mb-1.5">Estimated Probability</div>
              <div className={`font-mono text-sm ${c.text} leading-snug`}>Insufficient data for a validated probability</div>
              <p className="text-[11px] text-muted-foreground mt-2">Key environmental datasets were unavailable, so no percentage is shown rather than an invented number.</p>
            </>
          ) : (
            <>
              <div className="section-eyebrow mb-1">Estimated Probability</div>
              <div className="flex items-end gap-1.5">
                <span className={`font-mono ${c.text} leading-none`} style={{ fontSize: "2.5rem" }}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/70 border border-border mt-3 overflow-hidden">
                <div className={`h-full ${c.bar}`} style={{ width: `${Math.min(100, Math.max(2, pct))}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2.5 leading-snug">
                Prototype heuristic estimate of exceeding the 10 mg/L nitrate threshold — experimental, not validated.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}