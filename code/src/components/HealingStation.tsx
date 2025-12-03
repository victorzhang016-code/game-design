import { useState } from 'react';

interface HealingStationProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onHeal: () => void;
  disabled?: boolean;
  isLocked?: boolean;
  isUsed?: boolean;
}

export function HealingStation({ position, onHeal, disabled, isLocked, isUsed }: HealingStationProps) {
  const [isHealing, setIsHealing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  const positionClasses = {
    'top-left': 'top-20 left-20',
    'top-right': 'top-20 right-20',
    'bottom-left': 'bottom-20 left-20',
    'bottom-right': 'bottom-20 right-20',
  };

  const handleClick = () => {
    if (disabled || isLocked || isUsed) return;
    
    setIsHealing(true);
    setShowPrompt(false);
    onHeal();
    
    setTimeout(() => {
      setIsHealing(false);
    }, 2000);
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-20`}>
      <button
        onClick={handleClick}
        disabled={disabled || isLocked || isUsed}
        className={`relative w-24 h-28 flex items-center justify-center transition-all duration-300 ${
          disabled || isLocked || isUsed ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
        }`}
      >
        {/* 六边形 */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-teal-200 via-emerald-100 to-green-200 shadow-[0_4px_16px_rgba(20,184,166,0.25)] border-3 border-teal-400 transition-all duration-300 ${
            isHealing ? 'animate-pulse shadow-[0_8px_32px_rgba(20,184,166,0.8)]' : ''
          } ${
            !disabled && !isHealing ? 'hover:shadow-[0_8px_24px_rgba(20,184,166,0.5)]' : ''
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        >
          {/* 内部装饰 */}
          <div 
            className="absolute inset-3 bg-gradient-to-br from-emerald-100/50 to-teal-50/50 border-2 border-teal-300/60"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          />
          
          {/* 治疗粒子效果 */}
          {isHealing && (
            <>
              <div className="absolute inset-0 animate-ping opacity-75" style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)'
              }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-bounce">
                ✨
              </div>
            </>
          )}
        </div>
        
        {/* 文字 */}
        <div className="relative z-10 flex flex-col items-center justify-center px-3">
          <div className={`text-xl mb-0.5 ${isHealing ? 'animate-bounce' : ''}`}>⚕️</div>
          <div className="text-[10px] text-teal-800 text-center tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            HEALING
          </div>
          <div className="text-[10px] text-teal-800 text-center tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            STATION
          </div>
        </div>

        {/* 治疗提示文字 */}
        {showPrompt && !disabled && !isUsed && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-3 py-1 bg-teal-600 text-white rounded-lg shadow-lg animate-pulse border-2 border-teal-400">
              <div className="text-xs tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                Click to Heal!
              </div>
            </div>
          </div>
        )}

        {/* 已使用提示 */}
        {isUsed && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-3 py-1 bg-orange-600 text-white rounded-lg shadow-lg border-2 border-orange-500">
              <div className="text-xs tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                ✓ Used - Defeat Boss to Recharge
              </div>
            </div>
          </div>
        )}

        {/* 治疗完成文字 */}
        {isHealing && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="px-4 py-2 bg-green-500 text-white rounded-xl shadow-xl border-2 border-green-300">
              <div className="text-lg tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                FULLY HEALED! ❤️
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}