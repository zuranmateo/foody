"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError("Gesli nista enaki!");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, email, phone, address, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Registration successful! You can now log in.");
      router.push("./login");
    } else {
      setError(data.error || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl p-8 backdrop-blur-xl bg-white/20 shadow-2xl border border-white/30 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center text-red-800">
          Register
        </h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="text"
          placeholder="surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="text"
          placeholder="phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="text"
          placeholder="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <input
          type="password"
          placeholder="Repeat Password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-800"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold hover:bg-red-900 transition disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-gray-600">
          already have an account?{" "}
          <Link href="./login" className="text-red-800 underline hover:text-red-900">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}