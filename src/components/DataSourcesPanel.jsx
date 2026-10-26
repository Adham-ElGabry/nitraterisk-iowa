import React from "react";

const DESCS = {
  "NOAA / NWS": "Weather and precipitation",
  "USGS NWIS": "Streamflow",
  "USGS Water Quality Portal": "Nitrate / water-quality observations",
  "EPA WATERS": "Watershed and hydrology",
  "OpenStreetMap Nominatim": "Location geocoding",
  "USDA / NRCS": "Soil and agricultural information",
  "Iowa DNR": "Iowa water-quality information",
};

export default function DataSourcesPanel({ sources }) {
  return (
    <div className="bento-card">
      <div className="section-eyebrow mb-3">Data Sources</div>
      <div className="divide-y divide-border">
        {sources.map((s, i) => (
          <div key={i} className="py-2.5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {s.home_url ? (
                <a href={s.home_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary underline-offset-2 hover:underline">
                  {s.name}
                </a>
              ) : (
                <span className="text-sm font-medium text-foreground">{s.name}</span>
              )}
              <div className="text-[11px] text-muted-foreground">{DESCS[s.name] || s.category}</div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className={`text-[10px] font-mono uppercase tracking-wide ${s.available ? "text-emerald-700" : "text-slate-400"}`}>
                {s.available ? "Available" : "Unavailable"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {s.retrieved_at ? new Date(s.retrieved_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}