"use client";

import { useEffect, useState } from "react";

export default function CompartirPage() {

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };

  }, []);

  const instalarApp = async () => {

    // ANDROID (Chrome PWA)
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }

      return;
    }

    // IOS (Safari manual)
    alert(
      "En iPhone:\nPulsa el botón compartir y luego 'Añadir a pantalla de inicio'"
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6">

      <h1 className="text-2xl font-bold mb-6 text-black">
        Instalar MiChatApp
      </h1>

      <button
        onClick={instalarApp}
        className="bg-blue-700 text-white px-6 py-3 rounded-xl"
      >
        Añadir a pantalla de inicio
      </button>

    </div>
  );
}