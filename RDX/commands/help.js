module.exports = {
  config: {
    name: 'help',
    aliases: ['h', 'menu', 'cmds'],
    description: 'Show all commands',
    credits: "SARDAR RDX",
    usage: 'help [command] | help [page] | help all',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, args, send, client, config }) {
    const { threadID, senderID } = event;
    const moment = require('moment-timezone');

    if (args[0]) {
      const input = args[0].toLowerCase();

      if (input === 'all') {
        return showFullHelp({ api, event, send, client, config });
      }

      if (!isNaN(input)) {
        const page = parseInt(input);
        return showPagedCommands({ api, event, send, client, config, page });
      }

      let command = client.commands.get(input);

      if (!command) {
        for (const [name, cmd] of client.commands) {
          if (cmd.config.aliases && cmd.config.aliases.includes(input)) {
            command = cmd;
            break;
          }
        }
      }

      if (!command) {
        return send.reply(`❌ Command "${input}" not found.`);
      }

      const cfg = command.config;
      return send.reply(`╭──────────────╮
    ✨ DETAILS ✨
╰──────────────╯

  ➲ Name: ${cfg.name.toUpperCase()}
  ➲ Desc: ${cfg.description || 'No description'}
  ➲ Usage: ${config.PREFIX}${cfg.usage || cfg.name}
  ➲ Alias: ${cfg.aliases?.join(', ') || 'None'}
  ➲ Cat  : ${cfg.category || 'Other'}
  ➲ Adm : ${cfg.adminOnly ? '✅' : '❌'}
  ➲ Gr : ${cfg.groupOnly ? '✅' : '❌'}

────────────────
   💡 Powered by ${config.BOTNAME}`);
    }

    return showDefaultHelp({ api, event, send, client, config });
  }
};

function showDefaultHelp({ api, event, send, client, config }) {
  const moment = require('moment-timezone');
  const time = moment().tz('Asia/Karachi').format('hh:mm A');
  const date = moment().tz('Asia/Karachi').format('DD/MM/YYYY');

  // Selected 10 key commands as requested
  const helpingCommands = [
    { name: 'help', desc: 'Sari commands ki list dekho' },
    { name: 'rdxai', desc: 'Bot assistant se kuch bhi poocho' },
    { name: 'rankup', desc: 'Apna level aur experience dekho' },
    { name: 'daily', desc: 'Daily free coins claim karo' },
    { name: 'balance', desc: 'Apne coins aur bank balance dekho' },
    { name: 'pair', desc: 'Love pair banao kisi ke sath' },
    { name: 'marry', desc: 'Kisi se bot pe shadi karo' },
    { name: 'friend', desc: 'Naye dost banao group mein' },
    { name: 'creditcard', desc: 'Bank se credit card le lo' },
    { name: 'info', desc: 'Bot ke bare mein details' }
  ];

  let msg = `┏╋━━━━◥◣◆◢◤━━━━╋┓
     👑 ${config.BOTNAME.toUpperCase()} MENU
┗╋━━━━◥◣◆◢◤━━━━╋┛

  ⌚ Time: ${time}
  📅 Date: ${date}
  ⚙️ Prefix: ${config.PREFIX}

───────────────\n`;

  helpingCommands.forEach((cmd, idx) => {
    msg += `  ${idx + 1}. ${config.PREFIX}${cmd.name.padEnd(10)} ➲ ${cmd.desc}\n`;
  });

  msg += `\n───────────────
   💡 Use ${config.PREFIX}help all (Full list)
   👤 Owner: SARDAR RDX
───────────────`;

  return send.reply(msg);
}

function showPagedCommands({ api, event, send, client, config, page }) {
  const uniqueCommands = new Map();

  for (const [name, cmd] of client.commands) {
    if (!uniqueCommands.has(cmd.config.name)) {
      uniqueCommands.set(cmd.config.name, cmd.config);
    }
  }

  const commandsArray = Array.from(uniqueCommands.values());
  const commandsPerPage = 12;
  const totalPages = Math.ceil(commandsArray.length / commandsPerPage);

  if (page < 1 || page > totalPages) {
    return send.reply(`❌ Invalid page number.`);
  }

  const startIdx = (page - 1) * commandsPerPage;
  const endIdx = startIdx + commandsPerPage;
  const pageCommands = commandsArray.slice(startIdx, endIdx);

  let msg = `┏╋━━━━◥◣◆◢◤━━━━╋┓
     📚 ${config.BOTNAME.toUpperCase()} 
┗╋━━━━◥◣◆◢◤━━━━╋┛\n\n`;

  pageCommands.forEach((cmd, idx) => {
    const num = startIdx + idx + 1;
    msg += `  💠 [${String(num).padStart(2)}] ${cmd.name}\n`;
  });

  msg += `\n╭──────────────╮
   Page ${page} / ${totalPages}
╰──────────────╯
  💡 ${config.PREFIX}help [page]
  📖 ${config.PREFIX}help all`;

  return send.reply(msg);
}

function showFullHelp({ api, event, send, client, config }) {
  const moment = require('moment-timezone');
  const categories = {};
  const uniqueCommands = new Map();

  for (const [name, cmd] of client.commands) {
    if (!uniqueCommands.has(cmd.config.name)) {
      uniqueCommands.set(cmd.config.name, cmd.config);
    }
  }

  for (const [name, cfg] of uniqueCommands) {
    const cat = cfg.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cfg);
  }

  const time = moment().tz('Asia/Karachi').format('hh:mm A');
  const date = moment().tz('Asia/Karachi').format('DD/MM/YYYY');

  let msg = `┏╋━━━━◥◣◆◢◤━━━━╋┓
     👑 ${config.BOTNAME.toUpperCase()} SYSTEM
┗╋━━━━◥◣◆◢◤━━━━╋┛
 
  ⌚ Time: ${time}
  📅 Date: ${date}
  📊 Total: ${uniqueCommands.size}
  ⚙️ Prefix: ${config.PREFIX}
 
 ────────────────\n`;

  const categoryOrder = ['Admin', 'Group', 'Economy', 'Media', 'Fun', 'Profile', 'Utility', 'Love', 'Friend', 'Other'];

  const categoryEmojis = {
    'Admin': '👑',
    'Group': '👥',
    'Friend': '🤝',
    'Economy': '💰',
    'Media': '🎬',
    'Fun': '🎮',
    'Profile': '👤',
    'Utility': '🔧',
    'Love': '❤️',
    'Other': '📋'
  };

  for (const cat of categoryOrder) {
    if (!categories[cat]) continue;
    const emoji = categoryEmojis[cat] || '📋';

    msg += `╭──────────────╮\n`;
    msg += `  ${emoji} ${cat.toUpperCase()}\n`;
    msg += `╰──────────────╯\n`;

    const cmds = categories[cat].map(c => ` ${c.name} `);
    msg += ` 「 ${cmds.join('•')} 」\n\n`;
  }

  for (const cat in categories) {
    if (!categoryOrder.includes(cat)) {
      msg += `╭──────────────╮\n`;
      msg += `  📋 ${cat.toUpperCase()}\n`;
      msg += `╰──────────────╯\n`;
      const cmds = categories[cat].map(c => ` ${c.name} `);
      msg += ` 「 ${cmds.join('•')} 」\n\n`;
    }
  }

  msg += `────────────────
   💡 Use ${config.PREFIX}help [cmd]
   👤 Owner: SARDAR RDX
────────────────`;

  return send.reply(msg);
}
