// ============================================
// Evarick Bot — Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  Level Up Helper
  Centralized level up logic that can be called from anywhere
  
  Usage:
  import { checkLevelUp } from "../../database/rpg/levelHelper.js";
  const levelUpInfo = checkLevelUp(player);
  if (levelUpInfo.levelsGained > 0) {
    // Player leveled up!
    // levelUpInfo contains: levelsGained, newLevel, statPointsGained, message
  }
*/

import { getLanguage, getText, getPlayerLanguage } from "./languages.js";

/**
 * Check and process level ups for a player
 * @param {Object} player - Player object
 * @param {string} langCode - Optional language code override
 * @returns {Object} Level up information
 */
export function checkLevelUp(player, langCode = null) {
  const lang = langCode ? getLanguage(langCode) : getLanguage(getPlayerLanguage(player));
  
  let levelsGained = 0;
  let statPointsGained = 0;
  const oldLevel = player.level;
  
  // Safety: Initialize statPoints if undefined
  if (typeof player.statPoints === 'undefined') {
    player.statPoints = 0;
  }
  
  // Check for level ups (can level up multiple times)
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    levelsGained++;
    
    // Calculate next level XP requirement (increases by 50% each level)
    player.xpToNext = Math.floor(player.xpToNext * 1.5);
    
    // Award stat points (3 per level) - GUARANTEED
    const pointsThisLevel = 3;
    player.statPoints = (player.statPoints || 0) + pointsThisLevel;
    statPointsGained += pointsThisLevel;
  }
  
  // Safety check: Verify stat points were actually added
  if (levelsGained > 0 && statPointsGained === 0) {
    console.error(`[LEVEL-UP ERROR] Player ${player.name} leveled up ${levelsGained} times but got 0 stat points!`);
    // Emergency fix: Award the stat points that should have been given
    const emergencyPoints = levelsGained * 3;
    player.statPoints = (player.statPoints || 0) + emergencyPoints;
    statPointsGained = emergencyPoints;
    console.log(`[LEVEL-UP FIX] Awarded ${emergencyPoints} stat points to ${player.name}`);
  }
  
  // Generate level up message if leveled up
  let message = "";
  if (levelsGained > 0) {
    if (levelsGained === 1) {
      message = lang.code === "id"
        ? `\n⭐ *LEVEL UP!*\n` +
          `Level ${oldLevel} → ${player.level}\n` +
          `+${statPointsGained} Stat Points!\n` +
          `Ketik *!addstat* untuk alokasi stat points.`
        : `\n⭐ *LEVEL UP!*\n` +
          `Level ${oldLevel} → ${player.level}\n` +
          `+${statPointsGained} Stat Points!\n` +
          `Type *!addstat* to allocate stat points.`;
    } else {
      message = lang.code === "id"
        ? `\n⭐ *LEVEL UP x${levelsGained}!*\n` +
          `Level ${oldLevel} → ${player.level}\n` +
          `+${statPointsGained} Stat Points!\n` +
          `Ketik *!addstat* untuk alokasi stat points.`
        : `\n⭐ *LEVEL UP x${levelsGained}!*\n` +
          `Level ${oldLevel} → ${player.level}\n` +
          `+${statPointsGained} Stat Points!\n` +
          `Type *!addstat* to allocate stat points.`;
    }
  }
  
  return {
    levelsGained,
    oldLevel,
    newLevel: player.level,
    statPointsGained,
    message,
    didLevelUp: levelsGained > 0
  };
}

/**
 * Add XP to player and check for level ups
 * @param {Object} player - Player object
 * @param {number} xpAmount - Amount of XP to add
 * @param {string} langCode - Optional language code override
 * @returns {Object} Level up information
 */
export function addXP(player, xpAmount, langCode = null) {
  player.xp = (player.xp || 0) + xpAmount;
  return checkLevelUp(player, langCode);
}

/**
 * Get XP progress as percentage
 * @param {Object} player - Player object
 * @returns {number} Progress percentage (0-100)
 */
export function getXPProgress(player) {
  return Math.floor((player.xp / player.xpToNext) * 100);
}

/**
 * Get XP bar visual representation
 * @param {Object} player - Player object
 * @param {number} barLength - Length of the bar (default 10)
 * @returns {string} Visual XP bar
 */
export function getXPBar(player, barLength = 10) {
  const progress = getXPProgress(player);
  const filled = Math.floor((progress / 100) * barLength);
  const empty = barLength - filled;
  
  return "█".repeat(filled) + "░".repeat(empty);
}

export default {
  checkLevelUp,
  addXP,
  getXPProgress,
  getXPBar
};
