import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Brain, RefreshCw, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

type ContextType = {
  selectedWeek: number;
};

type AIResponse = {
  status: "Alert" | "Normal";
  summary: string;
  bottleneck: string;
  root_cause: string;
  recommendations: string[];
};

const mockInsights: Record<number, AIResponse> = {
  21: {
    status: "Normal",
    summary: "Week 21 delivered strong results across all KPIs. Delivery performance reached 96.1%, the best in the 6-week window. No significant anomalies were detected.",
    bottleneck: "Minor outbound flow constraints in Warehouse Zone B — contained and self-resolved.",
    root_cause: "Performance improvement attributed to optimized carrier scheduling and Zone A processing efficiency gains implemented in W20.",
    recommendations: [
      "Sustain carrier scheduling protocol introduced this week as a standard operating procedure.",
      "Replicate Zone A efficiency model across Zone B and Zone C operations.",
      "Initiate capacity buffer review ahead of projected W24 demand peak.",
    ],
  },
  22: {
    status: "Alert",
    summary: "Week 22 showed a moderate decline in Dispatch Score (−3.2%) and On-Time Delivery (−2.8%). Delivery performance dipped below 95% for the first time in 3 weeks.",
    bottleneck: "Zone B dispatch throughput constrained by a partial WMS configuration rollback on Thursday.",
    root_cause: "The WMS rollback triggered a 6–8 minute processing lag on ~1,400 orders, primarily in Zone B. Carrier reliability remained stable. No external disruptions detected.",
    recommendations: [
      "Prevent unauthorized WMS configuration changes — enforce change-management approval gates.",
      "Deploy real-time WMS telemetry alerts for processing lag spikes above 5 minutes.",
      "Review Zone B staffing levels for Shift 2 — throughput data suggests a 12% personnel gap.",
    ],
  },
  23: {
    status: "Alert",
    summary: "Week 23 recorded the lowest delivery performance in 6 weeks at 91.4%. Three simultaneous carrier pickup failures on Tuesday triggered a cascade across Zones B and C.",
    bottleneck: "Zone C dispatch saturation — processing time reached 99.1 min vs. 78.9 min baseline. Responsible for 42% of the performance variance.",
    root_cause: "Three carrier consolidation failures (Tuesday, Jun 4) combined with an unauthorized WMS manual override introduced an 8–12 minute lag affecting 2,847 orders. Zone C operated at 94% capacity with no relief routing available.",
    recommendations: [
      "Activate backup carrier contracts for Zone C lanes — current SLA breach risk is high.",
      "Implement a WMS override lockout during peak processing windows (08:00–16:00).",
      "Redistribute Zone C orders to Zone A (currently at 68% utilization) to reduce saturation.",
    ],
  },
};

export default function AIInsights() {
  const { selectedWeek } = useOutletContext<ContextType>();
  const [loading, setLoading] = useState(false);
  const [regenerated, setRegenerated] = useState(false);

  const data = mockInsights[selectedWeek] ?? mockInsights[23];

  const regenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRegenerated(true);
      setTimeout(() => setRegenerated(false), 3000);
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">AI Weekly Insights</h2>
            <p className="text-xs text-muted-foreground">Executive intelligence — Week {selectedWeek}</p>
          </div>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing..." : regenerated ? "✓ Refreshed" : "Regenerate Insights"}
        </button>
      </div>

      {loading && (
        <div className="card-glass rounded-xl border border-border p-8 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Analyzing operational data with AI...</p>
          <div className="animate-shimmer h-1.5 rounded-full w-48 mx-auto" />
        </div>
      )}

      {!loading && (
        <>
          {/* Status Card */}
          <div
            className={`card-glass rounded-xl border p-6 ${
              data.status === "Alert"
                ? "border-destructive/25 bg-destructive/5 card-glow-danger"
                : "border-success/25 bg-success/5 card-glow-success"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  data.status === "Alert" ? "bg-destructive/15" : "bg-success/15"
                }`}
              >
                {data.status === "Alert" ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      data.status === "Alert"
                        ? "bg-destructive/15 text-destructive border-destructive/30"
                        : "bg-success/15 text-success border-success/30"
                    }`}
                  >
                    {data.status}
                  </span>
                  <span className="text-xs text-muted-foreground">Week {selectedWeek} AI Assessment</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
              </div>
            </div>
          </div>

          {/* Bottleneck + Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-glass rounded-xl border border-border p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                Main Bottleneck
              </div>
              <p className="text-sm text-foreground leading-relaxed">{data.bottleneck}</p>
            </div>
            <div className="card-glass rounded-xl border border-border p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                Root Cause
              </div>
              <p className="text-sm text-foreground leading-relaxed">{data.root_cause}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">Top Operational Recommendations</h3>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="card-glass rounded-xl border border-border p-4 flex items-start gap-4 hover:border-primary/25 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground flex-1 leading-relaxed">{rec}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Powered by AI — Llama 3.3 70B (logistics-tuned)</span>
            <span>Model confidence: <span className="text-success font-semibold">96.7%</span></span>
          </div>
        </>
      )}
    </div>
  );
}
