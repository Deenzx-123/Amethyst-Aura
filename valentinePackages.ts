export type ValentineCategory = "self_love" | "couples";

export interface ValentinePackage {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  originalPrice: number;
  category: ValentineCategory;
}

export const VALENTINE_PACKAGES: ValentinePackage[] = [
  // =========================
  // 🌹 SINGLE / SELF-LOVE
  // =========================
  {
    id: "single-1",
    name: "Classic Pamper Package",
    description:
      "Classic Facial, Classic Pedicure, Classic Manicure",
    duration: "Approx. 2 hrs",
    originalPrice: 37000,
    price: 30000,
    category: "self_love",
  },
  {
    id: "single-2",
    name: "Deep Relaxation Package",
    description:
      "Deep Tissue Massage, Hydra Facial, Fruity Pedicure",
    duration: "Approx. 2 hrs",
    originalPrice: 86000,
    price: 70000,
    category: "self_love",
  },
  {
    id: "single-3",
    name: "Glow & Cleanse Package",
    description:
      "Swedish Massage, Deep Cleansing, Jelly Pedicure",
    duration: "Approx. 2 hrs",
    originalPrice: 76000,
    price: 60000,
    category: "self_love",
  },

  // =========================
  // 💕 COUPLES
  // =========================
  {
    id: "couple-1",
    name: "Classic Couples Retreat",
    description:
      "Classic Facial(two), Classic Pedicure(two), Classic Manicure(two)",
    duration: "Approx. 2.5 hrs",
    originalPrice: 74000,
    price: 64000,
    category: "couples",
  },
  {
    id: "couple-2",
    name: "Luxury Couples Retreat",
    description:
      "Deep Tissue Massage(two), Hydra Facial(two), Jelly Pedicure(two), Brightening Body Polish(two)",
    duration: "Approx. 3 hrs",
    originalPrice: 166000,
    price: 146000,
    category: "couples",
  },
  {
    id: "couple-3",
    name: "Relax & Refresh for Two",
    description:
      "Swedish Massage(two), Deep Cleansing(two), Jelly Pedicure(two)",
    duration: "Approx. 2.5 hrs",
    originalPrice: 90000,
    price: 75000,
    category: "couples",
  },
];
