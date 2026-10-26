import React from "react";

const STATUS = {
  Available: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Limited: { dot: "bg-amber-500", text: "text-amber-700" },
  Unavailable: { dot: "bg-slate-300", text: "text-slate-500" },
};

export default function ConfidencePanel({ risk, weather, streamflow, nitrate, watershed }) {
  const nitrateStatus = !nitrate || !nitrate.available ? "Unavailable" : (nitrate.observations || []).length >= 5 ? "Available" : "Limited";
  const breakdown = [
    { label: "Weather data", status: weather && weather.available ? "Available" : "Unavailable" },
    { label: "Streamflow data", status: streamflow && streamflow.available ? "Available" : "Unavailable" },
    { label: "Nitrate data", status: nitrateStatus },
    { label: "Watershed data", status: watershed ? "Available" : "Unavailable" },
    { label: "Soil data", status: "Unavailable" },
  ];
  const tone = risk.data_confidence === "HIGH" ? "text-emerald-700" : risk.data_confidence === "MEDIUM" ? "text-amber-700" : "text-rose-700";

  return (
    <div className="bento-card">
      <div className="section-eyebrow mb-1">Data Confidence</div>
      <div className={`font-display text-3xl ${tone}`}>{risk.data_confidence}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
        Confidence reflects the availability, coverage, and recency of the environmental data used for this assessment.
      </p>
      <div className="mt-3 pt-3 border-t border-border space-y-2">
        {breakdown.map((b, i) => {
          const s = STATUS[b.status];
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-foreground">
                <span className={`live-dot ${s.dot}`} /> {b.label}
              </span>
              <span className={`font-mono text-[11px] ${s.text}`}>{b.status}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">The confidence level is automatically reduced when key datasets are missing.</p>
    </div>
  );
}