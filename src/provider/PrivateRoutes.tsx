import { Navigate, useLocation } from "react-router-dom";
import { useProfileQuery } from "../redux/apiSlices/authSlice";


const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();



  const { data, isLoading, isError, isSuccess, refetch } = useProfileQuery(undefined);
  const role = data?.role;

  
  if (isSuccess && !data) {
    console.log("Refetching profile...");
    refetch();
  }
  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.96)",
          zIndex: 9999,
          color: "#444",
          fontSize: "1.15rem",
          letterSpacing: 0.2,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: "1.3rem",
            marginBottom: ".8rem",
          }}
        >
          Please wait...
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (role === "user"  || role === "admin" || role === "super_admin") {
    return children;
  }

};

export default PrivateRoute;