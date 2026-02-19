import { useState } from "react";
import { supabase } from "../supabase";
import { Star, CheckCircle, Sparkles } from "lucide-react";

export default function ReviewPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !rating || !review.trim()) {
      setError("Please fill in all fields and select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: dbError } = await supabase.from("reviews").insert({
      name: name.trim(),
      rating,
      review: review.trim(),
    });
    setLoading(false);
    if (dbError) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">✦</div>
          <CheckCircle size={56} className="mx-auto text-aura-gold mb-6" />
          <h2 className="text-3xl font-serif italic text-white mb-4">Thank You, {name}</h2>
          <p className="text-[#888888] text-sm leading-relaxed">Your review has been received. It means the world to us and helps others discover their sanctuary.</p>
          <div className="w-12 h-px bg-aura-gold mx-auto mt-8"></div>
          <p className="text-aura-gold text-[10px] font-black uppercase tracking-widest mt-4">Amethyst Aura Aesthetics Spa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[6px] text-aura-gold mb-4">Amethyst Aura Aesthetics Spa</p>
          <div className="w-10 h-px bg-aura-gold mx-auto mb-6"></div>
          <h1 className="text-4xl font-serif italic text-white mb-3">Share Your Experience</h1>
          <p className="text-[#888888] text-sm leading-relaxed">Your words help us grow and guide others to the stillness they deserve.</p>
        </div>

        {/* Form Card */}
        <div className="border border-aura-gold/20 rounded-[2rem] p-10 bg-[#111111]">

          {/* Name */}
          <div className="mb-8">
            <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white text-sm placeholder-[#444] focus:outline-none focus:border-aura-gold/50 transition-colors"
            />
          </div>

          {/* Rating */}
          <div className="mb-8">
            <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Rating</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hovered || rating)
                        ? "text-aura-gold fill-aura-gold"
                        : "text-[#333]"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-[10px] text-aura-gold mt-2 font-bold uppercase tracking-widest">
                {["", "Poor", "Fair", "Good", "Great", "Exceptional"][rating]}
              </p>
            )}
          </div>

          {/* Review */}
          <div className="mb-8">
            <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Review</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={5}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white text-sm placeholder-[#444] focus:outline-none focus:border-aura-gold/50 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-6 text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-aura-gold text-black py-5 rounded-full text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : <><Sparkles size={14} /> Submit Review</>}
          </button>
        </div>

        <p className="text-center text-[#444] text-[10px] mt-8 uppercase tracking-widest">amethystauraspa.com.ng</p>
      </div>
    </div>
  );
}
