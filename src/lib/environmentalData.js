// NitrateRisk Iowa — client-side environmental data service.
// Uses only free, key-less public government/open APIs (NOAA/NWS, USGS,
// Water Quality Portal, EPA WATERS, OpenStreetMap Nominatim). No credentials
// are ever present in the browser. Every source that fails returns null.

const UA = "NitrateRiskIowa/1.0 (environmental-risk-prototype)";

async function safeJson(url) {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json,geo+json,*/*" } });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("json")) return await res.json();
    return await res.text();
  } catch {
    return null;
  }
}

function toInches(val, unitCode) {
  if (val == null || isNaN(val)) return null;
  const u = (unitCode || "").toLowerCase();
  if (u.includes("mm")) return val / 25.4;
  if (u.includes("cm")) return val / 2.54;
  if (u.includes("in")) return val;
  if (u.includes("m")) return val * 39.3701; // meters
  return val * 39.3701;
}
function toF(c, unitCode) {
  if (c == null || isNaN(c)) return null;
  const u = (unitCode || "").toLowerCase();
  if (u.includes("f")) return c;
  return c * 9 / 5 + 32;
}
function haversineMi(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(input) {
  const { street, city, zip, lat, lon } = input || {};
  if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
    return { latitude: Number(lat), longitude: Number(lon), display_name: `${lat}, ${lon}`, source: "coordinates" };
  }
  let q = "";
  if (street) q = street;
  else if (city || zip) q = [city, zip].filter(Boolean).join(", ");
  if (!q) return null;
  let data = await safeJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(q + ", Iowa, USA")}`);
  if (!data || !data.length) data = await safeJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`);
  if (!data || !data.length) return null;
  return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon), display_name: data[0].display_name, source: "nominatim" };
}

async function watershed(lat, lon) {
  const url = `https://ofmpub.epa.gov/waters10/PointIndexing.Service?x=${lon}&y=${lat}&inCRS=4326&outCRS=4326&inUnits=DD&outUnits=DD&inDatum=NAD83&outDatum=NAD83`;
  const data = await safeJson(url);
  if (!data || !data.output) return null;
  try {
    const a = data.output.attributes || {};
    const name = a.huc12name || a.catchmentname || a.huc8name || null;
    const huc = a.huc12 || a.huc8 || null;
    if (!name && !huc) return null;
    return { name, huc, area_acres: a.catchmentareaacres || null };
  } catch { return null; }
}

async function weather(lat, lon) {
  const points = await safeJson(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
  if (!points || !points.properties) return { available: false };
  const p = points.properties;
  let forecast_periods = [];
  let forecast_72h_in = 0;
  if (p.forecastHourly) {
    const hf = await safeJson(p.forecastHourly);
    if (hf && hf.properties && hf.properties.periods) {
      const now = Date.now();
      const horizon = now + 72 * 3600 * 1000;
      for (const per of hf.properties.periods) {
        if (new Date(per.startTime).getTime() > horizon) continue;
        // NWS hourly "precipitation" is already in inches
        const pin = per.precipitation != null ? Number(per.precipitation) : null;
        forecast_periods.push({
          start: per.startTime, end: per.endTime,
          temp_f: toF(per.temperature, per.temperatureUnit ? `deg${per.temperatureUnit}` : undefined),
          precip_in: pin, short_forecast: per.shortForecast || null,
        });
        if (pin) forecast_72h_in += pin;
      }
    }
  }
  let precip_24h_in = 0, precip_72h_in = 0;
  let current_temp_f = null, humidity = null, wind_mph = null;
  let station_id = null, station_name = null, observed_at = null;
  if (p.observationStations) {
    const st = await safeJson(p.observationStations);
    if (st && st.features && st.features.length) {
      station_id = st.features[0].properties.stationIdentifier;
      station_name = st.features[0].properties.name;
      const latest = await safeJson(`https://api.weather.gov/stations/${station_id}/observations/latest`);
      if (latest && latest.properties) {
        const lp = latest.properties;
        current_temp_f = toF(lp.temperature?.value, lp.temperature?.unitCode);
        humidity = lp.relativeHumidity?.value ?? null;
        if (lp.windSpeed?.value != null) wind_mph = lp.windSpeed.unitCode?.includes("mph") ? lp.windSpeed.value : lp.windSpeed.value * 2.23694;
        observed_at = lp.timestamp || null;
      }
      const obs = await safeJson(`https://api.weather.gov/stations/${station_id}/observations?limit=72`);
      if (obs && obs.features) {
        const now = Date.now();
        for (const f of obs.features) {
          const t = new Date(f.properties.timestamp).getTime();
          const ageH = (now - t) / 3600000;
          if (ageH < 0 || ageH > 72) continue;
          const pin = toInches(f.properties.precipitationLastHour?.value, f.properties.precipitationLastHour?.unitCode);
          if (pin != null) { precip_72h_in += pin; if (ageH <= 24) precip_24h_in += pin; }
        }
      }
    }
  }
  return {
    available: true, station_id, station_name, observed_at,
    retrieved_at: new Date().toISOString(),
    temperature_f: current_temp_f, humidity_pct: humidity, wind_mph,
    precipitation_24h_in: Number(precip_24h_in.toFixed(2)),
    precipitation_72h_in: Number(precip_72h_in.toFixed(2)),
    forecast_72h_in: Number(forecast_72h_in.toFixed(2)),
    forecast_periods: forecast_periods.slice(0, 72),
  };
}

async function streamflow(lat, lon) {
  const d = 0.5;
  const bbox = `${(lon - d).toFixed(4)},${(lat - d).toFixed(4)},${(lon + d).toFixed(4)},${(lat + d).toFixed(4)}`;
  const txt = await safeJson(`https://waterservices.usgs.gov/nwis/site/?format=rdb&bBox=${bbox}&parameterCd=00060&siteStatus=all&hasDataTypeCd=iv`);
  if (!txt || typeof txt !== "string") return { available: false, sites: [] };
  const lines = txt.split("\n").filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return { available: false, sites: [] };
  const header = lines[0].split("\t");
  const rows = lines.slice(1).map((l) => {
    const cols = l.split("\t"); const o = {};
    header.forEach((h, i) => (o[h] = cols[i])); return o;
  });
  const withDist = rows
    .filter((r) => r.dec_lat_va && r.dec_long_va)
    .map((r) => ({
      site_code: r.site_no, name: (r.station_nm || "").trim(),
      lat: parseFloat(r.dec_lat_va), lon: parseFloat(r.dec_long_va),
      distance_mi: haversineMi(lat, lon, parseFloat(r.dec_lat_va), parseFloat(r.dec_long_va)),
    }))
    .sort((a, b) => a.distance_mi - b.distance_mi)
    .slice(0, 3);
  const sites = [];
  for (const s of withDist) {
    const iv = await safeJson(`https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${s.site_code}&parameterCd=00060&period=P7D`);
    let discharge_cfs = null, observed_at = null, trend = "unknown";
    if (iv && iv.value && iv.value.timeSeries && iv.value.timeSeries.length) {
      const vals = iv.value.timeSeries[0].values[0].value.filter((v) => v.value && !isNaN(parseFloat(v.value)));
      if (vals.length) {
        const latestV = vals[vals.length - 1];
        discharge_cfs = parseFloat(latestV.value);
        observed_at = new Date(Date.parse(latestV.dateTime)).toISOString();
        if (vals.length >= 2) {
          const prev = parseFloat(vals[Math.max(0, vals.length - 4)].value);
          if (discharge_cfs > prev * 1.1) trend = "rising";
          else if (discharge_cfs < prev * 0.9) trend = "falling";
          else trend = "stable";
        }
      }
    }
    sites.push({ ...s, discharge_cfs, observed_at, discharge_trend: trend, retrieved_at: new Date().toISOString() });
  }
  return { available: sites.length > 0, sites, retrieved_at: new Date().toISOString() };
}

async function nitrate(lat, lon) {
  const d = 0.4;
  const bbox = `${(lon - d).toFixed(6)},${(lat - d).toFixed(6)},${(lon + d).toFixed(6)},${(lat + d).toFixed(6)}`;
  const data = await safeJson(`https://www.waterqualitydata.usgs.gov/data/Result/search?mimeType=json&zip=no&bBox=${bbox}&characteristicName=Nitrate&providers=NWIS&providers=STORET`);
  if (!data || !data.value || !data.value.length) return { available: false, observations: [] };
  const obs = [];
  for (const r of data.value.slice(0, 40)) {
    const val = parseFloat(r.resultMeasureValue || r.valueMeasureValue);
    if (isNaN(val)) continue;
    const olat = parseFloat(r.latitude) || lat;
    const olon = parseFloat(r.longitude) || lon;
    obs.push({
      usgs_site_code: r.monitoringLocationIdentifier || r.MonitoringLocationIdentifier,
      usgs_site_name: r.monitoringLocationName || r.MonitoringLocationName,
      latitude: olat, longitude: olon,
      observed_at: r.activityStartDate || r.resultDetectedAt || null,
      retrieved_at: new Date().toISOString(),
      nitrate_mg_l: val,
      unit: r.resultMeasureUnitCode || r.valueMeasureUnitCode || "mg/L",
      distance_mi: haversineMi(lat, lon, olat, olon),
    });
  }
  obs.sort((a, b) => a.distance_mi - b.distance_mi);
  return { available: obs.length > 0, observations: obs.slice(0, 25), retrieved_at: new Date().toISOString() };
}

function risk(env, field) {
  const w = env.weather || {}, sf = env.streamflow || {}, ni = env.nitrate || {};
  const factors = [];
  let score = 0, weightSum = 0;
  const add = (name, contribution, detail, value, pts, weight) => {
    factors.push({ name, contribution, detail, value });
    score += pts * weight; weightSum += weight;
  };
  if (w.precipitation_24h_in != null) {
    const v = w.precipitation_24h_in;
    let c = "NEUTRAL", pts = 0.5;
    if (v >= 1.5) { c = "INCREASED RISK"; pts = 1; }
    else if (v >= 0.5) { c = "INCREASED RISK"; pts = 0.75; }
    else if (v < 0.1) { c = "LOWER RISK"; pts = 0.25; }
    add("Recent rainfall (24h)", c, `${v.toFixed(2)} in observed in last 24 hours`, `${v.toFixed(2)} in`, pts, 1.5);
  } else add("Recent rainfall (24h)", "UNKNOWN", "Recent rainfall data unavailable", "Data unavailable", 0.5, 1.5);
  if (w.forecast_72h_in != null) {
    const v = w.forecast_72h_in;
    let c = "NEUTRAL", pts = 0.5;
    if (v >= 2) { c = "INCREASED RISK"; pts = 1; }
    else if (v >= 0.75) { c = "INCREASED RISK"; pts = 0.75; }
    else if (v < 0.25) { c = "LOWER RISK"; pts = 0.3; }
    add("Forecast rainfall (72h)", c, `${v.toFixed(2)} in forecast over next 72 hours`, `${v.toFixed(2)} in`, pts, 1.5);
  }
  if (sf.available && sf.sites.length) {
    const s = sf.sites[0];
    let c = "NEUTRAL", pts = 0.5;
    if (s.discharge_trend === "rising") { c = "INCREASED RISK"; pts = 0.85; }
    else if (s.discharge_trend === "falling") { c = "LOWER RISK"; pts = 0.35; }
    add("Streamflow trend", c, `Nearest station ${s.site_code}: ${s.discharge_cfs ?? "n/a"} cfs, ${s.discharge_trend}`, `${s.discharge_cfs ?? "n/a"} cfs`, pts, 1);
  } else add("Streamflow", "UNKNOWN", "No nearby USGS streamflow station found", "Data unavailable", 0.5, 1);
  if (w.temperature_f != null) {
    const t = w.temperature_f;
    let c = "NEUTRAL", pts = 0.5;
    if (t >= 70) { c = "INCREASED RISK"; pts = 0.8; }
    else if (t <= 40) { c = "LOWER RISK"; pts = 0.3; }
    add("Temperature", c, `Current temperature ${Math.round(t)}°F (warm temps accelerate N mineralization)`, `${Math.round(t)}°F`, pts, 0.5);
  }
  const ft = field?.fertilizer_timing;
  if (ft === "Within 7 days") add("Recent fertilizer timing", "INCREASED RISK", "Fertilizer applied within 7 days — high mobile-N availability", ft, 1, 1.5);
  else if (ft === "8-30 days ago") add("Recent fertilizer timing", "INCREASED RISK", "Fertilizer applied 8–30 days ago — residual N still mobile", ft, 0.7, 1.5);
  else if (ft === "More than 30 days ago") add("Recent fertilizer timing", "LOWER RISK", "Fertilizer applied >30 days ago — lower residual mobility", ft, 0.4, 1.5);
  else add("Recent fertilizer timing", "NEUTRAL", "Fertilizer timing not provided", "Unknown", 0.5, 1.5);
  const crop = field?.primary_crop;
  if (crop === "Corn") add("Crop / land use", "INCREASED RISK", "Corn typically receives higher N inputs", crop, 0.7, 0.5);
  else if (crop === "Soybeans") add("Crop / land use", "LOWER RISK", "Soybeans fix N — generally lower applied-N inputs", crop, 0.4, 0.5);
  else if (crop && crop !== "Unknown") add("Crop / land use", "NEUTRAL", `Primary crop: ${crop}`, crop, 0.5, 0.5);
  if (field?.irrigated === true) add("Irrigation", "INCREASED RISK", "Irrigated field — water can mobilize nitrate to tile/streams", "Irrigated", 0.7, 0.5);
  if (ni.available && ni.observations.length) {
    const latest = ni.observations[0];
    let c = "NEUTRAL", pts = 0.5;
    if (latest.nitrate_mg_l >= 10) { c = "INCREASED RISK"; pts = 1; }
    else if (latest.nitrate_mg_l >= 5) { c = "INCREASED RISK"; pts = 0.75; }
    else if (latest.nitrate_mg_l < 2) { c = "LOWER RISK"; pts = 0.3; }
    add("Historical nitrate observations", c, `Nearest record: ${latest.nitrate_mg_l} ${latest.unit} (${latest.observed_at || "date n/a"}) at ${latest.usgs_site_code}`, `${latest.nitrate_mg_l} ${latest.unit}`, pts, 1.5);
  } else add("Historical nitrate observations", "UNKNOWN", "No nearby historical nitrate records found", "Data unavailable", 0.5, 1.5);

  const normalized = weightSum ? score / weightSum : 0.5;
  const probability = Math.round(normalized * 100);
  let category = "LOW";
  if (probability >= 75) category = "HIGH";
  else if (probability >= 55) category = "ELEVATED";
  else if (probability >= 30) category = "MODERATE";
  const hasWeather = w.available, hasFlow = sf.available, hasNitrate = ni.available;
  let confidence = "LOW";
  if (hasWeather && hasFlow && hasNitrate) confidence = "HIGH";
  else if (hasWeather && hasFlow) confidence = "MEDIUM";

  const periods = env.weather?.forecast_periods || [];
  const buckets = [{ period: "0–24 hours", start: 0, end: 24 }, { period: "24–48 hours", start: 24, end: 48 }, { period: "48–72 hours", start: 48, end: 72 }];
  const now = Date.now();
  const forecast_72h = buckets.map((b) => {
    let rain = 0, has = false;
    for (const p of periods) {
      const h = (new Date(p.start).getTime() - now) / 3600000;
      if (h >= b.start && h < b.end && p.precip_in != null) { rain += p.precip_in; has = true; }
    }
    let rc = "LOW";
    if (rain >= 1.5) rc = "HIGH";
    else if (rain >= 0.75) rc = "ELEVATED";
    else if (rain >= 0.25) rc = "MODERATE";
    return {
      period: b.period,
      rainfall_in: has ? Number(rain.toFixed(2)) : null,
      risk_category: has ? rc : "INSUFFICIENT DATA",
      confidence: has ? (confidence === "HIGH" ? "Good" : confidence === "MEDIUM" ? "Fair" : "Limited") : "None",
      streamflow_note: sf.available ? "USGS station monitored" : "No nearby station",
    };
  });

  const insufficient = !hasWeather;
  return {
    risk_category: insufficient ? "INSUFFICIENT DATA" : category,
    risk_probability_pct: insufficient ? null : probability,
    data_confidence: confidence,
    factors, forecast_72h, insufficient_data: insufficient,
    notes: "Prototype risk estimate — based on available environmental indicators, not a validated nitrate forecasting model.",
  };
}

export async function fetchEnvironmentalData(locationInput, field) {
  const geo = await geocode(locationInput);
  if (!geo) throw new Error("Could not geocode the provided location. Please refine the address or enter coordinates.");
  const [ws, w, sf, ni] = await Promise.all([
    watershed(geo.latitude, geo.longitude),
    weather(geo.latitude, geo.longitude),
    streamflow(geo.latitude, geo.longitude),
    nitrate(geo.latitude, geo.longitude),
  ]);
  const env = { weather: w, streamflow: sf, nitrate: ni };
  const r = risk(env, field);
  const sources = [
    { name: "NOAA / NWS", category: "Weather / precipitation", home_url: "https://www.weather.gov", available: !!w.available, retrieved_at: w.retrieved_at || new Date().toISOString(), note: w.available ? (w.station_name || "NWS station") : "No NWS coverage for point" },
    { name: "USGS NWIS", category: "Streamflow", home_url: "https://waterservices.usgs.gov", available: !!sf.available, retrieved_at: sf.retrieved_at || new Date().toISOString(), note: sf.available ? `${sf.sites.length} station(s) within ~35 mi` : "No nearby discharge stations" },
    { name: "USGS Water Quality Portal", category: "Nitrate / water quality", home_url: "https://www.waterqualitydata.usgs.gov", available: !!ni.available, retrieved_at: ni.retrieved_at || new Date().toISOString(), note: ni.available ? `${ni.observations.length} historical nitrate record(s)` : "No nearby nitrate records" },
    { name: "EPA WATERS", category: "Watershed / hydrology", home_url: "https://www.epa.gov/waterdata/waters-watershed-assessment-track-environmental-results-system", available: !!ws, retrieved_at: new Date().toISOString(), note: ws ? `HUC ${ws.huc || "n/a"}` : "Watershed not resolved" },
    { name: "OpenStreetMap Nominatim", category: "Geocoding", home_url: "https://nominatim.openstreetmap.org", available: true, retrieved_at: new Date().toISOString(), note: geo.source },
    { name: "USDA / NRCS", category: "Soil / agricultural information", home_url: "https://www.nrcs.usda.gov", available: false, retrieved_at: new Date().toISOString(), note: "Soil survey integration pending" },
    { name: "Iowa DNR", category: "Iowa water-quality information", home_url: "https://www.iowadnr.gov", available: false, retrieved_at: new Date().toISOString(), note: "Iowa DNR AQuIA integration pending" },
  ];
  return {
    geocode: geo, watershed: ws, weather: w, streamflow: sf, nitrate: ni, risk: r, sources,
    generated_at: new Date().toISOString(),
    disclaimer: "This tool provides an environmental risk estimate based on available public data. It is not a substitute for laboratory water testing, professional environmental analysis, or regulatory guidance. Risk estimates may be inaccurate when data is missing, delayed, or unavailable.",
  };
}

export async function listIowaStations() {
  const bbox = "-96.6,40.4,-90.1,43.5";
  const txt = await safeJson(`https://waterservices.usgs.gov/nwis/site/?format=rdb&bBox=${bbox}&parameterCd=00060&siteStatus=all&hasDataTypeCd=iv`);
  if (!txt || typeof txt !== "string") return [];
  const lines = txt.split("\n").filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const header = lines[0].split("\t");
  const rows = lines.slice(1).map((l) => {
    const cols = l.split("\t"); const o = {};
    header.forEach((h, i) => (o[h] = cols[i])); return o;
  });
  return rows
    .filter((r) => r.dec_lat_va && r.dec_long_va)
    .map((r) => ({
      site_code: r.site_no, name: (r.station_nm || "").trim(),
      lat: parseFloat(r.dec_lat_va), lon: parseFloat(r.dec_long_va),
    }))
    .slice(0, 40);
}

// Lightweight live snapshot for a known point (used by the landing page preview).
// Reuses the same public sources; each source returns null-ish when unavailable.
export async function fetchLiveSnapshot(lat, lon) {
  const [w, sf, ni] = await Promise.all([weather(lat, lon), streamflow(lat, lon), nitrate(lat, lon)]);
  return { weather: w, streamflow: sf, nitrate: ni, retrieved_at: new Date().toISOString() };
}

export { geocode, haversineMi };