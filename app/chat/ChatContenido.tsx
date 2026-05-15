"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  ref,
  onValue,
  push,
} from "firebase/database";

type Mensaje = {
  id?: string;
  idUsuario: string;
  nombreUsuario: string;
  texto: string;
  imagenBase64?: string;
  archivoBase64?: string;
  archivoNombre?: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();

  const uidContacto = searchParams.get("uid") || "";
  const nombreContacto = searchParams.get("nombre") || "Chat";


  const user = auth.currentUser;

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nombreActual =
    user?.displayName || user?.email?.split("@")[0] || "Usuario";

  const uidActual = user?.uid;

  const chatId =
    uidActual && uidContacto
      ? uidActual < uidContacto
        ? `${uidActual}_${uidContacto}`
        : `${uidContacto}_${uidActual}`
      : "";

  // 🔹 Cargar mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;

    const mensajesRef = ref(db, `chats/${chatId}`);

    const unsub = onValue(mensajesRef, (snap) => {
      const data = snap.val();

      if (!data) {
        setMensajes([]);
        return;
      }

      const lista: Mensaje[] = Object.entries(data).map(
        ([key, value]: any) => ({
          id: key,
          ...value,
        })
      );

      setMensajes(lista);
    });

    return () => unsub();
  }, [chatId]);

  // 🔹 Enviar mensaje texto
  const enviarMensaje = async () => {
    if (!texto.trim() || !uidActual) return;

    await push(ref(db, `chats/${chatId}`), {
      idUsuario: uidActual,
      nombreUsuario: nombreActual,
      texto,
    });

    setTexto("");
  };

  // 🔹 Enviar imagen
  const enviarImagen = (file: File) => {
    if (!uidActual) return;

    const reader = new FileReader();

    reader.onload = async () => {
      await push(ref(db, `chats/${chatId}`), {
        idUsuario: uidActual,
        nombreUsuario: nombreActual,
        texto: "",
        imagenBase64: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  // 🔹 Enviar archivo
  const enviarArchivo = (file: File) => {
    if (!uidActual) return;

    const reader = new FileReader();

    reader.onload = async () => {
      await push(ref(db, `chats/${chatId}`), {
        idUsuario: uidActual,
        nombreUsuario: nombreActual,
        texto: "",
        archivoBase64: reader.result,
        archivoNombre: file.name,
      });
    };

    reader.readAsDataURL(file);
  };

  // 🔹 Guardar mensaje
  const guardarMensaje = (m: Mensaje) => {
    const guardados = JSON.parse(localStorage.getItem("mensajes") || "[]");

    const nuevo = {
      ...m,
      id: Date.now(),
    };

    guardados.push(nuevo);
    localStorage.setItem("mensajes", JSON.stringify(guardados));

    alert("Mensaje guardado");
  };

  const confirmarGuardar = (m: Mensaje) => {
    if (confirm("¿Guardar este mensaje?")) {
      guardarMensaje(m);
    }
  };

  // 🔹 LONG PRESS
  const handlePressStart = (mensaje: Mensaje) => {
    const timer = setTimeout(() => {
      confirmarGuardar(mensaje);
    }, 700);

    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        Debes iniciar sesión
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-blue-50">

      {/* HEADER */}
      <div className="bg-blue-700 text-white p-4 flex justify-between">
        <h1 className="font-bold">{nombreContacto}</h1>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">

        {mensajes.map((m) => (
          <div
            key={m.id}
            onMouseDown={() => handlePressStart(m)}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() => handlePressStart(m)}
            onTouchEnd={handlePressEnd}
            className={`p-3 rounded-xl max-w-[70%] ${
              m.idUsuario === uidActual
                ? "bg-blue-700 text-white ml-auto"
                : "bg-white text-black"
            }`}
          >

            <p className="font-bold text-sm mb-1">
              {m.nombreUsuario}
            </p>

            {m.imagenBase64 && (
              <img
                src={m.imagenBase64}
                className="w-48 rounded-xl mt-2 cursor-pointer"
                onClick={() => setPreview(m.imagenBase64!)}
              />
            )}

            {m.archivoBase64 && (
              <a
                href={m.archivoBase64}
                download={m.archivoNombre}
                className="text-blue-600 underline"
              >
                📄 {m.archivoNombre}
              </a>
            )}

            {m.texto && <p>{m.texto}</p>}

          </div>
        ))}

      </div>

      {/* INPUT */}
      <div className="p-3 flex gap-2 bg-white">

        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              enviarImagen(e.target.files[0]);
            }
          }}
        />

        <label className="text-2xl cursor-pointer">
          📎
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                enviarArchivo(e.target.files[0]);
              }
            }}
          />
        </label>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-2xl"
        >
          🖼️
        </button>

        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3 rounded-xl bg-gray-100 text-black"
        />

        <button
          onClick={enviarMensaje}
          className="bg-blue-700 text-white px-4 rounded-xl"
        >
          ➤
        </button>

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