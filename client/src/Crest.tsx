type Props = { name: string; size?: number };

export function Crest({ name, size = 24 }: Props) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "Mafia":
      return (<svg {...p}><path d="M4 16.5c3.6 1.5 12.4 1.5 16 0" /><path d="M6.5 16.5c0-5 2.2-8.5 5.5-8.5s5.5 3.5 5.5 8.5" /><path d="M3.5 16.5h17" /></svg>);
    case "Godfather": // crown
      return (<svg {...p}><path d="M4 8l3.5 4.5L12 6l4.5 6.5L20 8v9H4z" /><path d="M4 20h16" /></svg>);
    case "Doctor":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v9M7.5 12h9" /></svg>);
    case "Detective":
      return (<svg {...p}><circle cx="11" cy="11" r="6.2" /><path d="M20 20l-4.6-4.6" /></svg>);
    case "Vigilante": // target reticle
      return (<svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 1.5v3.5M12 19v3.5M1.5 12h3.5M19 12h3.5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>);
    case "Jester": // jester hat with bells
      return (<svg {...p}><path d="M5.5 16c0-4 2.9-8.5 6.5-8.5s6.5 4.5 6.5 8.5" /><path d="M5.5 16h13" /><path d="M5.5 16l-2.2 3M18.5 16l2.2 3" /><circle cx="2.8" cy="19.8" r="1.3" fill="currentColor" stroke="none" /><circle cx="21.2" cy="19.8" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="6.6" r="1.3" fill="currentColor" stroke="none" /></svg>);
    default: // cottage (Villager)
      return (<svg {...p}><path d="M3.5 11 12 4l8.5 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></svg>);
  }
}
