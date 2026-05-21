// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Story Encounters
  Base : Lenwy SCM — RPG Extension

  Random story encounters that trigger during travel (10% chance)
  Players can choose actions: take, run, fight, leave, talk, help, ignore
  Each choice has different outcomes (good, bad, or neutral)
  
  REPUTATION SYSTEM:
  - Good actions increase reputation (max: 100)
  - Evil actions decrease reputation (min: -100)
  - Reputation affects story outcomes and NPC reactions
  - Reputation titles: Saint (80+), Hero (50+), Neutral (0), Villain (-50), Demon (-80)
*/

// ══════════════════════════════════════════════════════════
// STORY CHOICE DEFINITIONS
// ══════════════════════════════════════════════════════════

/**
 * All available story choices with their labels and keys
 * Use these keys in encounter.choices to define available actions
 */
export const storyChoices = {
  // Social & Interaction
  help: { key: "help", label: "❤️ Help", emoji: "❤️" },
  ignore: { key: "ignore", label: "👁️ Ignore", emoji: "👁️" },
  attack: { key: "attack", label: "⚔️ Attack", emoji: "⚔️" },
  threaten: { key: "threaten", label: "😠 Threaten", emoji: "😠" },
  trade: { key: "trade", label: "🤝 Trade", emoji: "🤝" },
  follow: { key: "follow", label: "👣 Follow", emoji: "👣" },
  leave: { key: "leave", label: "🚶 Leave", emoji: "🚶" },
  
  // Investigation & Observation
  investigate: { key: "investigate", label: "🔍 Investigate", emoji: "🔍" },
  observe: { key: "observe", label: "👀 Observe", emoji: "👀" },
  hide: { key: "hide", label: "🫣 Hide", emoji: "🫣" },
  run: { key: "run", label: "🏃 Run Away", emoji: "🏃" },
  sneak: { key: "sneak", label: "🤫 Sneak Past", emoji: "🤫" },
  
  // Communication
  negotiate: { key: "negotiate", label: "💬 Negotiate", emoji: "💬" },
  ask: { key: "ask", label: "❓ Ask Questions", emoji: "❓" },
  lie: { key: "lie", label: "🤥 Lie", emoji: "🤥" },
  truth: { key: "truth", label: "🗣️ Tell the Truth", emoji: "🗣️" },
  talk: { key: "talk", label: "💬 Talk", emoji: "💬" },
  
  // Religious & Mystical
  pray: { key: "pray", label: "🙏 Pray", emoji: "🙏" },
  touch: { key: "touch", label: "✋ Touch Object", emoji: "✋" },
  destroy: { key: "destroy", label: "💥 Destroy Object", emoji: "💥" },
  take: { key: "take", label: "🤲 Take Artifact", emoji: "🤲" },
  offering: { key: "offering", label: "🎁 Leave Offering", emoji: "🎁" },
  read: { key: "read", label: "📖 Read Inscription", emoji: "📖" },
  
  // Chest & Container Actions
  open: { key: "open", label: "🔓 Open Chest", emoji: "🔓" },
  force: { key: "force", label: "💪 Force Open", emoji: "💪" },
  usekey: { key: "usekey", label: "🔑 Use Key", emoji: "🔑" },
  burn: { key: "burn", label: "🔥 Burn It", emoji: "🔥" },
  
  // Exploration Actions
  dig: { key: "dig", label: "⛏️ Dig", emoji: "⛏️" },
  search: { key: "search", label: "🔎 Search Carefully", emoji: "🔎" },
  rush: { key: "rush", label: "⚡ Rush Forward", emoji: "⚡" },
  wait: { key: "wait", label: "⏳ Wait Quietly", emoji: "⏳" },
  listen: { key: "listen", label: "👂 Listen Closely", emoji: "👂" },
  callout: { key: "callout", label: "📢 Call Out", emoji: "📢" },
  silent: { key: "silent", label: "🤐 Stay Silent", emoji: "🤐" },
  
  // Light & Visibility
  lighttorch: { key: "lighttorch", label: "🔦 Light Torch", emoji: "🔦" },
  extinguish: { key: "extinguish", label: "💨 Extinguish Torch", emoji: "💨" },
  
  // Pacts & Agreements
  accept: { key: "accept", label: "✅ Accept Pact", emoji: "✅" },
  refuse: { key: "refuse", label: "❌ Refuse Pact", emoji: "❌" },
  askname: { key: "askname", label: "🏷️ Ask Name", emoji: "🏷️" },
  
  // Spirit & Supernatural
  followspirit: { key: "followspirit", label: "👻 Follow Spirit", emoji: "👻" },
  banish: { key: "banish", label: "✨ Banish Spirit", emoji: "✨" },
  useholy: { key: "useholy", label: "📿 Use Holy Item", emoji: "📿" },
  darkmagic: { key: "darkmagic", label: "🌑 Use Forbidden Magic", emoji: "🌑" },
  absorb: { key: "absorb", label: "⚡ Absorb Power", emoji: "⚡" },
  seal: { key: "seal", label: "🔒 Seal It", emoji: "🔒" },
  keeprelic: { key: "keeprelic", label: "💎 Keep Relic", emoji: "💎" },
  
  // Sacrifice & Protection
  sacrificeitem: { key: "sacrificeitem", label: "🎁 Sacrifice Item", emoji: "🎁" },
  sacrificeally: { key: "sacrificeally", label: "💀 Sacrifice Ally", emoji: "💀" },
  protect: { key: "protect", label: "🛡️ Protect Ally", emoji: "🛡️" },
  betray: { key: "betray", label: "🗡️ Betray Ally", emoji: "🗡️" },
  recruit: { key: "recruit", label: "🤝 Recruit Ally", emoji: "🤝" },
  refuseally: { key: "refuseally", label: "🚫 Refuse Ally", emoji: "🚫" },
  
  // Trading & Commerce
  sharefood: { key: "sharefood", label: "🍞 Share Food", emoji: "🍞" },
  heal: { key: "heal", label: "💊 Heal Stranger", emoji: "💊" },
  rob: { key: "rob", label: "💰 Rob Merchant", emoji: "💰" },
  haggle: { key: "haggle", label: "💵 Haggle", emoji: "💵" },
  buy: { key: "buy", label: "🛒 Buy Item", emoji: "🛒" },
  sell: { key: "sell", label: "💸 Sell Item", emoji: "💸" },
  tradeinfo: { key: "tradeinfo", label: "📰 Trade Information", emoji: "📰" },
  rumors: { key: "rumors", label: "🗨️ Ask Rumors", emoji: "🗨️" },
  
  // Secrets & Information
  reveal: { key: "reveal", label: "🔓 Reveal Secret", emoji: "🔓" },
  hidesecret: { key: "hidesecret", label: "🤫 Hide Secret", emoji: "🤫" },
  warn: { key: "warn", label: "⚠️ Warn Village", emoji: "⚠️" },
  ignorewarning: { key: "ignorewarning", label: "🙈 Ignore Warning", emoji: "🙈" },
  
  // Dungeon & Location
  enter: { key: "enter", label: "🚪 Enter Dungeon", emoji: "🚪" },
  retreat: { key: "retreat", label: "🔙 Retreat", emoji: "🔙" },
  camp: { key: "camp", label: "🏕️ Set Camp", emoji: "🏕️" },
  sleep: { key: "sleep", label: "😴 Sleep", emoji: "😴" },
  awake: { key: "awake", label: "👁️ Stay Awake", emoji: "👁️" },
  
  // Gathering Activities
  hunt: { key: "hunt", label: "🏹 Hunt at Night", emoji: "🏹" },
  fish: { key: "fish", label: "🎣 Fish", emoji: "🎣" },
  mine: { key: "mine", label: "⛏️ Mine", emoji: "⛏️" },
  chop: { key: "chop", label: "🪓 Chop Wood", emoji: "🪓" },
  forage: { key: "forage", label: "🍄 Forage", emoji: "🍄" },
  track: { key: "track", label: "🐾 Track Creature", emoji: "🐾" },
  trap: { key: "trap", label: "🪤 Set Trap", emoji: "🪤" },
  
  // Prisoner & Enemy Actions
  free: { key: "free", label: "🔓 Free Prisoner", emoji: "🔓" },
  execute: { key: "execute", label: "⚔️ Execute Prisoner", emoji: "⚔️" },
  spare: { key: "spare", label: "🕊️ Spare Enemy", emoji: "🕊️" },
  finish: { key: "finish", label: "💀 Finish Enemy", emoji: "💀" },
  
  // Combat Actions
  intimidate: { key: "intimidate", label: "😈 Intimidate", emoji: "😈" },
  duel: { key: "duel", label: "⚔️ Challenge Duel", emoji: "⚔️" },
  surrender: { key: "surrender", label: "🏳️ Surrender", emoji: "🏳️" },
  fight: { key: "fight", label: "⚔️ Fight", emoji: "⚔️" },
  
  // Navigation & Movement
  shortcut: { key: "shortcut", label: "🛤️ Take Shortcut", emoji: "🛤️" },
  bridge: { key: "bridge", label: "🌉 Cross Bridge", emoji: "🌉" },
  swim: { key: "swim", label: "🏊 Swim Across", emoji: "🏊" },
  climb: { key: "climb", label: "🧗 Climb Cliff", emoji: "🧗" },
  descend: { key: "descend", label: "⬇️ Descend Deeper", emoji: "⬇️" },
  
  // Device & Mechanism
  activate: { key: "activate", label: "⚙️ Activate Device", emoji: "⚙️" },
  disable: { key: "disable", label: "🔧 Disable Device", emoji: "🔧" },
  ringbell: { key: "ringbell", label: "🔔 Ring Bell", emoji: "🔔" },
  
  // Consumables & Items
  drinkpotion: { key: "drinkpotion", label: "🧪 Drink Potion", emoji: "🧪" },
  eatfruit: { key: "eatfruit", label: "🍎 Eat Strange Fruit", emoji: "🍎" },
  readbook: { key: "readbook", label: "📚 Read Ancient Book", emoji: "📚" },
  wearcursed: { key: "wearcursed", label: "👑 Wear Cursed Item", emoji: "👑" },
  removecursed: { key: "removecursed", label: "🚫 Remove Cursed Item", emoji: "🚫" },
  
  // Portal & Dimensional
  enterportal: { key: "enterportal", label: "🌀 Enter Portal", emoji: "🌀" },
  closeportal: { key: "closeportal", label: "🚫 Close Portal", emoji: "🚫" },
  touchcrystal: { key: "touchcrystal", label: "💎 Touch Crystal", emoji: "💎" },
  breakcrystal: { key: "breakcrystal", label: "💥 Break Crystal", emoji: "💥" },
  
  // Respect & Honor
  kneel: { key: "kneel", label: "🧎 Kneel", emoji: "🧎" },
  bow: { key: "bow", label: "🙇 Bow", emoji: "🙇" },
  demand: { key: "demand", label: "❗ Demand Answers", emoji: "❗" },
  accuse: { key: "accuse", label: "👉 Accuse", emoji: "👉" },
  forgive: { key: "forgive", label: "🕊️ Forgive", emoji: "🕊️" },
  
  // Rewards & Missions
  takereward: { key: "takereward", label: "💰 Take Reward", emoji: "💰" },
  refusereward: { key: "refusereward", label: "🚫 Refuse Reward", emoji: "🚫" },
  escort: { key: "escort", label: "🛡️ Escort Traveler", emoji: "🛡️" },
  abandon: { key: "abandon", label: "🚶 Abandon Traveler", emoji: "🚶" },
  
  // Supernatural Phenomena
  followlights: { key: "followlights", label: "✨ Follow Lights", emoji: "✨" },
  ignorevoices: { key: "ignorevoices", label: "🙉 Ignore Voices", emoji: "🙉" },
  chaseshadow: { key: "chaseshadow", label: "👤 Chase Shadow", emoji: "👤" },
  
  // Evidence & Investigation
  hideevidence: { key: "hideevidence", label: "🗑️ Hide Evidence", emoji: "🗑️" },
  showevidence: { key: "showevidence", label: "📋 Reveal Evidence", emoji: "📋" },
  
  // Tomb & Ancient Sites
  opensarcophagus: { key: "opensarcophagus", label: "⚰️ Open Sarcophagus", emoji: "⚰️" },
  sealtomb: { key: "sealtomb", label: "🔒 Seal Tomb", emoji: "🔒" },
  uselever: { key: "uselever", label: "🎚️ Use Ancient Lever", emoji: "🎚️" },
  pullsword: { key: "pullsword", label: "⚔️ Pull Sword from Stone", emoji: "⚔️" },
  
  // Water & Wishes
  drinkspring: { key: "drinkspring", label: "💧 Drink from Spring", emoji: "💧" },
  throwcoin: { key: "throwcoin", label: "🪙 Throw Coin", emoji: "🪙" },
  wish: { key: "wish", label: "⭐ Make a Wish", emoji: "⭐" },
  
  // Timing & Trust
  enteralone: { key: "enteralone", label: "🚶 Enter Alone", emoji: "🚶" },
  waitmorning: { key: "waitmorning", label: "🌅 Wait for Morning", emoji: "🌅" },
  trust: { key: "trust", label: "🤝 Trust the Stranger", emoji: "🤝" },
  distrust: { key: "distrust", label: "🤨 Distrust the Stranger", emoji: "🤨" },
  
  // Creature Interaction
  study: { key: "study", label: "📝 Study Creature", emoji: "📝" },
  capture: { key: "capture", label: "🪤 Capture Creature", emoji: "🪤" },
  release: { key: "release", label: "🕊️ Release Creature", emoji: "🕊️" },
  
  // Area Effects
  harvest: { key: "harvest", label: "💎 Harvest Crystal", emoji: "💎" },
  purify: { key: "purify", label: "✨ Purify Area", emoji: "✨" },
  corrupt: { key: "corrupt", label: "🌑 Corrupt Area", emoji: "🌑" },
  lightcandle: { key: "lightcandle", label: "🕯️ Light Candle", emoji: "🕯️" },
  extinguishflame: { key: "extinguishflame", label: "💨 Extinguish Flame", emoji: "💨" },
  
  // Map & Navigation
  readmap: { key: "readmap", label: "🗺️ Read Map", emoji: "🗺️" },
  ignoremap: { key: "ignoremap", label: "🚫 Ignore Map", emoji: "🚫" },
  opengate: { key: "opengate", label: "🚪 Open the Gate", emoji: "🚪" },
  lockgate: { key: "lockgate", label: "🔒 Lock the Gate", emoji: "🔒" },
  soundhorn: { key: "soundhorn", label: "📯 Sound the Horn", emoji: "📯" },
  followprints: { key: "followprints", label: "👣 Follow Footprints", emoji: "👣" },
  
  // Death & Respect
  bury: { key: "bury", label: "⚰️ Bury the Dead", emoji: "⚰️" },
  loot: { key: "loot", label: "💰 Loot the Dead", emoji: "💰" },
  
  // Mission & Fate
  acceptmission: { key: "acceptmission", label: "✅ Accept Mission", emoji: "✅" },
  declinemission: { key: "declinemission", label: "❌ Decline Mission", emoji: "❌" },
  challengefate: { key: "challengefate", label: "⚡ Challenge Fate", emoji: "⚡" },
  turnback: { key: "turnback", label: "🔙 Turn Back", emoji: "🔙" },
  
  // Void & Madness
  gazevoid: { key: "gazevoid", label: "👁️ Gaze Into Void", emoji: "👁️" },
  resist: { key: "resist", label: "🛡️ Resist the Whisper", emoji: "🛡️" },
  embrace: { key: "embrace", label: "🌑 Embrace the Whisper", emoji: "🌑" },
  
  // Dream & Reality
  enterdream: { key: "enterdream", label: "💭 Enter Dream", emoji: "💭" },
  wakeup: { key: "wakeup", label: "⏰ Wake Up Immediately", emoji: "⏰" },
  staylonger: { key: "staylonger", label: "😴 Stay Longer", emoji: "😴" },
};

/**
 * Get choice definition by key
 * @param {string} key 
 * @returns {object|null}
 */
export function getChoiceDefinition(key) {
  return storyChoices[key] || null;
}

/**
 * Get all choice keys
 * @returns {array}
 */
export function getAllChoiceKeys() {
  return Object.keys(storyChoices);
}

/**
 * Get text in player's language (supports bilingual format)
 * @param {string|object} text - Either a string or { en: "...", id: "..." }
 * @param {string} langCode - "en" or "id"
 * @returns {string}
 */
export function getStoryText(text, langCode = "en") {
  if (typeof text === "string") {
    return text; // Old format (single language)
  }
  if (typeof text === "object" && text !== null) {
    return text[langCode] || text.en || text.id || ""; // Bilingual format
  }
  return "";
}

// ══════════════════════════════════════════════════════════
// REPUTATION HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════

/**
 * Get reputation title based on reputation value
 * @param {number} reputation 
 * @returns {object} { title, emoji, color }
 */
export function getReputationTitle(reputation) {
  if (reputation >= 80) return { title: "Saint", emoji: "😇", color: "✨" };
  if (reputation >= 50) return { title: "Hero", emoji: "🦸", color: "⭐" };
  if (reputation >= 20) return { title: "Good", emoji: "😊", color: "💚" };
  if (reputation >= -20) return { title: "Neutral", emoji: "😐", color: "⚪" };
  if (reputation >= -50) return { title: "Bad", emoji: "😠", color: "🔴" };
  if (reputation >= -80) return { title: "Villain", emoji: "😈", color: "💀" };
  return { title: "Demon", emoji: "👹", color: "🔥" };
}

/**
 * Format reputation bar
 * @param {number} reputation (-100 to 100)
 * @returns {string}
 */
export function formatReputationBar(reputation) {
  const normalized = Math.max(-100, Math.min(100, reputation));
  const position = Math.floor(((normalized + 100) / 200) * 10);
  
  let bar = "";
  for (let i = 0; i < 10; i++) {
    if (i === position) {
      bar += "◆";
    } else if (i < 5) {
      bar += "▬"; // Evil side
    } else {
      bar += "▬"; // Good side
    }
  }
  
  return `[${bar}]`;
}

// ══════════════════════════════════════════════════════════
// STORY ENCOUNTERS
// ══════════════════════════════════════════════════════════

export const storyEncounters = {
  
  // ═══════════════════════════════════════════════════════
  // MYSTERIOUS MERCHANT
  // ═══════════════════════════════════════════════════════
  mysterious_merchant: {
    id: "mysterious_merchant",
    title: "🎭 Mysterious Merchant",
    description:
      `A hooded figure emerges from the shadows, their cart filled with strange glowing items.\n\n` +
      `"Greetings, traveler! I have rare wares from distant lands. Perhaps you'd like to make a trade?"\n\n` +
      `The merchant's eyes gleam with an otherworldly light.`,
    
    emoji: "🎭",
    rarity: "uncommon",
    locations: ["all"], // Can appear anywhere
    
    choices: {
      talk: {
        label: "💬 Talk",
        outcomes: [
          {
            weight: 60,
            type: "good",
            text: `You chat with the merchant and learn valuable information about a hidden treasure nearby!`,
            rewards: { gold: 500, exp: 100 },
          },
          {
            weight: 30,
            type: "neutral",
            text: `The merchant shares interesting stories but offers nothing of value.`,
            rewards: { exp: 50 },
          },
          {
            weight: 10,
            type: "bad",
            text: `The merchant's stories bore you to tears. You waste precious time.`,
            rewards: {},
          },
        ],
      },
      
      take: {
        label: "🤲 Take Item",
        outcomes: [
          {
            weight: 40,
            type: "good",
            text: `The merchant offers you a mysterious potion as a gift!`,
            rewards: { items: [{ id: "elixir", qty: 1 }], exp: 50 },
          },
          {
            weight: 40,
            type: "neutral",
            text: `The merchant wants payment. You decline politely.`,
            rewards: {},
          },
          {
            weight: 20,
            type: "bad",
            text: `You try to take an item without paying. The merchant curses you!\n*You lose some gold.*`,
            rewards: { gold: -200 },
          },
        ],
      },
      
      leave: {
        label: "🚶 Leave",
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: `You politely decline and continue on your journey.`,
            rewards: {},
          },
        ],
      },
      
      fight: {
        label: "⚔️ Fight",
        outcomes: [
          {
            weight: 30,
            type: "good",
            text: `The merchant was actually a bandit in disguise! You defeat them and claim their gold!`,
            rewards: { gold: 800, exp: 200 },
          },
          {
            weight: 70,
            type: "bad",
            text: `The merchant was innocent! You feel terrible and lose reputation.\n*Guards fine you for assault.*`,
            rewards: { gold: -500, exp: -50 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // INJURED TRAVELER
  // ═══════════════════════════════════════════════════════
  injured_traveler: {
    id: "injured_traveler",
    title: "🤕 Injured Traveler",
    description:
      `You find a wounded traveler lying by the roadside, clutching their side.\n\n` +
      `"Please... help me... bandits... took everything..."\n\n` +
      `They look like they need immediate assistance.`,
    
    emoji: "🤕",
    rarity: "common",
    locations: ["all"],
    
    choices: {
      help: {
        label: "❤️ Help (Requires: 1x Health Potion)",
        requiredItems: [{ id: "health_potion", qty: 1 }],
        outcomes: [
          {
            weight: 70,
            type: "good",
            text: `You bandage their wounds and give them a potion. They thank you profusely and reward you!`,
            rewards: { gold: 300, exp: 150, items: [{ id: "health_potion", qty: 2 }], reputation: 15 },
          },
          {
            weight: 20,
            type: "neutral",
            text: `You help them, but they have nothing to offer in return. They thank you sincerely.`,
            rewards: { exp: 100, reputation: 10 },
          },
          {
            weight: 10,
            type: "bad",
            text: `It was a trap! The "injured" traveler was a thief. They steal some of your gold!`,
            rewards: { gold: -400, reputation: -5 },
          },
        ],
      },
      
      talk: {
        label: "💬 Talk",
        outcomes: [
          {
            weight: 50,
            type: "neutral",
            text: `You talk to them and learn about the bandit hideout nearby.`,
            rewards: { exp: 80, reputation: 2 },
          },
          {
            weight: 50,
            type: "bad",
            text: `While you're talking, they pass out from blood loss. You feel guilty.`,
            rewards: { exp: -30, reputation: -5 },
          },
        ],
      },
      
      ignore: {
        label: "👁️ Ignore",
        outcomes: [
          {
            weight: 60,
            type: "neutral",
            text: `You walk past, minding your own business.`,
            rewards: { reputation: -3 },
          },
          {
            weight: 40,
            type: "bad",
            text: `You ignore them and continue. Later, you hear they didn't survive. You feel terrible.`,
            rewards: { exp: -50, reputation: -10 },
          },
        ],
      },
      
      take: {
        label: "🤲 Search Them",
        outcomes: [
          {
            weight: 30,
            type: "good",
            text: `You find a valuable item they dropped. You take it and leave them a potion.`,
            rewards: { gold: 200, items: [{ id: "iron_bar", qty: 3 }], reputation: 5 },
          },
          {
            weight: 70,
            type: "bad",
            text: `You rob an injured person? That's low. Karma will remember this.`,
            rewards: { gold: 100, exp: -100, reputation: -20 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // TREASURE CHEST
  // ═══════════════════════════════════════════════════════
  treasure_chest: {
    id: "treasure_chest",
    title: "📦 Mysterious Chest",
    description:
      `You spot an ornate chest sitting in the middle of the path.\n\n` +
      `It's unlocked and slightly ajar, revealing a faint golden glow from within.\n\n` +
      `This seems too good to be true...`,
    
    emoji: "📦",
    rarity: "rare",
    locations: ["all"],
    
    choices: {
      take: {
        label: "🤲 Open Chest",
        outcomes: [
          {
            weight: 40,
            type: "good",
            text: `Jackpot! The chest is filled with gold and rare items!`,
            rewards: { 
              gold: 1000, 
              exp: 200,
              items: [
                { id: "gold_bar", qty: 5 },
                { id: "mega_potion", qty: 3 },
              ],
            },
          },
          {
            weight: 30,
            type: "neutral",
            text: `The chest contains a modest amount of gold.`,
            rewards: { gold: 300 },
          },
          {
            weight: 30,
            type: "bad",
            text: `It's a trap! A poison dart shoots out and hits you!\n*You lose HP and gold.*`,
            rewards: { gold: -200, damage: 50 },
          },
        ],
      },
      
      leave: {
        label: "🚶 Leave It",
        outcomes: [
          {
            weight: 70,
            type: "neutral",
            text: `You wisely avoid the suspicious chest and continue on your way.`,
            rewards: { exp: 50 },
          },
          {
            weight: 30,
            type: "bad",
            text: `You leave the chest. Later, you hear someone else found a fortune inside. You regret your caution.`,
            rewards: {},
          },
        ],
      },
      
      fight: {
        label: "⚔️ Attack Chest",
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: `You smash the chest open! It was a mimic monster! You defeat it and claim the loot!`,
            rewards: { 
              gold: 800, 
              exp: 300,
              items: [{ id: "leather", qty: 5 }],
            },
          },
          {
            weight: 50,
            type: "bad",
            text: `You destroy the chest and its contents. Nothing salvageable remains.`,
            rewards: { exp: 50 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // LOST CHILD
  // ═══════════════════════════════════════════════════════
  lost_child: {
    id: "lost_child",
    title: "👶 Lost Child",
    description:
      `A small child sits crying by a tree.\n\n` +
      `"I can't find my way home... I'm scared..."\n\n` +
      `They look up at you with tearful eyes.`,
    
    emoji: "👶",
    rarity: "uncommon",
    locations: ["peaceful_forest", "green_meadow", "starter_village"],
    
    choices: {
      help: {
        label: "❤️ Help Find Home",
        outcomes: [
          {
            weight: 80,
            type: "good",
            text: `You escort the child home safely. Their grateful parents reward you generously!`,
            rewards: { gold: 600, exp: 200, reputation: 20 },
          },
          {
            weight: 20,
            type: "neutral",
            text: `You help them find their way. They thank you, but have no reward to offer.`,
            rewards: { exp: 150, reputation: 15 },
          },
        ],
      },
      
      talk: {
        label: "💬 Talk",
        outcomes: [
          {
            weight: 60,
            type: "neutral",
            text: `You comfort the child and give them directions. They seem reassured.`,
            rewards: { exp: 100, reputation: 5 },
          },
          {
            weight: 40,
            type: "bad",
            text: `Your directions were wrong. The child gets more lost. You feel awful.`,
            rewards: { exp: -50, reputation: -8 },
          },
        ],
      },
      
      ignore: {
        label: "👁️ Ignore",
        outcomes: [
          {
            weight: 100,
            type: "bad",
            text: `You ignore a crying child? That's heartless. You feel guilty for days.`,
            rewards: { exp: -100, reputation: -25 },
          },
        ],
      },
      
      take: {
        label: "🤲 Give Gold (Requires: 100 Gold)",
        requiredGold: 100,
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: `You give the child some gold to help them get home safely. They smile through their tears.`,
            rewards: { exp: 150, gold: -100, reputation: 12 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // BANDIT AMBUSH
  // ═══════════════════════════════════════════════════════
  bandit_ambush: {
    id: "bandit_ambush",
    title: "🗡️ Bandit Ambush",
    description:
      `Three bandits jump out from behind the rocks!\n\n` +
      `"Hand over your gold, or face the consequences!"\n\n` +
      `They brandish their weapons menacingly.`,
    
    emoji: "🗡️",
    rarity: "common",
    locations: ["dark_forest", "mountain_path", "desert_oasis", "shadow_valley"],
    
    choices: {
      fight: {
        label: "⚔️ Fight",
        outcomes: [
          {
            weight: 60,
            type: "good",
            text: `You defeat the bandits and claim their stolen loot!`,
            rewards: { gold: 700, exp: 250, items: [{ id: "iron_bar", qty: 3 }] },
          },
          {
            weight: 40,
            type: "bad",
            text: `You fight bravely but get injured in the process.`,
            rewards: { gold: 300, exp: 150, damage: 80 },
          },
        ],
      },
      
      run: {
        label: "🏃 Run",
        outcomes: [
          {
            weight: 70,
            type: "neutral",
            text: `You escape successfully! No harm done.`,
            rewards: { exp: 50 },
          },
          {
            weight: 30,
            type: "bad",
            text: `You try to run but they catch you! They take some of your gold.`,
            rewards: { gold: -300 },
          },
        ],
      },
      
      talk: {
        label: "💬 Negotiate",
        outcomes: [
          {
            weight: 40,
            type: "good",
            text: `You convince them you're not worth robbing. They let you go and even share some info about treasure nearby!`,
            rewards: { exp: 150 },
          },
          {
            weight: 40,
            type: "neutral",
            text: `You pay them a small amount to leave you alone.`,
            rewards: { gold: -200, exp: 50 },
          },
          {
            weight: 20,
            type: "bad",
            text: `Your negotiation fails. They take your gold anyway!`,
            rewards: { gold: -500 },
          },
        ],
      },
      
      take: {
        label: "🤲 Offer Gold",
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: `You hand over some gold. They take it and leave you alone.`,
            rewards: { gold: -300 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // ANCIENT SHRINE
  // ═══════════════════════════════════════════════════════
  ancient_shrine: {
    id: "ancient_shrine",
    title: "⛩️ Ancient Shrine",
    description:
      `You discover an ancient shrine covered in mysterious runes.\n\n` +
      `A stone altar sits in the center with a glowing orb.\n\n` +
      `You feel a strange energy emanating from it.`,
    
    emoji: "⛩️",
    rarity: "rare",
    locations: ["mystic_temple", "floating_sanctuary", "ancient_ruins"],
    
    choices: {
      take: {
        label: "🤲 Touch Orb",
        outcomes: [
          {
            weight: 40,
            type: "good",
            text: `The orb grants you a blessing! You feel stronger and wiser!`,
            rewards: { exp: 500, gold: 500 },
          },
          {
            weight: 40,
            type: "neutral",
            text: `The orb glows briefly but nothing happens.`,
            rewards: { exp: 100 },
          },
          {
            weight: 20,
            type: "bad",
            text: `The orb shocks you with dark energy! You feel weakened.`,
            rewards: { damage: 100, exp: -100 },
          },
        ],
      },
      
      talk: {
        label: "💬 Pray",
        outcomes: [
          {
            weight: 70,
            type: "good",
            text: `Your prayer is answered! You receive a divine blessing!`,
            rewards: { exp: 300, items: [{ id: "elixir", qty: 2 }] },
          },
          {
            weight: 30,
            type: "neutral",
            text: `You pray silently. You feel at peace.`,
            rewards: { exp: 150 },
          },
        ],
      },
      
      leave: {
        label: "🚶 Leave",
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: `You respectfully leave the shrine undisturbed.`,
            rewards: { exp: 50 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // WILD ANIMAL
  // ═══════════════════════════════════════════════════════
  wild_animal: {
    id: "wild_animal",
    title: "🐺 Wild Animal",
    description:
      `A large wolf blocks your path, growling menacingly.\n\n` +
      `Its eyes are locked on you, and it looks hungry.\n\n` +
      `What will you do?`,
    
    emoji: "🐺",
    rarity: "common",
    locations: ["peaceful_forest", "dark_forest", "mountain_path"],
    
    choices: {
      fight: {
        label: "⚔️ Fight",
        outcomes: [
          {
            weight: 60,
            type: "good",
            text: `You defeat the wolf and claim its pelt!`,
            rewards: { exp: 200, items: [{ id: "leather", qty: 5 }] },
          },
          {
            weight: 40,
            type: "bad",
            text: `You fight the wolf but get bitten badly.`,
            rewards: { exp: 100, damage: 60 },
          },
        ],
      },
      
      run: {
        label: "🏃 Run",
        outcomes: [
          {
            weight: 80,
            type: "neutral",
            text: `You run away successfully. The wolf doesn't chase you.`,
            rewards: { exp: 30 },
          },
          {
            weight: 20,
            type: "bad",
            text: `The wolf chases you! You escape but drop some items in the panic.`,
            rewards: { gold: -100 },
          },
        ],
      },
      
      talk: {
        label: "💬 Calm It",
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: `You speak softly and the wolf calms down. It even follows you for a bit before leaving.`,
            rewards: { exp: 150 },
          },
          {
            weight: 50,
            type: "bad",
            text: `The wolf doesn't understand you and attacks!`,
            rewards: { damage: 50, exp: 50 },
          },
        ],
      },
      
      take: {
        label: "🤲 Feed It (Requires: 1x Fresh Fish)",
        requiredItems: [{ id: "fresh_fish", qty: 1 }],
        outcomes: [
          {
            weight: 80,
            type: "good",
            text: `You feed the wolf some fish. It becomes friendly and leads you to a hidden cache!`,
            rewards: { gold: 400, exp: 150 },
          },
          {
            weight: 20,
            type: "neutral",
            text: `You feed the wolf and it leaves peacefully.`,
            rewards: { exp: 100 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // FORTUNE TELLER
  // ═══════════════════════════════════════════════════════
  fortune_teller: {
    id: "fortune_teller",
    title: "🔮 Fortune Teller",
    description:
      `An old woman sits at a small table with a crystal ball.\n\n` +
      `"Cross my palm with silver, and I shall reveal your future..."\n\n` +
      `Her eyes seem to see right through you.`,
    
    emoji: "🔮",
    rarity: "uncommon",
    locations: ["starter_village", "trading_post", "mystic_temple"],
    
    choices: {
      talk: {
        label: "💬 Ask Fortune",
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: `She reveals a vision of great fortune! You feel lucky!\n*Bonus EXP for your next hunt!*`,
            rewards: { exp: 200, gold: -100 },
          },
          {
            weight: 30,
            type: "neutral",
            text: `She tells you vague predictions that could mean anything.`,
            rewards: { gold: -50, exp: 50 },
          },
          {
            weight: 20,
            type: "bad",
            text: `She predicts doom and gloom. You feel cursed.\n*You lose confidence.*`,
            rewards: { gold: -100, exp: -50 },
          },
        ],
      },
      
      leave: {
        label: "🚶 Leave",
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: `You politely decline and walk away.`,
            rewards: {},
          },
        ],
      },
      
      take: {
        label: "🤲 Pay Generously (Requires: 300 Gold)",
        requiredGold: 300,
        outcomes: [
          {
            weight: 80,
            type: "good",
            text: `Impressed by your generosity, she gives you a magical charm!`,
            rewards: { gold: -300, items: [{ id: "elixir", qty: 1 }], exp: 150 },
          },
          {
            weight: 20,
            type: "neutral",
            text: `She takes your gold and gives you a generic fortune.`,
            rewards: { gold: -300, exp: 50 },
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════
  // MYSTERIOUS CAVE (Multi-Stage Story Example - Bilingual)
  // ═══════════════════════════════════════════════════════
  mysterious_cave: {
    id: "mysterious_cave",
    title: {
      en: "🕳️ Mysterious Cave",
      id: "🕳️ Gua Misterius"
    },
    description: {
      en: 
        `You discover a dark cave at the foot of the mountain.\n\n` +
        `Strange lights flicker from within, and you hear the sound of dripping water.\n\n` +
        `Do you dare to enter?`,
      id:
        `Kamu menemukan gua gelap di kaki gunung.\n\n` +
        `Cahaya aneh berkilauan dari dalam, dan kamu mendengar suara air menetes.\n\n` +
        `Apakah kamu berani masuk?`
    },
    
    emoji: "🕳️",
    rarity: "uncommon",
    locations: ["mountain_path", "dark_forest", "shadow_valley"],
    
    // STAGE 1: Initial decision
    choices: {
      enter: {
        label: {
          en: "🚪 Enter Cave",
          id: "🚪 Masuk Gua"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You carefully enter the cave.\n\n` +
                `After a few steps, you see two different paths.\n\n` +
                `The left path has the sound of water, the right path has a strange light.`,
              id:
                `Kamu memasuki gua dengan hati-hati.\n\n` +
                `Setelah beberapa langkah, kamu melihat dua jalur berbeda.\n\n` +
                `Jalur kiri terdengar suara air, jalur kanan ada cahaya aneh.`
            },
            rewards: { exp: 50 },
            nextStage: "inside_cave",
          },
        ],
      },
      
      observe: {
        label: {
          en: "👀 Observe First",
          id: "👀 Amati Dulu"
        },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You carefully observe the cave from outside.\n\n` +
                `You see footprints leading inside and danger signs on the wall!\n\n` +
                `It seems there are traps inside.`,
              id:
                `Kamu mengamati gua dari luar dengan teliti.\n\n` +
                `Kamu melihat jejak kaki menuju ke dalam dan tanda bahaya di dinding!\n\n` +
                `Sepertinya ada jebakan di dalam.`
            },
            rewards: { exp: 100 },
            nextStage: "observed_cave",
          },
        ],
      },
      
      leave: {
        label: {
          en: "🚶 Leave",
          id: "🚶 Pergi"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You decide not to take the risk and leave.`,
              id: `Kamu memutuskan untuk tidak mengambil risiko dan pergi.`
            },
            rewards: { exp: 20 },
          },
        ],
      },
    },
    
    // MULTI-STAGE DEFINITIONS
    stages: {
      
      // STAGE 2A: Inside cave
      inside_cave: {
        title: {
          en: "🕳️ Inside the Cave",
          id: "🕳️ Di Dalam Gua"
        },
        description: {
          en:
            `You are at a crossroads.\n\n` +
            `Left path: Sound of flowing water, feels cool.\n` +
            `Right path: Strange light glowing, feels warm.\n\n` +
            `Which will you choose?`,
          id:
            `Kamu berada di persimpangan.\n\n` +
            `Jalur kiri: Suara air mengalir, terasa sejuk.\n` +
            `Jalur kanan: Cahaya aneh berkilauan, terasa hangat.\n\n` +
            `Mana yang akan kamu pilih?`
        },
        
        choices: {
          left: {
            label: {
              en: "⬅️ Left Path",
              id: "⬅️ Jalur Kiri"
            },
            outcomes: [
              {
                weight: 70,
                type: "good",
                text: {
                  en:
                    `You follow the left path and discover a magical water source!\n\n` +
                    `This water can heal wounds!`,
                  id:
                    `Kamu mengikuti jalur kiri dan menemukan sumber air ajaib!\n\n` +
                    `Air ini bisa menyembuhkan luka!`
                },
                rewards: {
                  gold: 500,
                  exp: 200,
                  items: [{ id: "elixir", qty: 3 }],
                  reputation: 10,
                },
                nextStage: "water_source",
              },
              {
                weight: 30,
                type: "bad",
                text: {
                  en: `The left path is slippery! You slip and get hurt!`,
                  id: `Jalur kiri ternyata licin! Kamu terpeleset dan terluka!`
                },
                rewards: { damage: 80, exp: 50 },
              },
            ],
          },
          
          right: {
            label: {
              en: "➡️ Right Path",
              id: "➡️ Jalur Kanan"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `You follow the light and find glowing crystals!\n\n` +
                    `These crystals are very valuable!`,
                  id:
                    `Kamu mengikuti cahaya dan menemukan kristal bercahaya!\n\n` +
                    `Kristal ini sangat berharga!`
                },
                rewards: {
                  gold: 1000,
                  exp: 300,
                  items: [{ id: "gold_bar", qty: 5 }],
                },
                nextStage: "crystal_room",
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en: `The light was a trap! You are hit by dark magic!`,
                  id: `Cahaya itu ternyata jebakan! Kamu terkena sihir gelap!`
                },
                rewards: { damage: 120, gold: -200, reputation: -10 },
              },
            ],
          },
          
          back: {
            label: {
              en: "🔙 Go Back",
              id: "🔙 Kembali"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You decide to exit the cave safely.`,
                  id: `Kamu memutuskan untuk keluar dari gua dengan selamat.`
                },
                rewards: { exp: 80 },
              },
            ],
          },
        },
      },
      
      // STAGE 2B: After observing
      observed_cave: {
        title: {
          en: "🕳️ Mysterious Cave - Cautious",
          id: "🕳️ Gua Misterius - Waspada"
        },
        description: {
          en:
            `You already know there are traps inside.\n\n` +
            `Do you still want to enter carefully, or look for another way?`,
          id:
            `Kamu sudah tahu ada jebakan di dalam.\n\n` +
            `Apakah kamu tetap ingin masuk dengan hati-hati, atau mencari jalan lain?`
        },
        
        choices: {
          careful: {
            label: {
              en: "🤫 Enter Carefully",
              id: "🤫 Masuk Hati-hati"
            },
            outcomes: [
              {
                weight: 80,
                type: "good",
                text: {
                  en:
                    `Thanks to your observation, you successfully avoid all the traps!\n\n` +
                    `You discover a hidden treasure!`,
                  id:
                    `Berkat pengamatanmu, kamu berhasil menghindari semua jebakan!\n\n` +
                    `Kamu menemukan harta karun yang tersembunyi!`
                },
                rewards: {
                  gold: 2000,
                  exp: 500,
                  items: [
                    { id: "gold_bar", qty: 10 },
                    { id: "elixir", qty: 5 },
                  ],
                  reputation: 20,
                },
              },
              {
                weight: 20,
                type: "neutral",
                text: {
                  en: `You enter carefully but find nothing.`,
                  id: `Kamu masuk dengan hati-hati tapi tidak menemukan apa-apa.`
                },
                rewards: { exp: 150 },
              },
            ],
          },
          
          search: {
            label: {
              en: "🔎 Search for Another Way",
              id: "🔎 Cari Jalan Lain"
            },
            outcomes: [
              {
                weight: 60,
                type: "good",
                text: {
                  en:
                    `You find a secret passage beside the cave!\n\n` +
                    `This path leads directly to the treasure room without traps!`,
                  id:
                    `Kamu menemukan jalan rahasia di samping gua!\n\n` +
                    `Jalan ini langsung menuju ke ruang harta tanpa jebakan!`
                },
                rewards: {
                  gold: 1500,
                  exp: 400,
                  items: [{ id: "iron_bar", qty: 10 }],
                },
              },
              {
                weight: 40,
                type: "neutral",
                text: {
                  en: `You search but find no other way.`,
                  id: `Kamu mencari tapi tidak menemukan jalan lain.`
                },
                rewards: { exp: 100 },
              },
            ],
          },
          
          leave: {
            label: {
              en: "🚶 Leave",
              id: "🚶 Pergi"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You decide not to take the risk.`,
                  id: `Kamu memutuskan untuk tidak mengambil risiko.`
                },
                rewards: { exp: 50 },
              },
            ],
          },
        },
      },
      
      // STAGE 3A: Water source
      water_source: {
        title: {
          en: "💧 Magical Water Source",
          id: "💧 Sumber Air Ajaib"
        },
        description: {
          en:
            `You find a pool of glowing crystal water.\n\n` +
            `The water looks very pure and refreshing.\n\n` +
            `What will you do?`,
          id:
            `Kamu menemukan kolam air kristal yang bercahaya.\n\n` +
            `Air ini terlihat sangat murni dan menyegarkan.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          drink: {
            label: {
              en: "💧 Drink Water",
              id: "💧 Minum Air"
            },
            outcomes: [
              {
                weight: 80,
                type: "good",
                text: {
                  en:
                    `The magical water heals all your wounds and grants you strength!\n\n` +
                    `You feel very refreshed!`,
                  id:
                    `Air ajaib menyembuhkan semua lukamu dan memberikan kekuatan!\n\n` +
                    `Kamu merasa sangat segar!`
                },
                rewards: {
                  exp: 300,
                  items: [{ id: "mega_potion", qty: 3 }],
                  reputation: 15,
                },
              },
              {
                weight: 20,
                type: "bad",
                text: {
                  en: `The water is cursed! You feel dizzy!`,
                  id: `Air itu ternyata terkutuk! Kamu merasa pusing!`
                },
                rewards: { damage: 50, exp: 100 },
              },
            ],
          },
          
          bottle: {
            label: {
              en: "🍶 Fill Bottle",
              id: "🍶 Isi Botol"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en: `You fill bottles with magical water for later!`,
                  id: `Kamu mengisi botol dengan air ajaib untuk nanti!`
                },
                rewards: {
                  exp: 200,
                  items: [{ id: "health_potion", qty: 10 }],
                },
              },
            ],
          },
          
          leave: {
            label: {
              en: "🚶 Leave",
              id: "🚶 Pergi"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You leave the water source and exit the cave.`,
                  id: `Kamu meninggalkan sumber air dan keluar dari gua.`
                },
                rewards: { exp: 150 },
              },
            ],
          },
        },
      },
      
      // STAGE 3B: Crystal room
      crystal_room: {
        title: {
          en: "💎 Crystal Room",
          id: "💎 Ruang Kristal"
        },
        description: {
          en:
            `The room is filled with glowing crystals.\n\n` +
            `In the center is a giant crystal radiating powerful energy.\n\n` +
            `What will you do?`,
          id:
            `Ruangan penuh dengan kristal bercahaya.\n\n` +
            `Di tengah ada kristal raksasa yang memancarkan energi kuat.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          absorb: {
            label: {
              en: "⚡ Absorb Power",
              id: "⚡ Serap Kekuatan"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `You absorb the crystal's power!\n\n` +
                    `You feel incredibly strong!`,
                  id:
                    `Kamu menyerap kekuatan kristal!\n\n` +
                    `Kamu merasa sangat kuat!`
                },
                rewards: {
                  gold: 2000,
                  exp: 600,
                  items: [{ id: "iron_bar", qty: 15 }],
                  reputation: -10,
                },
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en:
                    `The crystal's power is too great!\n\n` +
                    `Your body can't withstand it!`,
                  id:
                    `Kekuatan kristal terlalu besar!\n\n` +
                    `Tubuhmu tidak kuat menahan!`
                },
                rewards: { damage: 150, exp: 200 },
              },
            ],
          },
          
          take: {
            label: {
              en: "🤲 Take Small Crystals",
              id: "🤲 Ambil Kristal Kecil"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en: `You safely take some small crystals.`,
                  id: `Kamu mengambil beberapa kristal kecil dengan aman.`
                },
                rewards: {
                  gold: 1000,
                  exp: 300,
                  items: [{ id: "gold_bar", qty: 3 }],
                },
              },
            ],
          },
          
          leave: {
            label: {
              en: "🚶 Leave",
              id: "🚶 Pergi"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You leave the crystals and exit the cave.`,
                  id: `Kamu meninggalkan kristal dan keluar dari gua.`
                },
                rewards: { exp: 200 },
              },
            ],
          },
        },
      },
      
    },
  },

  // ═══════════════════════════════════════════════════════
  // THE STILL WATERS (Multi-Stage Story - Bilingual)
  // ═══════════════════════════════════════════════════════
  moonlit_shore: {
    id: "moonlit_shore",
    title: {
      en: "🌊 The Still Waters",
      id: "🌊 Air yang Diam"
    },
    description: {
      en:
        `You arrive at the water's edge.\n\n` +
        `The lake is completely still despite the strong wind blowing.\n\n` +
        `Something feels wrong... there's something beneath the surface.`,
      id:
        `Kamu tiba di tepi air.\n\n` +
        `Air danau sama sekali tidak bergerak meski angin berhembus kencang.\n\n` +
        `Ada yang aneh... ada sesuatu di bawah permukaan.`
    },
    
    emoji: "🌊",
    rarity: "uncommon",
    locations: ["moonlit_shore", "calm_lake"],
    
    // STAGE 1: Initial decision
    choices: {
      swim: {
        label: {
          en: "🏊 Dive In",
          id: "🏊 Selami Air"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You dive into the still water.\n\n` +
                `The water is ice cold, but you can see something glowing deep below.`,
              id:
                `Kamu menyelam ke dalam air yang diam.\n\n` +
                `Airnya sangat dingin, tapi kamu bisa melihat sesuatu bercahaya di kedalaman.`
            },
            rewards: { exp: 60 },
            nextStage: "underwater"
          }
        ]
      },
      
      coin: {
        label: {
          en: "🪙 Throw Coin",
          id: "🪙 Lempar Koin"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You throw a coin into the water.\n\n` +
                `Ripples spread across the surface, and you hear a faint whisper...`,
              id:
                `Kamu melempar koin ke dalam air.\n\n` +
                `Riak menyebar di permukaan, dan kamu mendengar bisikan samar...`
            },
            rewards: { exp: 40 },
            nextStage: "coin_wish"
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave",
          id: "🚶 Pergi"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You decide not to disturb the still waters.`,
              id: `Kamu memutuskan untuk tidak mengganggu air yang diam.`
            },
            rewards: { exp: 20 }
          }
        ]
      }
    },
    
    stages: {
      // STAGE 2A: Underwater
      underwater: {
        title: {
          en: "🌊 Beneath the Surface",
          id: "🌊 Di Bawah Permukaan"
        },
        description: {
          en:
            `You're underwater now.\n\n` +
            `The glow is coming from deeper down, but your lungs are starting to burn.\n\n` +
            `What will you do?`,
          id:
            `Kamu sekarang di bawah air.\n\n` +
            `Cahaya berasal dari lebih dalam, tapi paru-parumu mulai terasa sesak.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          descend: {
            label: {
              en: "⬇️ Descend Deeper",
              id: "⬇️ Turun Lebih Dalam"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You push deeper into the darkness.\n\n` +
                    `The glow intensifies... you're getting close to something.`,
                  id:
                    `Kamu mendorong lebih dalam ke kegelapan.\n\n` +
                    `Cahaya semakin terang... kamu semakin dekat dengan sesuatu.`
                },
                rewards: { exp: 100 },
                nextStage: "deep_water"
              }
            ]
          },
          
          back: {
            label: {
              en: "🔙 Surface",
              id: "🔙 Balik ke Permukaan"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You swim back to the surface, gasping for air.\n\nWhatever was down there remains a mystery.`,
                  id: `Kamu berenang kembali ke permukaan, terengah-engah.\n\nApapun yang ada di bawah tetap menjadi misteri.`
                },
                rewards: { exp: 80 }
              }
            ]
          }
        }
      },
      
      // STAGE 2B: After throwing coin
      coin_wish: {
        title: {
          en: "🌊 The Whisper",
          id: "🌊 Bisikan"
        },
        description: {
          en:
            `The whisper grows louder.\n\n` +
            `"Make your wish... or leave before it's too late..."\n\n` +
            `What will you do?`,
          id:
            `Bisikan semakin keras.\n\n` +
            `"Ucapkan permohonanmu... atau pergi sebelum terlambat..."\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          wish: {
            label: {
              en: "⭐ Make a Wish",
              id: "⭐ Ucapkan Permohonan"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You close your eyes and make a wish.\n\n` +
                    `The water begins to glow brighter...`,
                  id:
                    `Kamu memejamkan mata dan mengucapkan permohonan.\n\n` +
                    `Air mulai bercahaya lebih terang...`
                },
                rewards: { exp: 70 },
                nextStage: "deep_water"
              }
            ]
          },
          
          leave: {
            label: {
              en: "🚶 Leave After Throwing",
              id: "🚶 Pergi Setelah Melempar"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en: `You turn to leave.\n\nA small pouch appears at your feet - a gift from the waters.`,
                  id: `Kamu berbalik untuk pergi.\n\nSebuah kantong kecil muncul di kakimu - hadiah dari air.`
                },
                rewards: { gold: 150, exp: 50 }
              }
            ]
          }
        }
      },
      
      // STAGE 3: Deep water discovery
      deep_water: {
        title: {
          en: "💧 The Source",
          id: "💧 Sumbernya"
        },
        description: {
          en:
            `You've reached the source of the glow.\n\n` +
            `A pool of magical water pulses with ancient energy.\n` +
            `Strange fish-like creatures swim around it.\n\n` +
            `What will you do?`,
          id:
            `Kamu telah mencapai sumber cahaya.\n\n` +
            `Sebuah kolam air ajaib berdenyut dengan energi kuno.\n` +
            `Makhluk aneh seperti ikan berenang di sekitarnya.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          drink: {
            label: {
              en: "💧 Drink Magical Water",
              id: "💧 Minum Air Ajaib"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `The water heals all your wounds!\n\n` +
                    `You feel incredibly refreshed and powerful!`,
                  id:
                    `Air menyembuhkan semua lukamu!\n\n` +
                    `Kamu merasa sangat segar dan kuat!`
                },
                rewards: { exp: 300 }
                // Note: heal 200hp would need to be handled in storyHandler
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en:
                    `The water is cursed!\n\n` +
                    `You feel poison spreading through your body!`,
                  id:
                    `Air itu terkutuk!\n\n` +
                    `Kamu merasakan racun menyebar di tubuhmu!`
                },
                rewards: { damage: 150, exp: 100 }
              }
            ]
          },
          
          follow: {
            label: {
              en: "🐟 Follow the Creatures",
              id: "🐟 Ikuti Makhluk"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `The creatures lead you to a hidden underwater cave!\n\n` +
                    `You find ancient treasures and rare items!`,
                  id:
                    `Makhluk-makhluk membawamu ke gua bawah air tersembunyi!\n\n` +
                    `Kamu menemukan harta kuno dan item langka!`
                },
                rewards: {
                  gold: 800,
                  exp: 400,
                  items: [
                    { id: "elixir", qty: 2 },
                    { id: "gold_bar", qty: 3 }
                  ]
                }
              }
            ]
          },
          
          pray: {
            label: {
              en: "✨ Pray and Leave",
              id: "✨ Berdoa Lalu Pergi"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You pray to the spirits of the water.\n\n` +
                    `They grant you their blessing!`,
                  id:
                    `Kamu berdoa kepada roh air.\n\n` +
                    `Mereka memberikan berkah!`
                },
                rewards: { exp: 250, reputation: 20 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // MERCHANT GOSSIP (Multi-Stage Story - Bilingual)
  // ═══════════════════════════════════════════════════════
  merchant_gossip: {
    id: "merchant_gossip",
    title: {
      en: "🗣️ Merchant Gossip",
      id: "🗣️ Gosip Pedagang"
    },
    description: {
      en:
        `You overhear two merchants whispering in the corner.\n\n` +
        `"...smuggled goods from the forbidden place..."\n` +
        `"...if anyone finds out..."\n\n` +
        `They haven't noticed you yet.`,
      id:
        `Kamu mendengar dua pedagang berbisik di sudut.\n\n` +
        `"...barang selundupan dari tempat terlarang..."\n` +
        `"...kalau ada yang tahu..."\n\n` +
        `Mereka belum menyadari kehadiranmu.`
    },
    
    emoji: "🗣️",
    rarity: "common",
    locations: ["trading_post", "starter_village", "fishing_village"],
    
    // STAGE 1: Initial decision
    choices: {
      listen: {
        label: {
          en: "🤫 Listen Quietly",
          id: "🤫 Diam-diam Dengarkan"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You stay hidden and listen carefully.\n\n` +
                `You learn about their smuggling operation and meeting location.`,
              id:
                `Kamu tetap bersembunyi dan mendengarkan dengan seksama.\n\n` +
                `Kamu mengetahui operasi penyelundupan dan lokasi pertemuan mereka.`
            },
            rewards: { exp: 60 },
            nextStage: "know_secret"
          }
        ]
      },
      
      ask: {
        label: {
          en: "❓ Ask Directly",
          id: "❓ Langsung Tanya"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You approach them directly.\n\n` +
                `They stop talking immediately and look at you with suspicion.`,
              id:
                `Kamu mendekati mereka langsung.\n\n` +
                `Mereka langsung berhenti bicara dan menatapmu dengan curiga.`
            },
            rewards: { exp: 40 },
            nextStage: "suspicious"
          }
        ]
      },
      
      ignore: {
        label: {
          en: "🚶 Ignore",
          id: "🚶 Abaikan"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You mind your own business and walk away.`,
              id: `Kamu mengurus urusanmu sendiri dan pergi.`
            },
            rewards: { exp: 10 }
          }
        ]
      }
    },
    
    stages: {
      // STAGE 2A: After listening quietly
      know_secret: {
        title: {
          en: "🗣️ Secret Knowledge",
          id: "🗣️ Rahasia Terungkap"
        },
        description: {
          en:
            `You now know their secret.\n\n` +
            `They're smuggling cursed artifacts from the Shadow Woods.\n\n` +
            `What will you do with this information?`,
          id:
            `Kamu sekarang tahu rahasia mereka.\n\n` +
            `Mereka menyelundupkan artefak terkutuk dari Shadow Woods.\n\n` +
            `Apa yang akan kamu lakukan dengan informasi ini?`
        },
        
        choices: {
          sell: {
            label: {
              en: "📰 Sell Information",
              id: "📰 Jual Info"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You sell the information to a rival merchant.\n\n` +
                    `They pay you well for the tip.`,
                  id:
                    `Kamu menjual informasi ke pedagang saingan.\n\n` +
                    `Mereka membayarmu dengan baik.`
                },
                rewards: { gold: 200, exp: 80 },
                nextStage: "aftermath_sell"
              }
            ]
          },
          
          join: {
            label: {
              en: "🤝 Offer to Join",
              id: "🤝 Tawari Diri Ikut"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You approach them and offer your services.\n\n` +
                    `They're surprised but interested...`,
                  id:
                    `Kamu mendekati mereka dan menawarkan jasamu.\n\n` +
                    `Mereka terkejut tapi tertarik...`
                },
                rewards: { exp: 80 },
                nextStage: "join_them"
              }
            ]
          },
          
          leave: {
            label: {
              en: "🚶 Leave After Knowing",
              id: "🚶 Pergi Setelah Tahu"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You decide to keep the secret and walk away.`,
                  id: `Kamu memutuskan untuk menyimpan rahasia dan pergi.`
                },
                rewards: { exp: 100 }
              }
            ]
          }
        }
      },
      
      // STAGE 2B: After asking directly (they're suspicious)
      suspicious: {
        title: {
          en: "🗣️ Suspicious Merchants",
          id: "🗣️ Pedagang Curiga"
        },
        description: {
          en:
            `The merchants eye you carefully.\n\n` +
            `"What do you want, stranger?"\n\n` +
            `How will you respond?`,
          id:
            `Para pedagang menatapmu dengan hati-hati.\n\n` +
            `"Apa maumu, orang asing?"\n\n` +
            `Bagaimana kamu akan merespons?`
        },
        
        choices: {
          truth: {
            label: {
              en: "🗣️ Speak Honestly",
              id: "🗣️ Bicara Jujur"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You tell them you overheard and are curious.\n\n` +
                    `They seem to relax a bit...`,
                  id:
                    `Kamu bilang kamu mendengar dan penasaran.\n\n` +
                    `Mereka tampak sedikit rileks...`
                },
                rewards: { exp: 60, reputation: 5 },
                nextStage: "join_them"
              }
            ]
          },
          
          lie: {
            label: {
              en: "🤥 Pretend to be Buyer",
              id: "🤥 Pura-pura Jadi Pembeli"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You pretend to be interested in buying.\n\n` +
                    `They seem to believe you...`,
                  id:
                    `Kamu pura-pura tertarik membeli.\n\n` +
                    `Mereka tampak percaya...`
                },
                rewards: { exp: 60 },
                nextStage: "aftermath_sell"
              }
            ]
          }
        }
      },
      
      // STAGE 3A: Aftermath of selling info
      aftermath_sell: {
        title: {
          en: "🗣️ Consequences",
          id: "🗣️ Konsekuensi"
        },
        description: {
          en:
            `Word spreads about the smugglers.\n\n` +
            `The authorities are now involved.\n\n` +
            `What will you do?`,
          id:
            `Kabar menyebar tentang penyelundup.\n\n` +
            `Pihak berwenang sekarang terlibat.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          report: {
            label: {
              en: "📋 Report to Authorities",
              id: "📋 Laporkan ke Otoritas"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You provide full details to the guards.\n\n` +
                    `They arrest the smugglers and reward you!`,
                  id:
                    `Kamu memberikan detail lengkap ke penjaga.\n\n` +
                    `Mereka menangkap penyelundup dan memberimu hadiah!`
                },
                rewards: { gold: 600, exp: 200, reputation: 20 }
              }
            ]
          },
          
          blackmail: {
            label: {
              en: "💰 Demand Payment for Silence",
              id: "💰 Minta Bayaran Diam"
            },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `You try to blackmail the smugglers.\n\n` +
                    `They attack you instead!`,
                  id:
                    `Kamu mencoba memeras penyelundup.\n\n` +
                    `Mereka malah menyerangmu!`
                },
                rewards: { damage: 80, gold: 100, reputation: -15 }
              }
            ]
          }
        }
      },
      
      // STAGE 3B: Joining them
      join_them: {
        title: {
          en: "🗣️ The Deal",
          id: "🗣️ Kesepakatan"
        },
        description: {
          en:
            `The merchants offer you a choice.\n\n` +
            `"Buy our goods, or help us with a job."\n\n` +
            `What will you choose?`,
          id:
            `Para pedagang menawarkan pilihan.\n\n` +
            `"Beli barang kami, atau bantu kami dengan pekerjaan."\n\n` +
            `Apa yang akan kamu pilih?`
        },
        
        choices: {
          buy: {
            label: {
              en: "🛒 Buy Smuggled Goods",
              id: "🛒 Beli Barang Selundupan"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `You buy a mysterious item.\n\n` +
                    `It turns out to be a rare artifact!`,
                  id:
                    `Kamu membeli item misterius.\n\n` +
                    `Ternyata itu artefak langka!`
                },
                rewards: {
                  gold: -300,
                  exp: 200,
                  items: [{ id: "gold_bar", qty: 5 }]
                }
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en:
                    `The item is cursed!\n\n` +
                    `It drains your life force!`,
                  id:
                    `Item itu terkutuk!\n\n` +
                    `Ia menyedot kekuatan hidupmu!`
                },
                rewards: { damage: 100, gold: -300, reputation: -10 }
              }
            ]
          },
          
          mission: {
            label: {
              en: "✅ Accept Their Mission",
              id: "✅ Ikut Misi Mereka"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `They give you a map to a secret location.\n\n` +
                    `"Retrieve the package and we'll pay you well."`,
                  id:
                    `Mereka memberimu peta ke lokasi rahasia.\n\n` +
                    `"Ambil paketnya dan kami akan membayarmu dengan baik."`
                },
                rewards: { gold: 400, exp: 300 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // MISTY GROVE FOG (Multi-Stage Story - Bilingual)
  // ═══════════════════════════════════════════════════════
  misty_grove_lost: {
    id: "misty_grove_lost",
    title: {
      en: "🌫️ Lost in the Fog",
      id: "🌫️ Tersesat dalam Kabut"
    },
    description: {
      en:
        `Thick fog suddenly surrounds you.\n\n` +
        `You can hear your own footsteps echoing twice...\n\n` +
        `Something is very wrong here.`,
      id:
        `Kabut tebal tiba-tiba mengelilingimu.\n\n` +
        `Kamu bisa mendengar langkahmu sendiri bergema dua kali...\n\n` +
        `Ada yang sangat salah di sini.`
    },
    
    emoji: "🌫️",
    rarity: "uncommon",
    locations: ["misty_grove"],
    
    choices: {
      torch: {
        label: {
          en: "🔦 Light Torch and Walk",
          id: "🔦 Nyalakan Obor, Terus Jalan"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You light a torch and keep walking.\n\n` +
                `The fog seems to move away from the light, but you hear whispers...`,
              id:
                `Kamu menyalakan obor dan terus berjalan.\n\n` +
                `Kabut tampak menjauh dari cahaya, tapi kamu mendengar bisikan...`
            },
            rewards: { exp: 50 },
            nextStage: "torch_path"
          }
        ]
      },
      
      wait: {
        label: {
          en: "⏳ Stay Still and Wait",
          id: "⏳ Diam di Tempat, Tunggu"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You stand perfectly still.\n\n` +
                `The fog thickens around you, but you feel safer not moving.`,
              id:
                `Kamu berdiri diam sempurna.\n\n` +
                `Kabut semakin tebal di sekitarmu, tapi kamu merasa lebih aman tidak bergerak.`
            },
            rewards: { exp: 40 },
            nextStage: "wait_path"
          }
        ]
      },
      
      run: {
        label: {
          en: "🏃 Run Out of Fog",
          id: "🏃 Lari Keluar Kabut"
        },
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: {
              en: `You run blindly and somehow find your way out!\n\nYou're safe!`,
              id: `Kamu berlari membabi buta dan entah bagaimana menemukan jalan keluar!\n\nKamu selamat!`
            },
            rewards: { exp: 80 }
          },
          {
            weight: 50,
            type: "bad",
            text: {
              en: `You run in circles and get even more lost!\n\nThe fog is everywhere now...`,
              id: `Kamu berlari berputar-putar dan semakin tersesat!\n\nKabut ada di mana-mana sekarang...`
            },
            rewards: { exp: 30 },
            nextStage: "torch_path"
          }
        ]
      }
    },
    
    stages: {
      torch_path: {
        title: {
          en: "🌫️ Deeper in the Fog",
          id: "🌫️ Lebih Dalam di Kabut"
        },
        description: {
          en:
            `The fog is getting thicker.\n\n` +
            `You hear the sound of running water nearby.\n\n` +
            `What will you do?`,
          id:
            `Kabut semakin tebal.\n\n` +
            `Kamu mendengar suara air mengalir di dekat sini.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          follow: {
            label: {
              en: "👂 Follow the Water Sound",
              id: "👂 Ikuti Suara Air"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You follow the sound of water.\n\n` +
                    `It leads you somewhere unexpected...`,
                  id:
                    `Kamu mengikuti suara air.\n\n` +
                    `Ia membawamu ke tempat yang tak terduga...`
                },
                rewards: { exp: 80 },
                nextStage: "final_choice"
              }
            ]
          },
          
          map: {
            label: {
              en: "🗺️ Read Map",
              id: "🗺️ Baca Peta"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You check your map carefully.\n\n` +
                    `You find the way out!`,
                  id:
                    `Kamu memeriksa petamu dengan hati-hati.\n\n` +
                    `Kamu menemukan jalan keluar!`
                },
                rewards: { exp: 120 }
              }
            ]
          }
        }
      },
      
      wait_path: {
        title: {
          en: "🌫️ Waiting in Silence",
          id: "🌫️ Menunggu dalam Keheningan"
        },
        description: {
          en:
            `Time passes slowly.\n\n` +
            `The fog hasn't moved, but you hear something approaching.\n\n` +
            `What will you do?`,
          id:
            `Waktu berlalu perlahan.\n\n` +
            `Kabut tidak bergerak, tapi kamu mendengar sesuatu mendekat.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          keep_waiting: {
            label: {
              en: "⏳ Keep Waiting",
              id: "⏳ Terus Tunggu"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You remain perfectly still.\n\n` +
                    `Whatever was approaching passes by...`,
                  id:
                    `Kamu tetap diam sempurna.\n\n` +
                    `Apapun yang mendekat lewat begitu saja...`
                },
                rewards: { exp: 60 },
                nextStage: "final_choice"
              }
            ]
          },
          
          call: {
            label: {
              en: "📢 Call for Help",
              id: "📢 Teriak Minta Tolong"
            },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `You call out loudly.\n\n` +
                    `Something answers... and it's coming closer!`,
                  id:
                    `Kamu berteriak keras.\n\n` +
                    `Sesuatu menjawab... dan ia semakin mendekat!`
                },
                rewards: { exp: 40 },
                nextStage: "final_choice"
              }
            ]
          }
        }
      },
      
      final_choice: {
        title: {
          en: "🌫️ The Final Decision",
          id: "🌫️ Keputusan Akhir"
        },
        description: {
          en:
            `You see a figure in the fog.\n\n` +
            `It beckons you to follow.\n` +
            `Or you could try to find your own way.\n\n` +
            `What will you do?`,
          id:
            `Kamu melihat sosok di kabut.\n\n` +
            `Ia memberimu isyarat untuk mengikuti.\n` +
            `Atau kamu bisa mencoba menemukan jalanmu sendiri.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          trust: {
            label: {
              en: "🤝 Trust the Strange Voice",
              id: "🤝 Percaya pada Suara Aneh"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `The figure guides you safely out of the fog!\n\n` +
                    `It was a forest spirit helping lost travelers.`,
                  id:
                    `Sosok itu membimbingmu keluar dari kabut dengan selamat!\n\n` +
                    `Ternyata itu roh hutan yang membantu pengembara tersesat.`
                },
                rewards: { exp: 300, gold: 200 }
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en:
                    `It was a trap!\n\n` +
                    `The figure attacks you!`,
                  id:
                    `Itu jebakan!\n\n` +
                    `Sosok itu menyerangmu!`
                },
                rewards: { damage: 120, exp: 100 }
              }
            ]
          },
          
          shortcut: {
            label: {
              en: "🛤️ Take the Path That Feels Right",
              id: "🛤️ Ambil Jalan Pintas yang Terasa Benar"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You trust your instincts.\n\n` +
                    `After some time, you find your way out.`,
                  id:
                    `Kamu mempercayai instingmu.\n\n` +
                    `Setelah beberapa waktu, kamu menemukan jalan keluar.`
                },
                rewards: { exp: 200, gold: 150 }
              }
            ]
          },
          
          pray: {
            label: {
              en: "🙏 Pray and Wait for Dawn",
              id: "🙏 Berdoa dan Tunggu Fajar"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You pray and wait patiently.\n\n` +
                    `As dawn breaks, the fog lifts and you're safe!`,
                  id:
                    `Kamu berdoa dan menunggu dengan sabar.\n\n` +
                    `Saat fajar tiba, kabut menghilang dan kamu selamat!`
                },
                rewards: { exp: 250, reputation: 10 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // VOLCANIC DEMON (Multi-Stage Story - Bilingual)
  // ═══════════════════════════════════════════════════════
  volcanic_demon: {
    id: "volcanic_demon",
    title: {
      en: "🌋 The Volcanic Demon",
      id: "🌋 Iblis Gunung Berapi"
    },
    description: {
      en:
        `A black figure stands in the middle of flowing lava.\n\n` +
        `It stares directly at you.\n\n` +
        `This is no ordinary monster...`,
      id:
        `Sosok hitam berdiri di tengah aliran lava.\n\n` +
        `Ia menatapmu langsung.\n\n` +
        `Ini bukan monster biasa...`
    },
    
    emoji: "🌋",
    rarity: "rare",
    locations: ["volcanic_ridge", "magma_chamber", "scorched_dunes"],
    
    choices: {
      attack: {
        label: {
          en: "⚔️ Attack Immediately",
          id: "⚔️ Serang Langsung"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You charge at the demon!\n\n` +
                `It blocks your attack effortlessly and grins...`,
              id:
                `Kamu menyerang iblis!\n\n` +
                `Ia menangkis seranganmu dengan mudah dan menyeringai...`
            },
            rewards: { exp: 70 },
            nextStage: "combat_path"
          }
        ]
      },
      
      talk: {
        label: {
          en: "💬 Try to Talk",
          id: "💬 Coba Bicara"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `"You dare speak to me, mortal?"\n\n` +
                `The demon's voice echoes like thunder.`,
              id:
                `"Kau berani bicara padaku, manusia fana?"\n\n` +
                `Suara iblis bergema seperti guntur.`
            },
            rewards: { exp: 80 },
            nextStage: "talk_path"
          }
        ]
      },
      
      run: {
        label: {
          en: "🏃 Run",
          id: "🏃 Lari"
        },
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: {
              en: `You run as fast as you can!\n\nThe demon doesn't chase you.`,
              id: `Kamu berlari secepat mungkin!\n\nIblis tidak mengejarmu.`
            },
            rewards: { exp: 40 }
          },
          {
            weight: 50,
            type: "bad",
            text: {
              en: `The demon throws a fireball at you!\n\nYou're burned!`,
              id: `Iblis melempar bola api padamu!\n\nKamu terbakar!`
            },
            rewards: { damage: 80, exp: 30 }
          }
        ]
      }
    },
    
    stages: {
      combat_path: {
        title: {
          en: "🌋 Battle with the Demon",
          id: "🌋 Pertarungan dengan Iblis"
        },
        description: {
          en:
            `The demon draws a flaming sword.\n\n` +
            `"Show me your strength, mortal!"\n\n` +
            `What will you do?`,
          id:
            `Iblis mengeluarkan pedang berapi.\n\n` +
            `"Tunjukkan kekuatanmu, manusia fana!"\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          continue: {
            label: {
              en: "⚔️ Keep Fighting",
              id: "⚔️ Terus Serang"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You fight with everything you have!\n\n` +
                    `The battle reaches its climax...`,
                  id:
                    `Kamu bertarung dengan seluruh kekuatanmu!\n\n` +
                    `Pertarungan mencapai puncaknya...`
                },
                rewards: { exp: 100 },
                nextStage: "final_battle"
              }
            ]
          },
          
          surrender: {
            label: {
              en: "🏳️ Surrender Mid-Battle",
              id: "🏳️ Menyerah di Tengah"
            },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `"Pathetic!"\n\n` +
                    `The demon strikes you down!`,
                  id:
                    `"Menyedihkan!"\n\n` +
                    `Iblis menjatuhkanmu!`
                },
                rewards: { damage: 200, reputation: -15 }
              }
            ]
          }
        }
      },
      
      talk_path: {
        title: {
          en: "🌋 Negotiation",
          id: "🌋 Negosiasi"
        },
        description: {
          en:
            `The demon seems willing to talk.\n\n` +
            `"What do you want, mortal?"\n\n` +
            `How will you respond?`,
          id:
            `Iblis tampak bersedia bicara.\n\n` +
            `"Apa maumu, manusia fana?"\n\n` +
            `Bagaimana kamu akan merespons?`
        },
        
        choices: {
          ask: {
            label: {
              en: "❓ Ask About Its Origin",
              id: "❓ Tanya Asal-usulnya"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `The demon tells you its story.\n\n` +
                    `It was once human, corrupted by dark magic...`,
                  id:
                    `Iblis menceritakan kisahnya.\n\n` +
                    `Ia dulunya manusia, dikorupsi oleh sihir gelap...`
                },
                rewards: { exp: 120 },
                nextStage: "pact_choice"
              }
            ]
          },
          
          offer: {
            label: {
              en: "🤝 Offer a Pact",
              id: "🤝 Tawari Perjanjian"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `"A pact? Interesting..."\n\n` +
                    `The demon considers your offer.`,
                  id:
                    `"Perjanjian? Menarik..."\n\n` +
                    `Iblis mempertimbangkan tawaranmu.`
                },
                rewards: { exp: 100 },
                nextStage: "pact_choice"
              }
            ]
          }
        }
      },
      
      final_battle: {
        title: {
          en: "🌋 Final Strike",
          id: "🌋 Serangan Terakhir"
        },
        description: {
          en:
            `Both of you are exhausted.\n\n` +
            `One final attack will decide everything.\n\n` +
            `What will you do?`,
          id:
            `Kalian berdua kelelahan.\n\n` +
            `Satu serangan terakhir akan menentukan segalanya.\n\n` +
            `Apa yang akan kamu lakukan?`
        },
        
        choices: {
          allout: {
            label: {
              en: "⚡ All-Out Attack",
              id: "⚡ Serangan Habis-habisan"
            },
            outcomes: [
              {
                weight: 60,
                type: "good",
                text: {
                  en:
                    `Your final strike lands!\n\n` +
                    `The demon falls and drops valuable loot!`,
                  id:
                    `Serangan terakhirmu mengenai!\n\n` +
                    `Iblis jatuh dan menjatuhkan jarahan berharga!`
                },
                rewards: {
                  exp: 500,
                  gold: 600,
                  items: [
                    { id: "gold_bar", qty: 5 },
                    { id: "elixir", qty: 2 }
                  ]
                }
              },
              {
                weight: 40,
                type: "bad",
                text: {
                  en:
                    `The demon counters your attack!\n\n` +
                    `You're badly wounded!`,
                  id:
                    `Iblis membalas seranganmu!\n\n` +
                    `Kamu terluka parah!`
                },
                rewards: { damage: 250, exp: 200 }
              }
            ]
          },
          
          yield: {
            label: {
              en: "🕊️ Yield When Weak",
              id: "🕊️ Menyerah Saat Lemah"
            },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `The demon humiliates you.\n\n` +
                    `"Never challenge me again!"`,
                  id:
                    `Iblis mempermalukanmu.\n\n` +
                    `"Jangan pernah tantang aku lagi!"`
                },
                rewards: { damage: 150, reputation: -20 }
              }
            ]
          }
        }
      },
      
      pact_choice: {
        title: {
          en: "🌋 The Pact",
          id: "🌋 Perjanjian"
        },
        description: {
          en:
            `The demon offers you power.\n\n` +
            `"Serve me, and I will grant you strength beyond imagination."\n\n` +
            `What will you choose?`,
          id:
            `Iblis menawarkan kekuatan.\n\n` +
            `"Layani aku, dan aku akan memberimu kekuatan di luar imajinasi."\n\n` +
            `Apa yang akan kamu pilih?`
        },
        
        choices: {
          accept: {
            label: {
              en: "✅ Accept the Pact",
              id: "✅ Terima Perjanjian"
            },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `You accept the demon's pact.\n\n` +
                    `Power flows through you... but at what cost?`,
                  id:
                    `Kamu menerima perjanjian iblis.\n\n` +
                    `Kekuatan mengalir melaluimu... tapi dengan harga apa?`
                },
                rewards: { gold: 1000, exp: 400, reputation: -10 }
              }
            ]
          },
          
          refuse: {
            label: {
              en: "❌ Refuse and Leave",
              id: "❌ Tolak dan Pergi"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `"Wise choice, mortal."\n\n` +
                    `The demon lets you go.`,
                  id:
                    `"Pilihan bijak, manusia fana."\n\n` +
                    `Iblis membiarkanmu pergi.`
                },
                rewards: { exp: 200, reputation: 5 }
              }
            ]
          }
        }
      }
    }
  },
    // ═══════════════════════════════════════════════════════
  // THE FRACTURED SKY - Based on Elarion Lore
  // ═══════════════════════════════════════════════════════
  fractured_sky: {
    id: "fractured_sky",
    title: {
      en: "🌌 The Fractured Sky",
      id: "🌌 Langit yang Retak"
    },
    description: {
      en:
        `You look up and see a strange crack in the sky, just like the legends describe.\n\n` +
        `Black light seeps through the fracture, and you hear whispers from beyond.\n\n` +
        `"Come closer... see the truth..."`,
      id:
        `Kamu melihat ke atas dan melihat retakan aneh di langit, seperti yang diceritakan dalam legenda.\n\n` +
        `Cahaya hitam merembes dari retakan, dan kamu mendengar bisikan dari balik dimensi.\n\n` +
        `"Mendekatlah... lihat kebenarannya..."`
    },
    emoji: "🌌",
    rarity: "epic",
    locations: ["void_gate", "astral_plane", "celestial_bridge", "world_tree_peak"],
    
    choices: {
      gazevoid: {
        label: {
          en: "👁️ Gaze Into the Fracture",
          id: "👁️ Tatap Retakan"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You stare into the fracture. Your mind fills with visions of the old world...\n\n` +
                `Elarion before The Night the Sky Opened. Beautiful. Peaceful.\n\n` +
                `Then you see THEM. The things that came through.`,
              id:
                `Kamu menatap retakan. Pikiranmu dipenuhi visi dunia lama...\n\n` +
                `Elarion sebelum Malam Langit Terbuka. Indah. Damai.\n\n` +
                `Lalu kamu melihat MEREKA. Makhluk yang datang dari sana.`
            },
            rewards: { exp: 100 },
            nextStage: "vision_revealed"
          }
        ]
      },
      
      resist: {
        label: {
          en: "🛡️ Resist the Whisper",
          id: "🛡️ Lawan Bisikan"
        },
        outcomes: [
          {
            weight: 70,
            type: "good",
            text: {
              en:
                `You close your eyes and resist the call.\n\n` +
                `Your willpower protects you from madness!`,
              id:
                `Kamu menutup mata dan melawan panggilan.\n\n` +
                `Kekuatan pikiranmu melindungimu dari kegilaan!`
            },
            rewards: { exp: 200, reputation: 10 }
          },
          {
            weight: 30,
            type: "bad",
            text: {
              en: `You try to resist but the whispers are too strong! Your mind fractures!`,
              id: `Kamu mencoba melawan tapi bisikan terlalu kuat! Pikiranmu retak!`
            },
            rewards: { damage: 100, exp: 50 }
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave Quickly",
          id: "🚶 Pergi Cepat"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You wisely turn away from the fracture and leave.`,
              id: `Kamu dengan bijak berpaling dari retakan dan pergi.`
            },
            rewards: { exp: 50 }
          }
        ]
      }
    },
    
    stages: {
      vision_revealed: {
        title: {
          en: "🌌 Vision of The Beyond",
          id: "🌌 Visi dari Balik Dimensi"
        },
        description: {
          en:
            `You see the truth. The ritual that opened the sky. The scholars who thought they could control it.\n\n` +
            `They were wrong. So very wrong.\n\n` +
            `The fracture pulses. Do you reach toward it, or seal it?`,
          id:
            `Kamu melihat kebenarannya. Ritual yang membuka langit. Para cendekiawan yang mengira bisa mengendalikannya.\n\n` +
            `Mereka salah. Sangat salah.\n\n` +
            `Retakan berdenyut. Apakah kamu meraihnya, atau menyegelnya?`
        },
        
        choices: {
          touch: {
            label: {
              en: "✋ Touch the Fracture",
              id: "✋ Sentuh Retakan"
            },
            outcomes: [
              {
                weight: 40,
                type: "good",
                text: {
                  en:
                    `You touch the fracture and absorb ancient knowledge!\n\n` +
                    `You understand magic you never knew existed!`,
                  id:
                    `Kamu menyentuh retakan dan menyerap pengetahuan kuno!\n\n` +
                    `Kamu memahami sihir yang tak pernah kamu ketahui!`
                },
                rewards: { exp: 500, gold: 1000, items: [{ id: "ancient_relic", qty: 1 }] }
              },
              {
                weight: 60,
                type: "bad",
                text: {
                  en:
                    `The fracture burns your hand! Something from The Beyond tries to pull you through!\n\n` +
                    `You barely escape!`,
                  id:
                    `Retakan membakar tanganmu! Sesuatu dari Balik Dimensi mencoba menarikmu!\n\n` +
                    `Kamu nyaris tidak bisa kabur!`
                },
                rewards: { damage: 150, gold: -300, reputation: -15 }
              }
            ]
          },
          
          seal: {
            label: {
              en: "🔒 Try to Seal It",
              id: "🔒 Coba Segel"
            },
            outcomes: [
              {
                weight: 30,
                type: "good",
                text: {
                  en:
                    `You channel all your power and manage to close the fracture slightly!\n\n` +
                    `The world feels... safer. For now.`,
                  id:
                    `Kamu menyalurkan semua kekuatanmu dan berhasil menutup retakan sedikit!\n\n` +
                    `Dunia terasa... lebih aman. Untuk saat ini.`
                },
                rewards: { exp: 600, gold: 800, reputation: 25 }
              },
              {
                weight: 70,
                type: "neutral",
                text: {
                  en:
                    `You try to seal it but you're not strong enough.\n\n` +
                    `The fracture remains. Watching. Waiting.`,
                  id:
                    `Kamu mencoba menyegelnya tapi kamu tidak cukup kuat.\n\n` +
                    `Retakan tetap ada. Mengawasi. Menunggu.`
                },
                rewards: { exp: 200 }
              }
            ]
          },
          
          run: {
            label: {
              en: "🏃 Run Away",
              id: "🏃 Lari"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en: `You flee from the fracture. Some knowledge is too dangerous.`,
                  id: `Kamu kabur dari retakan. Beberapa pengetahuan terlalu berbahaya.`
                },
                rewards: { exp: 100 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // SHADOW WOODS WHISPERS
  // ═══════════════════════════════════════════════════════
  shadow_woods_whispers: {
    id: "shadow_woods_whispers",
    title: {
      en: "🌲 Whispers in Shadow Woods",
      id: "🌲 Bisikan di Hutan Bayangan"
    },
    description: {
      en:
        `You hear familiar voices calling from deep within Shadow Woods.\n\n` +
        `"Come here... we've been waiting for you..."\n\n` +
        `It sounds like someone you know. But that's impossible... right?`,
      id:
        `Kamu mendengar suara familiar memanggil dari dalam Hutan Bayangan.\n\n` +
        `"Kemari... kami sudah menunggumu..."\n\n` +
        `Terdengar seperti seseorang yang kamu kenal. Tapi itu mustahil... kan?`
    },
    emoji: "🌲",
    rarity: "rare",
    locations: ["shadow_woods", "dark_forest", "haunted_hollow"],
    
    choices: {
      follow: {
        label: {
          en: "👣 Follow the Voice",
          id: "👣 Ikuti Suara"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You follow the voice deeper into the woods.\n\n` +
                `The shadows grow thicker. The voice grows clearer.\n\n` +
                `Then you see a figure ahead...`,
              id:
                `Kamu mengikuti suara lebih dalam ke hutan.\n\n` +
                `Bayangan semakin tebal. Suara semakin jelas.\n\n` +
                `Lalu kamu melihat sosok di depan...`
            },
            rewards: { exp: 80 },
            nextStage: "shadow_figure"
          }
        ]
      },
      
      ignore: {
        label: {
          en: "👁️ Ignore the Voice",
          id: "👁️ Abaikan Suara"
        },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You ignore the voice and walk away.\n\n` +
                `The whispers turn angry, then fade. You made the right choice.`,
              id:
                `Kamu mengabaikan suara dan pergi.\n\n` +
                `Bisikan berubah marah, lalu memudar. Kamu membuat pilihan yang tepat.`
            },
            rewards: { exp: 150, reputation: 5 }
          }
        ]
      },
      
      callout: {
        label: {
          en: "📢 Call Out",
          id: "📢 Panggil Balik"
        },
        outcomes: [
          {
            weight: 50,
            type: "neutral",
            text: {
              en:
                `"Who are you?!" you shout.\n\n` +
                `The voice laughs. "Come and see..."`,
              id:
                `"Siapa kamu?!" kamu berteriak.\n\n` +
                `Suara itu tertawa. "Datang dan lihat..."`
            },
            rewards: { exp: 60 },
            nextStage: "shadow_figure"
          },
          {
            weight: 50,
            type: "bad",
            text: {
              en:
                `Your shout echoes through the woods.\n\n` +
                `Suddenly, shadows surge toward you! You're attacked!`,
              id:
                `Teriakanmu bergema di hutan.\n\n` +
                `Tiba-tiba, bayangan menyerbu ke arahmu! Kamu diserang!`
            },
            rewards: { damage: 120, exp: 80 }
          }
        ]
      }
    },
    
    stages: {
      shadow_figure: {
        title: {
          en: "🌲 The Shadow Figure",
          id: "🌲 Sosok Bayangan"
        },
        description: {
          en:
            `You see a figure that looks exactly like someone you once knew.\n\n` +
            `But their eyes are empty. Their smile is wrong.\n\n` +
            `"Don't you recognize me?" they ask.`,
          id:
            `Kamu melihat sosok yang persis seperti seseorang yang pernah kamu kenal.\n\n` +
            `Tapi mata mereka kosong. Senyum mereka salah.\n\n` +
            `"Kamu tidak mengenaliku?" mereka bertanya.`
        },
        
        choices: {
          talk: {
            label: {
              en: "💬 Talk to Them",
              id: "💬 Bicara Dengannya"
            },
            outcomes: [
              {
                weight: 40,
                type: "good",
                text: {
                  en:
                    `You talk to the figure and realize it's a shadow copy.\n\n` +
                    `You learn about the curse of Shadow Woods and how to avoid it!`,
                  id:
                    `Kamu bicara dengan sosok itu dan menyadari itu salinan bayangan.\n\n` +
                    `Kamu belajar tentang kutukan Hutan Bayangan dan cara menghindarinya!`
                },
                rewards: { exp: 300, gold: 500 }
              },
              {
                weight: 60,
                type: "bad",
                text: {
                  en:
                    `The figure grabs you! "Stay with us forever..."\n\n` +
                    `You barely break free!`,
                  id:
                    `Sosok itu menangkapmu! "Tinggal bersama kami selamanya..."\n\n` +
                    `Kamu nyaris tidak bisa lepas!`
                },
                rewards: { damage: 100, gold: -200 }
              }
            ]
          },
          
          attack: {
            label: {
              en: "⚔️ Attack the Shadow",
              id: "⚔️ Serang Bayangan"
            },
            outcomes: [
              {
                weight: 60,
                type: "good",
                text: {
                  en:
                    `Your weapon passes through the shadow, dispelling it!\n\n` +
                    `It was just an illusion. You find treasure it was guarding!`,
                  id:
                    `Senjatamu menembus bayangan, menghilangkannya!\n\n` +
                    `Itu hanya ilusi. Kamu menemukan harta yang dijaganya!`
                },
                rewards: { exp: 250, gold: 800, items: [{ id: "shadow_essence", qty: 3 }] }
              },
              {
                weight: 40,
                type: "bad",
                text: {
                  en:
                    `The shadow splits into many! They all attack you at once!`,
                  id:
                    `Bayangan terpecah menjadi banyak! Mereka semua menyerangmu sekaligus!`
                },
                rewards: { damage: 150, exp: 100 }
              }
            ]
          },
          
          run: {
            label: {
              en: "🏃 Run Away",
              id: "🏃 Lari"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You run from the shadow figure.\n\n` +
                    `You hear laughter behind you as you escape the woods.`,
                  id:
                    `Kamu lari dari sosok bayangan.\n\n` +
                    `Kamu mendengar tawa di belakangmu saat kabur dari hutan.`
                },
                rewards: { exp: 120 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // CRYSTAL LABYRINTH MADNESS
  // ═══════════════════════════════════════════════════════
  crystal_madness: {
    id: "crystal_madness",
    title: {
      en: "💎 The Glowing Crystals",
      id: "💎 Kristal Bercahaya"
    },
    description: {
      en:
        `You find beautiful glowing crystals growing from the ground.\n\n` +
        `They pulse with hypnotic light. You feel drawn to touch them.\n\n` +
        `But something feels... wrong.`,
      id:
        `Kamu menemukan kristal bercahaya indah tumbuh dari tanah.\n\n` +
        `Mereka berdenyut dengan cahaya hipnotis. Kamu merasa tertarik menyentuhnya.\n\n` +
        `Tapi ada yang terasa... salah.`
    },
    emoji: "💎",
    rarity: "rare",
    locations: ["crystal_cavern", "crystal_forest", "crystal_labyrinth"],
    
    choices: {
      touch: {
        label: {
          en: "✋ Touch the Crystal",
          id: "✋ Sentuh Kristal"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You touch the crystal. It feels warm.\n\n` +
                `Memories that aren't yours flood your mind...\n\n` +
                `Miners. Screaming. Transforming.`,
              id:
                `Kamu menyentuh kristal. Terasa hangat.\n\n` +
                `Kenangan yang bukan milikmu membanjiri pikiranmu...\n\n` +
                `Penambang. Berteriak. Berubah.`
            },
            rewards: { exp: 100 },
            nextStage: "crystal_visions"
          }
        ]
      },
      
      harvest: {
        label: {
          en: "💎 Harvest Crystal",
          id: "💎 Panen Kristal"
        },
        outcomes: [
          {
            weight: 50,
            type: "good",
            text: {
              en:
                `You carefully harvest a small piece.\n\n` +
                `It's valuable! But you feel... strange.`,
              id:
                `Kamu dengan hati-hati memanen sepotong kecil.\n\n` +
                `Ini berharga! Tapi kamu merasa... aneh.`
            },
            rewards: { gold: 1000, items: [{ id: "sky_crystal", qty: 5 }], exp: 150 },
            nextStage: "crystal_visions"
          },
          {
            weight: 50,
            type: "bad",
            text: {
              en:
                `The crystal shatters! Shards cut your hand!\n\n` +
                `You feel your memories slipping away...`,
              id:
                `Kristal pecah! Pecahannya melukai tanganmu!\n\n` +
                `Kamu merasa kenanganmu menghilang...`
            },
            rewards: { damage: 80, gold: -100, exp: 50 }
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave It Alone",
          id: "🚶 Biarkan Saja"
        },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You resist the urge to touch the crystals.\n\n` +
                `Your mind remains your own. Wise choice.`,
              id:
                `Kamu menahan keinginan menyentuh kristal.\n\n` +
                `Pikiranmu tetap milikmu. Pilihan bijak.`
            },
            rewards: { exp: 200, reputation: 8 }
          }
        ]
      }
    },
    
    stages: {
      crystal_visions: {
        title: {
          en: "💎 Crystal Visions",
          id: "💎 Visi Kristal"
        },
        description: {
          en:
            `You see visions of the miners who were exposed to these crystals.\n\n` +
            `They forgot who they were. Forgot their families. Forgot everything.\n\n` +
            `You feel it happening to you. What do you do?`,
          id:
            `Kamu melihat visi para penambang yang terpapar kristal ini.\n\n` +
            `Mereka lupa siapa mereka. Lupa keluarga mereka. Lupa segalanya.\n\n` +
            `Kamu merasakannya terjadi padamu. Apa yang kamu lakukan?`
        },
        
        choices: {
          resist: {
            label: {
              en: "🛡️ Fight the Memory Loss",
              id: "🛡️ Lawan Kehilangan Ingatan"
            },
            outcomes: [
              {
                weight: 60,
                type: "good",
                text: {
                  en:
                    `You focus on your memories! Your name! Your purpose!\n\n` +
                    `The crystal's influence fades. You're still you!`,
                  id:
                    `Kamu fokus pada kenanganmu! Namamu! Tujuanmu!\n\n` +
                    `Pengaruh kristal memudar. Kamu masih dirimu!`
                },
                rewards: { exp: 400, gold: 600, reputation: 15 }
              },
              {
                weight: 40,
                type: "bad",
                text: {
                  en:
                    `You try to resist but lose some memories anyway.\n\n` +
                    `Who... who are you again?`,
                  id:
                    `Kamu mencoba melawan tapi tetap kehilangan beberapa kenangan.\n\n` +
                    `Siapa... siapa kamu lagi?`
                },
                rewards: { exp: 100, gold: -300 }
              }
            ]
          },
          
          embrace: {
            label: {
              en: "🌑 Accept the Transformation",
              id: "🌑 Terima Transformasi"
            },
            outcomes: [
              {
                weight: 30,
                type: "good",
                text: {
                  en:
                    `You accept the crystal's power!\n\n` +
                    `You gain crystal magic but lose part of yourself...`,
                  id:
                    `Kamu menerima kekuatan kristal!\n\n` +
                    `Kamu mendapat sihir kristal tapi kehilangan sebagian dirimu...`
                },
                rewards: { exp: 500, items: [{ id: "crystal_heart", qty: 1 }], reputation: -20 }
              },
              {
                weight: 70,
                type: "bad",
                text: {
                  en:
                    `You lose yourself completely to the crystals.\n\n` +
                    `You wander the labyrinth, forgetting why you came...`,
                  id:
                    `Kamu kehilangan dirimu sepenuhnya pada kristal.\n\n` +
                    `Kamu berkeliaran di labirin, lupa kenapa kamu datang...`
                },
                rewards: { damage: 200, gold: -500, reputation: -30 }
              }
            ]
          },
          
          run: {
            label: {
              en: "🏃 Run Away Fast",
              id: "🏃 Lari Cepat"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You run from the crystals as fast as you can!\n\n` +
                    `The visions fade. You remember who you are.`,
                  id:
                    `Kamu lari dari kristal secepat mungkin!\n\n` +
                    `Visi memudar. Kamu ingat siapa dirimu.`
                },
                rewards: { exp: 150 }
              }
            ]
          }
        }
      }
    }
  },
  
  // ═══════════════════════════════════════════════════════
  // WORLD TREE ROOTS
  // ═══════════════════════════════════════════════════════
  world_tree_roots: {
    id: "world_tree_roots",
    title: {
      en: "🌳 The Ancient Roots",
      id: "🌳 Akar Kuno"
    },
    description: {
      en:
        `You discover massive roots beneath the ground - roots of the World Tree.\n\n` +
        `They still pulse with faint magical energy.\n\n` +
        `But something is corrupting them from within...`,
      id:
        `Kamu menemukan akar raksasa di bawah tanah - akar Pohon Dunia.\n\n` +
        `Mereka masih berdenyut dengan energi magis yang lemah.\n\n` +
        `Tapi sesuatu mengkorupsi mereka dari dalam...`
    },
    emoji: "🌳",
    rarity: "epic",
    locations: ["world_tree_peak", "ancient_ruins", "mystic_temple"],
    
    choices: {
      touch: {
        label: {
          en: "✋ Touch the Roots",
          id: "✋ Sentuh Akar"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You touch the ancient roots.\n\n` +
                `Visions flood your mind - Elarion as it once was. Beautiful. Whole.\n\n` +
                `Then you see the corruption spreading...`,
              id:
                `Kamu menyentuh akar kuno.\n\n` +
                `Visi membanjiri pikiranmu - Elarion seperti dulu. Indah. Utuh.\n\n` +
                `Lalu kamu melihat korupsi menyebar...`
            },
            rewards: { exp: 150 },
            nextStage: "root_corruption"
          }
        ]
      },
      
      purify: {
        label: {
          en: "✨ Try to Purify",
          id: "✨ Coba Bersihkan"
        },
        outcomes: [
          {
            weight: 40,
            type: "good",
            text: {
              en:
                `You channel your energy into the roots!\n\n` +
                `The corruption recedes slightly. The World Tree thanks you.`,
              id:
                `Kamu menyalurkan energimu ke akar!\n\n` +
                `Korupsi surut sedikit. Pohon Dunia berterima kasih padamu.`
            },
            rewards: { exp: 500, gold: 1000, reputation: 25 },
            nextStage: "root_corruption"
          },
          {
            weight: 60,
            type: "bad",
            text: {
              en:
                `You try to purify but you're not strong enough!\n\n` +
                `The corruption lashes out at you!`,
              id:
                `Kamu mencoba membersihkan tapi kamu tidak cukup kuat!\n\n` +
                `Korupsi menyerangmu!`
            },
            rewards: { damage: 120, exp: 100 }
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave the Roots",
          id: "🚶 Tinggalkan Akar"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You leave the ancient roots undisturbed.`,
              id: `Kamu meninggalkan akar kuno tanpa diganggu.`
            },
            rewards: { exp: 80 }
          }
        ]
      }
    },
    
    stages: {
      root_corruption: {
        title: {
          en: "🌳 The Source of Corruption",
          id: "🌳 Sumber Korupsi"
        },
        description: {
          en:
            `You see it now. The corruption comes from The Beyond.\n\n` +
            `It's been slowly poisoning the World Tree since The Night the Sky Opened.\n\n` +
            `If the tree dies completely, the world dies with it.`,
          id:
            `Kamu melihatnya sekarang. Korupsi datang dari Balik Dimensi.\n\n` +
            `Ia perlahan meracuni Pohon Dunia sejak Malam Langit Terbuka.\n\n` +
            `Jika pohon mati sepenuhnya, dunia mati bersamanya.`
        },
        
        choices: {
          seal: {
            label: {
              en: "🔒 Seal the Corruption",
              id: "🔒 Segel Korupsi"
            },
            outcomes: [
              {
                weight: 50,
                type: "good",
                text: {
                  en:
                    `You manage to seal part of the corruption!\n\n` +
                    `The World Tree's pulse grows stronger. Hope remains!`,
                  id:
                    `Kamu berhasil menyegel sebagian korupsi!\n\n` +
                    `Denyut Pohon Dunia menguat. Harapan masih ada!`
                },
                rewards: { exp: 600, gold: 1500, reputation: 40, items: [{ id: "world_tree_seed", qty: 1 }] }
              },
              {
                weight: 50,
                type: "neutral",
                text: {
                  en:
                    `You try to seal it but only slow it down.\n\n` +
                    `It's not enough. But it's something.`,
                  id:
                    `Kamu mencoba menyegelnya tapi hanya memperlambatnya.\n\n` +
                    `Tidak cukup. Tapi lebih baik dari tidak sama sekali.`
                },
                rewards: { exp: 300, gold: 500 }
              }
            ]
          },
          
          absorb: {
            label: {
              en: "⚡ Absorb the Corruption",
              id: "⚡ Serap Korupsi"
            },
            outcomes: [
              {
                weight: 30,
                type: "good",
                text: {
                  en:
                    `You absorb the corruption into yourself!\n\n` +
                    `You gain dark power but save the tree!`,
                  id:
                    `Kamu menyerap korupsi ke dalam dirimu!\n\n` +
                    `Kamu mendapat kekuatan gelap tapi menyelamatkan pohon!`
                },
                rewards: { exp: 700, items: [{ id: "void_essence", qty: 5 }], reputation: 20 }
              },
              {
                weight: 70,
                type: "bad",
                text: {
                  en:
                    `The corruption is too much! It overwhelms you!\n\n` +
                    `You barely survive, forever changed...`,
                  id:
                    `Korupsi terlalu banyak! Ia menguasaimu!\n\n` +
                    `Kamu nyaris tidak selamat, selamanya berubah...`
                },
                rewards: { damage: 200, gold: -500, reputation: -30 }
              }
            ]
          },
          
          run: {
            label: {
              en: "🏃 Flee",
              id: "🏃 Kabur"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You flee from the corrupted roots.\n\n` +
                    `The knowledge weighs heavy on your heart.`,
                  id:
                    `Kamu kabur dari akar yang terkorupsi.\n\n` +
                    `Pengetahuan ini membebani hatimu.`
                },
                rewards: { exp: 150 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // FROZEN ABYSS PORTAL
  // ═══════════════════════════════════════════════════════
  frozen_abyss: {
    id: "frozen_abyss",
    title: {
      en: "❄️ The Frozen Ones",
      id: "❄️ Yang Membeku"
    },
    description: {
      en:
        `You find people frozen solid in ice, their faces locked in terror.\n\n` +
        `They're still alive. You can see their eyes moving.\n\n` +
        `What did they see that froze them in fear?`,
      id:
        `Kamu menemukan orang-orang membeku dalam es, wajah mereka terkunci dalam teror.\n\n` +
        `Mereka masih hidup. Kamu bisa melihat mata mereka bergerak.\n\n` +
        `Apa yang mereka lihat yang membekukan mereka dalam ketakutan?`
    },
    emoji: "❄️",
    rarity: "rare",
    locations: ["frozen_peaks", "frozen_abyss_portal", "ice_cavern"],
    
    choices: {
      help: {
        label: {
          en: "🔥 Try to Thaw Them",
          id: "🔥 Coba Cairkan Mereka"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You use fire to melt the ice.\n\n` +
                `One person breaks free! But they're screaming...\n\n` +
                `"DON'T LOOK AT IT! DON'T LOOK!"`,
              id:
                `Kamu menggunakan api untuk melelehkan es.\n\n` +
                `Satu orang terlepas! Tapi mereka berteriak...\n\n` +
                `"JANGAN LIHAT! JANGAN LIHAT!"`
            },
            rewards: { exp: 120 },
            nextStage: "frozen_horror"
          }
        ]
      },
      
      investigate: {
        label: {
          en: "🔍 Investigate the Area",
          id: "🔍 Selidiki Area"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You look around carefully.\n\n` +
                `All the frozen people are facing the same direction.\n\n` +
                `Toward the Frozen Abyss Portal...`,
              id:
                `Kamu melihat sekeliling dengan hati-hati.\n\n` +
                `Semua orang yang membeku menghadap arah yang sama.\n\n` +
                `Ke arah Portal Jurang Beku...`
            },
            rewards: { exp: 100 },
            nextStage: "frozen_horror"
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave Quickly",
          id: "🚶 Pergi Cepat"
        },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You leave without looking at what they saw.\n\n` +
                `Sometimes ignorance is survival.`,
              id:
                `Kamu pergi tanpa melihat apa yang mereka lihat.\n\n` +
                `Kadang ketidaktahuan adalah keselamatan.`
            },
            rewards: { exp: 150, reputation: 5 }
          }
        ]
      }
    },
    
    stages: {
      frozen_horror: {
        title: {
          en: "❄️ What They Saw",
          id: "❄️ Apa Yang Mereka Lihat"
        },
        description: {
          en:
            `You feel the urge to look toward the portal.\n\n` +
            `Something is there. Something that shouldn't exist.\n\n` +
            `Your body starts to freeze just from being near it...`,
          id:
            `Kamu merasa ingin melihat ke arah portal.\n\n` +
            `Ada sesuatu di sana. Sesuatu yang seharusnya tidak ada.\n\n` +
            `Tubuhmu mulai membeku hanya dari berada di dekatnya...`
        },
        
        choices: {
          resist: {
            label: {
              en: "🛡️ Don't Look",
              id: "🛡️ Jangan Lihat"
            },
            outcomes: [
              {
                weight: 70,
                type: "good",
                text: {
                  en:
                    `You close your eyes and run!\n\n` +
                    `You escape before freezing completely!`,
                  id:
                    `Kamu menutup mata dan lari!\n\n` +
                    `Kamu kabur sebelum membeku sepenuhnya!`
                },
                rewards: { exp: 400, gold: 600, reputation: 15 }
              },
              {
                weight: 30,
                type: "bad",
                text: {
                  en:
                    `You try not to look but catch a glimpse...\n\n` +
                    `Your blood runs cold. Literally.`,
                  id:
                    `Kamu mencoba tidak melihat tapi sempat melirik...\n\n` +
                    `Darahmu membeku. Secara harfiah.`
                },
                rewards: { damage: 150, exp: 100 }
              }
            ]
          },
          
          gazevoid: {
            label: {
              en: "👁️ Look at It",
              id: "👁️ Lihat Itu"
            },
            outcomes: [
              {
                weight: 10,
                type: "good",
                text: {
                  en:
                    `You look directly at the horror!\n\n` +
                    `Your mind nearly breaks but you understand its nature!\n\n` +
                    `Knowledge is power, even terrible knowledge!`,
                  id:
                    `Kamu melihat langsung ke horor itu!\n\n` +
                    `Pikiranmu nyaris hancur tapi kamu memahami sifatnya!\n\n` +
                    `Pengetahuan adalah kekuatan, bahkan pengetahuan mengerikan!`
                },
                rewards: { exp: 800, items: [{ id: "void_essence", qty: 10 }], reputation: -20 }
              },
              {
                weight: 90,
                type: "bad",
                text: {
                  en:
                    `You look at it.\n\n` +
                    `Your body freezes instantly. Your mind shatters.\n\n` +
                    `You become another frozen statue, forever staring...`,
                  id:
                    `Kamu melihatnya.\n\n` +
                    `Tubuhmu membeku seketika. Pikiranmu hancur.\n\n` +
                    `Kamu menjadi patung beku lainnya, selamanya menatap...`
                },
                rewards: { damage: 300, gold: -1000, reputation: -40 }
              }
            ]
          },
          
          run: {
            label: {
              en: "🏃 Run Without Looking",
              id: "🏃 Lari Tanpa Melihat"
            },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You run without looking back!\n\n` +
                    `You survive. That's what matters.`,
                  id:
                    `Kamu lari tanpa menoleh!\n\n` +
                    `Kamu selamat. Itu yang penting.`
                },
                rewards: { exp: 200 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // FORGOTTEN RITUAL SITE
  // ═══════════════════════════════════════════════════════
  forgotten_ritual: {
    id: "forgotten_ritual",
    title: {
      en: "🔮 The Ritual Circle",
      id: "🔮 Lingkaran Ritual"
    },
    description: {
      en:
        `You discover an ancient ritual circle - the kind used to open The Beyond.\n\n` +
        `Symbols are carved into the ground. Blood stains still visible.\n\n` +
        `This is where it all went wrong...`,
      id:
        `Kamu menemukan lingkaran ritual kuno - jenis yang digunakan untuk membuka Balik Dimensi.\n\n` +
        `Simbol terukir di tanah. Noda darah masih terlihat.\n\n` +
        `Di sinilah semuanya salah...`
    },
    emoji: "🔮",
    rarity: "epic",
    locations: ["forgotten_shrine", "ancient_ruins", "underground_city"],
    
    choices: {
      read: {
        label: {
          en: "📖 Read the Symbols",
          id: "📖 Baca Simbol"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You read the ancient symbols.\n\n` +
                `They describe the ritual. How to open a gateway to infinite power.\n\n` +
                `But there's a warning at the end...`,
              id:
                `Kamu membaca simbol kuno.\n\n` +
                `Mereka menjelaskan ritual. Cara membuka gerbang ke kekuatan tak terbatas.\n\n` +
                `Tapi ada peringatan di akhir...`
            },
            rewards: { exp: 150 },
            nextStage: "ritual_knowledge"
          }
        ]
      },
      
      destroy: {
        label: {
          en: "💥 Destroy the Circle",
          id: "💥 Hancurkan Lingkaran"
        },
        outcomes: [
          {
            weight: 60,
            type: "good",
            text: {
              en:
                `You destroy the ritual circle!\n\n` +
                `This knowledge should never be used again!`,
              id:
                `Kamu menghancurkan lingkaran ritual!\n\n` +
                `Pengetahuan ini tidak boleh digunakan lagi!`
            },
            rewards: { exp: 300, gold: 500, reputation: 20 }
          },
          {
            weight: 40,
            type: "bad",
            text: {
              en:
                `You try to destroy it but trigger a trap!\n\n` +
                `Dark energy explodes outward!`,
              id:
                `Kamu mencoba menghancurkannya tapi memicu jebakan!\n\n` +
                `Energi gelap meledak keluar!`
            },
            rewards: { damage: 120, exp: 100 }
          }
        ]
      },
      
      leave: {
        label: {
          en: "🚶 Leave It Alone",
          id: "🚶 Biarkan Saja"
        },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: `You leave the ritual circle undisturbed.`,
              id: `Kamu meninggalkan lingkaran ritual tanpa diganggu.`
            },
            rewards: { exp: 80 }
          }
        ]
      }
    },
    
    stages: {
      ritual_knowledge: {
        title: {
          en: "🔮 The Warning",
          id: "🔮 Peringatan"
        },
        description: {
          en:
            `The warning reads:\n\n` +
            `"DO NOT COMPLETE THIS RITUAL. We were fools. We thought we could control it.\n\n` +
            `We were wrong. If you're reading this, destroy this circle. Please."\n\n` +
            `But you also now know how to perform the ritual...`,
          id:
            `Peringatan berbunyi:\n\n` +
            `"JANGAN SELESAIKAN RITUAL INI. Kami bodoh. Kami pikir bisa mengendalikannya.\n\n` +
            `Kami salah. Jika kamu membaca ini, hancurkan lingkaran ini. Tolong."\n\n` +
            `Tapi kamu sekarang juga tahu cara melakukan ritual...`
        },
        
        choices: {
          destroy: {
            label: {
              en: "💥 Destroy the Knowledge",
              id: "💥 Hancurkan Pengetahuan"
            },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You destroy the circle and erase the symbols!\n\n` +
                    `This knowledge dies with you. The world is safer.`,
                  id:
                    `Kamu menghancurkan lingkaran dan menghapus simbol!\n\n` +
                    `Pengetahuan ini mati bersamamu. Dunia lebih aman.`
                },
                rewards: { exp: 500, gold: 1000, reputation: 40 }
              }
            ]
          },
          
          keep: {
            label: {
              en: "📜 Keep the Knowledge",
              id: "📜 Simpan Pengetahuan"
            },
            outcomes: [
              {
                weight: 50,
                type: "neutral",
                text: {
                  en:
                    `You memorize the ritual.\n\n` +
                    `Perhaps one day you'll need this power...\n\n` +
                    `Or perhaps you'll become what you fear.`,
                  id:
                    `Kamu menghafalkan ritual.\n\n` +
                    `Mungkin suatu hari kamu akan butuh kekuatan ini...\n\n` +
                    `Atau mungkin kamu akan menjadi apa yang kamu takuti.`
                },
                rewards: { exp: 400, items: [{ id: "forbidden_scroll", qty: 1 }], reputation: -15 }
              },
              {
                weight: 50,
                type: "bad",
                text: {
                  en:
                    `The knowledge corrupts your mind!\n\n` +
                    `You hear whispers from The Beyond now...`,
                  id:
                    `Pengetahuan mengkorupsi pikiranmu!\n\n` +
                    `Kamu mendengar bisikan dari Balik Dimensi sekarang...`
                },
                rewards: { exp: 200, damage: 100, reputation: -30 }
              }
            ]
          },
          
          perform: {
            label: {
              en: "🌑 Perform the Ritual",
              id: "🌑 Lakukan Ritual"
            },
            outcomes: [
              {
                weight: 5,
                type: "good",
                text: {
                  en:
                    `You perform the ritual perfectly!\n\n` +
                    `You gain immense power from The Beyond!\n\n` +
                    `But at what cost to your soul?`,
                  id:
                    `Kamu melakukan ritual dengan sempurna!\n\n` +
                    `Kamu mendapat kekuatan besar dari Balik Dimensi!\n\n` +
                    `Tapi dengan harga apa untuk jiwamu?`
                },
                rewards: { exp: 1000, items: [{ id: "void_essence", qty: 20 }], reputation: -50 }
              },
              {
                weight: 95,
                type: "bad",
                text: {
                  en:
                    `You perform the ritual.\n\n` +
                    `The sky cracks open above you.\n\n` +
                    `Something comes through. You've doomed us all...`,
                  id:
                    `Kamu melakukan ritual.\n\n` +
                    `Langit retak terbuka di atasmu.\n\n` +
                    `Sesuatu datang. Kamu telah menghancurkan kita semua...`
                },
                rewards: { damage: 500, gold: -2000, reputation: -100 }
              }
            ]
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════
  // SLEEPY THE STRAY CAT (Multi-Stage Story)
  // ═══════════════════════════════════════════════════════
  sleepy_the_cat: {
    id: "sleepy_the_cat",
    title: { en: "🐱 A Stray Cat", id: "🐱 Kucing Liar" },
    description: {
      en:
        `While walking, you notice a tiny stray cat huddled under a bush.\n\n` +
        `He's shivering in the cold, his scruffy fur damp from the morning dew. Big green eyes blink up at you — cautious, tired, and a little hopeful.\n\n` +
        `He doesn't run. He just watches you.`,
      id:
        `Saat berjalan, kamu melihat seekor kucing kecil meringkuk di bawah semak.\n\n` +
        `Dia menggigil kedinginan, bulunya kusut dan lembab dari embun pagi. Mata hijau besar menatapmu — waspada, lelah, dan sedikit penuh harapan.\n\n` +
        `Dia tidak lari. Dia hanya memperhatikanmu.`
    },
    emoji: "🐱",
    rarity: "rare",
    locations: ["all"],

    choices: {
      help: {
        label: { en: "🍖 Feed it", id: "🍖 Beri makan" },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You dig through your bag and find something to eat. You set it down slowly.\n\n` +
                `The cat sniffs cautiously... then gulps it down in seconds. He looks up at you, meows softly, and takes one small step closer.\n\n` +
                `You smile. He's so hungry.`,
              id:
                `Kamu menggeledah tasmu dan menemukan sesuatu untuk dimakan. Kamu meletakkannya perlahan.\n\n` +
                `Kucing itu mengendus dengan hati-hati... lalu melahapnya dalam hitungan detik. Dia menatapmu, mengeong pelan, dan mengambil satu langkah kecil mendekat.\n\n` +
                `Kamu tersenyum. Dia sangat lapar.`
            },
            rewards: { exp: 80, reputation: 5 },
            nextStage: "sleepy_stage2_caretaker",
          },
        ],
      },
      observe: {
        label: { en: "👀 Observe quietly", id: "👀 Amati diam-diam" },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You crouch down and watch him from a distance. He watches you back.\n\n` +
                `After a long moment, he lets out a tiny meow — almost like a question. Then he takes a few steps toward you, stops, and sits down.\n\n` +
                `He's decided you're not a threat.`,
              id:
                `Kamu jongkok dan mengamatinya dari kejauhan. Dia memperhatikanmu balik.\n\n` +
                `Setelah lama, dia mengeluarkan suara kecil — hampir seperti sebuah pertanyaan. Lalu dia melangkah beberapa langkah ke arahmu, berhenti, dan duduk.\n\n` +
                `Dia sudah memutuskan kamu bukan ancaman.`
            },
            rewards: { exp: 50 },
            nextStage: "sleepy_stage2_caretaker",
          },
        ],
      },
      leave: {
        label: { en: "🚶 Walk away", id: "🚶 Pergi" },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You walk past him. He watches you go, then curls back into a ball under the bush.\n\n` +
                `You glance back once. He's already asleep.`,
              id:
                `Kamu berjalan melewatinya. Dia memperhatikanmu pergi, lalu meringkuk kembali di bawah semak.\n\n` +
                `Kamu menoleh sekali. Dia sudah tertidur.`
            },
            rewards: { exp: 10 },
          },
        ],
      },
    },

    stages: {

      // ── STAGE 2: The cat keeps coming back ──────────────
      sleepy_stage2_caretaker: {
        title: { en: "🐱 He Keeps Coming Back", id: "🐱 Dia Terus Kembali" },
        description: {
          en:
            `Days pass. Every morning, the little cat is waiting for you.\n\n` +
            `You've started calling him *Sleepy* — because he's always napping in whatever cozy spot he can find. He follows you around now, keeping a respectful distance, but always there.\n\n` +
            `He's still afraid of people. But not of you.\n\n` +
            `What do you do?`,
          id:
            `Hari-hari berlalu. Setiap pagi, kucing kecil itu menunggumu.\n\n` +
            `Kamu mulai memanggilnya *Sleepy* — karena dia selalu tidur siang di tempat nyaman manapun yang bisa dia temukan. Dia mengikutimu sekarang, menjaga jarak yang sopan, tapi selalu ada.\n\n` +
            `Dia masih takut pada orang. Tapi tidak padamu.\n\n` +
            `Apa yang kamu lakukan?`
        },
        choices: {
          protect: {
            label: { en: "🏠 Take him in", id: "🏠 Bawa masuk" },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You set up a little space for him — a box with blankets, a bowl of water, some food. He sniffs everything carefully, then steps inside the box, turns around three times, and curls up.\n\n` +
                    `He purrs for the first time.\n\n` +
                    `You bought him toys. A scratching post. He plays with them at 3am and knocks things off shelves. You don't mind.`,
                  id:
                    `Kamu menyiapkan tempat kecil untuknya — kotak dengan selimut, mangkuk air, sedikit makanan. Dia mengendus semuanya dengan hati-hati, lalu masuk ke dalam kotak, berputar tiga kali, dan meringkuk.\n\n` +
                    `Dia mendengkur untuk pertama kalinya.\n\n` +
                    `Kamu membelikannya mainan. Tiang garukan. Dia bermain dengannya jam 3 pagi dan menjatuhkan benda-benda dari rak. Kamu tidak keberatan.`
                },
                rewards: { exp: 200, reputation: 10 },
                nextStage: "sleepy_stage3_missing",
              },
            ],
          },
          help: {
            label: { en: "🎁 Keep feeding outside", id: "🎁 Terus beri makan di luar" },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You leave food and water out every morning. You even find an old cardboard box and fill it with blankets for him to sleep in.\n\n` +
                    `Sleepy becomes a fixture of your routine. He's not quite yours — but he's not a stray anymore either. He's something in between.\n\n` +
                    `He seems happy with that.`,
                  id:
                    `Kamu meninggalkan makanan dan air setiap pagi. Kamu bahkan menemukan kotak kardus lama dan mengisinya dengan selimut untuknya tidur.\n\n` +
                    `Sleepy menjadi bagian dari rutinitasmu. Dia belum sepenuhnya milikmu — tapi dia juga bukan kucing liar lagi. Dia ada di antara keduanya.\n\n` +
                    `Dia tampak bahagia dengan itu.`
                },
                rewards: { exp: 150, reputation: 8 },
                nextStage: "sleepy_stage3_missing",
              },
            ],
          },
          leave: {
            label: { en: "🚶 Stop coming by", id: "🚶 Berhenti datang" },
            outcomes: [
              {
                weight: 100,
                type: "bad",
                text: {
                  en:
                    `You stop leaving food. After a few days, Sleepy stops waiting.\n\n` +
                    `You see him once more, across the street, watching you from a distance. Then he turns and disappears into an alley.\n\n` +
                    `You never see him again.`,
                  id:
                    `Kamu berhenti meninggalkan makanan. Setelah beberapa hari, Sleepy berhenti menunggu.\n\n` +
                    `Kamu melihatnya sekali lagi, di seberang jalan, memperhatikanmu dari kejauhan. Lalu dia berbalik dan menghilang ke gang.\n\n` +
                    `Kamu tidak pernah melihatnya lagi.`
                },
                rewards: { exp: 20, reputation: -5 },
              },
            ],
          },
        },
      },

      // ── STAGE 3: Sleepy goes missing ─────────────────────
      sleepy_stage3_missing: {
        title: { en: "🌧️ The Night He Disappeared", id: "🌧️ Malam Dia Menghilang" },
        description: {
          en:
            `One night, it pours with rain.\n\n` +
            `You look for Sleepy — his usual spots, the box, the corner by the wall. Nothing. You call his name into the dark and the rain.\n\n` +
            `Silence.\n\n` +
            `You can't sleep. You keep thinking about his big green eyes, his soft meow, the scratch on his ear from that fight last week.\n\n` +
            `What do you do?`,
          id:
            `Suatu malam, hujan deras turun.\n\n` +
            `Kamu mencari Sleepy — tempat-tempat biasanya, kotak itu, sudut dekat dinding. Tidak ada. Kamu memanggil namanya ke dalam kegelapan dan hujan.\n\n` +
            `Sunyi.\n\n` +
            `Kamu tidak bisa tidur. Kamu terus memikirkan mata hijaunya yang besar, suara meongnya yang lembut, goresan di telinganya dari perkelahian minggu lalu.\n\n` +
            `Apa yang kamu lakukan?`
        },
        choices: {
          search: {
            label: { en: "🔍 Search for him", id: "🔍 Cari dia" },
            outcomes: [
              {
                weight: 80,
                type: "good",
                text: {
                  en:
                    `You go out into the rain. You search every alley, every corner, every bush.\n\n` +
                    `An hour later, soaked to the bone, you find him — huddled under a broken crate, shivering. He looks up at you.\n\n` +
                    `You scoop him up without a word. He doesn't struggle. He just presses his wet face against your chest and purrs.\n\n` +
                    `The next morning you take him to a vet. You put a collar on him. The tag reads: *Sleepy*.\n\n` +
                    `He purrs the whole way home.\n\n` +
                    `_"Sometimes the smallest kindness can make the biggest difference in the life of a lost soul."_`,
                  id:
                    `Kamu keluar ke dalam hujan. Kamu mencari setiap gang, setiap sudut, setiap semak.\n\n` +
                    `Satu jam kemudian, basah kuyup, kamu menemukannya — meringkuk di bawah peti yang rusak, menggigil. Dia menatapmu.\n\n` +
                    `Kamu meraihnya tanpa sepatah kata. Dia tidak meronta. Dia hanya menekan wajah basahnya ke dadamu dan mendengkur.\n\n` +
                    `Keesokan paginya kamu membawanya ke dokter hewan. Kamu memasangkan kalung padanya. Tagnya bertuliskan: *Sleepy*.\n\n` +
                    `Dia mendengkur sepanjang perjalanan pulang.\n\n` +
                    `_"Terkadang kebaikan terkecil bisa membuat perbedaan terbesar dalam kehidupan jiwa yang tersesat."_`
                },
                rewards: { exp: 800, reputation: 20 },
              },
              {
                weight: 20,
                type: "neutral",
                text: {
                  en:
                    `You search for hours but can't find him. You go home, exhausted and worried.\n\n` +
                    `The next morning, you open your door — and Sleepy is sitting on your doorstep, drenched and muddy, looking up at you like nothing happened.\n\n` +
                    `You dry him off. He falls asleep immediately.\n\n` +
                    `_"Sometimes they find their own way back."_`,
                  id:
                    `Kamu mencari berjam-jam tapi tidak bisa menemukannya. Kamu pulang, kelelahan dan khawatir.\n\n` +
                    `Keesokan paginya, kamu membuka pintu — dan Sleepy duduk di depan pintumu, basah dan berlumpur, menatapmu seolah tidak ada yang terjadi.\n\n` +
                    `Kamu mengeringkannya. Dia langsung tertidur.\n\n` +
                    `_"Terkadang mereka menemukan jalan pulang sendiri."_`
                },
                rewards: { exp: 500, reputation: 10 },
              },
            ],
          },
          wait: {
            label: { en: "😴 Wait till morning", id: "😴 Tunggu sampai pagi" },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You tell yourself he'll be fine. Cats always come back.\n\n` +
                    `You lie awake most of the night anyway.\n\n` +
                    `At dawn, you hear a faint meow at the door. You open it — Sleepy is there, soaked and shivering, with a new scratch on his ear.\n\n` +
                    `He walks inside like he owns the place and curls up on your blanket.\n\n` +
                    `You feel relieved. And a little guilty for not going out to find him.`,
                  id:
                    `Kamu bilang pada dirimu sendiri dia akan baik-baik saja. Kucing selalu kembali.\n\n` +
                    `Kamu tetap terjaga sebagian besar malam itu.\n\n` +
                    `Saat fajar, kamu mendengar suara meong pelan di pintu. Kamu membukanya — Sleepy ada di sana, basah dan menggigil, dengan goresan baru di telinganya.\n\n` +
                    `Dia masuk seolah dia yang punya tempat ini dan meringkuk di selimutmu.\n\n` +
                    `Kamu merasa lega. Dan sedikit bersalah karena tidak keluar mencarinya.`
                },
                rewards: { exp: 300, reputation: 5 },
              },
            ],
          },
          pray: {
            label: { en: "🙏 Pray he's safe", id: "🙏 Doakan dia selamat" },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You sit by the window and watch the rain. You think about all the times he curled up beside you, all the mornings he was waiting.\n\n` +
                    `You whisper: *"Come back, Sleepy."*\n\n` +
                    `In the morning, he's at the door. Wet, tired, but safe. He meows once — soft and low — and walks inside.\n\n` +
                    `You hold him for a long time. He lets you.`,
                  id:
                    `Kamu duduk di dekat jendela dan memandangi hujan. Kamu memikirkan semua saat dia meringkuk di sampingmu, semua pagi dia menunggu.\n\n` +
                    `Kamu berbisik: *"Kembalilah, Sleepy."*\n\n` +
                    `Di pagi hari, dia ada di pintu. Basah, lelah, tapi selamat. Dia mengeong sekali — pelan dan rendah — dan masuk ke dalam.\n\n` +
                    `Kamu memeluknya lama. Dia membiarkanmu.`
                },
                rewards: { exp: 400, reputation: 8 },
              },
            ],
          },
        },
      },

    },
  },

 
  // ═══════════════════════════════════════════════════════
  // THE RESOURCEFUL BIRD (Multi-Stage Story)
  // ═══════════════════════════════════════════════════════
  resourceful_bird: {
    id: "resourceful_bird",
    title: { en: "🐦 The Hungry Bird", id: "🐦 Burung yang Lapar" },
    description: {
      en:
        `A small bird lands near you, looking exhausted.\n\n` +
        `It hops around frantically, pecking at the ground — but there's nothing here. It looks thin. Its feathers are ruffled. It's been searching for a long time.\n\n` +
        `Nearby, a tree hangs heavy with ripe fruit — but the branches are too high for the bird to reach. It stares up at them, then back at the ground.`,
      id:
        `Seekor burung kecil mendarat di dekatmu, terlihat kelelahan.\n\n` +
        `Dia melompat-lompat dengan panik, mematuk tanah — tapi tidak ada apa-apa di sini. Dia terlihat kurus. Bulunya kusut. Dia sudah mencari sejak lama.\n\n` +
        `Di dekatnya, sebuah pohon bergantung penuh buah matang — tapi cabang-cabangnya terlalu tinggi untuk dijangkau burung itu. Dia menatap ke atas, lalu kembali ke tanah.`
    },
    emoji: "🐦",
    rarity: "uncommon",
    locations: ["all"],
    choices: {
      observe: {
        label: { en: "🔍 Watch quietly", id: "🔍 Amati diam-diam" },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You step back and watch.\n\n` +
                `The bird stares at the fruit for a long moment. Then it flies to a nearby puddle, picks up a small stone with its beak, and flies back to the tree.\n\n` +
                `It drops the stone onto a branch. A fruit wobbles.\n\n` +
                `It does it again. And again. One by one, fruits tumble to the ground.\n\n` +
                `The bird hops down and begins to eat — slowly at first, then hungrily. It worked.`,
              id:
                `Kamu mundur dan mengamati.\n\n` +
                `Burung itu menatap buah-buahan itu lama. Lalu dia terbang ke genangan air di dekatnya, mengambil batu kecil dengan paruhnya, dan terbang kembali ke pohon.\n\n` +
                `Dia menjatuhkan batu ke cabang. Sebuah buah bergoyang.\n\n` +
                `Dia melakukannya lagi. Dan lagi. Satu per satu, buah-buahan jatuh ke tanah.\n\n` +
                `Burung itu melompat turun dan mulai makan — perlahan pada awalnya, lalu dengan lahap. Berhasil.`
            },
            rewards: { exp: 80 },
            nextStage: "bird_stage2_lesson",
          },
        ],
      },
      help: {
        label: { en: "🤲 Help it reach the fruit", id: "🤲 Bantu dia meraih buah" },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You walk to the tree and shake a low branch. Several fruits fall to the ground.\n\n` +
                `The bird freezes — startled by you. But hunger wins. It hops forward cautiously and begins to eat.\n\n` +
                `Halfway through its meal, it pauses and looks at you. Just for a moment.\n\n` +
                `Then it keeps eating.`,
              id:
                `Kamu berjalan ke pohon dan menggoyangkan cabang yang rendah. Beberapa buah jatuh ke tanah.\n\n` +
                `Burung itu membeku — terkejut olehmu. Tapi rasa lapar menang. Dia melangkah maju dengan hati-hati dan mulai makan.\n\n` +
                `Di tengah makannya, dia berhenti dan menatapmu. Hanya sebentar.\n\n` +
                `Lalu dia terus makan.`
            },
            rewards: { exp: 60, reputation: 5 },
            nextStage: "bird_stage2_lesson",
          },
        ],
      },
      leave: {
        label: { en: "🚶 Walk past", id: "🚶 Lewati saja" },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en:
                `You walk on. Behind you, you hear the faint sound of something hitting a branch.\n\n` +
                `You glance back. The bird is dropping stones onto the fruit, knocking them down one by one.\n\n` +
                `It figured it out on its own.`,
              id:
                `Kamu terus berjalan. Di belakangmu, kamu mendengar suara samar sesuatu membentur cabang.\n\n` +
                `Kamu menoleh. Burung itu menjatuhkan batu ke buah-buahan, menjatuhkannya satu per satu.\n\n` +
                `Dia menemukan caranya sendiri.`
            },
            rewards: { exp: 20 },
          },
        ],
      },
    },
    stages: {
      bird_stage2_lesson: {
        title: { en: "🐦 What the Bird Taught You", id: "🐦 Apa yang Diajarkan Burung Itu" },
        description: {
          en:
            `The bird finishes eating and sits quietly for a moment.\n\n` +
            `You think about what you just saw. A small creature, exhausted and hungry, faced with something it couldn't reach. And instead of giving up, it found another way.\n\n` +
            `No one taught it that. It just figured it out.\n\n` +
            `What do you take from this?`,
          id:
            `Burung itu selesai makan dan duduk diam sejenak.\n\n` +
            `Kamu memikirkan apa yang baru saja kamu lihat. Makhluk kecil, kelelahan dan lapar, dihadapkan dengan sesuatu yang tidak bisa dijangkaunya. Dan alih-alih menyerah, dia menemukan cara lain.\n\n` +
            `Tidak ada yang mengajarinya itu. Dia hanya menemukannya sendiri.\n\n` +
            `Apa yang kamu ambil dari ini?`
        },
        choices: {
          read: {
            label: { en: "📖 Sit and reflect", id: "📖 Duduk dan renungkan" },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You sit down under the tree. The bird hops around nearby, unbothered by you now.\n\n` +
                    `You think about the times you gave up too early. The problems you walked away from because they seemed too hard.\n\n` +
                    `The bird chirps once — sharp and clear — then flies away.\n\n` +
                    `_"We need to be resourceful and creative when faced with challenges. Instead of giving up in the face of difficulties, we should always find ways to overcome them. With determination and a willingness to adapt, we can achieve anything we set our minds to."_`,
                  id:
                    `Kamu duduk di bawah pohon. Burung itu melompat-lompat di dekatmu, tidak terganggu olehmu sekarang.\n\n` +
                    `Kamu memikirkan saat-saat kamu menyerah terlalu cepat. Masalah-masalah yang kamu tinggalkan karena tampak terlalu sulit.\n\n` +
                    `Burung itu berkicau sekali — tajam dan jelas — lalu terbang pergi.\n\n` +
                    `_"Kita perlu menjadi kreatif dan penuh akal saat menghadapi tantangan. Alih-alih menyerah di hadapan kesulitan, kita harus selalu menemukan cara untuk mengatasinya. Dengan tekad dan kemauan untuk beradaptasi, kita bisa mencapai apapun yang kita inginkan."_`
                },
                rewards: { exp: 600, reputation: 10 },
              },
            ],
          },
          help: {
            label: { en: "🎁 Leave more food for it", id: "🎁 Tinggalkan lebih banyak makanan" },
            outcomes: [
              {
                weight: 100,
                type: "good",
                text: {
                  en:
                    `You shake a few more branches, knocking down extra fruit. Enough for a few days.\n\n` +
                    `The bird watches you, head tilted. You walk away without looking back.\n\n` +
                    `Some problems don't need clever solutions. Sometimes you just need someone to shake the tree.`,
                  id:
                    `Kamu menggoyangkan beberapa cabang lagi, menjatuhkan buah ekstra. Cukup untuk beberapa hari.\n\n` +
                    `Burung itu memperhatikanmu, kepala miring. Kamu pergi tanpa menoleh.\n\n` +
                    `Beberapa masalah tidak membutuhkan solusi cerdas. Terkadang kamu hanya butuh seseorang untuk menggoyangkan pohon.`
                },
                rewards: { exp: 350, reputation: 8 },
              },
            ],
          },
          leave: {
            label: { en: "🚶 Continue your journey", id: "🚶 Lanjutkan perjalanan" },
            outcomes: [
              {
                weight: 100,
                type: "neutral",
                text: {
                  en:
                    `You nod at the bird and walk on. You carry the image with you: a small bird, a pile of stones, a tree full of fruit.\n\n` +
                    `Sometimes that's enough.`,
                  id:
                    `Kamu mengangguk pada burung itu dan terus berjalan. Kamu membawa gambaran itu bersamamu: seekor burung kecil, setumpuk batu, pohon penuh buah.\n\n` +
                    `Terkadang itu sudah cukup.`
                },
                rewards: { exp: 150 },
              },
            ],
          },
        },
      },
    },
  },

  torn_page: {
    id: "torn_page",
    title: { en: "📄 A Torn Page", id: "📄 Selembar Kertas Robek" },
    description: {
      en: "You notice a piece of paper on the ground. It looks like it was torn from a book — the edges are ragged and the ink is slightly faded. Someone must have dropped it.",
      id: "Kamu melihat selembar kertas di tanah. Sepertinya robek dari sebuah buku — tepinya compang-camping dan tintanya sedikit pudar. Seseorang pasti menjatuhkannya."
    },
    emoji: "📄",
    rarity: "uncommon",
    locations: ["all"],
    choices: {
      read: {
        label: { en: "📖 Read it", id: "📖 Baca" },
        outcomes: [
          {
            weight: 100,
            type: "good",
            text: {
              en:
                `You pick up the torn page and read it carefully.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `*Once upon a time, there was a long and lonely line.*\n\n` +
                `This line was unlike any other line. It was a lone line that had been alone for years, never having been connected to another line. All it knew was loneliness and isolation. Every day, the lone line would watch the other lines above and below it, connecting and interacting with one another. But the lone line could never join in. It was too far away from the others, and no one seemed to notice it.\n\n` +
                `As the years went by, the lone line became sadder and sadder. It wished for someone to connect with, someone to talk to, and someone to share its life with. One day, a group of lines came close to the lone line, and it could feel its heart beating faster with excitement and hope. As the group got closer, the lone line tried to make itself visible, but the group ignored it and moved on. The lone line felt rejected and alone once again.\n\n` +
                `As time went by, the lone line started to lose hope and began to think that it would always be alone and miserable. But then, something remarkable happened. Another lone line appeared, just like it. The two lone lines connected, and the feeling of togetherness and belonging overwhelmed them. For the first time in its life, the lone line wasn't lonely anymore.\n\n` +
                `The two lone lines started connecting with other lines and formed a beautiful pattern, unlike anything anyone had ever seen. The other lines started to notice them, and they were no longer alone or ignored. The lone line realized that sometimes, it takes another lone line to find the connection and love that it had been searching for all along. From that day on, the lone line was no longer lonely, and it lived happily ever after.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `_"Loneliness is just a temporary phase in life. Sometimes it takes finding the right connection, even if it's another lone line, to transform loneliness into a beautiful and meaningful pattern."_\n\n` +
                `You fold the page carefully and keep it with you.`,
              id:
                `Kamu memungut kertas robek itu dan membacanya dengan seksama.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `*Dahulu kala, ada sebuah garis yang panjang dan kesepian.*\n\n` +
                `Garis ini tidak seperti garis lainnya. Ia adalah garis yang telah sendirian selama bertahun-tahun, tidak pernah terhubung dengan garis lain. Yang ia tahu hanyalah kesepian dan keterasingan. Setiap hari, garis kesepian itu menyaksikan garis-garis lain di atas dan di bawahnya, saling terhubung dan berinteraksi. Tapi garis kesepian itu tidak pernah bisa ikut bergabung. Ia terlalu jauh dari yang lain, dan tidak ada yang tampak memperhatikannya.\n\n` +
                `Seiring berjalannya waktu, garis kesepian itu semakin sedih. Ia berharap ada seseorang untuk terhubung, seseorang untuk diajak bicara, dan seseorang untuk berbagi hidupnya. Suatu hari, sekelompok garis mendekati garis kesepian itu, dan ia bisa merasakan jantungnya berdegup lebih cepat dengan kegembiraan dan harapan. Saat kelompok itu semakin dekat, garis kesepian itu mencoba membuat dirinya terlihat, tapi kelompok itu mengabaikannya dan terus bergerak. Garis kesepian itu merasa ditolak dan sendirian lagi.\n\n` +
                `Seiring waktu berlalu, garis kesepian itu mulai kehilangan harapan dan mulai berpikir bahwa ia akan selalu sendirian dan menderita. Tapi kemudian, sesuatu yang luar biasa terjadi. Garis kesepian lain muncul, sama seperti dirinya. Kedua garis kesepian itu terhubung, dan perasaan kebersamaan dan rasa memiliki menguasai mereka. Untuk pertama kalinya dalam hidupnya, garis kesepian itu tidak lagi kesepian.\n\n` +
                `Kedua garis kesepian itu mulai terhubung dengan garis-garis lain dan membentuk pola yang indah, tidak seperti yang pernah dilihat siapapun sebelumnya. Garis-garis lain mulai memperhatikan mereka, dan mereka tidak lagi sendirian atau diabaikan. Garis kesepian itu menyadari bahwa terkadang, dibutuhkan garis kesepian lain untuk menemukan koneksi dan cinta yang selama ini dicarinya. Sejak hari itu, garis kesepian itu tidak lagi kesepian, dan ia hidup bahagia selamanya.\n\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `_"Kesepian hanyalah fase sementara dalam hidup. Terkadang dibutuhkan menemukan koneksi yang tepat, bahkan jika itu adalah garis kesepian lain, untuk mengubah kesepian menjadi pola yang indah dan bermakna."_\n\n` +
                `Kamu melipat kertas itu dengan hati-hati dan menyimpannya.`
            },
            rewards: { exp: 500 },
          },
        ],
      },
      investigate: {
        label: { en: "🔍 Examine it", id: "🔍 Periksa" },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: "You pick it up and look closely. The handwriting is neat but hurried — whoever wrote this was in a rush. The paper smells faintly of old wood and ink. You decide to keep it but not read it now.",
              id: "Kamu memungutnya dan melihat dengan seksama. Tulisan tangannya rapi tapi terburu-buru — siapapun yang menulis ini sedang tergesa-gesa. Kertas itu berbau samar kayu tua dan tinta. Kamu memutuskan untuk menyimpannya tapi tidak membacanya sekarang."
            },
            rewards: { exp: 50 },
          },
        ],
      },
      leave: {
        label: { en: "🚶 Leave it", id: "🚶 Tinggalkan" },
        outcomes: [
          {
            weight: 100,
            type: "neutral",
            text: {
              en: "You glance at it and walk on. Whatever story it holds, it's not yours to read.",
              id: "Kamu meliriknya dan terus berjalan. Apapun cerita yang tersimpan di dalamnya, bukan urusanmu untuk membacanya."
            },
            rewards: { exp: 10 },
          },
        ],
      },
    },
  },

 
};

// ══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════

/**
 * Check if player has required items for a choice
 * @param {object} choice 
 * @param {object} playerBag - { itemId: quantity }
 * @returns {boolean}
 */
export function hasRequiredItems(choice, playerBag) {
  if (!choice.requiredItems) return true;
  
  for (const required of choice.requiredItems) {
    const playerAmount = playerBag[required.id] || 0;
    if (playerAmount < required.qty) {
      return false;
    }
  }
  return true;
}

/**
 * Check if player has required gold for a choice
 * @param {object} choice 
 * @param {number} playerGold 
 * @returns {boolean}
 */
export function hasRequiredGold(choice, playerGold) {
  if (!choice.requiredGold) return true;
  return playerGold >= choice.requiredGold;
}

/**
 * Check if player can make a choice
 * @param {object} choice 
 * @param {object} playerBag - { itemId: quantity }
 * @param {number} playerGold 
 * @returns {object} { canChoose: boolean, reason: string }
 */
export function canMakeChoice(choice, playerBag, playerGold) {
  // Check required items
  if (choice.requiredItems) {
    for (const required of choice.requiredItems) {
      const playerAmount = playerBag[required.id] || 0;
      if (playerAmount < required.qty) {
        return {
          canChoose: false,
          reason: `You need ${required.qty}x ${required.id} but only have ${playerAmount}.`
        };
      }
    }
  }
  
  // Check required gold
  if (choice.requiredGold) {
    if (playerGold < choice.requiredGold) {
      return {
        canChoose: false,
        reason: `You need ${choice.requiredGold} gold but only have ${playerGold}.`
      };
    }
  }
  
  return { canChoose: true, reason: null };
}

/**
 * Consume required items from player's bag
 * @param {object} choice 
 * @param {object} playerBag - { itemId: quantity }
 * @returns {object} Updated player bag
 */
export function consumeRequiredItems(choice, playerBag) {
  if (!choice.requiredItems) return playerBag;
  
  const updatedBag = { ...playerBag };
  
  for (const required of choice.requiredItems) {
    if (updatedBag[required.id]) {
      updatedBag[required.id] -= required.qty;
      if (updatedBag[required.id] <= 0) {
        delete updatedBag[required.id];
      }
    }
  }
  
  return updatedBag;
}

/**
 * Get a random story encounter for a location
 * @param {string} locationId 
 * @returns {object|null}
 */
export function getRandomEncounter(locationId) {
  // Filter encounters that can appear at this location
  const available = Object.values(storyEncounters).filter((encounter) => {
    return encounter.locations.includes("all") || encounter.locations.includes(locationId);
  });

  if (available.length === 0) return null;

  // Random selection
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Get encounter by ID
 * @param {string} encounterId 
 * @returns {object|null}
 */
export function getEncounterById(encounterId) {
  return storyEncounters[encounterId] || null;
}

/**
 * Process a choice and get outcome
 * @param {object} encounter 
 * @param {string} choiceKey 
 * @returns {object}
 */
export function processChoice(encounter, choiceKey) {
  const choice = encounter.choices[choiceKey];
  if (!choice) return null;

  // Calculate weighted random outcome
  const totalWeight = choice.outcomes.reduce((sum, o) => sum + o.weight, 0);
  let random = Math.random() * totalWeight;

  for (const outcome of choice.outcomes) {
    random -= outcome.weight;
    if (random <= 0) {
      return {
        choice: choice.label,
        ...outcome,
      };
    }
  }

  // Fallback to first outcome
  return {
    choice: choice.label,
    ...choice.outcomes[0],
  };
}

/**
 * Get available choices for an encounter with requirement checks
 * @param {object} encounter 
 * @param {object} playerBag - { itemId: quantity }
 * @param {number} playerGold 
 * @returns {array}
 */
export function getAvailableChoices(encounter, playerBag = {}, playerGold = 0) {
  return Object.keys(encounter.choices).map((key) => {
    const choice = encounter.choices[key];
    const canMake = canMakeChoice(choice, playerBag, playerGold);
    
    return {
      key,
      label: choice.label,
      canChoose: canMake.canChoose,
      reason: canMake.reason,
      requiredItems: choice.requiredItems || null,
      requiredGold: choice.requiredGold || null,
    };
  });
}

export default {
  storyEncounters,
  storyChoices,
  getChoiceDefinition,
  getAllChoiceKeys,
  getRandomEncounter,
  getEncounterById,
  processChoice,
  getAvailableChoices,
  hasRequiredItems,
  hasRequiredGold,
  canMakeChoice,
  consumeRequiredItems,
  getReputationTitle,
  formatReputationBar,
};
