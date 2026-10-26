import React, { useEffect, useState } from "react";
import { RefreshCw, CloudRain, CloudRainWind, Waves, Thermometer, FlaskConical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatusPill from "@/components/StatusPill";
import { fetchLiveSnapshot } from "@/lib/environmentalData";

const CITIES = [
  { name: "Ames", lat: 42.0347, lon: -93.6200 },
  { name: "Des Moines", lat: 41.5868, lon: -93.6250 },
  { name: "Cedar Rapids", lat: 41.9779, lon: -91.6656 },
  { name: "Iowa City", lat: 41.6611, lon: -91.5302 },
  { name: "Sioux City", lat: 42.4963, lon: -96.4049 },
];

const TREND_LABEL = { rising: "rising", falling: "falling", stable: "about steady", unknown: "trend unavailable" };

function fmtTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(ts) {
  if (!ts) return "date unavailable";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "date unavailable";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Metric({ icon: Icon, label, value, sub, loading }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-4 h-4 text-info" />
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <div className={`leading-none ${value ? "font-mono text-xl text-foreground" : "text-sm text-muted-foreground"}`}>
          {value || "Data unavailable"}
        </div>
      )}
      <div className="text-[10px] text-muted-foreground mt-2 truncate">{loading ? "Checking…" : sub}</div>
    </div>
  );
}

export default function LiveIowaStrip() {
  const [city, setCity] = useState(CITIES[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchLiveSnapshot(city.lat, city.lon)
      .then((snap) => { if (!cancelled) setData(snap); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [city, reload]);

  const w = data?.weather || {};
  const gauge = data?.streamflow?.sites?.[0] || null;
  const nObs = data?.nitrate?.observations?.[0] || null;
  const ready = data && !loading;

  return (
    <div className="bento-card">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="section-eyebrow">Right now in Iowa</div>
          <p className="text-sm text-muted-foreground mt-1">
            Live readings from public agencies near a few Iowa cities. Pick one to see what they show today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ready && <StatusPill label="Updated" value={fmtTime(data.retrieved_at)} live tone="live" />}
          <button
            type="button"
            onClick={() => setReload((r) => r + 1)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {CITIES.map((c) => {
          const active = c.name === city.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => setCity(c)}
              className={`px-3.5 py-1.5 rounded-lg border text-sm transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary font-medium"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm text-amber-800">We couldn't reach the public data sources just now.</span>
          <button type="button" onClick={() => setReload((r) => r + 1)} className="text-sm font-medium text-amber-900 underline">
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          <Metric
            icon={CloudRain}
            label="Rain · last 24h"
            loading={loading}
            value={w.precipitation_24h_in != null ? `${w.precipitation_24h_in} in` : null}
            sub={w.station_name || "NOAA / NWS station"}
          />
          <Metric
            icon={CloudRainWind}
            label="Rain · next 72h"
            loading={loading}
            value={w.forecast_72h_in != null ? `${w.forecast_72h_in} in` : null}
            sub="NWS hourly forecast"
          />
          <Metric
            icon={Waves}
            label="Nearest stream gauge"
            loading={loading}
            value={gauge && gauge.discharge_cfs != null ? `${gauge.discharge_cfs} cfs` : null}
            sub={gauge ? `USGS ${gauge.site_code} · ${TREND_LABEL[gauge.discharge_trend] || "trend unavailable"}` : "No nearby USGS gauge"}
          />
          <Metric
            icon={FlaskConical}
            label="Nearest nitrate record"
            loading={loading}
            value={nObs ? `${nObs.nitrate_mg_l} ${nObs.unit}` : null}
            sub={nObs ? `USGS ${nObs.usgs_site_code} · ${fmtDate(nObs.observed_at)}${nObs.nitrate_mg_l >= 10 ? " · above 10 mg/L" : ""}` : "No nearby nitrate records"}
          />
          <Metric
            icon={Thermometer}
            label="Air temperature"
            loading={loading}
            value={w.temperature_f != null ? `${Math.round(w.temperature_f)}°F` : null}
            sub={w.station_name || "NOAA / NWS station"}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
        {ready ? `Retrieved ${fmtTime(data.retrieved_at)} on ${fmtDate(data.retrieved_at)}. ` : ""}
        These are readings from public monitoring stations near {city.name} — not a measurement of any one field or well.
      </p>
    </div>
  );
}