import React from "react";
import PrecipChart from "./PrecipChart";

const CAT = {
  LOW: "text-emerald-700 bg-emerald-50 border-emerald-200",
  MODERATE: "text-amber-700 bg-amber-50 border-amber-200",
  ELEVATED: "text-orange-700 bg-orange-50 border-orange-200",
  HIGH: "text-rose-700 bg-rose-50 border-rose-200",
  "INSUFFICIENT DATA": "text-slate-600 bg-slate-50 border-slate-200",
};

export default function ForecastCard({ forecast, weather }) {
  const hasChart = weather && (weather.forecast_periods || []).some((p) => p.precip_in != null);

  return (
    <div className="bento-card">
      <div className="section-eyebrow mb-3">72-Hour Forecast</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forecast.map((b, i) => (
          <div key={i} className="border border-border rounded-lg p-3">
            <div className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{b.period}</div>
            <div className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border mt-2 ${CAT[b.risk_category] || CAT["INSUFFICIENT DATA"]}`}>
              {b.risk_category}
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs">
              <Row label="Rainfall" value={b.rainfall_in != null ? `${b.rainfall_in} in` : "Forecast unavailable"} muted={b.rainfall_in == null} />
              <Row label="Streamflow" value={b.streamflow_note || "Data unavailable"} />
              <Row label="Confidence" value={b.confidence || "None"} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <PrecipChart weather={weather} />
      </div>
    </div>
  );
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-mono text-right ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  );
}