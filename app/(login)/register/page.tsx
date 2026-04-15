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
  const [repeatPassword, setRepeatPassword] = useState(""); // dodano stanje
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // za prikaz napake

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Preveri, če sta gesli enaki
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
    <main className="">
      <form onSubmit={handleSubmit} className="text-white bg-primary p-8 space-y-2 rounded-lg shadow w-full max-w-md">
      <h2 className="">Register</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className=""
        required
      />
      <input
        type="text"
        placeholder="surname"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        className=""
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className=""
        required
      />
      <input
        type="text"
        placeholder="phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className=""
        required
      />
      <input
        type="text"
        placeholder="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className=""
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className=""
        required
      />

      <input
        type="password"
        placeholder="Repeat Password"
        value={repeatPassword} // dodano pravilno stanje
        onChange={(e) => setRepeatPassword(e.target.value)} // popravljeno
        className=""
        required
      />

      <button
        type="submit"
        disabled={loading}
        className=""
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <p className="">
  already have an account?{" "}
  <Link href="./login" className="text-linkColor underline">
    Login
  </Link>
</p>
    </form>
    </main>
  );
}
