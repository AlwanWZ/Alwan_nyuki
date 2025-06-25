"use client";
export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AjukanSewaPage() {
  const params = useSearchParams();
  const router = useRouter();
  const kontrakanId = params.get("id") || "";
  const [user, setUser] = useState<any>(null);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [durasi, setDurasi] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Anda belum login.");
    if (!tanggalMulai) return alert("Tanggal mulai wajib diisi!");

    const data = {
      kontrakanId,
      uid: user.uid,
      nama: user.name,
      noHp: user.noTelp,
      tanggalMulai,
      durasi,
      catatan,
    };

    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard/tamu");
      }, 2000);
    } else {
      alert("Gagal mengajukan sewa. Silakan coba lagi.");
    }
  };

  if (submitted) {
    return (
      <div>
        <h2>Pengajuan Berhasil!</h2>
        <p>Data pengajuan sewa Anda telah dikirim.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={user?.name || ""}
        disabled
        placeholder="Nama Lengkap"
      />
      <input
        type="tel"
        value={user?.noTelp || ""}
        disabled
        placeholder="No. HP/WA"
      />
      <input
        type="date"
        value={tanggalMulai}
        onChange={e => setTanggalMulai(e.target.value)}
        required
      />
      <select
        value={durasi}
        onChange={e => setDurasi(e.target.value)}
      >
        <option value="1">1 bulan</option>
        <option value="3">3 bulan</option>
        <option value="6">6 bulan</option>
        <option value="12">12 bulan</option>
      </select>
      <textarea
        value={catatan}
        onChange={e => setCatatan(e.target.value)}
        placeholder="Catatan (opsional)"
      />
      <button type="submit">Ajukan Sewa</button>
    </form>
  );
}