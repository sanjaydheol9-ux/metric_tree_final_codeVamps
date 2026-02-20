import { useOutletContext } from "react-router-dom";
import {
  Truck,
  CheckCircle,
  Clock,
  Warehouse,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ContextType = {
  selectedWeek: number;
};

const mockMetrics: Record<number, {
  delivery_score: number;
  accuracy_score: number;
  dispatch_score: number;
  warehouse_score: number;
  on_time_score: number;
}> = {
  21: { delivery_score: 96.1, accuracy_score: 99.1, dispatch_score: 87.3, warehouse_score: 69.8, on_time_score: 94.2 },
  22: { delivery_score: 94.8, accuracy_score: 98.5, dispatch_score: 82.1, warehouse_score: 71.2, on_time_score: 91.7 },
  23: { delivery_score: 91.4, accuracy_score: 97.4, dispatch_score: 78.9, warehouse_score: 74.9, on_time_score: 88.2 },
};

const weeklyData = [
  { week: "W18", delivery: 95.1, accuracy: 98.8, ontime: 93.1 },
  { week: "W19", delivery: 93.8, accuracy: 98.2, ontime: 91.9 },
  { week: "W20", delivery: 94.2, accuracy: 98.5, ontime: 92.4 },
  { week: "W21", delivery: 96.1, accuracy: 99.1, ontime: 94.2 },
  { week: "W22", delivery: 94.8, accuracy: 98.5, ontime: 91.7 },
  { week: "W23", delivery: 91.4, accuracy: 97.4, ontime: 88.2 },
];

const kpiBarData = [
  { name: "Delivery", current: 91.4, prev: 94.8 },
  { name: "Accuracy", current: 97.4, prev: 98.5 },
  { name: "Dispatch", current: 78.9, prev: 82.1 },
  { name: "Warehouse", current: 74.9, prev: 71.2 },
  { name: "On-Time", current: 88.2, prev: 91.7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="card-glass rounded-xl p-3 border border-border text-xs">
      <p className="text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground data-value">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function Overview() {
  const { selectedWeek } = useOutletContext<ContextType>();
  const metrics = mockMetrics[selectedWeek] ?? mockMetrics[23];
  const prevMetrics = mockMetrics[selectedWeek - 1] ?? mockMetrics[22];

  const kpis = [
    {
      label: "Delivery Performance",
      value: metrics.delivery_score,
      prev: prevMetrics.delivery_score,
      icon: Truck,
      unit: "%",
    },
    {
      label: "Order Accuracy",
      value: metrics.accuracy_score,
      prev: prevMetrics.accuracy_score,
      icon: CheckCircle,
      unit: "%",
    },
    {
      label: "Dispatch Score",
      value: metrics.dispatch_score,
      prev: prevMetrics.dispatch_score,
      icon: Clock,
      unit: "",
    },
    {
      label: "Warehouse Utilization",
      value: metrics.warehouse_score,
      prev: prevMetrics.warehouse_score,
      icon: Warehouse,
      unit: "%",
    },
    {
      label: "On-Time Delivery",
      value: metrics.on_time_score,
      prev: prevMetrics.on_time_score,
      icon: Package,
      unit: "%",
    },
  ];

  const hasAlert = kpis.some((k) => k.value - k.prev < -2);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Week {selectedWeek} — Performance Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            vs. Week {selectedWeek - 1} comparison
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            hasAlert
              ? "bg-destructive/10 text-destructive border-destructive/25"
              : "bg-success/10 text-success border-success/25"
          }`}
        >
          <span className={hasAlert ? "status-dot-danger" : "status-dot-success"} />
          {hasAlert ? "Alert" : "Normal"}
        </span>
      </div>

      {/* AI Alert Banner */}
      {hasAlert && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/25 bg-warning/5">
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">Performance Alert Detected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multiple KPIs have declined more than 2% vs. prior week. AI root cause analysis is available.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => {
          const delta = parseFloat((kpi.value - kpi.prev).toFixed(1));
          const up = delta >= 0;
          return (
            <div
              key={index}
              className={`card-glass rounded-xl p-5 border transition-all hover:scale-[1.02] duration-200 ${
                !up && delta < -2
                  ? "border-destructive/25"
                  : up
                  ? "border-success/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className="w-4 h-4 text-primary" />
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-bold ${
                    up ? "text-success" : "text-destructive"
                  }`}
                >
                  {up ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {delta > 0 ? "+" : ""}{delta}%
                </span>
              </div>
              <div className="data-value text-2xl font-bold text-foreground mb-1">
                {kpi.value}{kpi.unit}
              </div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass rounded-xl border border-border p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">6-Week Performance Trend</h3>
            <p className="text-xs text-muted-foreground">Delivery, Accuracy, On-Time week over week</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 28%, 14%)" />
              <XAxis dataKey="week" tick={{ fill: "hsl(215, 20%, 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 100]} tick={{ fill: "hsl(215, 20%, 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="delivery" name="Delivery %" stroke="hsl(213, 100%, 60%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(213, 100%, 60%)" }} />
              <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="hsl(158, 82%, 44%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(158, 82%, 44%)" }} />
              <Line type="monotone" dataKey="ontime" name="On-Time %" stroke="hsl(38, 95%, 56%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(38, 95%, 56%)" }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-glass rounded-xl border border-border p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">KPI Comparison — Current vs Previous</h3>
            <p className="text-xs text-muted-foreground">W{selectedWeek} vs W{selectedWeek - 1}</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kpiBarData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 28%, 14%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 105]} tick={{ fill: "hsl(215, 20%, 52%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="prev" name="Previous" radius={[4, 4, 0, 0]} fill="hsl(220, 30%, 28%)" />
              <Bar dataKey="current" name="Current" radius={[4, 4, 0, 0]} fill="hsl(213, 100%, 60%)" opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
