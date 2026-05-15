"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  /** ms between auto-advance, 0 disables auto-play */
  interval?: number;
  alt?: string;
};

export default function HeroCarousel({ images, interval = 5500, alt = "" }: Props) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!interval || images.length <= 1) return;
    const tick = () => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % images.length);
    };
    timerRef.current = setInterval(tick, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interval, images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className="absolute inset-0 z-0"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== index}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={i === 0 ? alt : ""}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-[clamp(60px,7vh,90px)] left-1/2 -translate-x-1/2 z-[3] flex gap-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`slide ${i + 1}`}
              aria-current={i === index}
              className={`h-[3px] cursor-pointer border-none transition-all duration-500 ${
                i === index ? "w-8 bg-camel" : "w-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
