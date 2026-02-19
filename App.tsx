import { supabase } from "./supabase";
import { Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import ReviewPage from "./pages/ReviewPage";
import ReviewsSection from "./components/ReviewsSection";


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
    name: "Crystal Radiance",
    category: ServiceCategory.SPECIALS,
    price: 61000,
    duration: "Swedish Massage • Brightening Facial • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-glow-crush",
    name: "Glow Crush Treatments",
    category: ServiceCategory.SPECIALS,
    price: 90000,
    duration: "Deep Tissue Massage • Body Polish & Wrap • Dermaplaning Facial",
    priceType: "fixed",
  },
  {
    id: "val-harmony-escape",
    name: "Harmony Escape",
    category: ServiceCategory.SPECIALS,
    price: 74000,
    duration: "Swedish Massage • Microdermabrasion • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-elite-signature",
    name: "Elite Signature",
    category: ServiceCategory.SPECIALS,
    price: 66000,
    duration: "Deep Tissue Massage • Acneout Facial • Jelly Pedicure",
    priceType: "fixed",
  },
  {
    id: "val-tranquil-touch",
    name: "Tranquil Touch",
    category: ServiceCategory.SPECIALS,
    price: 40000,
    duration: "Swedish Massage • Regular Facial",
    priceType: "fixed",
  },
  {
    id: "val-luxe",
    name: "Luxe",
    category: ServiceCategory.SPECIALS,
    price: 54000,
    duration: "Swedish Massage • Jelly Pedicure • Basic Facial",
    priceType: "fixed",
  },
];

const App: React.FC = () => {
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
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
  const [showSecondBank, setShowSecondBank] = useState(false);

  useEffect(() => {
    if (isMenuOpen || isBookingVisible || showConsultationPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen, isBookingVisible, showConsultationPopup]);

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
  receipt_url: b.receipt_url ?? null, // ← this was missing, causing deletion to never fire
  createdAt: b.created_at,
}));


    setBookings(mappedBookings);
  };

  useEffect(() => {
    loadBookings();
    const merged = [
      ...INITIAL_SERVICES,
      ...VALENTINE_SERVICES.filter(v => !INITIAL_SERVICES.some(s => s.id === v.id)),
    ];
    setServices(merged.map(s => ({
      ...s,
      priceType: s.priceType ?? "fixed",
      priceRange: s.priceRange,
    })));
  }, []);

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
    const isMonday = date.getDay() === 1;
    return date < today || isMonday;
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

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !bookingDate || !bookingTime) return;
    setIsSyncing(true);
    const dbServices = selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price, duration: s.duration }));
    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        services: dbServices,
        total_price: totalPrice,
        date: bookingDate,
        time: bookingTime,
        status: "pending_payment"
      }])
      .select().single();

    if (error) {
      alert("Submission error. Please check your network.");
      setIsSyncing(false);
      return;
    }
    await loadBookings();
    if (data) {
      setCurrentBookingId(data.id);
      setShowPaymentScreen(true);
    }
    setIsSyncing(false);
  };

const handleReceiptUpload = async () => {
  if (!receiptFile || !currentBookingId) return;
  setIsSyncing(true);

  try {
    // 1. Upload receipt image to storage
    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${currentBookingId}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, receiptFile);
    if (uploadError) throw uploadError;

    // 2. Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

    // 3. Update booking with receipt URL and status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ receipt_url: publicUrl, status: "payment_uploaded" })
      .eq("id", currentBookingId);
    if (updateError) throw updateError;

    // 4. Notify admin — this is the ONLY email that fires here
    //    The SQL trigger will handle the customer email when admin confirms
    const { error: fnError } = await supabase.functions.invoke("booking-email", {
      body: {
        // No 'type' field = PATH B in index.ts = admin notification email
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: bookingDate,
        time: bookingTime,
        total_price: totalPrice,
        services: selectedServices,
        receipt_url: publicUrl,
      },
    });

    if (fnError) {
      console.error("Email function error:", fnError);
      // Don't block the user — receipt is saved even if email fails
    }

    setShowPaymentScreen(false);
    setIsBookingSuccess(true);
  } catch (err) {
    console.error(err);
    alert("Failed to upload receipt. Please try again.");
  } finally {
    setIsSyncing(false);
  }
};

  const resetBooking = () => {
    setSelectedServices([]);
    setBookingDate('');
    setBookingTime('');
    setFormData({ name: '', email: '', phone: '' });
    setIsBookingSuccess(false);
    setIsBookingVisible(false);
    setIsCalendarOpen(false);
    setShowPaymentScreen(false);
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
	
  const orderedCategories: ServiceCategory[] = [
    ServiceCategory.SPECIALS,
    ...(Object.values(ServiceCategory) as ServiceCategory[]).filter(c => c !== ServiceCategory.SPECIALS),
  ];

  return (
    <Routes>
      <Route path="/admin" element={<Admin services={services} bookings={bookings} setServices={setServices} setBookings={setBookings} />} />
	<Route path="/review" element={<ReviewPage />} />
      <Route path="/" element={
        <div className="relative min-h-screen lg:h-screen bg-aura-bone flex flex-col lg:flex-row font-sans lg:overflow-hidden">
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

          <div className={`lg:hidden fixed inset-0 z-[150] transition-all duration-500 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <div className={`absolute top-0 right-0 w-[75%] h-full bg-white shadow-2xl transition-transform duration-500 flex flex-col pt-32 px-10 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex flex-col gap-8 text-right">
                {navLinks.map((link) => (
                  <a key={link.name} href={link.href} onClick={(e) => scrollToSection(e, link.href)} className="text-2xl font-bold text-aura-charcoal/40 hover:text-aura-gold uppercase tracking-widest">
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col min-w-0 transition-all duration-700">
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
              <section className="relative h-screen flex items-center lg:items-start overflow-hidden bg-black">
                <div className="absolute inset-0 z-0">
                  <img src="/hero.jpg" className="w-full h-full object-cover opacity-70" alt="Spa Haven" />
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
                    <button onClick={(e) => scrollToSection(e as any, '#services')} className="group bg-aura-gold text-white px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                      Book Your Ritual <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </section>

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

              
              <section id="services" className="py-40 px-8 lg:px-20 bg-white">
                <h3 className="text-6xl font-serif text-center mb-24">Treatment Menu</h3>
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
                              <div key={service.id} onClick={() => toggleService(service)} className={`group flex items-center justify-between p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${isSelected ? 'border-aura-gold bg-aura-bone/50 shadow-lg' : 'border-aura-beige/20 hover:border-aura-gold/50 hover:bg-aura-bone/20 hover:shadow-lg'}`}>
                                <div>
                                  <h5 className="text-lg lg:text-xl font-bold text-aura-charcoal">{service.name}</h5>
                                  <p className="text-[10px] text-aura-slate/40 uppercase tracking-widest font-bold">{service.duration || 'Arrival Prep Incl.'}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="text-xl font-serif italic text-aura-gold">{service.priceType === "variable" ? "Price varies" : `₦${service.price?.toLocaleString()}`}</span>
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
	<ReviewsSection />

              <footer id="contact" className="py-40 px-8 lg:px-20 bg-aura-charcoal text-aura-bone relative z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
                  <div className="space-y-12">
                    <header className="space-y-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-aura-gold">Contact Us</span>
                      <h3 className="text-6xl font-serif leading-tight">Ready for <br /><span className="italic font-light text-aura-gold">Restoration.</span></h3>
                    </header>
                    <div className="grid gap-12 text-sm font-light text-aura-bone/60">
                      <a href={SPA_CONTACT.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex gap-8 group cursor-pointer">
                        <div className="p-4 rounded-full border border-white/10 group-hover:border-aura-gold transition-colors shrink-0"><MapPin size={24} className="text-aura-gold" /></div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Address</p>
                          <p className="tracking-wide leading-relaxed max-w-xs text-white/90 group-hover:text-aura-gold transition-colors">{SPA_CONTACT.address}</p>
                        </div>
                      </a>
                      <div className="flex gap-8 group">
                        <div className="p-4 rounded-full border border-white/10 shrink-0"><Phone size={24} className="text-aura-gold" /></div>
                        <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Inquiries</p>
                          {SPA_CONTACT.phones.map((p, i) => (<a key={i} href={`tel:${p}`} className="block tracking-wide text-white/90 hover:text-aura-gold transition-colors">{p}</a>))}
                        </div>
                      </div>
                      <div className="flex gap-8 group">
                        <div className="p-4 rounded-full border border-white/10 shrink-0"><Mail size={24} className="text-aura-gold" /></div>
                        <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</p>
                          <a href={`mailto:${SPA_CONTACT.email}`} className="tracking-wide text-white/90 hover:text-aura-gold transition-colors">{SPA_CONTACT.email}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden rounded-[3.5rem] shadow-2xl group border border-white/5">
                    <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale opacity-80 transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100" alt="Spa Treatment Room" />
                    <div className="absolute inset-0 bg-gradient-to-t from-aura-charcoal/80 via-transparent to-transparent opacity-60" />
                  </div>
                </div>
                <div className="mt-40 pt-16 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] text-white/30">
                  <p>© {new Date().getFullYear()} Amethyst Aura Spa</p>
                </div>
              </footer>
            </div>
          </div>

          {showConsultationPopup && consultService && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center px-6">
              <div className="absolute inset-0 bg-aura-charcoal/80 backdrop-blur-sm" onClick={() => { setShowConsultationPopup(false); setConsultService(null); }} />
              <div className="relative bg-white p-8 md:p-12 rounded-[3rem] w-full max-w-md text-center space-y-8 shadow-2xl border border-aura-gold/10">
                <div className="space-y-2">
                  <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-aura-bone rounded-full flex items-center justify-center text-aura-gold"><Sparkles size={32} /></div></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-aura-gold">Consultation Required</p>
                  <h3 className="text-3xl font-serif italic text-aura-charcoal">Personalized Pricing</h3>
                </div>
                <p className="text-sm text-aura-slate/70 px-4"><strong>{consultService.name}</strong> requires professional evaluation before booking.</p>
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

          <aside className={`fixed top-0 right-0 z-[300] h-screen bg-white border-l shadow-2xl transition-all duration-500 flex flex-col ${isBookingVisible ? 'w-full md:w-[450px] translate-x-0' : 'w-0 translate-x-full pointer-events-none'}`}>
            <div className="flex flex-col h-full min-w-[320px] md:min-w-[450px]">
              <header className="p-10 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-serif italic flex items-center gap-3"><Sparkles size={20} className="text-aura-gold" /> Reserve Session</h2>
                <button onClick={() => setIsBookingVisible(false)} className="p-3 hover:bg-aura-bone rounded-full transition-all"><X size={24} /></button>
              </header>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-28">
                {!isBookingSuccess && selectedServices.length > 0 && (
                  <div className="mb-10 p-6 bg-aura-bone rounded-[2rem] space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-aura-gold">Selected Rituals</p>
                    <div className="space-y-3">
                      {selectedServices.map((s) => (
                        <div key={s.id} className="flex justify-between items-center">
                          <span className="text-sm font-bold text-aura-charcoal">{s.name}</span>
                          <button onClick={() => toggleService(s)} className="text-aura-slate/40 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-aura-beige/30 flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-aura-charcoal">Total Investment</span>
                      <span className="text-2xl font-serif italic text-aura-gold">₦{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

{showPaymentScreen ? (
  <div className="space-y-8">
    <h3 className="text-2xl font-serif italic text-aura-charcoal">Complete Payment</h3>
    <div className="bg-aura-bone p-6 rounded-2xl text-sm space-y-3 border border-aura-gold/10">
      <p className="text-[10px] font-black uppercase tracking-widest text-aura-slate/50">Transfer to:</p>
      
      {/* Logic: Show Moniepoint by default (when showSecondBank is false) */}
      {!showSecondBank ? (
        <div className="space-y-2">
          <p><strong>Bank:</strong> Moniepoint MFB</p>
          <p><strong>Account Name:</strong> Amethyst Aura Enterprises</p>
          <p><strong>Account Number:</strong> 5156781495</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p><strong>Bank:</strong> Lotus Bank</p>
          <p><strong>Account Name:</strong> Amethyst Aura Enterprises</p>
          <p><strong>Account Number:</strong> 1011134995</p>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        type="button"
        onClick={() => setShowSecondBank(!showSecondBank)}
        className="mt-4 pt-4 border-t border-aura-beige/30 w-full text-center text-[10px] font-black uppercase tracking-widest text-aura-gold hover:text-aura-charcoal transition-colors"
      >
        {showSecondBank ? "← Use Moniepoint" : "Use another bank"}
      </button>
    </div>

    <div className="space-y-4">
      <label className="block text-[10px] font-black uppercase tracking-widest text-aura-slate/50">Upload Payment Receipt</label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
        className="w-full text-xs text-aura-slate/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-aura-gold file:text-white cursor-pointer"
      />
      <button 
        onClick={handleReceiptUpload}
        disabled={!receiptFile || isSyncing}
        className="w-full bg-aura-charcoal text-white py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isSyncing ? <Loader2 className="animate-spin" size={16} /> : 'CONFIRM PAYMENT'}
      </button>
    </div>
  </div>

                ) : isBookingSuccess ? (
                  <div className="text-center space-y-6 py-10">
                    <CheckCircle size={48} className="mx-auto text-aura-gold" />
                    <h3 className="text-2xl font-serif italic">Journey Secured</h3>
                    <p className="text-sm text-aura-slate/60">Your ritual appointment has been received. We will contact you shortly.</p>
                    <button onClick={resetBooking} className="w-full bg-aura-charcoal text-white py-4 rounded-full text-[11px] font-black uppercase tracking-widest">Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmBooking} className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">1. Select Date</label>
                      <button type="button" onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="w-full p-5 bg-aura-bone rounded-2xl text-left flex justify-between items-center">
                        {bookingDate || "Choose Date"} <CalendarIcon size={18} className="text-aura-gold" />
                      </button>
                      {isCalendarOpen && (
                        <div className="p-6 bg-white border border-aura-beige/20 rounded-[2rem] shadow-xl">
                          <div className="flex justify-between items-center mb-6">
                            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}><ChevronLeft size={20} className="text-aura-gold" /></button>
                            <span className="text-sm font-bold uppercase">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}><ChevronRight size={20} className="text-aura-gold" /></button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
                                <span key={`day-header-${d}-${index}`} className="text-[10px] font-black text-aura-gold/40">{d}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((date, i) => {
                              if (!date) return <div key={i} />;
                              const isDateDisabled = isPast(date);
                              const isSelected = isSelectedDay(date);
                              return (
                                <button key={i} type="button" disabled={isDateDisabled} onClick={() => selectDate(date)} className={`aspect-square text-[11px] font-bold rounded-full ${isSelected ? 'bg-aura-gold text-white shadow-lg' : ''} ${isDateDisabled ? 'text-aura-slate/20 cursor-not-allowed bg-aura-bone/30' : 'text-aura-charcoal hover:bg-aura-bone'}`}>
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">2. Select Time</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(slot => (
                          <button key={slot} type="button" onClick={() => setBookingTime(slot)} className={`py-3 text-[10px] font-bold rounded-xl border transition-all ${bookingTime === slot ? 'bg-aura-gold border-aura-gold text-white' : 'bg-white border-aura-beige/30 text-aura-slate'}`}>{slot}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-aura-gold">3. Details</label>
                      <input required type="text" placeholder="Full Name" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input required type="email" placeholder="Email Address" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                      <input required type="tel" placeholder="Phone Number" className="w-full p-5 bg-aura-bone rounded-2xl border-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isSyncing || !bookingDate || !bookingTime || selectedServices.length === 0} className="w-full bg-aura-gold text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl disabled:opacity-50">
                      {isSyncing ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm & Pay'}
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
