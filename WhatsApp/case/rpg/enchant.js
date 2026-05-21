// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : enchant
  Base : Lenwy SCM — RPG Extension

  Enchanting System:
  - Enchant weapons and armor from +0 to +20
  - Success rate decreases as level increases
  - Failure consequences:
    * +1 to +5: Safe zone (level stays, material lost)
    * +6: 20% chance to destroy on fail
    * +7: 30% chance to destroy on fail
    * ... increases by 10% each level
    * +15 to +20: 100% chance to destroy on fail
  - Stat bonus: +5% base stats per enchant level
  - Visual display with stars (⭐⭐⭐⭐)
  - Materials: Enchant Stone (consumed on each attempt)

  Commands:
  - !enchant <item_name>     → Enchant 1x
  - !enchant <item_name> 5   → Enchant 5x (auto-stop on fail/destroy)
*/

import fs from "fs";
import path from "path";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { checkAndAwardTitles, formatTitleUnlockMessage } from "../../database/rpg/titles.js";

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
  const updated = {
    _comment: data._comment,
    _template: data._template,
    ...players,
  };
  fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), "utf8");
}

// Check if player has item in inventory
function hasItemInInventory(player, itemId, quantity = 1) {
  const item = player.inventory.find((i) => i.id === itemId);
  return item && item.qty >= quantity;
}

// Remove item from inventory
function removeFromInventory(player, itemId, quantity = 1) {
  const item = player.inventory.find((i) => i.id === itemId);
  if (item) {
    item.qty -= quantity;
    if (item.qty <= 0) {
      player.inventory = player.inventory.filter((i) => i.id !== itemId);
    }
  }
}

// Get success rate based on current enchant level
function getSuccessRate(currentLevel) {
  const rates = {
    0: 100, 1: 95, 2: 90, 3: 85, 4: 80,
    5: 75, 6: 70, 7: 65, 8: 60, 9: 55,
    10: 50, 11: 45, 12: 40, 13: 35, 14: 30,
    15: 25, 16: 20, 17: 15, 18: 10, 19: 5
  };
  return rates[currentLevel] || 5;
}

// Get destruction chance on failure
function getDestructionChance(currentLevel) {
  if (currentLevel <= 5) return 0; // Safe zone
  if (currentLevel === 6) return 20;
  if (currentLevel === 7) return 30;
  if (currentLevel === 8) return 40;
  if (currentLevel === 9) return 50;
  if (currentLevel === 10) return 60;
  if (currentLevel === 11) return 70;
  if (currentLevel === 12) return 80;
  if (currentLevel === 13) return 90;
  if (currentLevel === 14) return 95;
  return 100; // +15 and above = 100% destruction
}

// Get star display based on enchant level
function getStarDisplay(level) {
  if (level === 0) return "";
  if (level <= 5) return " ⭐";
  if (level <= 10) return " ⭐⭐";
  if (level <= 15) return " ⭐⭐⭐";
  return " ⭐⭐⭐⭐";
}

// Get equipment slot from item
function getEquipmentSlot(player, itemId) {
  // Check weapon
  if (player.equipment.weapon.id === itemId) {
    return { type: "weapon", slot: null };
  }
  // Check offhand
  if (player.equipment.offhand.id === itemId) {
    return { type: "offhand", slot: null };
  }
  // Check armor
  for (const slot of ["head", "chest", "legs", "boots"]) {
    if (player.equipment.armor[slot].id === itemId) {
      return { type: "armor", slot };
    }
  }
  // Check accessory
  if (player.equipment.accessory.id === itemId) {
    return { type: "accessory", slot: null };
  }
  return null;
}

// Apply enchant bonus to equipment stats
function applyEnchantBonus(baseStats, enchantLevel) {
  const bonus = enchantLevel * 5; // 5% per level
  const enchantedStats = {};
  
  for (const [stat, value] of Object.entries(baseStats)) {
    enchantedStats[stat] = Math.floor(value * (1 + bonus / 100));
  }
  
  return enchantedStats;
}

// Update equipment stats with enchant bonus
function updateEquipmentStats(equipment, enchantLevel) {
  if (!equipment.baseStats) {
    // First time enchanting - save original stats
    equipment.baseStats = { ...equipment.stats };
  }
  
  // Apply enchant bonus to base stats
  equipment.stats = applyEnchantBonus(equipment.baseStats, enchantLevel);
  equipment.enchantLevel = enchantLevel;
}

// ── Enchant Item ─────────────────────────────────────────

function enchantItem(player, itemName, attempts, lang) {
  // Normalize item name
  const normalizedName = itemName.trim().toLowerCase().replace(/\s+/g, "_");
  
  // Find equipped item
  const equipSlot = getEquipmentSlot(player, normalizedName);
  
  if (!equipSlot) {
    return getText(lang, "enchant.notEquipped", { item: itemName });
  }
  
  // Get equipment reference
  let equipment;
  if (equipSlot.type === "weapon") {
    equipment = player.equipment.weapon;
  } else if (equipSlot.type === "offhand") {
    equipment = player.equipment.offhand;
  } else if (equipSlot.type === "armor") {
    equipment = player.equipment.armor[equipSlot.slot];
  } else if (equipSlot.type === "accessory") {
    equipment = player.equipment.accessory;
  }
  
  // Initialize enchant level if not exists
  if (!equipment.enchantLevel) {
    equipment.enchantLevel = 0;
  }
  
  // Check max level
  if (equipment.enchantLevel >= 20) {
    return getText(lang, "enchant.maxLevel", { item: equipment.name });
  }
  
  // Check enchant stones
  const stonesNeeded = attempts;
  if (!hasItemInInventory(player, "enchant_stone", stonesNeeded)) {
    return getText(lang, "enchant.noStones", { needed: stonesNeeded });
  }
  
  // Perform enchanting
  let results = [];
  let currentLevel = equipment.enchantLevel;
  let destroyed = false;
  
  for (let i = 0; i < attempts; i++) {
    // Check if max level reached
    if (currentLevel >= 20) {
      results.push(getText(lang, "enchant.reachedMax"));
      break;
    }
    
    // Consume enchant stone
    removeFromInventory(player, "enchant_stone", 1);
    
    // Calculate success
    const successRate = getSuccessRate(currentLevel);
    const roll = Math.random() * 100;
    const success = roll < successRate;
    
    if (success) {
      // SUCCESS!
      currentLevel++;
      updateEquipmentStats(equipment, currentLevel);
      const stars = getStarDisplay(currentLevel);
      results.push(
        `✅ ${getText(lang, "enchant.success", { 
          item: equipment.name, 
          level: currentLevel,
          stars: stars
        })}`
      );
    } else {
      // FAILURE
      const destructionChance = getDestructionChance(currentLevel);
      const destroyRoll = Math.random() * 100;
      
      if (destroyRoll < destructionChance) {
        // DESTROYED!
        results.push(
          `💥 ${getText(lang, "enchant.destroyed", { 
            item: equipment.name,
            level: currentLevel
          })}`
        );
        
        // Remove equipment
        if (equipSlot.type === "weapon") {
          player.equipment.weapon = { id: null, name: null, type: null, twoHanded: false, stats: {} };
        } else if (equipSlot.type === "offhand") {
          player.equipment.offhand = { id: null, name: null, type: null, stats: {} };
        } else if (equipSlot.type === "armor") {
          player.equipment.armor[equipSlot.slot] = { id: null, name: null, stats: {} };
        } else if (equipSlot.type === "accessory") {
          player.equipment.accessory = { id: null, name: null, stats: {} };
        }
        
        destroyed = true;
        break;
      } else {
        // Failed but not destroyed
        const stars = getStarDisplay(currentLevel);
        results.push(
          `❌ ${getText(lang, "enchant.failed", { 
            item: equipment.name,
            level: currentLevel,
            stars: stars
          })}`
        );
        break; // Stop on first failure
      }
    }
  }
  
  // Build result message
  let message = `🔮 *${getText(lang, "enchant.title")}*\n\n`;
  message += results.join("\n");
  
  if (!destroyed && currentLevel < 20) {
    const nextSuccessRate = getSuccessRate(currentLevel);
    const nextDestructionChance = getDestructionChance(currentLevel);
    message += `\n\n📊 *${getText(lang, "enchant.nextAttempt")}*\n`;
    message += `${getText(lang, "enchant.successRate")}: ${nextSuccessRate}%\n`;
    if (nextDestructionChance > 0) {
      message += `${getText(lang, "enchant.destructionChance")}: ${nextDestructionChance}%`;
    } else {
      message += `${getText(lang, "enchant.safeZone")}`;
    }
  }
  
  return message;
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Enchant",
  menu: ["enchant"],
  case: ["enchant", "enchanting", "upgrade"],
  description: "Enchant your equipped weapons and armor to increase their stats.",
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

  // Block bot
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];
  const lang = player ? getLanguage(getPlayerLanguage(player)) : getLanguage("id");

  if (!player) {
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

  // Parse command
  if (!q.trim()) {
    return LenwyText(
      `🔮 *${getText(lang, "enchant.usage")}*\n\n` +
      `${getText(lang, "enchant.usageExample")}\n` +
      `• !enchant iron_sword\n` +
      `• !enchant iron_sword 5\n\n` +
      `${getText(lang, "enchant.info")}\n` +
      `• ${getText(lang, "enchant.maxLevel")}: +20\n` +
      `• ${getText(lang, "enchant.bonusPerLevel")}: +5%\n` +
      `• ${getText(lang, "enchant.safeZone")}: +1 to +5\n` +
      `• ${getText(lang, "enchant.material")}: Enchant Stone`
    );
  }

  const args = q.trim().split(/\s+/);
  const itemName = args[0];
  const attempts = parseInt(args[1]) || 1;

  if (attempts < 1 || attempts > 20) {
    return LenwyText(getText(lang, "enchant.invalidAttempts"));
  }

  const result = enchantItem(player, itemName, attempts, lang);

  // Track enchant count for titles and check for newly unlocked titles
  if (!player.stats_tracker) player.stats_tracker = {};
  player.stats_tracker.enchantCount = (player.stats_tracker.enchantCount || 0) + attempts;
  const newTitles = checkAndAwardTitles(player);
  const titleMsg = formatTitleUnlockMessage(newTitles);

  players[normalizedSender] = player;
  savePlayers(players);

  return LenwyText(result + titleMsg);
}
