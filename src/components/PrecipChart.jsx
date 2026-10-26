import React from "react";

export default function PrecipChart({ weather }) {
  const periods = (weather && weather.forecast_periods) || [];
  const now = Date.now();
  const next72 = periods
    .map((p) => ({ ...p, hours: (new Date(p.start).getTime() - now) / 3600000 }))
    .filter((p) => p.hours >= 0 && p.hours < 72 && p.precip_in != null);

  if (next72.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground">
        Forecast unavailable — no hourly precipitation data returned for this location.
      </div>
    );
  }

  const max = Math.max(0.05, ...next72.map((p) => p.precip_in || 0));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground">Hourly precipitation forecast</span>
        <span className="font-mono text-[11px] text-foreground">in</span>
      </div>
      <div className="flex items-end gap-[3px] h-24">
        {next72.map((p, i) => {
          const isRain = (p.precip_in || 0) > 0.01;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-sm ${isRain ? "bg-info" : "bg-secondary"}`}
                style={{ height: `${Math.max(2, (p.precip_in / max) * 100)}%` }}
                title={`${new Date(p.start).toLocaleString([], { weekday: "short", hour: "numeric" })}: ${(p.precip_in || 0).toFixed(2)} in`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5">
        <span>Now</span><span>+24h</span><span>+48h</span><span>+72h</span>
      </div>
    </div>
  );
}