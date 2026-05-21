// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : quests
  Base : Lenwy SCM — RPG Extension

  View daily, weekly, and monthly quests
  
  Usage:
  - quests
  - quests daily
  - quests weekly
  - quests monthly
*/

import fs from "fs";
import path from "path";
import { 
  getQuestsByType, 
  getQuestById, 
  shouldResetQuests, 
  resetQuestsForPeriod,
  initPlayerQuests 
} from "../../database/rpg/quests.js";
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

// ── Build Quest Display ──────────────────────────────────

function buildQuestDisplay(period, playerQuests, lang) {
  const periodData = playerQuests[period];
  if (!periodData) return "";
  
  // Check if needs reset
  if (shouldResetQuests(periodData.lastReset, period)) {
    resetQuestsForPeriod(playerQuests, period);
  }
  
  const questList = getQuestsByType(period);
  const periodName = period.toUpperCase();
  let display = `📜 *${lang.code === "id" ? `QUEST ${periodName === "DAILY" ? "HARIAN" : periodName === "WEEKLY" ? "MINGGUAN" : "BULANAN"}` : `${periodName} QUESTS`}*\n\n`;
  
  let completedCount = 0;
  let claimedCount = 0;
  
  for (const playerQuest of periodData.quests) {
    const questDef = getQuestById(playerQuest.id);
    if (!questDef) continue;
    
    // Simple checklist format
    let status = "";
    if (playerQuest.claimed) {
      status = "✅";
      claimedCount++;
    } else if (playerQuest.completed) {
      status = "🎁";
      completedCount++;
    } else {
      status = "❌";
    }
    
    display += `${status} *${questDef.name}*\n`;
    display += `   ${questDef.description}\n`;
    display += `   💰 ${questDef.rewards.gold}g | ⭐ ${questDef.rewards.exp} exp`;
    
    if (questDef.rewards.items && questDef.rewards.items.length > 0) {
      const itemList = questDef.rewards.items.map(i => `${i.id} x${i.qty}`).join(", ");
      display += ` | 🎁 ${itemList}`;
    }
    
    display += `\n\n`;
  }
  
  // Summary
  display += `========================\n`;
  display += `📊 ${getText(lang, "quests.progress", {claimed: claimedCount, total: questList.length})}\n`;
  
  if (completedCount > 0) {
    display += `\n${getText(lang, "quests.readyToClaim", {count: completedCount})}\n`;
    display += `${lang.code === "id" ? `Ketik *claim ${period}* untuk klaim hadiah` : `Type *claim ${period}* to claim rewards`}`;
  } else if (claimedCount === questList.length) {
    display += `\n${getText(lang, "quests.allClaimed")}`;
  } else {
    display += `\n${getText(lang, "quests.keepGoing")}`;
  }
  
  return display;
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Quests",
  menu: ["quests", "quest"],
  case: ["quests", "quest", "misi", "tugas"],
  description: "View your daily, weekly, and monthly quests.",
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
  const { lenwy, replyJid, normalizedSender, LenwyText, args } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const lang = getLanguage("id");
    return LenwyText(`⚠️ *${getText(lang, "common.notRegistered")}*\n\n${getText(lang, "common.registerFirst")}`);
  }

  const lang = getLanguage(getPlayerLanguage(player));

  // Initialize quests if not exists
  if (!player.quests) {
    player.quests = initPlayerQuests();
    players[normalizedSender] = player;
    savePlayers(players);
  }

  // Parse command
  const period = args[0]?.toLowerCase();

  if (!period) {
    // Show overview of all quests with buttons
    let message = `${getText(lang, "quests.title")}\n\n`;
    
    // Daily summary
    const dailyCompleted = player.quests.daily.quests.filter(q => q.completed && !q.claimed).length;
    const dailyTotal = player.quests.daily.quests.length;
    message += `${getText(lang, "quests.daily", {completed: dailyCompleted, total: dailyTotal})}\n`;
    
    // Weekly summary
    const weeklyCompleted = player.quests.weekly.quests.filter(q => q.completed && !q.claimed).length;
    const weeklyTotal = player.quests.weekly.quests.length;
    message += `${getText(lang, "quests.weekly", {completed: weeklyCompleted, total: weeklyTotal})}\n`;
    
    // Monthly summary
    const monthlyCompleted = player.quests.monthly.quests.filter(q => q.completed && !q.claimed).length;
    const monthlyTotal = player.quests.monthly.quests.length;
    message += `${getText(lang, "quests.monthly", {completed: monthlyCompleted, total: monthlyTotal})}\n\n`;
    
    message += `========================\n\n`;
    message += getText(lang, "quests.selectCategory");
    
    try {
      // Send message with 3 quest category buttons
      const buttonMessage = {
        text: message,
        footer: "Evarick RPG",
        buttons: [
          {
            buttonId: "quest_daily",
            buttonText: { displayText: getText(lang, "quests.dailyButton") },
            type: 1,
          },
          {
            buttonId: "quest_weekly",
            buttonText: { displayText: getText(lang, "quests.weeklyButton") },
            type: 1,
          },
          {
            buttonId: "quest_monthly",
            buttonText: { displayText: getText(lang, "quests.monthlyButton") },
            type: 1,
          },
        ],
        headerType: 1,
      };
      
      await lenwy.sendMessage(replyJid, buttonMessage);
      return;
    } catch (error) {
      console.error("[QUESTS] Button send failed:", error);
      // Fallback to text with instructions
      message += `\n\n*${getText(lang, "quests.viewSpecific")}*\n`;
      message += `• quests daily\n`;
      message += `• quests weekly\n`;
      message += `• quests monthly`;
      return LenwyText(message);
    }
  }

  // Show specific period
  if (period === "daily" || period === "weekly" || period === "monthly") {
    const display = buildQuestDisplay(period, player.quests, lang);
    
    // Check if there are completed quests ready to claim
    const completedCount = player.quests[period].quests.filter(q => q.completed && !q.claimed).length;
    
    console.log(`[QUESTS] Period: ${period}, Completed quests ready to claim: ${completedCount}`);
    
    if (completedCount > 0) {
      try {
        // Send message with claim button
        const buttonMessage = {
          text: display,
          footer: "Evarick RPG",
          buttons: [
            {
              buttonId: `claim_${period}`,
              buttonText: { displayText: `🎁 Claim ${period.charAt(0).toUpperCase() + period.slice(1)}` },
              type: 1,
            },
          ],
          headerType: 1,
        };
        
        console.log(`[QUESTS] Sending button with buttonId: claim_${period}`);
        await lenwy.sendMessage(replyJid, buttonMessage);
        return;
      } catch (error) {
        console.error("[QUESTS] Button send failed:", error);
        return LenwyText(display);
      }
    } else {
      // No completed quests, just show text
      console.log(`[QUESTS] No completed quests, showing text only`);
      return LenwyText(display);
    }
  }

  return LenwyText(
    getText(lang, "quests.invalidPeriod") +
    `\n\n${lang.code === "id" ? "Penggunaan" : "Usage"}:\n` +
    `• quests - ${lang.code === "id" ? "Lihat ringkasan" : "View overview"}\n` +
    `• quests daily - ${lang.code === "id" ? "Lihat quest harian" : "View daily quests"}\n` +
    `• quests weekly - ${lang.code === "id" ? "Lihat quest mingguan" : "View weekly quests"}\n` +
    `• quests monthly - ${lang.code === "id" ? "Lihat quest bulanan" : "View monthly quests"}`
  );
}
