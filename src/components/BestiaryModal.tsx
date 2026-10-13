import React from 'react';
import { X, BookOpen, AlertTriangle } from 'lucide-react';

interface BestiaryModalProps {
  onClose: () => void;
}

interface BestiaryEntry {
  name: string;
  threat: string;
  color: string;
  lore: string;
  tactics: string;
}

const ENTRIES: BestiaryEntry[] = [
  {
    name: 'Cinder Husk',
    threat: 'Lesser',
    color: '#6c757d',
    lore: 'Wandering husks of those who perished in the solar twilight. Mindless, drawn inexorably toward any spark of thermal light.',
    tactics: 'Fragile, but swarms quickly in early vigils. Yields 2 Embers when cleaved.',
  },
  {
    name: 'Umbral Crawler',
    threat: 'Fast Hunter',
    color: '#8338ec',
    lore: 'Skittering horrors that dwell within volcanic cracks. They ignore the Sparkbearer and sprint straight to the sacred Hearth.',
    tactics: 'High movement speed. Intercept them before they latch onto the Pyre.',
  },
  {
    name: 'Void Spitter',
    threat: 'Ranged',
    color: '#9b5de5',
    lore: 'Occult eye-masses floating in the cold void. They gather dark solar radiation and discharge explosive plasma spheres.',
    tactics: 'Maintains distance. Dash past their projectiles or purge with Supernova.',
  },
  {
    name: 'Frost Wanderer',
    threat: 'Disruptor',
    color: '#3a7ca5',
    lore: 'Born from absolute zero when coronal fires vanished. Their touch freezes blood and crystallized ground.',
    tactics: 'Fires chilling ice spikes that reduce your movement speed by 35%. Prioritize at range.',
  },
  {
    name: 'Eclipse Leecher',
    threat: 'Pyre Siphon',
    color: '#9e2a2b',
    lore: 'Parasitic shades with barbed tendrils tuned to siphon celestial essence directly from the Hearth.',
    tactics: 'Attacks Hearth directly. Stoking the Hearth pulse extinguishes nearby leechers.',
  },
  {
    name: 'Obsidian Spire',
    threat: 'Stationary Monolith',
    color: '#343a40',
    lore: 'Ancient pylons of dead stellar matter pushed through the floor. They resonate with deep abyssal frequency.',
    tactics: 'Periodic dark shockwaves across 220px. Destroy quickly or keep your distance.',
  },
  {
    name: 'Penumbra Goliath',
    threat: 'Armored Titan',
    color: '#240046',
    lore: 'Armored behemoths cast from fallen celestial hulls. Their thick obsidian plating shields them from frontal kinetic fire.',
    tactics: 'Possesses a blue Shield bar that absorbs incoming damage. Use Dawn Mortar or Nova to shatter.',
  },
  {
    name: 'Void Harbinger',
    threat: 'Sorcerer',
    color: '#7b2cbf',
    lore: 'Priests of the extinguished eclipse who tear open spatial rifts, blinking across the battlefield.',
    tactics: 'Teleports near the player and casts 4-way dark cross projectiles. Keep mobile.',
  },
  {
    name: 'The Hollow King',
    threat: 'The Extinction Sovereign',
    color: '#ff0055',
    lore: 'The apex terror of the dead sun. Crowned in shattered black stars, it seeks to devour the final light of creation.',
    tactics: 'Vigil 8 Boss. 3 distinct phases: Star Barrage (Phase 1), Maw Crescent & Swarm Summons (Phase 2), and Eclipse Slam & Extinction Nova (Phase 3).',
  },
];

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-[#f5efe6] font-sans">
      <div className="max-w-2xl w-full bg-[#0a0d14] border border-neutral-800 p-6 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#ffb703]" />
            <h2 className="font-display font-bold text-lg text-neutral-100">
              Sanctum Bestiary & Codex
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Codex"
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entries List */}
        <div className="overflow-y-auto my-4 pr-1 flex flex-col gap-3">
          {ENTRIES.map((entry) => (
            <div
              key={entry.name}
              className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-display font-bold text-sm text-neutral-200">
                    {entry.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  {entry.threat}
                </span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed mb-1.5">
                {entry.lore}
              </p>

              <div className="text-[11px] font-mono text-[#ffb703] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{entry.tactics}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded transition-colors cursor-pointer"
          >
            Close Codex
          </button>
        </div>
      </div>
    </div>
  );
};
