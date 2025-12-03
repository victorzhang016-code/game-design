import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import characterUnequipped from 'figma:asset/ab91f24348f8badea0f3c9df85a2853c2e1b0417.png';
import characterEquipped from 'figma:asset/987fd69d6ff5bfd87c6af82e6dec56ee6084b3b5.png';
import gogglesIcon from 'figma:asset/a7a5f403387789bd866b10c7d4ff8238ca611300.png';
import glovesIcon from 'figma:asset/f3c5690c1adbe73dd43b1947cabce9e73dace95f.png';
import labcoatIcon from 'figma:asset/486b97c57560f29e02298407322a46c9b078e9cd.png';

interface CharacterScreenProps {
  onBack: () => void;
  equipped: EquippedItems;
  setEquipped: (equipped: EquippedItems) => void;
}

type EquipmentSlot = 'head' | 'body' | 'hands';

interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  icon: string;
  iconImage?: string; // 新增：图片路径
}

export interface EquippedItems {
  head: Equipment | null;
  body: Equipment | null;
  hands: Equipment | null;
  feet?: Equipment | null; // 保留用于向后兼容
}

export function CharacterScreen({ onBack, equipped, setEquipped }: CharacterScreenProps) {
  const [isTransforming, setIsTransforming] = useState(false);
  const [wasFullyEquipped, setWasFullyEquipped] = useState(false);

  // 可用装备列表（去掉脚部装备）
  const availableEquipment: Equipment[] = [
    // 部装
    { id: 'goggles', name: 'Protective Goggles', slot: 'head', icon: '🥽', iconImage: gogglesIcon },
    { id: 'mask', name: 'Face Mask', slot: 'head', icon: '😷' },
    { id: 'gasmask', name: 'Gas Mask', slot: 'head', icon: '🎭' },
    // 身体装备
    { id: 'labcoat', name: 'Lab Coat', slot: 'body', icon: '🥼', iconImage: labcoatIcon },
    { id: 'armor', name: 'Battle Armor', slot: 'body', icon: '🛡️' },
    // 手部装备
    { id: 'gloves', name: 'Rubber Gloves', slot: 'hands', icon: '🧤', iconImage: glovesIcon },
    { id: 'gauntlets', name: 'Steel Gauntlets', slot: 'hands', icon: '🥊' },
  ];

  // 检查是否全部装备齐全
  const isFullyEquipped = (): boolean => {
    return equipped.head !== null && equipped.body !== null && equipped.hands !== null;
  };

  // 监听装备变化，触发变身特效
  useEffect(() => {
    const fullyEquipped = isFullyEquipped();
    
    // 当从未装备齐到装备齐时，触发变身特效
    if (fullyEquipped && !wasFullyEquipped) {
      setIsTransforming(true);
      setTimeout(() => {
        setIsTransforming(false);
      }, 1500); // 特效持续1.5秒
    }
    
    setWasFullyEquipped(fullyEquipped);
  }, [equipped.head, equipped.body, equipped.hands]);

  // 装备物品
  const equipItem = (item: Equipment) => {
    setEquipped({
      ...equipped,
      [item.slot]: item,
    });
  };

  // 卸下装备
  const unequipItem = (slot: EquipmentSlot) => {
    setEquipped({
      ...equipped,
      [slot]: null,
    });
  };

  // 获取槽位名称
  const getSlotName = (slot: EquipmentSlot): string => {
    const names: Record<EquipmentSlot, string> = {
      head: 'HEAD',
      body: 'BODY',
      hands: 'HANDS',
    };
    return names[slot];
  };

  // 按槽位分组装备
  const equipmentBySlot: Record<EquipmentSlot, Equipment[]> = {
    head: availableEquipment.filter(e => e.slot === 'head'),
    body: availableEquipment.filter(e => e.slot === 'body'),
    hands: availableEquipment.filter(e => e.slot === 'hands'),
  };

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 overflow-hidden">
      {/* 暗角效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
      
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
        <h1 className="text-6xl tracking-wider text-amber-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
          CHARACTER
        </h1>
      </div>

      {/* 主内容区 */}
      <div className="absolute inset-0 flex items-start justify-center gap-6 px-12 pt-28 pb-16">
        {/* 左侧：角色形象 */}
        <div className="relative w-[550px] h-[720px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-3xl border-4 border-slate-600 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
          <AnimatePresence mode="wait">
            {isTransforming ? (
              // 变身特效
              <motion.div
                key="transforming"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 白色闪光效果 */}
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
                {/* 光晕效果 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400/50 via-blue-500/50 to-purple-600/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
                {/* 星光图标 */}
                <motion.div
                  className="relative text-8xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1] }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  ✨
                </motion.div>
              </motion.div>
            ) : (
              // 角色形象
              <motion.div
                key={isFullyEquipped() ? 'equipped' : 'unequipped'}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src={isFullyEquipped() ? characterEquipped : characterUnequipped}
                  alt="Character"
                  className="w-full h-full object-contain"
                  style={{ transform: 'scale(1.8)' }}
                />
                {/* 装备完成提示 */}
                {isFullyEquipped() && (
                  <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg border-2 border-cyan-400 shadow-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-sm text-white tracking-wider whitespace-nowrap" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      ⚡ FULLY EQUIPPED ⚡
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 中间：装备槽位 */}
        <div className="flex flex-col gap-8">
          {(['head', 'body', 'hands'] as EquipmentSlot[]).map((slot, index) => (
            <motion.div
              key={slot}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative w-48 h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl border-4 border-slate-600 shadow-lg flex flex-col items-center justify-center hover:border-amber-500 transition-all duration-300">
                {/* 槽位标签 */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-700 rounded-lg border-2 border-slate-600">
                  <span className="text-sm text-amber-200 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {getSlotName(slot)}
                  </span>
                </div>
                
                {/* 装备内容 */}
                <AnimatePresence mode="wait">
                  {equipped[slot] ? (
                    <motion.div
                      key={equipped[slot]!.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="relative"
                    >
                      {equipped[slot]!.iconImage ? (
                        <img 
                          src={equipped[slot]!.iconImage} 
                          alt={equipped[slot]!.name}
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="text-8xl">{equipped[slot]!.icon}</div>
                      )}
                      {/* 卸下按钮 */}
                      <button
                        onClick={() => unequipItem(slot)}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 text-white"
                        title="Unequip"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-6xl opacity-30"
                    >
                      {slot === 'head' ? '🎭' : slot === 'body' ? '👕' : '✋'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 右侧：装备库 */}
        <div className="flex flex-col gap-6 w-[600px] h-full overflow-y-auto pr-4 custom-scrollbar">
          {(['head', 'body', 'hands'] as EquipmentSlot[]).map(slot => (
            <motion.div 
              key={slot} 
              className="bg-slate-800/60 rounded-2xl border-3 border-slate-600/50 p-6 shadow-lg backdrop-blur-sm"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* 槽位标题 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                <h3 className="text-2xl text-amber-200 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
                  {getSlotName(slot)}
                </h3>
              </div>

              {/* 可用装备列表 */}
              <div className="flex flex-wrap gap-4">
                {equipmentBySlot[slot].map(item => {
                  const isEquipped = equipped[slot]?.id === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => equipItem(item)}
                      disabled={isEquipped}
                      whileHover={!isEquipped ? { scale: 1.05, y: -4 } : {}}
                      whileTap={!isEquipped ? { scale: 0.95 } : {}}
                      className={`
                        p-5 rounded-2xl border-3 transition-all duration-200
                        flex flex-col items-center gap-3 min-w-[180px]
                        ${isEquipped 
                          ? 'bg-green-700/50 border-green-500 opacity-70 cursor-not-allowed' 
                          : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400 hover:border-cyan-400 cursor-pointer shadow-lg hover:shadow-2xl'
                        }
                      `}
                    >
                      {/* 图标 */}
                      <div className="w-36 h-36 flex items-center justify-center bg-slate-900/30 rounded-xl p-2">
                        {item.iconImage ? (
                          <img 
                            src={item.iconImage} 
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-7xl">{item.icon}</span>
                        )}
                      </div>
                      
                      {/* 文字 */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-white tracking-wide text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                          {item.name}
                        </span>
                        {isEquipped && (
                          <span className="text-green-300 text-xs" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                            ✓ EQUIPPED
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap" rel="stylesheet" />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
      `}</style>
    </div>
  );
}