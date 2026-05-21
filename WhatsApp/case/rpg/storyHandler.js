// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Story Encounter Handler
  Base : Lenwy SCM — RPG Extension

  Handles player choices during story encounters
  Processes outcomes and rewards
*/

import fs from "fs";
import path from "path";
import {
  getEncounterById,
  processChoice,
  canMakeChoice,
  consumeRequiredItems,
  getAvailableChoices,
  getReputationTitle,
  formatReputationBar,
  getStoryText,
} from "../../database/rpg/story.js";
import { storySessions } from "../../database/rpg/sessionManager.js";
import { getEquipmentStats } from "../../database/rpg/equipmentHelper.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { checkLevelUp } from "../../database/rpg/levelHelper.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

function cmdPrefix() {
  return globalThis.noprefix ? "" : "!";
}

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

function addToInventory(player, itemId, qty = 1) {
  if (!player.inventory) player.inventory = [];
  const existing = player.inventory.find((i) => i.id === itemId);
  if (existing) existing.qty += qty;
  else player.inventory.push({ id: itemId, qty });
}

function outcomeTypeKey(type) {
  if (type === "good") return "storyCmd.outcomeTypeGood";
  if (type === "neutral") return "storyCmd.outcomeTypeNeutral";
  if (type === "bad") return "storyCmd.outcomeTypeBad";
  return "storyCmd.outcomeTypeUnknown";
}

// ── Story Choice Handler ─────────────────────────────────

export async function handleStoryChoice(lenwy, replyJid, senderId, choice) {
  const guest = getLanguage("id");
  const session = storySessions.get(senderId);

  if (!session) {
    return lenwy.sendMessage(replyJid, {
      text: getText(guest, "storyCmd.noActiveEncounter"),
    });
  }

  const encounter = getEncounterById(session.encounterId);

  if (!encounter) {
    storySessions.delete(senderId);
    return lenwy.sendMessage(replyJid, {
      text: getText(guest, "storyCmd.encounterNotFound"),
    });
  }

  // Get current stage (if in multi-stage story)
  const currentStage = session.currentStage || null;
  const stageData = currentStage && encounter.stages 
    ? encounter.stages[currentStage] 
    : encounter;

  // Get player language
  const players = loadPlayers();
  const player = players[senderId];
  const lang = player ? getLanguage(getPlayerLanguage(player)) : guest;
  const langCode = lang.code || "en";

  if (!stageData.choices[choice]) {
    const validChoices = Object.keys(stageData.choices)
      .map((k) => getStoryText(stageData.choices[k].label, langCode))
      .join(", ");

    return lenwy.sendMessage(replyJid, {
      text: getText(guest, "storyCmd.invalidChoice", { choices: validChoices }),
    });
  }

  if (!player) {
    storySessions.delete(senderId);
    return lenwy.sendMessage(replyJid, {
      text: getText(lang, "storyCmd.notRegistered"),
    });
  }

  const px = cmdPrefix();
  const playerBag = {};
  for (const item of player.inventory || []) {
    playerBag[item.id] = item.qty;
  }

  const choiceObj = stageData.choices[choice];
  const canMake = canMakeChoice(choiceObj, playerBag, player.gold);

  if (!canMake.canChoose) {
    const availableChoices = getAvailableChoices(stageData, playerBag, player.gold);
    let choicesText = getText(lang, "storyCmd.availableChoicesHeader");

    for (const c of availableChoices) {
      const status = c.canChoose ? "✅" : "❌";
      choicesText += getText(lang, "storyCmd.choiceLineOk", {
        status,
        key: c.key,
        label: c.label,
      });
      if (!c.canChoose && c.reason) {
        choicesText += getText(lang, "storyCmd.choiceLineReason", { reason: c.reason });
      }
    }

    return lenwy.sendMessage(replyJid, {
      text:
        getText(lang, "storyCmd.cannotChooseTitle") +
        `${canMake.reason}` +
        choicesText +
        getText(lang, "storyCmd.chooseAgain", { prefix: px }),
    });
  }

  if (choiceObj.requiredItems) {
    const updatedBag = consumeRequiredItems(choiceObj, playerBag);
    player.inventory = Object.keys(updatedBag).map((id) => ({
      id,
      qty: updatedBag[id],
    }));
  }

  const outcome = processChoice(stageData, choice);

  if (!outcome) {
    storySessions.delete(senderId);
    return lenwy.sendMessage(replyJid, {
      text: getText(lang, "storyCmd.processError"),
    });
  }

  const rewards = outcome.rewards || {};
  let rewardText = "";

  if (typeof player.reputation === "undefined") {
    player.reputation = 0;
  }

  if (rewards.reputation) {
    const oldReputation = player.reputation;
    player.reputation = Math.max(-100, Math.min(100, player.reputation + rewards.reputation));
    const actualChange = player.reputation - oldReputation;

    if (actualChange > 0) {
      rewardText += getText(lang, "storyCmd.repGainGood", { n: String(actualChange) });
    } else if (actualChange < 0) {
      rewardText += getText(lang, "storyCmd.repGainEvil", { n: String(actualChange) });
    }

    const oldTitle = getReputationTitle(oldReputation);
    const newTitle = getReputationTitle(player.reputation);

    if (oldTitle.title !== newTitle.title) {
      rewardText += getText(lang, "storyCmd.repTitleChanged", {
        emoji: newTitle.emoji,
        oldTitle: oldTitle.title,
        newTitle: newTitle.title,
      });
    }
  }

  if (rewards.gold) {
    player.gold = Math.max(0, player.gold + rewards.gold);
    if (rewards.gold > 0) {
      rewardText += getText(lang, "storyCmd.goldGain", { n: String(rewards.gold) });
    } else {
      rewardText += getText(lang, "storyCmd.goldLoss", { n: String(rewards.gold) });
    }
  }

  if (rewards.exp) {
    player.xp = (player.xp || 0) + rewards.exp;
    if (rewards.exp > 0) {
      rewardText += getText(lang, "storyCmd.expGain", { n: String(rewards.exp) });
    } else {
      rewardText += getText(lang, "storyCmd.expLoss", { n: String(rewards.exp) });
    }

    // Check for level ups using centralized helper
    const levelUpInfo = checkLevelUp(player, lang.code);
    if (levelUpInfo.didLevelUp) {
      rewardText += levelUpInfo.message;
    }
  }

  if (rewards.damage) {
    player.stats.hp = Math.max(0, player.stats.hp - rewards.damage);
    rewardText += getText(lang, "storyCmd.damageHp", { n: String(rewards.damage) });

    if (player.stats.hp <= 0) {
      const equipStats = getEquipmentStats(player);
      const actualMaxHp = player.stats.maxHp + (equipStats.hp || 0);

      player.stats.hp = Math.floor(actualMaxHp * 0.5);
      player.gold = Math.floor(player.gold * 0.9);
      rewardText += getText(lang, "storyCmd.knockedOut");
    }
  }

  if (rewards.items && rewards.items.length > 0) {
    for (const item of rewards.items) {
      addToInventory(player, item.id, item.qty);
      rewardText += getText(lang, "storyCmd.itemGain", {
        qty: String(item.qty),
        id: item.id,
      });
    }
  }

  player.lastActive = new Date().toISOString();
  players[senderId] = player;
  savePlayers(players);

  // ═══════════════════════════════════════════════════════
  // CHECK FOR NEXT STAGE (Multi-Stage Story Support)
  // ═══════════════════════════════════════════════════════
  const nextStage = outcome.nextStage;
  
  if (nextStage && encounter.stages && encounter.stages[nextStage]) {
    // Continue to next stage
    const nextStageData = encounter.stages[nextStage];
    
    // Update session with new stage
    storySessions.set(senderId, {
      encounterId: session.encounterId,
      currentStage: nextStage,
      timestamp: Date.now(),
    });

    // Get available choices for next stage
    const nextPlayerBag = {};
    for (const item of player.inventory || []) {
      nextPlayerBag[item.id] = item.qty;
    }
    
    const nextChoices = getAvailableChoices(nextStageData, nextPlayerBag, player.gold);
    const nextChoiceText = nextChoices.map((c) => {
      const status = c.canChoose ? "✅" : "❌";
      const label = getStoryText(c.label, langCode);
      return `${status} *${c.key}* - ${label}`;
    }).join("\n");

    const outcomeEmoji = {
      good: "✅",
      neutral: "➖",
      bad: "❌",
    };

    const emoji = outcomeEmoji[outcome.type] || "❓";
    const typeLabel = getText(lang, outcomeTypeKey(outcome.type));
    const repTitle = getReputationTitle(player.reputation || 0);
    const repBar = formatReputationBar(player.reputation || 0);

    const encounterTitle = getStoryText(encounter.title, langCode);
    const nextStageTitle = getStoryText(nextStageData.title, langCode) || encounterTitle;
    const nextStageDesc = getStoryText(nextStageData.description, langCode);
    const outcomeText = getStoryText(outcome.text, langCode);

    // Send outcome + next stage
    return lenwy.sendMessage(replyJid, {
      text:
        `${encounter.emoji} *${encounterTitle}*\n\n` +
        `${outcome.choice}\n\n` +
        getText(lang, "storyCmd.outcomeDivider") +
        getText(lang, "storyCmd.outcomeBanner", { emoji, typeLabel }) +
        getText(lang, "storyCmd.outcomeDivider") +
        `\n` +
        `${outcomeText}` +
        (rewardText ? `${getText(lang, "storyCmd.rewardsHeader")}${rewardText}` : "") +
        `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
        `${encounter.emoji} *${nextStageTitle}*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${nextStageDesc}\n\n` +
        `*${lang.code === "id" ? "Apa yang akan kamu lakukan?" : "What will you do?"}*\n` +
        `${nextChoiceText}\n\n` +
        `${lang.code === "id" ? "Gunakan" : "Use"}: *!story <choice>*\n\n` +
        getText(lang, "storyCmd.footerGold", { gold: String(player.gold) }) +
        getText(lang, "storyCmd.footerExp", { exp: String(player.xp) }) +
        getText(lang, "storyCmd.footerHp", {
          hp: String(player.stats.hp),
          maxHp: String(player.stats.maxHp),
        }) +
        getText(lang, "storyCmd.footerRepLine", {
          emoji: repTitle.emoji,
          title: repTitle.title,
          value: String(player.reputation),
        }) +
        `${repBar}`,
    });
  }

  // No next stage - story ends here
  storySessions.delete(senderId);

  const outcomeEmoji = {
    good: "✅",
    neutral: "➖",
    bad: "❌",
  };

  const emoji = outcomeEmoji[outcome.type] || "❓";

  const typeLabel = getText(lang, outcomeTypeKey(outcome.type));

  const repTitle = getReputationTitle(player.reputation || 0);
  const repBar = formatReputationBar(player.reputation || 0);

  const encounterTitle = getStoryText(encounter.title, langCode);
  const outcomeText = getStoryText(outcome.text, langCode);

  return lenwy.sendMessage(replyJid, {
    text:
      `${encounter.emoji} *${encounterTitle}*\n\n` +
      `${outcome.choice}\n\n` +
      getText(lang, "storyCmd.outcomeDivider") +
      getText(lang, "storyCmd.outcomeBanner", { emoji, typeLabel }) +
      getText(lang, "storyCmd.outcomeDivider") +
      `\n` +
      `${outcomeText}` +
      (rewardText ? `${getText(lang, "storyCmd.rewardsHeader")}${rewardText}` : "") +
      getText(lang, "storyCmd.footerGold", { gold: String(player.gold) }) +
      getText(lang, "storyCmd.footerExp", { exp: String(player.exp) }) +
      getText(lang, "storyCmd.footerHp", {
        hp: String(player.stats.hp),
        maxHp: String(player.stats.maxHp),
      }) +
      getText(lang, "storyCmd.footerRepLine", {
        emoji: repTitle.emoji,
        title: repTitle.title,
        value: String(player.reputation),
      }) +
      `${repBar}` +
      getText(lang, "storyCmd.continueHint", { prefix: px }),
  });
}

export default {
  handleStoryChoice,
};
