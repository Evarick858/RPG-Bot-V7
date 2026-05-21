// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Title System
  Base : Lenwy SCM — RPG Extension

  Titles are cosmetic badges displayed on the player profile.
  Players can unlock multiple titles and equip one at a time.

  Sources:
  - "default"  : given on registration
  - "milestone": earned automatically by hitting a stat threshold
  - "owner"    : given manually by the bot owner
  - "quest"    : reward from a specific quest
*/

// ── Title Definitions ─────────────────────────────────────

export const titles = {

  // ════════════════════════════════════════
  // 🌱 STARTER
  // ════════════════════════════════════════

  newcomer: {
    id: "newcomer",
    name: "Newcomer",
    emoji: "🌟",
    display: "🌟 Newcomer",
    description: "Just starting the adventure.",
    source: "default",
    condition: null,
  },

  adventurer: {
    id: "adventurer",
    name: "Adventurer",
    emoji: "⚔️",
    display: "⚔️ Adventurer",
    description: "Reached Level 5.",
    source: "milestone",
    condition: { type: "level", value: 5 },
  },

  veteran: {
    id: "veteran",
    name: "Veteran",
    emoji: "🎖️",
    display: "🎖️ Veteran",
    description: "Reached Level 20.",
    source: "milestone",
    condition: { type: "level", value: 20 },
  },

  champion: {
    id: "champion",
    name: "Champion",
    emoji: "🏆",
    display: "🏆 Champion",
    description: "Reached Level 50.",
    source: "milestone",
    condition: { type: "level", value: 50 },
  },

  // ════════════════════════════════════════
  // ⚔️ COMBAT / HUNT
  // ════════════════════════════════════════

  monster_slayer: {
    id: "monster_slayer",
    name: "Monster Slayer",
    emoji: "🗡️",
    display: "🗡️ Monster Slayer",
    description: "Defeated 50 monsters.",
    source: "milestone",
    condition: { type: "totalKills", value: 50 },
  },

  executioner: {
    id: "executioner",
    name: "Executioner",
    emoji: "💀",
    display: "💀 Executioner",
    description: "Defeated 200 monsters.",
    source: "milestone",
    condition: { type: "totalKills", value: 200 },
  },

  warlord: {
    id: "warlord",
    name: "Warlord",
    emoji: "👑",
    display: "👑 Warlord",
    description: "Defeated 500 monsters.",
    source: "milestone",
    condition: { type: "totalKills", value: 500 },
  },

  unstoppable: {
    id: "unstoppable",
    name: "Unstoppable",
    emoji: "🔥",
    display: "🔥 Unstoppable",
    description: "Defeated 1000 monsters.",
    source: "milestone",
    condition: { type: "totalKills", value: 1000 },
  },

  daredevil: {
    id: "daredevil",
    name: "Daredevil",
    emoji: "😵",
    display: "😵 Daredevil",
    description: "Died 10 times and kept going.",
    source: "milestone",
    condition: { type: "totalDeaths", value: 10 },
  },

  boss_killer: {
    id: "boss_killer",
    name: "Boss Killer",
    emoji: "🏅",
    display: "🏅 Boss Killer",
    description: "Defeated your first boss.",
    source: "milestone",
    condition: { type: "bossesKilled", value: 1 },
  },

  boss_hunter: {
    id: "boss_hunter",
    name: "Boss Hunter",
    emoji: "👹",
    display: "👹 Boss Hunter",
    description: "Defeated 10 bosses.",
    source: "milestone",
    condition: { type: "bossesKilled", value: 10 },
  },

  // ════════════════════════════════════════
  // 🌍 EXPLORATION / TRAVEL
  // ════════════════════════════════════════

  wanderer: {
    id: "wanderer",
    name: "Wanderer",
    emoji: "🗺️",
    display: "🗺️ Wanderer",
    description: "Unlocked 10 locations.",
    source: "milestone",
    condition: { type: "unlockedLocations", value: 10 },
  },

  explorer: {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    display: "🧭 Explorer",
    description: "Unlocked 25 locations.",
    source: "milestone",
    condition: { type: "unlockedLocations", value: 25 },
  },

  world_traveler: {
    id: "world_traveler",
    name: "World Traveler",
    emoji: "🌏",
    display: "🌏 World Traveler",
    description: "Unlocked 50 locations.",
    source: "milestone",
    condition: { type: "unlockedLocations", value: 50 },
  },

  // ════════════════════════════════════════
  // 🌿 GATHERING
  // ════════════════════════════════════════

  lumberjack: {
    id: "lumberjack",
    name: "Lumberjack",
    emoji: "🪓",
    display: "🪓 Lumberjack",
    description: "Chopped trees 50 times.",
    source: "milestone",
    condition: { type: "chopCount", value: 50 },
  },

  miner: {
    id: "miner",
    name: "Miner",
    emoji: "⛏️",
    display: "⛏️ Miner",
    description: "Mined rocks 50 times.",
    source: "milestone",
    condition: { type: "mineCount", value: 50 },
  },

  fisherman: {
    id: "fisherman",
    name: "Fisherman",
    emoji: "🎣",
    display: "🎣 Fisherman",
    description: "Caught fish 50 times.",
    source: "milestone",
    condition: { type: "fishCount", value: 50 },
  },

  forager: {
    id: "forager",
    name: "Forager",
    emoji: "🌿",
    display: "🌿 Forager",
    description: "Foraged 50 times.",
    source: "milestone",
    condition: { type: "forageCount", value: 50 },
  },

  gatherer: {
    id: "gatherer",
    name: "Gatherer",
    emoji: "🌾",
    display: "🌾 Gatherer",
    description: "Gathered resources 200 times total.",
    source: "milestone",
    condition: { type: "totalGathering", value: 200 },
  },

  master_gatherer: {
    id: "master_gatherer",
    name: "Master Gatherer",
    emoji: "🏅",
    display: "🏅 Master Gatherer",
    description: "Gathered resources 500 times total.",
    source: "milestone",
    condition: { type: "totalGathering", value: 500 },
  },

  // ════════════════════════════════════════
  // ⚗️ CRAFTING / ENCHANTING
  // ════════════════════════════════════════

  crafter: {
    id: "crafter",
    name: "Crafter",
    emoji: "🔨",
    display: "🔨 Crafter",
    description: "Crafted 20 items.",
    source: "milestone",
    condition: { type: "craftCount", value: 20 },
  },

  enchanter: {
    id: "enchanter",
    name: "Enchanter",
    emoji: "✨",
    display: "✨ Enchanter",
    description: "Enchanted a weapon for the first time.",
    source: "milestone",
    condition: { type: "enchantCount", value: 1 },
  },

  master_enchanter: {
    id: "master_enchanter",
    name: "Master Enchanter",
    emoji: "💎",
    display: "💎 Master Enchanter",
    description: "Enchanted 10 times.",
    source: "milestone",
    condition: { type: "enchantCount", value: 10 },
  },

  // ════════════════════════════════════════
  // 🤝 PVP
  // ════════════════════════════════════════

  fighter: {
    id: "fighter",
    name: "Fighter",
    emoji: "🥊",
    display: "🥊 Fighter",
    description: "Won 5 PvP battles.",
    source: "milestone",
    condition: { type: "pvpWins", value: 5 },
  },

  arena_champion: {
    id: "arena_champion",
    name: "Arena Champion",
    emoji: "🏅",
    display: "🏅 Arena Champion",
    description: "Won 20 PvP battles.",
    source: "milestone",
    condition: { type: "pvpWins", value: 20 },
  },

  pvp_legend: {
    id: "pvp_legend",
    name: "PvP Legend",
    emoji: "👑",
    display: "👑 PvP Legend",
    description: "Won 50 PvP battles.",
    source: "milestone",
    condition: { type: "pvpWins", value: 50 },
  },

  // ════════════════════════════════════════
  // 😇 REPUTATION
  // ════════════════════════════════════════

  saint: {
    id: "saint",
    name: "Saint",
    emoji: "😇",
    display: "😇 Saint",
    description: "Reached Saint reputation (1000+).",
    source: "milestone",
    condition: { type: "reputation", value: 1000 },
  },

  hero: {
    id: "hero",
    name: "Hero",
    emoji: "🦸",
    display: "🦸 Hero",
    description: "Reached Hero reputation (500+).",
    source: "milestone",
    condition: { type: "reputation", value: 500 },
  },

  rogue_title: {
    id: "rogue_title",
    name: "Rogue",
    emoji: "😈",
    display: "😈 Rogue",
    description: "Reached Rogue reputation (-100 or below).",
    source: "milestone",
    condition: { type: "reputation_evil", value: -100 },
  },

  demon_lord: {
    id: "demon_lord",
    name: "Demon Lord",
    emoji: "💀",
    display: "💀 Demon Lord",
    description: "Reached Demon reputation (-1000 or below).",
    source: "milestone",
    condition: { type: "reputation_evil", value: -1000 },
  },

  // ════════════════════════════════════════
  // 💰 WEALTH
  // ════════════════════════════════════════

  gold_hoarder: {
    id: "gold_hoarder",
    name: "Gold Hoarder",
    emoji: "💰",
    display: "💰 Gold Hoarder",
    description: "Earned 10,000 gold total.",
    source: "milestone",
    condition: { type: "totalGoldEarned", value: 10000 },
  },

  millionaire: {
    id: "millionaire",
    name: "Millionaire",
    emoji: "💎",
    display: "💎 Millionaire",
    description: "Earned 100,000 gold total.",
    source: "milestone",
    condition: { type: "totalGoldEarned", value: 100000 },
  },

  // ════════════════════════════════════════
  // 🐾 PETS
  // ════════════════════════════════════════

  pet_tamer: {
    id: "pet_tamer",
    name: "Pet Tamer",
    emoji: "🐾",
    display: "🐾 Pet Tamer",
    description: "Tamed your first pet.",
    source: "milestone",
    condition: { type: "petCount", value: 1 },
  },

  dragon_tamer: {
    id: "dragon_tamer",
    name: "Dragon Tamer",
    emoji: "🐉",
    display: "🐉 Dragon Tamer",
    description: "Own an SR or SSR pet.",
    source: "milestone",
    condition: { type: "rarePet", value: true },
  },

  // ════════════════════════════════════════
  // 📜 QUESTS
  // ════════════════════════════════════════

  quest_seeker: {
    id: "quest_seeker",
    name: "Quest Seeker",
    emoji: "📜",
    display: "📜 Quest Seeker",
    description: "Completed 10 quests total.",
    source: "milestone",
    condition: { type: "questsCompleted", value: 10 },
  },

  quest_master: {
    id: "quest_master",
    name: "Quest Master",
    emoji: "🏆",
    display: "🏆 Quest Master",
    description: "Completed the monthly Quest Master challenge.",
    source: "quest",
    condition: null,
  },

  // ════════════════════════════════════════
  // 👑 OWNER-GIVEN (exclusive)
  // ════════════════════════════════════════

  chosen_one: {
    id: "chosen_one",
    name: "Chosen One",
    emoji: "⭐",
    display: "⭐ Chosen One",
    description: "Chosen by the bot owner.",
    source: "owner",
    condition: null,
  },

  shadow_walker: {
    id: "shadow_walker",
    name: "Shadow Walker",
    emoji: "🌙",
    display: "🌙 Shadow Walker",
    description: "A mysterious title granted by the owner.",
    source: "owner",
    condition: null,
  },

  legend: {
    id: "legend",
    name: "Legend",
    emoji: "🔱",
    display: "🔱 Legend",
    description: "A legendary title granted by the owner.",
    source: "owner",
    condition: null,
  },

  mythic: {
    id: "mythic",
    name: "Mythic",
    emoji: "💫",
    display: "💫 Mythic",
    description: "The rarest title, granted by the owner.",
    source: "owner",
    condition: null,
  },

  the_fw: {
    id: "the_fw",
    name: "The FW",
    emoji: "👾",
    display: "👾 The FW",
    description: "A special title granted by the owner.",
    source: "owner",
    condition: null,
  },

  owner: {
    id: "owner",
    name: "Owner",
    emoji: "👑",
    display: "👑 Owner",
    description: "The bot owner.",
    source: "owner",
    condition: null,
  },

  admin: {
    id: "admin",
    name: "Admin",
    emoji: "🛡️",
    display: "🛡️ Admin",
    description: "A trusted admin.",
    source: "owner",
    condition: null,
  },

  // ════════════════════════════════════════
  // 🏆 PRESTIGE / STATUS
  // ════════════════════════════════════════

  the_king: {
    id: "the_king",
    name: "The King",
    emoji: "👑",
    display: "👑 The King",
    description: "Royalty. Granted by the owner.",
    source: "owner",
    condition: null,
  },

  the_goat: {
    id: "the_goat",
    name: "The Goat",
    emoji: "🌟",
    display: "🌟 The Goat",
    description: "Greatest of all time.",
    source: "owner",
    condition: null,
  },

  elite: {
    id: "elite",
    name: "Elite",
    emoji: "💎",
    display: "💎 Elite",
    description: "Among the finest.",
    source: "owner",
    condition: null,
  },

  veteran_player: {
    id: "veteran_player",
    name: "Veteran Player",
    emoji: "🎖️",
    display: "🎖️ Veteran Player",
    description: "Been here since the beginning.",
    source: "owner",
    condition: null,
  },

  og: {
    id: "og",
    name: "OG",
    emoji: "🔥",
    display: "🔥 OG",
    description: "Original. Can't be replicated.",
    source: "owner",
    condition: null,
  },

  // ════════════════════════════════════════
  // 😈 VILLAIN / DARK
  // ════════════════════════════════════════

  reaper: {
    id: "reaper",
    name: "Reaper",
    emoji: "💀",
    display: "💀 Reaper",
    description: "Death follows in their wake.",
    source: "owner",
    condition: null,
  },

  dark_lord: {
    id: "dark_lord",
    name: "Dark Lord",
    emoji: "🌑",
    display: "🌑 Dark Lord",
    description: "Commands the darkness.",
    source: "owner",
    condition: null,
  },

  death_bringer: {
    id: "death_bringer",
    name: "Death Bringer",
    emoji: "⚰️",
    display: "⚰️ Death Bringer",
    description: "Brings only destruction.",
    source: "owner",
    condition: null,
  },

  blood_knight: {
    id: "blood_knight",
    name: "Blood Knight",
    emoji: "🩸",
    display: "🩸 Blood Knight",
    description: "Thrives in the heat of battle.",
    source: "owner",
    condition: null,
  },

  the_watcher: {
    id: "the_watcher",
    name: "The Watcher",
    emoji: "👁️",
    display: "👁️ The Watcher",
    description: "Always watching. Always knowing.",
    source: "owner",
    condition: null,
  },

  // ════════════════════════════════════════
  // ✨ MYSTICAL / COOL
  // ════════════════════════════════════════

  void_walker: {
    id: "void_walker",
    name: "Void Walker",
    emoji: "🌌",
    display: "🌌 Void Walker",
    description: "Walks between worlds.",
    source: "owner",
    condition: null,
  },

  thunder_god: {
    id: "thunder_god",
    name: "Thunder God",
    emoji: "⚡",
    display: "⚡ Thunder God",
    description: "Commands the storm.",
    source: "owner",
    condition: null,
  },

  dragon_king: {
    id: "dragon_king",
    name: "Dragon King",
    emoji: "🐉",
    display: "🐉 Dragon King",
    description: "Ruler of all dragons.",
    source: "owner",
    condition: null,
  },

  moonchaser: {
    id: "moonchaser",
    name: "Moonchaser",
    emoji: "🌙",
    display: "🌙 Moonchaser",
    description: "Forever chasing the horizon.",
    source: "owner",
    condition: null,
  },

  fallen_star: {
    id: "fallen_star",
    name: "Fallen Star",
    emoji: "☄️",
    display: "☄️ Fallen Star",
    description: "Brilliant, but fallen from grace.",
    source: "owner",
    condition: null,
  },

  // ════════════════════════════════════════
  // 😂 FUN / MEME
  // ════════════════════════════════════════

  the_clown: {
    id: "the_clown",
    name: "The Clown",
    emoji: "🤡",
    display: "🤡 The Clown",
    description: "Never takes anything seriously.",
    source: "owner",
    condition: null,
  },

  slow_poke: {
    id: "slow_poke",
    name: "Slow Poke",
    emoji: "🐢",
    display: "🐢 Slow Poke",
    description: "Gets there eventually.",
    source: "owner",
    condition: null,
  },

  broke: {
    id: "broke",
    name: "Broke",
    emoji: "💸",
    display: "💸 Broke",
    description: "Always out of gold.",
    source: "owner",
    condition: null,
  },

  lucky_guy: {
    id: "lucky_guy",
    name: "Lucky Guy",
    emoji: "🍀",
    display: "🍀 Lucky Guy",
    description: "Somehow always lands on their feet.",
    source: "owner",
    condition: null,
  },

  the_rock: {
    id: "the_rock",
    name: "The Rock",
    emoji: "🗿",
    display: "🗿 The Rock",
    description: "Unmovable. Unshakeable.",
    source: "owner",
    condition: null,
  },

  // ════════════════════════════════════════
  // 🤝 SOCIAL / COMMUNITY
  // ════════════════════════════════════════

  the_helper: {
    id: "the_helper",
    name: "The Helper",
    emoji: "🫂",
    display: "🫂 The Helper",
    description: "Always there for others.",
    source: "owner",
    condition: null,
  },

  announcer: {
    id: "announcer",
    name: "Announcer",
    emoji: "📢",
    display: "📢 Announcer",
    description: "Voice of the community.",
    source: "owner",
    condition: null,
  },

  party_leader: {
    id: "party_leader",
    name: "Party Leader",
    emoji: "🎉",
    display: "🎉 Party Leader",
    description: "Where they go, others follow.",
    source: "owner",
    condition: null,
  },

  most_valuable: {
    id: "most_valuable",
    name: "Most Valuable",
    emoji: "🏅",
    display: "🏅 Most Valuable",
    description: "The MVP of the server.",
    source: "owner",
    condition: null,
  },

  the_diplomat: {
    id: "the_diplomat",
    name: "The Diplomat",
    emoji: "🌍",
    display: "🌍 The Diplomat",
    description: "Keeps the peace.",
    source: "owner",
    condition: null,
  },

};

// ── Helpers ───────────────────────────────────────────────

/**
 * Get title by ID (case-insensitive, supports spaces and underscores)
 */
export function getTitleById(id) {
  if (!id) return null;
  const normalized = id.toLowerCase().replace(/\s+/g, "_");
  return titles[normalized] || null;
}

/**
 * Get title by display name (case-insensitive)
 */
export function getTitleByName(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  return Object.values(titles).find(
    (t) => t.name.toLowerCase() === lower || t.id.toLowerCase() === lower.replace(/\s+/g, "_")
  ) || null;
}

/**
 * Count total gathering actions for a player
 */
function getTotalGathering(player) {
  const t = player.stats_tracker || {};
  return (t.fishCount || 0) + (t.mineCount || 0) + (t.chopCount || 0) + (t.forageCount || 0);
}

/**
 * Count total quests completed for a player
 */
function getTotalQuestsCompleted(player) {
  if (!player.quests) return 0;
  let count = 0;
  for (const period of ["daily", "weekly", "monthly"]) {
    const periodData = player.quests[period];
    if (!periodData?.quests) continue;
    count += periodData.quests.filter((q) => q.claimed).length;
  }
  return count;
}

/**
 * Check if player has an SR or SSR pet
 */
function hasRarePet(player) {
  if (!player.pets || player.pets.length === 0) return false;
  // We need to check pet rarity — pets store id, we check against known SR/SSR pet ids
  const rarePetIds = ["crystal_dragon", "void_serpent", "phoenix", "celestial_tiger"];
  return player.pets.some((p) => rarePetIds.includes(p.id));
}

/**
 * Check if a single title condition is met for a player
 */
function isTitleConditionMet(title, player) {
  const c = title.condition;
  if (!c) return false;

  const tracker = player.stats_tracker || {};

  switch (c.type) {
    case "level":
      return (player.level || 1) >= c.value;

    case "totalKills":
      return (tracker.totalKills || 0) >= c.value;

    case "totalDeaths":
      return (tracker.totalDeaths || 0) >= c.value;

    case "bossesKilled":
      return (tracker.bossesKilled || 0) >= c.value;

    case "unlockedLocations":
      return (player.unlockedLocations?.length || 0) >= c.value;

    case "chopCount":
      return (tracker.chopCount || 0) >= c.value;

    case "mineCount":
      return (tracker.mineCount || 0) >= c.value;

    case "fishCount":
      return (tracker.fishCount || 0) >= c.value;

    case "forageCount":
      return (tracker.forageCount || 0) >= c.value;

    case "totalGathering":
      return getTotalGathering(player) >= c.value;

    case "craftCount":
      return (tracker.craftCount || 0) >= c.value;

    case "enchantCount":
      return (tracker.enchantCount || 0) >= c.value;

    case "pvpWins":
      return (player.pvpWins || 0) >= c.value;

    case "reputation":
      return (typeof player.reputation === "number" ? player.reputation : 0) >= c.value;

    case "reputation_evil":
      return (typeof player.reputation === "number" ? player.reputation : 0) <= c.value;

    case "totalGoldEarned":
      return (tracker.totalGoldEarned || 0) >= c.value;

    case "petCount":
      return (player.pets?.length || 0) >= c.value;

    case "rarePet":
      return hasRarePet(player);

    case "questsCompleted":
      return getTotalQuestsCompleted(player) >= c.value;

    default:
      return false;
  }
}

/**
 * Check all milestone titles and award any newly earned ones.
 * Returns array of newly unlocked title objects (for notification).
 */
export function checkAndAwardTitles(player) {
  if (!player.unlockedTitles) player.unlockedTitles = ["newcomer"];

  const newlyUnlocked = [];

  for (const title of Object.values(titles)) {
    // Skip non-milestone titles (owner/quest given manually)
    if (title.source !== "milestone") continue;

    // Already unlocked
    if (player.unlockedTitles.includes(title.id)) continue;

    // Check condition
    if (isTitleConditionMet(title, player)) {
      player.unlockedTitles.push(title.id);
      newlyUnlocked.push(title);
    }
  }

  return newlyUnlocked;
}

/**
 * Format a notification message for newly unlocked titles.
 */
export function formatTitleUnlockMessage(newTitles) {
  if (!newTitles || newTitles.length === 0) return "";

  if (newTitles.length === 1) {
    const t = newTitles[0];
    return `\n\n🎉 *New Title Unlocked!*\n${t.display}\n_"${t.description}"_\nUse *!equiptitle ${t.name}* to equip it!`;
  }

  const list = newTitles.map((t) => `• ${t.display}`).join("\n");
  return `\n\n🎉 *New Titles Unlocked!*\n${list}\nUse *!titles* to view and equip them!`;
}

export default titles;
