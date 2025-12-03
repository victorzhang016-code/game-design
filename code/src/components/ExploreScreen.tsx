import { useState, useEffect } from 'react';
import { SkillCard, SkillCardData } from './SkillCard';
import { allSkillCards } from '../data/skillCards';

interface ExploreScreenProps {
  onBack: () => void;
  onComplete: () => void; // 完成探索时调用
  onRewards: (rewards: ExploreReward[]) => void;
  ownedCardIds: string[]; // 玩家已拥有的卡牌ID列表
  explorableCards: SkillCardData[]; // 可探索的卡牌池
  currentTile: number; // 当前格子位置
}

export interface ExploreReward {
  type: 'card' | 'health' | 'shield';
  card?: SkillCardData;
  amount?: number;
}

interface Item {
  id: string;
  type: 'card' | 'health' | 'shield';
  icon: string;
  name: string;
  x: number;
  y: number;
  collected: boolean;
  reward: ExploreReward;
}

export function ExploreScreen({ onBack, onComplete, onRewards, ownedCardIds, explorableCards, currentTile }: ExploreScreenProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [collectedRewards, setCollectedRewards] = useState<ExploreReward[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 70 });

  // 背景景物
  const sceneryTypes = [
    '🌳', '🌲', '🪨', '🌿', '🌾', '🪴', '🏔️', '⛰️'
  ];

  // 随机生成地图 - 改为只有1个道具
  const generateMap = () => {
    const newItems: Item[] = [];
    const usedCardIds = new Set<string>();
    
    // 只生成1个道具
    const itemTypes: ('card' | 'health' | 'shield')[] = [];
    
    // 随机选择1种奖励
    const rand = Math.random();
    
    // 所有区域都能找到卡牌
    if (explorableCards.length > 0) {
      // 70%概率卡牌，20%治疗，10%护盾
      if (rand < 0.7) {
        itemTypes.push('card'); // 70%概率卡牌
      } else if (rand < 0.9) {
        itemTypes.push('health'); // 20%概率治疗
      } else {
        itemTypes.push('shield'); // 10%概率护盾
      }
    } else {
      // 如果没有可探索卡牌了，只有治疗和护盾
      if (rand < 0.6) {
        itemTypes.push('health'); // 60%概率治疗
      } else {
        itemTypes.push('shield'); // 40%概率护盾
      }
    }
    
    // 生成1个道具
    itemTypes.forEach((type, index) => {
      const x = 40 + Math.random() * 20; // 居中放置
      const y = 30 + Math.random() * 30;
      
      if (type === 'card') {
        // 从可探索卡池中选择未拥有的卡牌
        const availableCards = explorableCards.filter(c => !usedCardIds.has(c.id) && !ownedCardIds.includes(c.id));
        if (availableCards.length > 0) {
          const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
          usedCardIds.add(randomCard.id);
          
          newItems.push({
            id: `item-card-${index}-${Date.now()}`,
            type: 'card',
            icon: randomCard.icon,
            name: randomCard.name,
            x,
            y,
            collected: false,
            reward: { type: 'card', card: randomCard },
          });
        } else {
          // 如果没有可用卡牌，改为治疗
          newItems.push({
            id: `item-health-${index}-${Date.now()}`,
            type: 'health',
            icon: '❤️',
            name: 'HEALTH +5',
            x,
            y,
            collected: false,
            reward: { type: 'health', amount: 5 },
          });
        }
      } else if (type === 'health') {
        newItems.push({
          id: `item-health-${index}-${Date.now()}`,
          type: 'health',
          icon: '❤️',
          name: 'HEALTH +5',
          x,
          y,
          collected: false,
          reward: { type: 'health', amount: 5 },
        });
      } else {
        newItems.push({
          id: `item-shield-${index}-${Date.now()}`,
          type: 'shield',
          icon: '🛡️',
          name: 'SHIELD',
          x,
          y,
          collected: false,
          reward: { type: 'shield', amount: 1 },
        });
      }
    });

    setItems(newItems);
    setCollectedCount(0);
    setCollectedRewards([]);
  };

  // 初始化时生成地图
  useEffect(() => {
    generateMap();
  }, []);

  // 收集道具
  const collectItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && !item.collected) {
      setItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, collected: true } : i
      ));
      setCollectedCount(prev => prev + 1);
      setCollectedRewards(prev => [...prev, item.reward]);
    }
  };

  // 完成探索
  const handleComplete = () => {
    onRewards(collectedRewards);
    onComplete();
    onBack();
  };

  // 随机背景景物位置
  const [scenery] = useState(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      icon: sceneryTypes[Math.floor(Math.random() * sceneryTypes.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 2, // 2-4rem
    }));
  });

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 overflow-hidden">
      {/* 返回按钮 - 只在未收集完时显示 */}
      {collectedCount < items.length && (
        <button
          onClick={handleComplete}
          className="absolute top-8 left-8 z-30 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-amber-500"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          ← FINISH EXPLORING
        </button>
      )}

      {/* 标题和收集计数 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
        <h1 className="text-6xl tracking-wider text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          EXPLORE
        </h1>
        <div className="px-4 py-2 bg-green-900/80 rounded-lg border-2 border-yellow-400">
          <span className="text-xl text-yellow-300 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            COLLECTED: {collectedCount} / {items.length}
          </span>
        </div>
        
        {/* 完成提示 */}
        {collectedCount === items.length && (
          <div className="mt-2 px-6 py-3 bg-green-500 rounded-xl border-2 border-green-300 animate-pulse">
            <span className="text-xl text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ✅ ALL ITEMS COLLECTED!
            </span>
          </div>
        )}
      </div>

      {/* 探索区域 */}
      <div className="absolute inset-0 flex items-center justify-center p-20 pt-32">
        <div className="relative w-full h-full max-w-6xl bg-gradient-to-br from-lime-200 via-green-100 to-emerald-200 rounded-3xl border-8 border-green-500 shadow-[0_8px_32px_rgba(34,197,94,0.4)] overflow-hidden">
          {/* 背景图案 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(34,197,94,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* 背景景物层 */}
          <div className="absolute inset-0">
            {scenery.map(s => (
              <div
                key={s.id}
                className="absolute opacity-30 pointer-events-none"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  fontSize: `${s.size}rem`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {s.icon}
              </div>
            ))}
          </div>

          {/* 道具层 */}
          <div className="absolute inset-0">
            {items.map(item => (
              <div
                key={item.id}
                className={`absolute transition-all duration-300 ${
                  item.collected ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => collectItem(item.id)}
                  disabled={item.collected}
                  className={`
                    relative w-24 h-24 rounded-2xl bg-gradient-to-br 
                    ${item.type === 'card' ? 'from-purple-200 to-pink-300 border-purple-400' : 
                      item.type === 'health' ? 'from-red-200 to-pink-300 border-red-400' : 
                      'from-blue-200 to-cyan-300 border-blue-400'}
                    border-4 shadow-lg
                    hover:scale-110 hover:shadow-xl
                    transition-all duration-200 cursor-pointer
                    flex flex-col items-center justify-center gap-1
                    ${item.collected ? 'pointer-events-none' : ''}
                  `}
                >
                  <div className="text-4xl animate-bounce">{item.icon}</div>
                  <div className="text-[9px] text-gray-900 tracking-wide px-1 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {item.name}
                  </div>
                  
                  {/* 闪光效果 */}
                  {!item.collected && (
                    <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* 玩家角色 */}
          <div
            className="absolute transition-all duration-500 z-20"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-blue-300 shadow-xl flex items-center justify-center">
                <div className="text-5xl">🎒</div>
              </div>
              {/* 玩家名称 */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-lg border-2 border-blue-400 shadow-lg whitespace-nowrap">
                <div className="text-sm text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  EXPLORER
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 收集摘要 */}
      {collectedCount > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4 items-center bg-black/60 px-6 py-3 rounded-2xl border-2 border-yellow-400">
          <span className="text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            REWARDS:
          </span>
          {collectedRewards.filter(r => r.type === 'card').length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded-lg">
              <span className="text-2xl">🎴</span>
              <span className="text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                x{collectedRewards.filter(r => r.type === 'card').length}
              </span>
            </div>
          )}
          {collectedRewards.filter(r => r.type === 'health').length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-lg">
              <span className="text-2xl">❤️</span>
              <span className="text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                +{collectedRewards.filter(r => r.type === 'health').reduce((sum, r) => sum + (r.amount || 0), 0)}
              </span>
            </div>
          )}
          {collectedRewards.filter(r => r.type === 'shield').length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-lg">
              <span className="text-2xl">🛡️</span>
              <span className="text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                x{collectedRewards.filter(r => r.type === 'shield').length}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* 收集完成后的返回按钮 - 放大居中显示 */}
      {collectedCount === items.length && items.length > 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <button
            onClick={handleComplete}
            className="px-12 py-6 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-2xl transition-all duration-200 tracking-wider border-4 border-green-300 hover:scale-110 animate-pulse"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-3xl flex items-center gap-4">
              🗺️ RETURN TO MAP
            </span>
          </button>
        </div>
      )}

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}