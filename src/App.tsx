import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import PatientForm from "./pages/PatientForm";
import PatientDetail from "./pages/PatientDetail";
import Questionnaires from "./pages/Questionnaires";
import PeriodComparison from "./pages/PeriodComparison";
import ConsentHistory from "./routes/consent-history";
import PublicTCLE from "./pages/PublicTCLE";
import PublicQuestionnaires from "./pages/PublicQuestionnaires";
import QuestionnaireEVA from "./pages/QuestionnaireEVA";
import QuestionnaireIKDC from "./pages/QuestionnaireIKDC";
import QuestionnaireKOOS from "./pages/QuestionnaireKOOS";
import PatientScores from "./pages/PatientScores";
import Reminders from "./pages/Reminders";
import Analytics from "./pages/Analytics";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/?"} component={Dashboard} />
      <Route path={"/pacientes/novo"} component={PatientForm} />
      <Route path={"/pacientes/:id/editar"} component={PatientForm} />
      <Route path={"/pacientes/:id"} component={PatientDetail} />
      <Route path={"/questionarios/:id"} component={Questionnaires} />
      <Route path={"/period-comparison"} component={PeriodComparison} />
      <Route path={"/consent-history/:patientId"} component={ConsentHistory} />
      <Route path={"/tcle"} component={PublicTCLE} />
      <Route path={"/questionarios"} component={PublicQuestionnaires} />
      <Route path={"/questionario/eva"} component={QuestionnaireEVA} />
      <Route path={"/questionario/ikdc"} component={QuestionnaireIKDC} />
      <Route path={"/questionario/koos"} component={QuestionnaireKOOS} />
      <Route path={"/pacientes/:id/scores"} component={PatientScores} />
      <Route path={"/lembretes"} component={Reminders} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
