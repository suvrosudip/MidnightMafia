type Props = { name: string; size?: number };

export function Crest({ name, size = 24 }: Props) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "Mafia": // fedora
      return (<svg {...p}><path d="M4 16.5c3.6 1.5 12.4 1.5 16 0" /><path d="M6.5 16.5c0-5 2.2-8.5 5.5-8.5s5.5 3.5 5.5 8.5" /><path d="M3.5 16.5h17" /></svg>);
    case "Doctor": // cross in ring
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v9M7.5 12h9" /></svg>);
    case "Detective": // magnifier
      return (<svg {...p}><circle cx="11" cy="11" r="6.2" /><path d="M20 20l-4.6-4.6" /></svg>);
    default: // cottage
      return (<svg {...p}><path d="M3.5 11 12 4l8.5 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></svg>);
  }
}
