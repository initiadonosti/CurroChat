"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { ref, get, update } from "firebase/database";

export default function PerfilPage() {
  const router = useRouter();

  const user = auth.currentUser;

  const [nombre, setNombre] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFinal, setHoraFinal] = useState("");
  const [vacacionesInicio, setVacacionesInicio] = useState("");
  const [vacacionesFinal, setVacacionesFinal] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    if (!user) return;

    const snap = await get(ref(db, `usuarios/${user.uid}`));

    if (snap.exists()) {
      const data = snap.val();

      setNombre(data.nombre || "");
      setHoraInicio(data.horaInicio || "");
      setHoraFinal(data.horaFinal || "");
      setVacacionesInicio(data.vacacionesInicio || "");
      setVacacionesFinal(data.vacacionesFinal || "");
      setFotoBase64(data.fotoUrl || "");
    }
  };

  const convertirImagen = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      setFotoBase64(base64.split(",")[1]); // quitar prefix
    };

    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    if (!user) return;

    if (!nombre || !horaInicio || !horaFinal) {
      alert("Completa los campos obligatorios");
      return;
    }

    await update(ref(db, `usuarios/${user.uid}`), {
      nombre,
      horaInicio,
      horaFinal,
      vacacionesInicio,
      vacacionesFinal,
      fotoUrl: fotoBase64,
    });

    alert("Perfil actualizado correctamente");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-blue-50 p-4">

      {/* HEADER */}
      <div className="bg-blue-700 text-white p-4 rounded-xl text-center mb-6">
        <h1 className="text-xl font-bold">Perfil de Usuario</h1>
      </div>

      {/* FOTO */}
      <div className="flex justify-center mb-6">
        <label className="cursor-pointer">
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg">
            {fotoBase64 ? (
              <img
                src={`data:image/jpeg;base64,${fotoBase64}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Subir foto</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                convertirImagen(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* FORM */}
      <div className="space-y-3">

        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="w-full p-3 rounded-xl bg-white text-black"
        />

        <input
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          placeholder="Hora inicio (08:00)"
          className="w-full p-3 rounded-xl bg-white text-black"
        />

        <input
          value={horaFinal}
          onChange={(e) => setHoraFinal(e.target.value)}
          placeholder="Hora fin (17:00)"
          className="w-full p-3 rounded-xl bg-white text-black"
        />

        <input
          value={vacacionesInicio}
          onChange={(e) => setVacacionesInicio(e.target.value)}
          placeholder="Vacaciones inicio (DD/MM/AAAA)"
          className="w-full p-3 rounded-xl bg-white text-black"
        />

        <input
          value={vacacionesFinal}
          onChange={(e) => setVacacionesFinal(e.target.value)}
          placeholder="Vacaciones fin (DD/MM/AAAA)"
          className="w-full p-3 rounded-xl bg-white text-black"
        />
      </div>

      {/* BOTÓN GUARDAR */}
      <button
        onClick={guardar}
        className="w-full mt-6 bg-blue-700 text-white p-3 rounded-xl font-bold"
      >
        Guardar cambios
      </button>

      {/* VOLVER */}
      <button
        onClick={() => router.push("/contacto")}
        className="w-full mt-3 bg-gray-300 text-black p-3 rounded-xl"
      >
        Volver
      </button>
    </div>
  );
}