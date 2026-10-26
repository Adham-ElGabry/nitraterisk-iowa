import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, MapPin, Download, ScanSearch, Gauge, CircleCheck, CircleX } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const STEPS = [
  { n: "1", t: "Answer a few quick questions", d: "Tell us who you are and where to look — your current location, an address, or a city and ZIP. Farmers can add field details. No account or email is needed." },
  { n: "2", t: "Retrieve environmental data", d: "The app queries live public services — NOAA/NWS weather and hourly precipitation, USGS streamflow, the USGS Water Quality Portal, and EPA WATERS watershed indexing. Only real, retrieved values are used." },
  { n: "3", t: "Analyze current conditions", d: "Each indicator is evaluated against documented prototype threshold rules — for example, rainfall amounts and streamflow trends. Factors without usable data are marked Unknown." },
  { n: "4", t: "You get a plain-language estimate", d: "A risk category with a confidence level, the factors behind it, a 3-period outlook, nearby stations, and every source with the time it was retrieved." },
];

const CATALOG = [
  { name: "NOAA / NWS", desc: "Weather and precipitation", url: "https://www.weather.gov", status: "Live", note: "Current conditions, observed precipitation, hourly forecast" },
  { name: "USGS NWIS", desc: "Streamflow", url: "https://waterservices.usgs.gov", status: "Live", note: "Discharge and trend at nearby gauging stations" },
  { name: "USGS Water Quality Portal", desc: "Nitrate / water-quality observations", url: "https://www.waterqualitydata.usgs.gov", status: "Live", note: "Historical nitrate measurements near the location" },
  { name: "EPA / WATERS", desc: "Watershed and hydrology", url: "https://www.epa.gov/waterdata/waters-watershed-assessment-track-environmental-results-system", status: "Live", note: "Watershed name, HUC code, drainage area" },
  { name: "OpenStreetMap Nominatim", desc: "Location geocoding", url: "https://nominatim.openstreetmap.org", status: "Live", note: "Converts addresses/ZIP to coordinates" },
  { name: "USDA / NRCS", desc: "Soil and agricultural information", url: "https://www.nrcs.usda.gov", status: "Planned", note: "Soil survey integration not yet connected" },
  { name: "Iowa DNR", desc: "Iowa water-quality information", url: "https://www.iowadnr.gov", status: "Planned", note: "AQuIA integration not yet connected" },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="section-eyebrow mb-2">Scientific transparency</div>
        <h1 className="font-display text-4xl text-foreground">How It Works</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          NitrateRisk Iowa combines environmental indicators into a short-term risk estimate. It is an
          environmental indicator analysis — not a validated machine-learning forecasting model — and every
          result is labeled accordingly.
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {STEPS.map((s) => (
            <div key={s.n} className="bento-card">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-mono flex items-center justify-center mb-3">{s.n}</div>
              <div className="font-display text-lg text-foreground leading-snug">{s.t}</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        {/* What this is / is not */}
        <div className="grid md:grid-cols-2 gap-4 mt-10">
          <div className="bento-card border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 mb-2"><CircleCheck className="w-4 h-4 text-emerald-600" /><span className="section-eyebrow">What this system does</span></div>
            <div className="font-display text-xl text-foreground">Environmental indicator analysis</div>
            <ul className="mt-3 space-y-1.5 text-xs text-foreground">
              <li>• Retrieves real-time public environmental data.</li>
              <li>• Applies documented prototype threshold rules to each indicator.</li>
              <li>• Produces an experimental risk category with transparent factors and sources.</li>
            </ul>
          </div>
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-2"><CircleX className="w-4 h-4 text-slate-400" /><span className="section-eyebrow">What this system is not</span></div>
            <div className="font-display text-xl text-foreground">Validated machine-learning forecasting</div>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>• No scientifically validated nitrate prediction model is in place.</li>
              <li>• Percentages shown are prototype heuristic estimates, clearly labeled.</li>
              <li>• The architecture is built to accept a validated model as data coverage grows.</li>
            </ul>
          </div>
        </div>

        {/* Data sources catalog */}
        <div id="data-sources" className="scroll-mt-20 mt-10">
          <div className="section-eyebrow mb-1">Data Sources</div>
          <h2 className="font-display text-2xl text-foreground mb-4">Where the data comes from</h2>
          <div className="bento-card divide-y divide-border p-0">
            {CATALOG.map((c, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {c.home_url !== null && c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary inline-flex items-center gap-1.5 underline-offset-2 hover:underline">
                        {c.name} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{c.desc} · {c.note}</div>
                </div>
                <span className={`shrink-0 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${c.status === "Live" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-500 bg-slate-100 border-slate-200"}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Guidance */}
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            { icon: MapPin, t: "Stations ≠ your field", d: "Monitoring stations and historical observations describe nearby water conditions, not conditions in your field." },
            { icon: Gauge, t: "Never invented data", d: "When a source is unavailable, the app shows 'Data unavailable' rather than a fabricated value." },
            { icon: Download, t: "Re-run anytime", d: "Conditions change — run a new assessment to refresh every source and timestamp." },
          ].map((x, i) => (
            <div key={i} className="bento-card">
              <x.icon className="w-4 h-4 text-primary mb-2" />
              <div className="font-display text-lg text-foreground">{x.t}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/#assessment" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover">Check My Water</Link>
        </div>
      </main>
    </div>
  );
}