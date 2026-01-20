
import { useState } from "react";
import AdminDashboard from "../components/AdminDashboard";
import { Service, Appointment } from "../types";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

type Props = {
  services: Service[];
  bookings: Appointment[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setBookings: React.Dispatch<React.SetStateAction<Appointment[]>>;
};

export default function Admin({
  services,
  bookings,
  setServices,
  setBookings,
}: Props) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => {
  return localStorage.getItem("admin_logged_in") === "true";
});
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aura-bone">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl w-full max-w-sm shadow"
        >
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Admin Login
          </h1>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <input
            className="w-full p-3 mb-4 border rounded"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-6 border rounded"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="w-full bg-aura-gold text-white py-3 rounded">
            Login
          </button>
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
  onClose={() => {}}
/>

  );

}
