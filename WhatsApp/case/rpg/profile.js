// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : profile
  Base : Lenwy SCM — RPG Extension

  Flow:
  1. Player types "profile" or "stats" (with prefix)
  2. Bot displays comprehensive character information:
     - Name, Level, Class, Title
     - HP, Mana, XP progress
     - Base stats (Attack, Defense, Agility, Luck)
     - Equipped items with bonuses
     - Active passives (class + equipment)
     - Current location
     - Gold and inventory count
  3. Shows equipment bonuses separately from base stats
*/

import fs from "fs";
import path from "path";
import { getEquipmentStats, getArmorSetBonus, getAllPassives } from "../../database/rpg/equipmentHelper.js";
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

function buildBar(current, max, size = 10) {
  const filled = Math.round((current / max) * size);
  const empty = size - filled;
  return `[${"■".repeat(Math.max(0, filled))}${"□".repeat(Math.max(0, empty))}]`;
}

function buildProfileMessage(player) {
  // Get player language
  const lang = getLanguage(getPlayerLanguage(player));
  
  // Build full message - SIMPLIFIED VERSION
  return (
    `👤 *${player.name}*\n` +
    `🏅 ${player.title || (lang.code === "id" ? "Petualang" : "Adventurer")}\n` +
    `📍 ${player.currentLocation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\n` +
    `========================\n` +
    `🎖️ ${getText(lang, "common.level")}: ${player.level}\n` +
    `🎓 ${getText(lang, "common.class")}: ${player.class.charAt(0).toUpperCase() + player.class.slice(1)}\n` +
    `💰 ${getText(lang, "common.gold")}: ${player.gold}\n\n` +
    `========================\n` +
    `📊 *${getText(lang, "profile.stats")}*\n` +
    `⚔️ ${getText(lang, "common.attack")}: ${player.stats.attack}\n` +
    `🛡️ ${getText(lang, "common.defense")}: ${player.stats.defense}\n` +
    `⚡ ${getText(lang, "common.agility")}: ${player.stats.agility}\n` +
    `🍀 ${getText(lang, "common.luck")}: ${player.stats.luck}\n\n` +
    `========================\n` +
    `🎒 ${getText(lang, "common.inventory")}: ${player.inventory.length} ${lang.code === "id" ? "item" : "items"}\n` +
    `📊 ${lang.code === "id" ? "Poin Stat" : "Stat Points"}: ${player.statPoints || 0}\n` +
    `⚡ ${lang.code === "id" ? "Poin Skill" : "Skill Points"}: ${player.skillPoints || 0}\n\n` +
    `💡 *${getText(lang, "profile.commands")}*\n` +
    `• !status - ${lang.code === "id" ? "Lihat HP/Mana/XP" : "View HP/Mana/XP"}\n` +
    `• !equipment - ${lang.code === "id" ? "Lihat perlengkapan & pasif" : "View equipment & passives"}\n` +
    `• !bag - ${lang.code === "id" ? "Lihat inventori" : "View inventory"}\n` +
    `• !hunt - ${lang.code === "id" ? "Mulai pertarungan" : "Start battle"}`
  );
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Profile",
  menu: ["profile", "stats", "me"],
  case: ["profile", "stats", "me", "profil", "statistik", "aku"],
  description: "View your character profile, stats, and equipment.",
  hidden: false,
  owner: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Handler ───────────────────────────────────────────────

export default async function handler(leni) {
  const { lenwy, normalizedSender, LenwyText } = leni;

  // Block bot
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const lang = getLanguage("id"); // Default to Indonesian for non-registered
    return LenwyText(
      `⚠️ *${getText(lang, "common.notRegistered")}*\n\n` +
      getText(lang, "common.registerFirst")
    );
  }

  // Initialize equipment if not exists
  if (!player.equipment) {
    player.equipment = {
      weapon: { id: null, name: null, type: null, twoHanded: false, stats: {} },
      offhand: { id: null, name: null, type: null, stats: {} },
      armor: {
        head: { id: null, name: null, stats: {} },
        chest: { id: null, name: null, stats: {} },
        legs: { id: null, name: null, stats: {} },
        boots: { id: null, name: null, stats: {} },
      },
      accessory: { id: null, name: null, stats: {} },
    };
  }

  return LenwyText(buildProfileMessage(player));
}
