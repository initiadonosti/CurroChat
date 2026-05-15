"use client";

import { useEffect, useState } from "react";

type MensajeGuardado = {
  id: number;
  idUsuario: string;
  nombreUsuario: string;
  idReceptor: string;
  texto: string;
  imagenBase64?: string;
};

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<MensajeGuardado[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  // 🔹 cargar mensajes
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mensajes") || "[]");

    if (data.length === 0) {
      alert("No hay mensajes guardados");
    }

    setMensajes(data);
  }, []);

  // 🔹 eliminar
  const eliminarMensaje = (id: number) => {
    if (!confirm("¿Eliminar mensaje?")) return;

    const nueva = mensajes.filter((m) => m.id !== id);
    setMensajes(nueva);
    localStorage.setItem("mensajes", JSON.stringify(nueva));
  };

  // 🔹 LONG PRESS START
  const handlePressStart = (id: number) => {
    const timer = setTimeout(() => {
      eliminarMensaje(id);
    }, 700);

    setPressTimer(timer);
  };

  // 🔹 LONG PRESS END
  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">

      {/* HEADER */}
      <div className="bg-blue-700 text-white p-5 text-xl font-bold">
        Mensajes Guardados
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-3">

        {mensajes.length === 0 && (
          <p className="text-center text-gray-500">
            No hay mensajes guardados
          </p>
        )}

        {mensajes.map((m) => (
          <div
            key={m.id}

            onMouseDown={() => handlePressStart(m.id)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() => handlePressStart(m.id)}
            onTouchEnd={handlePressEnd}

            className="bg-white p-4 rounded-xl shadow cursor-pointer text-black"
          >
            <p className="font-bold mb-1">
              {m.nombreUsuario}
            </p>

            {m.imagenBase64 ? (
              <img
                src={m.imagenBase64}
                className="w-full h-48 object-cover rounded-lg mt-2"
                onClick={() => setPreview(m.imagenBase64!)}
              />
            ) : (
              <p className="italic text-gray-700">
                "{m.texto}"
              </p>
            )}
          </div>
        ))}

      </div>

      {/* MODAL */}
      {preview && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center"
          onClick={() => setPreview(null)}
        >
          <img src={preview} className="max-h-[80%]" />
        </div>
      )}

    </div>
  );
}