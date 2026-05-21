// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : forage
  Base : Lenwy SCM — RPG Extension

  New Flow — "Odd One Out":
  1. Player types !forage
  2. Bot sends a row of emojis — 3 are the same, 1 is different (the herb)
     Rarer herb = longer row + more similar-looking emojis
  3. Bot sends 3 buttons — correct emoji + 2 decoys
  4. Player taps the odd one out
  5. Correct = herb found, Wrong = nothing

  No timer, no spam, no delete. One message + 3 buttons.
*/

import fs from "fs";
import path from "path";
import { canDoAction } from "../../database/rpg/locations.js";
import { rollHerb, herbRarityConfig, preRollHerbRarity } from "../../database/rpg/herbs.js";
import { foragingSessions } from "../../database/rpg/sessionManager.js";
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

// ── Emoji pools by difficulty ─────────────────────────────
// Easy = very different looking emojis (easy to spot odd one)
// Hard = similar looking emojis (hard to spot)

const DECOY_POOLS = {
  easy:   ["🍃", "🌾", "🌻", "🌺", "🍂", "🌼", "🌱", "🌵"],
  medium: ["🍃", "🌿", "🍀", "🌱", "🌾", "🍂"],
  hard:   ["🍃", "🌿", "🍀", "🌱", "🌾"],
  expert: ["🍃", "🌿", "🍀", "🌱"],
};

const HERB_EMOJIS = {
  Common:    "🌿",
  Uncommon:  "🍄",
  Rare:      "🌸",
  Epic:      "🌺",
  Legendary: "🌟",
};

// Row length and difficulty by rarity
const RARITY_CONFIG = {
  Common:    { rowLength: 4, pool: "easy"   },
  Uncommon:  { rowLength: 5, pool: "medium" },
  Rare:      { rowLength: 6, pool: "medium" },
  Epic:      { rowLength: 7, pool: "hard"   },
  Legendary: { rowLength: 7, pool: "expert" },
};

function buildOddOneOutRow(herbEmoji, rarity) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.Common;
  const pool = DECOY_POOLS[config.pool];
  const rowLength = config.rowLength;

  // Pick a majority emoji (not the herb)
  const majorityEmoji = pool[Math.floor(Math.random() * pool.length)];

  // Build row: (rowLength - 1) majority + 1 herb, shuffled
  const row = Array(rowLength - 1).fill(majorityEmoji);
  const herbPosition = Math.floor(Math.random() * rowLength);
  row.splice(herbPosition, 0, herbEmoji);

  return { row, majorityEmoji, herbPosition };
}

function buildButtonDecoys(herbEmoji, majorityEmoji, pool) {
  // Pick a third emoji that's different from both
  const available = pool.filter(e => e !== herbEmoji && e !== majorityEmoji);
  const decoy = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : "🍂";

  // Shuffle the 3 button options
  const options = [herbEmoji, majorityEmoji, decoy];
  options.sort(() => Math.random() - 0.5);
  return options;
}

// ── Start Foraging ────────────────────────────────────────

export async function startForaging(lenwy, replyJid, playerJid, player) {
  const lang = getLanguage(getPlayerLanguage(player));
  const isId = lang.code === "id";

  if (!canDoAction(player.currentLocation, "forage")) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "foraging.cantForage") });
    return;
  }

  if (foragingSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "foraging.alreadyForaging") });
    return;
  }

  // Pre-roll herb rarity
  const targetHerb = preRollHerbRarity(player.currentLocation, player.stats.luck);
  if (!targetHerb) {
    await lenwy.sendMessage(replyJid, {
      text: isId ? "❌ Tidak ada tanaman di area ini." : "❌ No plants found in this area.",
    });
    return;
  }

  const rarity = targetHerb.rarity;
  const rarityInfo = herbRarityConfig[rarity];
  const herbEmoji = HERB_EMOJIS[rarity] || "🌿";
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.Common;
  const pool = DECOY_POOLS[config.pool];

  // Build the odd-one-out row
  const { row, majorityEmoji } = buildOddOneOutRow(herbEmoji, rarity);
  const rowDisplay = row.join("  ");

  // Build 3 button options
  const buttonOptions = buildButtonDecoys(herbEmoji, majorityEmoji, pool);

  // Store session
  const session = {
    playerJid,
    replyJid,
    locale: lang.code,
    targetHerb,
    herbEmoji,
    correctAnswer: `forage_odd_${herbEmoji}`,
  };

  foragingSessions.set(playerJid, session);

  // Send the puzzle + buttons
  try {
    const puzzleMsg = {
      text:
        isId
          ? `🌿 *Kamu melihat sesuatu di semak-semak...*\n\n${rowDisplay}\n\n${rarityInfo.color} *${rarity}*\n\nSatu berbeda dari yang lain. Mana yang ganjil?`
          : `🌿 *You spot something in the undergrowth...*\n\n${rowDisplay}\n\n${rarityInfo.color} *${rarity}*\n\nOne of these doesn't belong. Which is the odd one out?`,
      footer: "Evarick RPG",
      buttons: buttonOptions.map(emoji => ({
        buttonId: `forage_odd_${emoji}`,
        buttonText: { displayText: emoji },
        type: 1,
      })),
      headerType: 1,
    };
    await lenwy.sendMessage(replyJid, puzzleMsg);
  } catch {
    // Fallback — text only with instructions
    await lenwy.sendMessage(replyJid, {
      text:
        isId
          ? `🌿 *Kamu melihat sesuatu...*\n\n${rowDisplay}\n\n${rarityInfo.color} *${rarity}*\n\nKetik emoji yang ganjil!`
          : `🌿 *You spot something...*\n\n${rowDisplay}\n\n${rarityInfo.color} *${rarity}*\n\nType the odd emoji!`,
    });
  }
}

// ── Handle forage answer ──────────────────────────────────

export async function handleForageAnswer(lenwy, replyJid, playerJid, answer) {
  const session = foragingSessions.get(playerJid);
  if (!session) return false;

  // Accept both button format and text format
  if (session.phase !== "showing" && session.phase !== "answering" && session.phase !== undefined) {
    return false;
  }

  foragingSessions.delete(playerJid);

  const players = loadPlayers();
  const player = players[playerJid];
  if (!player) return true;

  const lang = getLanguage(getPlayerLanguage(player) || session.locale || "en");
  const isId = lang.code === "id";

  // Check if correct
  // Button sends "forage_odd_🌿", text sends the emoji directly
  const isCorrect =
    answer === session.correctAnswer ||
    answer.trim() === session.herbEmoji ||
    answer === `forage_odd_${session.herbEmoji}`;

  const targetHerb = session.targetHerb;
  const rarityInfo = herbRarityConfig[targetHerb.rarity];

  if (!isCorrect) {
    await lenwy.sendMessage(replyJid, {
      text:
        isId
          ? `❌ *Salah!*\n\nYang ganjil adalah ${session.herbEmoji}\n\nKetik *!forage* untuk mencoba lagi.`
          : `❌ *Wrong!*\n\nThe odd one was ${session.herbEmoji}\n\nType *!forage* to try again.`,
    });
    return true;
  }

  // Correct — roll the herb
  const caught = rollHerb(player.currentLocation, player.stats.luck, "perfect");

  if (!caught) {
    await lenwy.sendMessage(replyJid, {
      text:
        isId
          ? `✅ *Benar!* Tapi tanaman itu sudah layu...\n\nKetik *!forage* untuk mencoba lagi.`
          : `✅ *Correct!* But the plant had already wilted...\n\nType *!forage* to try again.`,
    });
    return true;
  }

  // Add to inventory
  addToInventory(player, caught.id, 1);
  player.stats_tracker.forageCount = (player.stats_tracker.forageCount || 0) + 1;
  player.lastActive = new Date().toISOString();
  players[playerJid] = player;
  savePlayers(players);

  trackGathering(playerJid, 1);
  const newTitles = checkAndAwardTitles(player);
  players[playerJid] = player;
  savePlayers(players);
  const titleMsg = formatTitleUnlockMessage(newTitles);

  const caughtRarityInfo = herbRarityConfig[caught.rarity];

  await lenwy.sendMessage(replyJid, {
    text:
      `✅ *${isId ? "Benar! Kamu menemukannya!" : "Correct! You found it!"}*\n\n` +
      `${getText(lang, "fishing.catchLine", {
        color: caughtRarityInfo.color,
        rarity: caught.rarity,
        name: caught.name,
      })}\n` +
      `${getText(lang, "mining.oreDescLine", { desc: caught.description })}\n` +
      `${getText(lang, "fishing.sellValue", { price: caught.sellPrice })}\n\n` +
      `${getText(lang, "fishing.addedInventory")}\n` +
      `${getText(lang, "foraging.forageAgain")}` +
      titleMsg,
  });

  return true;
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Foraging",
  menu: ["forage"],
  case: ["forage", "kumpul", "cari"],
  description: "Search for herbs and plants.",
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

  await startForaging(lenwy, replyJid, normalizedSender, player);
}
