"use client";

import { Suspense } from "react";
import ChatContenido from "./ChatContenido";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Cargando chat...</div>}>
      <ChatContenido />
    </Suspense>
  );
}