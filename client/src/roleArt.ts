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
  Godfather: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="gf-sky" cx="50%" cy="30%" r="86%"><stop offset="0%" stop-color="#3c1620"/><stop offset="48%" stop-color="#1c0f18"/><stop offset="100%" stop-color="#0a0710"/></radialGradient>
<radialGradient id="gf-glow" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#e0a04a" stop-opacity="0.42"/><stop offset="100%" stop-color="#e0a04a" stop-opacity="0"/></radialGradient>
<radialGradient id="gf-vig" cx="50%" cy="46%" r="62%"><stop offset="56%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.72"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#gf-sky)"/>
<ellipse cx="200" cy="120" rx="120" ry="110" fill="url(#gf-glow)"/>
<path d="M132 240 L132 96 C132 80 150 72 200 72 C250 72 268 80 268 96 L268 240 Z" fill="#120a12"/>
<rect x="118" y="150" width="20" height="90" fill="#120a12"/>
<rect x="262" y="150" width="20" height="90" fill="#120a12"/>
<g fill="#07050b">
<path d="M160 240 C160 180 168 160 184 156 L216 156 C232 160 240 180 240 240 Z"/>
<circle cx="200" cy="132" r="16"/>
</g>
<path d="M182 110 l5 7 13 -12 13 12 5 -7 0 13 -36 0 z" fill="#f1c46a" opacity="0.92"/>
<circle cx="226" cy="150" r="2.4" fill="#ff6a3d"/>
<circle cx="226" cy="150" r="6" fill="#ff6a3d" opacity="0.3"/>
<ellipse cx="200" cy="236" rx="170" ry="16" fill="#9a6a72" opacity="0.12"/>
<rect width="400" height="240" fill="url(#gf-vig)"/>
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
  Vigilante: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="vig-sky" cx="48%" cy="24%" r="90%"><stop offset="0%" stop-color="#2a2f44"/><stop offset="48%" stop-color="#171a2c"/><stop offset="100%" stop-color="#090a14"/></radialGradient>
<radialGradient id="vig-spot" cx="50%" cy="30%" r="60%"><stop offset="0%" stop-color="#dcae7e" stop-opacity="0.38"/><stop offset="100%" stop-color="#dcae7e" stop-opacity="0"/></radialGradient>
<radialGradient id="vig-vig" cx="50%" cy="46%" r="62%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.7"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#vig-sky)"/>
<ellipse cx="200" cy="80" rx="150" ry="92" fill="url(#vig-spot)"/>
<circle cx="322" cy="48" r="15" fill="#cdd2e0" opacity="0.45"/>
<g fill="#08090f">
<path d="M120 240 C120 170 130 150 150 144 L168 142 C188 150 196 170 196 240 Z"/>
<path d="M120 172 C120 152 136 142 158 142 C180 142 196 152 196 172 C176 160 140 160 120 172 Z"/>
<circle cx="158" cy="124" r="14"/>
<path d="M138 118 C138 107 147 102 158 102 C169 102 178 107 178 118 Z"/>
<ellipse cx="158" cy="119" rx="28" ry="6"/>
</g>
<path d="M196 178 C220 176 244 172 262 170" fill="none" stroke="#08090f" stroke-width="11" stroke-linecap="round"/>
<rect x="262" y="161" width="22" height="9" rx="2" fill="#0c0d16"/>
<rect x="266" y="170" width="6" height="10" fill="#0c0d16"/>
<circle cx="288" cy="165" r="3" fill="#ffd9a0"/>
<circle cx="288" cy="165" r="9" fill="#ffb060" opacity="0.4"/>
<path d="M288 158v14M281 165h14" stroke="#ffd9a0" stroke-width="1" opacity="0.55"/>
<ellipse cx="200" cy="236" rx="170" ry="16" fill="#7a86a8" opacity="0.12"/>
<rect width="400" height="240" fill="url(#vig-vig)"/>
</svg>`,
  Jester: `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="jes-sky" cx="50%" cy="26%" r="88%"><stop offset="0%" stop-color="#332252"/><stop offset="50%" stop-color="#1c1430"/><stop offset="100%" stop-color="#0b0814"/></radialGradient>
<linearGradient id="jes-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#cfa6f0" stop-opacity="0.4"/><stop offset="100%" stop-color="#cfa6f0" stop-opacity="0"/></linearGradient>
<radialGradient id="jes-vig" cx="50%" cy="46%" r="62%"><stop offset="58%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.68"/></radialGradient>
</defs>
<rect width="400" height="240" fill="url(#jes-sky)"/>
<polygon points="160,0 240,0 300,240 100,240" fill="url(#jes-cone)"/>
<g>
<rect x="120" y="40" width="6" height="6" fill="#e06c9a" opacity="0.8" transform="rotate(20 123 43)"/>
<rect x="270" y="60" width="6" height="6" fill="#6cc0e0" opacity="0.8" transform="rotate(35 273 63)"/>
<rect x="300" y="120" width="5" height="5" fill="#e0c06c" opacity="0.8"/>
<rect x="96" y="118" width="5" height="5" fill="#7ce0a0" opacity="0.8"/>
<rect x="150" y="30" width="5" height="5" fill="#c06ce0" opacity="0.8"/>
<circle cx="320" cy="90" r="3" fill="#e06c9a" opacity="0.7"/>
<circle cx="80" cy="80" r="3" fill="#6cc0e0" opacity="0.7"/>
</g>
<g fill="#0a0716">
<path d="M150 240 C150 174 160 154 178 148 L196 146 C214 154 222 174 222 240 Z"/>
<path d="M150 176 C150 156 166 146 186 146 C206 146 222 156 222 176 C202 164 170 164 150 176 Z"/>
<circle cx="186" cy="126" r="15"/>
<path d="M172 116 C166 96 150 92 146 104 C150 104 156 110 160 118 Z"/>
<path d="M200 116 C206 96 222 92 226 104 C222 104 216 110 212 118 Z"/>
</g>
<circle cx="145" cy="104" r="3.5" fill="#cfa6f0"/>
<circle cx="227" cy="104" r="3.5" fill="#cfa6f0"/>
<path d="M178 130 C182 135 190 135 194 130" fill="none" stroke="#cfa6f0" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
<ellipse cx="200" cy="236" rx="170" ry="16" fill="#8a7ab0" opacity="0.12"/>
<rect width="400" height="240" fill="url(#jes-vig)"/>
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
