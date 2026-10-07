import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

function TestimonialCard({ t }) {
  return (
    <article className="bg-white border border-border p-6">
      <Quote className="w-5 h-5 text-secondary mb-3" aria-hidden />
      <div className="flex gap-1 mb-3" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-secondary fill-secondary" aria-hidden />
        ))}
      </div>
      <p className="text-sm italic text-text-primary min-h-[100px]">{t.quote}</p>
      <hr className="my-4" />
      <p className="font-semibold">{t.name}</p>
      <p className="text-xs text-text-muted">{t.role}</p>
    </article>
  );
}

export default function TestimonialsCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  const visible = [
    items[index],
    items[(index + 1) % items.length],
    items[(index + 2) % items.length],
  ];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hidden md:grid grid-cols-3 gap-4">
        {visible.map((t, idx) => (
          <TestimonialCard key={`${t.name}-${idx}`} t={t} />
        ))}
      </div>

      <div className="md:hidden">
        <TestimonialCard t={items[index]} />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center"
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={index === i ? "true" : undefined}
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full ${
                  index === i ? "bg-primary" : "bg-border"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-border"
            onClick={() =>
              setIndex((prev) => (prev - 1 + items.length) % items.length)
            }
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-border"
            onClick={() => setIndex((prev) => (prev + 1) % items.length)}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
