// ── Ship SVGs — Pirate & Navy Factions ────────────────────

const ShipFactions = {

  // ════════════════════════════════════════════════════════
  //  PIRATE FACTION
  // ════════════════════════════════════════════════════════
  pirate: {
    name: 'Pirates',
    icon: '🏴‍☠️',
    ships: {
      'Carrier': {
        label: 'Thousand Sunny',
        color: '#f59e0b',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="p-sunny-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#92400e"/>
              </linearGradient>
            </defs>
            <path d="M${w*.05},${h*.55} Q${w*0},${h*.9} ${w*.15},${h*.85} L${w*.85},${h*.85} Q${w},${h*.9} ${w*.95},${h*.55} Z" fill="url(#p-sunny-hull)" stroke="#78350f" stroke-width="1"/>
            <rect x="${w*.1}" y="${h*.4}" width="${w*.8}" height="${h*.18}" rx="3" fill="#d97706"/>
            <rect x="${w*.35}" y="${h*.18}" width="${w*.3}" height="${h*.25}" rx="3" fill="#fbbf24" stroke="#b45309" stroke-width=".5"/>
            <line x1="${w*.5}" y1="${h*.05}" x2="${w*.5}" y2="${h*.4}" stroke="#78350f" stroke-width="2"/>
            <path d="M${w*.3},${h*.08} L${w*.5},${h*.05} L${w*.5},${h*.3} L${w*.28},${h*.28} Z" fill="white" opacity=".9"/>
            <text x="${w*.4}" y="${h*.2}" text-anchor="middle" font-size="${Math.min(w,h)*.07}" fill="#1f2937">☠</text>
            <circle cx="${w*.92}" cy="${h*.45}" r="${Math.min(w,h)*.06}" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
            <path d="M${w*.95},${h*.42} Q${w},{h*.38} ${w*.96},${h*.35}" stroke="#f59e0b" stroke-width="2" fill="none"/>
            <rect x="${w*.12}" y="${h*.42}" width="${w*.2}" height="${h*.08}" rx="1" fill="#22c55e" opacity=".6"/>
          </svg>`
      },
      'Battleship': {
        label: 'Moby Dick',
        color: '#e2e8f0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="p-moby" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#e2e8f0"/>
                <stop offset="100%" stop-color="#94a3b8"/>
              </linearGradient>
            </defs>
            <path d="M${w*.03},${h*.55} Q0,${h*.92} ${w*.12},${h*.88} L${w*.88},${h*.88} Q${w},${h*.92} ${w*.97},${h*.55} Z" fill="url(#p-moby)" stroke="#64748b" stroke-width="1"/>
            <ellipse cx="${w*.93}" cy="${h*.5}" rx="${w*.08}" ry="${h*.12}" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
            <circle cx="${w*.96}" cy="${h*.46}" r="2" fill="#1e293b"/>
            <rect x="${w*.08}" y="${h*.4}" width="${w*.84}" height="${h*.18}" rx="3" fill="#cbd5e1"/>
            <line x1="${w*.3}" y1="${h*.05}" x2="${w*.3}" y2="${h*.4}" stroke="#475569" stroke-width="2"/>
            <path d="M${w*.15},${h*.08} L${w*.3},${h*.05} L${w*.3},${h*.28} L${w*.13},${h*.26} Z" fill="#e2e8f0"/>
            <line x1="${w*.6}" y1="${h*.08}" x2="${w*.6}" y2="${h*.4}" stroke="#475569" stroke-width="2"/>
            <path d="M${w*.45},${h*.1} L${w*.6},${h*.08} L${w*.6},${h*.3} L${w*.43},${h*.28} Z" fill="#e2e8f0"/>
            <text x="${w*.38}" y="${h*.22}" text-anchor="middle" font-size="${Math.min(w,h)*.09}" fill="#7c3aed" font-weight="bold">✚</text>
          </svg>`
      },
      'Cruiser': {
        label: 'Going Merry',
        color: '#fef3c7',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.05},${h*.55} Q0,${h*.9} ${w*.15},${h*.85} L${w*.85},${h*.85} Q${w},${h*.9} ${w*.95},${h*.55} Z" fill="#fcd34d" stroke="#b45309" stroke-width="1"/>
            <rect x="${w*.1}" y="${h*.42}" width="${w*.8}" height="${h*.16}" rx="3" fill="#fde68a"/>
            <rect x="${w*.25}" y="${h*.22}" width="${w*.35}" height="${h*.22}" rx="3" fill="white" stroke="#d97706" stroke-width=".5"/>
            <rect x="${w*.32}" y="${h*.28}" width="${w*.08}" height="${h*.08}" rx="1" fill="#7dd3fc"/>
            <rect x="${w*.44}" y="${h*.28}" width="${w*.08}" height="${h*.08}" rx="1" fill="#7dd3fc"/>
            <line x1="${w*.5}" y1="${h*.05}" x2="${w*.5}" y2="${h*.42}" stroke="#92400e" stroke-width="2"/>
            <path d="M${w*.3},${h*.07} L${w*.5},${h*.05} L${w*.5},${h*.32} L${w*.28},${h*.3} Z" fill="white"/>
            <circle cx="${w*.9}" cy="${h*.42}" r="${Math.min(w,h)*.07}" fill="white" stroke="#d97706" stroke-width="1"/>
            <circle cx="${w*.93}" cy="${h*.39}" r="${Math.min(w,h)*.02}" fill="#1e293b"/>
          </svg>`
      },
      'Submarine': {
        label: 'Polar Tang',
        color: '#fde047',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="p-polar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fde047"/>
                <stop offset="100%" stop-color="#eab308"/>
              </linearGradient>
            </defs>
            <ellipse cx="${w*.5}" cy="${h*.6}" rx="${w*.46}" ry="${h*.25}" fill="url(#p-polar)" stroke="#a16207" stroke-width="1"/>
            <rect x="${w*.38}" y="${h*.25}" width="${w*.24}" height="${h*.2}" rx="4" fill="#facc15" stroke="#a16207" stroke-width=".8"/>
            <line x1="${w*.5}" y1="${h*.08}" x2="${w*.5}" y2="${h*.25}" stroke="#78350f" stroke-width="2"/>
            <rect x="${w*.47}" y="${h*.06}" width="${w*.06}" height="${h*.06}" rx="1" fill="#a16207"/>
            <circle cx="${w*.5}" cy="${h*.6}" r="${Math.min(w,h)*.08}" fill="white" opacity=".8"/>
            <text x="${w*.5}" y="${h*.64}" text-anchor="middle" font-size="${Math.min(w,h)*.1}" fill="#dc2626">♥</text>
            <circle cx="${w*.25}" cy="${h*.58}" r="${Math.min(w,h)*.04}" fill="#7dd3fc" stroke="#a16207" stroke-width="1"/>
            <circle cx="${w*.75}" cy="${h*.58}" r="${Math.min(w,h)*.04}" fill="#7dd3fc" stroke="#a16207" stroke-width="1"/>
          </svg>`
      },
      'Destroyer': {
        label: 'Striker',
        color: '#f97316',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.08},${h*.5} Q0,${h*.88} ${w*.2},${h*.82} L${w*.8},${h*.82} Q${w},${h*.88} ${w*.92},${h*.5} Z" fill="#f97316" stroke="#c2410c" stroke-width="1"/>
            <rect x="${w*.3}" y="${h*.32}" width="${w*.3}" height="${h*.2}" rx="3" fill="#fdba74" stroke="#c2410c" stroke-width=".5"/>
            <path d="M${w*.05},${h*.45} Q${w*-.05},${h*.5} ${w*0},${h*.55}" fill="#ef4444" opacity=".8"/>
            <path d="M${w*.08},${h*.42} Q${w*-.02},${h*.48} ${w*.03},${h*.55}" fill="#f97316" opacity=".7"/>
            <text x="${w*.55}" y="${h*.48}" text-anchor="middle" font-size="${Math.min(w,h)*.15}" fill="#1e293b">♠</text>
          </svg>`
      },
      'Patrol': {
        label: 'Mini Merry',
        color: '#a78bfa',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.1},${h*.5} Q${w*.05},${h*.85} ${w*.25},${h*.8} L${w*.75},${h*.8} Q${w*.95},${h*.85} ${w*.9},${h*.5} Z" fill="#c4b5fd" stroke="#7c3aed" stroke-width="1"/>
            <line x1="${w*.5}" y1="${h*.15}" x2="${w*.5}" y2="${h*.5}" stroke="#5b21b6" stroke-width="1.5"/>
            <path d="M${w*.5},${h*.15} L${w*.72},${h*.22} L${w*.5},${h*.3} Z" fill="#f472b6"/>
            <text x="${w*.5}" y="${h*.65}" text-anchor="middle" font-size="${Math.min(w,h)*.22}" fill="#4c1d95">☠</text>
          </svg>`
      }
    }
  },

  // ════════════════════════════════════════════════════════
  //  NAVY FACTION
  // ════════════════════════════════════════════════════════
  navy: {
    name: 'Navy',
    icon: '⚓',
    ships: {
      'Carrier': {
        label: 'USS Marineford',
        color: '#475569',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="n-carrier" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>
            </defs>
            <!-- Hull -->
            <path d="M${w*.02},${h*.55} L${w*.1},${h*.88} L${w*.9},${h*.88} L${w*.98},${h*.55} Z" fill="url(#n-carrier)" stroke="#1e293b" stroke-width="1"/>
            <!-- Flight deck -->
            <rect x="${w*.05}" y="${h*.4}" width="${w*.9}" height="${h*.18}" rx="2" fill="#475569" stroke="#334155" stroke-width=".5"/>
            <!-- Runway lines -->
            <line x1="${w*.1}" y1="${h*.49}" x2="${w*.9}" y2="${h*.49}" stroke="#94a3b8" stroke-width=".5" stroke-dasharray="4 3"/>
            <!-- Island/tower -->
            <rect x="${w*.62}" y="${h*.2}" width="${w*.12}" height="${h*.22}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <rect x="${w*.64}" y="${h*.12}" width="${w*.04}" height="${h*.1}" rx="1" fill="#475569"/>
            <!-- Antenna -->
            <line x1="${w*.66}" y1="${h*.04}" x2="${w*.66}" y2="${h*.12}" stroke="#94a3b8" stroke-width="1.5"/>
            <circle cx="${w*.66}" cy="${h*.04}" r="2" fill="#22c55e"/>
            <!-- Aircraft on deck -->
            <path d="M${w*.15},${h*.44} l${w*.04},${h*.02} l${w*.02},-${h*.04} l${w*.02},${h*.04} l${w*.04},-${h*.02}" fill="none" stroke="#94a3b8" stroke-width="1"/>
            <path d="M${w*.35},${h*.44} l${w*.04},${h*.02} l${w*.02},-${h*.04} l${w*.02},${h*.04} l${w*.04},-${h*.02}" fill="none" stroke="#94a3b8" stroke-width="1"/>
            <!-- NAVY text -->
            <text x="${w*.35}" y="${h*.76}" font-size="${Math.min(w,h)*.08}" fill="#94a3b8" font-weight="bold" letter-spacing="2">NAVY</text>
          </svg>`
      },
      'Battleship': {
        label: 'Dreadnought',
        color: '#334155',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="n-dread" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#1e293b"/>
              </linearGradient>
            </defs>
            <!-- Hull -->
            <path d="M${w*.04},${h*.6} Q0,${h*.9} ${w*.12},${h*.85} L${w*.88},${h*.85} Q${w},${h*.9} ${w*.96},${h*.6} Z" fill="url(#n-dread)" stroke="#0f172a" stroke-width="1"/>
            <!-- Deck -->
            <rect x="${w*.08}" y="${h*.45}" width="${w*.84}" height="${h*.18}" rx="2" fill="#475569"/>
            <!-- Main turrets (3) -->
            <rect x="${w*.12}" y="${h*.38}" width="${w*.1}" height="${h*.1}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <line x1="${w*.17}" y1="${h*.32}" x2="${w*.17}" y2="${h*.38}" stroke="#475569" stroke-width="2"/>
            <rect x="${w*.42}" y="${h*.38}" width="${w*.1}" height="${h*.1}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <line x1="${w*.47}" y1="${h*.32}" x2="${w*.47}" y2="${h*.38}" stroke="#475569" stroke-width="2"/>
            <rect x="${w*.72}" y="${h*.38}" width="${w*.1}" height="${h*.1}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <line x1="${w*.77}" y1="${h*.32}" x2="${w*.77}" y2="${h*.38}" stroke="#475569" stroke-width="2"/>
            <!-- Bridge tower -->
            <rect x="${w*.53}" y="${h*.15}" width="${w*.14}" height="${h*.28}" rx="2" fill="#475569" stroke="#334155" stroke-width=".5"/>
            <rect x="${w*.56}" y="${h*.2}" width="${w*.08}" height="${h*.06}" rx="1" fill="#7dd3fc" opacity=".5"/>
            <!-- Antenna -->
            <line x1="${w*.6}" y1="${h*.05}" x2="${w*.6}" y2="${h*.15}" stroke="#94a3b8" stroke-width="1.5"/>
            <!-- Bow point -->
            <path d="M${w*.88},${h*.6} L${w*.98},${h*.55} L${w*.96},${h*.6}" fill="#475569" stroke="#334155" stroke-width=".5"/>
          </svg>`
      },
      'Cruiser': {
        label: 'Stealth Cruiser',
        color: '#1e293b',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="n-stealth" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#1e293b"/>
              </linearGradient>
            </defs>
            <!-- Angular stealth hull -->
            <polygon points="${w*.05},${h*.6} ${w*.15},${h*.85} ${w*.85},${h*.85} ${w*.95},${h*.6} ${w*.88},${h*.45} ${w*.12},${h*.45}" fill="url(#n-stealth)" stroke="#475569" stroke-width="1"/>
            <!-- Angular bridge -->
            <polygon points="${w*.35},${h*.45} ${w*.4},${h*.2} ${w*.6},${h*.2} ${w*.65},${h*.45}" fill="#334155" stroke="#475569" stroke-width=".5"/>
            <!-- Radar dome -->
            <circle cx="${w*.5}" cy="${h*.15}" r="${Math.min(w,h)*.05}" fill="#475569" stroke="#64748b" stroke-width=".5"/>
            <line x1="${w*.5}" y1="${h*.06}" x2="${w*.5}" y2="${h*.1}" stroke="#94a3b8" stroke-width="1"/>
            <!-- Missile tubes -->
            <rect x="${w*.18}" y="${h*.48}" width="${w*.12}" height="${h*.06}" rx="1" fill="#475569"/>
            <rect x="${w*.7}" y="${h*.48}" width="${w*.12}" height="${h*.06}" rx="1" fill="#475569"/>
            <!-- Hull number -->
            <text x="${w*.5}" y="${h*.75}" text-anchor="middle" font-size="${Math.min(w,h)*.1}" fill="#64748b" font-weight="bold">CG</text>
          </svg>`
      },
      'Submarine': {
        label: 'Nuclear Sub',
        color: '#1e293b',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="n-sub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#0f172a"/>
              </linearGradient>
            </defs>
            <!-- Sub hull -->
            <ellipse cx="${w*.5}" cy="${h*.6}" rx="${w*.46}" ry="${h*.24}" fill="url(#n-sub)" stroke="#475569" stroke-width="1"/>
            <!-- Conning tower -->
            <rect x="${w*.4}" y="${h*.28}" width="${w*.2}" height="${h*.2}" rx="3" fill="#334155" stroke="#475569" stroke-width=".8"/>
            <!-- Periscope -->
            <line x1="${w*.5}" y1="${h*.1}" x2="${w*.5}" y2="${h*.28}" stroke="#64748b" stroke-width="2"/>
            <rect x="${w*.48}" y="${h*.07}" width="${w*.04}" height="${h*.06}" rx="1" fill="#475569"/>
            <!-- Propeller -->
            <circle cx="${w*.06}" cy="${h*.6}" r="${Math.min(w,h)*.03}" fill="#64748b"/>
            <line x1="${w*.04}" y1="${h*.5}" x2="${w*.08}" y2="${h*.7}" stroke="#64748b" stroke-width="1.5"/>
            <line x1="${w*.08}" y1="${h*.5}" x2="${w*.04}" y2="${h*.7}" stroke="#64748b" stroke-width="1.5"/>
            <!-- Torpedo tubes -->
            <circle cx="${w*.92}" cy="${h*.55}" r="${Math.min(w,h)*.02}" fill="#475569" stroke="#64748b" stroke-width=".5"/>
            <circle cx="${w*.92}" cy="${h*.65}" r="${Math.min(w,h)*.02}" fill="#475569" stroke="#64748b" stroke-width=".5"/>
            <!-- Dive planes -->
            <line x1="${w*.78}" y1="${h*.5}" x2="${w*.88}" y2="${h*.45}" stroke="#475569" stroke-width="2"/>
            <line x1="${w*.78}" y1="${h*.7}" x2="${w*.88}" y2="${h*.75}" stroke="#475569" stroke-width="2"/>
            <!-- Hull number -->
            <text x="${w*.5}" y="${h*.65}" text-anchor="middle" font-size="${Math.min(w,h)*.09}" fill="#64748b" font-weight="bold">SSN</text>
          </svg>`
      },
      'Destroyer': {
        label: 'Destroyer',
        color: '#475569',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="n-dd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>
            </defs>
            <!-- Hull -->
            <path d="M${w*.06},${h*.55} Q0,${h*.85} ${w*.18},${h*.82} L${w*.82},${h*.82} Q${w},${h*.85} ${w*.94},${h*.55} Z" fill="url(#n-dd)" stroke="#1e293b" stroke-width="1"/>
            <!-- Deck -->
            <rect x="${w*.12}" y="${h*.42}" width="${w*.76}" height="${h*.16}" rx="2" fill="#475569"/>
            <!-- Forward gun -->
            <rect x="${w*.6}" y="${h*.35}" width="${w*.12}" height="${h*.1}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <line x1="${w*.72}" y1="${h*.4}" x2="${w*.82}" y2="${h*.37}" stroke="#334155" stroke-width="2"/>
            <!-- Bridge -->
            <rect x="${w*.32}" y="${h*.2}" width="${w*.18}" height="${h*.24}" rx="2" fill="#475569" stroke="#334155" stroke-width=".5"/>
            <rect x="${w*.35}" y="${h*.24}" width="${w*.12}" height="${h*.06}" rx="1" fill="#7dd3fc" opacity=".4"/>
            <!-- Radar mast -->
            <line x1="${w*.41}" y1="${h*.06}" x2="${w*.41}" y2="${h*.2}" stroke="#94a3b8" stroke-width="1.5"/>
            <ellipse cx="${w*.41}" cy="${h*.08}" rx="${w*.06}" ry="${h*.03}" fill="none" stroke="#64748b" stroke-width="1"/>
            <!-- DD label -->
            <text x="${w*.5}" y="${h*.72}" text-anchor="middle" font-size="${Math.min(w,h)*.1}" fill="#94a3b8" font-weight="bold">DD</text>
          </svg>`
      },
      'Patrol': {
        label: 'Patrol Boat',
        color: '#64748b',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <!-- Small rigid hull -->
            <path d="M${w*.1},${h*.55} Q${w*.05},${h*.82} ${w*.25},${h*.78} L${w*.75},${h*.78} Q${w*.95},${h*.82} ${w*.9},${h*.55} Z" fill="#475569" stroke="#334155" stroke-width="1"/>
            <!-- Cabin -->
            <rect x="${w*.3}" y="${h*.3}" width="${w*.25}" height="${h*.25}" rx="2" fill="#64748b" stroke="#334155" stroke-width=".5"/>
            <!-- Gun mount -->
            <circle cx="${w*.7}" cy="${h*.42}" r="${Math.min(w,h)*.05}" fill="#475569" stroke="#334155" stroke-width=".5"/>
            <line x1="${w*.7}" y1="${h*.42}" x2="${w*.82}" y2="${h*.35}" stroke="#334155" stroke-width="1.5"/>
            <!-- Flag -->
            <line x1="${w*.42}" y1="${h*.12}" x2="${w*.42}" y2="${h*.3}" stroke="#334155" stroke-width="1"/>
            <rect x="${w*.42}" y="${h*.12}" width="${w*.12}" height="${h*.1}" rx="1" fill="#3b82f6"/>
          </svg>`
      }
    }
  }
};

// ── Helpers ───────────────────────────────────────────────

let currentFaction = 'pirate'; // default

function setFaction(faction) {
  currentFaction = faction;
}

function getFaction() {
  return currentFaction;
}

function getShipSVGKey(name) {
  if (name.startsWith('Patrol')) return 'Patrol';
  return name;
}

function getShipSVG(name) {
  const key = getShipSVGKey(name);
  return ShipFactions[currentFaction].ships[key];
}

function getShipLabel(name) {
  const svg = getShipSVG(name);
  return svg ? svg.label : name;
}
