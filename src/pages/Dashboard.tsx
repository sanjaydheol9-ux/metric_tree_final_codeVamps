import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  GitBranch,
  Brain,
  AlertTriangle,
  Crosshair,
  FlaskConical,
  Settings,
  Activity,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { path: "/dashboard/weekly", icon: BarChart2, label: "Weekly Metrics" },
  { path: "/dashboard/metric-tree", icon: GitBranch, label: "Metric Tree" },
  { path: "/dashboard/ai-insights", icon: Brain, label: "AI Insights" },
  { path: "/dashboard/anomalies", icon: AlertTriangle, label: "Anomalies" },
  { path: "/dashboard/root-cause", icon: Crosshair, label: "Root Cause" },
  { path: "/dashboard/simulation", icon: FlaskConical, label: "Simulation" },
  { path: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const companies = [
  "Apex Logistics Corp",
  "GlobalFreight Ltd",
  "NovaTrans Inc",
  "SwiftHub EU",
];

const weeks = [
  { label: "Week 23 — Jun 2–8", value: 23 },
  { label: "Week 22 — May 26–Jun 1", value: 22 },
  { label: "Week 21 — May 19–25", value: 21 },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [company, setCompany] = useState(companies[0]);
  const [selectedWeek, setSelectedWeek] = useState(23); // ✅ clean numeric state

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentPage = navItems.find((n) =>
    n.exact
      ? location.pathname === n.path
      : location.pathname.startsWith(n.path)
  );

  return (
    <div className="flex h-screen bg-background">


      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xs font-bold">Supply Chain</div>
            <div className="text-xs text-primary font-semibold">
              Intelligence AI
            </div>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div>
              <div className="text-xs font-semibold">Jane Doe</div>
              <div className="text-[10px] text-muted-foreground">
                VP Supply Chain
              </div>
            </div>
            <button onClick={() => navigate("/")}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="h-16 border-b flex items-center px-6 bg-background">
          <button
            className="lg:hidden mr-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm font-semibold">
              {currentPage?.label ?? "Dashboard"}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Supply Chain Intelligence Platform
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">

            {/* Company Selector */}
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border bg-secondary/40"
            >
              {companies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Week Selector — FIXED */}
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-1.5 text-sm rounded-lg border bg-secondary/40"
            >
              {weeks.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>

            <Bell className="w-5 h-5" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background-secondary p-6">
          <Outlet context={{ selectedWeek }} />
        </main>
      </div>
    </div>
  );
}
