import { useState } from 'react';

interface BadgesScreenProps {
  onBack: () => void;
  badges: string[];
}

interface BadgeData {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const allBadges: BadgeData[] = [
  { id: 'FIRE', name: 'FIRE MASTER', icon: '🔥', description: 'Defeated the Fire Boss' },
  { id: 'ELEC', name: 'ELECTRIC CHAMPION', icon: '⚡', description: 'Defeated the Electric Boss' },
  { id: 'ACID', name: 'ACID SURVIVOR', icon: '☣️', description: 'Defeated the Acid Boss' },
  { id: 'FINAL BOSS', name: 'REALM CONQUEROR', icon: '👑', description: 'Defeated the Final Boss' },
  { id: 'FLOOD', name: 'FLOOD WALKER', icon: '🌊', description: 'Defeated the Flood Beast' },
  { id: 'SHARP', name: 'BLADE DANCER', icon: '⚔️', description: 'Defeated the Sharp Creature' },
  { id: 'NUCLEAR', name: 'RADIATION PROOF', icon: '☢️', description: 'Defeated the Nuclear Horror' },
];

export function BadgesScreen({ onBack, badges }: BadgesScreenProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-amber-900 overflow-hidden">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 z-20 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-amber-500"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        ← BACK TO MAP
      </button>

      {/* 标题 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="text-6xl tracking-wider text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          BADGES
        </h1>
        <p className="text-xl text-yellow-200 mt-2 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          {badges.length} / {allBadges.length} COLLECTED
        </p>
      </div>

      {/* 徽章网格 */}
      <div className="absolute inset-0 flex items-center justify-center pt-40 pb-20 px-20">
        <div className="w-full h-full max-w-6xl overflow-y-auto">
          <div className="grid grid-cols-4 gap-8 p-8">
            {allBadges.map(badge => {
              const isUnlocked = badges.includes(badge.id);
              return (
                <button
                  key={badge.id}
                  onClick={() => isUnlocked && setSelectedBadge(badge)}
                  className={`
                    relative aspect-square rounded-3xl border-4 p-8
                    transition-all duration-300 flex flex-col items-center justify-center gap-4
                    ${isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-300 to-amber-400 border-yellow-500 hover:scale-110 hover:shadow-2xl cursor-pointer' 
                      : 'bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {/* 徽章图标 */}
                  <div className={`text-8xl ${isUnlocked ? '' : 'grayscale opacity-30'}`}>
                    {isUnlocked ? badge.icon : '🔒'}
                  </div>

                  {/* 徽章名称 */}
                  <div className={`text-center ${isUnlocked ? 'text-amber-900' : 'text-gray-400'}`}>
                    <h3 className="tracking-wider text-sm" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {isUnlocked ? badge.name : '???'}
                    </h3>
                  </div>

                  {/* 发光效果 */}
                  {isUnlocked && (
                    <div className="absolute inset-0 rounded-3xl animate-pulse bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 选中徽章详情 */}
      {selectedBadge && (
        <div 
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 animate-in fade-in duration-200"
          onClick={() => setSelectedBadge(null)}
        >
          <div className="bg-gradient-to-br from-yellow-300 to-amber-400 rounded-3xl border-8 border-yellow-500 shadow-2xl p-12 text-center max-w-lg">
            <div className="text-9xl mb-6">{selectedBadge.icon}</div>
            <h2 className="text-5xl text-amber-900 mb-4 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {selectedBadge.name}
            </h2>
            <p className="text-xl text-amber-800 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {selectedBadge.description}
            </p>
          </div>
        </div>
      )}

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}
