import { Route, Routes } from "react-router-dom";

import Analytics from "../features/analytics/Analytics";
import Citizens from "../features/citizens/Citizens";
import Contractors from "../features/contractors/Contractors";
import OperationsCenter from "../features/dashboard/OperationsCenter";
import Incidents from "../features/incidents/Incidents";
import Infrastructure from "../features/infrastructure/Infrastructure";
import Reports from "../features/reports/Reports";
import Settings from "../features/settings/Settings";

import NotFound from "../components/feedback/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<OperationsCenter />}
      />

      <Route
        path="/incidents"
        element={<Incidents />}
      />

      <Route
        path="/infrastructure"
        element={<Infrastructure />}
      />

      <Route
        path="/contractors"
        element={<Contractors />}
      />

      <Route
        path="/citizens"
        element={<Citizens />}
      />

      <Route
        path="/analytics"
        element={<Analytics />}
      />

      <Route
        path="/reports"
        element={<Reports />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default AppRoutes;