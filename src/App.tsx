import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewProfilePage from "./pages/NewProfilePage";
import ManageProfilesPage from "./pages/ManageProfilesPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profiles/new" element={<NewProfilePage />} />
      <Route path="/profiles/manage" element={<ManageProfilesPage />} />
      <Route path="/u/:userId" element={<DashboardPage />} />
      <Route path="/u/:userId/history" element={<HistoryPage />} />
    </Routes>
  );
}
