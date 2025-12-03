import { useState, useEffect } from 'react';
import { SkillCard, SkillCardData } from './SkillCard';
import { allSkillCards, bossRewardCards } from '../data/skillCards';
import { getSafetyKnowledge } from '../data/safetyKnowledge';
import monsterImage from 'figma:asset/9afa589adec8d35be392c74d3d0b62a37884c562.png';
import fireBossImage from 'figma:asset/763410a13f4de55694f17638f4ab6633457975a9.png';
import finalBossImage from 'figma:asset/34216a5715822b8bdec16a597539e7f4aad55e90.png';
import characterEquipped from 'figma:asset/987fd69d6ff5bfd87c6af82e6dec56ee6084b3b5.png';
import electricalFireSkill from 'figma:asset/c1884870313d3139560a8968267f10901cf95199.png';
import chemicalFireSkill from 'figma:asset/b2d7523250b45ffbfb23ead1ca983f234d110442.png';
import debrisAccumulationSkill from 'figma:asset/d47c20ae265246353987c8b3cbe2c1c619265e40.png';

interface BattleScreenProps {
  onBack: () => void;
  onVictory: (enemyType: string) => void;
  onDefeat: () => void; // 战斗失败回调
  onExit: () => void; // 未完成战斗直接退出的回调
  enemyType?: string;
  playerMaxHp?: number;
  currentPlayerHp: number;
  setCurrentPlayerHp: (hp: number) => void;
  playerCards: SkillCardData[]; // 玩家拥有的卡牌
  onRewardSelected?: (reward: BattleReward) => void; // 战后奖励回调
  currentTile?: number; // 当前格子号
  isFullyEquipped: boolean; // 装备是否齐全
  devMode?: boolean; // 开发者模式
}

export interface BattleReward {
  type: 'card' | 'health';
  card?: SkillCardData;
  amount?: number;
}

type BattlePhase = 'player-turn' | 'enemy-turn' | 'player-won' | 'player-lost' | 'reward-selection' | 'counter-choice';

export function BattleScreen({ onBack, onVictory, onDefeat, onExit, enemyType = 'FIRE', playerMaxHp = 50, currentPlayerHp, setCurrentPlayerHp, playerCards, onRewardSelected, currentTile = 1, isFullyEquipped, devMode = false }: BattleScreenProps) {
  // 根据格子位置确定区域（用于调整小怪难度）
  const getRegion = () => {
    if (currentTile <= 5) return 1; // BLAZING FOREST
    if (currentTile <= 9) return 2; // ELECTRIC WASTELAND
    if (currentTile <= 13) return 3; // ACID SWAMP
    return 4; // ASTRAL REALM
  };

  const region = getRegion();

  // 根据敌人类型和区域设置血量
  const getEnemyMaxHp = () => {
    if (enemyType === 'BATTLE') {
      // 普通小怪按区域递增: 30, 40, 50, 60
      return 20 + region * 10;
    }
    
    // Boss血量根据出现顺序递增
    switch (enemyType) {
      case 'FIRE':
        return 80; // 第5格，区域1末尾
      case 'FLOOD':
        return 90; // 支线从第3格
      case 'ELEC':
        return 100; // 第9格，区域2末尾
      case 'SHARP':
        return 110; // 支线从7格
      case 'ACID':
        return 120; // 第13格，区域3末尾
      case 'NUCLEAR':
        return 130; // 支线从第11
      case 'FINAL BOSS':
        return 150; // 第17格最终Boss
      default:
        return 80;
    }
  };

  // Boss伤害减免倍率（玩家对Boss造成的伤害会被减免）
  const getBossDamageReduction = () => {
    if (enemyType === 'BATTLE') return 1.0; // 普通小怪无减免
    
    // 开发者模式下所有Boss减伤降低到85%（即伤害提升到85%）
    if (devMode) {
      return 0.85;
    }
    
    switch (enemyType) {
      case 'FIRE':
      case 'FLOOD':
        return 0.7; // 早期Boss: 30%减免
      case 'ELEC':
      case 'SHARP':
        return 0.65; // 中期Boss: 35%减免
      case 'ACID':
      case 'NUCLEAR':
        return 0.6; // 后期Boss: 40%减免
      case 'FINAL BOSS':
        return 0.5; // 最终Boss: 50%减免
      default:
        return 0.7;
    }
  };

  const enemyMaxHp = getEnemyMaxHp();
  
  const [playerHp, setPlayerHp] = useState(currentPlayerHp); // 使用传入的当前血量
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const [phase, setPhase] = useState<BattlePhase>('player-turn');
  const [selectedCardType, setSelectedCardType] = useState<'ATTACK' | 'DEFEND' | 'HEAL' | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false); // 玩家受击动画
  const [defenseReady, setDefenseReady] = useState(false);
  const [defenseAmount, setDefenseAmount] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [rewardOptions, setRewardOptions] = useState<BattleReward[]>([]); // 战后奖励选项
  const [isBurning, setIsBurning] = useState(false); // 玩家是否被灼烧
  const [burnTurns, setBurnTurns] = useState(0); // 灼烧剩余回合数
  const [calledForHelp, setCalledForHelp] = useState(false); // 是否已经呼叫支援
  const [showHelpReminder, setShowHelpReminder] = useState(false); // 显示呼叫支援提醒
  const [enemySkill, setEnemySkill] = useState<{name: string, icon: string, image: string, damage: number} | null>(null); // 敌人技能显示
  const [pendingSkill, setPendingSkill] = useState<{name: string, icon: string, image: string, damage: number, currentDefense: number} | null>(null); // 待反制的技能
  const [counterSuccess, setCounterSuccess] = useState(false); // 反制成功标记
  const [counterMessage, setCounterMessage] = useState<string[]>([]); // 反制成功消息

  // 简化的卡组 - 使用基础卡牌
  const playerHand: SkillCardData[] = playerCards;
  
  // 判断是否是Boss战
  const isBossBattle = enemyType !== 'BATTLE';
  
  // 玩家回合开始时显示呼叫支援提醒（仅Boss战且未呼叫）
  useEffect(() => {
    if (phase === 'player-turn' && isBossBattle && !calledForHelp) {
      setShowHelpReminder(true);
    } else {
      setShowHelpReminder(false);
    }
  }, [phase, isBossBattle, calledForHelp]);
  
  // 呼叫支援函数
  const handleCallForHelp = () => {
    if (!calledForHelp) {
      setCalledForHelp(true);
      setBattleLog(prev => [...prev, '📞 Called for backup! Allies are on the way! Boss damage normalized.']);
      setShowHelpReminder(false);
    }
  };
  
  // 一击必杀函数（开发者模式）
  const handleInstantKill = () => {
    setEnemyHp(0);
    setTimeout(() => setPhase('player-won'), 500);
  };
  
  const getEnemyStyle = () => {
    switch (enemyType) {
      case 'FIRE':
        return { bg: 'from-red-400 to-orange-500', emoji: '🔥', name: 'FIRE MONSTER' };
      case 'ELEC':
        return { bg: 'from-blue-400 to-cyan-500', emoji: '⚡', name: 'ELECTRIC BEAST' };
      case 'ACID':
        return { bg: 'from-green-400 to-lime-500', emoji: '☠️', name: 'ACID SLIME' };
      case 'FLOOD':
        return { bg: 'from-blue-500 to-teal-500', emoji: '🌊', name: 'WATER ELEMENTAL' };
      case 'SHARP':
        return { bg: 'from-gray-400 to-slate-500', emoji: '⚔️', name: 'BLADE DEMON' };
      case 'NUCLEAR':
        return { bg: 'from-yellow-400 to-green-500', emoji: '☢️', name: 'NUCLEAR HORROR' };
      case 'FINAL BOSS':
        return { bg: 'from-purple-500 to-pink-600', emoji: '👹', name: 'FINAL BOSS' };
      default:
        return { bg: 'from-gray-400 to-gray-600', emoji: '👾', name: 'MONSTER' };
    }
  };

  const enemy = getEnemyStyle();

  // 打开卡牌选择
  const handleActionClick = (type: 'ATTACK' | 'DEFEND' | 'HEAL') => {
    if (phase !== 'player-turn') return;
    setSelectedCardType(type);
    setShowCards(true);
  };

  // 跳过回合
  const handleSkipTurn = () => {
    if (phase !== 'player-turn') return;
    setBattleLog(prev => [...prev, 'You skipped your turn.']);
    setPhase('enemy-turn');
    // 清除防御状态
    setDefenseReady(false);
    setDefenseAmount(0);
    setTimeout(() => enemyTurn(), 1000);
  };
  
  // 玩家回合开始时处理灼烧效果
  useEffect(() => {
    if (phase === 'player-turn' && isBurning && burnTurns > 0) {
      // 灼烧伤害3-5点
      const burnDamage = 3 + Math.floor(Math.random() * 3);
      
      setTimeout(() => {
        setPlayerHp(currentHp => {
          const newHp = Math.max(0, currentHp - burnDamage);
          setBattleLog(prev => [...prev, `🔥 BURNING! Took ${burnDamage} fire damage!`]);
          
          // 减少灼烧回合数
          setBurnTurns(burnTurns - 1);
          if (burnTurns - 1 <= 0) {
            setIsBurning(false);
            setBattleLog(prev => [...prev, '✨ The flames have subsided.']);
          }
          
          // 检查玩家是否被击败
          if (newHp <= 0) {
            setTimeout(() => setPhase('player-lost'), 500);
          }
          
          return newHp;
        });
        
        // 触发受击动画
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), 500);
      }, 500);
    }
  }, [phase]);

  // 使用卡牌
  const handleCardUse = (card: SkillCardData) => {
    // 如果在反制选择阶段
    if (phase === 'counter-choice') {
      handleCounterChoice(card);
      return;
    }
    
    if (phase !== 'player-turn') return;

    setShowCards(false);
    
    if (card.type === 'ATTACK') {
      // 检查是否触发反制（包括通用反制卡）
      const isCounter = pendingSkill && (
        (card.isUniversalCounter) || // 通用反制卡可以反制任何技能
        (card.counterSkill && card.counterSkill === pendingSkill.name) // 特定反制卡
      );
      
      if (isCounter) {
        // 反制成功！
        setCounterSuccess(true);
        
        // 检查反制类型：护盾、额外伤害、治疗、或清除负面状态
        if (card.counterShield) {
          // 防火铲反制：提供护盾
          setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
          setBattleLog(prev => [...prev, `🛡️ Gained ${card.counterShield} shield! Enemy skill prevented!`]);
          
          // 设置护盾
          setDefenseReady(true);
          setDefenseAmount(card.counterShield);
        } else if (card.counterHeal) {
          // 沙桶反制：治疗HP
          setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
          
          setPlayerHp(currentHp => {
            const healAmount = card.counterHeal || 0;
            const newHp = Math.min(playerMaxHp, currentHp + healAmount);
            const actualHeal = newHp - currentHp;
            setBattleLog(prev => [...prev, `💚 Healed ${actualHeal} HP! Enemy skill prevented!`]);
            return newHp;
          });
        } else if (card.counterClearDebuffs) {
          // 燃烧三角反制：清除所有负面状态
          setBattleLog(prev => [...prev, `⚡ UNIVERSAL COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
          
          // 清除灼烧状态
          if (isBurning) {
            setIsBurning(false);
            setBurnTurns(0);
            setBattleLog(prev => [...prev, `✨ All debuffs cleared! No more burning!`]);
          } else {
            setBattleLog(prev => [...prev, `✨ Enemy skill prevented! Ready for next turn!`]);
          }
        } else if (card.counterDamage) {
          // 灭器反制：造成额伤害
          const damageReduction = getBossDamageReduction();
          const totalDamage = card.power + card.counterDamage;
          const actualDamage = Math.floor(totalDamage * damageReduction);
          const newEnemyHp = Math.max(0, enemyHp - actualDamage);
          setEnemyHp(newEnemyHp);
          setEnemyShake(true);
          
          setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
          setBattleLog(prev => [...prev, `💥 Counter dealt ${actualDamage} damage! (${card.power} + ${card.counterDamage} bonus)`]);
          
          setTimeout(() => {
            setEnemyShake(false);
          }, 500);
          
          // 检查敌人是否被击败
          if (newEnemyHp <= 0) {
            setTimeout(() => setPhase('player-won'), 800);
            setCounterSuccess(false);
            setPendingSkill(null);
            return;
          }
        }
        
        // 清除预告的敌人技能
        setPendingSkill(null);
        
        setTimeout(() => {
          setCounterSuccess(false);
        }, 1500);
        
        // 反制成功后进入敌人回合
        setTimeout(() => enemyTurn(), 2000);
      } else {
        // 正常攻击 - 应用Boss伤害减
        const damageReduction = getBossDamageReduction();
        const actualDamage = Math.floor(card.power * damageReduction);
        const newEnemyHp = Math.max(0, enemyHp - actualDamage);
        setEnemyHp(newEnemyHp);
        setEnemyShake(true);
        
        // 日志显示实际伤害和减免信息
        if (enemyType !== 'BATTLE' && damageReduction < 1.0) {
          const reducedAmount = card.power - actualDamage;
          setBattleLog(prev => [...prev, `You used ${card.name}! Dealt ${actualDamage} damage! (${reducedAmount} reduced by armor)`]);
        } else {
          setBattleLog(prev => [...prev, `You used ${card.name}! Dealt ${actualDamage} damage!`]);
        }
        
        // 检查是否提供护盾（安全毯特性）
        if (card.providesShield) {
          setDefenseReady(true);
          setDefenseAmount(card.providesShield);
          setBattleLog(prev => [...prev, `🛡️ Gained ${card.providesShield} shield!`]);
        }
        
        setTimeout(() => setEnemyShake(false), 500);
        
        // 检查敌人是否被击败
        if (newEnemyHp <= 0) {
          setTimeout(() => setPhase('player-won'), 800);
        } else {
          // 敌人回合
          setTimeout(() => enemyTurn(), 1000);
        }
      }
    } else if (card.type === 'DEFEND') {
      // 检查防御卡是否触发反制（安全插座特性
      const isCounter = pendingSkill && card.counterSkill && card.counterSkill === pendingSkill.name;
      
      if (isCounter && card.counterReflect) {
        // 反制成功！反弹伤害
        setCounterSuccess(true);
        
        // 计算弹伤害
        const reflectDamage = Math.floor(pendingSkill.damage * card.counterReflect);
        const newEnemyHp = Math.max(0, enemyHp - reflectDamage);
        setEnemyHp(newEnemyHp);
        setEnemyShake(true);
        
        setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
        setBattleLog(prev => [...prev, `🔌 Reflected ${reflectDamage} damage back to enemy! (${Math.floor(card.counterReflect * 100)}% of ${pendingSkill.damage})`]);
        
        // 同时提供护盾
        setDefenseReady(true);
        setDefenseAmount(card.power);
        setBattleLog(prev => [...prev, `🛡️ Gained ${card.power} shield!`]);
        
        setTimeout(() => {
          setEnemyShake(false);
          setCounterSuccess(false);
        }, 500);
        
        // 清除预告的敌人技能
        setPendingSkill(null);
        
        // 检查敌人是否被击败
        if (newEnemyHp <= 0) {
          setTimeout(() => setPhase('player-won'), 800);
        } else {
          // 敌人回合（不会使用被反制的技能）
          setTimeout(() => enemyTurn(card.power), 1000);
        }
      } else {
        // 正常防御
        const defenseValue = card.power;
        setDefenseReady(true);
        setDefenseAmount(defenseValue);
        setBattleLog(prev => [...prev, `You used ${card.name}! Defense ready!`]);
        
        // 敌人回合 - 传递防御
        setTimeout(() => enemyTurn(defenseValue), 800);
      }
    } else if (card.type === 'HEAL') {
      // 治疗
      const healedAmount = card.power;
      setPlayerHp(currentHp => {
        const newHp = Math.min(playerMaxHp, currentHp + healedAmount);
        setBattleLog(prev => [...prev, `You used ${card.name}! Healed ${healedAmount} HP!`]);
        return newHp;
      });
      
      // 检查是否可以清除灼烧状态
      if (card.removeBurn && isBurning) {
        setIsBurning(false);
        setBurnTurns(0);
        setBattleLog(prev => [...prev, '💊 BURN STATUS CURED! No more fire damage!']);
      }
      
      // 敌人回合 - 延迟确保状态更新完成
      setTimeout(() => enemyTurn(), 800);
    }
    
    setSelectedCardType(null);
  };

  // 反制选择
  const handleCounterChoice = (card: SkillCardData) => {
    if (phase !== 'counter-choice') return;
    if (!pendingSkill) return;
    
    // 检查是否触发反制（包括通用反制卡）
    const isCounter = (card.isUniversalCounter) || (card.counterSkill && card.counterSkill === pendingSkill.name);
    
    if (isCounter) {
      // 反制成功！
      setCounterSuccess(true);
      
      // 1. 首先执行卡牌的基础效果
      if (card.type === 'ATTACK') {
        // 攻击卡：造成基础伤害
        const damageReduction = getBossDamageReduction();
        const baseDamage = Math.floor(card.power * damageReduction);
        const newEnemyHp = Math.max(0, enemyHp - baseDamage);
        setEnemyHp(newEnemyHp);
        setEnemyShake(true);
        
        setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
        setBattleLog(prev => [...prev, `💥 Dealt ${baseDamage} base damage!`]);
        
        setTimeout(() => {
          setEnemyShake(false);
        }, 500);
        
        // 检查敌人是否被击败
        if (newEnemyHp <= 0) {
          setTimeout(() => setPhase('player-won'), 800);
          setCounterSuccess(false);
          setPendingSkill(null);
          return;
        }
      } else if (card.type === 'DEFEND') {
        // 防御卡：获得护盾
        setDefenseReady(true);
        setDefenseAmount(card.power);
        setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
        setBattleLog(prev => [...prev, `🛡️ Gained ${card.power} shield from card!`]);
      } else if (card.type === 'HEAL') {
        // 治疗卡：恢复HP
        setBattleLog(prev => [...prev, `⚡ COUNTER! You used ${card.name} to block ${pendingSkill.name}!`]);
        
        setPlayerHp(currentHp => {
          const healAmount = card.power;
          const newHp = Math.min(playerMaxHp, currentHp + healAmount);
          const actualHeal = newHp - currentHp;
          setBattleLog(prev => [...prev, `💚 Healed ${actualHeal} HP from card!`]);
          return newHp;
        });
      }
      
      // 2. 然后执行反制特效
      if (card.counterShield) {
        // 防火铲反制：额外提供护盾
        setBattleLog(prev => [...prev, `🛡️ COUNTER BONUS: Gained ${card.counterShield} extra shield!`]);
        
        // 叠加护盾
        setDefenseAmount(prevDefense => prevDefense + card.counterShield);
        setDefenseReady(true);
      } else if (card.counterHeal) {
        // 沙桶反制：额外治疗HP
        setPlayerHp(currentHp => {
          const healAmount = card.counterHeal || 0;
          const newHp = Math.min(playerMaxHp, currentHp + healAmount);
          const actualHeal = newHp - currentHp;
          setBattleLog(prev => [...prev, `💚 COUNTER BONUS: Healed ${actualHeal} extra HP!`]);
          return newHp;
        });
      } else if (card.counterClearDebuffs) {
        // 燃烧三角反制：清除所有负面状
        // 清除灼烧状态
        if (isBurning) {
          setIsBurning(false);
          setBurnTurns(0);
          setBattleLog(prev => [...prev, `✨ COUNTER BONUS: All debuffs cleared! No more burning!`]);
        } else {
          setBattleLog(prev => [...prev, `✨ COUNTER BONUS: Ready for next turn!`]);
        }
      } else if (card.counterDamage) {
        // 灭火器反制：造成额外伤害
        const damageReduction = getBossDamageReduction();
        const extraDamage = Math.floor(card.counterDamage * damageReduction);
        const newEnemyHp = Math.max(0, enemyHp - extraDamage);
        setEnemyHp(newEnemyHp);
        setEnemyShake(true);
        
        setBattleLog(prev => [...prev, `💥 COUNTER BONUS: Dealt ${extraDamage} extra damage!`]);
        
        setTimeout(() => {
          setEnemyShake(false);
        }, 500);
        
        // 检查敌人是否被击败
        if (newEnemyHp <= 0) {
          setTimeout(() => setPhase('player-won'), 800);
          setCounterSuccess(false);
          setPendingSkill(null);
          return;
        }
      } else if (card.counterReflect) {
        // 安全插座反制：反弹伤害 + 额外护盾
        const reflectDamage = Math.floor(pendingSkill.damage * card.counterReflect);
        const newEnemyHp = Math.max(0, enemyHp - reflectDamage);
        setEnemyHp(newEnemyHp);
        setEnemyShake(true);
        
        setBattleLog(prev => [...prev, `🔌 COUNTER BONUS: Reflected ${reflectDamage} damage back! (${Math.floor(card.counterReflect * 100)}% of ${pendingSkill.damage})`]);
        
        // 额外护盾（叠加）
        setDefenseAmount(prevDefense => prevDefense + card.power);
        setBattleLog(prev => [...prev, `🛡️ COUNTER BONUS: Gained ${card.power} extra shield!`]);
        
        setTimeout(() => {
          setEnemyShake(false);
        }, 500);
        
        // 检查敌人是否被击败
        if (newEnemyHp <= 0) {
          setTimeout(() => setPhase('player-won'), 800);
          setCounterSuccess(false);
          setPendingSkill(null);
          return;
        }
      }
      
      // 清除预告的敌人技能
      setPendingSkill(null);
      
      setTimeout(() => {
        setCounterSuccess(false);
      }, 1500);
      
      // 反制成功后进入敌人回合
      setTimeout(() => enemyTurn(), 2000);
    } else {
      // 没有反制，技能命中！执行技能效果
      setBattleLog(prev => [...prev, `You used ${card.name}, but couldn't counter the skill!`]);
      
      const enemyDamage = pendingSkill.damage;
      let actualDamage = enemyDamage;
      
      // 检查是否有防御值
      const currentDefense = pendingSkill.currentDefense;
      
      if (currentDefense > 0) {
        // 盾大幅减少伤害
        actualDamage = Math.max(0, enemyDamage - currentDefense);
        setBattleLog(prev => [...prev, `🔥 ${pendingSkill.name}! Enemy deals ${enemyDamage}! You blocked ${Math.min(currentDefense, enemyDamage)} damage!`]);
        setDefenseReady(false);
        setDefenseAmount(0);
        // 即使有护盾也触发震动（表示受击）
        if (actualDamage > 0) {
          setPlayerShake(true);
          setTimeout(() => setPlayerShake(false), 500);
        }
      } else {
        // 应用装备减伤（装备齐全时伤害 * 0.9）
        if (isFullyEquipped) {
          actualDamage = Math.floor(enemyDamage * 0.9);
          const reducedDamage = enemyDamage - actualDamage;
          setBattleLog(prev => [...prev, `🔥 ${pendingSkill.name}! Deals ${enemyDamage}! Equipment reduced ${reducedDamage} damage! Took ${actualDamage} damage!`]);
        } else {
          setBattleLog(prev => [...prev, `🔥 ${pendingSkill.name}! Dealt ${actualDamage} damage!`]);
        }
        // 触发玩家受击动画
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), 500);
      }
      
      // 技能额外效果：有更高几率施加灼烧
      if (!isBurning && actualDamage > 0) {
        setIsBurning(true);
        setBurnTurns(3);
        setBattleLog(prev => [...prev, '🔥 You are BURNING! Takes 3-5 damage per turn for 3 turns!']);
      }
      
      // 清除pendingSkill
      setPendingSkill(null);
      
      // 使用函数式更新确保获取最新的playerHp值
      setPlayerHp(currentHp => {
        const newPlayerHp = Math.max(0, currentHp - actualDamage);
        
        // 检查玩家是否被击败
        if (newPlayerHp <= 0) {
          setTimeout(() => setPhase('player-lost'), 800);
        } else {
          setTimeout(() => setPhase('player-turn'), 1000);
        }
        
        return newPlayerHp;
      });
    }
  };
  
  // 敌人回合
  const enemyTurn = (immediateDefense?: number) => {
    setPhase('enemy-turn');
    
    setTimeout(() => {
      // 火焰Boss和Final Boss都有技能使用几率
      // Final Boss: 35%几率使用技能
      // Fire Boss: 50%几率使用技能
      const skillChance = enemyType === 'FINAL BOSS' ? 0.35 : (enemyType === 'FIRE' ? 0.5 : 0.3);
      const useBossSkill = (enemyType === 'FIRE' || enemyType === 'FINAL BOSS') && Math.random() < skillChance;
      
      if (useBossSkill) {
        // 随机选择一个技能
        const baseSkills = [
          { name: 'ELECTRICAL FIRE', icon: '⚡🔥', image: electricalFireSkill, damage: 8 },
          { name: 'CHEMICAL FIRE', icon: '🧪🔥', image: chemicalFireSkill, damage: 9 },
          { name: 'DEBRIS ACCUMULATION', icon: '📦🔥', image: debrisAccumulationSkill, damage: 10 }
        ];
        
        // Final Boss的伤害倍率为1.5倍（向上取整）
        const skills = enemyType === 'FINAL BOSS' 
          ? baseSkills.map(s => ({ ...s, damage: Math.ceil(s.damage * 1.5) }))
          : baseSkills;
        
        const skill = skills[Math.floor(Math.random() * skills.length)];
        
        // 获取当前防御值
        const currentDefense = immediateDefense !== undefined ? immediateDefense : (defenseReady ? defenseAmount : 0);
        
        // 设置技能显示（不造成伤害，只显示特效）
        setEnemySkill(skill);
        
        // 设置待反制的技能，进入反制选择阶段
        setPendingSkill({ ...skill, currentDefense });
        
        // 延迟进入反制选择阶段，让玩家看到技能特效
        setTimeout(() => {
          setEnemySkill(null); // 清除技能显示
          setPhase('counter-choice'); // 进入反制选择阶段
          setBattleLog(prev => [...prev, `⚠️ ${skill.icon} ${skill.name} incoming! Choose your response!`]);
        }, 2000);
        
        return;
      }
      
      // 普通攻击逻辑（小怪或Boss普通攻击）
      executeNormalAttack(immediateDefense);
    }, 1000);
  };
  
  // 执行普通攻击
  const executeNormalAttack = (immediateDefense?: number) => {
    // 根据敌人类型确定伤害
    let enemyDamage: number;
    if (enemyType !== 'BATTLE') {
      // Boss伤害根据出现顺序递增
      switch (enemyType) {
        case 'FIRE':
        case 'FLOOD':
          enemyDamage = 6 + Math.floor(Math.random() * 4); // 6-9 早期Boss
          break;
        case 'ELEC':
        case 'SHARP':
          enemyDamage = 7 + Math.floor(Math.random() * 4); // 7-10 中期Boss
          break;
        case 'ACID':
        case 'NUCLEAR':
          enemyDamage = 8 + Math.floor(Math.random() * 4); // 8-11 后期Boss
          break;
        case 'FINAL BOSS':
          enemyDamage = 12 + Math.floor(Math.random() * 5); // 12-16 最终Boss（提高伤害）
          break;
        default:
          enemyDamage = 6 + Math.floor(Math.random() * 4);
      }
      
      // Boss战且未呼叫支援时，伤害+15%
      if (!calledForHelp) {
        enemyDamage = Math.floor(enemyDamage * 1.15);
      }
    } else {
      // 普通怪物伤害按区域递增
      const baseDamage = 4 + Math.floor(Math.random() * 3); // 4-6伤害
      const regionBonus = Math.floor(region * 1.5); // 每个区域+1.5伤害
      enemyDamage = baseDamage + regionBonus;
    }
    
    let actualDamage = enemyDamage;
    
    // 优先使用立即传递的御值，否则检查状态中的防御
    const currentDefense = immediateDefense !== undefined ? immediateDefense : (defenseReady ? defenseAmount : 0);
    
    if (currentDefense > 0) {
      // 护盾大幅减少伤害
      actualDamage = Math.max(0, enemyDamage - currentDefense);
      setBattleLog(prev => [...prev, `Enemy attacks for ${enemyDamage}! You blocked ${Math.min(currentDefense, enemyDamage)} damage!`]);
      setDefenseReady(false);
      setDefenseAmount(0);
      // 即使有护盾也触发震动（表示受击）
      if (actualDamage > 0) {
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), 500);
      }
    } else {
      // 应用装备减伤（装备齐全时伤害 * 0.9）
      if (isFullyEquipped) {
        actualDamage = Math.floor(enemyDamage * 0.9);
        const reducedDamage = enemyDamage - actualDamage;
        setBattleLog(prev => [...prev, `Enemy attacks for ${enemyDamage}! Equipment reduced ${reducedDamage} damage! Took ${actualDamage} damage!`]);
      } else {
        setBattleLog(prev => [...prev, `Enemy attacks! Dealt ${actualDamage} damage!`]);
      }
      // 触发玩家受击动画
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 500);
    }
    
    // 火焰敌人施加灼烧效果（概率）
    const isFireEnemy = enemyType === 'FIRE' || enemyType === 'FINAL BOSS' || (enemyType === 'BATTLE' && region === 1);
    if (isFireEnemy && !isBurning && actualDamage > 0) {
      // Final Boss和Fire Boss有50%几率，普通小怪有30%几率施加灼烧
      const burnChance = (enemyType === 'FINAL BOSS' || enemyType === 'FIRE') ? 0.5 : 0.3;
      if (Math.random() < burnChance) {
        setIsBurning(true);
        setBurnTurns(3); // 灼烧持续3回合
        setBattleLog(prev => [...prev, '🔥 You are BURNING! Takes 3-5 damage per turn for 3 turns!']);
      }
    }
    
    // 使用函数式更新确保获取最新的playerHp值
    setPlayerHp(currentHp => {
      const newPlayerHp = Math.max(0, currentHp - actualDamage);
      
      // 检查玩家是被击败
      if (newPlayerHp <= 0) {
        setTimeout(() => setPhase('player-lost'), 800);
      } else {
        setTimeout(() => setPhase('player-turn'), 1000);
      }
      
      return newPlayerHp;
    });
  };

  // 胜利返回并更新血量
  useEffect(() => {
    if (phase === 'player-won') {
      // 更新玩家血量到父组件
      setCurrentPlayerHp(playerHp);
      
      // 检查是否是Boss战（非普通小怪）
      const isBoss = enemyType !== 'BATTLE';
      
      if (isBoss) {
        // Boss战后进入奖励选择阶段
        setTimeout(() => {
          setPhase('reward-selection');
          // 生成Boss奖励选项
          generateBossRewardOptions();
        }, 2000);
      } else {
        // 普小怪直接返回
        setTimeout(() => {
          onVictory(enemyType);
        }, 3000);
      }
    }
  }, [phase]);
  
  // 生成Boss奖励项
  const generateBossRewardOptions = () => {
    const bossCardId = bossRewardCards[enemyType];
    const bossCard = allSkillCards.find(card => card.id === bossCardId);
    
    const options: BattleReward[] = [
      { type: 'card', card: bossCard },
      { type: 'health', amount: 10 },
    ];
    
    setRewardOptions(options);
  };
  
  // 选择奖励
  const selectReward = (reward: BattleReward) => {
    if (reward.type === 'health') {
      // 增加血量上限并满血
      const newMaxHp = playerMaxHp + (reward.amount || 0);
      setCurrentPlayerHp(newMaxHp);
    }
    
    if (onRewardSelected) {
      onRewardSelected(reward);
    }
    
    // 返回地图
    setTimeout(() => {
      onVictory(enemyType);
    }, 500);
  };

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 overflow-hidden">
      {/* 返回按钮 */}
      <button
        onClick={onExit}
        className="absolute top-8 left-8 z-20 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-amber-500"
        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
      >
        ← BACK TO MAP
      </button>

      {/* Boss呼叫支援按钮 - 仅Boss战显示 */}
      {isBossBattle && (
        <button
          onClick={handleCallForHelp}
          disabled={calledForHelp}
          className={`absolute top-8 right-8 z-20 px-8 py-4 rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 flex items-center gap-2 ${showHelpReminder ? 'animate-pulse scale-110 bg-gradient-to-r from-green-500 to-emerald-600 border-yellow-400 shadow-[0_0_30px_rgba(34,197,94,0.8)]' : calledForHelp ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700 border-green-500'}`}
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          <span className="text-3xl">📞</span>
          <div className="flex flex-col items-start">
            <span className="text-xl text-white">{calledForHelp ? 'HELP CALLED' : 'CALL FOR HELP'}</span>
            {showHelpReminder && (
              <span className="text-sm text-yellow-200 animate-pulse">⚠️ CLICK NOW!</span>
            )}
          </div>
        </button>
      )}
      
      {/* 开发者一击必杀按钮 */}
      {devMode && (
        <button
          onClick={handleInstantKill}
          className="absolute bottom-8 right-8 z-20 px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-red-700 opacity-30 hover:opacity-100"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          [DEV] INSTANT KILL
        </button>
      )}

      {/* 战斗标题 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-6xl tracking-wider text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.6)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          BATTLE!
        </h1>
        <p className="text-center text-xl text-gray-400 mt-2 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          {phase === 'player-turn' ? 'YOUR TURN' : phase === 'enemy-turn' ? 'ENEMY TURN' : ''}
        </p>
        
        {/* 预告技能显示 */}
        {pendingSkill && phase === 'player-turn' && (
          <div className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-600/90 via-red-600/90 to-orange-600/90 rounded-xl border-2 border-yellow-400 shadow-[0_0_20px_rgba(251,146,60,0.6)] animate-pulse">
            <p className="text-center text-lg text-yellow-200 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ⚠️ BOSS NEXT SKILL: {pendingSkill.icon} {pendingSkill.name}
            </p>
            <p className="text-center text-sm text-orange-200 mt-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Use counter card to block! 🔺 FIRE TRIANGLE blocks all!
            </p>
          </div>
        )}
      </div>

      {/* Boss技能显示 */}
      {enemySkill && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300">
          <div className="relative">
            {/* 技能图片背景 */}
            <div className="w-96 h-96 rounded-3xl overflow-hidden border-8 border-orange-500 shadow-[0_0_60px_rgba(251,146,60,0.8)] animate-pulse">
              <img src={enemySkill.image} alt={enemySkill.name} className="w-full h-full object-cover" />
            </div>
            {/* 技能称 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-xl border-4 border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.9)]">
              <div className="text-3xl text-white tracking-wider whitespace-nowrap text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {enemySkill.icon} {enemySkill.name}!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 战斗区域 */}
      <div className="absolute inset-0 flex items-center justify-center gap-32 px-20">
        {/* 玩家角色 */}
        <div className="flex flex-col items-center gap-6">
          {/* 角色 */}
          <div className="relative">
            <div className={`w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl shadow-[0_0_40px_rgba(96,165,250,0.4)] border-4 border-blue-300 flex items-center justify-center transition-all duration-100 overflow-hidden ${playerShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              <img src={characterEquipped} alt="Hero" className="w-full h-full object-cover" />
            </div>
            {/* 角色名称 */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 rounded-lg border-2 border-blue-400 shadow-lg">
              <div className="text-xl text-white tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                HERO
              </div>
            </div>
            {/* 防御标志 */}
            {defenseReady && (
              <div className="absolute top-0 right-0 text-5xl animate-pulse">🛡️</div>
            )}
            {/* 灼烧标志 */}
            {isBurning && (
              <div className="absolute top-0 left-0">
                <div className="relative">
                  <div className="text-6xl animate-pulse">🔥</div>
                  {burnTurns > 0 && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center border-2 border-orange-400 text-white text-sm" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {burnTurns}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* 燃烧动画特效 */}
            {isBurning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 text-4xl animate-[float_2s_ease-in-out_infinite] opacity-70">🔥</div>
                <div className="absolute bottom-10 right-1/4 text-3xl animate-[float_2.5s_ease-in-out_infinite] opacity-60" style={{ animationDelay: '0.5s' }}>🔥</div>
                <div className="absolute top-1/3 right-0 text-3xl animate-[float_2.2s_ease-in-out_infinite] opacity-50" style={{ animationDelay: '1s' }}>🔥</div>
              </div>
            )}
          </div>

          {/* 玩家血条 */}
          <div className="w-64 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-300 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>HP</span>
              <span className="text-sm text-blue-200 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {playerHp} / {playerMaxHp}
              </span>
            </div>
            <div className="h-8 bg-gray-700 rounded-full border-3 border-gray-600 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.6)]"
                style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* VS 标志 */}
        <div className="text-8xl text-red-500 tracking-wider animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          VS
        </div>

        {/* 敌人 */}
        <div className="flex flex-col items-center gap-6">
          {/* 怪物 */}
          <div className="relative">
            <div className={`w-64 h-64 bg-gradient-to-br ${enemy.bg} rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-red-400 flex items-center justify-center transition-all duration-100 overflow-hidden ${enemyShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              {enemyType === 'BATTLE' ? (
                <img src={monsterImage} alt="Monster" className="w-[40rem] h-[40rem] object-contain" style={{ transform: 'scale(1.8)' }} />
              ) : (enemyType === 'FIRE' || enemyType === 'FINAL BOSS') ? (
                <img src={enemyType === 'FINAL BOSS' ? finalBossImage : fireBossImage} alt="Fire Boss" className="w-[64rem] h-[64rem] object-contain" style={{ transform: 'scale(1.8)' }} />
              ) : (
                <div className="text-9xl animate-pulse">{enemy.emoji}</div>
              )}
            </div>
            {/* 怪物名 */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-600 rounded-lg border-2 border-red-400 shadow-lg">
              <div className="text-xl text-white tracking-wider whitespace-nowrap" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {enemy.name}
              </div>
            </div>
          </div>

          {/* 敌人血条 */}
          <div className="w-64 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-300 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>HP</span>
              <span className="text-sm text-red-200 tracking-wider" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {enemyHp} / {enemyMaxHp}
              </span>
            </div>
            <div className="h-8 bg-gray-700 rounded-full border-3 border-gray-600 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 战操作区域 */}
      {phase === 'player-turn' && !showCards && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
          <button 
            onClick={() => handleActionClick('ATTACK')}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-red-500 flex items-center gap-2 hover:scale-110" 
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-2xl">⚔️</span>
            <span className="text-xl">ATTACK</span>
          </button>
          <button 
            onClick={() => handleActionClick('DEFEND')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-blue-500 flex items-center gap-2 hover:scale-110" 
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-2xl">🛡️</span>
            <span className="text-xl">DEFEND</span>
          </button>
          <button 
            onClick={() => handleActionClick('HEAL')}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-green-500 flex items-center gap-2 hover:scale-110" 
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-2xl">💚</span>
            <span className="text-xl">HEAL</span>
          </button>
          <button 
            onClick={handleSkipTurn}
            className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-gray-500 flex items-center gap-2 hover:scale-110" 
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-2xl">⏭️</span>
            <span className="text-xl">SKIP</span>
          </button>
        </div>
      )}

      {/* 卡牌选择界面 */}
      {showCards && selectedCardType && (
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black via-gray-900 to-transparent z-30 flex items-end justify-center pb-8 px-20">
          <div className="flex gap-4 items-end">
            {playerHand
              .filter(card => card.type === selectedCardType)
              .map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => handleCardUse(card)}
                >
                  <SkillCard card={card} inHand index={index} />
                </div>
              ))}
          </div>
          <button
            onClick={() => setShowCards(false)}
            className="absolute top-8 right-8 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            CANCEL
          </button>
        </div>
      )}
      
      {/* 反制选择界面 */}
      {phase === 'counter-choice' && pendingSkill && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* 技能警告 */}
          <div className="text-center mb-12 animate-pulse">
            <h2 className="text-7xl tracking-wider text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {pendingSkill.icon} {pendingSkill.name}
            </h2>
            <p className="text-4xl text-orange-400 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              INCOMING! CHOOSE YOUR RESPONSE!
            </p>
            <p className="text-2xl text-yellow-300 mt-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Damage: {pendingSkill.damage} | Use counter card or take the hit!
            </p>
          </div>
          
          {/* 所有卡牌展示 */}
          <div className="flex gap-4 items-end justify-center flex-wrap max-w-6xl">
            {playerHand.map((card, index) => {
              // 检查是否可以反制
              const canCounter = (card.isUniversalCounter) || (card.counterSkill && card.counterSkill === pendingSkill.name);
              
              // 开发者模式挑战Final Boss时隐藏反制提示
              const showCounterHint = !(devMode && enemyType === 'FINAL BOSS');
              
              return (
                <div
                  key={card.id}
                  onClick={() => handleCounterChoice(card)}
                  className={`transition-all duration-200 cursor-pointer ${canCounter ? 'scale-110 animate-pulse' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={canCounter ? 'relative' : ''}>
                    <SkillCard card={card} inHand index={index} />
                    {canCounter && showCounterHint && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.8)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        <span className="text-sm text-black tracking-wider">⚡ COUNTER!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 提示文本 */}
          <div className="mt-8 text-center">
            {!(devMode && enemyType === 'FINAL BOSS') && (
              <p className="text-xl text-gray-300" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                ⚡ Cards with COUNTER glow - they can block this skill!
              </p>
            )}
            {devMode && enemyType === 'FINAL BOSS' && (
              <p className="text-xl text-red-400" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                🔥 DEVELOPER CHALLENGE MODE - No counter hints!
              </p>
            )}
            <p className="text-lg text-gray-400 mt-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Other cards will be used normally, and you'll take damage
            </p>
          </div>
        </div>
      )}

      {/* 反制成功提示 */}
      {counterSuccess && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] animate-in zoom-in duration-300">
          <div className="px-16 py-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-3xl border-8 border-yellow-300 shadow-[0_0_60px_rgba(250,204,21,0.9)] animate-pulse">
            <h3 className="text-8xl text-center tracking-wider text-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ⚡ COUNTER SUCCESS! ⚡
            </h3>
          </div>
        </div>
      )}

      {/* 胜利画面 */}
      {phase === 'player-won' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 animate-in fade-in duration-500">
          <div className="text-center max-w-4xl px-8">
            <h2 className="text-9xl tracking-wider text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] mb-8 animate-pulse" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              VICTORY!
            </h2>
            {enemyType === 'BATTLE' ? (
              // 小怪胜利显示安全知识
              <div className="px-12 py-8 bg-gradient-to-br from-blue-900/80 to-purple-900/80 rounded-3xl border-4 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]">
                <h3 className="text-4xl text-cyan-300 tracking-wide mb-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  📚 SAFETY KNOWLEDGE GAINED!
                </h3>
                <p className="text-2xl text-white leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {getSafetyKnowledge(region, currentTile)}
                </p>
              </div>
            ) : (
              // Boss胜利显示勋章
              <p className="text-3xl text-green-400 tracking-wide" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                You earned a badge!
              </p>
            )}
          </div>
        </div>
      )}

      {/* 失败画面 */}
      {phase === 'player-lost' && (
        <div className="absolute inset-0 flex items-center justify-center z-40 animate-in fade-in duration-500">
          {/* 背景渐变黑框 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent opacity-90" />
          
          <div className="relative z-50 bg-gradient-to-r from-transparent via-black to-transparent py-20 px-40">
            <h2 className="text-9xl tracking-wider text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              YOU DIED
            </h2>
            <div className="flex justify-center gap-6 mt-12">
              <button
                onClick={() => {
                  onDefeat();
                }}
                className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-gray-500 text-xl"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                RETURN TO MAP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 奖励选择画面 */}
      {phase === 'reward-selection' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40 animate-in fade-in duration-500">
          <div className="text-center px-8">
            <h2 className="text-7xl tracking-wider text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] mb-4 animate-pulse" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              BOSS DEFEATED!
            </h2>
            <p className="text-4xl text-green-400 tracking-wide mb-12" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              Choose your reward:
            </p>
            <div className="flex justify-center gap-8">
              {rewardOptions.map((reward, index) => (
                <button
                  key={index}
                  onClick={() => selectReward(reward)}
                  className="group relative px-12 py-8 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all duration-300 border-4 border-purple-400 hover:scale-110"
                  style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                >
                  {reward.type === 'card' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-7xl">{reward.card?.icon}</div>
                      <div className="text-3xl text-yellow-300">{reward.card?.name}</div>
                      <div className="text-xl text-purple-200">Power: {reward.card?.power}</div>
                      <div className="text-sm text-gray-300 max-w-xs">{reward.card?.description}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-7xl">💗</div>
                      <div className="text-3xl text-yellow-300">+{reward.amount} HP MAX</div>
                      <div className="text-xl text-purple-200">Permanent Health Boost</div>
                      <div className="text-sm text-gray-300 max-w-xs">Increase your maximum health and fully restore HP</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加震动动画 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-20px); opacity: 0.3; }
        }
      `}</style>

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}