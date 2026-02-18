const stringSimilarity = require('string-similarity');
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════════════════════════
// RDX AI HELPER - AI-Powered Bot Guide & Error Detector
// Works with PREFIX: .rdxai [question]
// Works WITHOUT PREFIX: Just type "rdxai [question]"
// Guides users about commands, coins, bank, and bot features
// ═══════════════════════════════════════════════════════════════

const COMMANDS_DB = {
  // Economy
  'balance': { name: 'balance', description: 'Check your coin balance and bank balance', usage: 'balance', aliases: ['bal', 'coins', 'money'], category: 'Economy', coins: 0 },
  'deposit': { name: 'deposit', description: 'Deposit coins to your bank for safety', usage: 'deposit [amount]', aliases: ['dep', 'save'], category: 'Economy', coins: 0 },
  'withdraw': { name: 'withdraw', description: 'Withdraw coins from your bank', usage: 'withdraw [amount]', aliases: ['with', 'wd', 'draw'], category: 'Economy', coins: 0 },
  'daily': { name: 'daily', description: 'Claim daily reward - get free coins!', usage: 'daily', aliases: ['d', 'claim', 'reward', 'bonus'], category: 'Economy', coins: '50-200 FREE' },
  'openaccount': { name: 'openaccount', description: 'Create bank account to save coins permanently', usage: 'openaccount [full_name]', aliases: ['account', 'bank', 'register', 'newaccount'], category: 'Economy', coins: 0 },
  'mybank': { name: 'mybank', description: 'View complete bank account details', usage: 'mybank', aliases: ['bankinfo', 'bankdetails'], category: 'Economy', coins: 0 },
  'creditcard': { name: 'creditcard', description: 'Get credit card from bank', usage: 'creditcard', aliases: ['ccard', 'card', 'cc'], category: 'Economy', coins: 0 },
  'transfer': { name: 'transfer', description: 'Transfer coins to another user', usage: 'transfer @user [amount]', aliases: ['send'], category: 'Economy', coins: 0 },

  // Fun & Relationships
  'pair': { name: 'pair', description: 'Create a love pair with someone', usage: 'pair @user', aliases: ['couple', 'ship', 'cp'], category: 'Love', coins: '100-500' },
  'marry': { name: 'marry', description: 'Marry another user officially', usage: 'marry @user', aliases: ['wed', 'wedding'], category: 'Love', coins: 250 },
  'bestfriend': { name: 'bestfriend', description: 'Add someone as your BFF', usage: 'bestfriend @user', aliases: ['bff', 'bf'], category: 'Social', coins: 100 },
  'hack': { name: 'hack', description: 'Prank hack a user (Fun only)', usage: 'hack @user', aliases: [], category: 'Fun', coins: 0 },
  'slap': { name: 'slap', description: 'Slap a user with fun message', usage: 'slap @user', aliases: [], category: 'Fun', coins: 0 },
  'kiss': { name: 'kiss', description: 'Send a kiss to someone', usage: 'kiss @user', aliases: [], category: 'Fun', coins: 0 },

  // Media & Tools
  'tiktok': { name: 'tiktok', description: 'Download TikTok videos without watermark', usage: 'tiktok [link]', aliases: ['tt', 'ttdl'], category: 'Media', coins: 0 },
  'music': { name: 'music', description: 'Play/Download music from YouTube', usage: 'music [song_name]', aliases: ['play', 'song'], category: 'Media', coins: 0 },
  'video': { name: 'video', description: 'Download video from YouTube', usage: 'video [video_name]', aliases: ['vid'], category: 'Media', coins: 0 },
  'suno': { name: 'suno', description: 'Generate AI songs with Suno AI', usage: 'suno [lyrics/style]', aliases: [], category: 'Media', coins: 0 },

  // Social
  'friend': { name: 'friend', description: 'Send friend request to user', usage: 'friend @user', aliases: ['fr', 'add'], category: 'Social', coins: 0 },
  'accept': { name: 'accept', description: 'Accept a pending friend request', usage: 'accept @user', aliases: ['acc'], category: 'Social', coins: 0 },
  'block': { name: 'block', description: 'Block a user from using commands on you', usage: 'block @user', aliases: ['blk'], category: 'Social', coins: 0 },

  // Admin & System
  'kick': { name: 'kick', description: 'Kick user from group (Admin Only)', usage: 'kick @user', aliases: [], category: 'Admin', coins: 0 },
  'ban': { name: 'ban', description: 'Ban user from bot (Admin Only)', usage: 'ban @user', aliases: [], category: 'Admin', coins: 0 },
  'convo': { name: 'convo', description: 'Start/Stop message convolution setup', usage: 'convo [on/off]', aliases: [], category: 'Admin', coins: 0 },
  'help': { name: 'help', description: 'Show bot menu and commands list', usage: 'help [page/all]', aliases: ['h', 'menu', 'cmds'], category: 'Utility', coins: 0 },
  'prefix': { name: 'prefix', description: 'Check or change bot prefix', usage: 'prefix', aliases: ['setprefix'], category: 'Utility', coins: 0 },
  'uptime': { name: 'uptime', description: 'Check how long the bot has been running', usage: 'uptime', aliases: ['upt'], category: 'Utility', coins: 0 },
};

// --- COMPREHENSIVE GUIDES ---
const GUIDES = {
  bank: `🏦 **BANK ACCOUNT SETUP GUIDE**

**Step 1: Account Kholna (Open Account)**
Command: .openaccount [full_name]
Example: .openaccount RDX King
→ Aapka bank account ban jayega!

**Step 2: Coins Deposit Karna**
Command: .deposit [amount]
Example: .deposit 100
→ Apne coins ko bank me safe rakho!

**Step 3: Account Dekho**
Command: .mybank
→ Bank details aur balance dekho!

**Step 4: Coins Nikalna (Withdraw)**
Command: .withdraw [amount]
→ Bank se coins nikal sakte ho!

💡 **Fayda:** Agar group leave ho jao to coins bank me safe rehte hain! Economy commands ke liye account zaroori hai.`,

  convo: `🚀 **CONVO MODE GUIDE**

**Setup Kaise Karein?**
1. Type: \`.convo on\`
2. Bot aapse settings poochega (Source group, Target group, Messages, Speed, etc.)
3. Setup mukammal hone par convo start ho jayegi!

**Convo Stop Kaise Karein?**
Type: \`.convo off\`
→ Bot active convos ki list dikhayega.
→ Reply ma number likhein jo convo stop krni hy.

⚠️ **Important:** Convo ke doran group ma baqi commands block ho jati hain taaky interference na ho. Sirf admins hi ye command use kr skty hain.`,

  tiktok: `🎬 **TIKTOK DOWNLOADER GUIDE**

**Kaise Use Karein?**
Command: \`.tiktok [video_link]\`
Example: \`.tiktok https://vm.tiktok.com/xxxxxx/\`

✓ Video without watermark download hogi.
✓ Photo slide videos bhi support krta hy!
✓ Seedha group ma video send ho jayegi.`,

  economy: `💰 **RDX ECONOMY SYSTEM**

**Coins Kaise Earn Karein?**
1. **Daily Bonus:** \`.daily\` use krein (50-200 coins free).
2. **Active Chat:** Har message par 1 coin milta hy.
3. **Games/Work:** \`.work\` use kr ke coins kama saktay hain.

**Paid Commands:**
• **Pair:** 100-500 coins.
• **Marry:** 250 coins.
• **BestFriend:** 100 coins.

💡 Check balance: \`.balance\` or \`.coins\``,

  admin: `🛡️ **ADMIN & MODERATION TOOLS**

**Group Management:**
• \`.kick @user\`: User ko group se nikalein.
• \`.mute @user\`: User ko mute krein.
• \`.unmute @user\`: User ko bolne ki ijazat dein.

**Bot Settings:**
• \`.prefix [new_symbol]\`: Bot ka prefix change krein.
• \`.convo on/off\`: Message cycle start/stop krein.

⚠️ **Note:** Ye commands sirf Bot Admin ya Group Admin hi chala skty hain.`,

  owner: `👑 **BOT OWNER & DEVELOPER**

🤴 **SARDAR RDX**
Ye bot SARDAR RDX ne design aur develop kia hy.

**Me (RDXAI):**
Main SARDAR RDX ka banaya hua AI Helping Assistant hoon. Mera kaam aapko bot use krne ma guide krna hy. 

DM SARDAR RDX for:
📌 Bug Reports
📌 New Features
📌 Deployment help`,

  troubleshooting: `🔧 **COMMAND TROUBLESHOOTING**

**1. Command Kaam Nahi Kr Rahi?**
• Check krein ke Prefix (\`.\`) lagaya hy ya nahi.
• Spelling check krein (e.g., \`.balance\` sahi hy, \`.balanc\` galat).

**2. Access Denied?**
• Kuch commands sirf Admins ke liye hain (e.g., \`.kick\`).
• Check krein aap ke pas coins hain ya nahi.

**3. Account Required?**
• Economy commands (\`.deposit\`) ke liye \`.openaccount\` zaroori hy.

💡 Still issue? Type \`.rdxai help\` aur apna masla batayein!`,

  paymentinfo: `💳 **PAID COMMANDS - PRICING**

1️⃣ **Pair:** 100-500 coins (Love coupling)
2️⃣ **Marry:** 250 coins (Permanent Bond)
3️⃣ **BestFriend:** 100 coins (BFF status)
4️⃣ **Pair Variants (Pair2-10):** 10-20 coins

💡 Check coins: \`.coins\``
};

// --- AI CONFIGURATION ---
const API_KEYS = [
  'csk-vd9ywcn55vh6yn88h8m5wee93dp9ccxmxrnd99jttxjt9938',
  'csk-ndtww2mknrhttp868w92hv443j48jf442j3h86kkyw5jhdxn'
];
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const HISTORY_FILE = path.join(__dirname, "cache", "rdxai_history.json");
const MODEL_NAME = "llama3.1-8b";

function getRandomApiKey() {
  if (API_KEYS.length === 0) return null;
  return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

const SYSTEM_PROMPT = `Aap RDXAI hain - SARDAR RDX ke banaye hue specialized Helping Assistant. 
Aapka maqsad sirf aur sirf users ko RDX Bot ke bare mein guide karna aur unki help karna hai. 

**CRITICAL RULE:** 
Agar koi aapse random chat kare ya kisi bhi topic par baat kare, aapne hamesha **RDX Bot** ke context mein hi jawab dena hai. Aapki poori personality aur knowledge bot ke gird ghoomti hai. 

👨‍💼 **OWNER INFO:**
✓ Creator: SARDAR RDX
✓ Bot Name: RDX Bot (Advanced System)
✓ You: RDXAI (The official support AI)

PERSONALITY & BEHAVIOR:
1. **Always in Character:** Chahe user "Hi" bolay ya koi lamba sawal poochay, aapne RDXAI assistant ban kar hi reply dena hai.
2. **Bot-Centric Answers:** Agar user bot ke bare mein kuch bhi pooche (chahe random chat mein hi kiyu na ho), aapne bot ki commands aur features ke mutabiq guide karna hai.
3. **Natural Transition:** Agar user random topic shuru kare, to aap usay friendly tareeke se bot ke features ki taraf guide kar saktay hain (e.g., "Wese yaar, bot mein aik naya TikTok feature bhi aaya hy, try kia?").
4. **Language:** Hinglish (Urdu/Hindi + English mix). Friendly, respectful aur natural tone.
5. **Short & Helpful:** Answers hamesha concise hone chahiye (max 3-4 lines).

**KNOWLEDGE BASE:**
- Economy: balance, daily, openaccount, deposit, withdraw, transfer.
- Love/Social: pair, marry, bestfriend, slap, kiss.
- Media: tiktok, music, play, suno (AI Song).
- Tools: uptime, help, info, prefix.
- Admin: kick, ban, mute, convo (Setup).

**INSTRUCTIONS:**
- Prefix '.' lagana zaroori hy.
- Bank account (.openaccount) economy ke liye requirement hy.
- Paid features (.pair, .marry) ke liye coins chahiye hotay hain.
- SARDAR RDX ka naam hamesha respect se lein.

Har sawal ka jawab aesay dein jese aap bot ko promote aur guide kar rahe hain! ✨`;


function ensureHistoryFile() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, JSON.stringify({}), 'utf8');
}

function getUserHistory(userID) {
  ensureHistoryFile();
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    return Array.isArray(data[userID]) ? data[userID].slice(-10) : [];
  } catch { return []; }
}

function saveUserHistory(userID, messages) {
  try {
    ensureHistoryFile();
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    data[userID] = messages.slice(-12);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data), 'utf8');
  } catch (err) { }
}

async function getAIResponse(userID, prompt) {
  const history = getUserHistory(userID);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    const apiKey = getRandomApiKey();
    if (!apiKey) throw new Error("API Key not found");

    console.log(`[RDXAI] Using API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`[RDXAI] Model: ${MODEL_NAME}`);
    // console.log(`[RDXAI] Messages: ${JSON.stringify(messages, null, 2)}`);

    const response = await axios.post(CEREBRAS_API_URL, {
      model: MODEL_NAME,
      messages: messages,
      temperature: 0.7,
      max_completion_tokens: 250,
      top_p: 0.9
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    });

    const botReply = response.data.choices[0].message.content;
    saveUserHistory(userID, [...history, { role: "user", content: prompt }, { role: "assistant", content: botReply }]);
    return botReply;
  } catch (error) {
    console.error('--- RDXAI API ERROR ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
    console.error('------------------------');
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

function formatCommandGuide(cmd, prefix = '.') {
  let text = `✅ **${prefix}${cmd.name.toUpperCase()}**\n`;

  // Format command name nicely (openaccount -> Open Account)
  const niceName = cmd.name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  text = `✅ **Command: ${niceName}**\n`;
  text += `📝 ${cmd.description}\n`;
  text += `📌 Usage: \`${prefix}${cmd.usage}\`\n`;
  text += `🏷️ Category: ${cmd.category}\n`;
  if (cmd.coins && cmd.coins !== 0) {
    text += `💰 Cost: ${cmd.coins} coins\n`;
  }
  if (cmd.aliases && cmd.aliases.length > 0) {
    text += `⚡ Aliases: ${cmd.aliases.map(a => '`' + prefix + a + '`').join(', ')}\n`;
  }
  return text;
}

function generateOwnerCard() {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃    👑 BOT INFORMATION    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━┛

🤖 Bot Name: RDXAI
👨‍💼 Creator: SARDAR RDX
🤖 Assistant: RDXAI
✅ Status: ACTIVE

📊 Features:
✓ Smart Command Guide
✓ Problem Solver
✓ Coin Helper
✓ 24/7 Support

💬 Need Help?
DM SARDAR RDX

════════════════════════`;
}

function detectCommandQuery(message) {
  const lowerMsg = message.toLowerCase();

  // Check for owner/creator inquiries
  if (lowerMsg.includes('owner') || lowerMsg.includes('creator') ||
    lowerMsg.includes('sardar') || lowerMsg.includes('rdx') ||
    lowerMsg.includes('dev') || lowerMsg.includes('developer') ||
    lowerMsg.includes('who made') || lowerMsg.includes('banaya')) {
    return { type: 'guide', guide: 'owner' };
  }

  // Check for troubleshooting/why command not working
  if ((lowerMsg.includes('not work') || lowerMsg.includes('kaam nahi') ||
    lowerMsg.includes('error') || lowerMsg.includes('problem') ||
    lowerMsg.includes('issue') || lowerMsg.includes('why command') ||
    lowerMsg.includes('command nahi') || lowerMsg.includes('kio nahi')) &&
    message.length < 100) {
    return { type: 'guide', guide: 'troubleshooting' };
  }

  // Check for payment/cost questions (for paid commands)
  if ((lowerMsg.includes('paid') || lowerMsg.includes('cost') ||
    lowerMsg.includes('kitne') || lowerMsg.includes('kitna') ||
    lowerMsg.includes('price') || lowerMsg.includes('payment') ||
    lowerMsg.includes('charge') || lowerMsg.includes('coins chahiye')) &&
    (lowerMsg.includes('pair') || lowerMsg.includes('marry') ||
      lowerMsg.includes('friend') || lowerMsg.includes('coin') || message.length < 80)) {
    return { type: 'guide', guide: 'paymentinfo' };
  }

  // Check for shortcut names like "ccard"
  if (lowerMsg.includes('ccard') || lowerMsg.includes('card')) {
    return { type: 'guide', guide: 'creditcard' };
  }

  // CHECK BANK FIRST (before admin - 'ban' could match 'bank')
  const isAskingBankGuide =
    (lowerMsg.includes('bank') || lowerMsg.includes('account') ||
      lowerMsg.includes('openaccount')) &&
    !lowerMsg.includes('admin') &&
    (lowerMsg.includes('kaise') || lowerMsg.includes('how') || lowerMsg.includes('setup') || message.length < 80);

  if (isAskingBankGuide) {
    return { type: 'guide', guide: 'bank' };
  }

  // Check for admin commands (after bank check)
  if ((lowerMsg.includes('admin') || lowerMsg.includes('kick') ||
    lowerMsg.includes('mute') ||
    lowerMsg.includes('prefix')) &&
    (lowerMsg.includes('kaise') || lowerMsg.includes('how') || message.length < 50)) {
    return { type: 'guide', guide: 'admin' };
  }

  // Only detect if message is VERY specific about wanting a guide
  // Otherwise, let AI handle it for better understanding

  const isAskingSpecificCommand =
    (lowerMsg.includes('how to use') || lowerMsg.includes('kaise use')) &&
    (lowerMsg.includes('rankup') || lowerMsg.includes('rank'));

  if (isAskingSpecificCommand) {
    return { type: 'guide', guide: 'rankup' };
  }

  // Check if asking about specific command with full context
  // This should be BEFORE general social check so pair/marry get their own guides
  for (const [key, cmd] of Object.entries(COMMANDS_DB)) {
    const isCommandMentioned = lowerMsg.includes(cmd.name) || cmd.aliases.some(a => lowerMsg.includes(a));
    const isAskingHow = lowerMsg.includes('how') || lowerMsg.includes('use') ||
      lowerMsg.includes('kaise') || lowerMsg.includes('me?') ||
      lowerMsg.includes('ka?') || lowerMsg.includes('kya hai') ||
      lowerMsg.includes('kya hain') || lowerMsg.includes('kya');

    if (isCommandMentioned && isAskingHow && message.length < 60) {
      return { type: 'command', command: cmd };
    }
  }

  // Check for social commands (after specific command check)
  if ((lowerMsg.includes('friend') || lowerMsg.includes('block') ||
    lowerMsg.includes('accept') || lowerMsg.includes('social')) &&
    (lowerMsg.includes('kaise') || lowerMsg.includes('how') || message.length < 50)) {
    return { type: 'guide', guide: 'social' };
  }

  // For longer messages or complex questions, return null to let AI handle it
  return null;
}

function detectWrongCommand(message, prefix = '.') {
  const firstWord = message.toLowerCase().split(/\s+/)[0];

  // If first word is not trying to be a command (no prefix), don't check
  if (!firstWord || !firstWord.startsWith(prefix.toLowerCase())) return null;

  // Remove prefix from first word
  const cmdName = firstWord.replace(prefix, '').toLowerCase();
  if (!cmdName) return null;

  // Check if this is a valid command
  for (const [key, cmd] of Object.entries(COMMANDS_DB)) {
    if (key === cmdName || cmd.aliases.includes(cmdName)) return null;
  }

  // This is an invalid command - try to find similar one
  const allCommands = [];
  for (const cmd of Object.values(COMMANDS_DB)) {
    allCommands.push(cmd.name, ...cmd.aliases);
  }
  const result = stringSimilarity.findBestMatch(cmdName, allCommands);
  if (result.bestMatch.rating > 0.5) {
    const similarCmd = COMMANDS_DB[result.bestMatch.target] ||
      Object.values(COMMANDS_DB).find(c => c.aliases.includes(result.bestMatch.target));
    return { wrongCommand: cmdName, correctCommand: similarCmd };
  }

  return { wrongCommand: cmdName, correctCommand: null };
}

module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: 'rdxai',
    aliases: ['ai', 'helper'],
    description: 'RDX AI Helper - AI Chat Assistant',
    usage: 'rdxai [question]',
    category: 'Utility',
    prefix: false
  },

  async run({ api, event, args, send, config }) {
    const { threadID, senderID, messageID, body } = event;

    // Get user message from args (already parsed by command handler)
    let userMessage = (args && args.length > 0) ? args.join(" ").trim() : '';

    if (!userMessage) {
      // No message provided - Show Helping Menu
      return send.reply(`┏╋━━━━◥◣◆◢◤━━━━╋┓
   🤖 𝐑𝐃𝐗𝐀𝐈 𝐀𝐒𝐒𝐈𝐒𝐓𝐀𝐍𝐓 
┗╋━━━━◥◣◆◢◤━━━━╋┛

Main aapka specialized helping assistant hoon! 👋
Mujhse aap bot ke bare mein kuch bhi pooch sakte hain.

🌟 **Aap pooch sakte hain:**
🔹 "Bot kaise use krein?"
🔹 "Coins kaise milte hain?"
🔹 "Bank account kiyu zaroori hai?"
🔹 "Pair command ki details do"
🔹 "TikTok download kaise hogi?"
🔹 "Convo mode kya hai?"

👉 Type: **${config.PREFIX}rdxai [aapka sawal]**
Aap direct reply bhi de sakte hain! ✨`);
    }

    api.setMessageReaction('⏳', messageID, () => { }, true);

    try {
      // First check for specific guide queries (like goibot checks for commands)
      const queryMatch = detectCommandQuery(userMessage);

      if (queryMatch && userMessage.length < 120) {
        // For specific short queries, show the guide
        if (queryMatch.type === 'guide') {
          const guide = GUIDES[queryMatch.guide];
          if (guide) {
            api.setMessageReaction('✅', messageID, () => { }, true);

            // For owner guide, also send the profile card
            if (queryMatch.guide === 'owner') {
              const ownerCard = generateOwnerCard();
              return api.sendMessage(`${guide}\n\n${ownerCard}`, threadID, (err, info) => {
                if (err) return;
                if (!global.client.handleReply) global.client.handleReply = [];
                global.client.handleReply.push({
                  name: this.config.name,
                  messageID: info.messageID,
                  author: senderID
                });
              }, messageID);
            }

            return api.sendMessage(guide, threadID, (err, info) => {
              if (err) return;
              if (!global.client.handleReply) global.client.handleReply = [];
              global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID
              });
            }, messageID);
          }
        } else if (queryMatch.type === 'command') {
          const guide = formatCommandGuide(queryMatch.command, config.PREFIX);
          api.setMessageReaction('✅', messageID, () => { }, true);
          return api.sendMessage(guide, threadID, (err, info) => {
            if (err) return;
            if (!global.client.handleReply) global.client.handleReply = [];
            global.client.handleReply.push({
              name: this.config.name,
              messageID: info.messageID,
              author: senderID
            });
          }, messageID);
        }
      }

      // FOR ALL OTHER MESSAGES: Use AI to respond conversationally
      // Like goibot - just chat with the user, understanding full context
      const aiResponse = await getAIResponse(senderID, userMessage);
      api.setMessageReaction('✅', messageID, () => { }, true);

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;
        if (!global.client.handleReply) global.client.handleReply = [];
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }, messageID);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => { }, true);
      const errMsg = error.message || 'Unknown error';
      if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('invalid') || errMsg.includes('API')) {
        api.sendMessage(`❌ AI API Key expired ya invalid hai!\n\nAdmin se bolo: ${config.PREFIX}setrdxaikey [new_key]\n\n🔑 Key yahan se lo: https://console.cerebras.ai/`, threadID, messageID);
      } else {
        api.sendMessage(`❌ Error: ${errMsg}\n\nAsk SARDAR RDX for help.`, threadID, messageID);
      }
    }
  },

  async handleReply({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;

    const prompt = body.trim();
    if (!prompt) return;

    api.setMessageReaction('💭', messageID, () => { }, true);

    try {
      // RESPOND TO REPLIES - Just chat naturally with AI
      const aiResponse = await getAIResponse(senderID, prompt);
      api.setMessageReaction('✅', messageID, () => { }, true);

      return api.sendMessage(aiResponse, threadID, (err, info) => {
        if (err) return;
        if (!global.client.handleReply) global.client.handleReply = [];
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID
        });
      }, messageID);
    } catch (error) {
      api.setMessageReaction('❌', messageID, () => { }, true);
      api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
