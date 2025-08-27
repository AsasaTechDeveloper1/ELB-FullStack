import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import fs from "fs";
import path from "path";

// Disable default body parser
export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const aircraftName = formData.get("aircraftName")?.toString() || "";
    const aircraftType = formData.get("aircraftType")?.toString() || "";
    const registrationNumber = formData.get("registrationNumber")?.toString() || "";
    const manufacturer = formData.get("manufacturer")?.toString() || "";
    const year = formData.get("year")?.toString() || "";
    const description = formData.get("description")?.toString() || "";

    let imagePath = "";
    const imageFile = formData.get("image") as File | null;

    if (imageFile) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const fileName = `${Date.now()}_${imageFile.name}`;
      const destPath = path.join(uploadsDir, fileName);

      // Convert File to ArrayBuffer and save
      const arrayBuffer = await imageFile.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(arrayBuffer));

      imagePath = `/uploads/${fileName}`;
    }

    const docRef = await addDoc(collection(db, "aircrafts"), {
      aircraftName,
      aircraftType,
      registrationNumber,
      manufacturer,
      year,
      description,
      imageUrl: imagePath,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: docRef.id, message: "Aircraft saved successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "aircrafts"));

    const aircraftList = snapshot.docs.map((doc) => ({
      id: doc.id,
      aircraftName: doc.data().aircraftName || "",
      aircraftType: doc.data().aircraftType || "",
      registrationNumber: doc.data().registrationNumber || "",
      manufacturer: doc.data().manufacturer || "",
      year: doc.data().year || "",
      description: doc.data().description || "",
      createdAt: doc.data().createdAt?.toDate().toISOString() || "",
    }));

    return NextResponse.json(aircraftList, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching aircraft:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch aircraft", error: error.message },
      { status: 500 }
    );
  }
}

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