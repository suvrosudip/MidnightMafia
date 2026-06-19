import { useMemo } from "react";

export default function Atmosphere() {
  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 72,
        size: (Math.random() * 1.6 + 1).toFixed(1),
        dur: (Math.random() * 4 + 2.5).toFixed(2),
        delay: (Math.random() * 5).toFixed(2),
      })),
    []
  );
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-grad" />
      <div className="stars">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
      <svg className="moon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mg" cx="42%" cy="38%" r="64%">
            <stop offset="0%" stopColor="#fff7e6" />
            <stop offset="62%" stopColor="#ead8a8" />
            <stop offset="100%" stopColor="#b69a62" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="48" fill="url(#mg)" />
        <circle cx="118" cy="84" r="7" fill="#0b0a18" opacity="0.06" />
        <circle cx="84" cy="114" r="10" fill="#0b0a18" opacity="0.05" />
        <circle cx="110" cy="122" r="5" fill="#0b0a18" opacity="0.05" />
      </svg>
      <div className="fog fog-a" />
      <div className="fog fog-b" />
      <div className="vignette" />
    </div>
  );
}
