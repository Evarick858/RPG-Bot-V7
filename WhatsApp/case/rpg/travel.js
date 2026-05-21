// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Commands : !location, !travel
  Base : Lenwy SCM — RPG Extension

  !location           → shows current location + available actions + connected locations
  !travel <name>      → travel to a directly connected location

  Rules:
  - Player must be registered
  - Destination must be directly connected to current location
  - Player must meet the minLevel requirement of the destination
  - Bot is excluded from all RPG commands
*/

import fs from "fs";
import path from "path";
import { getLocationById, areConnected, getReachableLocations, canDoAction } from "../../database/rpg/locations.js";
import { startHunt } from "./hunt.js";
import { getRandomEncounter, getAvailableChoices, getStoryText } from "../../database/rpg/story.js";
import { storySessions } from "../../database/rpg/sessionManager.js";
import { trackTravel } from "../../database/rpg/questTracker.js";
import { checkAndAwardTitles, formatTitleUnlockMessage } from "../../database/rpg/titles.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { findLocationMatch, getAutoCorrectMessage } from "../../database/rpg/fuzzyMatch.js";

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

// Action display labels
const actionLabels = {
  hunt:   "🏹 Hunt",
  mine:   "⛏️ Mine",
  chop:   "🪓 Chop",
  fish:   "🎣 Fish",
  forage: "🍄 Forage",
  shop:   "🛒 Shop",
};

// Normalize location name input → id
// Accepts: "deep forest", "deep_forest", "DeepForest", "forest" etc.
function normalizeLocationInput(input) {
  return input.trim().toLowerCase().replace(/\s+/g, "_");
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Travel",
  menu: ["location"],
  case: ["location", "lokasi", "travel", "pergi", "map", "peta"],
  description: "View your current location or travel to a connected location.",
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
  const {
    command,
    q,
    lenwy,
    replyJid,
    LenwyText,
    normalizedSender,
  } = leni;

  // Block bot from using RPG commands
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  // Must be registered
  if (!player) {
    const lang = getLanguage("id");
    return LenwyText(
      `⚠️ *${getText(lang, "common.notRegistered")}*\n\n` +
      getText(lang, "common.registerFirst")
    );
  }

  const lang = getLanguage(getPlayerLanguage(player));

  // Update last active
  player.lastActive = new Date().toISOString();

  const currentLoc = getLocationById(player.currentLocation);

  // ════════════════════════════════════════
  // COMMAND: !map / !peta
  // ════════════════════════════════════════
  if (command === "map" || command === "peta") {
    return LenwyText(
      `🗺️ *World Map*\n\n` +
      `Explore the full world map here:\n` +
      `🔗 https://worldmap-two-kohl.vercel.app\n\n` +
      `💡 *Tips:*\n` +
      `• Use the map to plan your travels\n` +
      `• See all locations and connections\n` +
      `• Type *!location* to see where you are now\n` +
      `• Type *!travel <location>* to move`
    );
  }

  // ════════════════════════════════════════
  // COMMAND: !location / !lokasi
  // ════════════════════════════════════════
  if (command === "location" || command === "lokasi") {
    if (!currentLoc) {
      return LenwyText(getText(lang, "travel.locationError"));
    }

    const reachable = getReachableLocations(player.currentLocation);
    const safeTag = currentLoc.safe ? "✅ Safe Zone" : "⚠️ Dangerous Zone";

    // Available actions
    const actionText = currentLoc.actions.length > 0
      ? currentLoc.actions.map((a) => actionLabels[a] || a).join("  |  ")
      : "None";

    // Connected locations
    const connectedText = reachable.map((loc) => {
      // Show warning emoji only if location level is higher than player level
      const isHarder = loc.minLevel > player.level;
      const warningEmoji = isHarder ? "⚠️ " : "";
      const levelWarning = isHarder ? ` *(Hard - Lv.${loc.minLevel} recommended)*` : "";
      const safeIcon = loc.safe ? "✅" : "";
      return `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}${levelWarning}`;
    }).join("\n");

    // Find other players in the same location
    const playersInLocation = [];
    for (const [jid, p] of Object.entries(players)) {
      // Skip self, skip non-players (like _comment, _template)
      if (jid === normalizedSender || jid.startsWith("_") || !p.currentLocation) continue;
      
      // Check if player is in the same location
      if (p.currentLocation === player.currentLocation) {
        playersInLocation.push({
          name: p.name,
          level: p.level,
          class: p.class,
        });
      }
    }

    // Build players in location text
    let playersText = "";
    if (playersInLocation.length > 0) {
      playersText = `\n👥 *Players Here:* (${playersInLocation.length})\n`;
      playersInLocation.forEach(p => {
        const className = p.class.charAt(0).toUpperCase() + p.class.slice(1);
        playersText += `• ${p.name} (Lv.${p.level} ${className})\n`;
      });
      playersText += `\n`;
    }

    return LenwyText(
      `${getText(lang, "location.title")}\n` +
      `${currentLoc.emoji} *${currentLoc.name}*\n` +
      `${safeTag}\n\n` +
      `📖 ${currentLoc.description}\n\n` +
      `${getText(lang, "location.actions")}\n` +
      `${actionText}\n` +
      `${playersText}\n` +
      `${getText(lang, "location.connected")}\n` +
      `${connectedText}\n\n` +
      `${getText(lang, "location.travelHint")}`
    );
  }

  // ════════════════════════════════════════
  // COMMAND: !travel / !pergi <location name>
  // ════════════════════════════════════════
  if (command === "travel" || command === "pergi") {
    if (!q.trim()) {
      // Show available locations when no destination is specified
      const reachable = getReachableLocations(player.currentLocation);
      const safeTag = currentLoc.safe ? "✅ Safe Zone" : "⚠️ Dangerous Zone";
      
      // Build text list for all locations
      const connectedText = reachable.map((loc) => {
        const isHarder = loc.minLevel > player.level;
        const warningEmoji = isHarder ? "⚠️ " : "";
        const levelWarning = isHarder ? ` *(Hard - Lv.${loc.minLevel} recommended)*` : "";
        const safeIcon = loc.safe ? "✅" : "";
        return `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}${levelWarning}`;
      }).join("\n");

      // Try to send with buttons first
      try {
        const buttons = [];
        for (let i = 0; i < Math.min(reachable.length, 3); i++) {
          const loc = reachable[i];
          const isHarder = loc.minLevel > player.level;
          const warningEmoji = isHarder ? "⚠️ " : "";
          const safeIcon = loc.safe ? "✅ " : "";
          
          // ButtonId = command, DisplayText = pretty with emoji
          buttons.push({
            buttonId: `!travel ${loc.name.toLowerCase()}`,  // Actual command
            buttonText: { displayText: `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}` },  // Pretty display
            type: 1,
          });
        }

        const buttonMessage = {
          text: `🗺️ *Travel Menu*\n\n` +
                `📍 *Current Location:*\n` +
                `${currentLoc.emoji} ${currentLoc.name}\n` +
                `${safeTag}\n\n` +
                `✈️ *Available Destinations:*\n` +
                `${connectedText}\n\n` +
                `💡 *Quick Travel:*\n` +
                `Click a button below or type the command manually`,
          footer: "Evarick RPG",
          buttons: buttons,
          headerType: 1,
        };

        const messageOptions = { ...buttonMessage };
        // Add quote if in group
        if (leni.isGroup) {
          messageOptions.quoted = leni.len;
        }

        await lenwy.sendMessage(replyJid, messageOptions);
        return;
      } catch (error) {
        console.error("[TRAVEL] Button send failed, falling back to text:", error);
        
        // Fallback to text-only
        return LenwyText(
          `🗺️ *Travel Menu*\n\n` +
          `📍 *Current Location:*\n` +
          `${currentLoc.emoji} ${currentLoc.name}\n` +
          `${safeTag}\n\n` +
          `✈️ *Available Destinations:*\n` +
          `${connectedText}\n\n` +
          `💡 *How to travel:*\n` +
          `Type *!travel <location name>*\n` +
          `Example: *!travel forest*\n\n` +
          `Type *!location* for more details about your current location.`
        );
      }
    }

    // Get all reachable locations for fuzzy matching
    const reachable = getReachableLocations(player.currentLocation);
    
    // Try fuzzy matching first
    const fuzzyResult = findLocationMatch(q, reachable, 0.5);
    
    let destLoc = null;
    let autoCorrectMsg = "";
    
    if (fuzzyResult) {
      destLoc = fuzzyResult.location;
      if (fuzzyResult.corrected) {
        autoCorrectMsg = getAutoCorrectMessage(q, destLoc.name, lang.code);
      }
    } else {
      // Fallback to exact match by ID
      const destId = normalizeLocationInput(q);
      destLoc = getLocationById(destId);
    }

    // Unknown location
    if (!destLoc) {
      return LenwyText(
        `❓ *"${q}" is not a known location.*\n\n` +
        `Type *!location* to see available destinations.`
      );
    }

    const destId = destLoc.id;

    // Already there
    if (destId === player.currentLocation) {
      return LenwyText(
        `📍 *You are already at ${currentLoc.emoji} ${currentLoc.name}!*`
      );
    }

    // Not directly connected
    if (!areConnected(player.currentLocation, destId)) {
      // Find if they've been to a location that connects to destination
      const hint = getReachableLocations(player.currentLocation)
        .map((l) => `${l.emoji} *${l.name}*`)
        .join(", ");

      return LenwyText(
        `${autoCorrectMsg}` +
        `🚫 *You can't travel directly to ${destLoc.emoji} ${destLoc.name}.*\n\n` +
        `You must travel through connected locations first.\n\n` +
        `📍 From *${currentLoc.name}* you can go to:\n${hint}\n\n` +
        `Type *!location* to see the full map.`
      );
    }

    // Level requirement check - just warn but allow travel
    const levelWarning = player.level < destLoc.minLevel
      ? `\n⚠️ *Warning: This area is dangerous for Level ${player.level}! (Recommended: Lv.${destLoc.minLevel})*\n`
      : "";

    // All good — travel
    const wasUnlocked = player.unlockedLocations.includes(destId);
    player.currentLocation = destId;

    if (!wasUnlocked) {
      player.unlockedLocations.push(destId);
    }

    players[normalizedSender] = player;
    savePlayers(players);

    // Track quest progress (only count new locations)
    if (!wasUnlocked) {
      trackTravel(normalizedSender, 1);
    }

    // Check for newly unlocked titles (location count may have changed)
    const newTitles = checkAndAwardTitles(player);
    if (newTitles.length > 0) {
      players[normalizedSender] = player;
      savePlayers(players);
    }
    const titleMsg = formatTitleUnlockMessage(newTitles);

    const safeTag = destLoc.safe ? "✅ Safe Zone" : "⚠️ Dangerous Zone";
    const actionText = destLoc.actions.length > 0
      ? destLoc.actions.map((a) => actionLabels[a] || a).join("  |  ")
      : "None";

    const discoveredText = wasUnlocked ? "" : `\n🗺️ *New location discovered!*`;

    // ═══════════════════════════════════════════════════════
    // DYNAMIC AMBUSH CHANCE (based on level difference and luck)
    // ═══════════════════════════════════════════════════════
    if (!destLoc.safe) {
      // Base ambush chance
      let ambushChance = 20;
      
      // Level difference penalty (max +70% for total of 90%)
      if (player.level < destLoc.minLevel) {
        const levelDiff = destLoc.minLevel - player.level;
        // Scale: 1 level diff = ~2.5% increase, caps at 70%
        const levelPenalty = Math.min(70, levelDiff * 2.5);
        ambushChance += levelPenalty;
      }
      
      // Luck reduction (max -15% when luck >= 99)
      const playerLuck = player.stats.luck || 0;
      const luckReduction = Math.min(15, (playerLuck / 99) * 15);
      ambushChance -= luckReduction;
      
      // Ensure ambush chance stays within bounds (5% min, 90% max)
      ambushChance = Math.max(5, Math.min(90, ambushChance));
      
      const enemyRoll = Math.random() * 100;
      
      if (enemyRoll < ambushChance) {
        // Enemy ambush! Start combat immediately
        await LenwyText(
          `${autoCorrectMsg}` +
          `🚶 *Travelling to ${destLoc.emoji} ${destLoc.name}...*${levelWarning}\n` +
          `${discoveredText}\n\n` +
          `⚔️ *AMBUSH!*\n\n` +
          `An enemy appears on the road!\n` +
          `Prepare for battle...`
        );
        
        // Small delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Start hunt/combat
        await startHunt(lenwy, replyJid, normalizedSender, player);
        return;
      }
    }

    // ═══════════════════════════════════════════════════════
    // 10% CHANCE OF STORY ENCOUNTER
    // ═══════════════════════════════════════════════════════
    const encounterChance = Math.random() * 100;
    
    if (encounterChance < 10) {
      // Try to get a story encounter for this location
      const encounter = getRandomEncounter(destId);
      
      if (encounter) {
        // Store encounter session
        storySessions.set(normalizedSender, {
          encounterId: encounter.id,
          timestamp: Date.now(),
        });

        // Convert player inventory to bag format for checking
        const playerBag = {};
        for (const item of player.inventory) {
          playerBag[item.id] = item.qty;
        }

        // Get available choices with requirement checks
        const choices = getAvailableChoices(encounter, playerBag, player.gold);
        const choiceText = choices.map((c) => {
          const status = c.canChoose ? "✅" : "❌";
          return `${status} *${c.key}* - ${c.label}`;
        }).join("\n");

        // Get connected locations from new destination
        const nextLocations = getReachableLocations(destId);
        const nextLocationsText = nextLocations.map((loc) => {
          const isHarder = loc.minLevel > player.level;
          const warningEmoji = isHarder ? "⚠️ " : "";
          const levelWarning = isHarder ? ` *(Lv.${loc.minLevel})*` : "";
          const safeIcon = loc.safe ? "✅" : "";
          return `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}${levelWarning}`;
        }).join("\n");

        // Get player language for bilingual story text
        const lang = getLanguage(getPlayerLanguage(player));
        const langCode = lang.code || "en";
        
        const encounterTitle = getStoryText(encounter.title, langCode);
        const encounterDesc = getStoryText(encounter.description, langCode);

        return LenwyText(
          `${autoCorrectMsg}` +
          `🚶 *Travelling to ${destLoc.emoji} ${destLoc.name}...*${levelWarning}\n` +
          `${discoveredText}\n` +
          `📍 *You arrived at ${destLoc.emoji} ${destLoc.name}*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `${encounter.emoji} *${encounterTitle}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `${encounterDesc}\n\n` +
          `*What will you do?*\n` +
          `${choiceText}\n\n` +
          `Use: *!story <choice>* (e.g., !story help)\n` +
          `Choices: take, run, fight, leave, talk, help, ignore\n\n` +
          `🗺️ *After this, you can travel to:*\n` +
          `${nextLocationsText}`
        );
      }
    }

    // Get connected locations from new destination
    const nextLocations = getReachableLocations(destId);
    const nextLocationsText = nextLocations.map((loc) => {
      const isHarder = loc.minLevel > player.level;
      const warningEmoji = isHarder ? "⚠️ " : "";
      const levelWarning = isHarder ? ` *(Lv.${loc.minLevel})*` : "";
      const safeIcon = loc.safe ? "✅" : "";
      return `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}${levelWarning}`;
    }).join("\n");

    // Build message text
    const travelMessage = 
      `${autoCorrectMsg}` +
      `${getText(lang, "travel.travelTo", {location: destLoc.name})}${levelWarning}\n` +
      `${discoveredText}\n` +
      `${getText(lang, "travel.arrived", {location: destLoc.name})}\n` +
      `${safeTag}\n\n` +
      `📖 ${destLoc.description}\n\n` +
      `${getText(lang, "travel.actions")}\n` +
      `${actionText}\n\n` +
      `🗺️ *${lang.code === "id" ? "Kamu bisa pergi ke" : "You can travel to"}:*\n` +
      `${nextLocationsText}\n\n` +
      `${lang.code === "id" ? "Klik tombol di bawah untuk berpindah cepat!" : "Click buttons below for quick travel!"}` +
      titleMsg;

    // Build travel destination buttons (max 3)
    const buttons = [];
    for (let i = 0; i < Math.min(nextLocations.length, 3); i++) {
      const loc = nextLocations[i];
      const isHarder = loc.minLevel > player.level;
      const warningEmoji = isHarder ? "⚠️ " : "";
      const safeIcon = loc.safe ? "✅ " : "";
      
      buttons.push({
        buttonId: `!travel ${loc.name.toLowerCase()}`,
        buttonText: { displayText: `${safeIcon}${warningEmoji}${loc.emoji} ${loc.name}` },
        type: 1,
      });
    }

    // Send with buttons if available
    if (buttons.length > 0) {
      try {
        const buttonMessage = {
          text: travelMessage,
          footer: "Evarick RPG",
          buttons: buttons,
          headerType: 1,
        };

        const messageOptions = { ...buttonMessage };
        if (leni.isGroup) {
          messageOptions.quoted = leni.len;
        }

        return await lenwy.sendMessage(replyJid, messageOptions);
      } catch (error) {
        console.error("[TRAVEL] Button send failed:", error);
        // Fallback to text-only
        return LenwyText(travelMessage);
      }
    }

    // Normal travel (no buttons if no next locations)
    return LenwyText(travelMessage);
  }
}
