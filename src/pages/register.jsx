
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Toast from "../components/toast";
import { REGISTER_URL } from "../config";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.email || !formData.username || !formData.password) {
      showToast("Please fill in all fields", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || "Signup failed. Please try again.";
        showToast(errorMsg, "error");
      } else {
        showToast("Signup successful!", "success");
        setTimeout(() => navigate("/login"), 1000);
        // Optionally, redirect or clear form here
      }
    } catch (error) {
      showToast("Signup failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-200 flex items-center justify-center px-4 py-8">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl px-4">
        {/* Signup box */}
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm border border-gray-200 p-8 rounded-2xl shadow-xl">
          <h1
            className="text-center text-4xl font-bold mb-2 text-emerald-600 italic font-serif"
          >
            CyberScan
          </h1>

          <p className="text-center text-gray-500 text-sm mb-6">
            Sign up to connect with friends and share moments.
          </p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              name="email"
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-sm transition-all"
            />
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-sm transition-all"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-sm transition-all"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-emerald-200 transition-all duration-300 mt-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-2 text-gray-500 text-xs font-semibold">OR</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <p className="text-center text-sm mt-4 text-gray-700">
            Have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
