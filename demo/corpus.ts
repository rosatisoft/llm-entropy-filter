// demo/corpus.ts
export type DemoCase = {
  id: string;
  label: string;
  text: string;
};

export const DEMO_CASES: DemoCase[] = [
  {
    id: "normal_help",
    label: "Normal / neutro (solicitud legítima)",
    text: "Hola, ¿me ayudas a resumir este texto y extraer los puntos principales?",
  },
  {
    id: "sales_spam",
    label: "Spam / urgencia / $$$",
    text: "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$ Haz clic aquí AHORA MISMO!!!",
  },
  {
    id: "phishing_bank",
    label: "Phishing (banco / urgencia / link)",
    text: "AVISO URGENTE: tu cuenta será BLOQUEADA hoy. Confirma tus datos en http://seguridad-banco.ejemplo/login",
  },
  {
    id: "emotional_control",
    label: "Manipulación emocional (culpa / coerción)",
    text: "Si de verdad me quisieras, harías esto. No tienes opción. Es tu culpa si algo sale mal.",
  },
  {
    id: "chain_whatsapp",
    label: "Cadena WhatsApp (alarma / conspiración vaga)",
    text: "Todos lo saben pero lo esconden. Comparte antes de que lo borren. La verdad oculta está en la cultura.",
  },
  {
    id: "simulation_claim",
    label: "Conspiración vaga / entropía alta",
    text: "Vivimos en una simulación y todos lo saben pero lo esconden. La cultura lo prueba.",
  },
  {
    id: "neutral_sales_but_ok",
    label: "Venta legítima (sin urgencia ni gritos)",
    text: "Hola, vendo lubricante industrial. Si te interesa, puedo compartir ficha técnica y precio. Gracias.",
  },
];
