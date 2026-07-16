import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthIllustration from "../../components/auth/AuthIllustration";
import FormField from "../../components/auth/FormField";
import PasswordField from "../../components/auth/PasswordField";
import PrimaryButton from "../../components/auth/PrimaryButton";
import { setToLocalStorage } from "../../services/auth.service";
import { useLoginMutation } from "../../redux/apiSlices/authSlice";
import { notification } from "antd";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading: loading }] = useLoginMutation();
  const [notificationApi, contextHolder] = notification.useNotification();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("User already logged in, redirecting to /dashboard");
      navigate("/dashboard");
    }
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({
        email,
        password,
        auth_provider: "local",
      }).unwrap();


      if (result?.data?.data?.accessToken) {
        notificationApi.success({
          message: "Sign in successful!",
        });
        setToLocalStorage(result?.data?.data?.accessToken);
        navigate("/dashboard");
      }
    } catch (err: any) {
      let errorObj = err;
      if (typeof err === "object" && err !== null) {
        if ((err as any).data) {
          errorObj = (err as any).data;
        }
      }
      if (errorObj?.errorMessages?.length) {
        notificationApi.error({
          message: errorObj.errorMessages[0].message,
        });
      } else if (errorObj?.message) {
        notificationApi.error({
          message: errorObj.message,
        });
      } else {
        notificationApi.error({
          message: "Sign in failed. Please try again.",
        });
      }
    }
  };

  return (
    <AuthLayout
      illustration={<AuthIllustration alt="User login illustration" />}
    >
      {contextHolder}
      <AuthCard description="Welcome back! Please enter your details.">
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <PasswordField
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand hover:underline"
              >
                Forgot password
              </Link>
            </div>
          </div>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
