// 实验室安全知识库 - 按区域和灾害类型分类
export const safetyKnowledge: { [key: string]: string[] } = {
  // 区域1 - BLAZING FOREST (Fire)
  'region1_main': [
    '🔥 Always check fire extinguisher pressure gauge monthly - Green zone indicates ready for use',
    '🔥 Keep fire exits clear at all times - Blocked exits can trap people during emergencies',
    '🔥 Store flammable chemicals in approved cabinets away from heat sources',
    '🔥 Never use water on electrical or chemical fires - Use Class C extinguishers instead',
    '🔥 Close all fume hood sashes when not in use to prevent fire spread',
  ],
  'region1_branch': [
    '🌊 Know the location of emergency showers and eyewash stations in your lab',
    '🌊 Test emergency showers weekly - They must deliver water within 1 second of activation',
    '🌊 Remove contact lenses before using eyewash - They can trap chemicals against eyes',
    '🌊 Flush eyes for minimum 15 minutes after chemical exposure',
  ],
  
  // 区域2 - ELECTRIC WASTELAND (Electrical)
  'region2_main': [
    '⚡ Always use grounded outlets for electrical equipment - Check for 3-prong plugs',
    '⚡ Never use damaged power cords - Exposed wires can cause electrocution',
    '⚡ Keep electrical panels accessible with 3-foot clearance at all times',
    '⚡ Use Lockout/Tagout procedures before equipment maintenance',
    '⚡ Never handle electrical equipment with wet hands or while standing in water',
  ],
  'region2_branch': [
    '⚔️ Always use sharps containers for needles and broken glass - Never use regular trash',
    '⚔️ Never recap needles after use - This is the #1 cause of needlestick injuries',
    '⚔️ Report all needlestick injuries immediately - Post-exposure prophylaxis is time-critical',
    '⚔️ Dispose of sharps containers when 2/3 full - Overfilling increases injury risk',
  ],
  
  // 区域3 - ACID SWAMP (Chemical)
  'region3_main': [
    '☣️ Always add acid to water, never water to acid - "Do like you oughta, add acid to water"',
    '☣️ Store incompatible chemicals separately - Acids and bases must never touch',
    '☣️ Label all chemical containers immediately - Unknown chemicals are extremely dangerous',
    '☣️ Use fume hoods for volatile or toxic chemicals - Maintain face velocity of 100 fpm',
    '☣️ Never smell chemicals directly - Waft vapors gently if identification is needed',
  ],
  'region3_branch': [
    '☢️ Follow ALARA principle - Keep radiation exposure As Low As Reasonably Achievable',
    '☢️ Time, Distance, Shielding - Three key factors to minimize radiation exposure',
    '☢️ Wear dosimetry badges at all times when working with radiation',
    '☢️ Never eat, drink, or apply cosmetics in radiation areas',
  ],
  
  // 区域4 - ASTRAL REALM (Final Boss)
  'region4_main': [
    '🔬 Conduct risk assessments before starting any new procedure',
    '🔬 Know your lab\'s emergency response plan - Practice evacuation routes regularly',
    '🔬 Report all incidents and near-misses - They prevent future accidents',
    '🔬 Complete required safety training before working in the lab',
    '🔬 Never work alone with hazardous materials - Use the buddy system',
  ],
};

// 根据区域和格子编号获取安全知识
export function getSafetyKnowledge(region: number, gridNumber: number): string {
  // 判断是主线还是支线
  const branchGrids = [19, 22, 24]; // 支线终点格子
  const isBranch = branchGrids.includes(gridNumber);
  
  const key = `region${region}_${isBranch ? 'branch' : 'main'}`;
  const knowledgeList = safetyKnowledge[key] || safetyKnowledge['region1_main'];
  
  // 随机返回一条知识
  return knowledgeList[Math.floor(Math.random() * knowledgeList.length)];
}
