import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 11, { duration: 1.2 });
  }, [center && center[0], center && center[1]]);
  return null;
}

export default function MapView({ center, userPoint, stations = [], nitrateSites = [], radiusMiles = 35, className = "" }) {
  const initial = center || [42.05, -93.5];
  const radiusMeters = radiusMiles * 1609.34;
  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer center={initial} zoom={center ? 11 : 7} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyTo center={center} />
        {userPoint && (
          <>
            <CircleMarker center={userPoint} radius={8} pathOptions={{ color: "#1B4D3E", fillColor: "#1B4D3E", fillOpacity: 0.9, weight: 2 }}>
              <Popup><span className="text-xs font-medium">Your reported location</span></Popup>
            </CircleMarker>
            <Circle center={userPoint} radius={radiusMeters} pathOptions={{ color: "#1B4D3E", weight: 1, dashArray: "4 4", fillOpacity: 0.03 }} />
          </>
        )}
        {stations.map((s, i) => (
          <CircleMarker key={`s${i}`} center={[s.lat, s.lon]} radius={6} pathOptions={{ color: "#1D7FBF", fillColor: "#1D7FBF", fillOpacity: 0.75, weight: 1.5 }}>
            <Popup>
              <div className="text-xs min-w-[180px]">
                <div className="font-semibold text-foreground">{s.name || s.site_code}</div>
                <div className="font-mono text-muted-foreground">USGS {s.site_code}</div>
                {s.distance_mi != null && <div>{s.distance_mi.toFixed(1)} mi from your location</div>}
                <div>Streamflow: <span className="font-mono">{s.discharge_cfs != null ? `${s.discharge_cfs} cfs` : "Data unavailable"}</span>{s.discharge_trend && s.discharge_trend !== "unknown" ? ` (${s.discharge_trend})` : ""}</div>
                {s.observed_at && <div className="text-muted-foreground">{new Date(s.observed_at).toLocaleString()}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {nitrateSites.map((n, i) => (
          <CircleMarker key={`n${i}`} center={[n.latitude, n.longitude]} radius={5} pathOptions={{ color: n.nitrate_mg_l >= 10 ? "#DC2626" : "#D97706", fillColor: n.nitrate_mg_l >= 10 ? "#DC2626" : "#D97706", fillOpacity: 0.75, weight: 1.5 }}>
            <Popup>
              <div className="text-xs min-w-[160px]">
                <div className="font-semibold">Nitrate observation</div>
                <div className="font-mono text-muted-foreground">{n.usgs_site_code}</div>
                <div className="font-mono">{n.nitrate_mg_l} {n.unit}{n.nitrate_mg_l >= 10 ? " · above MCL" : ""}</div>
                {n.observed_at && <div className="text-muted-foreground">{new Date(n.observed_at).toLocaleDateString()}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {/* Legend */}
      <div className="absolute bottom-2 right-2 z-[500] pointer-events-none bg-card/95 border border-border rounded-lg px-2.5 py-2 shadow-card text-[10px] space-y-1">
        <LegendRow color="bg-primary" label="Your location" />
        <LegendRow color="bg-[#1D7FBF]" label="USGS streamflow station" />
        <LegendRow color="bg-amber-500" label="Nitrate observation (<10 mg/L)" />
        <LegendRow color="bg-rose-500" label="Nitrate observation (≥10 mg/L)" />
        <div className="text-muted-foreground pt-0.5">Base map: OpenStreetMap — streams & rivers shown</div>
      </div>
    </div>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <span className={`live-dot ${color}`} /> {label}
    </div>
  );
}