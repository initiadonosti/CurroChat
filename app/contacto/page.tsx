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
  vacacionesInicio?: string;
  vacacionesFinal?: string;
  estaDeVacaciones?: boolean;
};

export default function ChatPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const CONTACTOS_KEY = `CONTACTOS_GUARDADOS_${uid}`;

  const obtenerImagen = (foto?: string) => {
    if (!foto) return null;
    if (foto.startsWith("/9j/") || foto.length > 100) {
      return `data:image/jpeg;base64,${foto}`;
    }
    return foto;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/");
      return;
    }

    cargarUsuario(user.uid);
    cargarContactos(user.uid);
  }, []);

  const parseFecha = (fechaStr: string) => {
    const partes = fechaStr.split("/");
    return new Date(
      parseInt(partes[2]),
      parseInt(partes[1]) - 1,
      parseInt(partes[0])
    );
  };

  const cargarUsuario = async (uid: string) => {
    const snapshot = await get(ref(db, `usuarios/${uid}`));

    if (snapshot.exists()) {
      setUsuarioActual({
        uid,
        nombre: snapshot.val().nombre,
      });
    }
  };

  const cargarContactos = async (uid: string) => {
    const json = localStorage.getItem(CONTACTOS_KEY);
    if (!json) return;

    const guardados = JSON.parse(json);
    const lista: Usuario[] = [];

    for (const c of guardados) {
      const snap = await get(ref(db, `usuarios/${c.uid}`));

      if (snap.exists()) {
        const data = snap.val();

        let estaDeVacaciones = false;

        if (data.vacacionesInicio && data.vacacionesFinal) {
          const hoy = new Date();
          const inicio = parseFecha(data.vacacionesInicio);
          const fin = parseFecha(data.vacacionesFinal);

          if (hoy >= inicio && hoy <= fin) {
            estaDeVacaciones = true;
          }
        }

        lista.push({
          uid: c.uid,
          nombre: data.nombre,
          fotoUrl: data.fotoUrl,
          horaInicio: data.horaInicio || "08:00",
          horaFinal: data.horaFinal || "17:00",
          vacacionesInicio: data.vacacionesInicio,
          vacacionesFinal: data.vacacionesFinal,
          estaDeVacaciones,
        });
      }
    }

    setUsuarios(lista);
  };

  const guardarContactos = (lista: Usuario[]) => {
    localStorage.setItem(
      CONTACTOS_KEY,
      JSON.stringify(lista.map((u) => ({ uid: u.uid })))
    );
  };

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

  // 👇 FIX DE TYPESCRIPT (IMPORTANTE)
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

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-blue-700 text-white p-4 rounded-xl mb-4">
        <div>
          <p className="text-sm">Usuario:</p>
          <p className="font-bold">{usuarioActual?.nombre}</p>
        </div>

        <button onClick={() => setMenuAbierto(!menuAbierto)}>
          ☰
        </button>
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
              router.push(`/chat?uid=${u.uid}&nombre=${encodeURIComponent(u.nombre)}`)
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