// Noir role illustrations (inline SVG, scale-free, offline-safe).
export const ROLE_ART: Record<string, string> = {
  Mafia: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="maf-sky" cx="64%" cy="22%" r="92%"><stop offset="0%" stop-color="#3a1320"/><stop offset="42%" stop-color="#1a1226"/><stop offset="100%" stop-color="#0a0813"/></radialGradient>
<linearGradient id="maf-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f3c267" stop-opacity="0.55"/><stop offset="100%" stop-color="#f3c267" stop-opacity="0"/></linearGradient>
<radialGradient id="maf-lamp" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff0c2"/><stop offset="60%" stop-color="#f0b24a"/><stop offset="100%" stop-color="#f0b24a" stop-opacity="0"/></radialGradient>
<radialGradient id="maf-vig" cx="50%" cy="46%" r="62%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.72"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#maf-sky)"/>
<polygon points="300,48 250,240 392,240 332,48" fill="url(#maf-cone)"/>
<ellipse cx="306" cy="232" rx="120" ry="24" fill="#f0b24a" opacity="0.10"/>
<rect x="312" y="60" width="6" height="172" fill="#0c0a14"/>
<rect x="300" y="40" width="30" height="10" rx="3" fill="#0c0a14"/>
<circle cx="315" cy="52" r="16" fill="url(#maf-lamp)"/>
<circle cx="315" cy="52" r="6" fill="#fff4d6"/>
<g fill="#08060d">
<path d="M150 240 C150 168 158 150 176 142 L196 138 C214 146 222 168 222 240 Z"/>
<path d="M150 168 C150 150 165 138 186 138 C207 138 222 150 222 168 L222 176 C200 162 172 162 150 176 Z"/>
<circle cx="186" cy="120" r="14"/>
<path d="M163 112 C163 100 173 94 186 94 C199 94 209 100 209 112 Z"/>
<ellipse cx="186" cy="113" rx="34" ry="7"/>
</g>
<path d="M222 240 C222 168 214 146 196 138" fill="none" stroke="#f0b24a" stroke-width="1.6" opacity="0.45"/>
<circle cx="168" cy="150" r="2.4" fill="#ff6a3d"/>
<circle cx="168" cy="150" r="6" fill="#ff6a3d" opacity="0.28"/>
<path d="M168 148 C172 138 162 132 168 120 C172 112 164 106 168 98" fill="none" stroke="#c9bfae" stroke-width="1.2" opacity="0.20"/>
<ellipse cx="150" cy="232" rx="120" ry="18" fill="#6a6a90" opacity="0.12"/>
<ellipse cx="250" cy="238" rx="150" ry="16" fill="#6a6a90" opacity="0.10"/>
<rect width="400" height="240" fill="url(#maf-vig)"/>
</svg>`,
  Doctor: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="doc-sky" cx="52%" cy="42%" r="82%"><stop offset="0%" stop-color="#103a31"/><stop offset="50%" stop-color="#0c2024"/><stop offset="100%" stop-color="#070f12"/></radialGradient>
<radialGradient id="doc-glow" cx="50%" cy="52%" r="50%"><stop offset="0%" stop-color="#eafff4" stop-opacity="0.9"/><stop offset="40%" stop-color="#6fe0b0" stop-opacity="0.42"/><stop offset="100%" stop-color="#6fe0b0" stop-opacity="0"/></radialGradient>
<radialGradient id="doc-vig" cx="50%" cy="46%" r="62%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.66"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#doc-sky)"/>
<circle cx="238" cy="142" r="124" fill="url(#doc-glow)"/>
<g fill="#05100d">
<path d="M120 240 C120 172 130 150 150 144 L168 142 C188 150 196 172 196 240 Z"/>
<path d="M120 174 C120 154 136 142 158 142 C180 142 196 154 196 174 C176 162 140 162 120 174 Z"/>
<circle cx="158" cy="124" r="14"/>
</g>
<path d="M196 178 C214 174 226 160 232 152" fill="none" stroke="#05100d" stroke-width="12" stroke-linecap="round"/>
<rect x="226" y="120" width="22" height="30" rx="4" fill="#0a1c18" stroke="#3fae84" stroke-width="1.4"/>
<rect x="230" y="125" width="14" height="20" rx="2" fill="#eafff4"/>
<rect x="235" y="115" width="4" height="6" fill="#0a1c18"/>
<path d="M232 115 C232 109 242 109 242 115" fill="none" stroke="#3fae84" stroke-width="1.4"/>
<g>
<rect x="231" y="90" width="6" height="20" rx="2" fill="#8affd0"/>
<rect x="224" y="97" width="20" height="6" rx="2" fill="#8affd0"/>
</g>
<circle cx="272" cy="100" r="2" fill="#aef3d6" opacity="0.7"/>
<circle cx="200" cy="92" r="1.6" fill="#aef3d6" opacity="0.5"/>
<circle cx="256" cy="182" r="1.6" fill="#aef3d6" opacity="0.5"/>
<ellipse cx="200" cy="234" rx="160" ry="18" fill="#7fbfa8" opacity="0.10"/>
<rect width="400" height="240" fill="url(#doc-vig)"/>
</svg>`,
  Detective: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="det-sky" cx="50%" cy="20%" r="88%"><stop offset="0%" stop-color="#16294d"/><stop offset="48%" stop-color="#101a30"/><stop offset="100%" stop-color="#080c16"/></radialGradient>
<linearGradient id="det-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9cc3f0" stop-opacity="0.40"/><stop offset="100%" stop-color="#9cc3f0" stop-opacity="0"/></linearGradient>
<radialGradient id="det-lens" cx="42%" cy="38%" r="64%"><stop offset="0%" stop-color="#dfeeff" stop-opacity="0.95"/><stop offset="55%" stop-color="#7fb0ee" stop-opacity="0.35"/><stop offset="100%" stop-color="#7fb0ee" stop-opacity="0.08"/></radialGradient>
<radialGradient id="det-vig" cx="50%" cy="46%" r="62%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.68"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#det-sky)"/>
<polygon points="150,0 250,0 322,240 78,240" fill="url(#det-cone)"/>
<g stroke="#bcd6f5" stroke-width="1" opacity="0.18">
<line x1="60" y1="20" x2="50" y2="60"/><line x1="110" y1="0" x2="98" y2="44"/><line x1="180" y1="10" x2="168" y2="54"/>
<line x1="250" y1="0" x2="238" y2="48"/><line x1="320" y1="16" x2="308" y2="58"/><line x1="360" y1="0" x2="350" y2="40"/>
<line x1="30" y1="80" x2="20" y2="120"/><line x1="290" y1="70" x2="280" y2="112"/>
</g>
<g fill="#070a12">
<path d="M150 240 C150 170 160 150 178 144 L196 142 C214 150 222 170 222 240 Z"/>
<path d="M150 172 C150 152 166 142 186 142 C206 142 222 152 222 172 C202 160 170 160 150 172 Z"/>
<circle cx="186" cy="122" r="14"/>
<path d="M166 116 C166 104 175 99 186 99 C197 99 206 104 206 116 Z"/>
<ellipse cx="186" cy="117" rx="30" ry="6"/>
</g>
<path d="M150 176 C132 172 120 160 112 150" fill="none" stroke="#070a12" stroke-width="11" stroke-linecap="round"/>
<circle cx="104" cy="138" r="22" fill="url(#det-lens)" stroke="#3a5a86" stroke-width="3"/>
<circle cx="104" cy="138" r="22" fill="none" stroke="#9cc3f0" stroke-width="1" opacity="0.5"/>
<path d="M120 154 L138 172" stroke="#1a263c" stroke-width="6" stroke-linecap="round"/>
<path d="M96 130 C100 126 106 126 110 130" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
<ellipse cx="200" cy="236" rx="170" ry="16" fill="#6f86b8" opacity="0.12"/>
<rect width="400" height="240" fill="url(#det-vig)"/>
</svg>`,
  Villager: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="vil-sky" cx="50%" cy="18%" r="92%"><stop offset="0%" stop-color="#23204a"/><stop offset="50%" stop-color="#15132c"/><stop offset="100%" stop-color="#0a0814"/></radialGradient>
<radialGradient id="vil-win" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffe9b0"/><stop offset="55%" stop-color="#f0b24a"/><stop offset="100%" stop-color="#f0b24a" stop-opacity="0"/></radialGradient>
<radialGradient id="vil-vig" cx="50%" cy="46%" r="64%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.66"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#vil-sky)"/>
<circle cx="66" cy="54" r="20" fill="#e9dcae" opacity="0.88"/>
<circle cx="58" cy="49" r="18" fill="#1b1838"/>
<g fill="#fff" opacity="0.7"><circle cx="120" cy="40" r="1.4"/><circle cx="180" cy="60" r="1.2"/><circle cx="300" cy="36" r="1.6"/><circle cx="340" cy="70" r="1.2"/><circle cx="250" cy="52" r="1.2"/></g>
<circle cx="230" cy="152" r="84" fill="url(#vil-win)" opacity="0.5"/>
<g fill="#0c0a16">
<rect x="170" y="138" width="120" height="100"/>
<path d="M158 140 L230 96 L302 140 Z"/>
<rect x="268" y="104" width="14" height="26"/>
</g>
<rect x="206" y="158" width="48" height="44" rx="3" fill="url(#vil-win)"/>
<rect x="206" y="158" width="48" height="44" rx="3" fill="#ffdf9e" opacity="0.45"/>
<g stroke="#7a5326" stroke-width="3"><line x1="230" y1="158" x2="230" y2="202"/><line x1="206" y1="180" x2="254" y2="180"/></g>
<g fill="#5a3a18" opacity="0.92"><circle cx="222" cy="178" r="5"/><path d="M214 200 C214 188 218 184 222 184 C226 184 230 188 230 200 Z"/></g>
<rect x="180" y="200" width="22" height="38" rx="2" fill="#1a1326"/>
<path d="M275 102 C279 94 270 90 275 82 C279 76 271 72 275 64" fill="none" stroke="#c9bfae" stroke-width="1.4" opacity="0.20"/>
<rect x="0" y="232" width="400" height="8" fill="#1a1730"/>
<ellipse cx="200" cy="236" rx="180" ry="14" fill="#9a8fc0" opacity="0.12"/>
<rect width="400" height="240" fill="url(#vil-vig)"/>
</svg>`,
};
