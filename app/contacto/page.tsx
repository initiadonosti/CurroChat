"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";

type Usuario = {
  uid: string;
  nombre: string;
  fotoUrl?: string;
  horaInicio?: string;
  horaFinal?: string;
};

export default function ChatPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const CONTACTOS_KEY = `CONTACTOS_GUARDADOS_${uid}`;

  // 🔹 Imagen helper
  const obtenerImagen = (foto?: string) => {
    if (!foto) return null;
    if (foto.startsWith("/9j/") || foto.length > 100) {
      return `data:image/jpeg;base64,${foto}`;
    }
    return foto;
  };

  // 🔹 INIT
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.push("/");
      return;
    }

    cargarUsuario(user.uid);
    cargarContactos(user.uid);
  }, []);

  // 🔹 Usuario actual
  const cargarUsuario = async (uid: string) => {
    const snapshot = await get(ref(db, `usuarios/${uid}`));

    if (snapshot.exists()) {
      setUsuarioActual({
        uid,
        nombre: snapshot.val().nombre,
      });
    }
  };

  // 🔹 Contactos guardados
  const cargarContactos = async (uid: string) => {
    const json = localStorage.getItem(CONTACTOS_KEY);
    if (!json) return;

    const guardados = JSON.parse(json);
    const lista: Usuario[] = [];

    for (const c of guardados) {
      const snap = await get(ref(db, `usuarios/${c.uid}`));

      if (snap.exists()) {
        const data = snap.val();

        lista.push({
          uid: c.uid,
          nombre: data.nombre,
          fotoUrl: data.fotoUrl,
          horaInicio: data.horaInicio || "08:00",
          horaFinal: data.horaFinal || "17:00",
        });
      }
    }

    setUsuarios(lista);
  };

  // 🔹 Guardar contactos
  const guardarContactos = (lista: Usuario[]) => {
    localStorage.setItem(
      CONTACTOS_KEY,
      JSON.stringify(lista.map((u) => ({ uid: u.uid })))
    );
  };

  // 🔥 BÚSQUEDA ARREGLADA (SIN FIREBASE QUERY PROBLEMÁTICO)
  const buscarUsuario = async () => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return;

    const snapshot = await get(ref(db, "usuarios"));

    let encontrado: Usuario | null = null;

    snapshot.forEach((child) => {
      const data = child.val();

      const nombre = (data.nombre || "").toLowerCase().trim();

      if (child.key !== uid && nombre === texto) {
        encontrado = {
          uid: child.key!,
          nombre: data.nombre,
          fotoUrl: data.fotoUrl,
          horaInicio: data.horaInicio,
          horaFinal: data.horaFinal,
        };
      }
    });

    // ❌ NO encontrado → invitación
    if (!encontrado) {
      const email = prompt(
        "Usuario no encontrado.\n\nIntroduce un correo para enviar invitación:"
      );

      if (!email) return;

      const asunto = encodeURIComponent("Invitación a MiChatApp");

      const mensaje = encodeURIComponent(`
Hola,

Te invito a usar MiChatApp para comunicarte conmigo.

https://curro-chat-nu.vercel.app/

¡Nos vemos dentro!
`);

      window.open(
        `mailto:${email}?subject=${asunto}&body=${mensaje}`,
        "_self"
      );

      return;
    }

    // ✔ ya existe
    const existe = usuarios.some((u) => u.uid === encontrado!.uid);

    if (existe) {
      alert("Ya existe");
      return;
    }

    const nueva = [...usuarios, encontrado!];

    setUsuarios(nueva);
    guardarContactos(nueva);
    setBusqueda("");
  };

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 relative">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-blue-700 text-white p-4 rounded-xl mb-4 relative">
        
        <div>
          <p className="text-sm">Usuario:</p>
          <p className="font-bold">{usuarioActual?.nombre}</p>
        </div>

        {/* HAMBURGUESA */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-2xl"
        >
          ☰
        </button>

        {/* MENU DROPDOWN */}
        {menuAbierto && (
          <div className="absolute right-4 top-16 bg-white text-black rounded-xl shadow-lg w-56 overflow-hidden z-50">

            <button
              onClick={() => router.push("/guardados")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Mensajes guardados
            </button>

            <button
              onClick={() => router.push("/perfil")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Perfil
            </button>

            <button
              onClick={() => router.push("/compartir")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Compartir / Instalar app
            </button>

            <button
              onClick={() => router.push("/politica")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Política de privacidad
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 hover:bg-red-100 text-red-600"
            >
              Cerrar sesión
            </button>

          </div>
        )}
      </div>

      {/* BUSCADOR */}
      <div className="flex gap-2 mb-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar contacto..."
          className="flex-1 p-3 rounded-xl bg-white text-black"
        />

        <button
          onClick={buscarUsuario}
          className="bg-blue-700 text-white px-4 rounded-xl"
        >
          +
        </button>
      </div>

      {/* CONTACTOS */}
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div
            key={u.uid}
            onClick={() =>
              router.push(
                `/chat?uid=${u.uid}&nombre=${encodeURIComponent(u.nombre)}`
              )
            }
            className="flex items-center gap-3 bg-white p-4 rounded-xl shadow cursor-pointer text-black"
          >
            {u.fotoUrl ? (
              <img
                src={obtenerImagen(u.fotoUrl) || ""}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                {u.nombre.charAt(0)}
              </div>
            )}

            <div>
              <p className="font-bold">{u.nombre}</p>
              <p className="text-sm text-gray-500">
                {u.horaInicio} - {u.horaFinal}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}