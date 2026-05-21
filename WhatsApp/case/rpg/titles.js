// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Commands : !titles, !equiptitle, !unequiptitle
  Base : Lenwy SCM — RPG Extension

  !titles              → show all unlocked titles with equipped marker
  !equiptitle <name>   → equip a title from your unlocked list
  !unequiptitle        → remove active title (revert to Newcomer)
*/

import fs from "fs";
import path from "path";
import { titles, getTitleByName, getTitleById } from "../../database/rpg/titles.js";
import { getLanguage, getPlayerLanguage } from "../../database/rpg/languages.js";

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

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Titles",
  menu: ["titles"],
  case: ["titles", "title", "equiptitle", "unequiptitle", "gelar"],
  description: "View and manage your unlocked titles.",
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
  const { command, q, lenwy, normalizedSender, LenwyText } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    return LenwyText(
      `⚠️ *You are not registered yet!*\n\nType *!register <name>* to start your adventure.`
    );
  }

  // Ensure defaults
  if (!player.unlockedTitles) player.unlockedTitles = ["newcomer"];
  if (!player.title) player.title = "🌟 Newcomer";

  // ════════════════════════════════════════
  // !titles — show all unlocked titles
  // ════════════════════════════════════════
  if (command === "titles" || command === "title" || command === "gelar") {
    const unlocked = player.unlockedTitles;

    if (unlocked.length === 0) {
      return LenwyText(
        `🏅 *Your Titles*\n\n` +
        `You haven't unlocked any titles yet.\n\n` +
        `Complete quests, hunt monsters, gather resources, and explore to earn titles!`
      );
    }

    // Group by source category
    const groups = {
      "🌱 Starter":       [],
      "⚔️ Combat":        [],
      "🌍 Exploration":   [],
      "🌿 Gathering":     [],
      "⚗️ Crafting":      [],
      "🤝 PvP":           [],
      "😇 Reputation":    [],
      "💰 Wealth":        [],
      "🐾 Pets":          [],
      "📜 Quests":        [],
      "👑 Special":       [],
    };

    const categoryMap = {
      newcomer: "🌱 Starter",
      adventurer: "🌱 Starter",
      veteran: "🌱 Starter",
      champion: "🌱 Starter",
      monster_slayer: "⚔️ Combat",
      executioner: "⚔️ Combat",
      warlord: "⚔️ Combat",
      unstoppable: "⚔️ Combat",
      daredevil: "⚔️ Combat",
      boss_killer: "⚔️ Combat",
      boss_hunter: "⚔️ Combat",
      wanderer: "🌍 Exploration",
      explorer: "🌍 Exploration",
      world_traveler: "🌍 Exploration",
      lumberjack: "🌿 Gathering",
      miner: "🌿 Gathering",
      fisherman: "🌿 Gathering",
      forager: "🌿 Gathering",
      gatherer: "🌿 Gathering",
      master_gatherer: "🌿 Gathering",
      crafter: "⚗️ Crafting",
      enchanter: "⚗️ Crafting",
      master_enchanter: "⚗️ Crafting",
      fighter: "🤝 PvP",
      arena_champion: "🤝 PvP",
      pvp_legend: "🤝 PvP",
      saint: "😇 Reputation",
      hero: "😇 Reputation",
      rogue_title: "😇 Reputation",
      demon_lord: "😇 Reputation",
      gold_hoarder: "💰 Wealth",
      millionaire: "💰 Wealth",
      pet_tamer: "🐾 Pets",
      dragon_tamer: "🐾 Pets",
      quest_seeker: "📜 Quests",
      quest_master: "📜 Quests",
      chosen_one: "👑 Special",
      shadow_walker: "👑 Special",
      legend: "👑 Special",
      mythic: "👑 Special",
      the_fw: "👑 Special",
      owner: "👑 Special",
      admin: "👑 Special",
      the_king: "👑 Special",
      the_goat: "👑 Special",
      elite: "👑 Special",
      veteran_player: "👑 Special",
      og: "👑 Special",
      reaper: "👑 Special",
      dark_lord: "👑 Special",
      death_bringer: "👑 Special",
      blood_knight: "👑 Special",
      the_watcher: "👑 Special",
      void_walker: "👑 Special",
      thunder_god: "👑 Special",
      dragon_king: "👑 Special",
      moonchaser: "👑 Special",
      fallen_star: "👑 Special",
      the_clown: "👑 Special",
      slow_poke: "👑 Special",
      broke: "👑 Special",
      lucky_guy: "👑 Special",
      the_rock: "👑 Special",
      the_helper: "👑 Special",
      announcer: "👑 Special",
      party_leader: "👑 Special",
      most_valuable: "👑 Special",
      the_diplomat: "👑 Special",
    };

    for (const titleId of unlocked) {
      const titleData = getTitleById(titleId);
      if (!titleData) continue;
      const group = categoryMap[titleId] || "👑 Special";
      groups[group].push(titleData);
    }

    // Build message
    let msg = `🏅 *Your Titles* (${unlocked.length})\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📌 *Equipped:* ${player.title}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const [groupName, groupTitles] of Object.entries(groups)) {
      if (groupTitles.length === 0) continue;
      msg += `*${groupName}*\n`;
      for (const t of groupTitles) {
        const isEquipped = player.title === t.display;
        const marker = isEquipped ? " ✅" : "";
        msg += `• ${t.display}${marker}\n`;
      }
      msg += `\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💡 *!equiptitle <name>* to equip\n`;
    msg += `💡 *!unequiptitle* to remove`;

    return LenwyText(msg);
  }

  // ════════════════════════════════════════
  // !equiptitle <name>
  // ════════════════════════════════════════
  if (command === "equiptitle") {
    if (!q.trim()) {
      return LenwyText(
        `🏅 *Equip Title*\n\n` +
        `Usage: *!equiptitle <title name>*\n\n` +
        `Example: *!equiptitle Monster Slayer*\n\n` +
        `Type *!titles* to see your unlocked titles.`
      );
    }

    const titleData = getTitleByName(q.trim());

    if (!titleData) {
      return LenwyText(
        `❌ *Title "${q.trim()}" not found.*\n\n` +
        `Type *!titles* to see your available titles.`
      );
    }

    if (!player.unlockedTitles.includes(titleData.id)) {
      return LenwyText(
        `❌ *You haven't unlocked "${titleData.display}" yet.*\n\n` +
        `${titleData.description}\n\n` +
        `Type *!titles* to see your unlocked titles.`
      );
    }

    if (player.title === titleData.display) {
      return LenwyText(`✅ *${titleData.display}* is already your active title!`);
    }

    player.title = titleData.display;
    player.lastActive = new Date().toISOString();
    players[normalizedSender] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Title equipped!*\n\n` +
      `${titleData.display}\n` +
      `_"${titleData.description}"_\n\n` +
      `Your title is now visible on your profile.`
    );
  }

  // ════════════════════════════════════════
  // !unequiptitle
  // ════════════════════════════════════════
  if (command === "unequiptitle") {
    const defaultTitle = "🌟 Newcomer";

    if (player.title === defaultTitle) {
      return LenwyText(`ℹ️ You are already using the default title *${defaultTitle}*.`);
    }

    const old = player.title;
    player.title = defaultTitle;
    player.lastActive = new Date().toISOString();
    players[normalizedSender] = player;
    savePlayers(players);

    return LenwyText(
      `✅ *Title removed.*\n\n` +
      `Reverted from *${old}* to *${defaultTitle}*.\n\n` +
      `Type *!equiptitle <name>* to equip another title.`
    );
  }
}
