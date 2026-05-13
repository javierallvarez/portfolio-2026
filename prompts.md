# Registro de Prompts — AI4Devs Portfolio

Este documento detalla los prompts clave utilizados durante el ciclo de vida del proyecto, demostrando el uso de IA para la especificación, arquitectura, desarrollo y aseguramiento de calidad.

---

## 1. Descripción general del producto

**Prompt 1 (Concepto y MVP):**

> Actúa como un Product Manager senior. Necesito definir un portfolio para un Software Engineer especializado en productividad. El producto debe incluir un Agente de IA "Context-Aware", un laboratorio interactivo (RAG) y herramientas de utilidad para desarrolladores. Define el alcance del MVP, los objetivos de usuario y los diferenciadores técnicos respecto a un currículum estático.

---

## 2. Arquitectura del Sistema

**Prompt 1 (Selección de Stack):**

> Diseña la arquitectura para una aplicación Next.js 16 que utilice Vercel AI SDK y una base de datos SQL Serverless. Justifica el uso de Drizzle ORM frente a Prisma para un entorno de despliegue en el Edge y explica cómo integrarías i18n nativo en la estructura de carpetas `app/[lang]`.

**Prompt 2 (Configuración de Seguridad y Edge):**

> Genera la configuración necesaria para que el endpoint de la API del Sommelier se ejecute en el "Edge Runtime". Incluye la configuración de las Safety Settings de Gemini para evitar bloqueos por contenido mal interpretado (BLOCK_NONE) y explica cómo asegurar que el streaming de datos sea eficiente.

---

## 3. Modelo de Datos

**Prompt 1 (Esquema y Normalización):**

> Actúa como un Database Architect. Genera el esquema de Drizzle para una tabla de telemetría de eventos y una tabla de vinilos para un sistema RAG. Asegúrate de que el diseño cumpla con la **Tercera Forma Normal (3FN)** y define índices B-Tree para optimizar las búsquedas por tipo de evento y ID de Discogs.

---

## 4. Especificación de la API

**Prompt 1 (Streaming Endpoint):**

> Crea la especificación para un Route Handler en Next.js que reciba un historial de mensajes y un `currentPath`. El agente debe responder con un streaming de texto usando Gemini 2.5 Flash. Documenta el contrato de entrada y el tipo de respuesta (`text/event-stream`).

---

## 5. Historias de Usuario

**Prompt 1 (Conversión de requisitos a Historias):**

> Transforma las funcionalidades de "Chatbot Contextual" y "Vinyl Sommelier" en historias de usuario siguiendo el formato "Como [rol], quiero [acción] para [beneficio]". Incluye criterios de aceptación (AC) técnicos para cada una.

---

## 6. Tickets de Trabajo

**Prompt 1 (Estructura JAG):**

> Divide la implementación de la página de CV imprimible en una serie de subtareas técnicas. Cada ticket debe incluir el impacto en i18n, la lógica de impresión de CSS (`print:`) y la actualización del Knowledge Base de la IA. Usa la nomenclatura JAG-018.

---

## 7. Pull Requests

**Prompt 1 (Definition of Done):**

> Genera una plantilla de Pull Request que incluya un checklist de "Definition of Done". El checklist debe validar: cumplimiento de accesibilidad (ARIA), paso de tests E2E en Playwright, ausencia de strings hardcodeados y soporte correcto de Dark Mode.
