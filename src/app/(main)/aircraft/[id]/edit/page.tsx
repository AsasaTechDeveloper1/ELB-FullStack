'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditAircraftPage() {
  const router = useRouter(); 
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [aircraftName, setAircraftName] = useState("");
  const [aircraftType, setAircraftType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  // Fetch existing aircraft
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    } else {
      setImage(null);
    }
  };

  useEffect(() => {
    async function fetchAircraft() {
      try {
        const res = await fetch(`/api/aircraft/${id}`);
        const data = await res.json();

        if (data.success) {
          setAircraftName(data.aircraftName);
          setAircraftType(data.aircraftType);
          setRegistrationNumber(data.registrationNumber);
          setManufacturer(data.manufacturer);
          setYear(data.year);
          setDescription(data.description || "");
          setExistingImage(data.imageUrl || ""); // ✅ add this
        }

      } catch (err) {
        console.error("Failed to load aircraft:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAircraft();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("aircraftName", aircraftName);
    formData.append("aircraftType", aircraftType);
    formData.append("registrationNumber", registrationNumber);
    formData.append("manufacturer", manufacturer);
    formData.append("year", year);
    formData.append("description", description);

    // Keep existing image if no new image selected
    if (image) {
      formData.append("image", image);
    } else if (existingImage) {
      formData.append("existingImage", existingImage);
    }

    try {
      const res = await fetch(`/api/aircraft/${id}`, {
        method: "PUT",
        body: formData, // send FormData
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Aircraft updated!");
        router.push("/aircraft");
      } else {
        alert("❌ Failed to update aircraft");
      }
    } catch (err) {
      console.error("Error updating aircraft:", err);
      alert("❌ Something went wrong");
    }
  }


  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">✈️ Edit Aircraft</h2>
        <button onClick={() => router.back()} type="button" className="text-white text-sm hover:underline">
          ← Back
        </button>
      </div>

      <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <input value={aircraftName} onChange={(e) => setAircraftName(e.target.value)} placeholder="Aircraft Name" className="border p-2 rounded" required />
        <input value={aircraftType} onChange={(e) => setAircraftType(e.target.value)} placeholder="Aircraft Type" className="border p-2 rounded" required />
        <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="Registration Number" className="border p-2 rounded" required />
        <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Manufacturer" className="border p-2 rounded" required />
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="border p-2 rounded" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded col-span-2" />
        {existingImage && !image && (
          <img src={existingImage} alt="Aircraft" className="w-32 h-32 object-contain mb-2" />
        )}
         {/* Image Upload with Drag & Drop */}
        <div className="md:col-span-2">
          <label className="text-[15px] font-semibold text-gray-700 mb-2 block">
            Upload Aircraft Image
          </label>

          <div
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type.startsWith('image/')) {
                setImage(droppedFile);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#004051] rounded-md p-6 text-center text-sm text-gray-500 bg-[#f9fbfb] hover:bg-[#f1f5f5] cursor-pointer transition"
            onClick={() => document.getElementById('aircraftImage')?.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-2 text-[#004051]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 118 0v4m-4 4v-4" />
            </svg>
            <p className="text-[#004051] font-medium">Drag & drop image here or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG</p>
          </div>

          <input
            id="aircraftImage"
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={handleImageChange}
          />

          {image && (
            <p className="text-sm text-gray-600 mt-2">
              📎 <strong>Selected:</strong> {image.name}
            </p>
          )}
        </div>
        <div className="col-span-2 flex justify-end">
          <button type="submit" className="bg-[#004051] hover:bg-[#00363f] text-white px-6 py-2 rounded">
            Update Aircraft
          </button>
        </div>
      </form>
    </div>
  );
}
