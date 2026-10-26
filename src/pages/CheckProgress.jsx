import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import CheckingSteps from "@/components/CheckingSteps";
import { fetchEnvironmentalData } from "@/lib/environmentalData";

export default function CheckProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state;

  const [error, setError] = useState("");

  useEffect(() => {
    if (!payload || !payload.location) return;
    let cancelled = false;
    const started = Date.now();
    fetchEnvironmentalData(payload.location, payload.field)
      .then(async (assessment) => {
        const wait = Math.max(0, 1200 - (Date.now() - started));
        if (wait) await new Promise((r) => setTimeout(r, wait));
        if (cancelled) return;
        const result = { assessment, field: payload.field };
        try { sessionStorage.setItem("nitraterisk_assessment", JSON.stringify(result)); } catch {}
        navigate("/dashboard", { state: result, replace: true });
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "We couldn't reach the public data services. Please try again.");
      });
    return () => { cancelled = true; };
  }, [payload, navigate]);

  if (!payload || !payload.location || error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-card border border-border rounded-xl p-6">
            <h1 className="text-lg font-semibold text-foreground">We couldn't finish this check</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {error || "Something went wrong on the way here. Start the questions again and we'll retry."}
            </p>
            <Link to="/#assessment" className="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover">
              Start again
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-xl mx-auto px-4 py-10">
        <CheckingSteps />
      </main>
    </div>
  );
}