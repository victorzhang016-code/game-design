import { useState, useEffect } from "react";
import { GameTile } from "./GameTile";
import { HealingStation } from "./HealingStation";
import { BattleScreen, BattleReward } from "./BattleScreen";
import { ExploreScreen, ExploreReward } from "./ExploreScreen";
import { CharacterScreen, EquippedItems } from "./CharacterScreen";
import { SkillsScreen } from "./SkillsScreen";
import { BadgesScreen } from "./BadgesScreen";
import { HelpScreen } from "./HelpScreen";
import { VictoryScreen } from "./VictoryScreen";
import { GameOverScreen } from "./GameOverScreen";
import { allSkillCards } from "../data/skillCards";
import mapBackground from "figma:asset/3fb8a56571d216bc2266eb148d26ead30aba1714.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// 定义支线数据结构
interface Branch {
  fromTile: number; // 主线上哪个格子有支线
  direction: 'up' | 'down'; // 支线方向
  tiles: number[]; // 支线格子的编号
}

type TileActivity = 'EXPLORE' | 'BATTLE';

// 定义区域信息
interface Region {
  name: string;
  startTile: number;
  endTile: number;
  bgColor: string;
}

export function BoardGame() {
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [inExplore, setInExplore] = useState(false);
  const [inCharacter, setInCharacter] = useState(false);
  const [inSkills, setInSkills] = useState(false);
  const [inBadges, setInBadges] = useState(false);
  const [inHelp, setInHelp] = useState(false);
  const [gameWon, setGameWon] = useState(false); // 游戏胜利状态
  const [gameOver, setGameOver] = useState(false); // 游戏失败状态
  const [deathCount, setDeathCount] = useState(0); // 死亡次数
  const [battleEnemy, setBattleEnemy] = useState<string>('FIRE');
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // 装备提示 - 游戏开始时提示玩家添加装备
  const [showEquipmentTip, setShowEquipmentTip] = useState(true);
  
  // 装备警告弹窗 - 点击第二个格子时检查装备
  const [showEquipmentWarning, setShowEquipmentWarning] = useState(false);
  
  // 玩家进度状态 - 追踪玩家当前位置
  const [currentPosition, setCurrentPosition] = useState(1); // 从第1格开始
  const [visitedTiles, setVisitedTiles] = useState<number[]>([1]); // 已访问的格子
  const [completedTiles, setCompletedTiles] = useState<number[]>([1]); // 已完成的格子（包括起点）
  const [previousPosition, setPreviousPosition] = useState(1); // 上一个完成的格子位置
  const [isOnBranch, setIsOnBranch] = useState(false); // 是否在支线上
  const [branchReturnTile, setBranchReturnTile] = useState<number | null>(null); // 支线返回的主线格子
  
  // 开发者模式状态
  const [devMode, setDevMode] = useState(false);
  
  // 玩家血量状态 - 累计伤害，不会在战斗间刷新
  const [playerMaxHp, setPlayerMaxHp] = useState(50);
  const [currentPlayerHp, setCurrentPlayerHp] = useState(50);
  
  // 当击败Boss时更新血量上限
  useEffect(() => {
    if (!devMode) {
      const newMaxHp = 50 + earnedBadges.length * 10;
      setPlayerMaxHp(newMaxHp);
    }
  }, [earnedBadges, devMode]);
  
  // 治疗站使用追踪 - 改为全局控制
  const [healingStationUsed, setHealingStationUsed] = useState(false); // 是否已使用过治疗站
  
  // 当击败任何Boss时，重置治疗站状态
  useEffect(() => {
    if (earnedBadges.length > 0) {
      // 只要有新的徽章（击败了Boss），就重置治疗站
      setHealingStationUsed(false);
    }
  }, [earnedBadges.length]);
  
  // 玩家卡牌和道具 - 初始拥有部分消防道具卡，少量留在探索中
  const [explorableCards, setExplorableCards] = useState<any[]>(() => {
    // 定义需要通过探索获得的卡牌（只放3张进探索池）
    const fireSafetyCards = allSkillCards.filter(c => !c.id.startsWith('boss_'));
    
    // 随机选择3张卡牌放入探索池
    const shuffledCards = fireSafetyCards.sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 3); // 只有3张卡在探索池
    
    return selectedCards;
  });
  
  const [playerCards, setPlayerCards] = useState<any[]>(() => {
    // 获取所有消防道具卡（非Boss卡）
    const fireSafetyCards = allSkillCards.filter(c => !c.id.startsWith('boss_'));
    // 移除可探索的卡牌，剩余的作为初始手牌
    return fireSafetyCards.filter(c => !explorableCards.some(ec => ec.id === c.id));
  });
  const [playerShields, setPlayerShields] = useState(0);

  // 装备状态 - 初始为空，不从localStorage加载
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({
    head: null,
    body: null,
    hands: null,
  });

  // 检查是否已有任何装备，如果有则隐藏提示
  useEffect(() => {
    if (equippedItems.head || equippedItems.body || equippedItems.hands) {
      setShowEquipmentTip(false);
    }
  }, [equippedItems]);

  // 检查装备是否齐全
  const isFullyEquipped = () => {
    return equippedItems.head !== null && 
           equippedItems.body !== null && 
           equippedItems.hands !== null;
  };

  // 定义格子总数
  const totalTiles = 17;

  // 定义支线
  const branches: Branch[] = [
    { fromTile: 3, direction: 'up', tiles: [18, 19] }, // 区���1（1-5）
    { fromTile: 7, direction: 'down', tiles: [20, 21, 22] }, // 区间2（6-9）
    { fromTile: 11, direction: 'up', tiles: [23, 25, 26, 24] }, // 区间3（10-13）
  ];

  // 定义区域
  const regions: Region[] = [
    { name: 'BLAZING FOREST', startTile: 1, endTile: 5, bgColor: 'from-orange-900/40 via-red-900/30 to-amber-900/40' },
    { name: 'ELECTRIC WASTELAND', startTile: 6, endTile: 9, bgColor: 'from-blue-900/40 via-cyan-900/30 to-sky-900/40' },
    { name: 'ACID SWAMP', startTile: 10, endTile: 13, bgColor: 'from-green-900/40 via-emerald-900/30 to-teal-900/40' },
    { name: 'ASTRAL REALM', startTile: 14, endTile: 17, bgColor: 'from-purple-900/40 via-violet-900/30 to-indigo-900/40' },
  ];

  // 为每个格子分配随机活动
  const getTileActivity = (tileNum: number): TileActivity | null => {
    // 特殊格子、起点、终点不需要活动
    const isStart = tileNum === 1;
    const isFinalBoss = tileNum === totalTiles;
    const isSpecial = (tileNum > 1 && (tileNum - 1) % 4 === 0 && !isFinalBoss && tileNum <= totalTiles);
    const isBranchEnd = branches.some(b => b.tiles[b.tiles.length - 1] === tileNum);
    
    if (isStart || isFinalBoss || isSpecial || isBranchEnd) {
      return null;
    }
    
    // 减少EXPLORE格子数量：只有特定格子是EXPLORE（约1/3），其余为BATTLE（约2/3）
    // 主线EXPLORE格子：2, 4, 7, 12
    // 支线EXPLORE格子：18, 21, 23
    const exploreMainTiles = [2, 4, 7, 12];
    const exploreBranchTiles = [18, 21, 23];
    const isExplore = exploreMainTiles.includes(tileNum) || exploreBranchTiles.includes(tileNum);
    
    return isExplore ? 'EXPLORE' : 'BATTLE';
  };

  // 检查某个格子是否有支线
  const getBranchFromTile = (tileNum: number) => {
    return branches.find(b => b.fromTile === tileNum);
  };

  // 检查某个编号是否是支线的终点
  const isBranchEnd = (tileNum: number) => {
    return branches.some(b => b.tiles[b.tiles.length - 1] === tileNum);
  };

  // 获取格子所在的区域
  const getRegionForTile = (tileNum: number) => {
    return regions.find(r => tileNum >= r.startTile && tileNum <= r.endTile);
  };

  // 获取格子对应的敌类型
  const getEnemyType = (tileNum: number): string => {
    // 特格子
    if (tileNum === 5) return 'FIRE';
    if (tileNum === 9) return 'ELEC';
    if (tileNum === 13) return 'ACID';
    if (tileNum === 17) return 'FINAL BOSS';
    
    // 支线终点
    if (tileNum === 19) return 'FLOOD';
    if (tileNum === 22) return 'SHARP';
    if (tileNum === 24) return 'NUCLEAR';
    
    // 普通BATTLE格子
    return 'BATTLE';
  };

  // 检查某个格子是否可以访问
  const canAccessTile = (tileNum: number): boolean => {
    // 已成的格子不能重复访���
    if (completedTiles.includes(tileNum)) {
      return false;
    }
    
    // 如果是当前位置且未完成，允许重新挑战（死亡后重试）
    if (tileNum === currentPosition) {
      return true;
    }
    
    // 检查是否是主线格子
    if (tileNum <= totalTiles) {
      // 如果在支线上，主线格子锁定
      if (isOnBranch) {
        return false;
      }
      // 只能前进到下一格
      return tileNum === currentPosition + 1;
    }
    
    // 支线格子：检查是否从正确的主线格子分支
    const branchInfo = branches.find(b => b.tiles.includes(tileNum));
    if (branchInfo) {
      // 如果当前在分支起点，可以选择进入支线第一格或主线下一格
      if (currentPosition === branchInfo.fromTile && !isOnBranch) {
        return tileNum === branchInfo.tiles[0]; // 允许进入支线第一格
      }
      // 如果在支线上，检查是否是下一格
      if (isOnBranch) {
        const currentBranchIndex = branchInfo.tiles.indexOf(currentPosition);
        const targetBranchIndex = branchInfo.tiles.indexOf(tileNum);
        return targetBranchIndex === currentBranchIndex + 1;
      }
    }
    
    return false;
  };

  // 处理战斗胜利
  const handleBattleVictory = (enemyType: string) => {
    // 添加徽章（如果不是普通战斗）
    if (enemyType !== 'BATTLE' && !earnedBadges.includes(enemyType)) {
      setEarnedBadges(prev => [...prev, enemyType]);
    }
    // 完成当前格子
    completeCurrentTile();
    setInBattle(false);
    
    // 检查是否完成游戏
    if (enemyType === 'FINAL BOSS') {
      setGameWon(true);
    }
  };

  // 处理战斗失败
  const handleBattleDefeat = () => {
    const newDeathCount = deathCount + 1;
    setDeathCount(newDeathCount);
    
    // 第一次死亡：解锁治疗站
    if (newDeathCount === 1) {
      setHealingStationUsed(false);
      setSelectedTile(null);
      setInBattle(false);
      // 玩家可以重新挑战当前格子
    }
    // 第二次死亡：游戏结束
    else if (newDeathCount >= 2) {
      setGameOver(true);
      setInBattle(false);
    }
  };
  
  // 处理战斗退出（未完成战斗就退出）
  const handleBattleExit = () => {
    // 恢复到战斗前的位置
    setCurrentPosition(previousPosition);
    setSelectedTile(null);
    setInBattle(false);
  };
  
  // 处理治疗
  const handleHeal = (station: string) => {
    setCurrentPlayerHp(playerMaxHp);
    setHealingStationUsed(true);
  };
  
  // 处理探索完成
  const handleExploreComplete = () => {
    // 完成当前格子
    completeCurrentTile();
    setInExplore(false);
  };
  
  // 处理探索奖励
  const handleExploreRewards = (rewards: ExploreReward[]) => {
    rewards.forEach(reward => {
      if (reward.type === 'card' && reward.card) {
        // 添加卡牌到玩家的卡牌列表（不会重复）
        if (!playerCards.some(c => c.id === reward.card!.id)) {
          setPlayerCards(prev => [...prev, reward.card!]);
        }
      } else if (reward.type === 'health' && reward.amount) {
        // 增加当血量
        setCurrentPlayerHp(prev => Math.min(playerMaxHp, prev + reward.amount!));
      } else if (reward.type === 'shield' && reward.amount) {
        // 盾效果（暂时也作为血量恢复）
        setCurrentPlayerHp(prev => Math.min(playerMaxHp, prev + reward.amount!));
      }
    });
  };
  
  // 处理战斗奖励
  const handleBattleReward = (reward: BattleReward) => {
    if (reward.type === 'card' && reward.card) {
      // 添加Boss励卡牌
      if (!playerCards.some(c => c.id === reward.card!.id)) {
        setPlayerCards(prev => [...prev, reward.card!]);
      }
    } else if (reward.type === 'health' && reward.amount) {
      // 增加血量上限（已在BattleScreen中处理，这里不需要额外操）
      // 上会playerMaxHp计算时自动增
    }
  };

  // 处理格子点击
  const handleTileClick = (tileNum: number) => {
    // 检查是否可以访问
    if (!canAccessTile(tileNum)) {
      return; // 不可访问的格子直接返回
    }
    
    // 检查��否是第二个格子，如果是且装备不齐全显警告并阻止进入
    if (tileNum === 2 && !isFullyEquipped()) {
      setShowEquipmentWarning(true);
      return; // 阻止进入格子
    }
    
    setSelectedTile(tileNum);
    
    // 新当前位置
    setCurrentPosition(tileNum);
    
    // 检查是否进入支线
    const branchInfo = branches.find(b => b.tiles.includes(tileNum));
    if (branchInfo && tileNum === branchInfo.tiles[0]) {
      // 进入支线第格
      setIsOnBranch(true);
      setBranchReturnTile(branchInfo.fromTile);
    }
    
    const activity = getTileActivity(tileNum);
    const isFinalBoss = tileNum === totalTiles;
    const isSpecial = (tileNum > 1 && (tileNum - 1) % 4 === 0 && !isFinalBoss && tileNum <= totalTiles);
    const isBranchEnd = branches.some(b => b.tiles[b.tiles.length - 1] === tileNum);
    
    // 如果是BATTLE格子、特殊格子、支线终点或最终BOSS，进入战斗
    if (activity === 'BATTLE' || isSpecial || isBranchEnd || isFinalBoss) {
      setBattleEnemy(getEnemyType(tileNum));
      setInBattle(true);
    }
    // 如果是EXPLORE格子，进入探
    else if (activity === 'EXPLORE') {
      setInExplore(true);
    }
  };
  
  // 完成当前格子（战或探索结束后调用）
  const completeCurrentTile = () => {
    if (selectedTile) {
      setCompletedTiles(prev => [...prev, selectedTile]);
      setPreviousPosition(selectedTile);
      
      // 检查是否完成支线
      const branchInfo = branches.find(b => b.tiles[b.tiles.length - 1] === selectedTile);
      if (branchInfo && isOnBranch) {
        // 支线完成，返回主线
        setIsOnBranch(false);
        setCurrentPosition(branchReturnTile!);
        setBranchReturnTile(null);
      }
    }
  };

  // 重置游戏到初始状态
  const resetGame = () => {
    // 重置游戏状态
    setGameWon(false);
    setGameOver(false);
    setDeathCount(0);
    
    // 重置进度
    setCurrentPosition(1);
    setVisitedTiles([1]);
    setCompletedTiles([1]);
    setPreviousPosition(1);
    setIsOnBranch(false);
    setBranchReturnTile(null);
    setSelectedTile(null);
    
    // 重新生成探索卡池
    const fireSafetyCards = allSkillCards.filter(c => !c.id.startsWith('boss_'));
    
    // 随机选择3张卡牌放入探索池
    const shuffledCards = fireSafetyCards.sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 3); // 只有3张卡在探索池
    
    const newExplorableCards = selectedCards;
    setExplorableCards(newExplorableCards);
    
    // 重置卡牌 - 移除可探索的卡牌，剩余的作为初始手牌
    const newPlayerCards = fireSafetyCards.filter(c => !newExplorableCards.some(ec => ec.id === c.id));
    setPlayerCards(newPlayerCards);
    
    // 重置徽章
    setEarnedBadges([]);
    
    // 重置血量（初始50HP）
    setCurrentPlayerHp(50);
    
    // 重置治疗站
    setHealingStationUsed(false);
    
    // 重置装备
    setEquippedItems({
      head: null,
      body: null,
      hands: null,
    });
    
    // 重置提示
    setShowEquipmentTip(true);
  };

  // 如果在战斗中，显示战斗界面
  if (inBattle) {
    return <BattleScreen onBack={() => setInBattle(false)} onVictory={handleBattleVictory} onDefeat={handleBattleDefeat} onExit={handleBattleExit} enemyType={battleEnemy} playerMaxHp={playerMaxHp} currentPlayerHp={currentPlayerHp} setCurrentPlayerHp={setCurrentPlayerHp} playerCards={playerCards} onRewardSelected={handleBattleReward} currentTile={currentPosition} isFullyEquipped={isFullyEquipped()} devMode={devMode} />;
  }

  // 如果在探索中，示探索界面
  if (inExplore) {
    return <ExploreScreen onBack={() => setInExplore(false)} onComplete={handleExploreComplete} onRewards={handleExploreRewards} ownedCardIds={playerCards.map(c => c.id)} explorableCards={explorableCards} currentTile={currentPosition} />;
  }

  // 如果在角色界面，显示角色界面
  if (inCharacter) {
    return <CharacterScreen onBack={() => setInCharacter(false)} equipped={equippedItems} setEquipped={setEquippedItems} />;
  }

  // 如果���技能面，示技能界面
  if (inSkills) {
    return <SkillsScreen onBack={() => setInSkills(false)} playerCards={playerCards} />;
  }

  // 如果在徽章界面，显示徽章界面
  if (inBadges) {
    return <BadgesScreen onBack={() => setInBadges(false)} badges={earnedBadges} />;
  }

  // 如果在帮助界面，显示帮助界面
  if (inHelp) {
    return <HelpScreen onBack={() => setInHelp(false)} />;
  }

  // 如果游戏胜利，显示胜利界面
  if (gameWon) {
    return <VictoryScreen onBackToMap={() => setGameWon(false)} onRestart={resetGame} />;
  }

  // 如果游戏失败，显示失败界面
  if (gameOver) {
    return <GameOverScreen onRestart={resetGame} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 深蓝色渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950"></div>
      
      {/* 暗角效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
      
      <div className="relative w-full h-full">
        {/* 标题 */}
        <div className="absolute top-8 left-8 z-10">
          <h1 className="text-6xl tracking-wider text-amber-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
            LABBO FANTASY
          </h1>
        </div>

        {/* 血量显示 HUD */}
        <div className="absolute top-8 right-8 z-10 flex flex-col gap-2">
          <div className="px-6 py-3 bg-gradient-to-br from-red-500/90 to-pink-600/90 rounded-xl shadow-lg border-2 border-red-400 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <div className="flex flex-col">
                <span className="text-xs text-red-100 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  HEALTH
                </span>
                <span className="text-2xl text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {currentPlayerHp} / {playerMaxHp}
                </span>
              </div>
            </div>
            {/* 血条 */}
            <div className="mt-2 h-3 bg-red-900/50 rounded-full overflow-hidden border border-red-300/30">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-pink-400 transition-all duration-300"
                style={{ width: `${(currentPlayerHp / playerMaxHp) * 100}%` }}
              />
            </div>
          </div>
          {/* 低血量警告 */}
          {currentPlayerHp < playerMaxHp * 0.3 && (
            <div className="px-4 py-2 bg-red-600 rounded-lg border-2 border-red-400 animate-pulse">
              <span className="text-sm text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                ️ LOW HEALTH! Visit Healing Station!
              </span>
            </div>
          )}
        </div>

        {/* 四个角的治疗站 - 所有治疗站同时开放，使用一次后全部关闭 */}
        <HealingStation 
          position="top-left" 
          onHeal={() => handleHeal('top-left')} 
          disabled={currentPlayerHp === playerMaxHp}
          isLocked={false}
          isUsed={healingStationUsed}
        />
        <HealingStation 
          position="top-right" 
          onHeal={() => handleHeal('top-right')} 
          disabled={currentPlayerHp === playerMaxHp}
          isLocked={false}
          isUsed={healingStationUsed}
        />
        <HealingStation 
          position="bottom-left" 
          onHeal={() => handleHeal('bottom-left')} 
          disabled={currentPlayerHp === playerMaxHp}
          isLocked={false}
          isUsed={healingStationUsed}
        />
        <HealingStation 
          position="bottom-right" 
          onHeal={() => handleHeal('bottom-right')} 
          disabled={currentPlayerHp === playerMaxHp}
          isLocked={false}
          isUsed={healingStationUsed}
        />
        
        {/* 主地图区域 */}
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="relative w-full h-full max-w-7xl rounded-3xl border-8 border-slate-600 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="relative w-full h-full p-12">
              {/* 背景图片层 */}
              <div className="absolute inset-0">
                <img 
                  src={mapBackground} 
                  alt="Map Background"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 白色半透明遮罩层 */}
              <div className="absolute inset-0 bg-white/30"></div>

              {/* 区域名称层 */}
              <div className="absolute inset-0 flex px-12 pt-12 pb-20">
                {regions.map((region, idx) => {
                  const tileCount = region.endTile - region.startTile + 1;
                  // 前两个区域向左移动，第三个区域轻微向左，第四个居中
                  let leftOffset = '0%';
                  if (idx === 0) leftOffset = '-20%'; // 第一个区域向左
                  else if (idx === 1) leftOffset = '-20%'; // 第二个区域向左
                  else if (idx === 2) leftOffset = '-10%'; // 第三个区域轻微向左（相比之前向右移了）
                  
                  return (
                    <div 
                      key={region.name}
                      className="relative h-full"
                      style={{ width: `${(tileCount / totalTiles) * 100}%` }}
                    >
                      <div 
                        className="absolute top-4 text-white text-sm tracking-widest whitespace-nowrap" 
                        style={{ 
                          left: `calc(50% + ${leftOffset})`,
                          transform: 'translateX(-50%)',
                          fontFamily: 'Cinzel, serif',
                          textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 20px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)'
                        }}
                      >
                        {region.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 格子层 */}
              <div className="relative z-10 flex flex-col items-center gap-2 h-full justify-center">
                {/* 上方支线 */}
                <div className="flex gap-2 h-[180px] items-end">
                  {Array.from({ length: totalTiles }, (_, index) => {
                    const branch = getBranchFromTile(index + 1);
                    if (branch && branch.direction === 'up') {
                      return (
                        <div key={`up-${index}`} className="flex flex-col-reverse gap-2 items-center">
                          {/* 线格子 */}
                          {branch.tiles.map((tileNum, branchIndex) => (
                            <GameTile
                              key={tileNum}
                              number={tileNum}
                              isSelected={selectedTile === tileNum}
                              onClick={() => handleTileClick(tileNum)}
                              style={{}}
                              isFinalBoss={false}
                              isBranchEnd={branchIndex === branch.tiles.length - 1}
                              activity={getTileActivity(tileNum)}
                              isAccessible={canAccessTile(tileNum)}
                            />
                          ))}
                          {/* 连接线 */}
                          <div className="w-1 h-3 bg-slate-500/60 rounded-full"></div>
                        </div>
                      );
                    }
                    return <div key={`up-${index}`} className="w-[55px]"></div>;
                  })}
                </div>

                {/* 主线 */}
                <div className="flex gap-2">
                  {Array.from({ length: totalTiles }, (_, index) => (
                    <GameTile
                      key={index}
                      number={index + 1}
                      isSelected={selectedTile === index + 1}
                      onClick={() => handleTileClick(index + 1)}
                      style={{}}
                      isFinalBoss={index + 1 === totalTiles}
                      activity={getTileActivity(index + 1)}
                      isAccessible={canAccessTile(index + 1)}
                    />
                  ))}
                </div>

                {/* 下方支线 */}
                <div className="flex gap-2 h-[180px] items-start">
                  {Array.from({ length: totalTiles }, (_, index) => {
                    const branch = getBranchFromTile(index + 1);
                    if (branch && branch.direction === 'down') {
                      return (
                        <div key={`down-${index}`} className="flex flex-col gap-2 items-center">
                          {/* 连接线 */}
                          <div className="w-1 h-3 bg-slate-500/60 rounded-full"></div>
                          {/* 支线格子 */}
                          {branch.tiles.map((tileNum, branchIndex) => (
                            <GameTile
                              key={tileNum}
                              number={tileNum}
                              isSelected={selectedTile === tileNum}
                              onClick={() => handleTileClick(tileNum)}
                              style={{}}
                              isFinalBoss={false}
                              isBranchEnd={branchIndex === branch.tiles.length - 1}
                              activity={getTileActivity(tileNum)}
                              isAccessible={canAccessTile(tileNum)}
                            />
                          ))}
                        </div>
                      );
                    }
                    return <div key={`down-${index}`} className="w-[55px]"></div>;
                  })}
                </div>
              </div>
            </div>
            
            {/* 底部按钮 */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
              {/* CHARACTER按钮及其提示 */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setInCharacter(true);
                    setShowEquipmentTip(false);
                  }} 
                  className="px-6 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-blue-400 flex items-center gap-2" 
                  style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                >
                  <span className="text-xl">🧙</span>
                  CHARACTER
                </button>
                
                {/* 装备提示 */}
                {showEquipmentTip && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
                    <div className="px-4 py-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-xl border-2 border-blue-300">
                      <div className="tracking-wider text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        👇 Click Here to Equip Items!
                      </div>
                    </div>
                    {/* 箭头 */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-indigo-600"></div>
                  </div>
                )}
              </div>
              
              <button onClick={() => setInSkills(true)} className="px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-purple-400 flex items-center gap-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                <span className="text-xl">🎴</span>
                SKILLS
              </button>
              <button onClick={() => setInBadges(true)} className="px-6 py-3 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-yellow-400 flex items-center gap-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                <span className="text-xl">🏅</span>
                BADGES
              </button>
              <button onClick={() => setInHelp(true)} className="px-6 py-3 bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-green-400 flex items-center gap-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                <span className="text-xl">❓</span>
                HELP
              </button>
            </div>
            
            {/* 开发者工具按钮 - 右下角上移避免与治疗站重合 */}
            <button 
              onClick={() => {
                // 解锁所有非Boss卡牌
                const nonBossCards = allSkillCards.filter(card => !card.id.startsWith('boss_'));
                // 将所有卡牌的power值变为1.5倍（向上取整）
                const boostedCards = nonBossCards.map(card => ({
                  ...card,
                  power: Math.ceil(card.power * 1.5)
                }));
                setPlayerCards(boostedCards);
                
                // 完成所有格子除了最后一个
                const allTiles = Array.from({ length: 17 }, (_, i) => i + 1);
                setCompletedTiles(allTiles.filter(t => t < 17));
                setCurrentPosition(16);
                setPreviousPosition(16);
                // 解锁所有装备
                setEquippedItems({
                  head: {
                    id: 'head',
                    name: 'Safety Helmet',
                    category: 'head',
                    image: ''
                  },
                  body: {
                    id: 'body',
                    name: 'Fire Suit',
                    category: 'body',
                    image: ''
                  },
                  hands: {
                    id: 'hands',
                    name: 'Safety Gloves',
                    category: 'hands',
                    image: ''
                  }
                });
                // 血量和血量上限设为80
                setPlayerMaxHp(80);
                setCurrentPlayerHp(80);
                // 开启开发者模式
                setDevMode(true);
              }}
              className="absolute bottom-32 right-6 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg shadow-lg transition-all duration-200 tracking-wider border-2 border-red-700 opacity-30 hover:opacity-100 z-20" 
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              <span className="text-sm">[DEV] UNLOCK ALL</span>
            </button>
          </div>
        </div>

        {/* 添加Google字体 */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&display=swap" rel="stylesheet" />
        
        {/* 装备警告弹窗 */}
        <AlertDialog open={showEquipmentWarning} onOpenChange={setShowEquipmentWarning}>
          <AlertDialogContent className="bg-gradient-to-br from-red-900 to-orange-900 border-4 border-red-500">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-3xl text-amber-200 tracking-wider text-center" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                ⚠️ EQUIPMENT REQUIRED ⚠️
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="text-center text-white tracking-wider space-y-3 py-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              <div className="text-xl">DANGER AHEAD!</div>
              <div className="text-lg">You must equip protective gear before entering the wilderness!</div>
              <div className="text-base text-amber-100">Visit the CHARACTER screen to equip your Head, Body, and Hands protection.</div>
            </div>
            <AlertDialogFooter className="flex justify-center">
              <AlertDialogAction 
                onClick={() => {
                  setInCharacter(true);
                  setShowEquipmentWarning(false);
                }}
                className="px-8 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white tracking-wider border-2 border-blue-400" 
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                🛡️ Go to Equipment Screen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}