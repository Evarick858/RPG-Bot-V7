// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : mine
  Base : Lenwy SCM — RPG Extension

  New Flow (reaction game, no spam):
  1. Player types !mine
  2. Bot sends "⛏️ The rock is glowing... wait for the signal!"
  3. After 3-8 seconds → bot sends "💥 NOW! Type hit!"
  4. Player has 4 seconds to type "hit"
  5. If hit in time → perfect strike → better ore chance
  6. If missed window → weak strike → still get ore, lower rarity
  7. If no response → miss → nothing

  Rarer ore = shorter reaction window
*/

import fs from "fs";
import path from "path";
import { canDoAction } from "../../database/rpg/locations.js";
import { rollOre, oreRarityConfig, pickaxes, ores } from "../../database/rpg/ores.js";
import { trackGathering } from "../../database/rpg/questTracker.js";
import { checkAndAwardTitles, formatTitleUnlockMessage } from "../../database/rpg/titles.js";
import { miningSessions } from "../../database/rpg/sessionManager.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

// ── Helpers ──────────────────────────────────────────────

function loadPlayers() {
  try {
    const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
    const players = { ...data };
    delete players._comment;
    delete players._template;
    return players;
  } catch { return {}; }
}

function savePlayers(players) {
  const raw = fs.readFileSync(playersPath, "utf8");
  const data = JSON.parse(raw);
  const updated = { _comment: data._comment, _template: data._template, ...players };
  fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), "utf8");
}

function addToInventory(player, itemId, qty = 1) {
  const existing = player.inventory.find((i) => i.id === itemId);
  if (existing) existing.qty += qty;
  else player.inventory.push({ id: itemId, qty });
}

function getEquippedPickaxe(player) {
  const ids = ["diamond_pickaxe", "gold_pickaxe", "iron_pickaxe", "wooden_pickaxe", "basic_pickaxe"];
  for (const id of ids) {
    const tool = player.inventory.find((i) => i.id === id);
    if (tool) {
      if (tool.durability === undefined) tool.durability = pickaxes[id]?.maxDurability || 50;
      if (tool.durability > 0) return { id, tool };
    }
  }
  return null;
}

function getDurabilityBar(current, max) {
  const pct = (current / max) * 100;
  const filled = Math.round((current / max) * 10);
  const empty = 10 - filled;
  const color = pct <= 25 ? "🔴" : pct <= 50 ? "🟡" : "🟢";
  return `${color} [${"■".repeat(filled)}${"□".repeat(empty)}] ${current}/${max}`;
}

function reduceDurability(player, toolId) {
  const tool = player.inventory.find((i) => i.id === toolId);
  if (!tool) return false;
  tool.durability = Math.max(0, tool.durability - 1);
  return tool.durability === 0;
}

// Signal window based on ore rarity (rarer = shorter window)
function getHitWindow(rarity) {
  const windows = {
    "Common":    4000,
    "Uncommon":  3500,
    "Rare":      3000,
    "Epic":      2500,
    "Legendary": 2000,
  };
  return windows[rarity] || 4000;
}

// Wait before signal (random)
function getSignalWait() {
  return Math.floor(Math.random() * 5000) + 3000; // 3-8 seconds
}

// ── Start Mining ──────────────────────────────────────────

export async function startMining(lenwy, replyJid, playerJid, player) {
  const lang = getLanguage(getPlayerLanguage(player));
  const isId = lang.code === "id";

  if (!canDoAction(player.currentLocation, "mine")) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "mining.cantMine") });
    return;
  }

  const pickaxeData = getEquippedPickaxe(player);
  if (!pickaxeData) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "mining.noPickaxe") });
    return;
  }

  if (miningSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "mining.alreadyMining") });
    return;
  }

  const { id: pickaxeId } = pickaxeData;
  const pickaxe = pickaxes[pickaxeId];

  // Save player (durability init)
  const players = loadPlayers();
  players[playerJid] = player;
  savePlayers(players);

  // Roll ore
  const targetOre = rollOre(player.currentLocation, player.stats.luck, pickaxeId);
  if (!targetOre) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "mining.noRocks") });
    return;
  }

  const hitWindow  = getHitWindow(targetOre.rarity);
  const signalWait = getSignalWait();
  const windowSecs = (hitWindow / 1000).toFixed(1);

  // Send initial message
  await lenwy.sendMessage(replyJid, {
    text: isId
      ? `⛏️ *${player.name} mulai menambang...*\n\nBatu bercahaya... tunggu sinyal!\n🪨 Bersiap...`
      : `⛏️ *${player.name} starts mining...*\n\nThe rock is glowing... wait for the signal!\n🪨 Get ready...`,
  });

  const session = {
    playerJid,
    replyJid,
    pickaxeId,
    targetOre,
    phase: "waiting",  // waiting → signal → done
    signalTimeout: null,
    expireTimeout: null,
  };

  miningSessions.set(playerJid, session);

  // After wait — send signal
  session.signalTimeout = setTimeout(async () => {
    if (!miningSessions.has(playerJid)) return;

    session.phase = "signal";

    try {
      const signalMsg = {
        text: isId
          ? `💥 *SEKARANG! Ketik hit!*\n\nKamu punya *${windowSecs} detik!*`
          : `💥 *NOW! Type hit!*\n\nYou have *${windowSecs} seconds!*`,
        footer: "Evarick RPG",
        buttons: [
          { buttonId: "hit_ore_btn", buttonText: { displayText: "⛏️ Hit Ore" }, type: 1 },
        ],
        headerType: 1,
      };
      await lenwy.sendMessage(replyJid, signalMsg);
    } catch {
      await lenwy.sendMessage(replyJid, {
        text: isId
          ? `💥 *SEKARANG! Ketik hit!* (${windowSecs}s)`
          : `💥 *NOW! Type hit!* (${windowSecs}s)`,
      });
    }

    // Expire if no hit
    session.expireTimeout = setTimeout(async () => {
      if (!miningSessions.has(playerJid)) return;
      // Mark as missed — still give weak result
      session.phase = "missed";
      await handleHit(lenwy, replyJid, playerJid);
    }, hitWindow);

  }, signalWait);
}

// ── Handle "hit" input ────────────────────────────────────

export async function handleHit(lenwy, replyJid, playerJid) {
  const session = miningSessions.get(playerJid);

  const players = loadPlayers();
  const player = players[playerJid];
  const lang = player ? getLanguage(getPlayerLanguage(player)) : getLanguage("id");
  const isId = lang.code === "id";

  if (!session || session.phase === "waiting") {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "mining.notMining") });
    return;
  }

  // Clear timers
  clearTimeout(session.signalTimeout);
  clearTimeout(session.expireTimeout);
  miningSessions.delete(playerJid);

  if (!player) return;

  const pickaxe = pickaxes[session.pickaxeId];
  const ore = ores[session.targetOre.id];
  const rarityInfo = oreRarityConfig[ore.rarity];

  const isPerfect = session.phase === "signal";  // hit during signal window
  const isMissed  = session.phase === "missed";  // timed out

  // Missed = no ore
  if (isMissed) {
    await lenwy.sendMessage(replyJid, {
      text: isId
        ? `💨 *Terlambat!* Kamu melewatkan momen yang tepat.\n\nKetik *!mine* untuk mencoba lagi.`
        : `💨 *Too slow!* You missed the perfect moment.\n\nType *!mine* to try again.`,
    });
    return;
  }

  // Reduce durability
  const pickaxeBroke = reduceDurability(player, session.pickaxeId);
  const pickaxeTool  = player.inventory.find((i) => i.id === session.pickaxeId);

  // Qty: perfect = 1-2, weak = always 1
  const qty = isPerfect && Math.random() < 0.4 ? 2 : 1;

  addToInventory(player, ore.id, qty);
  player.stats_tracker.mineCount = (player.stats_tracker.mineCount || 0) + 1;

  if (pickaxeBroke) player.inventory = player.inventory.filter((i) => i.id !== session.pickaxeId);

  player.lastActive = new Date().toISOString();
  players[playerJid] = player;
  savePlayers(players);

  trackGathering(playerJid, 1);
  const newTitles = checkAndAwardTitles(player);
  players[playerJid] = player;
  savePlayers(players);
  const titleMsg = formatTitleUnlockMessage(newTitles);

  let durabilityMsg = "";
  if (pickaxeBroke) {
    durabilityMsg = "\n\n" + getText(lang, "mining.pickaxeBrokeReward", { pickaxe: pickaxe.name });
  } else if (pickaxeTool) {
    const bar = getDurabilityBar(pickaxeTool.durability, pickaxe.maxDurability);
    durabilityMsg = "\n" + getText(lang, "mining.pickaxeDurabilityReward", { bar });
  }

  const strikeLabel = isPerfect
    ? (isId ? "⚡ *Pukulan Sempurna!*" : "⚡ *Perfect Strike!*")
    : (isId ? "✅ *Pukulan Lemah*" : "✅ *Weak Strike*");

  await lenwy.sendMessage(replyJid, {
    text:
      `${strikeLabel}\n\n` +
      `${getText(lang, "fishing.catchLine", {
        color: rarityInfo.color,
        rarity: ore.rarity,
        name: ore.name,
      })}\n` +
      `${getText(lang, "mining.oreDescLine", { desc: ore.description })}\n` +
      `${getText(lang, "fishing.sellValue", { price: ore.sellPrice })}\n` +
      `📦 *Collected:* ${qty}x ${ore.name}\n\n` +
      `${getText(lang, "fishing.addedInventory")}` +
      durabilityMsg +
      `\n\n${getText(lang, "mining.mineAgain")}` +
      titleMsg,
  });
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Mining",
  menu: ["mine"],
  case: ["mine", "tambang", "gali"],
  description: "Mine rocks to find ores and gems.",
  hidden: false,
  owner: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

export default async function handler(leni) {
  const { lenwy, replyJid, normalizedSender, LenwyText } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const langU = getLanguage("id");
    return LenwyText(getText(langU, "gold.notRegistered"));
  }

  await startMining(lenwy, replyJid, normalizedSender, player);
}
