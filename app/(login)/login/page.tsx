"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Funkcija za prijavo uporabnika
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prepreči reload strani
    setLoading(true);

    const Res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    // Če ni napake, je prijava uspešna
    if (!Res?.error){
      toast.success("Successfull login")
      window.location.href = "./";
    }
    else toast.error("Invalid email or password");
  };

  return (
    <div className="main">
      <div className="text-white bg-primary p-8 rounded-lg shadow w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center mb-6">Log In</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            className="login-text-area"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="login-text-area"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            name="login"
            className="cursor-pointer w-full p-2 bg-secondary text-textprimary rounded hover:bg-secondaryDarkened"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Prijva z GitHub računom*/}
        <button
          onClick={() => signIn("github")}
          className="cursor-pointer w-full mt-4 p-2 bg-black text-white rounded hover:bg-white hover:text-black"
        >
          Login with GitHub
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
        <Link href="./register" className="linkV1">
          Register
        </Link>
        </p>
      </div>
    </div>
  );
}