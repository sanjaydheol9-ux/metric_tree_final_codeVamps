import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";

import Overview from "./pages/dashboard/Overview";
import WeeklyMetrics from "./pages/dashboard/WeeklyMetrics";
import MetricTree from "./pages/dashboard/MetricTree";
import AIInsights from "./pages/dashboard/AIInsights";
import Anomalies from "./pages/dashboard/Anomalies";
import RootCause from "./pages/dashboard/RootCause";
import Simulation from "./pages/dashboard/Simulation";
import SettingsPage from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Index />} />

            {/* Dashboard Layout */}
            <Route path="/dashboard" element={<Dashboard />}>

              {/* Default Dashboard Page */}
              <Route index element={<Overview />} />

              {/* Feature Pages */}
              <Route path="weekly" element={<WeeklyMetrics />} />
              <Route path="metric-tree" element={<MetricTree />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="anomalies" element={<Anomalies />} />
              <Route path="root-cause" element={<RootCause />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="settings" element={<SettingsPage />} />

            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
}
