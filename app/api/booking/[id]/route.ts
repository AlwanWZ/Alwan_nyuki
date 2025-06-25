import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import DaftarPengajuan from "@/models/daftar_pengajuan";
import { ObjectId } from "mongodb";

// PATCH pengajuan (update status/alasan)
export async function PATCH(request: NextRequest, context: any) {
  await connectMongo();
  const id = context?.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID pengajuan tidak valid" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const updated = await DaftarPengajuan.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal update status pengajuan" }, { status: 500 });
  }
}

// DELETE pengajuan
export async function DELETE(request: NextRequest, context: any) {
  await connectMongo();
  const id = context?.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID pengajuan tidak valid" }, { status: 400 });
  }
  try {
    const deleted = await DaftarPengajuan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: deleted });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengajuan" }, { status: 500 });
  }
}
