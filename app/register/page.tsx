"use client";

import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleVolver = () => {
    router.push("/");
  };

  const handleRegistro = async () => {
    if (!email || !password) {
      alert("Ingrese email y contraseña");
      return;
    }

    try {
      // 🔹 Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;


      await set(ref(db, "usuarios/" + uid), {
        nombre: email,
        rol: 2,
      });

      console.log("✅ Usuario creado:", uid);

      alert("Cuenta creada correctamente");

      // 🔹 Redirigir al chat
      router.push("/contacto");

    } catch (error: any) {
      console.error("❌ Error registro:", error);

      if (error.code === "auth/email-already-in-use") {
        alert("El email ya está en uso");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña debe tener al menos 6 caracteres");
      } else if (error.code === "auth/invalid-email") {
        alert("Email inválido");
      } else {
        alert("Error al registrar usuario");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[350px]">

        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Crear Cuenta
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-gray-100 text-black"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-gray-100 text-black"
        />

        <button
          onClick={handleRegistro}
          className="w-full p-3 bg-blue-700 text-white rounded-xl mb-3"
        >
          Registrarse
        </button>

        <button
          onClick={handleVolver}
          className="w-full p-3 bg-gray-400 text-white rounded-xl"
        >
          Volver a Inicio
        </button>

      </div>
    </div>
  );
}