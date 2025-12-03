import { useState, useEffect, useRef } from 'react';

interface HelpScreenProps {
  onBack: () => void;
}

interface Message {
  id: number;
  sender: 'player' | 'scientist';
  text: string;
}

// 实验室安全知识库
const labSafetyKnowledge = {
  // 火灾安全
  fire: {
    keywords: ['fire', 'burn', 'flame', '火', '燃烧', 'extinguisher', '灭火器', 'combustion'],
    info: `🔥 **Fire Safety in Labs:**

**Fire Triangle:** Fire requires three elements - Fuel, Oxygen, and Heat. Remove any one to extinguish fire.

**Types of Fire:**
- Class A: Ordinary combustibles (wood, paper)
- Class B: Flammable liquids (oil, gasoline) 
- Class C: Electrical fires
- Class D: Combustible metals

**Fire Extinguisher Usage (PASS):**
- Pull the pin
- Aim at the base of fire
- Squeeze the handle
- Sweep from side to side

**Prevention:** Keep flammable materials away from heat sources, never leave experiments unattended, and know evacuation routes.`
  },
  
  // 电气安全
  electrical: {
    keywords: ['electric', 'electrical', 'shock', 'wire', 'circuit', '电', '电气', 'voltage', 'current', 'ground'],
    info: `⚡ **Electrical Safety:**

**Key Hazards:**
- Electric shock (can cause cardiac arrest)
- Burns from high-voltage contacts
- Fire from faulty wiring
- Arc flash explosions

**Safety Measures:**
- Never use damaged cords or equipment
- Keep electrical devices away from water
- Use proper grounding (3-prong plugs)
- Turn off power before maintenance
- Use insulated tools
- Never overload circuits

**Emergency Response:** If someone is shocked, DO NOT touch them. Cut power first, then call for help. Use a non-conductive object to separate victim from source.`
  },
  
  // 化学品安全
  chemical: {
    keywords: ['chemical', 'acid', 'base', 'toxic', 'corrosive', '化学', '酸', '碱', '腐蚀', 'spill', 'fume', 'ventilation'],
    info: `🧪 **Chemical Safety:**

**SDS (Safety Data Sheet):** Always read SDS before handling any chemical. Know hazards, handling procedures, and emergency measures.

**Acid/Base Safety:**
- Always add acid to water (not reverse!) - "Do as you oughta, add acid to water"
- Wear acid-resistant gloves and goggles
- Work in fume hood
- Have neutralizing agents ready

**Fume Hood Usage:**
- Keep sash at proper height
- Don't block vents
- Keep materials 6 inches from sash
- Check airflow indicator

**Spill Response:**
- Evacuate if necessary
- Contain spill with absorbent materials
- Neutralize acids/bases carefully
- Dispose properly in waste containers

**Storage:** Store incompatible chemicals separately. Never store acids with bases, or oxidizers with flammables.`
  },
  
  // 个人防护装备
  ppe: {
    keywords: ['ppe', 'equipment', 'protection', 'goggles', 'gloves', 'coat', 'mask', '护具', '装备', 'helmet', 'safety glasses'],
    info: `🛡️ **Personal Protective Equipment (PPE):**

**Eye Protection:**
- Safety goggles for chemical splash protection
- Safety glasses for impact protection
- Face shields for additional face protection
- Never wear contact lenses in lab (traps chemicals)

**Hand Protection:**
- Nitrile gloves: General chemical resistance
- Latex gloves: Biological materials
- Heat-resistant gloves: Hot materials
- Never reuse disposable gloves

**Body Protection:**
- Lab coat: Full coverage, natural fibers (cotton)
- Close-toed shoes: No sandals ever
- Long pants: No exposed skin
- Tie back long hair

**Respiratory Protection:**
- Use fume hood for volatile chemicals
- N95 mask for particulates
- Full respirator for highly toxic gases

**Golden Rule:** PPE is your LAST line of defense. Engineering controls (fume hoods, safety cabinets) come first!`
  },
  
  // 急救
  firstaid: {
    keywords: ['first aid', 'emergency', 'injury', 'cut', 'burn', 'wound', '急救', '受伤', 'poison', 'exposure'],
    info: `🏥 **Laboratory First Aid:**

**Chemical Burns:**
1. Flush with water for 15-20 minutes
2. Remove contaminated clothing
3. Do NOT neutralize (causes heat)
4. Seek medical attention

**Thermal Burns:**
1. Cool with cold water (not ice)
2. Cover with sterile dressing
3. Never pop blisters
4. Seek medical care for severe burns

**Eye Exposure:**
1. Use eyewash station immediately
2. Flush for 15 minutes minimum
3. Hold eyelids open
4. Seek medical attention

**Chemical Ingestion:**
- Do NOT induce vomiting
- Call Poison Control immediately
- Provide SDS to medical staff

**Cuts:**
1. Apply pressure to stop bleeding
2. Clean with water
3. Apply sterile bandage
4. Seek medical care for deep cuts

**Emergency Numbers:** Always know location of: First aid kit, eyewash station, safety shower, emergency phone, and fire extinguisher.`
  },
  
  // 实验室规则
  rules: {
    keywords: ['rule', 'regulation', 'policy', 'procedure', '规则', '规定', 'guideline', 'protocol'],
    info: `📋 **Essential Laboratory Rules:**

**Before Entering:**
- Never work alone
- Know emergency procedures and exits
- Read all experiment protocols
- Inspect equipment before use

**While Working:**
- Wear appropriate PPE at all times
- No eating, drinking, or smoking
- No mouth pipetting EVER
- Label all containers clearly
- Keep work area clean and organized
- Report all incidents immediately

**Chemical Handling:**
- Use minimum amounts necessary
- Keep containers closed when not in use
- Never return unused chemicals to stock
- Transport chemicals in secondary containers

**Waste Disposal:**
- Segregate waste by type
- Use proper containers and labels
- Never pour chemicals down drain
- Follow institutional disposal procedures

**At End of Work:**
- Turn off all equipment
- Wash hands thoroughly
- Clean work area
- Store chemicals properly

**Zero Tolerance:** Horseplay, unauthorized experiments, and intentional safety violations lead to immediate lab access removal.`
  },
  
  // 废物处理
  waste: {
    keywords: ['waste', 'disposal', 'trash', 'garbage', '废物', '处理', 'hazardous', 'biohazard'],
    info: `♻️ **Hazardous Waste Disposal:**

**Categories:**
1. **Chemical Waste:** Acids, bases, solvents, heavy metals
2. **Biological Waste:** Cultures, tissues, contaminated materials
3. **Sharps:** Needles, broken glass, scalpels
4. **Radioactive Waste:** Materials with radioactive contamination

**Chemical Waste Procedures:**
- Segregate incompatible chemicals
- Use proper waste containers (UN-approved)
- Label with contents, concentration, and date
- Never fill containers more than 75% full
- Store in designated waste area

**Sharps Disposal:**
- Use puncture-resistant sharps containers
- Never recap needles
- Don't overfill containers
- Seal when 3/4 full

**Biological Waste:**
- Autoclave before disposal
- Use red biohazard bags
- Keep separate from regular trash
- Follow institutional biosafety protocols

**Broken Glass:**
- Use sharps container (not regular trash)
- Don't pick up with bare hands
- Use dustpan and brush
- Label container clearly

**Environmental Responsibility:** Improper disposal harms environment and violates EPA regulations. When in doubt, ask EH&S (Environmental Health & Safety).`
  },
  
  // 游戏机制
  game: {
    keywords: ['battle', 'fight', 'skill', 'card', 'boss', 'badge', 'counter', 'defend', 'heal', 'attack'],
    info: `🎮 **Game Mechanics:**

**Battle System:**
- Each turn, choose Attack, Defend, or Heal
- Attack cards damage enemies
- Defend cards create shields (reduce next damage)
- Heal cards restore your HP

**Counter System:**
- Boss skills can be countered with correct cards
- Successful counter: Prevents skill damage + triggers card effect + counter bonus
- Failed counter: Card effect still applies, but skill hits you

**Boss Mechanics:**
- Bosses have damage reduction armor
- Special bosses use elemental skills (ELECTRICAL FIRE, CHEMICAL FIRE, etc.)
- Final Boss has 50% damage reduction (removed in Dev Mode)

**Badges:**
- Earned by defeating each boss
- Increases max HP by 10 per badge
- Track your progress

**Equipment:**
- Required before entering tile 2
- Head + Body + Hands = Full protection
- Grants combat advantages

**Healing Stations:**
- 4 stations at map corners
- Use any ONE station to fully heal
- Resets after defeating a boss

**Developer Mode:**
- Unlocks all non-boss cards
- Cards have 1.5x power
- Max HP = 80
- Final Boss loses damage reduction`
  }
};

// AI响应生成函数
const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // 检查是否包含多个主题
  const matchedTopics: string[] = [];
  const responses: string[] = [];
  
  for (const [topic, data] of Object.entries(labSafetyKnowledge)) {
    const hasKeyword = data.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      matchedTopics.push(topic);
      responses.push(data.info);
    }
  }
  
  // 如果找到匹配的主题
  if (responses.length > 0) {
    // 如果匹配多个主题，提供所有相关信息
    if (responses.length > 1) {
      return `I sense you're asking about multiple safety topics! Here's what I know:\n\n${responses.join('\n\n---\n\n')}`;
    }
    return responses[0];
  }
  
  // 处理常见问候语
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `👋 Greetings, brave adventurer! I am Professor Labbo, expert in laboratory safety. I can teach you about:

🔥 Fire safety and extinguishers
⚡ Electrical hazards
🧪 Chemical handling
🛡️ Personal protective equipment
🏥 First aid procedures
📋 Laboratory rules
♻️ Waste disposal
🎮 Game mechanics

What would you like to learn about?`;
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return `You're very welcome! Remember: Safety is no accident - it's a choice we make every day. Stay safe out there! 🧪✨`;
  }
  
  if (lowerMessage.includes('help') || lowerMessage === '?' || lowerMessage.includes('what can you')) {
    return `🧪 I'm here to teach you about laboratory safety! I have knowledge about:

**Safety Topics:**
🔥 Fire Safety - Fire triangle, extinguishers, prevention
⚡ Electrical Safety - Shock hazards, grounding, safety measures
🧪 Chemical Safety - Acids, bases, fume hoods, spills
🛡️ PPE - Goggles, gloves, lab coats, proper usage
🏥 First Aid - Burns, cuts, chemical exposure, emergencies
📋 Lab Rules - Protocols, procedures, best practices
♻️ Waste Disposal - Proper segregation and disposal methods

**Game Help:**
🎮 Battle mechanics, cards, counters, bosses, badges

Just ask me anything! For example: "How do I use a fire extinguisher?" or "What should I do if acid spills?"`;
  }
  
  // 智能回退响应
  const possibleTopics = Object.entries(labSafetyKnowledge)
    .map(([_, data]) => data.keywords)
    .flat();
  
  // 检查是否询问关于实验室的一般问题
  if (lowerMessage.includes('lab') || lowerMessage.includes('safety') || lowerMessage.includes('experiment')) {
    return `🔬 Great question about laboratory safety! While I don't have a specific answer for that exact query, I can help you with:

• **Fire Safety** - Prevention and extinguisher usage
• **Electrical Safety** - Avoiding shocks and hazards  
• **Chemical Handling** - Safe practices with acids/bases
• **Personal Protection** - Proper PPE usage
• **Emergency Response** - First aid and spill procedures
• **Lab Protocols** - Essential rules and regulations

Could you rephrase your question or ask about one of these specific topics? For example: "How do I handle acid spills?" or "What PPE should I wear?"`;
  }
  
  // 完全无关的问题
  return `🤔 Hmm, that's an interesting question, but I specialize in **laboratory safety and game mechanics**. 

I can help you with:
🔥 Fire & electrical safety
🧪 Chemical handling
🛡️ Protective equipment  
🏥 First aid procedures
🎮 Game tips and strategies

Try asking something like:
• "How do I use a fire extinguisher?"
• "What should I wear in the lab?"
• "How do counter attacks work?"
• "What do I do if someone gets shocked?"

What would you like to know about lab safety or the game?`;
};

export function HelpScreen({ onBack }: HelpScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      sender: 'scientist',
      text: `👋 Welcome, brave explorer! I am Professor Labbo, your laboratory safety expert.

I can teach you about fire safety, chemical handling, protective equipment, emergency procedures, and much more! I'm also here to help you understand the game mechanics.

What would you like to learn about today? Try asking:
• "How do I use a fire extinguisher?"
• "What PPE should I wear?"
• "How do boss battles work?"
• "What should I do if acid spills?"`,
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    // 添加玩家消息
    const playerMessage: Message = {
      id: messages.length,
      sender: 'player',
      text: input,
    };

    setMessages(prev => [...prev, playerMessage]);
    setIsTyping(true);

    // 延迟后添加AI回复（模拟思考时间）
    setTimeout(() => {
      const scientistMessage: Message = {
        id: messages.length + 1,
        sender: 'scientist',
        text: generateAIResponse(input),
      };
      setMessages(prev => [...prev, scientistMessage]);
      setIsTyping(false);
    }, 800);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 快捷问题
  const quickQuestions = [
    'How to use fire extinguisher?',
    'What PPE should I wear?',
    'How to handle acid spills?',
    'What if someone gets shocked?',
    'How do counter attacks work?',
    'Tell me about waste disposal'
  ];

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-teal-900 via-green-900 to-emerald-900 overflow-hidden">
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
        <h1 className="text-6xl tracking-wider text-green-300 drop-shadow-[0_0_20px_rgba(134,239,172,0.6)]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          PROFESSOR LABBO - AI SAFETY EXPERT
        </h1>
      </div>

      {/* 主聊天界面 */}
      <div className="absolute inset-0 flex items-center justify-center pt-32 pb-20 px-20">
        <div className="w-full h-full max-w-6xl flex gap-8">
          {/* 左侧：科学家形象 */}
          <div className="w-80 flex flex-col items-center gap-4">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-green-300 to-emerald-400 border-8 border-green-500 shadow-2xl flex items-center justify-center">
              <div className="text-9xl">👨‍🔬</div>
            </div>
            <div className="bg-green-800/60 rounded-2xl border-3 border-green-500 p-4 text-center">
              <h2 className="text-2xl text-green-200 tracking-wider mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                PROFESSOR LABBO
              </h2>
              <p className="text-sm text-green-300 mb-2">
                AI Safety Expert
              </p>
              <div className="text-xs text-green-400 space-y-1">
                <p>🔥 Fire Safety Specialist</p>
                <p>⚡ Electrical Safety Expert</p>
                <p>🧪 Chemical Safety Advisor</p>
                <p>🎮 Game Mechanics Guide</p>
              </div>
            </div>
            
            {/* AI 状态指示 */}
            <div className="bg-green-800/40 rounded-xl border-2 border-green-500 p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isTyping ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-xs text-green-300">
                  {isTyping ? 'Thinking...' : 'Ready to help'}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：对话框 */}
          <div className="flex-1 flex flex-col gap-4">
            {/* 消息区域 */}
            <div className="flex-1 bg-green-900/40 rounded-3xl border-4 border-green-500 p-6 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[80%] rounded-2xl px-6 py-4 shadow-lg
                        ${message.sender === 'player'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400'
                          : 'bg-gradient-to-br from-green-300 to-emerald-400 text-green-900 border-2 border-green-500'
                        }
                      `}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-green-300 to-emerald-400 text-green-900 border-2 border-green-500 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 输入区域 */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Professor Labbo about lab safety or game mechanics..."
                disabled={isTyping}
                className="flex-1 px-6 py-4 rounded-xl border-3 border-green-500 bg-green-900/40 text-green-100 placeholder-green-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="px-8 py-4 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg transition-all duration-200 tracking-wider border-2 border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {isTyping ? '...' : 'SEND'}
              </button>
            </div>

            {/* 快捷问题 */}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map(question => (
                <button
                  key={question}
                  onClick={() => {
                    setInput(question);
                  }}
                  disabled={isTyping}
                  className="px-3 py-2 bg-green-700/50 hover:bg-green-600/70 text-green-200 rounded-lg border border-green-500 transition-all duration-200 text-xs disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 添加Google字体 */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
    </div>
  );
}
