
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { VALENTINE_PACKAGES, ValentinePackage } from "../valentinePackages";
import { X, Heart } from "lucide-react";

const ValentinePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"couples" | "self_love">("couples");
  const [selectedPackage, setSelectedPackage] = useState<ValentinePackage | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Show popup on first load
  useEffect(() => {
    const seen = localStorage.getItem("");
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem("valentine_popup_seen", "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setLoading(true);

    const { error } = await supabase.from("bookings").insert({
  customer_name: form.name,
  email: form.email,
  phone: form.phone,

  // REQUIRED by your schema
  services: [
    {
      name: selectedPackage.name,
      category: selectedPackage.category,
      type: "valentine",
      price: selectedPackage.price,
      duration: selectedPackage.duration,
    },
  ],

  total_price: selectedPackage.price,

  // Valentine metadata (safe extras)
  booking_type: "valentine",
  package_name: selectedPackage.name,
  package_category: selectedPackage.category,
  price: selectedPackage.price,

  date: form.date,
  time: form.time,
  status: "pending",
  source: "valentine_popup",
});


    setLoading(false);

    if (error) {
  console.error("Valentine booking error:", error);
  alert(error.message);
  return;
}

    setSuccess(true);
  };

  if (!isOpen) return null;

  const packages = VALENTINE_PACKAGES.filter(p => p.category === category);

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl p-8 relative overflow-y-auto max-h-[90vh]">

        {/* Close */}
        <button onClick={closePopup} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={24} />
        </button>

        {!selectedPackage && !success && (
          <>
            <div className="text-center mb-8">
              <Heart className="mx-auto text-aura-gold" size={36} />
              <h2 className="text-3xl font-serif mt-4">Valentine’s Special Packages</h2>
              <p className="text-sm text-gray-500 mt-2">Limited availability · Book now</p>
            </div>

            {/* Category Tabs */}
            <div className="flex justify-center gap-4 mb-10">
              <button
                onClick={() => setCategory("couples")}
                className={`px-6 py-2 rounded-full text-sm font-bold ${
                  category === "couples" ? "bg-aura-gold text-white" : "bg-gray-100"
                }`}
              >
                Couples 💕
              </button>
              <button
                onClick={() => setCategory("self_love")}
                className={`px-6 py-2 rounded-full text-sm font-bold ${
                  category === "self_love" ? "bg-aura-gold text-white" : "bg-gray-100"
                }`}
              >
                Self-Love 🌹
              </button>
            </div>

            {/* Packages */}
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map(pkg => (
                <div key={pkg.id} className="border rounded-xl p-6 shadow-sm">
                  <h3 className="font-serif text-xl mb-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{pkg.description}</p>
                  <p className="text-sm mb-1">{pkg.duration}</p>
                  <p className="font-bold mb-4">₦{pkg.price.toLocaleString()}</p>
                  <button
                    onClick={() => setSelectedPackage(pkg)}
                    className="w-full bg-aura-gold text-white py-2 rounded-full text-sm font-bold"
                  >
                    Book this package
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Booking Form */}
        {selectedPackage && !success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-2xl font-serif text-center">
              {selectedPackage.name}
            </h3>

            <input
  required
  type="text"
  placeholder="Full Name"
  className="w-full p-5 bg-aura-bone rounded-2xl border-none"
  onChange={e => setForm({ ...form, name: e.target.value })}
/>

<input
  required
  type="email"
  placeholder="Email Address"
  className="w-full p-5 bg-aura-bone rounded-2xl border-none"
  onChange={e => setForm({ ...form, email: e.target.value })}
/>

<input
  required
  type="tel"
  placeholder="Phone Number"
  className="w-full p-5 bg-aura-bone rounded-2xl border-none"
  onChange={e => setForm({ ...form, phone: e.target.value })}
/>

<input
  required
  type="date"
  className="w-full p-5 bg-aura-bone rounded-2xl border-none"
  onChange={e => setForm({ ...form, date: e.target.value })}
/>

<input
  required
  type="time"
  className="w-full p-5 bg-aura-bone rounded-2xl border-none"
  onChange={e => setForm({ ...form, time: e.target.value })}
/>


            <button
              disabled={loading}
              className="w-full bg-aura-gold text-white py-3 rounded-full font-bold"
            >
              {loading ? "Submitting..." : "Confirm Booking"}
            </button>
          </form>
        )}

        {/* Success */}
        {success && (
          <div className="text-center py-16">
            <h3 className="text-3xl font-serif mb-4">Booking Received 💕</h3>
            <p>We’ll contact you shortly to confirm your Valentine experience.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValentinePopup;
