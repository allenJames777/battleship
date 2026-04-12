// ── Ship SVGs — Pirate & Navy Factions ────────────────────
// All ships drawn HORIZONTALLY. Hulls fill full height (to h*.97).

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
              <linearGradient id="ps-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#7c2d12"/>
              </linearGradient>
            </defs>
            <path d="M${w*.04},${h*.45} Q${w*.01},${h*.97} ${w*.12},${h*.97} L${w*.88},${h*.97} Q${w*.99},${h*.97} ${w*.96},${h*.45} Z" fill="url(#ps-hull)" stroke="#78350f" stroke-width="1"/>
            <rect x="${w*.08}" y="${h*.32}" width="${w*.84}" height="${h*.16}" rx="2" fill="#d97706"/>
            <rect x="${w*.35}" y="${h*.1}" width="${w*.3}" height="${h*.24}" rx="3" fill="#fbbf24" stroke="#b45309" stroke-width=".5"/>
            <line x1="${w*.5}" y1="${h*.02}" x2="${w*.5}" y2="${h*.32}" stroke="#78350f" stroke-width="2"/>
            <path d="M${w*.3},${h*.05} L${w*.5},${h*.02} L${w*.5},${h*.25} L${w*.28},${h*.23} Z" fill="white" opacity=".85"/>
            <text x="${w*.4}" y="${h*.16}" text-anchor="middle" font-size="${Math.min(w,h)*.08}" fill="#1f2937">☠</text>
            <circle cx="${w*.92}" cy="${h*.38}" r="${Math.min(w,h)*.06}" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
            <rect x="${w*.1}" y="${h*.34}" width="${w*.18}" height="${h*.07}" rx="1" fill="#22c55e" opacity=".5"/>
          </svg>`
      },
      'Battleship': {
        label: 'Moby Dick',
        color: '#c8d8e8',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="pm-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dce6f0"/>
                <stop offset="100%" stop-color="#a8b8cc"/>
              </linearGradient>
            </defs>
            <path d="M${w*.03},${h*.45} Q${w*.01},${h*.97} ${w*.1},${h*.97} L${w*.9},${h*.97} Q${w*.99},${h*.97} ${w*.97},${h*.45} Z" fill="url(#pm-hull)" stroke="#5060aa" stroke-width="1.5"/>
            <ellipse cx="${w*.94}" cy="${h*.42}" rx="${w*.07}" ry="${h*.1}" fill="#dce6f0" stroke="#5060aa" stroke-width="1"/>
            <circle cx="${w*.96}" cy="${h*.38}" r="2" fill="#1e293b"/>
            <rect x="${w*.06}" y="${h*.32}" width="${w*.86}" height="${h*.16}" rx="2" fill="#c0d0e4"/>
            <line x1="${w*.3}" y1="${h*.04}" x2="${w*.3}" y2="${h*.32}" stroke="#5060aa" stroke-width="2"/>
            <path d="M${w*.15},${h*.06} L${w*.3},${h*.04} L${w*.3},${h*.24} L${w*.13},${h*.22} Z" fill="#e8f0ff"/>
            <line x1="${w*.6}" y1="${h*.06}" x2="${w*.6}" y2="${h*.32}" stroke="#5060aa" stroke-width="2"/>
            <path d="M${w*.45},${h*.08} L${w*.6},${h*.06} L${w*.6},${h*.26} L${w*.43},${h*.24} Z" fill="#e8f0ff"/>
            <text x="${w*.38}" y="${h*.18}" text-anchor="middle" font-size="${Math.min(w,h)*.09}" fill="#7c3aed" font-weight="bold">✚</text>
          </svg>`
      },
      'Cruiser': {
        label: 'Going Merry',
        color: '#f0d860',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.04},${h*.45} Q${w*.01},${h*.97} ${w*.12},${h*.97} L${w*.88},${h*.97} Q${w*.99},${h*.97} ${w*.96},${h*.45} Z" fill="#e8b830" stroke="#a06010" stroke-width="1.5"/>
            <rect x="${w*.08}" y="${h*.34}" width="${w*.84}" height="${h*.14}" rx="2" fill="#f0c840"/>
            <rect x="${w*.25}" y="${h*.12}" width="${w*.35}" height="${h*.24}" rx="3" fill="#fff8e0" stroke="#c08020" stroke-width=".5"/>
            <rect x="${w*.3}" y="${h*.18}" width="${w*.1}" height="${h*.08}" rx="1" fill="#60b0e0"/>
            <rect x="${w*.44}" y="${h*.18}" width="${w*.1}" height="${h*.08}" rx="1" fill="#60b0e0"/>
            <line x1="${w*.5}" y1="${h*.02}" x2="${w*.5}" y2="${h*.34}" stroke="#804010" stroke-width="2"/>
            <path d="M${w*.3},${h*.05} L${w*.5},${h*.02} L${w*.5},${h*.26} L${w*.28},${h*.24} Z" fill="#fff0d0"/>
            <circle cx="${w*.9}" cy="${h*.34}" r="${Math.min(w,h)*.07}" fill="#fff0d0" stroke="#c08020" stroke-width="1"/>
            <circle cx="${w*.93}" cy="${h*.31}" r="${Math.min(w,h)*.02}" fill="#1e293b"/>
          </svg>`
      },
      'Submarine': {
        label: 'Polar Tang',
        color: '#fde047',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="pp-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fde047"/>
                <stop offset="100%" stop-color="#ca8a04"/>
              </linearGradient>
            </defs>
            <ellipse cx="${w*.5}" cy="${h*.55}" rx="${w*.47}" ry="${h*.38}" fill="url(#pp-hull)" stroke="#a16207" stroke-width="1"/>
            <rect x="${w*.38}" y="${h*.1}" width="${w*.24}" height="${h*.22}" rx="4" fill="#facc15" stroke="#a16207" stroke-width=".8"/>
            <line x1="${w*.5}" y1="${h*.02}" x2="${w*.5}" y2="${h*.1}" stroke="#78350f" stroke-width="2"/>
            <rect x="${w*.47}" y="${h*.01}" width="${w*.06}" height="${h*.06}" rx="1" fill="#a16207"/>
            <circle cx="${w*.5}" cy="${h*.55}" r="${Math.min(w,h)*.1}" fill="white" opacity=".7"/>
            <text x="${w*.5}" y="${h*.6}" text-anchor="middle" font-size="${Math.min(w,h)*.12}" fill="#dc2626">♥</text>
            <circle cx="${w*.22}" cy="${h*.52}" r="${Math.min(w,h)*.04}" fill="#7dd3fc" stroke="#a16207" stroke-width="1"/>
            <circle cx="${w*.78}" cy="${h*.52}" r="${Math.min(w,h)*.04}" fill="#7dd3fc" stroke="#a16207" stroke-width="1"/>
          </svg>`
      },
      'Destroyer': {
        label: 'Striker',
        color: '#f97316',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.06},${h*.42} Q${w*.01},${h*.97} ${w*.15},${h*.97} L${w*.85},${h*.97} Q${w*.99},${h*.97} ${w*.94},${h*.42} Z" fill="#f97316" stroke="#c2410c" stroke-width="1"/>
            <rect x="${w*.28}" y="${h*.2}" width="${w*.35}" height="${h*.24}" rx="3" fill="#fdba74" stroke="#c2410c" stroke-width=".5"/>
            <path d="M${w*.04},${h*.38} Q${w*-.04},${h*.44} ${w*.01},${h*.5}" fill="#ef4444" opacity=".8"/>
            <text x="${w*.55}" y="${h*.38}" text-anchor="middle" font-size="${Math.min(w,h)*.18}" fill="#1e293b">♠</text>
          </svg>`
      },
      'Patrol': {
        label: 'Mini Merry',
        color: '#c090ff',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.08},${h*.4} Q${w*.03},${h*.95} ${w*.2},${h*.95} L${w*.8},${h*.95} Q${w*.97},${h*.95} ${w*.92},${h*.4} Z" fill="#c8a0ff" stroke="#8040d0" stroke-width="1.5"/>
            <line x1="${w*.5}" y1="${h*.08}" x2="${w*.5}" y2="${h*.4}" stroke="#6020a0" stroke-width="1.5"/>
            <path d="M${w*.5},${h*.08} L${w*.72},${h*.16} L${w*.5},${h*.24} Z" fill="#ff70b0"/>
            <text x="${w*.5}" y="${h*.62}" text-anchor="middle" font-size="${Math.min(w,h)*.2}" fill="#4c1d95">☠</text>
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
        color: '#7090b0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="nc-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8899aa"/>
                <stop offset="100%" stop-color="#556677"/>
              </linearGradient>
            </defs>
            <path d="M${w*.02},${h*.45} L${w*.08},${h*.97} L${w*.92},${h*.97} L${w*.98},${h*.45} Z" fill="url(#nc-hull)" stroke="#334455" stroke-width="1"/>
            <rect x="${w*.04}" y="${h*.32}" width="${w*.92}" height="${h*.16}" rx="2" fill="#6b8399" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.08}" y1="${h*.4}" x2="${w*.92}" y2="${h*.4}" stroke="#b0c4d8" stroke-width=".5" stroke-dasharray="4 3"/>
            <rect x="${w*.62}" y="${h*.1}" width="${w*.12}" height="${h*.24}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.68}" y1="${h*.02}" x2="${w*.68}" y2="${h*.1}" stroke="#b0c4d8" stroke-width="1.5"/>
            <circle cx="${w*.68}" cy="${h*.02}" r="2" fill="#22c55e"/>
            <text x="${w*.35}" y="${h*.72}" font-size="${Math.min(w,h)*.08}" fill="#d0dde8" font-weight="bold" letter-spacing="2">NAVY</text>
          </svg>`
      },
      'Battleship': {
        label: 'Dreadnought',
        color: '#7090b0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="nd-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8899aa"/>
                <stop offset="100%" stop-color="#556677"/>
              </linearGradient>
            </defs>
            <path d="M${w*.03},${h*.5} Q${w*.01},${h*.97} ${w*.1},${h*.97} L${w*.9},${h*.97} Q${w*.99},${h*.97} ${w*.97},${h*.5} Z" fill="url(#nd-hull)" stroke="#334455" stroke-width="1"/>
            <rect x="${w*.06}" y="${h*.36}" width="${w*.88}" height="${h*.16}" rx="2" fill="#6b8399"/>
            <rect x="${w*.1}" y="${h*.28}" width="${w*.1}" height="${h*.1}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.15}" y1="${h*.22}" x2="${w*.15}" y2="${h*.28}" stroke="#6b8399" stroke-width="2"/>
            <rect x="${w*.42}" y="${h*.28}" width="${w*.1}" height="${h*.1}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.47}" y1="${h*.22}" x2="${w*.47}" y2="${h*.28}" stroke="#6b8399" stroke-width="2"/>
            <rect x="${w*.72}" y="${h*.28}" width="${w*.1}" height="${h*.1}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.77}" y1="${h*.22}" x2="${w*.77}" y2="${h*.28}" stroke="#6b8399" stroke-width="2"/>
            <rect x="${w*.53}" y="${h*.06}" width="${w*.14}" height="${h*.28}" rx="2" fill="#6b8399" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.6}" y1="${h*.02}" x2="${w*.6}" y2="${h*.06}" stroke="#b0c4d8" stroke-width="1.5"/>
          </svg>`
      },
      'Cruiser': {
        label: 'Stealth Cruiser',
        color: '#6080a0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="ns-hull" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#7a90a8"/>
                <stop offset="100%" stop-color="#506878"/>
              </linearGradient>
            </defs>
            <polygon points="${w*.04},${h*.5} ${w*.12},${h*.97} ${w*.88},${h*.97} ${w*.96},${h*.5} ${w*.88},${h*.35} ${w*.12},${h*.35}" fill="url(#ns-hull)" stroke="#3a5060" stroke-width="1"/>
            <polygon points="${w*.35},${h*.35} ${w*.4},${h*.1} ${w*.6},${h*.1} ${w*.65},${h*.35}" fill="#6b8399" stroke="#3a5060" stroke-width=".5"/>
            <circle cx="${w*.5}" cy="${h*.08}" r="${Math.min(w,h)*.05}" fill="#8899aa" stroke="#a0b0c0" stroke-width=".5"/>
            <rect x="${w*.16}" y="${h*.38}" width="${w*.14}" height="${h*.06}" rx="1" fill="#8090a0"/>
            <rect x="${w*.7}" y="${h*.38}" width="${w*.14}" height="${h*.06}" rx="1" fill="#8090a0"/>
            <text x="${w*.5}" y="${h*.72}" text-anchor="middle" font-size="${Math.min(w,h)*.1}" fill="#c0d0e0" font-weight="bold">CG</text>
          </svg>`
      },
      'Submarine': {
        label: 'Nuclear Sub',
        color: '#6080a0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="nsub-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7a90a8"/>
                <stop offset="100%" stop-color="#506878"/>
              </linearGradient>
            </defs>
            <ellipse cx="${w*.5}" cy="${h*.55}" rx="${w*.47}" ry="${h*.38}" fill="url(#nsub-hull)" stroke="#3a5060" stroke-width="1"/>
            <rect x="${w*.4}" y="${h*.12}" width="${w*.2}" height="${h*.2}" rx="3" fill="#6b8399" stroke="#3a5060" stroke-width=".8"/>
            <line x1="${w*.5}" y1="${h*.02}" x2="${w*.5}" y2="${h*.12}" stroke="#8899aa" stroke-width="2"/>
            <rect x="${w*.48}" y="${h*.01}" width="${w*.04}" height="${h*.06}" rx="1" fill="#8090a0"/>
            <circle cx="${w*.06}" cy="${h*.55}" r="${Math.min(w,h)*.03}" fill="#8899aa"/>
            <circle cx="${w*.92}" cy="${h*.48}" r="${Math.min(w,h)*.02}" fill="#8090a0" stroke="#a0b0c0" stroke-width=".5"/>
            <circle cx="${w*.92}" cy="${h*.62}" r="${Math.min(w,h)*.02}" fill="#8090a0" stroke="#a0b0c0" stroke-width=".5"/>
            <text x="${w*.5}" y="${h*.6}" text-anchor="middle" font-size="${Math.min(w,h)*.09}" fill="#c0d0e0" font-weight="bold">SSN</text>
          </svg>`
      },
      'Destroyer': {
        label: 'Destroyer',
        color: '#7090b0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <defs>
              <linearGradient id="ndd-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#8899aa"/>
                <stop offset="100%" stop-color="#556677"/>
              </linearGradient>
            </defs>
            <path d="M${w*.05},${h*.45} Q${w*.01},${h*.97} ${w*.14},${h*.97} L${w*.86},${h*.97} Q${w*.99},${h*.97} ${w*.95},${h*.45} Z" fill="url(#ndd-hull)" stroke="#334455" stroke-width="1"/>
            <rect x="${w*.1}" y="${h*.34}" width="${w*.8}" height="${h*.14}" rx="2" fill="#6b8399"/>
            <rect x="${w*.6}" y="${h*.24}" width="${w*.14}" height="${h*.12}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.74}" y1="${h*.3}" x2="${w*.84}" y2="${h*.26}" stroke="#4a6070" stroke-width="2"/>
            <rect x="${w*.3}" y="${h*.1}" width="${w*.2}" height="${h*.26}" rx="2" fill="#6b8399" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.4}" y1="${h*.02}" x2="${w*.4}" y2="${h*.1}" stroke="#b0c4d8" stroke-width="1.5"/>
            <ellipse cx="${w*.4}" cy="${h*.04}" rx="${w*.06}" ry="${h*.03}" fill="none" stroke="#8899aa" stroke-width="1"/>
            <text x="${w*.5}" y="${h*.72}" text-anchor="middle" font-size="${Math.min(w,h)*.1}" fill="#d0dde8" font-weight="bold">DD</text>
          </svg>`
      },
      'Patrol': {
        label: 'Patrol Boat',
        color: '#7090b0',
        svg: (w, h) => `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
            <path d="M${w*.08},${h*.45} Q${w*.03},${h*.95} ${w*.2},${h*.95} L${w*.8},${h*.95} Q${w*.97},${h*.95} ${w*.92},${h*.45} Z" fill="#6b8399" stroke="#3a5060" stroke-width="1"/>
            <rect x="${w*.28}" y="${h*.18}" width="${w*.28}" height="${h*.28}" rx="2" fill="#8899aa" stroke="#4a6070" stroke-width=".5"/>
            <circle cx="${w*.72}" cy="${h*.35}" r="${Math.min(w,h)*.06}" fill="#6b8399" stroke="#4a6070" stroke-width=".5"/>
            <line x1="${w*.72}" y1="${h*.35}" x2="${w*.84}" y2="${h*.26}" stroke="#4a6070" stroke-width="1.5"/>
            <line x1="${w*.42}" y1="${h*.06}" x2="${w*.42}" y2="${h*.18}" stroke="#4a6070" stroke-width="1"/>
            <rect x="${w*.42}" y="${h*.06}" width="${w*.12}" height="${h*.08}" rx="1" fill="#4488cc"/>
          </svg>`
      }
    }
  }
};

// ── Helpers ───────────────────────────────────────────────

let currentFaction = 'pirate';

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
