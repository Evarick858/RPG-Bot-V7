// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Admin Commands
  Owner-only commands for managing the RPG system
  
  Commands:
  - !givegold @user <amount>
  - !giveitem @user <item> <qty>
  - !setlevel @user <level>
  - !heal @user
  - !resetplayer @user
  - !setreputation @user <amount>
  - !addxp @user <amount>
  - !rpgban @user
  - !rpgunban @user
  - !rpgbanned
  - !broadcast <message>
  - !playerstats @user
  - !serverinfo
  - !spawnenemy <enemy_id>
  - !teleport @user <location>
  - !maintenance <on/off>
  - !setname <oldname> to <newname>
*/

import fs from "fs";
import path from "path";
import { getLocationById } from "../../database/rpg/locations.js";
import { getItemByName } from "../../database/rpg/items.js";
import { getEnemyById } from "../../database/rpg/enemies.js";
import { validateName, getValidationError } from "../../database/rpg/filter.js";
import { getTitleById, getTitleByName } from "../../database/rpg/titles.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");
const bannedPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "banned.json");
const maintenancePath = path.join(process.cwd(), "WhatsApp", "database", "maintenance.json");
const adminsPath = path.join(process.cwd(), "WhatsApp", "database", "admins.json");

function loadAdmins() {
  try { return JSON.parse(fs.readFileSync(adminsPath, "utf8")); }
  catch { return []; }
}

function saveAdmins(admins) {
  fs.writeFileSync(adminsPath, JSON.stringify(admins, null, 2), "utf8");
}

// Official broadcast group
const BROADCAST_GROUP = "YOUR_GROUP_ID@g.us"; // https://chat.whatsapp.com/HW4nhOmJmjr464O7lUEJVH
// To get Group ID: Join the group with bot, then check group metadata

// ── Helpers ──────────────────────────────────────────────

function loadPlayers() {
  try {
    const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
    const players = { ...data };
    delete players._comment;
    delete players._template;
    return players;
  } catch {
    return {};
  }
}

function savePlayers(players) {
  const raw = fs.readFileSync(playersPath, "utf8");
  const data = JSON.parse(raw);
  const updated = {
    _comment: data._comment,
    _template: data._template,
    ...players,
  };
  fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), "utf8");
}

function loadBanned() {
  try {
    return JSON.parse(fs.readFileSync(bannedPath, "utf8"));
  } catch {
    return [];
  }
}

function saveBanned(banned) {
  fs.writeFileSync(bannedPath, JSON.stringify(banned, null, 2), "utf8");
}

function loadMaintenance() {
  try {
    return JSON.parse(fs.readFileSync(maintenancePath, "utf8"));
  } catch {
    return { enabled: false, startTime: null };
  }
}

function saveMaintenance(data) {
  fs.writeFileSync(maintenancePath, JSON.stringify(data, null, 2), "utf8");
}

function extractMention(msg) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  return mentioned && mentioned.length > 0 ? mentioned[0] : null;
}

function formatNumber(num) {
  return Number(num).toLocaleString("en-US");
}

function findPlayerByName(players, name) {
  for (const [jid, player] of Object.entries(players)) {
    if (player.name && player.name.toLowerCase() === name.toLowerCase()) {
      return { jid, player };
    }
  }
  return null;
}

function resolveTarget(players, msg, args) {
  // Try mention first
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (mentioned && mentioned.length > 0) {
    const jid = mentioned[0];
    return { jid, player: players[jid] || null, restArgs: args };
  }
  // Fall back to name (first word)
  const name = args[0];
  if (!name) return { jid: null, player: null, restArgs: args };
  const found = findPlayerByName(players, name);
  if (!found) return { jid: null, player: null, restArgs: args.slice(1), notFound: name };
  return { jid: found.jid, player: found.player, restArgs: args.slice(1) };
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "RPG Admin",
  menu: ["admin"],
  case: [
    "givegold", "giveitem", "setlevel", "heal", "resetplayer",
    "setreputation", "addxp", "rpgban", "rpgunban", "rpgbanned",
    "broadcast", "playerstats", "serverinfo", "spawnenemy", "teleport",
    "maintenance", "setname", "givetitle", "removetitle",
    "addadmin", "removeadmin", "adminlist"
  ],
  description: "Owner-only RPG administration commands.",
  hidden: true,
  owner: true,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Handler ───────────────────────────────────────────────

export default async function handler(leni) {
  const {
    command,
    q,
    lenwy,
    replyJid,
    LenwyText,
    msg,
    isEvarick,
    isRpgAdmin,
    normalizedSender,
  } = leni;

  const players = loadPlayers();

  // ════════════════════════════════════════════════════════
  // COMMAND: !givegold @user <amount>
  // ════════════════════════════════════════════════════════
  if (command === "givegold") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!givegold @user/<name> <amount>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const amount = parseInt(restArgs[0]);
    if (isNaN(amount)) {
      return LenwyText("⚠️ *Invalid amount!*\n\nUsage: *!givegold @user/<name> <amount>*");
    }

    player.gold = Math.max(0, (player.gold || 0) + amount);
    players[targetJid] = player;
    savePlayers(players);

    const action = amount >= 0 ? "given" : "removed";
    return LenwyText(
      `✅ *Gold ${action}!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `💰 Amount: ${formatNumber(Math.abs(amount))}\n` +
      `💵 New Balance: ${formatNumber(player.gold)}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !giveitem @user <item> <qty>
  // ════════════════════════════════════════════════════════
  if (command === "giveitem") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!giveitem @user/<name> <item> <qty>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const itemId = restArgs[0];
    const qty = parseInt(restArgs[1]) || 1;

    if (!itemId) {
      return LenwyText("⚠️ *Please specify an item!*\n\nUsage: *!giveitem @user/<name> <item> <qty>*");
    }

    const itemData = getItemByName(itemId);
    if (!itemData) {
      return LenwyText(`⚠️ *Item "${itemId}" not found!*`);
    }

    const existing = player.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      player.inventory.push({ id: itemId, qty });
    }

    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Item given!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `📦 Item: ${itemData.name}\n` +
      `🔢 Quantity: ${qty}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !setlevel @user <level>
  // ════════════════════════════════════════════════════════
  if (command === "setlevel") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!setlevel @user/<name> <level>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const level = parseInt(restArgs[0]);
    if (isNaN(level) || level < 1 || level > 100) {
      return LenwyText("⚠️ *Invalid level! Must be between 1-100.*");
    }

    const oldLevel = player.level;
    player.level = level;
    player.xp = 0;
    player.xpToNext = 100 * level;

    // Adjust stats based on level
    const levelDiff = level - oldLevel;
    const statIncrease = levelDiff * 5;

    player.stats.maxHp += statIncrease;
    player.stats.hp = player.stats.maxHp;
    player.stats.maxMana += statIncrease;
    player.stats.mana = player.stats.maxMana;
    player.stats.attack += statIncrease;
    player.stats.defense += statIncrease;
    player.stats.agility += statIncrease;
    player.stats.luck += statIncrease;

    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Level set!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `⭐ Old Level: ${oldLevel}\n` +
      `⭐ New Level: ${level}\n` +
      `📊 Stats adjusted accordingly`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !heal @user
  // ════════════════════════════════════════════════════════
  if (command === "heal") {
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!heal @user/<name>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    player.stats.hp = player.stats.maxHp;
    player.stats.mana = player.stats.maxMana;
    player.statusEffects = [];

    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Player healed!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `❤️ HP: ${player.stats.hp}/${player.stats.maxHp}\n` +
      `💧 Mana: ${player.stats.mana}/${player.stats.maxMana}\n` +
      `✨ All status effects removed`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !resetplayer @user
  // ════════════════════════════════════════════════════════
  if (command === "resetplayer") {
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!resetplayer @user/<name>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const playerName = player.name;
    delete players[targetJid];
    savePlayers(players);

    return LenwyText(
      `✅ *Player reset!*\n\n` +
      `👤 Player: ${playerName}\n` +
      `🗑️ All data has been deleted.\n` +
      `💡 They can register again with *!register*`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !setreputation @user <amount>
  // ════════════════════════════════════════════════════════
  if (command === "setreputation") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!setreputation @user/<name> <amount>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const amount = parseInt(restArgs[0]);
    if (isNaN(amount)) {
      return LenwyText("⚠️ *Invalid amount!*\n\nUsage: *!setreputation @user/<name> <amount>*");
    }

    const oldRep = player.reputation || 0;
    player.reputation = amount;
    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Reputation set!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `📊 Old: ${oldRep}\n` +
      `📊 New: ${amount}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !addxp @user <amount>
  // ════════════════════════════════════════════════════════
  if (command === "addxp") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!addxp @user/<name> <amount>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const amount = parseInt(restArgs[0]);
    if (isNaN(amount)) {
      return LenwyText("⚠️ *Invalid amount!*\n\nUsage: *!addxp @user/<name> <amount>*");
    }

    player.xp += amount;
    
    // Check for level up using centralized helper
    const { checkLevelUp } = await import("../../database/rpg/levelHelper.js");
    const levelUpInfo = checkLevelUp(player);

    players[targetJid] = player;
    savePlayers(players);

    let message = `✅ *XP added!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `⭐ XP: +${amount} (${player.xp}/${player.xpToNext})\n` +
      `📊 Level: ${player.level}`;
    
    if (levelUpInfo.didLevelUp) {
      message += `\n\n${levelUpInfo.message}`;
    }

    return LenwyText(message);
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !rpgban @user
  // ════════════════════════════════════════════════════════
  if (command === "rpgban") {
    if (!isEvarick && !isRpgAdmin) return LenwyText(globalThis.mess.creator);
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!rpgban @user/<name>*");
    }

    const playerName = player ? player.name : targetJid.split("@")[0];

    const banned = loadBanned();
    if (banned.includes(targetJid)) {
      return LenwyText(`⚠️ *${playerName} is already banned!*`);
    }

    banned.push(targetJid);
    saveBanned(banned);

    return LenwyText(
      `✅ *Player banned from RPG!*\n\n` +
      `👤 Player: ${playerName}\n` +
      `🚫 They can no longer use RPG commands.`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !rpgunban @user
  // ════════════════════════════════════════════════════════
  if (command === "rpgunban") {
    if (!isEvarick && !isRpgAdmin) return LenwyText(globalThis.mess.creator);
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!rpgunban @user/<name>*");
    }

    const playerName = player ? player.name : targetJid.split("@")[0];

    let banned = loadBanned();
    if (!banned.includes(targetJid)) {
      return LenwyText(`⚠️ *${playerName} is not banned!*`);
    }

    banned = banned.filter(jid => jid !== targetJid);
    saveBanned(banned);

    return LenwyText(
      `✅ *Player unbanned from RPG!*\n\n` +
      `👤 Player: ${playerName}\n` +
      `✨ They can now use RPG commands again.`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !rpgbanned
  // ════════════════════════════════════════════════════════
  if (command === "rpgbanned") {
    if (!isEvarick && !isRpgAdmin) return LenwyText(globalThis.mess.creator);
    const banned = loadBanned();
    
    if (banned.length === 0) {
      return LenwyText("✅ *No banned players!*");
    }

    let message = `🚫 *Banned Players* (${banned.length})\n\n`;
    
    banned.forEach((jid, index) => {
      const player = players[jid];
      const name = player ? player.name : jid.split("@")[0];
      message += `${index + 1}. ${name}\n`;
    });

    return LenwyText(message);
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !broadcast <message>
  // ════════════════════════════════════════════════════════
  if (command === "broadcast") {
    if (!q.trim()) {
      return LenwyText("⚠️ *Please provide a message!*\n\nUsage: *!broadcast <message>*");
    }

    try {
      // Get all participants from the broadcast group
      const groupMetadata = await lenwy.groupMetadata(BROADCAST_GROUP);
      const participants = groupMetadata.participants.map(p => p.id);

      const broadcastMessage = `📢 *RPG ANNOUNCEMENT*\n\n${q}\n\n_— Evarick RPG Team_`;

      await lenwy.sendMessage(BROADCAST_GROUP, {
        text: broadcastMessage,
        mentions: participants
      });

      return LenwyText(
        `✅ *Broadcast sent!*\n\n` +
        `📢 Message sent to official group\n` +
        `👥 ${participants.length} members tagged`
      );
    } catch (error) {
      return LenwyText(`❌ *Failed to send broadcast!*\n\nError: ${error.message}`);
    }
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !playerstats @user
  // ════════════════════════════════════════════════════════
  if (command === "playerstats") {
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!playerstats @user/<name>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const s = player.stats;
    const tracker = player.stats_tracker || {};

    return LenwyText(
      `📊 *Admin View: ${player.name}*\n\n` +
      `⭐ Level: ${player.level}\n` +
      `✨ XP: ${player.xp}/${player.xpToNext}\n` +
      `💰 Gold: ${formatNumber(player.gold)}\n` +
      `📍 Location: ${player.currentLocation}\n` +
      `🎭 Class: ${player.class}\n` +
      `📊 Reputation: ${player.reputation || 0}\n\n` +
      `❤️ HP: ${s.hp}/${s.maxHp}\n` +
      `💧 Mana: ${s.mana}/${s.maxMana}\n` +
      `⚔️ Attack: ${s.attack}\n` +
      `🛡️ Defense: ${s.defense}\n` +
      `⚡ Agility: ${s.agility}\n` +
      `🍀 Luck: ${s.luck}\n\n` +
      `📦 Inventory: ${player.inventory.length} items\n` +
      `🗺️ Locations: ${player.unlockedLocations.length}\n\n` +
      `🏆 *Stats Tracker:*\n` +
      `💀 Kills: ${formatNumber(tracker.totalKills || 0)}\n` +
      `☠️ Deaths: ${formatNumber(tracker.totalDeaths || 0)}\n` +
      `💰 Gold Earned: ${formatNumber(tracker.totalGoldEarned || 0)}\n` +
      `⚔️ Damage Dealt: ${formatNumber(tracker.totalDamageDealt || 0)}\n` +
      `🛡️ Damage Taken: ${formatNumber(tracker.totalDamageTaken || 0)}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !serverinfo
  // ════════════════════════════════════════════════════════
  if (command === "serverinfo") {
    if (!isEvarick && !isRpgAdmin) return LenwyText(globalThis.mess.creator);

    const playerList = Object.values(players);
    const playerCount = playerList.length;

    // ── Economy ───────────────────────────────────────────
    let totalGold = 0;
    let totalGoldEarned = 0;

    // ── Levels ────────────────────────────────────────────
    let totalLevel = 0;
    let maxLevel = 0;
    let topPlayer = null;
    let level1Count = 0;

    // ── Combat ────────────────────────────────────────────
    let totalKills = 0;
    let totalDeaths = 0;
    let totalBossKills = 0;
    let totalPvpWins = 0;

    // ── Gathering ─────────────────────────────────────────
    let totalFish = 0;
    let totalMine = 0;
    let totalChop = 0;
    let totalForage = 0;

    // ── Classes ───────────────────────────────────────────
    const classCounts = { warrior: 0, mage: 0, rogue: 0 };

    // ── Misc ──────────────────────────────────────────────
    let totalLocationsUnlocked = 0;
    let totalItemsInInventory = 0;
    let totalPets = 0;
    let activeLast24h = 0;
    let activeLast7d = 0;
    const now = Date.now();

    playerList.forEach(p => {
      // Economy
      totalGold += p.gold || 0;
      totalGoldEarned += p.stats_tracker?.totalGoldEarned || 0;

      // Levels
      const lvl = p.level || 1;
      totalLevel += lvl;
      if (lvl > maxLevel) { maxLevel = lvl; topPlayer = p.name; }
      if (lvl === 1) level1Count++;

      // Combat
      totalKills += p.stats_tracker?.totalKills || 0;
      totalDeaths += p.stats_tracker?.totalDeaths || 0;
      totalBossKills += p.stats_tracker?.bossesKilled || 0;
      totalPvpWins += p.pvpWins || 0;

      // Gathering
      totalFish   += p.stats_tracker?.fishCount   || 0;
      totalMine   += p.stats_tracker?.mineCount   || 0;
      totalChop   += p.stats_tracker?.chopCount   || 0;
      totalForage += p.stats_tracker?.forageCount || 0;

      // Classes
      if (p.class && classCounts[p.class] !== undefined) classCounts[p.class]++;

      // Misc
      totalLocationsUnlocked += p.unlockedLocations?.length || 0;
      totalItemsInInventory  += p.inventory?.length || 0;
      totalPets += p.pets?.length || 0;

      // Activity
      if (p.lastActive) {
        const last = new Date(p.lastActive).getTime();
        if (now - last < 86400000)   activeLast24h++;
        if (now - last < 604800000)  activeLast7d++;
      }
    });

    const avgLevel = playerCount > 0 ? (totalLevel / playerCount).toFixed(1) : 0;
    const avgGold  = playerCount > 0 ? formatNumber(Math.floor(totalGold / playerCount)) : 0;
    const totalGathering = totalFish + totalMine + totalChop + totalForage;
    const kdRatio = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);

    // Maintenance status
    let maintenanceStatus = "✅ Online";
    try {
      const mData = loadMaintenance();
      if (mData.enabled) maintenanceStatus = "🛠️ Maintenance";
    } catch {}

    // Banned count
    let bannedCount = 0;
    try { bannedCount = loadBanned().length; } catch {}

    // ── System metrics ────────────────────────────────────
    const pingStart = Date.now();
    const pingMs = Date.now() - pingStart;

    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeDays    = Math.floor(uptimeSeconds / 86400);
    const uptimeHours   = Math.floor((uptimeSeconds % 86400) / 3600);
    const uptimeMins    = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeStr     = uptimeDays > 0
      ? `${uptimeDays}d ${uptimeHours}h ${uptimeMins}m`
      : uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMins}m`
        : `${uptimeMins}m`;

    const memUsage  = process.memoryUsage();
    const heapUsed  = (memUsage.heapUsed  / 1024 / 1024).toFixed(1);
    const heapTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(1);
    const rss       = (memUsage.rss       / 1024 / 1024).toFixed(1);

    const pingEmoji = pingMs < 100 ? "🟢" : pingMs < 300 ? "🟡" : "🔴";
    const memPct    = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    const memEmoji  = memPct < 60 ? "🟢" : memPct < 80 ? "🟡" : "🔴";

    return LenwyText(
      `🎮 *RPG SERVER INFO*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +

      `👥 *PLAYERS*\n` +
      `• Total: ${formatNumber(playerCount)}\n` +
      `• Active (24h): ${activeLast24h}\n` +
      `• Active (7d): ${activeLast7d}\n` +
      `• Level 1 (new): ${level1Count}\n` +
      `• Banned: ${bannedCount}\n\n` +

      `🎓 *CLASSES*\n` +
      `• ⚔️ Warrior: ${classCounts.warrior}\n` +
      `• 🧙 Mage: ${classCounts.mage}\n` +
      `• 🗡️ Rogue: ${classCounts.rogue}\n\n` +

      `⭐ *LEVELS*\n` +
      `• Average: ${avgLevel}\n` +
      `• Highest: ${maxLevel} (${topPlayer || "?"})\n\n` +

      `💰 *ECONOMY*\n` +
      `• Total Gold in Circulation: ${formatNumber(totalGold)}\n` +
      `• Total Gold Ever Earned: ${formatNumber(totalGoldEarned)}\n` +
      `• Average Gold per Player: ${avgGold}\n\n` +

      `⚔️ *COMBAT*\n` +
      `• Total Kills: ${formatNumber(totalKills)}\n` +
      `• Total Deaths: ${formatNumber(totalDeaths)}\n` +
      `• K/D Ratio: ${kdRatio}\n` +
      `• Boss Kills: ${formatNumber(totalBossKills)}\n` +
      `• PvP Wins: ${formatNumber(totalPvpWins)}\n\n` +

      `🌿 *GATHERING*\n` +
      `• Total Actions: ${formatNumber(totalGathering)}\n` +
      `• 🎣 Fish: ${formatNumber(totalFish)}\n` +
      `• ⛏️ Mine: ${formatNumber(totalMine)}\n` +
      `• 🪓 Chop: ${formatNumber(totalChop)}\n` +
      `• 🌿 Forage: ${formatNumber(totalForage)}\n\n` +

      `🌍 *WORLD*\n` +
      `• Total Locations Unlocked: ${formatNumber(totalLocationsUnlocked)}\n` +
      `• Avg Locations per Player: ${playerCount > 0 ? (totalLocationsUnlocked / playerCount).toFixed(1) : 0}\n\n` +

      `🎒 *ITEMS & PETS*\n` +
      `• Total Items in Inventories: ${formatNumber(totalItemsInInventory)}\n` +
      `• Total Pets Owned: ${formatNumber(totalPets)}\n\n` +

      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🖥️ *SYSTEM*\n` +
      `• Status: ${maintenanceStatus}\n` +
      `• Ping: ${pingEmoji} ${pingMs}ms\n` +
      `• Uptime: ⏱️ ${uptimeStr}\n` +
      `• Memory: ${memEmoji} ${heapUsed}MB / ${heapTotal}MB (${memPct}%)\n` +
      `• RSS: ${rss}MB\n` +
      `• Node.js: ${process.version}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !teleport @user <location>
  // ════════════════════════════════════════════════════════
  if (command === "teleport") {
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Please mention a user or provide a player name!*\n\nUsage: *!teleport @user/<name> <location>*");
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const locationId = restArgs[0];
    if (!locationId) {
      return LenwyText("⚠️ *Please specify a location!*\n\nUsage: *!teleport @user/<name> <location>*");
    }

    const location = getLocationById(locationId);
    if (!location) {
      return LenwyText(`⚠️ *Location "${locationId}" not found!*`);
    }

    player.currentLocation = locationId;
    if (!player.unlockedLocations.includes(locationId)) {
      player.unlockedLocations.push(locationId);
    }

    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Player teleported!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `📍 Location: ${location.emoji} ${location.name}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !maintenance <on/off>
  // ════════════════════════════════════════════════════════
  if (command === "maintenance") {
    const mode = q.trim().toLowerCase();
    
    if (mode !== "on" && mode !== "off") {
      return LenwyText("⚠️ *Invalid mode!*\n\nUsage: *!maintenance <on/off>*");
    }

    const maintenance = loadMaintenance();
    const isEnabling = mode === "on";

    if (isEnabling && maintenance.enabled) {
      return LenwyText("⚠️ *Maintenance mode is already enabled!*");
    }

    if (!isEnabling && !maintenance.enabled) {
      return LenwyText("⚠️ *Maintenance mode is already disabled!*");
    }

    maintenance.enabled = isEnabling;
    maintenance.startTime = isEnabling ? new Date().toISOString() : null;
    saveMaintenance(maintenance);

    try {
      // Get all participants from the broadcast group
      const groupMetadata = await lenwy.groupMetadata(BROADCAST_GROUP);
      const participants = groupMetadata.participants.map(p => p.id);

      let announcement;
      if (isEnabling) {
        announcement = 
          `🛠️ *MAINTENANCE MODE ACTIVATED*\n\n` +
          `⚠️ The bot will be temporarily unavailable for maintenance.\n\n` +
          `📋 *What's happening:*\n` +
          `• Bot commands may not respond\n` +
          `• Updates and improvements in progress\n` +
          `• Your data is safe and secure\n\n` +
          `⏰ *Expected Duration:* TBA\n\n` +
          `💡 We'll notify you when the bot is back online!\n\n` +
          `_Thank you for your patience!_\n` +
          `_— Evarick RPG Team_`;
      } else {
        announcement = 
          `✅ *MAINTENANCE COMPLETED*\n\n` +
          `🎉 The bot is now back online and ready to use!\n\n` +
          `✨ *What's new:*\n` +
          `• All systems operational\n` +
          `• Performance improvements\n` +
          `• Bug fixes applied\n\n` +
          `🎮 You can now continue your adventure!\n\n` +
          `_Thank you for your patience!_\n` +
          `_— Evarick RPG Team_`;
      }

      await lenwy.sendMessage(BROADCAST_GROUP, {
        text: announcement,
        mentions: participants
      });

      return LenwyText(
        `✅ *Maintenance mode ${isEnabling ? 'enabled' : 'disabled'}!*\n\n` +
        `📢 Announcement sent to official group\n` +
        `👥 ${participants.length} members notified`
      );
    } catch (error) {
      return LenwyText(
        `⚠️ *Maintenance mode ${isEnabling ? 'enabled' : 'disabled'}!*\n\n` +
        `❌ Failed to send announcement: ${error.message}`
      );
    }
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !setname <oldname> to <newname>
  // ════════════════════════════════════════════════════════
  if (command === "setname") {
    if (!q.includes(" to ")) {
      return LenwyText("⚠️ *Invalid format!*\n\nUsage: *!setname <oldname> to <newname>*\n\nExample: *!setname John to Johnny*");
    }

    const [oldName, newName] = q.split(" to ").map(s => s.trim());

    if (!oldName || !newName) {
      return LenwyText("⚠️ *Please provide both old and new names!*\n\nUsage: *!setname <oldname> to <newname>*");
    }

    // Find player by name
    let targetJid = null;
    for (const [jid, player] of Object.entries(players)) {
      if (player.name && player.name.toLowerCase() === oldName.toLowerCase()) {
        targetJid = jid;
        break;
      }
    }

    if (!targetJid) {
      return LenwyText(`⚠️ *Player "${oldName}" not found!*\n\nMake sure the name is spelled correctly.`);
    }

    const player = players[targetJid];

    // Validate new name
    const validation = validateName(newName);
    if (!validation.valid) {
      return LenwyText(getValidationError(validation, "en"));
    }

    // Check if new name is already taken
    const nameTaken = Object.values(players).some(
      (p) => p.name && p.name.toLowerCase() === newName.toLowerCase() && p.name.toLowerCase() !== oldName.toLowerCase()
    );

    if (nameTaken) {
      return LenwyText(`⚠️ *Name "${newName}" is already taken!*\n\nPlease choose a different name.`);
    }

    // Update name
    const actualOldName = player.name;
    player.name = newName;
    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Player name changed!*\n\n` +
      `👤 Old Name: ${actualOldName}\n` +
      `✨ New Name: ${newName}\n` +
      `📱 JID: ${targetJid.split("@")[0]}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !addadmin @user
  // ════════════════════════════════════════════════════════
  if (command === "addadmin") {
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Usage:* !addadmin @player/<name>");
    }

    const admins = loadAdmins();
    if (admins.includes(targetJid)) {
      return LenwyText(`⚠️ *${player?.name || targetJid.split("@")[0]} is already an admin!*`);
    }

    admins.push(targetJid);
    saveAdmins(admins);

    // Notify the new admin
    try {
      await lenwy.sendMessage(targetJid, {
        text: `👮 *You have been granted Admin access!*\n\nType *!adminmenu* to see your available commands.`
      });
    } catch (err) {}

    return LenwyText(
      `✅ *Admin added!*\n\n` +
      `👤 Player: ${player?.name || targetJid.split("@")[0]}\n` +
      `👮 They can now use admin commands.\n` +
      `📋 Total admins: ${admins.length}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !removeadmin @user
  // ════════════════════════════════════════════════════════
  if (command === "removeadmin") {
    const { jid: targetJid, player, notFound } = resolveTarget(players, msg, q.trim().split(" "));
    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText("⚠️ *Usage:* !removeadmin @player/<name>");
    }

    let admins = loadAdmins();
    if (!admins.includes(targetJid)) {
      return LenwyText(`⚠️ *${player?.name || targetJid.split("@")[0]} is not an admin!*`);
    }

    admins = admins.filter(jid => jid !== targetJid);
    saveAdmins(admins);

    return LenwyText(
      `✅ *Admin removed!*\n\n` +
      `👤 Player: ${player?.name || targetJid.split("@")[0]}\n` +
      `🚫 Admin access revoked.\n` +
      `📋 Total admins: ${admins.length}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !adminlist
  // ════════════════════════════════════════════════════════
  if (command === "adminlist") {
    const admins = loadAdmins();

    if (admins.length === 0) {
      return LenwyText(`👮 *Admin List*\n\nNo admins yet.\nUse *!addadmin @player* to add one.`);
    }

    let msg2 = `👮 *Admin List* (${admins.length})\n\n`;
    admins.forEach((jid, i) => {
      const p = players[jid];
      const name = p ? p.name : jid.split("@")[0];
      msg2 += `${i + 1}. ${name}\n`;
    });

    return LenwyText(msg2);
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !givetitle @user <title_id>
  // ════════════════════════════════════════════════════════
  if (command === "givetitle") {
    const args = q.trim().split(" ");
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, args);

    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText(
        `⚠️ *Usage:* !givetitle @player/<name> <title_id>\n\n` +
        `Example: *!givetitle @Evarick chosen_one*`
      );
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const titleInput = restArgs.join("_").toLowerCase();
    if (!titleInput) {
      return LenwyText(`⚠️ *Please specify a title ID!*\n\nExample: *!givetitle @player chosen_one*`);
    }

    const titleData = getTitleById(titleInput) || getTitleByName(restArgs.join(" "));
    if (!titleData) {
      return LenwyText(`⚠️ *Title "${titleInput}" not found!*\n\nCheck the title ID and try again.`);
    }

    if (!player.unlockedTitles) player.unlockedTitles = ["newcomer"];

    if (player.unlockedTitles.includes(titleData.id)) {
      return LenwyText(`⚠️ *${player.name} already has the title "${titleData.display}"!*`);
    }

    player.unlockedTitles.push(titleData.id);
    players[targetJid] = player;
    savePlayers(players);

    // Notify the player
    try {
      await lenwy.sendMessage(targetJid, {
        text:
          `🎉 *New Title Unlocked!*\n\n` +
          `${titleData.display}\n` +
          `_"${titleData.description}"_\n\n` +
          `This title was granted by the bot owner.\n` +
          `Use *!equiptitle ${titleData.name}* to equip it!`
      });
    } catch (err) {
      console.log("[GIVETITLE] Could not notify player:", err.message);
    }

    return LenwyText(
      `✅ *Title given!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `🏅 Title: ${titleData.display}\n` +
      `📋 Total titles: ${player.unlockedTitles.length}`
    );
  }

  // ════════════════════════════════════════════════════════
  // COMMAND: !removetitle @user <title_id>
  // ════════════════════════════════════════════════════════
  if (command === "removetitle") {
    const args = q.trim().split(" ");
    const { jid: targetJid, player, restArgs, notFound } = resolveTarget(players, msg, args);

    if (!targetJid) {
      if (notFound) return LenwyText(`⚠️ *Player "${notFound}" not found!*`);
      return LenwyText(
        `⚠️ *Usage:* !removetitle @player/<name> <title_id>\n\n` +
        `Example: *!removetitle @Evarick chosen_one*`
      );
    }
    if (!player) {
      return LenwyText("⚠️ *That user is not registered in the RPG system.*");
    }

    const titleInput = restArgs.join("_").toLowerCase();
    if (!titleInput) {
      return LenwyText(`⚠️ *Please specify a title ID!*\n\nExample: *!removetitle @player chosen_one*`);
    }

    const titleData = getTitleById(titleInput) || getTitleByName(restArgs.join(" "));
    if (!titleData) {
      return LenwyText(`⚠️ *Title "${titleInput}" not found!*`);
    }

    if (titleData.id === "newcomer") {
      return LenwyText(`⚠️ *Cannot remove the default "Newcomer" title.*`);
    }

    if (!player.unlockedTitles) player.unlockedTitles = ["newcomer"];

    if (!player.unlockedTitles.includes(titleData.id)) {
      return LenwyText(`⚠️ *${player.name} doesn't have the title "${titleData.display}"!*`);
    }

    player.unlockedTitles = player.unlockedTitles.filter(t => t !== titleData.id);

    // If this was their active title, revert to Newcomer
    if (player.title === titleData.display) {
      player.title = "🌟 Newcomer";
    }

    players[targetJid] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Title removed!*\n\n` +
      `👤 Player: ${player.name}\n` +
      `🗑️ Removed: ${titleData.display}\n` +
      `📋 Remaining titles: ${player.unlockedTitles.length}`
    );
  }
}