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

    // ANDROID (PWA install)
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }

      return;
    }

    // IOS fallback
    alert(
      "En iPhone:\n\n1. Abre Safari\n2. Pulsa compartir\n3. 'Añadir a pantalla de inicio'"
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6 text-black flex flex-col items-center">

      <h1 className="text-2xl font-bold mb-4">
        Compartir / Instalar App
      </h1>

      {/* INFO ANDROID */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 w-full max-w-md">
        <h2 className="font-bold text-lg mb-2">
          📱 Android (Chrome)
        </h2>

        <ol className="list-decimal ml-5 text-sm space-y-1">
          <li>Abre la web en Chrome</li>
          <li>Toca el menú (⋮)</li>
          <li>“Añadir a pantalla de inicio”</li>
          <li>Confirma</li>
        </ol>
      </div>

      {/* INFO IOS */}
      <div className="bg-white p-4 rounded-xl shadow w-full max-w-md">
        <h2 className="font-bold text-lg mb-2">
          🍎 iPhone (Safari)
        </h2>

        <ol className="list-decimal ml-5 text-sm space-y-1">
          <li>Abre Safari</li>
          <li>Botón compartir ⬆️</li>
          <li>“Añadir a pantalla de inicio”</li>
          <li>Confirmar</li>
        </ol>
      </div>

    </div>
  );
}