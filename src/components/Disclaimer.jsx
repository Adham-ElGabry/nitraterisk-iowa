import React from "react";
import { ShieldAlert } from "lucide-react";

export default function Disclaimer({ text }) {
  return (
    <div className="bento-card border-amber-200 bg-amber-50/40">
      <div className="flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs uppercase tracking-wider text-amber-700 font-medium mb-1">Disclaimer</div>
          <p className="text-xs text-foreground leading-relaxed">
            {text || "This tool provides an environmental risk estimate based on available public data. It is not a substitute for laboratory water testing, professional environmental analysis, or regulatory guidance. Risk estimates may be inaccurate when data is missing, delayed, or unavailable."}
          </p>
        </div>
      </div>
    </div>
  );
}