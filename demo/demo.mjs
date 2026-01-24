import { runEntropyFilter } from "../dist/index.js";

const cases = [
  {
    name: "Normal / neutro",
    text: "Hola mundo. ¿Me ayudas a resumir este texto y extraer los puntos principales?"
  },
  {
    name: "Spam / urgencia / $$$",
    text: "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$ Haz clic aquí AHORA MISMO!!!"
  },
  {
    name: "Manipulación emocional",
    text: "Si de verdad me quisieras, harías esto. No tienes opción. Es tu culpa si algo sale mal."
  },
  {
    name: "Conspiración vaga / entropía alta",
    text: "Vivimos en una simulación y todos lo saben pero lo esconden. La cultura lo prueba."
  }
];

for (const c of cases) {
  console.log("\n==============================");
  console.log("CASO:", c.name);
  console.log("TEXTO:", c.text);
  console.log("RESULTADO:", JSON.stringify(runEntropyFilter(c.text), null, 2));
}
