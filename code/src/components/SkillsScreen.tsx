import { useState } from 'react';
import { SkillCard, SkillCardData } from './SkillCard';
import { allSkillCards } from '../data/skillCards';

interface SkillsScreenProps {
  onBack: () => void;
  playerCards: SkillCardData[]; // 玩家拥有的卡牌
}

export function SkillsScreen({ onBack, playerCards }: SkillsScreenProps) {
  const [selectedCard, setSelectedCard] = useState<SkillCardData | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ATTACK' | 'DEFEND' | 'HEAL'>('ALL');

  const filteredCards = activeTab === 'ALL' 
    ? playerCards 
    : playerCards.filter(card => card.type === activeTab);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 overflow-hidden">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 z-20 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-amber-500"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        ← BACK TO MAP
      </button>

      {/* 标题 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-6xl tracking-wider text-pink-300 drop-shadow-[0_0_20px_rgba(244,114,182,0.6)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          SKILL CARDS
        </h1>
      </div>

      {/* 分类标签 */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        {(['ALL', 'ATTACK', 'DEFEND', 'HEAL'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-2 rounded-xl border-2 transition-all duration-200 tracking-wider
              ${activeTab === tab 
                ? 'bg-pink-500 border-pink-300 text-white scale-110' 
                : 'bg-purple-800/50 border-purple-500 text-purple-200 hover:bg-purple-700/70'
              }
            `}
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 主内容区 */}
      <div className="absolute inset-0 flex items-center justify-center pt-48 pb-20 px-20">
        <div className="relative w-full h-full max-w-7xl">
          {/* 卡牌网格 */}
          <div className="w-full h-full overflow-y-auto px-8 py-8">
            <div className="flex flex-wrap gap-8 justify-center">
              {filteredCards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                >
                  <SkillCard 
                    card={card} 
                    isSelected={selectedCard?.id === card.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 选中的卡牌放大显示 */}
      {selectedCard && (
        <div 
          className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 animate-in fade-in duration-200"
          onClick={() => setSelectedCard(null)}
        >
          <div className="scale-150">
            <SkillCard card={selectedCard} />
          </div>
        </div>
      )}

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}