export enum ServiceCategory {
  FACIALS = "Facials",
  MASSAGES = "Massages",
  BODY = "Body Treatments",
  SPECIALS = "Service Specials",
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price?: number;                     // optional for variable services
  priceType?: "fixed" | "variable";   // optional but used
  priceRange?: string;
  duration?: string;
}

export enum ServiceCategory {
  MASSAGE = 'Massage Therapy',
  FACIAL = 'Medical Grade Facial',
  BODY = 'Body Treatments',
  AESTHETICS = 'Aesthetics Treatments',
  WAXING = 'Waxing & Brows',
  HANDS = 'Hands',
  FEET = 'Feet'
}

export interface Appointment {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  services: Service[];
  totalPrice: number | null;   // ✅ THIS WAS WRONG BEFORE
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  role: string;
  rating: number;
}
