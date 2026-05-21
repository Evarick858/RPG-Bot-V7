// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : redeemlist
  Base : Lenwy SCM — RPG Extension

  Shows all available redeem codes (Owner only)
  
  Usage: !redeemlist
*/

import fs from "fs";
import path from "path";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

// ── Redeem Codes Database (same as redeem.js) ────────────
const REDEEM_CODES = {
  "MORNINGSTAR": {
    code: "MORNINGSTAR",
    description: "Morningstar Gift Pack",
    rewards: "5000 gold + 1 random rare weapon + 1 random rare armor",
    oneTimeUse: true,
  },
  "BOSS": {
    code: "BOSS",
    description: "Boss Starter Pack",
    rewards: "5000 gold + Basic tools (pickaxe, axe, rod) + 4 rare skill books + 1 SR pet (Crystal Dragon)",
    oneTimeUse: true,
  },
  "EVARICK": {
    code: "EVARICK",
    description: "Founder's Ultimate Pack",
    rewards: "999,999 gold + Best tools + Excalibur + Godslayer armor set + All 18 skill books + Consumables + 5 pets (all rarities)",
    oneTimeUse: true,
  },
  "WELCOME": {
    code: "WELCOME",
    description: "Welcome Gift",
    rewards: "1000 gold",
    oneTimeUse: true,
  },
  "STARTER": {
    code: "STARTER",
    description: "Starter Pack",
    rewards: "500 gold",
    oneTimeUse: true,
  },
  "LUCKY": {
    code: "LUCKY",
    description: "Lucky Draw",
    rewards: "10 health potions + 10 mana potions",
    oneTimeUse: true,
  },
  "MYBAD": {
    code: "MYBAD",
    description: "Apology Gift Pack",
    rewards: "10,000 gold + Basic tools (pickaxe, axe, rod) + 1 common skill book (Magic Missile)",
    oneTimeUse: true,
  },
  "ASHURA": {
    code: "ASHURA",
    description: "Ashura's Sacred Arsenal",
    rewards: "👊 Ashura Fist + Full Ashura Armor Set (Head/Chest/Legs/Boots) — Mythic exclusive",
    oneTimeUse: true,
  },
};

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

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Redeem List",
  menu: ["redeemlist"],
  case: ["redeemlist"],
  description: "Show all available redeem codes (Owner only).",
  hidden: false,
  owner: true, // Owner only
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Handler ──────────────────────────────────────────────

export default async function handler(leni) {
  const { normalizedSender, LenwyText, lenwy, isEvarick } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  // Owner check
  if (!isEvarick) {
    return LenwyText("❌ This command is only available to the bot owner.");
  }

  const players = loadPlayers();
  const player = players[normalizedSender];

  const lang = player ? getLanguage(getPlayerLanguage(player)) : getLanguage("id");
  const prefix = globalThis.noprefix ? "" : "!";

  // Build redeem codes list
  let codesList = "🎁 *AVAILABLE REDEEM CODES*\n\n";
  codesList += "━━━━━━━━━━━━━━━━━━━━\n\n";

  let codeNumber = 1;
  for (const [codeKey, codeData] of Object.entries(REDEEM_CODES)) {
    const oneTimeTag = codeData.oneTimeUse ? "🔒 One-time use" : "♻️ Reusable";
    
    codesList += `*${codeNumber}. ${codeData.code}*\n`;
    codesList += `📝 ${codeData.description}\n`;
    codesList += `${oneTimeTag}\n`;
    codesList += `🎁 Rewards:\n`;
    codesList += `   ${codeData.rewards}\n`;
    codesList += `\n`;
    
    codeNumber++;
  }

  codesList += "━━━━━━━━━━━━━━━━━━━━\n\n";
  codesList += `💡 *Usage:* ${prefix}redeem <code>\n`;
  codesList += `📋 *Example:* ${prefix}redeem WELCOME\n\n`;
  codesList += `📊 *Total Codes:* ${Object.keys(REDEEM_CODES).length}`;

  return LenwyText(codesList);
}
