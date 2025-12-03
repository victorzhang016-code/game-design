import { useEffect, useState } from 'react';

interface VictoryScreenProps {
  onBackToMap: () => void;
  onRestart: () => void;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function VictoryScreen({ onBackToMap, onRestart }: VictoryScreenProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [nextId, setNextId] = useState(0);

  // 创建烟花
  const createFirework = () => {
    const x = Math.random() * 100;
    const y = Math.random() * 60 + 10;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 创建粒子
    const particles: Particle[] = [];
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 2;
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    }

    const newFirework: Firework = {
      id: nextId,
      x,
      y,
      color,
      particles,
    };

    setNextId(prev => prev + 1);
    setFireworks(prev => [...prev, newFirework]);

    // 3秒后移除烟花
    setTimeout(() => {
      setFireworks(prev => prev.filter(fw => fw.id !== newFirework.id));
    }, 3000);
  };

  // 定期创建烟花
  useEffect(() => {
    const interval = setInterval(() => {
      createFirework();
    }, 500);

    return () => clearInterval(interval);
  }, [nextId]);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden flex items-center justify-center">
      {/* 烟花效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {fireworks.map(firework => (
          <div
            key={firework.id}
            className="absolute"
            style={{ left: `${firework.x}%`, top: `${firework.y}%` }}
          >
            {firework.particles.map((particle, idx) => (
              <div
                key={idx}
                className="absolute w-2 h-2 rounded-full animate-firework-particle"
                style={{
                  backgroundColor: firework.color,
                  left: `${particle.x * 20}px`,
                  top: `${particle.y * 20}px`,
                  boxShadow: `0 0 10px ${firework.color}`,
                  animation: `firework-fade 3s ease-out forwards`,
                  transform: `translate(${particle.vx * 50}px, ${particle.vy * 50}px)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 胜利内容 */}
      <div className="relative z-10 flex flex-col items-center gap-12 animate-scale-in">
        {/* YOU WIN 文字 */}
        <div className="text-center">
          <h1 
            className="text-9xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-pulse-slow"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            YOU WIN!
          </h1>
          <div className="mt-4 text-3xl text-yellow-200 tracking-widest animate-bounce-slow" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            🎉 CONGRATULATIONS! 🎉
          </div>
        </div>

        {/* 装饰星星 */}
        <div className="flex gap-8 text-6xl animate-spin-slow">
          <span className="animate-twinkle">⭐</span>
          <span className="animate-twinkle" style={{ animationDelay: '0.5s' }}>✨</span>
          <span className="animate-twinkle" style={{ animationDelay: '1s' }}>🌟</span>
        </div>

        {/* 胜利信息 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/30 p-8 shadow-2xl">
          <p className="text-2xl text-white text-center tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            You have defeated the Final Boss!
          </p>
          <p className="text-xl text-yellow-200 text-center mt-2 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            The realm is saved!
          </p>
        </div>

        {/* 返回按钮 */}
        <button
          onClick={onBackToMap}
          className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl shadow-2xl transition-all duration-300 tracking-widest border-4 border-yellow-300 hover:scale-110 text-2xl"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          BACK TO MAP
        </button>

        {/* 重启按钮 */}
        <button
          onClick={onRestart}
          className="px-12 py-4 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-2xl shadow-2xl transition-all duration-300 tracking-widest border-4 border-red-300 hover:scale-110 text-2xl"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          RESTART
        </button>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes firework-fade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0);
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        .animate-scale-in {
          animation: scale-in 1s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>

      {/* Google 字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}