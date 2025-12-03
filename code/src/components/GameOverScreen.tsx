interface GameOverScreenProps {
  onRestart: () => void;
}

export function GameOverScreen({ onRestart }: GameOverScreenProps) {
  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black overflow-hidden flex items-center justify-center">
      {/* 背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 暗色粒子效果 */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-600/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* GAME OVER 内容 */}
      <div className="relative z-10 flex flex-col items-center gap-12 animate-scale-in">
        {/* GAME OVER 文字 */}
        <div className="text-center">
          <div className="text-9xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)] animate-pulse-slow mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            GAME OVER
          </div>
          <div className="text-3xl text-red-300 tracking-widest" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            💀 YOU HAVE FALLEN 💀
          </div>
        </div>

        {/* 装饰骷髅 */}
        <div className="flex gap-8 text-6xl">
          <span className="animate-float">💀</span>
          <span className="animate-float" style={{ animationDelay: '0.5s' }}>⚰️</span>
          <span className="animate-float" style={{ animationDelay: '1s' }}>💀</span>
        </div>

        {/* 失败信息 */}
        <div className="bg-black/40 backdrop-blur-md rounded-3xl border-4 border-red-900/50 p-8 shadow-2xl">
          <p className="text-2xl text-white text-center tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            You were defeated twice...
          </p>
          <p className="text-xl text-red-200 text-center mt-2 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            The darkness has claimed you.
          </p>
        </div>

        {/* 重新开始按钮 */}
        <button
          onClick={onRestart}
          className="px-16 py-5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-2xl shadow-2xl transition-all duration-300 tracking-widest border-4 border-red-400 hover:scale-110 text-3xl animate-pulse-slow"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          ↻ RESTART GAME
        </button>

        <p className="text-lg text-gray-400 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Try again and conquer the realm!
        </p>
      </div>

      {/* CSS 动画 */}
      <style>{`
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .animate-scale-in {
          animation: scale-in 1s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Google 字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}
