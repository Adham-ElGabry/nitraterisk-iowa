import React from "react";

const EFFECT = {
  "LOWER RISK": { label: "Lower risk", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "NEUTRAL": { label: "Neutral", cls: "text-slate-600 bg-slate-50 border-slate-200" },
  "UNKNOWN": { label: "Unknown", cls: "text-slate-500 bg-slate-100 border-slate-200" },
  "INCREASED RISK": { label: "Increased risk", cls: "text-rose-700 bg-rose-50 border-rose-200" },
};

const SOURCE_BY_NAME = {
  "Recent rainfall (24h)": "NOAA / NWS",
  "Forecast rainfall (72h)": "NOAA / NWS",
  "Temperature": "NOAA / NWS",
  "Streamflow": "USGS NWIS",
  "Streamflow trend": "USGS NWIS",
  "Recent fertilizer timing": "Field input",
  "Crop / land use": "Field input",
  "Irrigation": "Field input",
  "Historical nitrate observations": "USGS WQP",
};

export default function RiskFactors({ factors }) {
  return (
    <div className="bento-card">
      <div className="section-eyebrow mb-3">What's Driving the Risk?</div>
      {/* Header row */}
      <div className="hidden md:grid grid-cols-[1.1fr_1fr_0.9fr_0.7fr] gap-3 pb-2 border-b border-border text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
        <span>Factor</span><span>Current condition</span><span>Effect on risk</span><span>Source</span>
      </div>
      <div className="divide-y divide-border">
        {factors.map((f, i) => {
          const e = EFFECT[f.contribution] || EFFECT.NEUTRAL;
          return (
            <div key={i} className="py-2.5 md:grid md:grid-cols-[1.1fr_1fr_0.9fr_0.7fr] md:gap-3 md:items-center">
              <div className="text-sm font-medium text-foreground">{f.name}</div>
              <div className="mt-0.5 md:mt-0">
                <div className="font-mono text-xs text-foreground">{f.value}</div>
                <div className="text-[11px] text-muted-foreground">{f.detail}</div>
              </div>
              <div className="mt-1.5 md:mt-0">
                <span className={`inline-block text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded border ${e.cls}`}>{e.label}</span>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground mt-1 md:mt-0">{SOURCE_BY_NAME[f.name] || "—"}</div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border">
        Classifications follow documented prototype threshold rules — never guessed. "Unknown" means the data needed for that rule was unavailable.
      </p>
    </div>
  );
}