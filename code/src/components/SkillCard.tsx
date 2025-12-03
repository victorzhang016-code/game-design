export interface SkillCardData {
  id: string;
  name: string;
  type: 'ATTACK' | 'DEFEND' | 'HEAL';
  description: string;
  icon: string;
  power: number;
  image?: string; // 可选的图片路径
  removeBurn?: boolean; // 可选：是否能消除灼烧状态
  counterSkill?: string; // 可选：可以反制的敌人技能名称
  counterDamage?: number; // 可选：反制成功时的额外伤害
  counterShield?: number; // 可选：反制成功时获得的护盾值
  counterHeal?: number; // 可选：反制成功时治疗的HP值
  removesEnemyBurn?: boolean; // 可选：是否移除敌人的灼烧效果
  isUniversalCounter?: boolean; // 可选：是否为通用反制卡
  counterClearDebuffs?: boolean; // 可选：反制成功时清除所有负面状态
  providesShield?: number; // 可选：攻击的同时提供护盾值
  counterReflect?: number; // 可选：反制成功时反弹伤害的比例（0-1）
}

interface SkillCardProps {
  card: SkillCardData;
  onClick?: () => void;
  isSelected?: boolean;
  inHand?: boolean;
  index?: number;
}

export function SkillCard({ card, onClick, isSelected, inHand, index = 0 }: SkillCardProps) {
  const typeColors = {
    ATTACK: 'from-red-500 to-orange-600',
    DEFEND: 'from-blue-500 to-indigo-600',
    HEAL: 'from-green-500 to-emerald-600',
  };

  const typeBorderColors = {
    ATTACK: 'border-red-400',
    DEFEND: 'border-blue-400',
    HEAL: 'border-green-400',
  };

  const typeTextColors = {
    ATTACK: 'text-red-900',
    DEFEND: 'text-blue-900',
    HEAL: 'text-green-900',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative w-48 h-72 cursor-pointer transition-all duration-300
        ${inHand ? 'hover:-translate-y-8 hover:scale-110 hover:z-50' : ''}
        ${isSelected ? 'scale-110 z-50' : ''}
      `}
      style={inHand ? {
        transform: `rotate(${(index - 2) * 5}deg)`,
      } : {}}
    >
      <div className={`
        w-full h-full rounded-2xl border-4 ${typeBorderColors[card.type]}
        bg-gradient-to-br ${typeColors[card.type]}
        shadow-2xl overflow-hidden flex flex-col
      `}>
        {/* 卡牌图案区域 */}
        <div className="flex-1 bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center p-4 border-b-4 border-amber-900/20 overflow-hidden">
          {card.image ? (
            <img src={card.image} alt={card.name} className="w-full h-full object-contain" style={{ transform: 'scale(1.5)' }} />
          ) : (
            <div className="text-8xl">{card.icon}</div>
          )}
        </div>

        {/* 卡牌信息区域 */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-100">
          <h3 className={`text-center tracking-wider mb-2 ${typeTextColors[card.type]}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            {card.name}
          </h3>
          <p className="text-xs text-center text-amber-900 leading-tight">
            {card.description}
          </p>
        </div>

        {/* 能量值 */}
        <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-yellow-400 border-3 border-yellow-600 flex items-center justify-center shadow-lg">
          <span className="text-xl text-yellow-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            {card.power}
          </span>
        </div>

        {/* 类型标签 */}
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full bg-gradient-to-r ${typeColors[card.type]} border-2 ${typeBorderColors[card.type]} shadow-lg`}>
          <span className="text-xs text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            {card.type}
          </span>
        </div>
      </div>
    </div>
  );
}