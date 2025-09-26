"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function AuthForm({ defaultMode = "login", onSuccess,close }) {

    const{login}=useAuth();
  const [mode, setMode] = useState(defaultMode);

  // state for form inputs
  const[name,setName]=useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // simple local error state for inline messages
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endpointForMode = (m) => {
    if (!API_BASE) return null;
    return m === "login" ? `${API_BASE}/login.php` : `${API_BASE}/signup.php`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password  || (mode === "signup" && (!confirmPassword || !name))) {
      setError("Please fill all required fields.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const url = endpointForMode(mode);
    if (!url) {
      setError("API base is not configured. Set NEXT_PUBLIC_API_BASE.");
      return;
    }

    setLoading(true);
    try {
      const body = { email, password,name };
      console.log(body)
      if (mode === "signup") body.confirmPassword = confirmPassword;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("response",res)
      if (!res.ok) {
        // show server error if provided
        setError(data.error || "Server returned an error");
        // console.error("Server error:", data);
        alert(`Error: ${data.error || 'Server error'}`);
      } else {
        console.log("Server response:", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user)
        alert(`Success: ${data.message || JSON.stringify(data)}`);
        // clear fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
                // close the modal 
         close?.();
        

        // optional callback to parent (e.g., close modal or set user state)
        if (onSuccess) onSuccess(data);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. See console for details.");
      alert("Network error. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full">
      {/* Toggle buttons */}
      <div className="flex mb-6">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-l-lg font-medium transition-colors ${
            mode === "login"
              ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-r-lg font-medium transition-colors ${
            mode === "signup"
              ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white"
              : "bg-gray-100 text-gray-600"
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
            <h2 className="text-2xl font-bold text-center mb-4">Login Form</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
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
                className="w-full py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4">Signup Form</h2>
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
                className="w-full px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg"
              >
                {loading ? "Please wait..." : "Signup"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
