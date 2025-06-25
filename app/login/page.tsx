"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cpu, Lock, Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Fungsi redirect sesuai role
const redirectByRole = (role: string, router: any) => {
  switch (role) {
    case "tamu":
      router.replace("/dashboard/tamu");
      break;
    case "penyewa":
      router.replace("/dashboard/penyewa");
      break;
    case "admin":
      router.replace("/dashboard/admin");
      break;
    case "maintenance":
      router.replace("/dashboard/admin/maintenance");
      break;
    case "keuangan":
      router.replace("/dashboard/admin/keuangan");
      break;
    default:
      router.replace("/login");
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper untuk fetch data lengkap user dari MongoDB dan update localStorage
  const fetchAndStoreUser = async (uid: string, router: any, fallback: any = {}) => {
    try {
      const res = await fetch(`/api/get-user?uid=${uid}`);
      const data = await res.json();
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        redirectByRole(data.user.role, router);
      } else {
        // fallback jika user tidak ditemukan di MongoDB
        localStorage.setItem("user", JSON.stringify(fallback));
        redirectByRole(fallback.role || "tamu", router);
      }
    } catch {
      localStorage.setItem("user", JSON.stringify(fallback));
      redirectByRole(fallback.role || "tamu", router);
    }
  };

  // Login Manual dengan Email/Password
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Ambil data user dari Firestore (opsional, untuk nama/foto)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // Sync ke MongoDB TANPA mengubah role!
      await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: userData?.name || user.displayName || user.email,
          email: user.email,
          photoURL: userData?.photoURL || "",
          // JANGAN KIRIM role!
        }),
      });

      // Fetch data lengkap dari MongoDB dan update localStorage
      await fetchAndStoreUser(user.uid, router, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: "tamu", // fallback
      });

      alert("Login berhasil!");
    } catch (error: any) {
      alert(error.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  // Login dengan Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // 1. Login dengan Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Sync user ke backend MongoDB tanpa mengubah role!
      await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL || "",
          // JANGAN KIRIM role!
        }),
      });

      // 3. Fetch data lengkap dari MongoDB dan update localStorage
      await fetchAndStoreUser(user.uid, router, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: "tamu", // fallback
      });

      // 4. Simpan token (opsional)
      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      alert("Login berhasil!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login";
      alert("Login gagal: " + errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 px-4">
      <div className="w-full max-w-md bg-slate-800/30 backdrop-blur-md p-8 rounded-xl shadow-lg border border-slate-700/50">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-emerald-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              Kontrakan AA
            </h1>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-center text-emerald-200">
          Masuk ke Akun Anda
        </h2>

        {/* Keterangan akun */}
        <div className="mb-6 p-4 bg-slate-900/60 rounded-lg border border-emerald-700/30 text-emerald-200 text-sm">
          <p className="mb-2 font-semibold text-emerald-300">Ketentuan Login:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-medium text-emerald-400">Tamu</span>: Masuk hanya menggunakan <span className="font-semibold">Google</span></li>
            <li><span className="font-medium">maintenance@gmail.com</span> = <span className="font-mono">1234567</span></li>
            <li><span className="font-medium">superadmin@gmail.com</span> = <span className="font-mono">admin12345</span></li>
            <li><span className="font-medium">keuangan@gmail.com</span> = <span className="font-mono">1234567</span></li>
          </ul>
        </div>

        {/* Form Login Manual */}
        <form onSubmit={handleManualLogin} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-emerald-100"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-emerald-100"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-3 rounded-lg"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        {/* Pemisah */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800/30 text-slate-400">atau</span>
          </div>
        </div>

        {/* Button Google Login */}
        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
            />
          </svg>
          {loading ? "Memproses..." : "Masuk dengan Google"}
        </Button>

        {/* Link Register */}
        <div className="mt-6 text-center">
          <p className="text-slate-300">
            Belum punya akun?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300">
              Daftar di sini
            </Link>
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}