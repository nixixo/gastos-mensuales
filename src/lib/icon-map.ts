import type { IconType } from "react-icons";
import {
  SiSpotify,
  SiNetflix,
  SiYoutube,
  SiUber,
  SiSteam,
  SiApple,
  SiGoogle,
  SiHbo,
  SiTwitch,
  SiPlaystation,
  SiGithub,
  SiCrunchyroll,
} from "react-icons/si";
import {
  LuShoppingCart,
  LuUtensilsCrossed,
  LuCar,
  LuHouse,
  LuHeart,
  LuDumbbell,
  LuShirt,
  LuPhone,
  LuWifi,
  LuGraduationCap,
  LuPlane,
  LuCoffee,
  LuCircleDollarSign,
  LuMusic,
  LuFilm,
  LuBus,
  LuDroplets,
  LuZap,
  LuPill,
  LuBaby,
  LuPawPrint,
  LuScissors,
  LuWrench,
  LuGift,
  LuGamepad2,
  LuPenTool,
  LuTv,
  LuPackage,
} from "react-icons/lu";

export interface IconEntry {
  icon: IconType;
  label: string;
  keywords: string[];
  category: "brand" | "general";
  color?: string;
}

export const ICON_MAP: Record<string, IconEntry> = {
  // Brands
  spotify: {
    icon: SiSpotify,
    label: "Spotify",
    keywords: ["spotify"],
    category: "brand",
    color: "#1DB954",
  },
  netflix: {
    icon: SiNetflix,
    label: "Netflix",
    keywords: ["netflix"],
    category: "brand",
    color: "#E50914",
  },
  amazon: {
    icon: LuPackage,
    label: "Amazon",
    keywords: ["amazon", "prime"],
    category: "brand",
    color: "#FF9900",
  },
  youtube: {
    icon: SiYoutube,
    label: "YouTube",
    keywords: ["youtube"],
    category: "brand",
    color: "#FF0000",
  },
  uber: {
    icon: SiUber,
    label: "Uber",
    keywords: ["uber"],
    category: "brand",
    color: "#FFFFFF",
  },
  steam: {
    icon: SiSteam,
    label: "Steam",
    keywords: ["steam"],
    category: "brand",
    color: "#1B2838",
  },
  disney: {
    icon: LuTv,
    label: "Disney+",
    keywords: ["disney"],
    category: "brand",
    color: "#113CCF",
  },
  apple: {
    icon: SiApple,
    label: "Apple",
    keywords: ["apple", "icloud"],
    category: "brand",
    color: "#FFFFFF",
  },
  google: {
    icon: SiGoogle,
    label: "Google",
    keywords: ["google"],
    category: "brand",
    color: "#4285F4",
  },
  adobe: {
    icon: LuPenTool,
    label: "Adobe",
    keywords: ["adobe", "photoshop", "illustrator"],
    category: "brand",
    color: "#FF0000",
  },
  hbo: {
    icon: SiHbo,
    label: "HBO",
    keywords: ["hbo", "max"],
    category: "brand",
    color: "#B432E8",
  },
  twitch: {
    icon: SiTwitch,
    label: "Twitch",
    keywords: ["twitch"],
    category: "brand",
    color: "#9146FF",
  },
  playstation: {
    icon: SiPlaystation,
    label: "PlayStation",
    keywords: ["playstation", "psn", "ps plus"],
    category: "brand",
    color: "#003791",
  },
  xbox: {
    icon: LuGamepad2,
    label: "Xbox",
    keywords: ["xbox", "game pass"],
    category: "brand",
    color: "#107C10",
  },
  github: {
    icon: SiGithub,
    label: "GitHub",
    keywords: ["github"],
    category: "brand",
    color: "#FFFFFF",
  },
  nintendo: {
    icon: LuGamepad2,
    label: "Nintendo",
    keywords: ["nintendo", "switch"],
    category: "brand",
    color: "#E60012",
  },
  crunchyroll: {
    icon: SiCrunchyroll,
    label: "Crunchyroll",
    keywords: ["crunchyroll"],
    category: "brand",
    color: "#F47521",
  },

  // General categories
  food: {
    icon: LuUtensilsCrossed,
    label: "Comida",
    keywords: ["comida", "restaurant", "almuerzo", "cena", "desayuno", "food"],
    category: "general",
  },
  coffee: {
    icon: LuCoffee,
    label: "Cafe",
    keywords: ["cafe", "coffee", "starbucks"],
    category: "general",
  },
  shopping: {
    icon: LuShoppingCart,
    label: "Compras",
    keywords: ["compra", "super", "mercado", "tienda", "shopping", "mall"],
    category: "general",
  },
  transport: {
    icon: LuCar,
    label: "Transporte",
    keywords: ["auto", "bencina", "gasolina", "estacionamiento", "tag"],
    category: "general",
  },
  bus: {
    icon: LuBus,
    label: "Transporte publico",
    keywords: ["bus", "metro", "micro", "bip"],
    category: "general",
  },
  home: {
    icon: LuHouse,
    label: "Hogar",
    keywords: ["arriendo", "alquiler", "hogar", "casa", "depto"],
    category: "general",
  },
  health: {
    icon: LuHeart,
    label: "Salud",
    keywords: ["salud", "doctor", "medico", "clinica", "hospital", "isapre", "fonasa"],
    category: "general",
  },
  pharmacy: {
    icon: LuPill,
    label: "Farmacia",
    keywords: ["farmacia", "remedio", "medicina", "pastilla"],
    category: "general",
  },
  gym: {
    icon: LuDumbbell,
    label: "Gym",
    keywords: ["gym", "gimnasio", "deporte", "fitness"],
    category: "general",
  },
  clothing: {
    icon: LuShirt,
    label: "Ropa",
    keywords: ["ropa", "zapato", "zapatilla", "vestir"],
    category: "general",
  },
  phone: {
    icon: LuPhone,
    label: "Telefono",
    keywords: ["telefono", "celular", "movil", "plan"],
    category: "general",
  },
  internet: {
    icon: LuWifi,
    label: "Internet",
    keywords: ["internet", "wifi", "fibra"],
    category: "general",
  },
  electricity: {
    icon: LuZap,
    label: "Electricidad",
    keywords: ["luz", "electricidad", "electrica", "enel"],
    category: "general",
  },
  water: {
    icon: LuDroplets,
    label: "Agua",
    keywords: ["agua", "aguas andinas"],
    category: "general",
  },
  education: {
    icon: LuGraduationCap,
    label: "Educacion",
    keywords: ["universidad", "colegio", "curso", "educacion", "matricula"],
    category: "general",
  },
  travel: {
    icon: LuPlane,
    label: "Viaje",
    keywords: ["viaje", "vuelo", "avion", "hotel", "booking"],
    category: "general",
  },
  music: {
    icon: LuMusic,
    label: "Musica",
    keywords: ["musica", "music"],
    category: "general",
  },
  entertainment: {
    icon: LuFilm,
    label: "Entretencion",
    keywords: ["cine", "pelicula", "entretencion", "entrada"],
    category: "general",
  },
  baby: {
    icon: LuBaby,
    label: "Bebe",
    keywords: ["bebe", "panal", "guagua"],
    category: "general",
  },
  pet: {
    icon: LuPawPrint,
    label: "Mascota",
    keywords: ["mascota", "perro", "gato", "veterinario"],
    category: "general",
  },
  haircut: {
    icon: LuScissors,
    label: "Peluqueria",
    keywords: ["peluqueria", "corte", "barberia"],
    category: "general",
  },
  repairs: {
    icon: LuWrench,
    label: "Reparaciones",
    keywords: ["reparacion", "arreglo", "mecanico", "tecnico"],
    category: "general",
  },
  gift: {
    icon: LuGift,
    label: "Regalo",
    keywords: ["regalo", "gift"],
    category: "general",
  },
  other: {
    icon: LuCircleDollarSign,
    label: "Otro",
    keywords: [],
    category: "general",
  },
};

export function detectIcon(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (!lower) return null;

  for (const [key, entry] of Object.entries(ICON_MAP)) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return key;
    }
  }
  return null;
}

export const BRAND_ICONS = Object.entries(ICON_MAP).filter(
  ([, e]) => e.category === "brand"
);

export const GENERAL_ICONS = Object.entries(ICON_MAP).filter(
  ([, e]) => e.category === "general"
);
