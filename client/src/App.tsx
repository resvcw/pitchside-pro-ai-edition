import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TeamSetup from "./pages/TeamSetup";
import PlayerManagement from "./pages/PlayerManagement";
import MatchLive from "./pages/MatchLive";
import MatchHistory from "./pages/MatchHistory";
import Statistics from "./pages/Statistics";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      <Route path={"/teams"} component={() => (
        <DashboardLayout>
          <TeamSetup />
        </DashboardLayout>
      )} />
      <Route path={"/players"} component={() => (
        <DashboardLayout>
          <PlayerManagement />
        </DashboardLayout>
      )} />
      <Route path={"/match/live/:matchId"} component={(props: any) => (
        <MatchLive matchId={parseInt(props.params.matchId)} />
      )} />
      <Route path={"/match/history"} component={() => (
        <DashboardLayout>
          <MatchHistory />
        </DashboardLayout>
      )} />
      <Route path={"/statistics"} component={() => (
        <DashboardLayout>
          <Statistics />
        </DashboardLayout>
      )} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
