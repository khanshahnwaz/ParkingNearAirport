"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function AuthForm({ defaultMode = "login", onSuccess, close }) {
  const { login } = useAuth();
  const [mode, setMode] = useState(defaultMode);

  // form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endpointForMode = (m) =>
    m === "login" ? `${API_BASE}/login.php` : `${API_BASE}/signup.php`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (mode === "signup" && (!confirmPassword || !name))) {
      setError("Please fill all required fields.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const body = { email, password, name };
      if (mode === "signup") body.confirmPassword = confirmPassword;

      const res = await fetch(endpointForMode(mode), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Server returned an error");
        alert(`Error: ${data.error || "Server error"}`);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user);
        alert(`Success: ${data.message || JSON.stringify(data)}`);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        close?.();
        onSuccess?.(data);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. See console for details.");
      alert("Network error. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    // console.log("login google ", credentialResponse);

    const token = credentialResponse.credential;

    // Decode JWT to extract user details
    const decoded = jwtDecode(token);
    // console.log("Decoded user:", decoded);

    // If your backend still expects the token:
    const res = await fetch(`${API_BASE}/google-login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token:decoded }),
    });

    const data = await res.json();
    //  console.log("response ",res)
    if (!res.ok) {
      console.log("failure cause ",data.error)
      setError("Google login failed");
    } else {
      // Example: You could merge decoded info if backend doesn’t send user object
      const user = data.user || decoded;

      localStorage.setItem("user", JSON.stringify(user));
      login(user);
      close?.();
      onSuccess?.(data);
    }
  } catch (err) {
    console.error("Google login error", err);
    setError("Google login error");
  }
};

  return (
    <div className="p-8 w-full">
      {/* Toggle buttons */}
      <div className="flex mb-6">
        <button
          onClick={() => setMode("login")}
          className={`cursor-pointer flex-1 py-2 rounded-l-lg font-medium transition-colors ${
            mode === "login"
              ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`cursor-pointer flex-1 py-2 rounded-r-lg font-medium transition-colors ${
            mode === "signup"
              ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Signup
        </button>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        {mode === "login" ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-4 text-black">
              Login Form
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="text-right">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>

            {/* Google Login button */}
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4 text-black">
              Signup Form
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg text-gray-800 placeholder-black"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg"
              >
                {loading ? "Please wait..." : "Signup"}
              </button>
            </form>
             {/* Google Login button */}
            <div className="mt-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
              />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
