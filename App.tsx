import ValentinePopup from "./components/ValentinePopup";
import heroImage from "./assets/hero.jpg";
import { supabase } from "./supabase";

import { Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, MapPin, Heart, ArrowRight,
  Plus, Trash2, CheckCircle, Calendar as CalendarIcon,
  Phone, Mail, Instagram,
  Clock, Sparkles, ShieldCheck, ShoppingBag, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { SERVICES as INITIAL_SERVICES, SPA_CONTACT, HMO_PARTNERS } from './constants';
import { ServiceCategory, Service, Appointment } from './types';
import Logo from './components/Logo';

const VALENTINE_SERVICES: Service[] = [
  {
    id: "val-crystal-radiance",
    name: "Crystal Radiance (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 61000,
    duration: "Swedish Massage • Brightening Facial • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-glow-crush",
    name: "Glow Crush Treatments (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 90000,
    duration: "Deep Tissue Massage • Body Polish & Wrap • Dermaplaning Facial",
    priceType: "fixed",
  },
  {
    id: "val-harmony-escape",
    name: "Harmony Escape (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 74000,
    duration: "Swedish Massage • Microdermabrasion • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-elite-signature",
    name: "Elite Signature (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 66000,
    duration: "Deep Tissue Massage • Acneout Facial • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-tranquil-touch",
    name: "Tranquil Touch (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 40000,
    duration: "Swedish Massage • Regular Facial",
    priceType: "fixed",
  },
  {
    id: "val-luxe",
    name: "Luxe (Valentine)",
    category: ServiceCategory.SPECIALS,
    price: 54000,
    duration: "Swedish Massage • Jelly Pedicure • Basic Facial",
    priceType: "fixed",
  },
];


const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [services, setServices] = useState<Service[]>([
  ...INITIAL_SERVICES,
  ...VALENTINE_SERVICES,
]);

  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [showConsultationPopup, setShowConsultationPopup] = useState(false);
  const [consultService, setConsultService] = useState<Service | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isBookingVisible, setIsBookingVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [viewDate, setViewDate] = useState(new Date());

  // Background Scroll Locking
  useEffect(() => {
    if (isMenuOpen || isBookingVisible || showConsultationPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen, isBookingVisible, showConsultationPopup]);

  // Load Bookings & Services
  const loadBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading bookings:", error);
      return;
    }

    const mappedBookings: Appointment[] = (data ?? []).map((b: any) => ({
      id: b.id,
      customerName: b.customer_name,
      email: b.email,
      phone: b.phone,
      services: b.services ?? [],
      totalPrice: b.total_price ?? 0,
      date: b.date,
      time: b.time,
      status: b.status,
      createdAt: b.created_at
    }));

    setBookings(mappedBookings);
  };

  useEffect(() => {
    loadBookings();
    const savedServices = localStorage.getItem("aura_services");
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_services', JSON.stringify(services));
  }, [services]);

  // Calendar Helpers
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSelectedDay = (date: Date) => {
    if (!bookingDate) return false;
    const [y, m, d] = bookingDate.split('-').map(Number);
    return date.getDate() === d && date.getMonth() === (m - 1) && date.getFullYear() === y;
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectDate = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    setBookingDate(`${y}-${m}-${d}`);
    setIsCalendarOpen(false);
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    let currentMinutes = 9 * 60; 
    const endMinutes = 20 * 60; 
    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const period = hour >= 12 ? 'PM' : 'AM';
      let h12 = hour % 12;
      h12 = h12 === 0 ? 12 : h12;
      const mStr = minute === 0 ? '00' : minute.toString().padStart(2, '0');
      slots.push(`${h12}:${mStr} ${period}`);
      currentMinutes += 90; 
    }
    return slots;
  }, []);

  // Scroll Handling
  useEffect(() => {
    const handleScroll = () => {
      const desktopScroll = scrollContainerRef.current?.scrollTop || 0;
      const mobileScroll = window.scrollY;
      const currentScroll = window.innerWidth < 1024 ? mobileScroll : desktopScroll;
      setIsScrolled(currentScroll > 50);
    };
    const container = scrollContainerRef.current;
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (container) container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const hasVariableService = useMemo(() => selectedServices.some(s => s.priceType === "variable"), [selectedServices]);
  const totalPrice = useMemo(() => hasVariableService ? 0 : selectedServices.reduce((sum, s) => sum + (s.price ?? 0), 0), [selectedServices, hasVariableService]);

  const toggleService = (service: Service) => {
    if (service.priceType === "variable") {
      setConsultService(service);
      setShowConsultationPopup(true);
      return;
    }
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
      if (window.innerWidth >= 1024) setIsBookingVisible(true);
    }
  };

  // CORE FIX: Reverting to your original logic flow but keeping the new data
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !bookingDate || !bookingTime) return;
    
    setIsSyncing(true);

    // Clean services for DB insertion (removes React-specific hidden props)
    const dbServices = selectedServices.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration
    }));

    const { error } = await supabase
      .from("bookings")
      .insert([{
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        services: dbServices,
        total_price: totalPrice,
        date: bookingDate,
        time: bookingTime,
        status: "pending"
      }]);

    if (error) {
      console.error("Booking failed:", error);
      alert("Submission error. Please check your network.");
      setIsSyncing(false);
      return;
    }

    // Refresh the list so the Admin view is updated
    await loadBookings();
    
    setIsBookingSuccess(true);
    setIsSyncing(false);
  };

  const resetBooking = () => {
    setSelectedServices([]);
    setBookingDate('');
    setBookingTime('');
    setFormData({ name: '', email: '', phone: '' });
    setIsBookingSuccess(false);
    setIsBookingVisible(false);
    setIsCalendarOpen(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
      } else {
        scrollContainerRef.current?.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
      }
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'HMO Partners', href: '#hmo' },
  { name: 'Experience', href: '#experience' },
  { name: 'Contact', href: '#contact' },
];

const orderedCategories = [
  ServiceCategory.SPECIALS,
  ...Object.values(ServiceCategory).filter(
    c => c !== ServiceCategory.SPECIALS
  ),
];


  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <Admin
            services={services}
            bookings={bookings}
            setServices={setServices}
            setBookings={setBookings}
          />
        }
      />
      <Route path="/" element={
        <div className="relative min-h-screen lg:h-screen bg-aura-bone flex flex-col lg:flex-row font-sans lg:overflow-hidden">
	<ValentinePopup />
          
          {/* MOBILE NAVBAR */}
          <nav className={`lg:hidden fixed top-0 w-full z-[200] transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-xl border-b border-aura-beige/20 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo className="w-8 h-8" color={(isScrolled || isMenuOpen) ? "#1A1A1A" : "#FFFFFF"} />
                <h1 className={`text-lg font-serif font-black tracking-widest uppercase ${(isScrolled || isMenuOpen) ? 'text-aura-charcoal' : 'text-white'}`}>Aura</h1>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsBookingVisible(true)} className="bg-aura-gold text-white text-[9px] font-black px-4 py-2.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-2">
                  <ShoppingBag size={12} /> {selectedServices.length > 0 ? `(${selectedServices.length})` : 'BOOK'}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isMenuOpen ? 'text-aura-charcoal' : (isScrolled ? 'text-aura-charcoal' : 'text-white')}>
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </nav>

          {/* MOBILE MENU SIDEBAR */}
          <div className={`lg:hidden fixed inset-0 z-[150] transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <div className={`absolute top-0 right-0 w-[75%] h-full bg-white shadow-2xl transition-transform duration-500 flex flex-col pt-32 px-10 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex flex-col gap-8 text-right">
                {navLinks.map((link, idx) => (
                  <a key={link.name} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className="text-2xl font-bold text-aura-charcoal/40 hover:text-aura-gold uppercase tracking-widest">
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col min-w-0 transition-all duration-700">
            {/* DESKTOP NAVBAR */}
<nav className={`hidden lg:flex absolute top-0 left-0 right-0 z-[100] transition-all duration-700 items-center justify-between px-16 py-8 ${isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-aura-beige/10 py-4 shadow-aura-subtle' : 'bg-transparent'}`}>
  <div className="flex items-center gap-4 group cursor-pointer" onClick={() => scrollContainerRef.current?.scrollTo({top: 0, behavior: 'smooth'})}>
    <Logo className="w-9 h-9" color={isScrolled ? "#1A1A1A" : "#FFFFFF"} />
    <div className="flex flex-col">
      <span className={`text-base font-serif font-black tracking-widest uppercase ${isScrolled ? 'text-aura-charcoal' : 'text-white'}`}>Amethyst Aura</span>
      <span className="text-[9px] font-black tracking-[0.3em] uppercase text-aura-gold">Aesthetics Spa</span>
    </div>
  </div>
  <div className="flex items-center gap-8">
    {navLinks.map(link => (
      <a key={link.name} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className={`text-[10px] font-black uppercase tracking-[0.3em] ${isScrolled ? 'text-aura-charcoal/60 hover:text-aura-charcoal' : 'text-white/60 hover:text-white'}`}>
        {link.name}
      </a>
    ))}
    <button onClick={() => setIsBookingVisible(true)} className="text-[9px] font-black px-8 py-3.5 rounded-full uppercase tracking-[0.2em] bg-white text-aura-charcoal hover:bg-aura-gold hover:text-white transition-all shadow-xl">
      {selectedServices.length > 0 ? `(${selectedServices.length}) COMPLETE` : 'RESERVE NOW'}
    </button>
  </div>
</nav>

            <div ref={scrollContainerRef} className="flex-1 lg:overflow-y-auto custom-scrollbar overflow-x-hidden relative">
              {/* HERO */}
              <section className="relative h-screen flex items-center lg:items-start overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                  <img src={heroImage} className="w-full h-full object-cover opacity-70" alt="Spa Haven" />
                </div>
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="relative z-20 container mx-auto px-8 lg:px-24">
                  <div className="max-w-4xl space-y-8 lg:mt-[32vh]">
                    <h2 className="text-5xl lg:text-[6.5rem] font-serif text-white leading-[0.85] tracking-tighter">
                      Pure<span className="text-aura-gold italic ml-2">Stillness.</span>
                    </h2>
                    <p className="text-lg lg:text-xl text-white font-light leading-relaxed max-w-lg">
                      An architectural response to the noise of the world. Curated therapies designed to reset your biological rhythm.
                    </p>
                    <button
  onClick={(e) => scrollToSection(e as any, '#services')}
  className="group bg-aura-gold text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3"
>
  Book Your Ritual
  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
</button>

                  </div>
                </div>
              </section>

              {/* PHILOSOPHY & OTHER SECTIONS REMAIN EXACTLY THE SAME */}
              <section id="philosophy" className="py-40 px-8 lg:px-20 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                  <div className="space-y-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-aura-gold">Our Ethos</span>
                    <h3 className="text-5xl font-serif text-aura-charcoal leading-snug">Precision meets mineral wisdom.</h3>
                    <p className="text-lg text-aura-slate font-light leading-relaxed">At Amethyst Aura, we transcend traditional wellness. Our sanctuary is a clinical response to a loud world.</p>
                  </div>
                  <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1000" className="rounded-[3rem] shadow-aura-elevated" alt="Spa" />
                </div>
              </section>

              <section id="hmo" className="py-40 px-8 lg:px-20 bg-aura-bone">
                <div className="max-w-7xl mx-auto">
                  <h3 className="text-6xl font-serif text-aura-charcoal mb-16">Supported <span className="italic text-aura-gold">Providers.</span></h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {HMO_PARTNERS.map((hmo) => (
                      <div key={hmo.name} className="flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] shadow-aura-elevated aspect-square">
                        <img src={hmo.logo} alt={hmo.name} className="w-24 h-24 object-contain mb-6"/>
                        <p className="text-[9px] font-black uppercase tracking-widest text-aura-charcoal">{hmo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="experience" className="py-40 px-8 lg:px-20 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-24 items-center">
                  <div className="space-y-12">
                    <h3 className="text-6xl font-serif text-aura-charcoal">Follow Our <span className="italic text-aura-gold">Stillness.</span></h3>
                    <a href="https://instagram.com/amethystsaura" target="_blank" className="inline-flex items-center gap-4 bg-aura-charcoal text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <Instagram size={16} /> @amethystsaura
                    </a>
                  </div>
                  <div className="relative w-full max-w-[360px] aspect-[9/16] bg-aura-bone rounded-[3.5rem] p-3 shadow-2xl border border-aura-gold/10 overflow-hidden">
                    <iframe src="https://www.instagram.com/amethystsaura/embed/" className="w-full h-full rounded-[2.8rem] border-none" scrolling="no"></iframe>
                  </div>
                </div>
              </section>

              <section id="services" className="py-40 px-8 lg:px-20 bg-white">
                <h3 className="text-6xl font-serif text-center mb-24">Treatment Menu</h3>
		<p className="text-center text-gray-500 mb-16">
  Including our limited Valentine’s Package Offers 💕
</p>
                <div className="space-y-32">
                  {orderedCategories.map((cat) => {
                    const categoryServices = services.filter(s => s.category === cat);
                    if (categoryServices.length === 0) return null;
                    return (
                      <div key={cat}>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-aura-gold mb-12 text-center">{cat}</h4>
                        <div className="grid gap-4 max-w-4xl mx-auto">
                          {categoryServices.map((service) => {
                            const isSelected = !!selectedServices.find(s => s.id === service.id);
                            return (
                              <div 
                                key={service.id} 
                                onClick={() => toggleService(service)} 
                                className={`group flex items-center justify-between p-8 rounded-3xl border transition-all duration-300 cursor-pointer 
                                  ${isSelected ? 'border-aura-gold bg-aura-bone/50 shadow-lg' : 'border-aura-beige/20 hover:border-aura-gold/50 hover:bg-aura-bone/20 hover:shadow-lg'}`}
                              >
                                <div>
                                  <h5 className="text-lg lg:text-xl font-bold text-aura-charcoal">{service.name}</h5>
                                  <p className="text-[10px] text-aura-slate/40 uppercase tracking-widest font-bold">{service.duration || 'Arrival Prep Incl.'}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="text-xl font-serif italic text-aura-gold">{service.priceType === "variable" ? "Price varies" : `₦${service.price?.toLocaleString()}`}</span>
                                  {/* Button hover fix logic */}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-aura-gold text-white' : 'bg-aura-bone group-hover:bg-aura-gold group-hover:text-white'}`}>
                                    {isSelected ? <CheckCircle size={18} /> : <Plus size={18} />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <footer id="contact" className="py-40 px-8 lg:px-20 bg-aura-charcoal text-aura-bone">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32">
                  <div className="space-y-12">
                    <h3 className="text-6xl font-serif leading-tight">Ready for <span className="italic text-aura-gold">Restoration.</span></h3>
                    <div className="space-y-8 text-white/60">
                      <p className="flex gap-4"><MapPin size={24} className="text-aura-gold" /> {SPA_CONTACT.address}</p>
                      <p className="flex gap-4"><Phone size={24} className="text-aura-gold" /> {SPA_CONTACT.phones[0]}</p>
                      <p className="flex gap-4"><Mail size={24} className="text-aura-gold" /> {SPA_CONTACT.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-40 pt-16 border-t border-white/5 text-[9px] font-black uppercase tracking-widest opacity-30">
                  © {new Date().getFullYear()} Amethyst Aura Spa
                </div>
              </footer>
            </div>
          </div>

          {/* CONSULTATION POPUP (KEEPING YOUR NEW DESIGN) */}
          {showConsultationPopup && consultService && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-aura-charcoal/80 backdrop-blur-sm animate-fade-in" onClick={() => { setShowConsultationPopup(false); setConsultService(null); }} />
              <div className="relative bg-white p-8 md:p-12 rounded-[3rem] w-full max-w-md text-center space-y-8 shadow-2xl animate-fade-up border border-aura-gold/10">
                <div className="space-y-2">
                  <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-aura-bone rounded-full flex items-center justify-center text-aura-gold"><Sparkles size={32} /></div></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aura-gold">Consultation Required</p>
                  <h3 className="text-3xl font-serif italic text-aura-charcoal">Personalized Pricing</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-aura-slate/70 leading-relaxed px-4"><strong>{consultService.name}</strong> requires professional evaluation before booking.</p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button onClick={() => {
                      const message = encodeURIComponent(`Hello Amethyst Aura Spa 👋🏽\n\nI’d like to book a consultation for:\n• ${consultService.name}`);
                      window.open(`https://wa.me/2349044024821?text=${message}`, "_blank");
                      setShowConsultationPopup(false); setConsultService(null);
                    }} className="w-full bg-aura-charcoal text-white py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">Continue to WhatsApp <ArrowRight size={14} /></button>
                  <button onClick={() => { setShowConsultationPopup(false); setConsultService(null); }} className="w-full py-3 text-[10px] font-black uppercase text-aura-slate/40">Maybe Later</button>
                </div>
              </div>
            </div>
          )}

          {/* BOOKING SIDE PANEL (KEEPING SUMMARY & TOTAL) */}
          <aside className={`fixed top-0 right-0 z-[300] h-screen bg-white border-l shadow-2xl transition-all duration-500 flex flex-col ${isBookingVisible ? 'w-full md:w-[450px] translate-x-0' : 'w-0 translate-x-full pointer-events-none'}`}>
            <div className="flex flex-col h-full min-w-[320px] md:min-w-[450px]">
              <header className="p-10 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-serif italic flex items-center gap-3"><Sparkles size={20} className="text-aura-gold" /> Reserve Session</h2>
                <button onClick={() => setIsBookingVisible(false)} className="p-3 hover:bg-aura-bone rounded-full transition-all"><X size={24} /></button>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                {isBookingSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                    <CheckCircle size={64} className="text-aura-gold animate-bounce" />
                    <h3 className="text-4xl font-serif italic text-aura-charcoal">Journey Secured.</h3>
                    <button onClick={resetBooking} className="bg-aura-charcoal text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest">Complete</button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmBooking} className="space-y-10">
                    {selectedServices.length > 0 && (
                      <div className="space-y-6 pb-8 border-b border-aura-beige/20 animate-fade-in">
                        <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">Your Ritual Selection</label>
                        <div className="space-y-4">
                          {selectedServices.map(service => (
                            <div key={service.id} className="flex justify-between items-center text-sm">
                              <div className="flex flex-col">
                                <span className="text-aura-charcoal font-bold">{service.name}</span>
                                <button type="button" onClick={() => setSelectedServices(prev => prev.filter(s => s.id !== service.id))} className="text-[9px] text-aura-gold font-black uppercase tracking-widest text-left mt-1">Remove</button>
                              </div>
                              <span className="text-aura-slate/60 font-medium">₦{service.price?.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="pt-6 mt-4 border-t border-aura-beige/10 flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-aura-charcoal opacity-40">Investment Total</span>
                              <span className="text-3xl font-serif italic text-aura-gold mt-1">₦{totalPrice?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SELECT DATE */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">1. Select Date</label>
                      <button type="button" onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full flex items-center justify-between p-5 bg-aura-bone rounded-2xl text-aura-charcoal font-medium">
                        {bookingDate || "Choose Date"} <CalendarIcon size={18} />
                      </button>
                      {isCalendarOpen && (
                        <div className="p-6 bg-aura-bone rounded-3xl animate-fade-in">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 bg-white rounded-full"><ChevronLeft size={16}/></button>
                              <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 bg-white rounded-full"><ChevronRight size={16}/></button>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[9px] font-black opacity-30 p-2">{d}</span>)}
                            {generateCalendarDays().map((day, i) => (
                              <button key={i} disabled={!day || isPast(day)} onClick={() => day && selectDate(day)} type="button" className={`p-2 text-xs rounded-xl ${!day ? 'invisible' : isSelectedDay(day) ? 'bg-aura-gold text-white font-bold' : isPast(day) ? 'opacity-20' : 'hover:bg-white'}`}>
                                {day?.getDate()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SELECT TIME */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">2. Select Time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(slot => (
                          <button key={slot} type="button" onClick={() => setBookingTime(slot)} className={`py-3 text-[10px] font-bold rounded-xl border ${bookingTime === slot ? 'bg-aura-charcoal text-white border-aura-charcoal' : 'bg-transparent border-aura-beige/30 hover:border-aura-gold'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">3. Guest Details</label>
                      <input required type="text" placeholder="Full Name" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input required type="email" placeholder="Email Address" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                      <input required type="tel" placeholder="Phone Number" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>

                    <button disabled={isSyncing || !bookingDate || !bookingTime || selectedServices.length === 0} className="w-full bg-aura-gold text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl disabled:opacity-50">
                      {isSyncing ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Ritual Appointment'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      }/>
    </Routes>
  );
};

export default App;
