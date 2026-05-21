// ============================================
// Evarick Bot — Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : name
  Base : Lenwy SCM — RPG Extension

  Change player name
  Usage: !name <new_name>
  
  Rules:
  - Name must be 3-20 characters
  - Only letters, numbers, spaces, and underscores
  - Cannot be the same as current name
  - Costs 1000 gold to change name
*/

import fs from "fs";
import path from "path";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");
const NAME_CHANGE_COST = 1000;

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

function validateName(name) {
  // Check length
  if (name.length < 3 || name.length > 20) {
    return { valid: false, reason: "length" };
  }

  // Check characters (letters, numbers, spaces, underscores only)
  const validPattern = /^[a-zA-Z0-9_ ]+$/;
  if (!validPattern.test(name)) {
    return { valid: false, reason: "characters" };
  }

  // Check if name is not just spaces
  if (name.trim().length === 0) {
    return { valid: false, reason: "empty" };
  }

  return { valid: true };
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Change Name",
  menu: ["name", "changename"],
  case: ["name", "changename", "rename", "nama", "gantinama"],
  description: "Change your character name (costs 1000 gold)",
  hidden: false,
  owner: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Handler ──────────────────────────────────────────────

export default async function handler(leni) {
  const { lenwy, normalizedSender, LenwyText, args } = leni;

  // Block bot
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const lang = getLanguage("id");
    return LenwyText(
      `⚠️ *${lang.code === "id" ? "Kamu belum terdaftar!" : "You are not registered!"}*\n\n` +
      `${lang.code === "id" ? "Ketik *!register <nama>* untuk memulai petualangan." : "Type *!register <name>* to start your adventure."}`
    );
  }

  const lang = getLanguage(getPlayerLanguage(player));

  // Check if name argument is provided
  if (args.length === 0) {
    return LenwyText(
      `📝 *${lang.code === "id" ? "GANTI NAMA" : "CHANGE NAME"}*\n\n` +
      `${lang.code === "id" ? "Nama saat ini" : "Current name"}: *${player.name}*\n\n` +
      `💰 ${lang.code === "id" ? "Biaya" : "Cost"}: ${NAME_CHANGE_COST} gold\n` +
      `💵 ${lang.code === "id" ? "Gold kamu" : "Your gold"}: ${player.gold}\n\n` +
      `${lang.code === "id" ? "Penggunaan" : "Usage"}: *!name <nama_baru>*\n` +
      `${lang.code === "id" ? "Contoh" : "Example"}: *!name Asborn*\n\n` +
      `📋 *${lang.code === "id" ? "Aturan" : "Rules"}:*\n` +
      `• ${lang.code === "id" ? "3-20 karakter" : "3-20 characters"}\n` +
      `• ${lang.code === "id" ? "Hanya huruf, angka, spasi, dan underscore" : "Only letters, numbers, spaces, and underscores"}\n` +
      `• ${lang.code === "id" ? "Biaya 1000 gold" : "Costs 1000 gold"}`
    );
  }

  const newName = args.join(" ").trim();

  // Validate new name
  const validation = validateName(newName);
  if (!validation.valid) {
    let errorMsg = "";
    if (validation.reason === "length") {
      errorMsg = lang.code === "id" 
        ? "❌ Nama harus 3-20 karakter!"
        : "❌ Name must be 3-20 characters!";
    } else if (validation.reason === "characters") {
      errorMsg = lang.code === "id"
        ? "❌ Nama hanya boleh mengandung huruf, angka, spasi, dan underscore (_)!"
        : "❌ Name can only contain letters, numbers, spaces, and underscores (_)!";
    } else if (validation.reason === "empty") {
      errorMsg = lang.code === "id"
        ? "❌ Nama tidak boleh kosong!"
        : "❌ Name cannot be empty!";
    }
    return LenwyText(errorMsg);
  }

  // Check if name is the same as current
  if (newName.toLowerCase() === player.name.toLowerCase()) {
    return LenwyText(
      lang.code === "id"
        ? `❌ *Nama baru tidak boleh sama dengan nama lama!*\n\nNama kamu saat ini: *${player.name}*`
        : `❌ *New name cannot be the same as your current name!*\n\nYour current name: *${player.name}*`
    );
  }

  // Check if player has enough gold
  if (player.gold < NAME_CHANGE_COST) {
    return LenwyText(
      `❌ *${lang.code === "id" ? "Gold tidak cukup!" : "Not enough gold!"}*\n\n` +
      `${lang.code === "id" ? "Biaya" : "Cost"}: ${NAME_CHANGE_COST} gold\n` +
      `${lang.code === "id" ? "Gold kamu" : "Your gold"}: ${player.gold}\n` +
      `${lang.code === "id" ? "Kurang" : "Need"}: ${NAME_CHANGE_COST - player.gold} gold`
    );
  }

  // Save old name for confirmation message
  const oldName = player.name;

  // Change name and deduct gold
  player.name = newName;
  player.gold -= NAME_CHANGE_COST;
  player.lastActive = new Date().toISOString();

  players[normalizedSender] = player;
  savePlayers(players);

  return LenwyText(
    getText(lang, "changeNameCmd.success", { oldName, newName, cost: NAME_CHANGE_COST, gold: player.gold })
  );
}
