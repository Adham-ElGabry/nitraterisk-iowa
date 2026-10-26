import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  { t: "Finding your location", d: "Your address or ZIP is turned into map coordinates." },
  { t: "Getting recent rainfall", d: "How much rain fell near you, and what's forecast, from NOAA / National Weather Service." },
  { t: "Checking nearby streams", d: "Live streamflow readings from USGS gauges close to you." },
  { t: "Looking up nitrate records", d: "Past nitrate measurements from the USGS Water Quality Portal." },
  { t: "Building your estimate", d: "We weigh each indicator and show the factors, the sources, and any gaps." },
];

export default function CheckingSteps({ heading, subtitle, note }) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStepIdx((i) => (i < STEPS.length - 1 ? i + 1 : i)), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{heading || "Checking your water…"}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        {subtitle || "This usually takes a few seconds. Here's what is happening — keep this page open."}
      </p>

      <ol className="space-y-3 mt-6">
        {STEPS.map((s, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                active ? "border-primary/40 bg-primary/5" : done ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-card"
              }`}
            >
              <span
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-emerald-600" : active ? "bg-primary" : "bg-secondary"
                }`}
              >
                {done ? (
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                ) : active ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{s.t}</span>
                <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.d}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
        {note || "We only read public government data. If a source has nothing near you, we'll tell you that instead of guessing."}
      </p>
    </div>
  );
}