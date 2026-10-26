import React from "react";
import StatusPill from "./StatusPill";

const TREND = {
  rising: { text: "text-rose-700", label: "Rising ↑" },
  falling: { text: "text-emerald-700", label: "Falling ↓" },
  stable: { text: "text-slate-600", label: "Stable →" },
  unknown: { text: "text-slate-500", label: "Unknown" },
};

export default function StreamflowPanel({ streamflow }) {
  const available = streamflow && streamflow.available;
  const sites = (streamflow && streamflow.sites) || [];
  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-xl text-foreground">Streamflow & Stations</h3>
        <StatusPill label="USGS" value={available ? "NWIS" : "n/a"} tone={available ? "live" : "down"} live={available} />
      </div>
      {!available && (
        <p className="text-sm text-muted-foreground">No nearby USGS streamflow monitoring stations found within ~35 miles.</p>
      )}
      {available && (
        <div className="space-y-3">
          {sites.map((s, i) => {
            const t = TREND[s.discharge_trend] || TREND.unknown;
            return (
              <div key={i} className="border border-border rounded-md p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{s.name || s.site_code}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">USGS {s.site_code} · {s.distance_mi.toFixed(1)} mi</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-foreground">{s.discharge_cfs != null ? s.discharge_cfs : "—"}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">cfs</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <span className={`text-xs font-mono ${t.text}`}>{t.label}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{s.observed_at ? new Date(s.observed_at).toLocaleString() : "—"}</span>
                </div>
              </div>
            );
          })}
          <p className="text-[11px] text-muted-foreground italic">Station readings reflect river conditions nearby — not your field's nitrate level.</p>
        </div>
      )}
    </div>
  );
}