import { useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import { Service, Appointment } from "../types";
import { supabase } from "../supabase";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

type Props = {
  services: Service[];
  bookings: Appointment[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Appointment[]>>;
};

export default function Admin({ services, bookings, setServices, setBookings }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("admin_logged_in") === "true");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      setError("");
    } else {
      setError("Invalid credentials");
    }
  }

  const handleConfirmPayment = async (booking: Appointment) => {
    if (!window.confirm(`Confirm payment for ${booking.customerName}?`)) return;
    try {
      const { error: dbError } = await supabase.rpc("confirm_booking", { booking_id: booking.id });
      if (dbError) throw dbError;

      if (booking.receipt_url) {
        const fileName = booking.receipt_url.split("/").pop();
        if (fileName) await supabase.storage.from("receipts").remove([fileName]);
      }

      alert("Booking confirmed! Customer has been notified.");
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "confirmed" } : b));
    } catch (err) {
      console.error("Confirmation error:", err);
      alert("Error confirming payment. Please try again.");
    }
  };

  const handleCompleteBooking = async (booking: Appointment) => {
    if (!window.confirm(`Mark ${booking.customerName}'s booking as completed? This will send them a thank you email.`)) return;
    try {
      const { error: dbError } = await supabase.rpc("complete_booking", { booking_id: booking.id });
      if (dbError) throw dbError;

      alert("Booking marked as completed! Thank you email sent to customer.");
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: "completed" } : b));
    } catch (err) {
      console.error("Complete error:", err);
      alert("Error marking booking as completed. Please try again.");
    }
  };

  const handleDeleteBooking = async (booking: Appointment) => {
    if (!window.confirm(`Delete booking for ${booking.customerName}? This cannot be undone.`)) return;
    try {
      if (booking.receipt_url) {
        const fileName = booking.receipt_url.split("/").pop();
        if (fileName) await supabase.storage.from("receipts").remove([fileName]);
      }
      const { error: dbError } = await supabase.from("bookings").delete().eq("id", booking.id);
      if (dbError) throw dbError;
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      alert("Booking deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting booking. Please try again.");
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aura-bone">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl w-full max-w-sm shadow">
          <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <input className="w-full p-3 mb-4 border rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" className="w-full p-3 mb-6 border rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-aura-gold text-white py-3 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <AdminDashboard
      services={services ?? []}
      bookings={bookings ?? []}
      setServices={setServices}
      setBookings={setBookings}
      onConfirmPayment={handleConfirmPayment}
      onCompleteBooking={handleCompleteBooking}
      onDeleteBooking={handleDeleteBooking}
      onClose={() => {}}
    />
  );
}
