import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CheckEmail from "./pages/auth/CheckEmail";
import SetNewPassword from "./pages/auth/SetNewPassword";
import PasswordResetSuccess from "./pages/auth/PasswordResetSuccess";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import Users from "./pages/dashboard/Users";
import UserDetails from "./pages/dashboard/UserDetails";
import Support from "./pages/dashboard/Support";
import SupportTicket from "./pages/dashboard/SupportTicket";
import Broadcast from "./pages/dashboard/Broadcast";
import Settings from "./pages/dashboard/Settings";
import Admins from "./pages/dashboard/Admins";
import Revenue from "./pages/dashboard/Revenue";
import CoinPackages from "./pages/dashboard/CoinPackages";
import Notifications from "./pages/dashboard/Notifications";
import PrivateRoute from "./provider/PrivateRoutes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/reset-password" element={<SetNewPassword />} />
      <Route
        path="/password-reset-success"
        element={<PasswordResetSuccess />}
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="coin-packages" element={<CoinPackages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="support" element={<Support />} />
        <Route path="support/:id" element={<SupportTicket />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="admins" element={<Admins />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
