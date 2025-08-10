
import { useState } from "react";
import { Link } from "react-router-dom";
import Toast from "../components/toast";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
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

    if (!formData.email || !formData.fullName || !formData.username || !formData.password) {
      showToast("Please fill in all fields", "error");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast("Signup successful!", "success");
      console.log("Signup attempt:", formData);
    } catch (error) {
      showToast("Signup failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl px-4">
        {/* Signup box */}
        <div className="w-full max-w-sm bg-white border border-gray-300 p-8 rounded-sm">
          <h1
            className="text-center text-4xl font-bold mb-4"
            style={{ fontFamily: "'Proxima Nova', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Instagram
          </h1>

          <p className="text-center text-gray-500 text-sm font-semibold mb-4">
            Sign up to see photos and videos from your friends.
          </p>

          <form className="space-y-2" onSubmit={handleSubmit}>
            <input
              name="email"
              type="text"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Mobile number or email"
              className="w-full p-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400 text-sm"
            />
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full p-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400 text-sm"
            />
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full p-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400 text-sm"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full p-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:border-gray-400 text-sm"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#0095F6] text-white font-semibold py-1.5 rounded-sm hover:bg-[#1877f2] text-sm ${
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

          <p className="text-center text-sm mt-4">
            Have an account?{" "}
            <Link to="/login" className="text-[#0095F6] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
