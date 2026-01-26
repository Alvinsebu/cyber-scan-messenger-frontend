
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { LOGIN_URL } from "../config";
import { Link } from "react-router-dom";
import Toast from "../components/toast";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      showToast("Please fill in all fields", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || "Login failed. Please try again.";
        showToast(errorMsg, "error");
      } else {
        const data = await response.json();
        // Only store the required fields
        login({
          email: data.email,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          username: data.username,
        });
        showToast("Login successful!", "success");
        setTimeout(() => navigate("/feeds"), 1000);
      }
    } catch (error) {
      showToast("Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-200 flex flex-col items-center justify-center px-4 py-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold italic font-serif text-emerald-600 select-none">
            CyberScan
          </h1>
          <p className="text-gray-500 text-sm mt-2">Connect with friends and share moments</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            disabled={isLoading}
            className="w-full border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            disabled={isLoading}
            className="w-full border border-gray-200 rounded-xl bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
          />
          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl text-sm font-semibold mt-4 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all duration-300"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-xs font-semibold uppercase">
            or
          </span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Forgot Password */}
        <div className="text-center mb-2">
          <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="w-full max-w-sm mt-4">
        <div className="border border-gray-200 rounded-2xl bg-white/95 backdrop-blur-sm p-6 text-center shadow-lg">
          <p className="text-sm text-gray-700">
            Don&apos;t have an account?{" "}
             <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
