import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/user';

// Helper untuk memastikan hasil query adalah objek user tunggal
function getUserFields(user: any) {
  if (!user || Array.isArray(user)) return null;
  const { _id, uid, name, email, role, photoURL, noTelp, alamat, tanggalLahir, tanggalBergabung, noKTP, pekerjaan, darurat, bio, status } = user;
  return { _id, uid, name, email, role, photoURL, noTelp, alamat, tanggalLahir, tanggalBergabung, noKTP, pekerjaan, darurat, bio, status };
}

// GET user by UID (prioritas cari pakai uid, bukan _id)
export async function GET(request: NextRequest, context: any) {
  const id = context?.params?.id;
  try {
    await connectMongo();
    let user = null;
    if (id) {
      // Cari berdasarkan uid
      user = await User.findOne({ uid: id }).lean();
      // Jika tidak ketemu dan id format 24 hex karakter, coba cari by _id
      if (!user && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
        user = await User.findById(id).lean();
      }
    }
    const userFields = getUserFields(user);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}

// PATCH user by UID (prioritas update pakai uid, bukan _id)
export async function PATCH(request: NextRequest, context: any) {
  const id = context?.params?.id;
  try {
    await connectMongo();
    const body = await request.json();
    let updated = null;
    if (id) {
      // Update berdasarkan uid
      updated = await User.findOneAndUpdate({ uid: id }, { $set: body }, { new: true });
      // Jika tidak ketemu dan id format 24 hex karakter, coba update by _id
      if (!updated && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
        updated = await User.findByIdAndUpdate(id, { $set: body }, { new: true });
      }
    }
    const userFields = getUserFields(updated);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update user' }, { status: 500 });
  }
}

// DELETE user by UID
export async function DELETE(request: NextRequest, context: any) {
  const id = context?.params?.id;
  try {
    await connectMongo();
    let deleted = null;
    if (id) {
      // Hapus berdasarkan uid
      deleted = await User.findOneAndDelete({ uid: id });
      // Jika tidak ketemu dan id format 24 hex karakter, coba hapus by _id
      if (!deleted && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
        deleted = await User.findByIdAndDelete(id);
      }
    }
    const userFields = getUserFields(deleted);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}