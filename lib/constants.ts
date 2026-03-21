import type { DeliveryMethod, DonationCategory } from "@/lib/types";

// Traducciones y descripciones para las formas de entrega
export const deliveryMethodTranslations: Record<
  DeliveryMethod,
  { label: string; description: string }
> = {
  pickup: {
    label: "Retiro en domicilio",
    description:
      "La institución se encarga de retirar la donación por el domicilio que se tiene registrado del donante",
  },
  shipment: {
    label: "Envío a institución",
    description:
      "El donante lleva la donación a la institución por su propios medios",
  },
  agreement: {
    label: "Acuerdo con institución",
    description:
      "El donante y la institución acuerdan una forma de entrega especial (cargas grandes, otro)",
  },
  transfer: {
    label: "Transferencia bancaria",
    description:
      "La donación se realiza mediante transferencia bancaria. El comprobante adjunto sirve como constancia.",
  },
};

// Traducciones y descripciones para las categorías
export const categoryTranslations: Record<
  DonationCategory,
  { label: string; description: string }
> = {
  supplies: {
    label: "Herramientas, útiles o materiales",
    description:
      "Ejemplos: útiles escolares (cuadernos, lápices, mochilas), herramientas de construcción (martillos, destornilladores, tornillos), materiales de oficina (papel, carpetas, bolígrafos), materiales de limpieza (detergentes, escobas, trapos), etc.",
  },
  clothing: {
    label: "Ropa, abrigos o accesorios",
    description:
      "Ejemplos: ropa de abrigo (camperas, bufandas, guantes), calzado (zapatos, botas, zapatillas), ropa de cama (sábanas, mantas, almohadas), accesorios (cinturones, carteras, gorros), ropa de todas las edades y talles, etc.",
  },
  food: {
    label: "Alimentos",
    description:
      "Ejemplos: alimentos no perecederos (arroz, fideos, legumbres), productos enlatados (atún, tomate, maíz), productos de limpieza e higiene personal (jabón, shampoo, pasta dental), productos para bebés (leche en polvo, pañales), etc.",
  },
  other: {
    label: "Otra",
    description:
      "Para donaciones que no encajan en las categorías anteriores. Ejemplos: muebles, electrodomésticos, juguetes, libros, medicamentos (con receta), equipamiento médico, etc.",
  },
};
