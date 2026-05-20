"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
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
  const [pressTimer, setPressTimer] =
    useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const uid = auth.currentUser?.uid;

  const CONTACTOS_KEY = `CONTACTOS_GUARDADOS_${uid}`;

  // 🔹 Obtener imagen
  const obtenerImagen = (foto?: string) => {
    if (!foto) return null;

    if (foto.startsWith("/9j/") || foto.length > 100) {
      return `data:image/jpeg;base64,${foto}`;
    }

    return foto;
  };

  // 🔹 Init
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.push("/");
      return;
    }

    cargarUsuario(user.uid);
    cargarContactos(user.uid);
  }, []);

  // 🔹 Parse fecha
  const parseFecha = (fechaStr: string) => {
    const partes = fechaStr.split("/");

    return new Date(
      parseInt(partes[2]),
      parseInt(partes[1]) - 1,
      parseInt(partes[0])
    );
  };

  // 🔹 Cargar usuario actual
  const cargarUsuario = async (uid: string) => {
    const snapshot = await get(ref(db, `usuarios/${uid}`));

    if (snapshot.exists()) {
      setUsuarioActual({
        uid,
        nombre: snapshot.val().nombre,
      });
    }
  };

  // 🔹 Cargar contactos
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

  // 🔹 Guardar contactos
  const guardarContactos = (lista: Usuario[]) => {
    const soloUIDs = lista.map((u) => ({
      uid: u.uid,
    }));

    localStorage.setItem(
      CONTACTOS_KEY,
      JSON.stringify(soloUIDs)
    );
  };

  // 🔹 Buscar usuario
  const buscarUsuario = async () => {
    if (!busqueda.trim()) return;

    const q = query(
      ref(db, "usuarios"),
      orderByChild("nombre"),
      equalTo(busqueda)
    );

    const snapshot = await get(q);

    let encontrado: Usuario | null = null;

    snapshot.forEach((child) => {
      if (child.key !== uid) {
        const data = child.val();

        let estaDeVacaciones = false;

        if (data.vacacionesInicio && data.vacacionesFinal) {
          const hoy = new Date();

          const inicio = parseFecha(data.vacacionesInicio);
          const fin = parseFecha(data.vacacionesFinal);

          if (hoy >= inicio && hoy <= fin) {
            estaDeVacaciones = true;
          }
        }

        encontrado = {
          uid: child.key!,
          nombre: data.nombre,
          fotoUrl: data.fotoUrl,
          horaInicio: data.horaInicio,
          horaFinal: data.horaFinal,
          estaDeVacaciones,
        };
      }
    });

    if (!encontrado) {
  const email = prompt(
    "Usuario no encontrado.\n\nIntroduce un correo para enviar invitación:"
  );

  if (!email) return;

  const asunto = encodeURIComponent(
    "Invitación a MiChatApp"
  );

  const mensaje = encodeURIComponent(
    <h1>TEST CAMBIO VERCEL</h1>
    `Hola,

Te invito a usar MiChatApp para comunicarte conmigo.

Descarga o abre la app aquí:
https://curro-chat-nu.vercel.app/

¡Nos vemos dentro!`
  );

  window.open(
  `mailto:${email}?subject=${asunto}&body=${mensaje}`,
  "_self"
);

  return;
}

    if (usuarios.find((u) => u.uid === encontrado!.uid)) {
      alert("Ya existe");
      return;
    }

    const nueva = [...usuarios, encontrado];

    setUsuarios(nueva);

    guardarContactos(nueva);

    setBusqueda("");
  };

  // 🔹 Eliminar contacto
  const eliminarContacto = (uidContacto: string) => {
    if (!confirm("¿Eliminar contacto?")) return;

    const nueva = usuarios.filter(
      (u) => u.uid !== uidContacto
    );

    setUsuarios(nueva);

    guardarContactos(nueva);
  };

  // 🔹 Long press
  const handlePressStart = (uid: string) => {
    const timer = setTimeout(() => {
      eliminarContacto(uid);
    }, 700);

    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  // 🔹 Navegación
  const irPerfil = () => {
    setMenuAbierto(false);
    router.push("/perfil");
  };

  const irCompartir = () => {
  setMenuAbierto(false);

  router.push("/compartir");
};

  const irMensajes = () => {
    setMenuAbierto(false);
    router.push("/guardados");
  };

  const irPolitica = () => {
    setMenuAbierto(false);
    router.push("/politica");
  };

  // 🔹 Logout
  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-blue-700 text-white p-4 rounded-xl mb-4 relative">

        <div>
          <p className="text-sm">
            Usuario:
          </p>

          <p className="font-bold">
            {usuarioActual?.nombre}
          </p>
        </div>

        {/* MENU */}
        <button
          onClick={() =>
            setMenuAbierto(!menuAbierto)
          }
          className="text-2xl"
        >
          ☰
        </button>

        {/* DROPDOWN */}
        {menuAbierto && (
          <div className="absolute right-4 top-16 bg-white text-black rounded-xl shadow-lg w-56 overflow-hidden z-50">

            <button
              onClick={irMensajes}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Mensajes guardados
            </button>

            <button
              onClick={irPerfil}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Perfil
            </button>
            
            <button
              onClick={irCompartir}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              Compartir / Instalar app
            </button>

            <button
              onClick={irPolitica}
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
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
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
                `/chat?uid=${u.uid}&nombre=${encodeURIComponent(
                  u.nombre
                )}&horaInicio=${u.horaInicio}&horaFinal=${u.horaFinal}`
              )
            }
            onMouseDown={() =>
              handlePressStart(u.uid)
            }
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={() =>
              handlePressStart(u.uid)
            }
            onTouchEnd={handlePressEnd}
            className="flex items-center gap-3 bg-white p-4 rounded-xl shadow cursor-pointer text-black"
          >

            {/* FOTO */}
            {u.fotoUrl ? (
              <img
                src={
                  obtenerImagen(u.fotoUrl) || ""
                }
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                {u.nombre.charAt(0)}
              </div>
            )}

            {/* INFO */}
            <div>

              <p className="font-bold">
                {u.nombre}
              </p>

              <p className="text-sm text-gray-500">
                {u.estaDeVacaciones
                  ? "Vacaciones"
                  : `${u.horaInicio} - ${u.horaFinal}`}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}