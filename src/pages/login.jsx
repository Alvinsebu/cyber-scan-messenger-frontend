
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { LOGIN_URL } from "../config";
import { Link } from "react-router-dom";
import Toast from "../components/toast";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

// ── floating dot config ──────────────────────────────────────────
const DOTS = [
  { top: "15%", left: "10%", delay: 0 },
  { top: "70%", left: "5%", delay: 0.8 },
  { top: "30%", left: "88%", delay: 1.6 },
  { top: "80%", left: "80%", delay: 0.4 },
  { top: "50%", left: "50%", delay: 1.2 },
  { top: "10%", left: "60%", delay: 2.0 },
];

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 overflow-hidden"
      style={{ backgroundColor: "#0d0f14" }}
    >
      {/* ── ambient glow circles ─────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-100px",
          left: "-100px",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.06)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-80px",
          right: "-80px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.04)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background: "hsl(220 100% 50% / 0.05)",
          filter: "blur(150px)",
        }}
      />

      {/* ── grid overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(180 100% 50% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── floating dots ────────────────────────────────── */}
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: dot.top,
            left: dot.left,
            width: "4px",
            height: "4px",
            backgroundColor: "hsl(180 100% 60%)",
          }}
          animate={{ y: [-20, 20], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "mirror",
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Login Card ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
        style={{
          background: "rgba(17,20,28,0.9)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid hsl(180 100% 50% / 0.15)",
          borderRadius: "16px",
          boxShadow:
            "0 0 40px hsl(180 100% 50% / 0.08), 0 20px 60px hsl(0 0% 0% / 0.5)",
          padding: "40px 32px 32px",
        }}
      >
        {/* top glow line */}
        <div
          className="absolute top-0 left-8 right-8 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.5), transparent)",
          }}
        />

        {/* ── Icon + Title ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "hsl(180 100% 50% / 0.10)",
              border: "1px solid hsl(180 100% 50% / 0.20)",
              boxShadow: "0 0 20px hsl(180 100% 50% / 0.15)",
            }}
          >
            <Shield size={28} color="hsl(180 100% 60%)" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight select-none">
            <span style={{ color: "#dde3ed" }}>Cyber</span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, hsl(180 100% 55%), hsl(180 100% 70%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Scan
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 20% 55%)" }}>
            Sign in to your account
          </p>
        </motion.div>

        {/* ── Form ─────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 mb-4"
          >
            {/* Email */}
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                style={{ color: "hsl(215 20% 45%)" }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                disabled={isLoading}
                className="w-full pl-10 pr-4 text-sm rounded-xl transition-all duration-200 outline-none"
                style={{
                  height: "48px",
                  backgroundColor: "#1a1e28",
                  border: "1px solid #2a2f3d",
                  color: "#dde3ed",
                  caretColor: "hsl(180 100% 60%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(180 100% 50% / 0.5)";
                  e.target.style.boxShadow =
                    "0 0 0 2px hsl(180 100% 50% / 0.1)";
                  e.target.previousElementSibling.style.color =
                    "hsl(180 100% 60%)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2f3d";
                  e.target.style.boxShadow = "none";
                  e.target.previousElementSibling.style.color =
                    "hsl(215 20% 45%)";
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                style={{ color: "hsl(215 20% 45%)" }}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                disabled={isLoading}
                className="w-full pl-10 pr-10 text-sm rounded-xl transition-all duration-200 outline-none"
                style={{
                  height: "48px",
                  backgroundColor: "#1a1e28",
                  border: "1px solid #2a2f3d",
                  color: "#dde3ed",
                  caretColor: "hsl(180 100% 60%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(180 100% 50% / 0.5)";
                  e.target.style.boxShadow =
                    "0 0 0 2px hsl(180 100% 50% / 0.1)";
                  e.target.previousElementSibling.style.color =
                    "hsl(180 100% 60%)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2f3d";
                  e.target.style.boxShadow = "none";
                  e.target.previousElementSibling.style.color =
                    "hsl(215 20% 45%)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: "hsl(215 20% 45%)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "hsl(180 100% 60%)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "hsl(215 20% 45%)")
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold text-sm rounded-xl transition-all duration-300"
              style={{
                height: "48px",
                background:
                  "linear-gradient(135deg, hsl(180 80% 30%), hsl(180 100% 45%))",
                color: "#0d0f14",
                boxShadow:
                  "0 0 20px hsl(180 100% 50% / 0.25), 0 4px 12px hsl(0 0% 0% / 0.3)",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading)
                  e.currentTarget.style.boxShadow =
                    "0 0 30px hsl(180 100% 50% / 0.4), 0 4px 16px hsl(0 0% 0% / 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 20px hsl(180 100% 50% / 0.25), 0 4px 12px hsl(0 0% 0% / 0.3)";
              }}
            >
              {isLoading ? "Signing in…" : "Log in"}
            </button>
          </motion.div>
        </form>

        {/* ── OR Divider ─────────────────────────────── */}
        <div className="flex items-center my-6">
          <div
            className="flex-grow h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(215 20% 30%))",
            }}
          />
          <span
            className="px-4 text-xs font-semibold uppercase"
            style={{ color: "hsl(215 20% 45%)" }}
          >
            or
          </span>
          <div
            className="flex-grow h-px"
            style={{
              background:
                "linear-gradient(90deg, hsl(215 20% 30%), transparent)",
            }}
          />
        </div>

        {/* ── Forgot Password ─────────────────────────── */}
        <div className="text-center">
          <a
            href="#"
            className="text-sm transition-colors duration-200"
            style={{ color: "hsl(180 100% 60% / 0.7)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "hsl(180 100% 60%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "hsl(180 100% 60% / 0.7)")
            }
          >
            Forgot password?
          </a>
        </div>
      </motion.div>

      {/* ── Bottom Sign Up Card ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-md mt-4"
        style={{
          background: "rgba(17,20,28,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid hsl(180 100% 50% / 0.15)",
          borderRadius: "16px",
          padding: "20px 32px",
          textAlign: "center",
          boxShadow: "0 8px 32px hsl(0 0% 0% / 0.3)",
        }}
      >
        <p className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-200"
            style={{ color: "hsl(180 100% 60%)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "hsl(180 100% 75%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "hsl(180 100% 60%)")
            }
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
