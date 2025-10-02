
import { useState } from "react";
import { Link } from "react-router-dom";
import Toast from "../components/toast";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      showToast("Please fill in all fields", "error");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("Login successful!", "success");
      console.log("Login attempt:", formData);
    } catch (error) {
      showToast("Login failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded-sm shadow-sm p-10">
        {/* Instagram Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold italic font-serif text-gray-800 select-none">
            CyberScan
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Phone number, username, or email"
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-sm bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-sm bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold mt-4 disabled:opacity-50"
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
        <div className="text-center mb-6">
          <a href="#" className="text-xs text-blue-800 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="w-full max-w-sm mt-4">
        <div className="border border-gray-300 rounded-sm bg-white p-6 text-center">
          <p className="text-sm text-gray-800">
            Don&apos;t have an account?{" "}
             <Link to="/register" className="text-[#0095F6] font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
