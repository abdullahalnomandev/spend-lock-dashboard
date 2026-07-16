import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import { handleLogout } from "../services/auth.service";
import { useProfileQuery } from "../redux/apiSlices/authSlice";

export default function DashboardLayout() {
  const { data } = useProfileQuery(undefined);

  const currentUser = {
    name: data?.name || "",
    location: data?.role || "Super Admin",
  };

  const handleLogoutOnClick = () => {
    handleLogout();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-page text-gray-900">
      <Sidebar user={currentUser} onLogout={handleLogoutOnClick} />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-8 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
