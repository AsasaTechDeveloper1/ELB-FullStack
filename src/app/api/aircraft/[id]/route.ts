import { NextResponse } from "next/server";
import { collection, addDoc, getDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await deleteDoc(doc(db, "aircrafts", id));

    return NextResponse.json(
      { success: true, message: `Aircraft ${id} deleted` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting aircraft:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete aircraft", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    // Wait for params to resolve
    const params = await context.params;

    const ref = doc(db, "aircrafts", params.id);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return NextResponse.json({ success: false, message: "Aircraft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: snapshot.id, ...snapshot.data() });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    // Wait for params to resolve
    const params = await context.params;

    const formData = await req.formData();

    const aircraftName = formData.get("aircraftName")?.toString() || "";
    const aircraftType = formData.get("aircraftType")?.toString() || "";
    const registrationNumber = formData.get("registrationNumber")?.toString() || "";
    const manufacturer = formData.get("manufacturer")?.toString() || "";
    const year = formData.get("year")?.toString() || "";
    const description = formData.get("description")?.toString() || "";

    let imagePath = formData.get("existingImage")?.toString() || ""; // keep old image if no new one
    const imageFile = formData.get("image") as File | null;

    if (imageFile) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const fileName = `${Date.now()}_${imageFile.name}`;
      const destPath = path.join(uploadsDir, fileName);
      const arrayBuffer = await imageFile.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(arrayBuffer));

      imagePath = `/uploads/${fileName}`;
    }

    const ref = doc(db, "aircrafts", params.id);
    await updateDoc(ref, {
      aircraftName,
      aircraftType,
      registrationNumber,
      manufacturer,
      year,
      description,
      imageUrl: imagePath,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Aircraft updated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}