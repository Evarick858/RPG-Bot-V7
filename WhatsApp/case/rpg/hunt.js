// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : hunt
  Base : Lenwy SCM — RPG Extension

  Flow:
  1. Player types "hunt" (with prefix)
  2. Random enemy spawns based on current location
  3. Combat starts — player and enemy take turns
  4. Player commands (no prefix): attack, defend, skill 1/2/3, item, run, status
  5. After player action → enemy takes their turn (auto)
  6. Combat ends when HP = 0 or player runs

  All combat inputs handled via RPG session interceptor in evarick.js
*/

import fs from "fs";
import path from "path";
import { getRandomEnemy, getEnemyById } from "../../database/rpg/enemies.js";
import { getLocationById, areConnected, getReachableLocations, canDoAction, getLastShopLocation } from "../../database/rpg/locations.js";
import { getItemByName, negativeEffects } from "../../database/rpg/items.js";
import { trackCombat, trackGoldEarned } from "../../database/rpg/questTracker.js";
import { checkAndAwardTitles, formatTitleUnlockMessage } from "../../database/rpg/titles.js";
import { getRandomDemon, buildDemonStats, rollDemonDrop } from "../../database/rpg/demons.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { checkLevelUp } from "../../database/rpg/levelHelper.js";
import {
  initCombatState,
  calcDamage,
  applyDamage,
  applyStun,
  handleShieldBreakStun,
  resetShieldAfterStun,
  applyEffect,
  tickStatusEffects,
  tickCooldowns,
  tickStun,
  isStunned,
  isSilenced,
  rollDodge,
  checkReflect,
  enemyAI,
  applyPassive,
  getEffectiveAttack,
  buildCombatStatus,
  rollCrit,
  DEFEND_SP_GAIN,
  MAX_SP,
  SHIELD_BREAK_MULTIPLIER,
  SHIELD_BREAK_RESET_SP,
} from "../../database/rpg/combat.js";
import { combatSessions } from "../../database/rpg/sessionManager.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

// Export combatSessions for backward compatibility
export { combatSessions };

// -- Helpers ----------------------------------------------

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

function rollDrops(drops) {
  const result = [];
  for (const drop of drops) {
    if (Math.random() * 100 < drop.chance) {
      const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
      result.push({ id: drop.item, qty });
    }
  }
  return result;
}

// -- Send combat message with buttons (always new message) -------------

async function sendCombatMessage(lenwy, state, text) {
  try {
    // Build button message with combat actions
    const buttonMessage = {
      text: text,
      footer: "Evarick RPG",
      buttons: [
        {
          buttonId: "combat_attack",
          buttonText: { displayText: "⚔️ Attack" },
          type: 1,
        },
        {
          buttonId: "combat_defend",
          buttonText: { displayText: "🛡️ Defend" },
          type: 1,
        },
        {
          buttonId: "combat_run",
          buttonText: { displayText: "📊 Status" },
          type: 1,
        },
      ],
      headerType: 1,
    };
    
    const sent = await lenwy.sendMessage(state.replyJid, buttonMessage);
    state.messageKey = sent?.key;
  } catch (error) {
    console.error("[HUNT] Button send failed, falling back to text:", error);
    // Fallback to text-only
    const sent = await lenwy.sendMessage(state.replyJid, { text });
    state.messageKey = sent?.key;
  }
}

// -- Send final message WITHOUT buttons (combat ended) -------------

async function sendFinalMessage(lenwy, replyJid, text) {
  try {
    await lenwy.sendMessage(replyJid, { text });
  } catch (error) {
    console.error("[HUNT] Failed to send final message:", error);
  }
}

// -- Enemy turn -------------------------------------------

async function doEnemyTurn(lenwy, state) {
  const e = state.enemy;
  const p = state.player;
  const logs = [];

  // Natural mana regeneration for enemy (5% of max mana per turn)
  const enemyManaRegen = Math.floor(e.maxMana * 0.05);
  if (enemyManaRegen > 0 && e.mana < e.maxMana) {
    const actualRegen = Math.min(enemyManaRegen, e.maxMana - e.mana);
    e.mana += actualRegen;
  }

  // Tick passives (no battle log)
  applyPassive(e);

  // Tick status effects
  const statusLogs = tickStatusEffects(e);
  logs.push(...statusLogs);

  // Tick cooldowns
  tickCooldowns(e);

  // Check if enemy died from status effects
  if (e.hp <= 0) {
    state.isOver = true;
    state.winner = "player";
    return logs;
  }

  // Tick stun
  if (isStunned(e)) {
    logs.push(`😵 ${e.name} is stunned and skips their turn!`);
    tickStun(e);
    // If stun just ended, reset shield back to 1000
    const shieldReset = resetShieldAfterStun(e);
    if (shieldReset) {
      logs.push(`🛡️ ${e.name}'s shield has recovered! SP: ${e.sp}`);
    }
    return logs;
  }

  // Shield recovery check: if shield was broken but stun already ended last turn
  const shieldResetPassive = resetShieldAfterStun(e);
  if (shieldResetPassive) {
    logs.push(`🛡️ ${e.name}'s shield has recovered! SP: ${e.sp}`);
  }

  // Enemy AI decision
  const decision = enemyAI(e, p);

  if (decision.action === "defend") {
    // Enemy cannot gain SP if shield is broken
    if (!e.shieldBroken) {
      e.sp = Math.min(e.sp + DEFEND_SP_GAIN, MAX_SP);
    }
    logs.push(`🛡️ ${e.name} raises their guard! SP: ${e.sp}`);
    return logs;
  }

  if (decision.action === "item") {
    const itemData = getItemByName(decision.itemId);
    if (!itemData) {
      // Fallback to attack if item not found
      decision.action = "attack";
    } else {
      const target = decision.target === "self" ? e : p;
      const targetName = decision.target === "self" ? e.name : "you";
      
      logs.push(`💼 ${e.name} uses *${itemData.name}*!`);
      
      // Apply item effect
      switch (itemData.effect) {
        case "heal": {
          const healed = Math.min(itemData.value, e.maxHp - e.hp);
          e.hp += healed;
          logs.push(`💚 ${e.name} restores *${healed} HP*! HP: ${e.hp}/${e.maxHp}`);
          break;
        }
        case "mana_restore": {
          const restored = Math.min(itemData.value, e.maxMana - e.mana);
          e.mana += restored;
          logs.push(`💙 ${e.name} restores *${restored} mana*! Mana: ${e.mana}/${e.maxMana}`);
          break;
        }
        case "cleanse": {
          const before = e.statusEffects.length;
          e.statusEffects = e.statusEffects.filter((ef) => !negativeEffects.has(ef.type));
          e.stunned = 0;
          const removed = before - e.statusEffects.length;
          logs.push(`✅ ${e.name} removed ${removed} negative effect(s)!`);
          break;
        }
        case "regen": {
          e.statusEffects.push({ type: "regen", value: itemData.value, duration: itemData.duration });
          logs.push(`💚 ${e.name} will regenerate *${itemData.value} HP/turn* for *${itemData.duration} turns*!`);
          break;
        }
        case "evasion_buff": {
          e.statusEffects.push({ type: "evasion_buff", value: itemData.value, duration: itemData.duration });
          logs.push(`💨 ${e.name}'s evasion increased by *${itemData.value}%* for *${itemData.duration} turns*!`);
          break;
        }
        case "poison": {
          p.statusEffects.push({ type: "poison", value: itemData.value, duration: itemData.duration });
          logs.push(`☠️ You are poisoned! Taking *${itemData.value} damage/turn* for *${itemData.duration} turns*!`);
          break;
        }
        case "burn": {
          p.statusEffects.push({ type: "burn", value: itemData.value, duration: itemData.duration });
          logs.push(`🔥 You are burning! Taking *${itemData.value} damage/turn* for *${itemData.duration} turns*!`);
          break;
        }
        case "stun": {
          p.stunned = (p.stunned || 0) + itemData.duration;
          logs.push(`😵 You are stunned for ${itemData.duration} turn(s)!`);
          break;
        }
        default:
          logs.push(`⚠️ Item effect not implemented: ${itemData.effect}`);
      }
      
      return logs;
    }
  }

  if (decision.action === "skill" && e.skills[decision.skillIndex]) {
    const skill = e.skills[decision.skillIndex];

    // Check if player dodges
    if (skill.damageType !== "none" && rollDodge(e, p)) {
      logs.push(`💨 *You dodged ${e.name}'s ${skill.name}!*`);
      e.skillCooldowns[skill.name] = skill.cooldown || 4;
      if (skill.manaCost) e.mana = Math.max(0, e.mana - skill.manaCost);
      return logs;
    }

    const isCrit = rollCrit(0);
    const atkValue = skill.baseDamage || skill.value || getEffectiveAttack(e);
    const result = calcDamage(e, p, skill.damageType || "physical", atkValue, isCrit, true);

    if (skill.damageType !== "none") {
      applyDamage(p, result.damage);
    }
    if (skill.manaCost) e.mana = Math.max(0, e.mana - skill.manaCost);
    e.skillCooldowns[skill.name] = skill.cooldown || 4;

    logs.push(`${e.name} uses *${skill.name}*!`);
    if (result.isCrit) logs.push(`💥 Critical hit!`);
    if (result.spDrain > 0) logs.push(`🛡️ Your shield weakened! -${result.spDrain} SP (${p.sp}/${MAX_SP})`);
    if (result.shieldBroke) {
      // Shield break shown in HP bar as BROKEN
    }
    if (result.shieldBreakTriggered) {
       p.shieldBrokenStunPending = false;
      const stunned = applyStun(p, 1, false);
      if (stunned) logs.push(`😵 You are stunned for 1 turn!`);
    }
    if (skill.damageType !== "none") {
      logs.push(`💔 You take *${result.damage}* damage! HP: ${p.hp}/${p.maxHp}`);
    }

    // Apply skill effect to player
    // Normalize: some enemy skills use effects[] array instead of flat effect/value/duration
    const normalizedSkill = { ...skill };
    if (!normalizedSkill.effect && normalizedSkill.effects && normalizedSkill.effects.length > 0) {
      const ef = normalizedSkill.effects[0];
      normalizedSkill.effect   = ef.type;
      normalizedSkill.value    = ef.value ?? normalizedSkill.value;
      normalizedSkill.duration = ef.duration ?? normalizedSkill.duration;
    }
    const selfEffects = ["heal", "regen", "buff_atk", "buff_def", "evasion_buff", "haste", "reflect"];
    const effectTarget = selfEffects.includes(normalizedSkill.effect) ? e : p;
    const effectResult = applyEffect(normalizedSkill.effect, e, effectTarget, normalizedSkill, result.damage);
    logs.push(...effectResult.logs);

    // Reflect
    if (skill.damageType !== "none") {
      const reflected = checkReflect(p, e, result.damage);
      if (reflected > 0) logs.push(`🪞 You reflect ${reflected} damage back!`);
    }

    // Thorns passive
    if (p.passive?.effect === "thorns" && skill.damageType !== "none") {
      const thornDmg = p.passive.value;
      applyDamage(e, thornDmg);
      logs.push(`🌵 Thorns! ${e.name} takes ${thornDmg} damage back!`);
    }

    return logs;
  }

  // Basic attack
  if (rollDodge(e, p)) {
    logs.push(`💨 *You dodged ${e.name}'s attack!*`);
    return logs;
  }

  const isCrit = rollCrit(0);
  const atkValue = getEffectiveAttack(e);
  const result = calcDamage(e, p, "physical", atkValue, isCrit, true);

  applyDamage(p, result.damage);

  logs.push(`${e.name} attacks!`);
  if (result.isCrit) logs.push(`💥 Critical hit!`);
  if (result.spDrain > 0) {
    logs.push(`🛡️ Shield absorbed ${result.spDrain} damage!`);
    if (result.damage > 0) {
      logs.push(`💔 You take *${result.damage}* damage! HP: ${p.hp}/${p.maxHp}`);
    } else {
      logs.push(`🛡️ All damage blocked by shield! HP: ${p.hp}/${p.maxHp}`);
    }
  } else {
    logs.push(`💔 You take *${result.damage}* damage! HP: ${p.hp}/${p.maxHp}`);
  }
  if (result.shieldBroke) {
    // Shield break shown in HP bar as BROKEN
  }
  if (result.shieldBreakTriggered) {
     p.shieldBrokenStunPending = false;
    const stunned = applyStun(p, 1, false);
    if (stunned) logs.push(`😵 You are stunned for 1 turn!`);
  }
  logs.push(`💔 You take *${result.damage}* damage! HP: ${p.hp}/${p.maxHp}`);

  // Reflect
  const reflected = checkReflect(p, e, result.damage);
  if (reflected > 0) logs.push(`🪞 You reflect ${reflected} damage back to ${e.name}!`);

  // Thorns passive
  if (p.passive?.effect === "thorns") {
    const thornDmg = p.passive.value;
    applyDamage(e, thornDmg);
    logs.push(`🌵 Thorns! ${e.name} takes ${thornDmg} damage back!`);
  }

  return logs;
}

// -- Handle combat victory --------------------------------

async function handleVictory(lenwy, state) {
  const players = loadPlayers();
  const playerData = players[state.playerJid];
  if (!playerData) return;

  const lang = getLanguage(getPlayerLanguage(playerData));
  const e = state.enemy;
  const drops = rollDrops(e.drops);
  const goldEarned = Math.floor(Math.random() * (e.gold.max - e.gold.min + 1)) + e.gold.min;

  // Apply rewards
  playerData.gold = (playerData.gold || 0) + goldEarned;
  playerData.xp = (playerData.xp || 0) + e.xp;
  playerData.stats_tracker.totalKills = (playerData.stats_tracker.totalKills || 0) + 1;
  playerData.stats_tracker.totalGoldEarned = (playerData.stats_tracker.totalGoldEarned || 0) + goldEarned;
  if (e.isBoss) playerData.stats_tracker.bossesKilled = (playerData.stats_tracker.bossesKilled || 0) + 1;

  // Apply drops
  for (const drop of drops) addToInventory(playerData, drop.id, drop.qty);

  // Sync HP/mana back
  playerData.stats.hp = state.player.hp;
  playerData.stats.mana = state.player.mana;
  playerData.inventory = state.player.inventory;

  // Level up check using centralized helper
  const levelUpInfo = checkLevelUp(playerData, lang.code);

  playerData.lastActive = new Date().toISOString();
  players[state.playerJid] = playerData;
  savePlayers(players);

  // Track quest progress
  trackCombat(state.playerJid, 1);
  trackGoldEarned(state.playerJid, goldEarned);

  // Check for newly unlocked titles
  const newTitles = checkAndAwardTitles(playerData);
  players[state.playerJid] = playerData;
  savePlayers(players);
  const titleMsg = formatTitleUnlockMessage(newTitles);

  const dropText = drops.length > 0
    ? drops.map((d) => `• ${d.id} x${d.qty}`).join("\n")
    : "• Nothing dropped";

  // Send victory message WITHOUT buttons (combat is over)
  await lenwy.sendMessage(state.replyJid, {
    text:
      `${getText(lang, "hunt.victory", {enemy: e.name})}\n\n` +
      `🎁 *${lang.code === "id" ? "Drops" : "Drops"}:*\n${dropText}\n\n` +
      `💰 ${getText(lang, "common.gold")}: +${goldEarned}\n` +
      `⭐ ${getText(lang, "common.xp")}: +${e.xp}\n` +
      `${levelUpInfo.message}\n\n` +
      `❤️ ${getText(lang, "common.hp")}: ${state.player.hp}/${state.player.maxHp}\n\n` +
      `${lang.code === "id" ? "Ketik *hunt* untuk bertarung lagi!" : "Type *hunt* to fight again!"}` +
      titleMsg
  });

  // ── 10% chance: demon ambushes after victory ──────────
  if (Math.random() < 0.10) {
    const freshPlayers = loadPlayers();
    const freshPlayer = freshPlayers[state.playerJid];
    if (freshPlayer) {
      await new Promise(r => setTimeout(r, 1500));
      await startDemonEncounter(lenwy, state.replyJid, state.playerJid, freshPlayer, lang);
    }
  }
}

// -- Handle combat defeat ---------------------------------

/**
 * Apply death penalty: lose 3 stat points or 1 level
 * @param {object} playerData - Player data object
 * @returns {object} - Penalty info { type, amount, statsLost }
 */
function applyDeathPenalty(playerData) {
  // Initialize statHistory if not exists
  if (!playerData.statHistory) {
    playerData.statHistory = [];
  }

  const penalty = {
    type: 'none',
    amount: 0,
    statsLost: []
  };

  // Case 1: Player has 3+ unused stat points - just remove 3 points
  if (playerData.statPoints >= 3) {
    playerData.statPoints -= 3;
    penalty.type = 'statPoints';
    penalty.amount = 3;
    return penalty;
  }

  // Case 2: Player has < 3 stat points - lose 1 level + reverse last 3 stat allocations
  if (playerData.level > 1 && playerData.statHistory.length >= 3) {
    // Lose 1 level
    playerData.level -= 1;
    
    // Recalculate XP for new level
    playerData.xpToNext = 100 + (playerData.level - 1) * 50;
    playerData.xp = Math.min(playerData.xp, playerData.xpToNext - 1);
    
    // Reverse last 3 stat allocations
    const reversedStats = [];
    for (let i = 0; i < 3; i++) {
      const lastAllocation = playerData.statHistory.pop();
      if (lastAllocation) {
        const statName = lastAllocation.stat;
        const increase = lastAllocation.increase;
        
        // Decrease the stat
        playerData.stats[statName] -= increase;
        
        // If it was HP/Mana, also decrease current HP/Mana (but keep at least 1)
        if (statName === 'maxHp') {
          playerData.stats.hp = Math.max(1, playerData.stats.hp - increase);
        } else if (statName === 'maxMana') {
          playerData.stats.mana = Math.max(0, playerData.stats.mana - increase);
        }
        
        reversedStats.push({
          stat: statName,
          amount: increase
        });
      }
    }
    
    penalty.type = 'level';
    penalty.amount = 1;
    penalty.statsLost = reversedStats;
    return penalty;
  }

  // Case 3: Level 1 or no stat history - no penalty
  return penalty;
}

async function handleDefeat(lenwy, state) {
  const players = loadPlayers();
  const playerData = players[state.playerJid];
  if (!playerData) return;

  const lang = getLanguage(getPlayerLanguage(playerData));

  playerData.stats_tracker.totalDeaths = (playerData.stats_tracker.totalDeaths || 0) + 1;
  
  // Apply death penalty
  const penalty = applyDeathPenalty(playerData);
  
  // Respawn at last visited shop location with 1 HP
  const respawnLocation = getLastShopLocation(playerData.unlockedLocations);
  playerData.stats.hp = 1;
  playerData.currentLocation = respawnLocation;
  playerData.lastActive = new Date().toISOString();
  players[state.playerJid] = playerData;
  savePlayers(players);

  // Build penalty message
  let penaltyMsg = '';
  if (penalty.type === 'statPoints') {
    penaltyMsg = lang.code === "id"
      ? `\n\n💀 *Penalti Kematian:* -3 poin stat`
      : `\n\n💀 *Death Penalty:* -3 stat points`;
  } else if (penalty.type === 'level') {
    const statsLostText = penalty.statsLost.map(s => {
      const statNames = {
        maxHp: lang.code === "id" ? "Max HP" : "Max HP",
        maxMana: lang.code === "id" ? "Max Mana" : "Max Mana",
        attack: lang.code === "id" ? "Attack" : "Attack",
        defense: lang.code === "id" ? "Defense" : "Defense",
        agility: lang.code === "id" ? "Agility" : "Agility",
        luck: lang.code === "id" ? "Luck" : "Luck"
      };
      return `  • ${statNames[s.stat] || s.stat}: -${s.amount}`;
    }).join('\n');
    
    penaltyMsg = lang.code === "id"
      ? `\n\n💀 *Penalti Kematian:*\n📉 Level: ${playerData.level + 1} → ${playerData.level}\n📊 Stats yang hilang:\n${statsLostText}`
      : `\n\n💀 *Death Penalty:*\n📉 Level: ${playerData.level + 1} → ${playerData.level}\n📊 Stats lost:\n${statsLostText}`;
  }

  // Send defeat message WITHOUT buttons (combat is over)
  await lenwy.sendMessage(state.replyJid, {
    text:
      `${getText(lang, "hunt.defeat", {enemy: state.enemy.name})}\n\n` +
      `${lang.code === "id"
        ? `*${state.enemy.name}* telah mengalahkan kamu...${penaltyMsg}\n\nKamu terbangun kembali di *${getLocationById(respawnLocation)?.name || respawnLocation}* dengan 1 HP.\nKunjungi toko untuk membeli potion dan pulih!\n\nKetik *hunt* untuk mencoba lagi.`
        : `*${state.enemy.name}* has defeated you...${penaltyMsg}\n\nYou wake up at *${getLocationById(respawnLocation)?.name || respawnLocation}* with 1 HP.\nVisit the shop to buy potions and recover!\n\nType *hunt* to try again.`}`
  });
}

// -- Process player action --------------------------------

export async function handleCombatInput(lenwy, replyJid, playerJid, input) {
  const state = combatSessions.get(playerJid);
  if (!state) return false;
  
  // Clean up zombie sessions
  if (state.isOver) {
    combatSessions.delete(playerJid);
    return false;
  }

  const parts = input.trim().toLowerCase().split(/\s+/);
  const action = parts[0];
  const arg = parts[1];

  const p = state.player;
  const e = state.enemy;
  const logs = [];

  // Status • no turn consumed
  if (action === "status") {
    await sendCombatMessage(lenwy, state, buildCombatStatus(state));
    return true;
  }

// Check if player is stunned
  if (isStunned(p)) {
    logs.push(`✨ *You are stunned!* Skipping your turn...`);
    tickStun(p);
    // Reset shield after stun ends
    const playerShieldReset = resetShieldAfterStun(p);
    if (playerShieldReset) {
      logs.push(`🛡️ Your shield has recovered! SP: ${p.sp}`);
    }
  } else {
    // Shield recovery check: if shield was broken but stun already ended last turn
    const playerShieldResetPassive = resetShieldAfterStun(p);
    if (playerShieldResetPassive) {
      logs.push(`🛡️ Your shield has recovered! SP: ${p.sp}`);
    }

    // -- ATTACK ------------------------------------------
    if (action === "attack") {
      // Check dodge
      if (rollDodge(p, e)) {
        logs.push(`✨ *${e.name} dodged your attack!*`);
      } else {
        const isCrit = rollCrit(p.luck);
        const atkValue = getEffectiveAttack(p);
        const result = calcDamage(p, e, "physical", atkValue, isCrit, true);

        applyDamage(e, result.damage);
      

        logs.push(`⚔️ *You attack ${e.name}!*`);
        if (result.isCrit) logs.push(`💥 *Critical Hit!* (${getCritChanceText(p.luck)}% chance)`);
        if (result.spDrain > 0) {
          logs.push(`🛡️ Enemy shield absorbed ${result.spDrain} damage!`);
          if (result.damage > 0) {
            logs.push(`⚔️ Dealt *${result.damage}* damage! ${e.name} HP: ${e.hp}/${e.maxHp}`);
          } else {
            logs.push(`🛡️ All damage blocked by enemy shield! ${e.name} HP: ${e.hp}/${e.maxHp}`);
          }
        } else {
          logs.push(`⚔️ Dealt *${result.damage}* damage! ${e.name} HP: ${e.hp}/${e.maxHp}`);
        }
        if (result.shieldBroke) { /* Shield break shown in HP bar as BROKEN */ }
        if (result.shieldBreakTriggered) {
          applyStun(e, 1, e.isBoss);
          e.shieldBrokenStunPending = false;
          if (!e.isBoss) logs.push(`😵 ${e.name} is stunned for 1 turn!`);
        }
        // Damage message already shown above

        // Reflect
        const reflected = checkReflect(e, p, result.damage);
        if (reflected > 0) logs.push(`🪞 ${e.name} reflects ${reflected} damage back!`);

        // Thorns passive on enemy
        if (e.passive?.effect === "thorns") {
          const thornDmg = e.passive.value;
          applyDamage(p, thornDmg);
          logs.push(`🌵 ${e.name}'s thorns deal ${thornDmg} damage back to you!`);
        }
      }
      state.player.lastAction = "attack";
    }

    // -- DEFEND ------------------------------------------
    else if (action === "defend") {
      // Cannot gain SP if shield is broken
      if (p.shieldBroken) {
        logs.push(`⚠️ *Your shield is broken!* Cannot defend until it resets.`);
      } else {
        const gained = Math.min(DEFEND_SP_GAIN, MAX_SP - p.sp);
        p.sp += gained;
        logs.push(`🛡️✨ *You raise your guard!* SP: ${p.sp}/${MAX_SP}`);
      }
      state.player.lastAction = "defend";
    }

    // -- SKILL -------------------------------------------
    else if (action === "skill") {
      const slotNum = parseInt(arg) - 1;
      
      // Check if slot 4 (weapon skill)
      let skill = null;
      if (slotNum === 3 && p.weaponSkill) {
        skill = p.weaponSkill;
      } else {
        skill = p.skills?.[slotNum];
      }

      if (!skill || !skill.id) {
        logs.push(`✨ *No skill in slot ${slotNum + 1}.*`);
      } else if (isSilenced(p)) {
        logs.push(`🤐 *You are silenced!* Can't use skills this turn.`);
      } else if (skill.cooldownRemaining > 0) {
        logs.push(`⚠️ *${skill.name}* is on cooldown! (${skill.cooldownRemaining} turns left)`);
      } else if (p.mana < skill.manaCost) {
        logs.push(`✨ *Not enough mana!* Need ${skill.manaCost}, have ${p.mana}.`);
      } else {
        p.mana -= skill.manaCost;
        skill.cooldownRemaining = skill.cooldown;
     

        logs.push(`✨ *${skill.name}!*`);

        // Determine target • buffs/heals target self, everything else targets enemy
        const selfEffects = ["heal", "regen", "buff_atk", "buff_def", "evasion_buff", "haste", "reflect"];
        const targetCombatant = selfEffects.includes(skill.effect) ? p : e;
        const isTargetingEnemy = targetCombatant === e;

        let damageDealt = 0;

        // Deal damage if skill has damage component
        if (skill.damageType !== "none" && isTargetingEnemy) {
          if (rollDodge(p, e)) {
            logs.push(`✨ *${e.name} dodged!*`);
          } else {
            const isCrit = rollCrit(p.luck);
            const dmgValue = skill.damage || skill.baseDamage || skill.value || getEffectiveAttack(p);
            const result = calcDamage(p, e, skill.damageType || "physical", dmgValue, isCrit, true);

            applyDamage(e, result.damage);
            damageDealt = result.damage;

            if (result.isCrit) logs.push(`💥 *Critical Hit!*`);
            if (result.spDrain > 0) {
              logs.push(`🛡️ Enemy shield absorbed ${result.spDrain} damage!`);
              if (result.damage > 0) {
                logs.push(`⚔️ Dealt *${result.damage}* damage!`);
              } else {
                logs.push(`🛡️ All damage blocked by enemy shield!`);
              }
            } else {
              logs.push(`⚔️ Dealt *${result.damage}* damage!`);
            }
            if (result.shieldBroke) { /* Shield break shown in HP bar as BROKEN */ }
            if (result.shieldBreakTriggered) {
              applyStun(e, 1, e.isBoss);
              e.shieldBrokenStunPending = false;
              if (!e.isBoss) logs.push(`😵 ${e.name} is stunned!`);
            }
            logs.push(`⚔️ Dealt *${result.damage}* damage!`);

            // Reflect
            const reflected = checkReflect(e, p, result.damage);
            if (reflected > 0) logs.push(`🪞 ${e.name} reflects ${reflected} damage back!`);
          }
        }

        // Apply skill effect
        const effectResult = applyEffect(skill.effect, p, targetCombatant, skill, damageDealt);
        logs.push(...effectResult.logs);

        // Execute extra damage
        if (effectResult.extraDamage > 0) {
          applyDamage(e, effectResult.extraDamage);
          logs.push(`💀 Execute deals ${effectResult.extraDamage} extra damage!`);
        }

        // Haste • player acts again (flag handled after enemy turn)
        if (p._haste) {
          logs.push(`💨 *Haste active!* You act again after enemy turn.`);
        }

        logs.push(`${e.name} HP: ${e.hp}/${e.maxHp}`);
        state.player.lastAction = "skill";
      }
    }

    // -- RUN ---------------------------------------------
    else if (action === "run") {
      // Base 20% chance + luck scaling (200 luck = 55% total)
      const luckBonus = Math.min((p.luck / 200) * 35, 35); // Max 35% bonus from luck
      const runChance = 20 + luckBonus; // 20% base + up to 35% = 55% max
      if (Math.random() * 100 < runChance) {
        state.isOver = true;
        combatSessions.delete(playerJid);

// Save current HP/mana so camp/inn sees the correct (damaged) values
        const escapePlayers = loadPlayers();
        const escapeData = escapePlayers[playerJid];
        if (escapeData) {
          escapeData.stats.hp = p.hp;
          escapeData.stats.mana = p.mana;
          escapeData.lastActive = new Date().toISOString();
          escapeData.inventory = p.inventory;
          escapePlayers[playerJid] = escapeData;
          savePlayers(escapePlayers);
        }

        await sendFinalMessage(lenwy, state.replyJid,
          `🏃 *You escaped!*\n\n` +
          `You fled from *${e.name}*.\n` +
          `No rewards gained.\n\n` +
          `❤️ HP: ${p.hp}/${p.maxHp}\n\n` +
          `Type *hunt* to fight again.`
        );
        return true;
      } else {
        logs.push(`❌ *Failed to escape!* ${e.name} blocks your path and gets a free attack!`);
        state.player.lastAction = "run_failed";
        // Enemy gets a free turn after failed escape
      }
    }

    // -- ITEM --------------------------------------------
    else if (action === "item") {
      if (!arg) {
        const combatItemList = p.inventory
          .filter((i) => getItemByName(i.id)?.usableInBattle)
          .map((i) => {
            const data = getItemByName(i.id);
            return `• ${data?.name || i.id} x${i.qty}`;
          })
          .join("\n") || "None";

        await sendCombatMessage(lenwy, state,
          `✨ *Usage:* item <name>\n` +
          `Example: *item health_potion*\n\n` +
          `Your combat items:\n${combatItemList}`
        );
        return true;
      }

      const itemName = parts.slice(1).join("_").toLowerCase();
      const itemData = getItemByName(itemName);

      if (!itemData) {
        await sendCombatMessage(lenwy, state,
          `✨ *Item "${itemName}" not found.*\nCheck your inventory with *bag* command.`
        );
        return true;
      }

      if (!itemData.usableInBattle) {
        await sendCombatMessage(lenwy, state,
          `✨ *${itemData.name}* cannot be used in battle.`
        );
        return true;
      }

      // Check inventory
      const invItem = p.inventory.find((i) => i.id === itemData.id);
      if (!invItem || invItem.qty <= 0) {
        await sendCombatMessage(lenwy, state,
          `✨ *You don't have ${itemData.name} in your inventory.*`
        );
        return true;
      }

      // Consume item
      invItem.qty--;
      if (invItem.qty <= 0) {
        p.inventory = p.inventory.filter((i) => i.id !== itemData.id);
      }

      const battleMsg = (itemData.battleMessage || "").replace("{enemy}", e.name);
      logs.push(`✨ *${itemData.name}*`);
      logs.push(battleMsg);

      // Apply item effect
      switch (itemData.effect) {
        case "heal": {
          const healed = Math.min(itemData.value, p.maxHp - p.hp);
          p.hp += healed;
          logs.push(`❤️ HP: ${p.hp}/${p.maxHp}`);
          break;
        }
        case "mana_restore": {
          const restored = Math.min(itemData.value, p.maxMana - p.mana);
          p.mana += restored;
          logs.push(`💙 Mana: ${p.mana}/${p.maxMana}`);
          break;
        }
        case "full_restore": {
          p.hp = p.maxHp;
          p.mana = p.maxMana;
          logs.push(`❤️ HP: ${p.hp}/${p.maxHp} | 💙 Mana: ${p.mana}/${p.maxMana}`);
          break;
        }
        case "cleanse": {
          const before = p.statusEffects.length;
          p.statusEffects = p.statusEffects.filter((ef) => !negativeEffects.has(ef.type));
          p.stunned = 0;
          const removed = before - p.statusEffects.length;
          logs.push(`✅ Removed ${removed} negative effect(s).`);
          break;
        }
        case "regen": {
          p.statusEffects.push({ type: "regen", value: itemData.value, duration: itemData.duration });
          break;
        }
        case "evasion_buff": {
          p.statusEffects.push({ type: "evasion_buff", value: itemData.value, duration: itemData.duration });
          break;
        }
        case "poison": {
          // Drain SP first (150-200) before applying poison
          if (!e.shieldBroken && e.sp > 0) {
            const spDrain = Math.floor(Math.random() * 51) + 150; // 150-200
            const actualDrain = Math.min(spDrain, e.sp);
            e.sp -= actualDrain;
            logs.push(`🛡️ Enemy shield: -${actualDrain} SP`);
            
            if (e.sp <= 0) {
              e.sp = 0;
              e.shieldBroken = true;
              e.shieldBrokenStunPending = true;
            }
          }
          
          e.statusEffects.push({ type: "poison", value: itemData.value, duration: itemData.duration });
          logs.push(`${e.name} HP: ${e.hp}/${e.maxHp}`);
          break;
        }
        case "burn": {
          // Drain SP first (150-200) before applying burn
          if (!e.shieldBroken && e.sp > 0) {
            const spDrain = Math.floor(Math.random() * 51) + 150; // 150-200
            const actualDrain = Math.min(spDrain, e.sp);
            e.sp -= actualDrain;
            logs.push(`🛡️ Enemy shield: -${actualDrain} SP`);
            
            if (e.sp <= 0) {
              e.sp = 0;
              e.shieldBroken = true;
              e.shieldBrokenStunPending = true;
            }
          }
          
          e.statusEffects.push({ type: "burn", value: itemData.value, duration: itemData.duration });
          logs.push(`${e.name} HP: ${e.hp}/${e.maxHp}`);
          break;
        }
        case "stun": {
          // Drain SP first (150-200) before applying stun
          if (!e.shieldBroken && e.sp > 0) {
            const spDrain = Math.floor(Math.random() * 51) + 150; // 150-200
            const actualDrain = Math.min(spDrain, e.sp);
            e.sp -= actualDrain;
            logs.push(`🛡️ Enemy shield: -${actualDrain} SP`);
            
            if (e.sp <= 0) {
              e.sp = 0;
              e.shieldBroken = true;
              e.shieldBrokenStunPending = true;
            }
          }
          
          if (e.isBoss) {
            logs.push(`✨ *${e.name} is immune to stun!*`);
          } else {
            e.stunned = (e.stunned || 0) + itemData.duration;
            logs.push(`😵 ${e.name} is stunned for ${itemData.duration} turn(s)!`);
          }
          break;
        }
        case "escape": {
          if (e.isBoss) {
            logs.push(`?✨ *Can't escape from a boss fight!*`);
            // Refund item
            const refund = p.inventory.find((i) => i.id === itemData.id);
            if (refund) refund.qty++;
            else p.inventory.push({ id: itemData.id, qty: 1 });
          } else {
            state.isOver = true;
            combatSessions.delete(playerJid);
            await sendFinalMessage(lenwy, state.replyJid,
              `🏃 *Escaped!*\n\nYou used an Escape Rope and fled the battle!\nNo rewards gained.\n\nType *hunt* to fight again.`
            );
            return true;
          }
          break;
        }
        default:
          logs.push(`⚠️ This item has no battle effect.`);
      }

      state.player.lastAction = "item";
    }

    else {
      await sendCombatMessage(lenwy, state,
        `✨ *Unknown command.*\n\nType: attack / defend / skill [1/2/3] / item / run / status`
      );
      return true;
    }
  }

  // Check enemy death after player action
  if (e.hp <= 0) {
    state.isOver = true;
    state.winner = "player";
    combatSessions.delete(playerJid);
    const logText = logs.join("\n");
    await sendFinalMessage(lenwy, state.replyJid, logText + "\n\n✨ *Finishing blow!*");
    if (state.isDemonFight) {
      await handleDemonFlee(lenwy, state);
    } else {
      await handleVictory(lenwy, state);
    }
    return true;
  }

  // -- ENEMY TURN ---------------------------------------
  state.round++;
  const enemyLogs = await doEnemyTurn(lenwy, state);
  logs.push("", `--- *${e.name}'s turn* ---`);
  logs.push(...enemyLogs);

  // Natural mana regeneration (5% of max mana per turn)
  const playerManaRegen = Math.floor(p.maxMana * 0.05);
  if (playerManaRegen > 0 && p.mana < p.maxMana) {
    const actualRegen = Math.min(playerManaRegen, p.maxMana - p.mana);
    p.mana += actualRegen;
    logs.push(`💙 Natural mana regen: +${actualRegen} mana (${p.mana}/${p.maxMana})`);
  }

  // Tick player status effects
  const playerStatusLogs = tickStatusEffects(p);
  logs.push(...playerStatusLogs);

  // Tick player skill cooldowns
  for (const skill of (p.skills || [])) {
    if (skill && skill.cooldownRemaining > 0) skill.cooldownRemaining--;
  }
  
  // Tick weapon skill cooldown
  if (p.weaponSkill && p.weaponSkill.cooldownRemaining > 0) {
    p.weaponSkill.cooldownRemaining--;
  }

  // Apply player passive (no battle log)
  applyPassive(p);

  // Check player death
  if (p.hp <= 0) {
    state.isOver = true;
    state.winner = "enemy";
    combatSessions.delete(playerJid);
    const logText = logs.join("\n");
    await sendCombatMessage(lenwy, state, logText);
    if (state.isDemonFight) {
      await handleDemonDefeat(lenwy, state);
    } else {
      await handleDefeat(lenwy, state);
    }
    return true;
  }

  // Check enemy death from status effects
  if (e.hp <= 0) {
    state.isOver = true;
    state.winner = "player";
    combatSessions.delete(playerJid);
    const logText = logs.join("\n");
    await sendFinalMessage(lenwy, state.replyJid, logText + "\n\n✨ *Enemy defeated by status effects!*");
    if (state.isDemonFight) {
      await handleDemonFlee(lenwy, state);
    } else {
      await handleVictory(lenwy, state);
    }
    return true;
  }

  // Combat continues • show updated status
  const logText = logs.join("\n");
  const statusText = buildCombatStatus(state);
  await sendCombatMessage(lenwy, state, `${logText}\n\n${statusText}`);

  return true;
}

function getCritChanceText(luck) {
  return Math.min(Math.floor(luck / 10), 50);
}

// -- Start demon encounter --------------------------------

async function startDemonEncounter(lenwy, replyJid, playerJid, player, lang) {
  if (combatSessions.has(playerJid)) return;

  const demon = getRandomDemon();
  const demonStats = buildDemonStats(player);

  // Build demon as enemy-compatible object for initCombatState
  const demonEnemy = {
    id: demon.id,
    name: `${demon.emoji} ${demon.name}`,
    emoji: demon.emoji,
    isBoss: false,
    isDemon: true,
    stats: demonStats,
    skills: demon.skills,
    passive: demon.passives[0] || null,
    allPassives: demon.passives,  // all 3 passives
    drops: [],
    xp: 0,
    gold: { min: 0, max: 0 },
    fleeQuote: demon.fleeQuote,
    defeatQuote: demon.defeatQuote,
    demonId: demon.id,
  };

  const state = initCombatState(playerJid, replyJid, player, demonEnemy, "hunt");
  state.isDemonFight = true;
  combatSessions.set(playerJid, state);

  const langCode = lang?.code || "en";
  const warningMsg = langCode === "id"
    ? `⚠️ *IBLIS MUNCUL!*`
    : `⚠️ *A DEMON APPEARS!*`;

  const initialMessage =
    `${demon.emoji} *${demon.name}*\n` +
    `_"${demon.title}"_\n\n` +
    `${demon.description}\n\n` +
    `${warningMsg}\n\n` +
    `${buildCombatStatus(state)}`;

  await sendCombatMessage(lenwy, state, initialMessage);
}

// -- Handle demon flee (HP hits 0) ------------------------

async function handleDemonFlee(lenwy, state) {
  const players = loadPlayers();
  const playerData = players[state.playerJid];
  if (!playerData) return;

  const lang = getLanguage(getPlayerLanguage(playerData));
  const langCode = lang?.code || "en";
  const e = state.enemy;

  // Sync HP/mana
  playerData.stats.hp = state.player.hp;
  playerData.stats.mana = state.player.mana;
  playerData.lastActive = new Date().toISOString();
  playerData.inventory = state.player.inventory;

  // Roll for demon drop (20% chance)
  const drop = rollDemonDrop();
  if (drop) {
    const existing = playerData.inventory.find(i => i.id === drop);
    if (existing) existing.qty++;
    else playerData.inventory.push({ id: drop, qty: 1 });
  }

  players[state.playerJid] = playerData;
  savePlayers(players);

  const dropLine = drop
    ? (langCode === "id"
        ? `\n\n🎁 *Drop:* ${drop.replace(/_/g, " ")} x1`
        : `\n\n🎁 *Drop:* ${drop.replace(/_/g, " ")} x1`)
    : (langCode === "id"
        ? `\n\n💨 Iblis tidak meninggalkan apa-apa.`
        : `\n\n💨 The demon left nothing behind.`);

  const fleeText = langCode === "id"
    ? `${e.emoji} *${e.name}* melarikan diri!\n\n${e.fleeQuote || '"Sampai jumpa lagi, manusia."'}${dropLine}\n\n❤️ HP: ${state.player.hp}/${state.player.maxHp}\n\nKetik *hunt* untuk berburu lagi!`
    : `${e.emoji} *${e.name}* flees!\n\n${e.fleeQuote || '"Until next time, mortal."'}${dropLine}\n\n❤️ HP: ${state.player.hp}/${state.player.maxHp}\n\nType *hunt* to hunt again!`;

  await sendFinalMessage(lenwy, state.replyJid, fleeText);
}

// -- Handle demon defeat (player loses to demon) ----------

async function handleDemonDefeat(lenwy, state) {
  const players = loadPlayers();
  const playerData = players[state.playerJid];
  if (!playerData) return;

  const lang = getLanguage(getPlayerLanguage(playerData));
  const langCode = lang?.code || "en";
  const e = state.enemy;

  playerData.stats_tracker.totalDeaths = (playerData.stats_tracker.totalDeaths || 0) + 1;

  // Apply death penalty
  const penalty = applyDeathPenalty(playerData);

  // Respawn at last shop location with 1 HP
  const respawnLocation = getLastShopLocation(playerData.unlockedLocations);
  playerData.stats.hp = 1;
  playerData.currentLocation = respawnLocation;
  playerData.lastActive = new Date().toISOString();
  players[state.playerJid] = playerData;
  savePlayers(players);

  const respawnName = getLocationById(respawnLocation)?.name || respawnLocation;

  const defeatText = langCode === "id"
    ? `${e.emoji} *${e.name}* mengalahkanmu!\n\n${e.defeatQuote || '"Manusia lemah."'}\n\n💀 Kamu dikalahkan oleh iblis.\nKamu terbangun di *${respawnName}* dengan 1 HP.\n\nKetik *hunt* untuk mencoba lagi!`
    : `${e.emoji} *${e.name}* defeats you!\n\n${e.defeatQuote || '"Pathetic mortal."'}\n\n💀 You were defeated by a demon.\nYou wake up at *${respawnName}* with 1 HP.\n\nType *hunt* to try again!`;

  await sendFinalMessage(lenwy, state.replyJid, defeatText);
}

// -- Start hunt -------------------------------------------

export async function startHunt(lenwy, replyJid, playerJid, player) {
  const lang = getLanguage(getPlayerLanguage(player));
  
  if (!canDoAction(player.currentLocation, "hunt")) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "hunt.notHere"),
    });
    return;
  }

  if (combatSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, {
      text: `✨ *You are already in combat!*\n\nType *attack*, *defend*, *skill [1/2/3]*, *run*, or *status*.`,
    });
    return;
  }

  const enemy = getRandomEnemy(player.currentLocation);
  if (!enemy) {
    await lenwy.sendMessage(replyJid, {
      text: `✨ *No enemies found here. Try a different location.*`,
    });
    return;
  }

  // ── 10% chance: demon appears instead of normal enemy ──
  if (Math.random() < 0.10) {
    await startDemonEncounter(lenwy, replyJid, playerJid, player, lang);
    return;
  }

  const state = initCombatState(playerJid, replyJid, player, enemy, "hunt");
  combatSessions.set(playerJid, state);
  
  console.log(`[HUNT DEBUG] Combat session created for ${playerJid}`);
  console.log(`[HUNT DEBUG] Session keys after set:`, Array.from(combatSessions.keys()));
  console.log(`[HUNT DEBUG] Session exists:`, combatSessions.has(playerJid));

  // Send initial combat message with buttons
  const initialMessage =
    `⚔️ *A wild ${enemy.name} appears!*\n\n` +
    `${enemy.emoji || "👹"} *${enemy.name}*\n` +
    `❤️ HP: ${enemy.stats.hp}\n` +
    `⭐ Tier: ${enemy.tier}\n\n` +
    `${buildCombatStatus(state)}`;
  
  await sendCombatMessage(lenwy, state, initialMessage);
}

// -- Command export ---------------------------------------

export const info = {
  name: "Hunt",
  menu: ["hunt"],
  case: ["hunt", "berburu", "lawan"],
  description: "Hunt enemies in your current location.",
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
    return LenwyText(`✨ *You are not registered yet!*\n\nType *register <your name>* to start.`);
  }

  await startHunt(lenwy, replyJid, normalizedSender, player);
}

