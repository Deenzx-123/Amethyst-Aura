import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Star, Sparkles } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !rating || !reviewText.trim()) {
      setError("Please fill in all fields and select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: dbError } = await supabase.from("reviews").insert({
      name: name.trim(),
      rating,
      review: reviewText.trim(),
    });
    setLoading(false);
    if (dbError) { setError("Something went wrong. Please try again."); return; }
    setSubmitted(true);
    loadReviews();
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section id="reviews" className="py-32 px-6 bg-aura-bone">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-[9px] font-black uppercase tracking-[6px] text-aura-gold mb-4">Guest Testimonials</p>
          <h2 className="text-5xl font-serif italic text-aura-charcoal mb-4">What Our Guests Say</h2>
          <div className="w-10 h-px bg-aura-gold mx-auto mb-6"></div>
          {avgRating && (
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={`${parseFloat(avgRating) >= s ? 'text-aura-gold fill-aura-gold' : 'text-aura-beige'}`} />
                ))}
              </div>
              <span className="text-aura-charcoal font-serif italic text-lg">{avgRating}</span>
              <span className="text-aura-slate/40 text-xs font-bold uppercase tracking-widest">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-[2rem] p-8 border border-aura-beige/20 shadow-sm hover:border-aura-gold/20 transition-all">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={`${r.rating >= s ? 'text-aura-gold fill-aura-gold' : 'text-aura-beige'}`} />
                  ))}
                </div>
                <p className="text-aura-slate/70 text-sm leading-relaxed mb-6 font-light italic">"{r.review}"</p>
                <div className="pt-4 border-t border-aura-beige/20 flex justify-between items-center">
                  <p className="text-aura-charcoal font-bold text-sm">{r.name}</p>
                  <p className="text-[9px] text-aura-slate/30 font-bold uppercase tracking-widest">
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-16 mb-24">
            <p className="text-aura-slate/30 text-[11px] font-black uppercase tracking-widest">Be the first to leave a review</p>
          </div>
        )}

        {/* Leave a Review Form */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[9px] font-black uppercase tracking-[6px] text-aura-gold mb-3">Share Your Experience</p>
            <h3 className="text-3xl font-serif italic text-aura-charcoal">Leave a Review</h3>
          </div>

          {submitted ? (
            <div className="text-center py-12 bg-white rounded-[2rem] border border-aura-beige/20">
              <div className="text-3xl mb-4">✦</div>
              <p className="text-aura-charcoal font-serif italic text-xl mb-2">Thank you, {name}!</p>
              <p className="text-aura-slate/50 text-sm">Your review has been shared with our community.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 border border-aura-beige/20 shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-aura-bone border border-aura-beige/30 rounded-2xl px-5 py-4 text-aura-charcoal text-sm placeholder-aura-slate/30 focus:outline-none focus:border-aura-gold/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110">
                        <Star size={28} className={`transition-colors ${star <= (hovered || rating) ? 'text-aura-gold fill-aura-gold' : 'text-aura-beige'}`} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-[9px] text-aura-gold mt-2 font-black uppercase tracking-widest">
                      {["", "Poor", "Fair", "Good", "Great", "Exceptional"][rating]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[4px] text-aura-gold mb-3">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full bg-aura-bone border border-aura-beige/30 rounded-2xl px-5 py-4 text-aura-charcoal text-sm placeholder-aura-slate/30 focus:outline-none focus:border-aura-gold/50 transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-aura-charcoal text-white py-5 rounded-full text-[10px] font-black uppercase tracking-[4px] flex items-center justify-center gap-2 hover:bg-aura-gold transition-all disabled:opacity-50">
                  {loading ? "Submitting..." : <><Sparkles size={14} /> Submit Review</>}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
