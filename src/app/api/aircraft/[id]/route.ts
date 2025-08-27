import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

// DELETE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  await deleteDoc(doc(db, "aircrafts", id));
  return NextResponse.json({ success: true, message: `Aircraft ${id} deleted` });
}

// GET
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  const snapshot = await getDoc(doc(db, "aircrafts", id));
  if (!snapshot.exists()) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, id: snapshot.id, ...snapshot.data() });
}

// PUT
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { id } = params;
  const formData = await req.formData();
  const aircraftName = formData.get("aircraftName")?.toString() || "";
  const aircraftType = formData.get("aircraftType")?.toString() || "";

  let imagePath = formData.get("existingImage")?.toString() || "";
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const fileName = `${Date.now()}_${imageFile.name}`;
    fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(await imageFile.arrayBuffer()));
    imagePath = `/uploads/${fileName}`;
  }

  await updateDoc(doc(db, "aircrafts", id), { aircraftName, aircraftType, imageUrl: imagePath });
  return NextResponse.json({ success: true, message: "Aircraft updated" });
}