interface GameTileProps {
  number: number;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
  isFinalBoss?: boolean;
  isBranchEnd?: boolean;
  activity?: 'EXPLORE' | 'BATTLE' | null;
  isAccessible?: boolean; // 是否可以访问（用于显示引导发光）
}

export function GameTile({ number, isSelected, onClick, style, isFinalBoss, isBranchEnd, activity, isAccessible }: GameTileProps) {
  // 特殊格子类型（可以根据编号自定义）
  const isStart = number === 1;
  const isSpecial = (number > 1 && (number - 1) % 4 === 0 && !isFinalBoss && number <= 17) || isBranchEnd; // 每隔3个格子（5, 9, 13...）或支线终点
  
  // 特殊格子名称映射
  const specialNames: { [key: number]: string } = {
    5: 'FIRE',
    9: 'ELEC',
    13: 'ACID',
    19: 'FLOOD',
    22: 'SHARP',
    24: 'NUCLEAR',
  };

  const getLabel = () => {
    if (isFinalBoss) return 'FINAL';
    if (isStart) return 'START';
    if (isSpecial && specialNames[number]) return specialNames[number];
    if (isSpecial) return 'SPECIAL';
    if (activity) return activity;
    return 'TILE';
  };

  const getTileColor = () => {
    if (isStart) return 'from-emerald-600 via-green-500 to-emerald-600 border-emerald-700';
    if (isFinalBoss) return 'from-purple-600 via-fuchsia-500 to-purple-600 border-purple-800 shadow-[0_0_16px_rgba(168,85,247,0.6)]';
    if (isSpecial) return 'from-orange-500 via-amber-400 to-orange-500 border-orange-700 shadow-[0_0_12px_rgba(251,146,60,0.5)]';
    return 'from-slate-600 via-slate-500 to-slate-600 border-slate-700';
  };

  const getTextColor = () => {
    // 所有格子使用白色文字以提高对比度
    return 'text-white';
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative w-[55px] h-[55px] cursor-pointer transition-all duration-200
        ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}
      `}
      style={style}
    >
      {/* 圆角方形格子 */}
      <div 
        className={`
          w-full h-full rounded-xl
          bg-gradient-to-br ${getTileColor()}
          border-4
          shadow-xl
          flex flex-col items-center justify-center
          relative overflow-hidden
        `}
      >
        {/* 选中发光效果 */}
        {isSelected && (
          <div className="absolute inset-0 rounded-xl border-4 border-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-pulse" />
        )}

        {/* 引导发光效果 */}
        {isAccessible && (
          <div className="absolute inset-0 rounded-xl border-4 border-blue-300 shadow-[0_0_20px_rgba(66,153,225,0.8)] animate-pulse" />
        )}

        {/* 格子编号 */}
        <div className={`relative z-10 text-xs mb-0.5 tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${getTextColor()}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          {number}
        </div>

        {/* 格子标签 */}
        <div className={`relative z-10 text-[9px] text-center px-1 leading-tight tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${getTextColor()}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          {getLabel()}
        </div>
      </div>
    </div>
  );
}