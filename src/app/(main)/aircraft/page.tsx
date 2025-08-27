'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Aircraft {
  id: string;
  name: string;
  type: string;
  registrationNumber: string;
  manufacturer: string;
  year: number;
  dateAdded: string;
}

export default function AircraftListPage() {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function fetchAircraft() {
    try {
      const res = await fetch('/api/aircraft');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setAircraftList(
          data.map((item: any) => ({
            id: item.id,
            name: item.aircraftName,
            type: item.aircraftType,
            registrationNumber: item.registrationNumber,
            manufacturer: item.manufacturer,
            year: item.year,
            dateAdded: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
          }))
        );
      } else {
        setAircraftList([]);
      }
    } catch (error) {
      console.error('Failed to fetch aircraft:', error);
      setAircraftList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAircraft();
  }, []);

  function handleAddNew() {
    router.push('/aircraft/create');
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this aircraft?")) return;

    const res = await fetch(`/api/aircraft/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("✅ Aircraft deleted successfully");
      fetchAircraft(); // refresh list from server
    } else {
      setMessage("❌ Failed to delete aircraft");
    }

    // Hide message after 3s
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <>
      <div className="bg-white p-6 shadow rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">🛫 Registered Aircraft</h2>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-[#004051] hover:bg-[#006172] text-white font-medium rounded-md transition"
          >
            + Add New Aircraft
          </button> 
        </div>

        {message && (
          <div className="mb-4 text-center text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-md">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading aircraft...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center text-gray-700">#</TableHead>
                  <TableHead className="text-gray-700">Name</TableHead>
                  <TableHead className="text-gray-700">Type</TableHead>
                  <TableHead className="text-gray-700">Registration #</TableHead>
                  <TableHead className="text-gray-700">Manufacturer</TableHead>
                  <TableHead className="text-gray-700">Year</TableHead>
                  <TableHead className="text-gray-700">Date Added</TableHead>
                  <TableHead className="text-gray-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraftList.length > 0 ? (
                  aircraftList.map((aircraft, index) => (
                    <TableRow key={aircraft.id} className="text-gray-800">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{aircraft.name}</TableCell>
                      <TableCell>{aircraft.type}</TableCell>
                      <TableCell>{aircraft.registrationNumber}</TableCell>
                      <TableCell>{aircraft.manufacturer}</TableCell>
                      <TableCell>{aircraft.year}</TableCell>
                      <TableCell>{aircraft.dateAdded}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <button
                          onClick={() => router.push(`/aircraft/${aircraft.id}/edit`)}
                          className="px-3 py-1 bg-[#004051] hover:bg-[#006172] text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(aircraft.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                      No aircraft found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
