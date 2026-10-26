import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import Questionnaire from "@/components/Questionnaire";
import LiveIowaStrip from "@/components/LiveIowaStrip";

export default function Landing() {
  const navigate = useNavigate();

  const handleAnalyze = ({ location, field }) => {
    navigate("/checking", { state: { location, field } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
              Is nitrate getting into your water?
            </h1>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
              Answer a few quick questions about where you are. We check live public data from NOAA, USGS and the EPA,
              then give you a plain-language estimate for the next 3 days.
            </p>
            <p className="text-sm text-muted-foreground mt-5">
              Free · No account needed · If a source is missing, we say so
            </p>
            <Link
              to="/#assessment"
              className="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-accent-hover text-primary-foreground text-sm font-semibold px-5 py-3 rounded-lg transition"
            >
              Check my water <ArrowDown className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section id="assessment" className="scroll-mt-20 border-b border-border bg-secondary/40">
          <div className="max-w-2xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-semibold text-foreground mb-1">Check your water</h2>
            <p className="text-sm text-muted-foreground mb-6">It takes about a minute.</p>
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
              <Questionnaire onAnalyze={handleAnalyze} />
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-12 w-full">
          <LiveIowaStrip />
        </section>
      </main>
    </div>
  );
}