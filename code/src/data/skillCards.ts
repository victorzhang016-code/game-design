import { SkillCardData } from '../components/SkillCard';
import fireExtinguisher from 'figma:asset/263b5ea12a757b209a742ae8913a16742e4ccc7c.png';
import sandBucket from 'figma:asset/c437780466c823cc0f6dfd8f264ee1aacaae35ad.png';
import safetyBlanket from 'figma:asset/46d622dc718e4327dedd86b0d23348ea61c744b6.png';
import fireShovel from 'figma:asset/d75bcac2571c0475bd09b86520537767d6e7dd63.png';
import fireTriangle from 'figma:asset/b720523e8b6fc5251ff313c5ec787d2097313356.png';
import safetySocket from 'figma:asset/7fa571662c1fdcff7b1f7f6e68f1b0a50a031b95.png';
import safetyBell from 'figma:asset/229a206379132a7ad9a80e78a35a778a60363eb7.png';
import evacuationMap from 'figma:asset/7917ea544d7b5b025a4cd211f93a53f8e0b0a3d0.png';
import medicalKit from 'figma:asset/bbf5ca6af9994f55d8f72f7ef495fcdaab662095.png';

export const allSkillCards: SkillCardData[] = [
  // ATTACK Cards - Fire Safety Equipment
  {
    id: 'atk1',
    name: 'FIRE EXTINGUISHER',
    type: 'ATTACK',
    description: 'Deals 10 DMG. Counter: Deal 10 extra DMG vs ELECTRICAL FIRE',
    icon: '🔥',
    power: 10,
    image: fireExtinguisher,
    counterSkill: 'ELECTRICAL FIRE', // 可以反制电气着火
    counterDamage: 10, // 反制成功时造成额外10点伤害
  },
  {
    id: 'atk2',
    name: 'SAND BUCKET',
    type: 'ATTACK',
    description: 'Deals 10 DMG. Counter: Heal 10 HP vs CHEMICAL FIRE',
    icon: '🪣',
    power: 10,
    image: sandBucket,
    counterSkill: 'CHEMICAL FIRE', // 可以反制化学品起火
    counterHeal: 10, // 反制成功时治疗10点HP
  },
  {
    id: 'atk3',
    name: 'SAFETY BLANKET',
    type: 'ATTACK',
    description: 'Deals 5 DMG. Gain 5 Shield',
    icon: '🧯',
    power: 5,
    image: safetyBlanket,
    providesShield: 5, // 提供5点护盾
  },
  {
    id: 'atk4',
    name: 'FIRE SHOVEL',
    type: 'ATTACK',
    description: 'Deals 10 DMG. Counter: Gain 10 Shield vs DEBRIS ACCUMULATION',
    icon: '🪓',
    power: 10,
    image: fireShovel,
    counterSkill: 'DEBRIS ACCUMULATION', // 可以反制物品堵塞
    counterShield: 10, // 反制成功时获得10点护盾
  },
  {
    id: 'atk5',
    name: 'FIRE TRIANGLE',
    type: 'ATTACK',
    description: 'Deals 5 DMG. Universal Counter: Clear all debuffs',
    icon: '🔺',
    power: 5,
    image: fireTriangle,
    removesEnemyBurn: true, // 移除敌人的灼烧效果
    isUniversalCounter: true, // 通用反制卡
    counterClearDebuffs: true, // 反制成功时清除所有负面状态
  },

  // DEFEND Cards - Fire Safety Equipment
  {
    id: 'def1',
    name: 'SAFETY SOCKET',
    type: 'DEFEND',
    description: 'Gain 10 Shield. Counter: Reflect 50% DMG vs ELECTRICAL FIRE',
    icon: '🔌',
    power: 10,
    image: safetySocket,
    counterSkill: 'ELECTRICAL FIRE', // 可以反制电气着火
    counterReflect: 0.5, // 反制成功时反弹50%伤害
  },
  {
    id: 'def2',
    name: 'FIRE ALARM BELL',
    type: 'DEFEND',
    description: 'Gain 13 Shield',
    icon: '🔔',
    power: 13,
    image: safetyBell,
  },
  {
    id: 'def3',
    name: 'EVACUATION MAP',
    type: 'DEFEND',
    description: 'Gain 8 Shield',
    icon: '🗺️',
    power: 8,
    image: evacuationMap,
  },

  // HEAL Cards - Medical Supplies
  {
    id: 'heal1',
    name: 'MEDICAL KIT',
    type: 'HEAL',
    description: 'Heal 15 HP. Cure Burn status',
    icon: '⚕️',
    power: 15,
    image: medicalKit,
    removeBurn: true, // 特殊标记：可以清除灼烧状态
  },

  // BOSS REWARD CARDS - 实验室安全知识卡（按游戏进度递增）
  {
    id: 'boss_fire',
    name: 'FIRE SUPPRESSION PROTOCOL',
    type: 'ATTACK',
    description: 'Deals 16 DMG. Class A/B/C extinguisher knowledge',
    icon: '🔥',
    power: 16, // 区域1 Boss - 前期
  },
  {
    id: 'boss_elec',
    name: 'ELECTRICAL SAFETY LOCKOUT',
    type: 'DEFEND',
    description: 'Gain 18 Shield. Lockout/Tagout procedures',
    icon: '⚡',
    power: 18, // 区域2 Boss - 中前期
  },
  {
    id: 'boss_acid',
    name: 'CHEMICAL HAZARD CONTROL',
    type: 'ATTACK',
    description: 'Deals 19 DMG. Proper storage & neutralization',
    icon: '☣️',
    power: 19, // 区域3 Boss - 中期
  },
  {
    id: 'boss_flood',
    name: 'SPILL RESPONSE KIT',
    type: 'HEAL',
    description: 'Heal 24 HP. Emergency decontamination',
    icon: '🌊',
    power: 24, // 支线Boss
  },
  {
    id: 'boss_sharp',
    name: 'SHARPS DISPOSAL PROTOCOL',
    type: 'DEFEND',
    description: 'Gain 20 Shield. Needlestick injury prevention',
    icon: '⚔️',
    power: 20, // 支线Boss
  },
  {
    id: 'boss_nuclear',
    name: 'RADIATION SHIELDING SYSTEM',
    type: 'HEAL',
    description: 'Heal 28 HP. ALARA principle & monitoring',
    icon: '☢️',
    power: 28, // 支线Boss
  },
  {
    id: 'boss_final',
    name: 'LABORATORY SAFETY MASTERY',
    type: 'ATTACK',
    description: 'Deals 25 DMG. Comprehensive safety protocols',
    icon: '🔬',
    power: 25, // 最终Boss
  },
];

// Boss专属奖励牌映射
export const bossRewardCards: { [key: string]: string } = {
  'FIRE': 'boss_fire',
  'ELEC': 'boss_elec',
  'ACID': 'boss_acid',
  'FLOOD': 'boss_flood',
  'SHARP': 'boss_sharp',
  'NUCLEAR': 'boss_nuclear',
  'FINAL BOSS': 'boss_final',
};