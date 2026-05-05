"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Sign-in is temporarily unavailable. Check the deployment auth settings and try again.");
      }
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900 mb-7">Welcome back</h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 mb-5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#3b5bdb] focus:ring-[#3b5bdb]"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-indigo-50 rounded-md border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Demo credentials</p>
            <p className="text-xs text-indigo-600">Email: john@example.com</p>
            <p className="text-xs text-indigo-600">Password: password123</p>
          </div>
        </div>
      </div>

      {/* Right – Brand panel */}
      <div className="hidden md:flex w-[340px] lg:w-[400px] bg-[#3b5bdb] flex-col justify-end p-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">ticktock</h2>
          <p className="text-sm text-indigo-200 leading-relaxed">
            Introducing ticktock, our cutting-edge timesheet web application designed
            to revolutionize how you manage employee work hours. With ticktock, you can
            effortlessly track and monitor employee attendance and productivity from
            anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
