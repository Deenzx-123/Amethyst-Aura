import { supabase } from "../supabase";
import React, { useState } from 'react';
import { Appointment, Service, ServiceCategory } from '../types';
import { X, Calendar, Clock, Trash2, Edit2, Plus, Save, Mail, Phone, Package, CheckCircle, Star } from 'lucide-react';

interface AdminDashboardProps {
  bookings: Appointment[];
  services: Service[];
  onClose: () => void;
  setBookings: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onConfirmPayment: (booking: Appointment) => Promise<void>;
  onDeleteBooking: (booking: Appointment) => Promise<void>;
  onCompleteBooking: (booking: Appointment) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings, services, onClose, setBookings, setServices,
  onConfirmPayment, onDeleteBooking, onCompleteBooking,
}) => {
  if (!Array.isArray(bookings) || !Array.isArray(services)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-aura-bone text-aura-slate">
        Loading admin dashboard…
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');
  const [editingBooking, setEditingBooking] = useState<Appointment | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const updateBooking = async (updated: Appointment) => {
    const { error } = await supabase
      .from("bookings")
      .update({ customer_name: updated.customerName, date: updated.date, time: updated.time })
      .eq("id", updated.id);
    if (error) { console.error("Update failed:", error); alert("Failed to update booking."); return; }
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditingBooking(null);
  };

  const saveService = (service: Service) => {
    if (services.find(s => s.id === service.id)) {
      setServices(prev => prev.map(s => s.id === service.id ? service : s));
    } else {
      setServices(prev => [...prev, service]);
    }
    setEditingService(null);
  };

  const deleteService = (id: string) => {
    if (confirm('Delete this treatment?')) setServices(prev => prev.filter(s => s.id !== id));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed:       'bg-green-50 text-green-600',
      payment_uploaded:'bg-yellow-50 text-yellow-600',
      completed:       'bg-purple-50 text-purple-600',
      cancelled:       'bg-red-50 text-red-400',
      pending_payment: 'bg-aura-bone text-aura-gold',
    };
    return map[status] ?? 'bg-aura-bone text-aura-gold';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-aura-bone flex flex-col animate-fade-in overflow-hidden">
      <header className="px-8 py-6 bg-white border-b border-aura-beige/20 flex justify-between items-center shrink-0 shadow-sm">
        <div>
          <h1 className="text-xl font-serif text-aura-charcoal">Spa Management</h1>
          <div className="flex gap-8 mt-4">
            <button onClick={() => setActiveTab('bookings')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'bookings' ? 'border-aura-gold text-aura-charcoal' : 'border-transparent text-aura-slate/40'}`}>
              Arrivals ({bookings.length})
            </button>
            <button onClick={() => setActiveTab('services')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'services' ? 'border-aura-gold text-aura-charcoal' : 'border-transparent text-aura-slate/40'}`}>
              Menu Config
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-3 text-aura-charcoal hover:bg-aura-bone rounded-full transition-all border border-aura-beige/30"><X size={20} /></button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
        {activeTab === 'bookings' ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-[2.5rem] p-8 border border-aura-beige/10 shadow-aura-subtle group hover:border-aura-gold/20 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusBadge(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingBooking(booking)} className="p-2 text-aura-slate/20 hover:text-aura-gold"><Edit2 size={14} /></button>
                    <button onClick={() => onDeleteBooking(booking)} className="p-2 text-aura-slate/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>

                <h3 className="text-2xl font-serif text-aura-charcoal mb-4">{booking.customerName}</h3>
                <div className="space-y-2 mb-6 text-[11px] font-bold text-aura-slate/50 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Phone size={12} className="text-aura-gold" /> {booking.phone}</div>
                  <div className="flex items-center gap-2"><Mail size={12} className="text-aura-gold" /> {booking.email}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] font-black text-aura-charcoal uppercase tracking-widest bg-aura-bone p-4 rounded-2xl">
                  <div className="flex flex-col gap-1"><Calendar size={12} className="text-aura-gold" /> {new Date(booking.date).toLocaleDateString()}</div>
                  <div className="flex flex-col gap-1"><Clock size={12} className="text-aura-gold" /> {booking.time}</div>
                </div>

                <div className="flex-1 space-y-2 border-t pt-4 mb-6">
                  <p className="text-[8px] font-black uppercase text-aura-slate/30 mb-2">Requested Treatments</p>
                  {booking.services.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-aura-charcoal">{s.name}</span>
                      <span className="text-aura-gold font-serif italic">₦{(s.price ?? 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {booking.receipt_url && (
                  <a href={booking.receipt_url} target="_blank" rel="noopener noreferrer"
                     className="text-[9px] font-black uppercase tracking-widest text-aura-gold underline mb-4">
                    View Receipt →
                  </a>
                )}

                <div className="pt-4 border-t flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black uppercase text-aura-slate/30">Total Value</span>
                  <span className="text-xl font-serif italic text-aura-gold font-black">₦{(booking.totalPrice ?? 0).toLocaleString()}</span>
                </div>

                {/* Confirm Payment — shows when receipt is uploaded */}
                {booking.status === 'payment_uploaded' && (
                  <button onClick={() => onConfirmPayment(booking)}
                    className="w-full bg-aura-gold text-white py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md mb-3">
                    <CheckCircle size={14} /> Confirm Payment
                  </button>
                )}

                {/* Mark as Completed — shows only when confirmed */}
                {booking.status === 'confirmed' && (
                  <button onClick={() => onCompleteBooking(booking)}
                    className="w-full bg-aura-charcoal text-white py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-aura-gold transition-all shadow-md">
                    <Star size={14} /> Mark as Completed
                  </button>
                )}
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-aura-beige/20 rounded-[3rem]">
                <Package size={48} className="mx-auto text-aura-beige mb-6 opacity-20" />
                <p className="text-aura-slate/40 text-[11px] font-black uppercase tracking-widest">No active arrivals</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-center border-b pb-8">
              <h2 className="text-4xl font-serif text-aura-charcoal italic">Menu Editor</h2>
              <button
                onClick={() => setEditingService({ id: Math.random().toString(36).substr(2, 9), name: '', price: 0, category: ServiceCategory.MASSAGE })}
                className="bg-aura-gold text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-md hover:brightness-110">
                <Plus size={14} /> Add Treatment
              </button>
            </div>
            <div className="space-y-16">
              {Object.values(ServiceCategory).map(cat => {
                const catServices = services.filter(s => s.category === cat);
                return (
                  <div key={cat} className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-aura-gold border-b pb-4">{cat}</h4>
                    <div className="grid gap-4">
                      {catServices.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-white p-6 rounded-3xl border border-aura-beige/10 hover:border-aura-gold/20 shadow-sm transition-all">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-aura-charcoal">{s.name}</span>
                            <span className="text-[9px] text-aura-slate/30 font-bold uppercase tracking-widest mt-1">{s.duration || 'Standard Session'}</span>
                          </div>
                          <div className="flex items-center gap-10">
                            <span className="text-lg font-serif italic text-aura-gold font-black">₦{(s.price ?? 0).toLocaleString()}</span>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingService(s)} className="p-2 text-aura-slate/20 hover:text-aura-gold transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => deleteService(s.id)} className="p-2 text-aura-slate/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {editingBooking && (
        <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-aura-elevated animate-fade-up">
            <h2 className="text-3xl font-serif text-aura-charcoal mb-8 italic">Modify Guest Entry</h2>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={editingBooking.date} onChange={e => setEditingBooking({...editingBooking, date: e.target.value})} className="bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
                <input value={editingBooking.time} onChange={e => setEditingBooking({...editingBooking, time: e.target.value})} className="bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
              </div>
              <input value={editingBooking.customerName} onChange={e => setEditingBooking({...editingBooking, customerName: e.target.value})} className="w-full bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
              <div className="flex gap-4">
                <button onClick={() => updateBooking(editingBooking)} className="flex-1 bg-aura-charcoal text-white py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all">Update</button>
                <button onClick={() => setEditingBooking(null)} className="flex-1 border py-5 rounded-full text-[10px] font-bold uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingService && (
        <div className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-aura-elevated animate-fade-up">
            <h2 className="text-3xl font-serif text-aura-charcoal mb-8 italic">{services.find(s => s.id === editingService.id) ? 'Update Treatment' : 'New Treatment'}</h2>
            <div className="space-y-6">
              <input placeholder="Name" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
              <input type="number" placeholder="Price (₦)" value={editingService.price} onChange={e => setEditingService({...editingService, price: parseInt(e.target.value) || 0})} className="w-full bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
              <select value={editingService.category} onChange={e => setEditingService({...editingService, category: e.target.value as ServiceCategory})} className="w-full bg-aura-bone p-4 rounded-2xl text-xs font-bold">
                {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Duration (e.g. 60 Min)" value={editingService.duration || ''} onChange={e => setEditingService({...editingService, duration: e.target.value})} className="w-full bg-aura-bone p-4 rounded-2xl text-xs font-bold" />
              <div className="flex gap-4">
                <button onClick={() => saveService(editingService)} className="flex-1 bg-aura-charcoal text-white py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all flex items-center justify-center gap-2"><Save size={14} /> Commit</button>
                <button onClick={() => setEditingService(null)} className="flex-1 border py-5 rounded-full text-[10px] font-bold uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
