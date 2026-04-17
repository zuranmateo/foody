"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const Res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!Res?.error) {
      toast.success("Successfull login");
      window.location.href = "./";
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <section className="bg-white h-[450px] flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl p-8 backdrop-blur-xl bg-white/20 shadow-2xl border border-white/30">

        <h2 className="text-2xl font-semibold text-center text-red-800 p-3">
          Log In
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            name="login"
            className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold hover:bg-red-900 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <button
          onClick={() => signIn("github")}
          className="w-full mt-4 bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition"
        >
          Login with GitHub
        </button>

        <p className="text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <Link href="./register" className="text-red-800 underline hover:text-red-900">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}