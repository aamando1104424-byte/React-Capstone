// The pictures at the top of each card, drawn as SVG so they take the colours
// of the element and the rank without any image files.

// A horned skull. Bosses get a crown, and the eyes burn the demon's colour.
export function DemonPortrait({ element, boss, phaseTwo }) {
    return (
        <div className={"portrait demon-portrait " + element + (boss ? " boss" : "") + (phaseTwo ? " phase-two" : "")} aria-hidden="true">
            <svg viewBox="0 0 100 100">
                <defs>
                    <radialGradient id="skullFill" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#3a332c" />
                        <stop offset="100%" stopColor="#0d0b09" />
                    </radialGradient>
                    <filter id="eyeGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="2.4" />
                    </filter>
                </defs>
                {boss && (
                    <path className="crown" d="M28 22 L32 6 L40 16 L50 2 L60 16 L68 6 L72 22 Z" />
                )}
                <path className="horn" d="M26 40 C10 30 6 14 12 2 C16 16 24 24 36 30 Z" />
                <path className="horn" d="M74 40 C90 30 94 14 88 2 C84 16 76 24 64 30 Z" />
                <path className="skull" d="M50 18 C30 18 20 32 20 48 C20 60 26 66 32 70 L32 84 L68 84 L68 70 C74 66 80 60 80 48 C80 32 70 18 50 18 Z" fill="url(#skullFill)" />
                <g className="eyes">
                    <ellipse cx="38" cy="50" rx="8" ry="6" filter="url(#eyeGlow)" />
                    <ellipse cx="62" cy="50" rx="8" ry="6" filter="url(#eyeGlow)" />
                    <ellipse className="pupil" cx="38" cy="50" rx="3.5" ry="2.6" />
                    <ellipse className="pupil" cx="62" cy="50" rx="3.5" ry="2.6" />
                </g>
                <path className="nose" d="M50 58 L45.5 67 L54.5 67 Z" />
                <path className="teeth" d="M36 75 H64 M40 72 V84 M46 72 V84 M52 72 V84 M58 72 V84" />
            </svg>
        </div>
    );
}

// Aldric: a beggar's hood until Knight, a helm from Knight on, and a halo
// when he is a Saint.
export function HeroPortrait({ level, maxLevel }) {
    const knight = level >= 5;
    const saint = level >= maxLevel;
    return (
        <div className={"portrait hero-portrait" + (saint ? " saint" : "")} aria-hidden="true">
            <svg viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="helmFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#9aa3ad" />
                        <stop offset="55%" stopColor="#4b525a" />
                        <stop offset="100%" stopColor="#1e2226" />
                    </linearGradient>
                    <linearGradient id="hoodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5a4a3a" />
                        <stop offset="100%" stopColor="#1d1712" />
                    </linearGradient>
                </defs>
                {saint && <ellipse className="halo" cx="50" cy="12" rx="26" ry="6" />}
                {knight ? (
                    <>
                        <path className="plume" d="M50 14 C58 2 76 0 86 8 C74 8 64 12 56 20 Z" />
                        <path d="M50 14 C30 14 22 30 22 48 L22 72 C22 82 34 90 50 90 C66 90 78 82 78 72 L78 48 C78 30 70 14 50 14 Z" fill="url(#helmFill)" stroke="#0c0d0f" strokeWidth="1.5" />
                        <rect className="visor" x="27" y="44" width="46" height="7" rx="2" />
                        <path d="M50 54 V84" stroke="#15181b" strokeWidth="2.5" />
                        <path d="M38 62 V74 M44 62 V76 M56 62 V76 M62 62 V74" stroke="#15181b" strokeWidth="1.6" />
                    </>
                ) : (
                    <>
                        <path d="M50 8 C24 12 16 40 18 62 L12 94 L88 94 L82 62 C84 40 76 12 50 8 Z" fill="url(#hoodFill)" stroke="#0c0a08" strokeWidth="1.5" />
                        <ellipse cx="50" cy="56" rx="20" ry="24" fill="#080605" />
                        <ellipse className="visor" cx="42" cy="54" rx="2.6" ry="1.6" />
                        <ellipse className="visor" cx="58" cy="54" rx="2.6" ry="1.6" />
                    </>
                )}
            </svg>
        </div>
    );
}
