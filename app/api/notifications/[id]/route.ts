import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/notifikasi";

export async function DELETE(request: NextRequest, context: any) {
  try {
    await connectDB();
    const id = context?.params?.id;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: deleted });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}