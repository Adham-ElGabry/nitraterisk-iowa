import React from "react";
import { AlertTriangle } from "lucide-react";

export default function WatershedPanel({ watershed }) {
  return (
    <div className="bento-card">
      <div className="section-eyebrow mb-2 flex items-center gap-1.5"><WavesIcon /> Watershed</div>
      {watershed ? (
        <>
          <div className="font-display text-xl text-foreground leading-tight">{watershed.name || "Unnamed catchment"}</div>
          <div className="mt-3 space-y-1.5 text-sm">
            <Row label="Drainage area" value={watershed.area_acres != null ? `${Math.round(watershed.area_acres).toLocaleString()} acres` : "Data unavailable"} />
            <Row label="HUC code" value={watershed.huc || "Data unavailable"} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border">Resolved via EPA WATERS point indexing.</p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Watershed data unavailable
          </div>
          <p className="text-xs text-muted-foreground mt-2">We could not reliably identify a watershed boundary for this location.</p>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground text-right">{value}</span>
    </div>
  );
}

function WavesIcon() {
  return <span className="inline-block w-2 h-2 rounded-full bg-info" />;
}