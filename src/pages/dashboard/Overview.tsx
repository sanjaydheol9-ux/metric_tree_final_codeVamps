import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Truck, CheckCircle, Clock, Warehouse, Package } from "lucide-react";

type ContextType = {
  selectedWeek: number;
};

const { selectedWeek } = useOutletContext<ContextType>();


type Metrics = {
  delivery_score: number;
  accuracy_score: number;
  dispatch_score: number;
  warehouse_score: number;
  on_time_score: number;
};

export default function Overview() {
  const { selectedWeek } = useOutletContext<ContextType>();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/metrics/${selectedWeek.value}`
        );
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics");
      }
      setLoading(false);
    }

    fetchMetrics();
  }, [selectedWeek]);

  if (loading) return <div>Loading metrics...</div>;

  if (!metrics) return null;

  const kpis = [
    {
      label: "Delivery Performance",
      value: `${metrics.delivery_score}%`,
      icon: Truck,
    },
    {
      label: "Order Accuracy",
      value: `${metrics.accuracy_score}%`,
      icon: CheckCircle,
    },
    {
      label: "Dispatch Score",
      value: `${metrics.dispatch_score}`,
      icon: Clock,
    },
    {
      label: "Warehouse Utilization",
      value: `${metrics.warehouse_score}%`,
      icon: Warehouse,
    },
    {
      label: "On-Time Delivery",
      value: `${metrics.on_time_score}%`,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      <h2 className="text-xl font-semibold">
        Week {selectedWeek.value} Performance Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="card-glass rounded-xl p-5 border border-border hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <kpi.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {kpi.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
