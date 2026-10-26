import React from "react";
import StatusPill from "./StatusPill";

export default function HistoricalNitrateChart({ nitrate }) {
  const obs = ((nitrate && nitrate.observations) || []).filter((o) => o.observed_at);
  const sorted = [...obs].sort((a, b) => new Date(a.observed_at) - new Date(b.observed_at));

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-1">
        <div className="section-eyebrow">Historical Nitrate Observations</div>
        <StatusPill label="USGS WQP" value={sorted.length ? `${sorted.length} records` : "n/a"} tone={sorted.length ? "live" : "down"} live={!!sorted.length} />
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">Historical measurements are observations from nearby monitoring stations and may not represent conditions at your field.</p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-4">
          No nearby historical nitrate measurements were found.
        </p>
      ) : (
        <>
          {sorted.length >= 2 ? (
            <NitraLineChart sorted={sorted} />
          ) : (
            <div className="border border-border rounded-lg p-3 text-sm bg-secondary/40">
              <span className="font-mono">{sorted[0].nitrate_mg_l} {sorted[0].unit}</span>
              <span className="text-muted-foreground"> · {new Date(sorted[0].observed_at).toLocaleDateString()} · {sorted[0].usgs_site_code}</span>
            </div>
          )}
          <div className="mt-3 space-y-1.5 max-h-28 overflow-auto">
            {sorted.slice(-6).reverse().map((o, i) => (
              <div key={i} className="flex justify-between gap-3 text-xs border-b border-border pb-1">
                <span className="font-mono text-muted-foreground truncate">{new Date(o.observed_at).toLocaleDateString()} · {o.usgs_site_code}</span>
                <span className={`font-mono shrink-0 ${o.nitrate_mg_l >= 10 ? "text-rose-700 font-medium" : "text-foreground"}`}>{o.nitrate_mg_l} {o.unit}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="live-dot bg-rose-500" /> 10 mg/L MCL threshold</span>
          </div>
        </>
      )}
    </div>
  );
}

function NitraLineChart({ sorted }) {
  const W = 100, H = 100;
  const max = Math.max(12, ...sorted.map((o) => o.nitrate_mg_l));
  const pt = (o, i) => {
    const x = sorted.length === 1 ? W : (i / (sorted.length - 1)) * W;
    return [x, H - (o.nitrate_mg_l / max) * H];
  };
  const pts = sorted.map((o, i) => pt(o, i).join(",")).join(" ");
  const thresholdY = H - (10 / max) * H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-36 border border-border rounded-lg bg-secondary/30">
      <line x1="0" y1={thresholdY} x2={W} y2={thresholdY} stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      <polyline points={pts} fill="none" stroke="#1B4D3E" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {sorted.map((o, i) => {
        const [x, y] = pt(o, i);
        return <circle key={i} cx={x} cy={y} r="2" fill={o.nitrate_mg_l >= 10 ? "#DC2626" : "#1B4D3E"} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}