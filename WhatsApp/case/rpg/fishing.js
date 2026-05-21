// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : fish
  Base : Lenwy SCM — RPG Extension

  New Flow (no spam):
  1. Player types !fish
  2. Bot sends "Casting line... wait for the bite!"
  3. After 5-15 seconds → bot sends "Something's biting! Type reel!"
  4. Player has 10 seconds to type "reel"
  5. Bot sends result — caught or escaped
  6. Rod durability reduced on catch

  Rarity affects wait time:
  - Common/Junk: 5-10s wait
  - Uncommon: 8-15s wait
  - Rare: 10-20s wait
  - Epic/Legendary: 15-25s wait
*/

import fs from "fs";
import path from "path";
import { canDoAction } from "../../database/rpg/locations.js";
import { rollFish, fishRarityConfig, fishingRods, getFishByLocation } from "../../database/rpg/fish.js";
import { fishingSessions } from "../../database/rpg/sessionManager.js";
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
  } catch {
    return {};
  }
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

function getEquippedRod(player) {
  const rodIds = ["crystal_rod", "golden_rod", "iron_rod", "basic_rod"];
  for (const rodId of rodIds) {
    const tool = player.inventory.find((i) => i.id === rodId);
    if (tool) {
      if (tool.durability === undefined) {
        const rod = fishingRods[rodId];
        if (rod) tool.durability = rod.maxDurability;
      }
      if (tool.durability > 0) return { id: rodId, tool };
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

// Pre-roll fish based on location + luck + rod
function preRollFish(locationId, luck, rodId = "basic_rod") {
  const rod = fishingRods[rodId] || fishingRods.basic_rod;
  const available = getFishByLocation(locationId);
  if (!available || available.length === 0) return null;

  const pool = available.map((fish) => {
    let chance = fish.baseChance;
    const luckBonus = Math.min(luck * 0.1, fish.maxLuckBonus);
    let rodBonus = 0;
    if (fish.rarity === "Rare")      rodBonus = rod.rareBonus      || 0;
    if (fish.rarity === "Epic")      rodBonus = rod.epicBonus      || 0;
    if (fish.rarity === "Legendary") rodBonus = rod.legendaryBonus || 0;

    if (fish.rarity === "Legendary") chance = Math.min(chance + luckBonus + rodBonus, 1);
    else if (fish.rarity === "Epic") chance = Math.min(chance + luckBonus + rodBonus, 10);
    else chance = chance + luckBonus + rodBonus;

    return { fish, chance };
  });

  const totalWeight = pool.reduce((sum, p) => sum + p.chance, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of pool) {
    roll -= entry.chance;
    if (roll <= 0) return entry.fish;
  }
  return pool[0].fish;
}

// Wait time based on rarity (rarer = longer wait, more suspense)
function getBiteWaitTime(rarity) {
  const ranges = {
    "Junk":      [3000,  8000],
    "Common":    [5000, 10000],
    "Uncommon":  [8000, 15000],
    "Rare":      [10000, 20000],
    "Epic":      [15000, 25000],
    "Legendary": [15000, 25000],
  };
  const [min, max] = ranges[rarity] || [5000, 12000];
  return Math.floor(Math.random() * (max - min)) + min;
}

// Reel window — how long player has to type "reel" (rarer = shorter window)
function getReelWindow(rarity) {
  const windows = {
    "Junk":      12000,
    "Common":    10000,
    "Uncommon":  8000,
    "Rare":      7000,
    "Epic":      6000,
    "Legendary": 5000,
  };
  return windows[rarity] || 10000;
}

// ── Start Fishing ─────────────────────────────────────────

export async function startFishing(lenwy, replyJid, playerJid, player) {
  const lang = getLanguage(getPlayerLanguage(player));

  if (!canDoAction(player.currentLocation, "fish")) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "fishing.cantFish") });
    return;
  }

  const rodData = getEquippedRod(player);
  if (!rodData) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "fishing.noRod") });
    return;
  }

  if (fishingSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "fishing.alreadyFishing") });
    return;
  }

  const { id: rodId } = rodData;
  const rod = fishingRods[rodId];

  // Save player (durability init)
  const players = loadPlayers();
  players[playerJid] = player;
  savePlayers(players);

  // Pre-roll fish
  const targetFish = preRollFish(player.currentLocation, player.stats.luck, rodId);
  if (!targetFish) {
    await lenwy.sendMessage(replyJid, { text: getText(lang, "fishing.nothingCaught") });
    return;
  }

  const rarityInfo = fishRarityConfig[targetFish.rarity];
  const waitTime   = getBiteWaitTime(targetFish.rarity);
  const reelWindow = getReelWindow(targetFish.rarity);

  // Send casting message
  const isId = lang.code === "id";
  await lenwy.sendMessage(replyJid, {
    text: isId
      ? `🎣 *${player.name} melempar ${rod.name}...*\nMenunggu gigitan... 🌊`
      : `🎣 *${player.name} casts ${rod.name}...*\nWaiting for a bite... 🌊`,
  });

  const session = {
    playerJid,
    replyJid,
    rodId,
    targetFish,
    phase: "waiting",   // waiting → biting → done
    biteTimeout: null,
    expireTimeout: null,
  };

  fishingSessions.set(playerJid, session);

  // After wait — fish bites
  session.biteTimeout = setTimeout(async () => {
    if (!fishingSessions.has(playerJid)) return;

    session.phase = "biting";

    const reelWindowSecs = Math.round(reelWindow / 1000);
    const rarityEmoji = rarityInfo?.color || "🐟";

    // Send bite alert with button
    try {
      const biteMsg = {
        text: isId
          ? `${rarityEmoji} *Sesuatu menggigit!*\n\nKamu punya *${reelWindowSecs} detik* untuk menarik!\n\nKetik *reel* sekarang!`
          : `${rarityEmoji} *Something's biting!*\n\nYou have *${reelWindowSecs} seconds* to reel in!\n\nType *reel* now!`,
        footer: "Evarick RPG",
        buttons: [
          {
            buttonId: "reel_fish_btn",
            buttonText: { displayText: "🎣 Reel In" },
            type: 1,
          },
        ],
        headerType: 1,
      };
      await lenwy.sendMessage(replyJid, biteMsg);
    } catch {
      await lenwy.sendMessage(replyJid, {
        text: isId
          ? `${rarityEmoji} *Sesuatu menggigit!* Ketik *reel* sekarang! (${Math.round(reelWindow / 1000)}s)`
          : `${rarityEmoji} *Something's biting!* Type *reel* now! (${Math.round(reelWindow / 1000)}s)`,
      });
    }

    // Auto-expire if player doesn't reel in time
    session.expireTimeout = setTimeout(async () => {
      if (!fishingSessions.has(playerJid)) return;
      fishingSessions.delete(playerJid);

      await lenwy.sendMessage(replyJid, {
        text: isId
          ? `💨 *Terlambat!* Ikannya kabur...\n\nKetik *!fish* untuk mencoba lagi.`
          : `💨 *Too slow!* The fish got away...\n\nType *!fish* to try again.`,
      });
    }, reelWindow);

  }, waitTime);
}

// ── Handle "reel" input ───────────────────────────────────

export async function handleReel(lenwy, replyJid, playerJid) {
  const session = fishingSessions.get(playerJid);

  const playersData = loadPlayers();
  const player = playersData[playerJid];
  const lang = player ? getLanguage(getPlayerLanguage(player)) : getLanguage("id");
  const isId = lang.code === "id";

  if (!session || session.phase !== "biting") {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "fishing.noFish"),
    });
    return;
  }

  // Clear expire timeout
  clearTimeout(session.expireTimeout);
  fishingSessions.delete(playerJid);

  if (!player) return;

  const rod = fishingRods[session.rodId];
  const caught = session.targetFish;
  const rarityInfo = fishRarityConfig[caught.rarity];

  // Reduce rod durability
  const rodBroke = reduceDurability(player, session.rodId);
  const rodTool  = player.inventory.find((i) => i.id === session.rodId);

  // Add fish to inventory
  addToInventory(player, caught.id, 1);
  player.stats_tracker.fishCount = (player.stats_tracker.fishCount || 0) + 1;

  // Remove broken rod
  if (rodBroke) {
    player.inventory = player.inventory.filter((i) => i.id !== session.rodId);
  }

  player.lastActive = new Date().toISOString();
  playersData[playerJid] = player;
  savePlayers(playersData);

  // Track quest + titles
  trackGathering(playerJid, 1);
  const newTitles = checkAndAwardTitles(player);
  playersData[playerJid] = player;
  savePlayers(playersData);
  const titleMsg = formatTitleUnlockMessage(newTitles);

  // Durability line
  let durabilityMsg = "";
  if (rodBroke) {
    durabilityMsg = "\n\n" + getText(lang, "fishing.rodBroke", { rod: rod.name });
  } else if (rodTool) {
    const bar = getDurabilityBar(rodTool.durability, rod.maxDurability);
    durabilityMsg = "\n" + getText(lang, "fishing.rodDurabilityFooter", { bar });
  }

  // Result message
  await lenwy.sendMessage(replyJid, {
    text:
      `🎣 *${isId ? "Berhasil!" : "Got one!"}*\n\n` +
      `${getText(lang, "fishing.catchLine", {
        color: rarityInfo.color,
        rarity: caught.rarity,
        name: caught.name,
      })}\n` +
      `${getText(lang, "mining.oreDescLine", { desc: caught.description })}\n` +
      `${getText(lang, "fishing.sellValue", { price: caught.sellPrice })}\n\n` +
      `${getText(lang, "fishing.addedInventory")}` +
      durabilityMsg +
      `\n\n${getText(lang, "fishing.castAgain")}` +
      titleMsg,
  });
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Fishing",
  menu: ["fish"],
  case: ["fish", "mancing", "pancing"],
  description: "Cast your fishing rod and catch fish.",
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
    const lang = getLanguage("id");
    return LenwyText(getText(lang, "gold.notRegistered"));
  }

  await startFishing(lenwy, replyJid, normalizedSender, player);
}
