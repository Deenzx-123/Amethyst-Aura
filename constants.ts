
import { Service, ServiceCategory, Testimonial } from './types';

export const SERVICES: Service[] = [
  // Massage Therapy
  { id: 'm1', name: 'Swedish Massage', price: 30000, category: ServiceCategory.MASSAGE, duration: '60 Min' },
  { id: 'm2', name: 'Swedish Massage', price: 25000, category: ServiceCategory.MASSAGE, duration: '45 Min' },
  { id: 'm3', name: 'Deep Tissue', price: 27000, category: ServiceCategory.MASSAGE, duration: '45 Min' },
  { id: 'm4', name: 'Deep Tissue', price: 32000, category: ServiceCategory.MASSAGE, duration: '60 Min' },
  { id: 'm5', name: 'Aromatherapy Massage', price: 35000, category: ServiceCategory.MASSAGE, duration: '60 Min' },
  { id: 'm6', name: 'Hot Stone Massage', price: 37000, category: ServiceCategory.MASSAGE, duration: '60 Min' },
  { id: 'm7', name: 'Peaceful Escape', price: 35000, category: ServiceCategory.MASSAGE, duration: '60 Min' },

  // Body Treatments
  { id: 'b1', name: 'Steaming', price: 10000, category: ServiceCategory.BODY },
  { id: 'b2', name: 'Brightening Body Polish', price: 55000, category: ServiceCategory.BODY },
  { id: 'b3', name: 'Coffee Body Polish', price: 40000, category: ServiceCategory.BODY },
  { id: 'b4', name: 'Hammam Scrub', price: 50000, category: ServiceCategory.BODY },
  { id: 'b5', name: 'Body Scrub', price: 30000, category: ServiceCategory.BODY },

  // Medical Grade Facial
  { id: 'f1', name: 'Basic Facial', price: 20000, category: ServiceCategory.FACIAL },
  { id: 'f2', name: 'Dermaplaning', price: 35000, category: ServiceCategory.FACIAL },
  { id: 'f3', name: 'Acneout Facial (Exclusive Deep Acne Treatment)', price: 32000, category: ServiceCategory.FACIAL },
  { id: 'f4', name: 'Vitamin-C Brightening Anti-aging', price: 32000, category: ServiceCategory.FACIAL },
  { id: 'f5', name: 'Microdermabrasion', price: 40000, category: ServiceCategory.FACIAL },
  { id: 'f6', name: 'Customized Facial Hydra Facial', price: 40000, category: ServiceCategory.FACIAL },
  { id: 'f7', name: 'Vajacial Complete Buttcial Package', price: 50000, category: ServiceCategory.FACIAL },

  // Aesthetics Treatments
  { id: 'a1', name: 'Consultation', price: 10000, category: ServiceCategory.AESTHETICS },

  {
    id: 'chemical-peel',
    name: 'Chemical Peel',
    category: ServiceCategory.AESTHETICS,
    priceType: 'variable',
    priceRange: '₦60,000 – ₦100,000',
    duration: 'Consultation Required'
  },

  {
    id: 'microneedling',
    name: 'Microneedling',
    category: ServiceCategory.AESTHETICS,
    priceType: 'variable',
    priceRange: '₦70,000 – ₦150,000',
    duration: 'Consultation Required'
  },

  { id: 'a4', name: 'Skintag Removal', price: 36000, category: ServiceCategory.AESTHETICS },

  {
    id: 'teeth-whitening-single',
    name: 'Teeth Whitening (Per Session)',
    category: ServiceCategory.AESTHETICS,
    price: 30000,
    duration: '1 Session'
  },

  {
    id: 'teeth-whitening-3',
    name: 'Teeth Whitening (3 Sessions)',
    category: ServiceCategory.AESTHETICS,
    price: 80000,
    duration: '3 Sessions'
  },

  // Waxing & Brows
  { id: 'w1', name: 'Eyebrow', price: 4000, category: ServiceCategory.WAXING },
  { id: 'w2', name: 'Underarm', price: 5000, category: ServiceCategory.WAXING },
  { id: 'w3', name: 'Chin', price: 5000, category: ServiceCategory.WAXING },
  { id: 'w4', name: 'Face', price: 8000, category: ServiceCategory.WAXING },
  { id: 'w5', name: 'Half Arm (Elbow - Wrist)', price: 7000, category: ServiceCategory.WAXING },
  { id: 'w6', name: 'Full Arm (Shoulder - Wrist)', price: 10000, category: ServiceCategory.WAXING },
  { id: 'w7', name: 'Half Leg (Knee - Ankle)', price: 10000, category: ServiceCategory.WAXING },
  { id: 'w8', name: 'Full Leg (Thighs - Ankle)', price: 20000, category: ServiceCategory.WAXING },
  { id: 'w9', name: 'Neathers', price: 15000, category: ServiceCategory.WAXING },
  { id: 'w10', name: 'Full Body Wax', price: 40000, category: ServiceCategory.WAXING },

  // Hands
  { id: 'h1', name: 'Regular Polish', price: 3000, category: ServiceCategory.HANDS },
  { id: 'h2', name: 'Gel Polish', price: 4000, category: ServiceCategory.HANDS },
  { id: 'h3', name: 'Manicure', price: 5000, category: ServiceCategory.HANDS },
  { id: 'h4', name: 'Manicure (with gel polish)', price: 6000, category: ServiceCategory.HANDS },
  { id: 'h5', name: 'Kiddies Manicure', price: 1500, category: ServiceCategory.HANDS },

  // Feet
  { id: 'fe1', name: 'Regular Polish', price: 1500, category: ServiceCategory.FEET },
  { id: 'fe2', name: 'Gel Polish', price: 3000, category: ServiceCategory.FEET },
  { id: 'fe3', name: 'Regular Pedicure', price: 12000, category: ServiceCategory.FEET },
  { id: 'fe4', name: 'Jelly Pedicure', price: 14000, category: ServiceCategory.FEET },
  { id: 'fe5', name: 'Herbal Pedicure', price: 14000, category: ServiceCategory.FEET },
  { id: 'fe6', name: 'Kiddies Pedicure (5-14 years)', price: 3000, category: ServiceCategory.FEET }
];

export const HMO_PARTNERS = [
  { name: 'Reliance Health', logo: '/reliance.jpg' },
  { name: 'Hygeia HMO', logo: '/Hygeia.jpg' },
  { name: 'AXA Mansard', logo: '/AXA.webp' },
  { name: 'Leadway Health', logo: '/leadway.png' }
];

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Sarah Jenkins', text: 'Absolutely relaxing.', role: 'Happy Client', rating: 5 },
  { id: 2, name: 'David Adeleke', text: 'Professional service.', role: 'Returning Client', rating: 5 },
  { id: 3, name: 'Chinelo Okoro', text: 'The facial treatments are divine.', role: 'Beauty Enthusiast', rating: 4 }
];

export const SPA_CONTACT = {
  address: 'J9H2+4X2, Plot 6 Acme Rd, Ogba, Ikeja, Lagos',
  googleMapsLink: 'https://www.google.com/maps/place/Amethyst+aura+Aesthetics+spa/',
  phones: ['+234 904 402 4821', '+234 806 940 5450'],
  email: 'amethystauramedspa26@gmail.com',
  hours: 'Monday – Sunday, 9:00 AM – 8:00 PM'
};
