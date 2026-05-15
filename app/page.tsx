"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegistre=async () =>{
    try{
      router.push("/register");
    }catch (error: any) {
      console.error("❌ Error login:", error);
      alert("Error al cambiar de pagina.");
    }
  };

  const handleLogin = async () => {
    console.log("🟡 Click en login detectado");
    if (!email || !password) {
      alert("Ingrese email y contraseña");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ Login correcto");

      router.push("/contacto");

    } catch (error: any) {
      console.error("❌ Error login:", error);
      alert("Error al iniciar sesión");
    }
  };

  // 🔥 ESTO FALTABA
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[350px]">

        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Iniciar Sesión
        </h1>

        <input
          type="email"
          placeholder="Usuario"
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
          type="button"
          onClick={handleLogin}
          className="w-full p-3 bg-blue-700 text-white rounded-xl mb-3"
        >
        Iniciar Sesión
        </button>
        <button
  type="button"
  onClick={handleRegistre}
  className="w-full p-3 bg-blue-700 text-white rounded-xl mb-3"
>
  Crear Cuenta
</button>

      </div>
    </div>
  );
}