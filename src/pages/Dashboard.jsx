import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import RiskCard from "@/components/RiskCard";
import QuickConditions from "@/components/QuickConditions";
import RiskFactors from "@/components/RiskFactors";
import ForecastCard from "@/components/ForecastCard";
import StreamflowPanel from "@/components/StreamflowPanel";
import HistoricalNitrateChart from "@/components/HistoricalNitrateChart";
import DataSourcesPanel from "@/components/DataSourcesPanel";
import WatershedPanel from "@/components/WatershedPanel";
import ConfidencePanel from "@/components/ConfidencePanel";
import Disclaimer from "@/components/Disclaimer";
import MapView from "@/components/MapView";
import StatusPill from "@/components/StatusPill";
import CheckingSteps from "@/components/CheckingSteps";
import { fetchEnvironmentalData } from "@/lib/environmentalData";

function fmtLong(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
function fmtShort(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const s = location.state;
    if (s && s.pending) {
      let cancelled = false;
      setLoading(true);
      setError("");
      fetchEnvironmentalData(s.location, s.field)
        .then((assessment) => {
          if (cancelled) return;
          const payload = { assessment, field: s.field };
          try { sessionStorage.setItem("nitraterisk_assessment", JSON.stringify(payload)); } catch {}
          setData(payload);
        })
        .catch((e) => { if (!cancelled) setError(e.message || "Could not retrieve environmental data. Please try again."); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }
    if (s && s.assessment) { setData(s); return; }
    try {
      const cached = sessionStorage.getItem("nitraterisk_assessment");
      if (cached) setData(JSON.parse(cached));
    } catch {}
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <LoadingDashboard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bento-card max-w-md">
            <div className="flex items-center gap-2 text-amber-700 mb-2"><AlertTriangle className="w-4 h-4" /><span className="text-sm font-semibold">That didn't work</span></div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Link to="/#assessment" className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-accent-hover"><ArrowLeft className="w-4 h-4" /> Try again</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="bento-card max-w-md text-center mx-auto">
            <h2 className="text-xl font-semibold text-foreground">Nothing to show yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Answer a few quick questions and we'll check the nitrate risk where you live.</p>
            <Link to="/#assessment" className="inline-flex mt-4 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover">Start a check</Link>
          </div>
        </main>
      </div>
    );
  }

  const { assessment, field } = data;
  const { geocode, watershed, weather, streamflow, nitrate, risk, sources, generated_at, disclaimer } = assessment;
  const userPoint = [geocode.latitude, geocode.longitude];
  const stations = streamflow.sites || [];
  const nitrateSites = (nitrate.observations || []).slice(0, 12);
  const dataUpdated = sources.map((s) => s.retrieved_at).filter(Boolean).sort().pop();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Assessment summary */}
        <div className="bento-card mb-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="section-eyebrow">Nitrate Risk Assessment</div>
            <StatusPill label="Data updated" value={fmtShort(dataUpdated)} live tone="live" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Ctx label="Location" value={geocode.display_name} />
            <Ctx label="Area size" value={field?.acreage ? `${field.acreage} acres` : "Not provided"} />
            <Ctx label="Main crop" value={field?.primary_crop && field.primary_crop !== "Unknown" ? field.primary_crop : "Not provided"} />
            <Ctx label="Checked on" value={fmtLong(generated_at)} />
          </div>
          {field?.acreage ? (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              The acreage you reported is your land — it is not the same as the watershed or drainage area shown below.
            </p>
          ) : null}
        </div>

        {/* Main risk card */}
        <RiskCard risk={risk} />

        {/* Quick conditions */}
        <div className="mt-4">
          <QuickConditions weather={weather} streamflow={streamflow} field={field} />
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-12 lg:col-span-7"><RiskFactors factors={risk.factors} /></div>
          <div className="col-span-12 lg:col-span-5"><ForecastCard forecast={risk.forecast_72h} weather={weather} /></div>

          <div className="col-span-12 lg:col-span-7">
            <div className="bento-card p-0 overflow-hidden h-[300px] lg:h-[380px]">
              <MapView center={userPoint} userPoint={userPoint} stations={stations} nitrateSites={nitrateSites} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 px-1">
              Station readings represent nearby water conditions and are not the nitrate level of your field. Click any station for details.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <WatershedPanel watershed={watershed} />
            <StreamflowPanel streamflow={streamflow} />
          </div>

          <div className="col-span-12 lg:col-span-7"><HistoricalNitrateChart nitrate={nitrate} /></div>
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <DataSourcesPanel sources={sources} />
            <ConfidencePanel risk={risk} weather={weather} streamflow={streamflow} nitrate={nitrate} watershed={watershed} />
          </div>

          <div className="col-span-12"><Disclaimer text={disclaimer} /></div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/#assessment" className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent-hover font-medium">
            <ArrowLeft className="w-4 h-4" /> Check another location
          </Link>
        </div>
      </main>
    </div>
  );
}

function Ctx({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5 text-foreground">{value}</div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <CheckingSteps
        heading="Checking your water…"
        subtitle="We're pulling live public data for your location. This can take up to 20 seconds, so keep this page open."
      />
    </main>
  );
}