import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const LINKS = [
  { to: "/#assessment", label: "Check My Water" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/how-it-works#data-sources", label: "Data Sources" },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-foreground leading-none">NitrateRisk <span className="text-primary">Iowa</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/#assessment" className="md:hidden text-xs font-medium text-primary">Check My Water</Link>
      </div>
    </header>
  );
}