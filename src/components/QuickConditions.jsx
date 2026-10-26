import React from "react";
import { CloudRain, CloudRainWind, Waves, Thermometer, Sprout } from "lucide-react";

export default function QuickConditions({ weather, streamflow, field }) {
  const w = weather || {};
  const sf = streamflow || {};
  const nearest = (sf.sites && sf.sites[0]) || null;
  const agAvailable =
    (field && field.primary_crop && field.primary_crop !== "Unknown") ||
    (field && field.irrigated === true) ||
    (field && field.fertilizer_timing && field.fertilizer_timing !== "Unknown");
  const forecastAvailable = (w.forecast_periods || []).length > 0;

  const items = [
    {
      icon: CloudRain, tone: "text-info",
      label: "Rain · Last 24h",
      value: w.precipitation_24h_in != null ? `${w.precipitation_24h_in} in` : null,
      source: "NOAA / NWS observed",
    },
    {
      icon: CloudRainWind, tone: "text-info",
      label: "Forecast Rain · 72h",
      value: forecastAvailable && w.forecast_72h_in != null ? `${w.forecast_72h_in} in` : null,
      source: "NWS hourly forecast",
    },
    {
      icon: Waves, tone: "text-info",
      label: "Streamflow",
      value: nearest && nearest.discharge_cfs != null ? `${nearest.discharge_cfs} cfs` : null,
      source: nearest ? `USGS ${nearest.site_code}` : "USGS NWIS",
    },
    {
      icon: Thermometer, tone: "text-info",
      label: "Temperature",
      value: w.temperature_f != null ? `${Math.round(w.temperature_f)}°F` : null,
      source: "NOAA / NWS",
    },
    {
      icon: Sprout, tone: "text-primary",
      label: "Soil / Ag Conditions",
      value: agAvailable ? "Available" : null,
      fallback: agAvailable ? null : "Not provided",
      source: "Field inputs · NRCS pending",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((it, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
          <div className={`flex items-center gap-1.5 ${it.tone} mb-2`}><it.icon className="w-4 h-4" /><span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{it.label}</span></div>
          <div className={`leading-none ${it.value ? "font-mono text-xl text-foreground" : "text-sm text-muted-foreground"}`}>
            {it.value || it.fallback || "Data unavailable"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 truncate">{it.source}</div>
        </div>
      ))}
    </div>
  );
}