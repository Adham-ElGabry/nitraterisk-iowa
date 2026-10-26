import React, { useState } from "react";
import { LocateFixed, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const ROLES = [
  { id: "farmer", label: "I farm land", hint: "I manage crops or livestock" },
  { id: "household", label: "I live here", hint: "I drink water from a private well" },
  { id: "other", label: "Just curious", hint: "Looking into someone else's land or water" },
];

const CROPS = ["Corn", "Soybeans", "Other"];
const FERT = ["Within 7 days", "8-30 days ago", "More than 30 days ago", "Not sure"];

function ChoiceButton({ active, onClick, label, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-start gap-3 ${
        active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${active ? "border-primary bg-primary" : "border-border"}`}>
        {active && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>}
      </span>
    </button>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm transition ${
        active ? "bg-primary/10 border-primary text-primary font-medium" : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ htmlFor, children, optional }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
      {children} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
    </label>
  );
}

const inputCls = "w-full px-3.5 py-3 text-base border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary";

export default function Questionnaire({ onAnalyze }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [coords, setCoords] = useState(null);
  const [locBusy, setLocBusy] = useState(false);
  const [acreage, setAcreage] = useState("");
  const [crop, setCrop] = useState(null);
  const [irrigated, setIrrigated] = useState(null);
  const [fert, setFert] = useState(null);
  const [error, setError] = useState("");

  const isFarmer = role === "farmer";
  const totalSteps = isFarmer ? 3 : 2;

  const locationPayload = () => {
    if (coords) return { lat: coords.lat, lon: coords.lon };
    if (!street && !city && !zip) return null;
    return { street, city, zip };
  };

  const useMyLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Your browser can't share your location. Type a ZIP code instead.");
      return;
    }
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocBusy(false);
      },
      () => {
        setLocBusy(false);
        setError("We couldn't get your location. Type a city and ZIP instead.");
      }
    );
  };

  const submit = () => {
    setError("");
    const location = locationPayload();
    if (!location) {
      setError("We need somewhere to look. Add an address, or use your current location.");
      setStep(1);
      return;
    }
    let acre = null;
    if (isFarmer) {
      acre = parseFloat(acreage);
      if (!acreage || isNaN(acre) || acre <= 0) {
        setError("Please enter roughly how many acres you farm.");
        return;
      }
    }
    onAnalyze({
      location,
      field: {
        acreage: acre,
        primary_crop: isFarmer ? crop || "Unknown" : "Unknown",
        irrigated: irrigated === null ? null : irrigated,
        fertilizer_timing: isFarmer && fert && fert !== "Not sure" ? fert : "Unknown",
      },
    });
  };

  const next = () => {
    setError("");
    if (step === 0) {
      if (!role) { setError("Choose the option that fits you best."); return; }
      setStep(1);
      return;
    }
    if (step === 1 && isFarmer) {
      if (!locationPayload()) { setError("Add an address, or use your current location."); return; }
      setStep(2);
      return;
    }
    submit();
  };

  const isLast = step === totalSteps - 1;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-muted-foreground mb-2">Step {step + 1} of {totalSteps}</div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {step === 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground">Who are you?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">This helps us ask you only the questions that matter.</p>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <ChoiceButton key={r.id} active={role === r.id} onClick={() => { setRole(r.id); setError(""); }} label={r.label} hint={r.hint} />
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground">Where should we look?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Use your current location, or type an address or ZIP code.</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locBusy}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-60"
            >
              {locBusy ? <><Loader2 className="w-4 h-4 animate-spin" /> Getting your location…</> : <><LocateFixed className="w-4 h-4" /> Use my current location</>}
            </button>

            {coords && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <Check className="w-4 h-4 shrink-0" /> Using your current location.
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or type it <span className="h-px flex-1 bg-border" />
            </div>

            <div>
              <Label htmlFor="q-street" optional>Street address</Label>
              <input id="q-street" value={street} onChange={(e) => { setStreet(e.target.value); setCoords(null); }} placeholder="1234 Oak Ave" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="q-city">City</Label>
                <input id="q-city" value={city} onChange={(e) => { setCity(e.target.value); setCoords(null); }} placeholder="Ames" className={inputCls} />
              </div>
              <div>
                <Label htmlFor="q-zip">ZIP code</Label>
                <input id="q-zip" value={zip} onChange={(e) => { setZip(e.target.value); setCoords(null); }} placeholder="50010" inputMode="numeric" className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground">A little about your field</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Only what you know — leave the rest alone if you're unsure.</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="q-acreage">Roughly how many acres do you farm?</Label>
              <input id="q-acreage" value={acreage} onChange={(e) => setAcreage(e.target.value)} inputMode="decimal" placeholder="240" className={inputCls} />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Main crop <span className="font-normal text-muted-foreground">(optional)</span></div>
              <div className="flex flex-wrap gap-2">
                {CROPS.map((c) => <Pill key={c} active={crop === c} onClick={() => setCrop(crop === c ? null : c)}>{c}</Pill>)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Do you irrigate? <span className="font-normal text-muted-foreground">(optional)</span></div>
              <div className="flex gap-2">
                <Pill active={irrigated === true} onClick={() => setIrrigated(irrigated === true ? null : true)}>Yes</Pill>
                <Pill active={irrigated === false} onClick={() => setIrrigated(irrigated === false ? null : false)}>No</Pill>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-2">Last fertilizer application <span className="font-normal text-muted-foreground">(optional)</span></div>
              <div className="flex flex-wrap gap-2">
                {FERT.map((f) => <Pill key={f} active={fert === f} onClick={() => setFert(fert === f ? null : f)}>{f}</Pill>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => { setError(""); setStep(step - 1); }}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-accent-hover text-primary-foreground text-sm font-semibold py-3 rounded-lg transition"
        >
          {isLast ? "Check my water" : "Next"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">No account or email needed — your answers stay in this browser.</p>
    </div>
  );
}