import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/user';

// Helper untuk mengambil field penting user
function getUserFields(user: any) {
  if (!user || Array.isArray(user)) return null;
  const {
    _id, uid, name, email, role, photoURL, noTelp, alamat,
    tanggalLahir, tanggalBergabung, noKTP, pekerjaan, darurat, bio, status
  } = user;
  return {
    _id, uid, name, email, role, photoURL, noTelp, alamat,
    tanggalLahir, tanggalBergabung, noKTP, pekerjaan, darurat, bio, status
  };
}

async function findUserByIdOrUid(id: string) {
  if (!id) return null;
  let user = await User.findOne({ uid: id }).lean();
  if (!user && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
    user = await User.findById(id).lean();
  }
  return user;
}

export async function GET(request: NextRequest, context: any) {
  try {
    await connectMongo();
    const id = context?.params?.id;
    const user = await findUserByIdOrUid(id);
    const userFields = getUserFields(user);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    await connectMongo();
    const id = context?.params?.id;
    const body = await request.json();
    let updated = await User.findOneAndUpdate({ uid: id }, { $set: body }, { new: true });
    if (!updated && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
      updated = await User.findByIdAndUpdate(id, { $set: body }, { new: true });
    }
    const userFields = getUserFields(updated);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch {
    return NextResponse.json({ error: 'Gagal update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    await connectMongo();
    const id = context?.params?.id;
    let deleted = await User.findOneAndDelete({ uid: id });
    if (!deleted && id.length === 24 && /^[a-fA-F0-9]+$/.test(id)) {
      deleted = await User.findByIdAndDelete(id);
    }
    const userFields = getUserFields(deleted);
    if (!userFields) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ data: userFields });
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}