// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : status
  Base : Lenwy SCM — RPG Extension

  Flow:
  1. Player types "status" during combat (no prefix needed)
  2. Bot displays detailed battle status:
     - Player HP, Mana, SP (shield points)
     - Enemy HP, SP
     - Player skill cooldowns
     - Active status effects on both player and enemy
     - Current round number
  3. Works in any combat mode (hunt, pvp, raid)
  4. Does NOT consume a turn — purely informational

  This command is handled via RPG session interceptor in evarick.js
  But also available as a standalone command for testing.
*/

import fs from "fs";
import path from "path";
import { combatSessions } from "./hunt.js";
import { formatActiveEffects } from "../../database/rpg/skillEffects.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { getEquipmentStats } from "../../database/rpg/equipmentHelper.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

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

// ── Helpers ──────────────────────────────────────────────

function buildBar(current, max, size = 10) {
  const filled = Math.round((current / max) * size);
  const empty = size - filled;
  return `[${"■".repeat(Math.max(0, filled))}${"□".repeat(Math.max(0, empty))}]`;
}

function buildStatusMessage(lang, state) {
  const p = state.player;
  const e = state.enemy;

  const pHpBar = buildBar(p.hp, p.maxHp, 10);
  const eHpBar = buildBar(e.hp, e.maxHp, 10);
  const pHpPct = Math.round((p.hp / p.maxHp) * 100);
  const eHpPct = Math.round((e.hp / e.maxHp) * 100);

  const pSpBar =
    p.sp > 0 ? getText(lang, "combatStatus.shieldLine", { cur: String(p.sp), max: "1000" }) : "";
  const eSpBar =
    e.sp > 0 ? getText(lang, "combatStatus.shieldLine", { cur: String(e.sp), max: "1000" }) : "";

  const pEffects = formatActiveEffects(p);
  const eEffects = formatActiveEffects(e);
  const pEffectsText = pEffects
    ? getText(lang, "combatStatus.effectsLine", { list: pEffects })
    : "";
  const eEffectsText = eEffects
    ? getText(lang, "combatStatus.effectsLine", { list: eEffects })
    : "";

  const pStunned =
    (p.stunned || 0) > 0
      ? getText(lang, "combatStatus.stunned", { rounds: String(p.stunned) })
      : "";
  const eStunned =
    (e.stunned || 0) > 0
      ? getText(lang, "combatStatus.stunned", { rounds: String(e.stunned) })
      : "";
  const pSilenced = (p.statusEffects || []).some((ef) => ef.type === "silence")
    ? getText(lang, "combatStatus.silenced")
    : "";
  const eSilenced = (e.statusEffects || []).some((ef) => ef.type === "silence")
    ? getText(lang, "combatStatus.silenced")
    : "";

  const pStatusText =
    pStunned || pSilenced
      ? getText(lang, "combatStatus.playerStatusLine", { stunned: pStunned, silent: pSilenced })
      : "";
  const eStatusText =
    eStunned || eSilenced
      ? getText(lang, "combatStatus.playerStatusLine", { stunned: eStunned, silent: eSilenced })
      : "";

  let equipTxt = "";
  if (p._equipmentBonus) {
    const bonus = p._equipmentBonus;
    const bonuses = [];
    if (bonus.attack > 0) bonuses.push(`⚔️+${bonus.attack}`);
    if (bonus.defense > 0) bonuses.push(`🛡️+${bonus.defense}`);
    if (bonus.hp > 0) bonuses.push(`❤️+${bonus.hp}`);
    if (bonus.mana > 0) bonuses.push(`💧+${bonus.mana}`);
    if (bonuses.length > 0) {
      equipTxt = getText(lang, "combatStatus.equipLine", { bonuses: bonuses.join(" ") });
    }
  }

  let passivesTxt = "";
  if (p.allPassives && p.allPassives.length > 0) {
    const passiveNames = p.allPassives.map((pass) => `${pass.emoji}${pass.name}`).join(", ");
    passivesTxt = getText(lang, "combatStatus.passivesLine", { names: passiveNames });
  }

  let skillsBlock = "";
  (p.skills || []).forEach((s, i) => {
    const slotNum = String(i + 1);
    if (!s?.id) {
      skillsBlock += getText(lang, "combatStatus.skillEmptyRow", { i: slotNum });
      return;
    }
    const cdTxt =
      s.cooldownRemaining > 0
        ? getText(lang, "combatStatus.cooldownWait", { n: String(s.cooldownRemaining) })
        : getText(lang, "combatStatus.cooldownReady");
    const manaStr =
      s.manaCost > 0
        ? getText(lang, "combatStatus.manaCostTpl", { cost: String(s.manaCost) })
        : "";
    skillsBlock += getText(lang, "combatStatus.skillRowFmt", {
      i: slotNum,
      name: s.name,
      cdTxt,
      manaStr,
    });
  });

  const bossTag = e.isBoss ? getText(lang, "combatStatus.bossTag") : "";

  return (
    getText(lang, "combatStatus.title", { round: String(state.round) }) +
    getText(lang, "combatStatus.playerHeader", { name: p.name }) +
    getText(lang, "combatStatus.hpLineP", {
      bar: pHpBar,
      hp: String(p.hp),
      maxHp: String(p.maxHp),
      pct: String(pHpPct),
      shield: pSpBar,
    }) +
    getText(lang, "combatStatus.manaLineP", {
      mana: String(p.mana),
      maxMana: String(p.maxMana),
      equipTxt,
      passivesTxt,
      pStatusComb: pStatusText,
      pfx: pEffectsText,
    }) +
    getText(lang, "combatStatus.skillsHeader") +
    `${skillsBlock}\n` +
    getText(lang, "combatStatus.dividerMid") +
    getText(lang, "combatStatus.enemyHeader", {
      emoji: e.emoji || "👾",
      name: e.name,
      bossTag,
    }) +
    getText(lang, "combatStatus.hpLineE", {
      bar: eHpBar,
      hp: String(e.hp),
      maxHp: String(e.maxHp),
      pct: String(eHpPct),
      shield: eSpBar,
      eStatusComb: eStatusText,
      efx: eEffectsText,
    }) +
    getText(lang, "combatStatus.footer")
  );
}

// ── Handle status check ──────────────────────────────────

export async function handleStatus(lenwy, replyJid, playerJid) {
  const session = combatSessions.get(playerJid);
  const players = loadPlayers();
  const viewer = players[playerJid];
  const lang = getLanguage(viewer ? getPlayerLanguage(viewer) : "en");

  if (!viewer) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "common.notRegistered") + "\n\n" + getText(lang, "common.registerFirst"),
    });
    return;
  }

  // If in combat, show combat status
  if (session && !session.isOver) {
    const statusText = buildStatusMessage(lang, session);
    await lenwy.sendMessage(replyJid, {
      text: statusText,
    });
    return;
  }

  // If NOT in combat, show HP/Mana/XP status
  const equipStats = getEquipmentStats(viewer);
  const maxHp = viewer.stats.maxHp + (equipStats.hp || 0);
  const maxMana = viewer.stats.maxMana + (equipStats.mana || 0);
  const currentHp = Math.min(viewer.stats.hp, maxHp);
  const currentMana = Math.min(viewer.stats.mana, maxMana);

  const hpBar = buildBar(currentHp, maxHp, 10);
  const manaBar = buildBar(currentMana, maxMana, 10);
  const hpPct = Math.round((currentHp / maxHp) * 100);
  const manaPct = Math.round((currentMana / maxMana) * 100);

  // Calculate XP progress
  const currentLevel = viewer.level;
  const currentXp = viewer.xp;
  const xpForNextLevel = currentLevel * 100;
  const xpBar = buildBar(currentXp, xpForNextLevel, 10);
  const xpPct = Math.round((currentXp / xpForNextLevel) * 100);

  // Build stats with equipment bonuses
  const baseAtk = viewer.stats.attack || 0;
  const baseDef = viewer.stats.defense || 0;
  const baseAgi = viewer.stats.agility || 0;
  const baseLuck = viewer.stats.luck || 0;

  const totalAtk = baseAtk + (equipStats.attack || 0);
  const totalDef = baseDef + (equipStats.defense || 0);
  const totalAgi = baseAgi + (equipStats.agility || 0);
  const totalLuck = baseLuck + (equipStats.luck || 0);

  const atkDisplay = equipStats.attack > 0 ? `${baseAtk} (+${equipStats.attack})` : `${baseAtk}`;
  const defDisplay = equipStats.defense > 0 ? `${baseDef} (+${equipStats.defense})` : `${baseDef}`;
  const agiDisplay = equipStats.agility > 0 ? `${baseAgi} (+${equipStats.agility})` : `${baseAgi}`;
  const luckDisplay = equipStats.luck > 0 ? `${baseLuck} (+${equipStats.luck})` : `${baseLuck}`;

  let message = `📊 *${lang.code === "id" ? "Status Pemain" : "Player Status"}*\n\n`;
  message += `👤 *${viewer.name}*\n`;
  message += `🏆 ${lang.code === "id" ? "Level" : "Level"}: ${currentLevel}\n\n`;

  message += `❤️ *HP:* ${hpBar} ${currentHp}/${maxHp} (${hpPct}%)\n`;
  message += `💧 *${lang.code === "id" ? "Mana" : "Mana"}:* ${manaBar} ${currentMana}/${maxMana} (${manaPct}%)\n`;
  message += `⭐ *XP:* ${xpBar} ${currentXp}/${xpForNextLevel} (${xpPct}%)\n\n`;

  message += `📈 *${lang.code === "id" ? "Statistik" : "Stats"}:*\n`;
  message += `⚔️ ${getText(lang, "common.attack")}: ${atkDisplay}\n`;
  message += `🛡️ ${getText(lang, "common.defense")}: ${defDisplay}\n`;
  message += `⚡ ${getText(lang, "common.agility")}: ${agiDisplay}\n`;
  message += `🍀 ${getText(lang, "common.luck")}: ${luckDisplay}\n`;

  await lenwy.sendMessage(replyJid, {
    text: message,
  });
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Status",
  menu: ["status"],
  case: ["status", "kondisi"],
  description: "View detailed battle status during combat.",
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
  const { lenwy, replyJid, normalizedSender } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  await handleStatus(lenwy, replyJid, normalizedSender);
}
