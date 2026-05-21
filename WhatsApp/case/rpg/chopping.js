// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : chop
  Base : Lenwy SCM — RPG Extension

  New Flow (swing counter, no spam):
  1. Player types !chop
  2. Bot sends "🪓 Found a tree! Needs X swings. Type swing!"
  3. Player types "swing" → bot sends "1/X ✅ Keep going!"
  4. Repeat until X swings done
  5. Bot sends result — wood dropped

  Each swing = one new message (no delete spam)
  Rarer wood = more swings needed
  10 second timeout between swings or session expires
*/

import fs from "fs";
import path from "path";
import { canDoAction } from "../../database/rpg/locations.js";
import { rollWood, woodRarityConfig, axes, woods } from "../../database/rpg/woods.js";
import { choppingSessions } from "../../database/rpg/sessionManager.js";
import { trackGathering } from "../../database/rpg/questTracker.js";
import { checkAndAwardTitles, formatTitleUnlockMessage } from "../../database/rpg/titles.js";
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

function getEquippedAxe(player) {
  const ids = ["diamond_axe", "golden_axe", "iron_axe", "wooden_axe", "basic_axe"];
  for (const id of ids) {
    const tool = player.inventory.find((i) => i.id === id);
    if (tool) {
      if (tool.durability === undefined) tool.durability = axes[id]?.maxDurability || 50;
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

// Swings needed based on rarity
function getRequiredSwings(rarity) {
  const map = {
    "Common":    2,
    "Uncommon":  3,
    "Rare":      4,
    "Epic":      5,
    "Legendary": 6,
  };
  return map[rarity] || 2;
}

// Progress bar for swings
function buildSwingBar(current, total) {
  const done = "🪓".repeat(current);
  const left = "⬜".repeat(total - current);
  return `${done}${left} ${current}/${total}`;
}

// ── Start Chopping ────────────────────────────────────────

export async function startChopping(lenwy, replyJid, playerJid, player) {
  const lang = getLanguage(getPlayerLanguage(player));
  const isId = lang.code === "id";

  if (!canDoAction(player.currentLocation, "chop")) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "chopping.cantChop") });
    return;
  }

  const axeData = getEquippedAxe(player);
  if (!axeData) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "chopping.noAxe") });
    return;
  }

  if (choppingSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "chopping.alreadyChopping") });
    return;
  }

  const { id: axeId } = axeData;
  const axe = axes[axeId];

  // Save player (durability init)
  const players = loadPlayers();
  players[playerJid] = player;
  savePlayers(players);

  // Roll wood
  const targetWood = rollWood(player.currentLocation, player.stats.luck, axeId);
  if (!targetWood) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "chopping.noTrees") });
    return;
  }

  const requiredSwings = getRequiredSwings(targetWood.rarity);
  const rarityInfo = woodRarityConfig[targetWood.rarity];

  const session = {
    playerJid,
    replyJid,
    locale: lang.code,
    axeId,
    targetWoodId: targetWood.id,
    swingCount: 0,
    requiredSwings,
    expireTimeout: null,
  };

  choppingSessions.set(playerJid, session);

  // Send start message with button
  try {
    const startMsg = {
      text: isId
        ? `🌲 *Pohon ditemukan!*\n\n${rarityInfo.color} *${targetWood.rarity}* — butuh *${requiredSwings} ayunan*\n\n${buildSwingBar(0, requiredSwings)}\n\n⚡ Ketik *swing* untuk menebang!`
        : `🌲 *Found a tree!*\n\n${rarityInfo.color} *${targetWood.rarity}* — needs *${requiredSwings} swings*\n\n${buildSwingBar(0, requiredSwings)}\n\n⚡ Type *swing* to chop!`,
      footer: "Evarick RPG",
      buttons: [
        { buttonId: "swing_axe_btn", buttonText: { displayText: "🪓 Swing Axe" }, type: 1 },
      ],
      headerType: 1,
    };
    await lenwy.sendMessage(replyJid, startMsg);
  } catch {
    await lenwy.sendMessage(replyJid, {
      text: isId
        ? `🌲 *Pohon ditemukan!* ${rarityInfo.color} *${targetWood.rarity}* — butuh *${requiredSwings} ayunan*\n\n${buildSwingBar(0, requiredSwings)}\n\nKetik *swing*!`
        : `🌲 *Found a tree!* ${rarityInfo.color} *${targetWood.rarity}* — needs *${requiredSwings} swings*\n\n${buildSwingBar(0, requiredSwings)}\n\nType *swing*!`,
    });
  }

  // Auto-expire after 2 minutes of inactivity
  session.expireTimeout = setTimeout(() => {
    if (choppingSessions.has(playerJid)) {
      choppingSessions.delete(playerJid);
    }
  }, 2 * 60 * 1000);
}

// ── Handle "swing" input ──────────────────────────────────

export async function handleChop(lenwy, replyJid, playerJid) {
  const session = choppingSessions.get(playerJid);
  if (!session) return false;

  // Reset expire timer on each swing
  clearTimeout(session.expireTimeout);

  const players = loadPlayers();
  const player = players[playerJid];
  if (!player) return true;

  const lang = getLanguage(getPlayerLanguage(player) || session.locale || "en");
  const isId = lang.code === "id";
  const axe = axes[session.axeId];

  // Reduce durability
  const axeBroke = reduceDurability(player, session.axeId);
  const axeTool  = player.inventory.find((i) => i.id === session.axeId);

  session.swingCount++;

  const wood = woods[session.targetWoodId];
  const rarityInfo = woodRarityConfig[wood.rarity];

  // Axe broke mid-session
  if (axeBroke) {
    choppingSessions.delete(playerJid);
    player.inventory = player.inventory.filter((i) => i.id !== session.axeId);
    player.lastActive = new Date().toISOString();
    players[playerJid] = player;
    savePlayers(players);

    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "chopping.axeBroke", { axe: axe.name }),
    });
    return true;
  }

  // Tree fell
  if (session.swingCount >= session.requiredSwings) {
    choppingSessions.delete(playerJid);

    addToInventory(player, wood.id, 1);
    player.stats_tracker.chopCount = (player.stats_tracker.chopCount || 0) + 1;
    player.lastActive = new Date().toISOString();

    players[playerJid] = player;
    savePlayers(players);

    trackGathering(playerJid, 1);
    const newTitles = checkAndAwardTitles(player);
    players[playerJid] = player;
    savePlayers(players);
    const titleMsg = formatTitleUnlockMessage(newTitles);

    let durabilityMsg = "";
    if (axeTool) {
      const bar = getDurabilityBar(axeTool.durability, axe.maxDurability);
      durabilityMsg = "\n" + getText(lang, "chopping.axeDurabilityFooter", { axe: bar });
    }

    await lenwy.sendMessage(replyJid, {
      text:
        `🌲 *${isId ? "Pohon tumbang!" : "Timber!"}*\n\n` +
        `${buildSwingBar(session.requiredSwings, session.requiredSwings)}\n\n` +
        `${getText(lang, "fishing.catchLine", {
          color: rarityInfo.color,
          rarity: wood.rarity,
          name: wood.name,
        })}\n` +
        `${getText(lang, "mining.oreDescLine", { desc: wood.description })}\n` +
        `${getText(lang, "fishing.sellValue", { price: wood.sellPrice })}\n` +
        `📦 *Collected:* 1x ${wood.name}\n\n` +
        `${getText(lang, "fishing.addedInventory")}` +
        durabilityMsg +
        `\n\n${getText(lang, "chopping.chopAgain")}` +
        titleMsg,
    });
    return true;
  }

  // Still chopping — send progress
  player.lastActive = new Date().toISOString();
  players[playerJid] = player;
  savePlayers(players);

  const remaining = session.requiredSwings - session.swingCount;
  const progressEmoji = session.swingCount === 1 ? "💪" : session.swingCount >= session.requiredSwings - 1 ? "🔥" : "✅";

  try {
    const progressMsg = {
      text: isId
        ? `${progressEmoji} *Ayunan ${session.swingCount}/${session.requiredSwings}!*\n\n${buildSwingBar(session.swingCount, session.requiredSwings)}\n\n${remaining} ayunan lagi!`
        : `${progressEmoji} *Swing ${session.swingCount}/${session.requiredSwings}!*\n\n${buildSwingBar(session.swingCount, session.requiredSwings)}\n\n${remaining} more swing${remaining > 1 ? "s" : ""}!`,
      footer: "Evarick RPG",
      buttons: [
        { buttonId: "swing_axe_btn", buttonText: { displayText: "🪓 Swing Axe" }, type: 1 },
      ],
      headerType: 1,
    };
    await lenwy.sendMessage(replyJid, progressMsg);
  } catch {
    await lenwy.sendMessage(replyJid, {
      text: isId
        ? `${progressEmoji} *Ayunan ${session.swingCount}/${session.requiredSwings}!*\n\n${buildSwingBar(session.swingCount, session.requiredSwings)}\n\nKetik *swing* lagi!`
        : `${progressEmoji} *Swing ${session.swingCount}/${session.requiredSwings}!*\n\n${buildSwingBar(session.swingCount, session.requiredSwings)}\n\nType *swing* again!`,
    });
  }

  // Reset expire timer
  session.expireTimeout = setTimeout(() => {
    if (choppingSessions.has(playerJid)) {
      choppingSessions.delete(playerJid);
    }
  }, 2 * 60 * 1000);

  return true;
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Chopping",
  menu: ["chop"],
  case: ["chop", "tebang", "kayu"],
  description: "Chop trees to gather wood.",
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

  // If active session, handle as mid-session swing
  const handled = await handleChop(lenwy, replyJid, normalizedSender);
  if (handled) return;

  // Otherwise start new session
  await startChopping(lenwy, replyJid, normalizedSender, player);
}
