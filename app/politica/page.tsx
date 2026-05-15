"use client";

import { useRouter } from "next/navigation";

export default function PoliticaPage() {
  const router = useRouter();

  const textoPolitica = `
Política de Privacidad - Comunicación Interna de la Empresa

1. Información que recopilamos:
- Nombre, correo electrónico y rol dentro de la empresa.
- Horarios laborales y disponibilidad.
- Foto de perfil y avatar.
- Mensajes enviados y recibidos entre usuarios.
- Lista de contactos internos.

2. Uso de la información:
- Facilitar la comunicación interna de manera eficiente.
- Supervisión y gestión de tareas y horarios por parte de la empresa.
- Mejora de la experiencia de usuario y funcionalidades de la app.

3. Almacenamiento y seguridad:
- Todos los datos se almacenan en Firebase con autenticación segura.
- Los mensajes enviados fuera del horario laboral se guardan temporalmente en almacenamiento local.
- La información se transmite de manera cifrada entre dispositivos y servidores.
- Solo personal autorizado de la empresa tiene acceso a los datos necesarios para gestión y soporte.

4. Retención de datos:
- Mensajes en standby se eliminan automáticamente tras ser entregados.
- La empresa conserva registros de comunicación según políticas internas y normativas legales.

5. Derechos del usuario:
- Consultar, actualizar o eliminar su información personal.
- Contactar al administrador para solicitudes relacionadas con sus datos.
- Rechazar el uso de la app implica no poder enviar o recibir mensajes internos.

6. Cambios en la política:
- La empresa puede actualizar esta política. Los usuarios serán notificados de cambios relevantes.

7. Aceptación:
- Al usar la app, el usuario acepta cumplir y respetar esta política de privacidad.
`;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-blue-700 text-white p-5 text-xl font-bold">
        Política de Privacidad
      </div>

      {/* TEXTO */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="whitespace-pre-line text-black leading-7">
          {textoPolitica}
        </p>
      </div>

      {/* BOTÓN */}
      <div className="p-4">
        <button
          onClick={() => router.push("/contacto")}
          className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold"
        >
          Aceptar
        </button>
      </div>

    </div>
  );
}