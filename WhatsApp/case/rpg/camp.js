// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : camp
  Base : Lenwy SCM — RPG Extension

  Camp System:
  - Available in locations WITHOUT shops
  - Regenerates 1% HP and Mana per second
  - Animated message updates
  - Provides "camping" status (prevents instant PVP attacks)
  - Can still accept/decline challenges while camping

  NOTE: `/leave` is shared with inn — inn sessions delegate to inn.js when `session.isInn`.
*/

import fs from "fs";
import path from "path";
import { getLocationById } from "../../database/rpg/locations.js";
import { campSessions } from "../../database/rpg/sessionManager.js";
import { getEquipmentStats } from "../../database/rpg/equipmentHelper.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";
import { leaveInn } from "./inn.js";

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

function savePlayers(players) {
  const raw = fs.readFileSync(playersPath, "utf8");
  const data = JSON.parse(raw);
  const updated = { _comment: data._comment, _template: data._template, ...players };
  fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), "utf8");
}

function campAnimFrames(lang) {
  const a = getText(lang, "campCmd.animA");
  const b = getText(lang, "campCmd.animB");
  return [a, b, a, b];
}

function cmdPrefix() {
  return globalThis.noprefix ? "" : "!";
}

// ── Start Camping ────────────────────────────────────────

export async function startCamp(lenwy, replyJid, playerJid, player, langProvided) {
  const lang =
    langProvided || getLanguage(getPlayerLanguage(player));
  const prefix = cmdPrefix();

  const location = getLocationById(player.currentLocation);

  if (!location) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "campCmd.invalidLocation"),
    });
    return;
  }

  if (location.actions.includes("shop")) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "campCmd.cantCampInTown", { prefix }),
    });
    return;
  }

  if (campSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "campCmd.alreadyCamping"),
    });
    return;
  }

  const { combatSessions } = await import("../../database/rpg/sessionManager.js");
  if (combatSessions.has(playerJid)) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "campCmd.cannotInCombat"),
    });
    return;
  }

  const initialHp = player.stats.hp;
  const initialMana = player.stats.mana;

  const equipStats = getEquipmentStats(player);
  const maxHp = player.stats.maxHp + (equipStats.hp || 0);
  const maxMana = player.stats.maxMana + (equipStats.mana || 0);

  // Camp can only heal up to 60% HP and 50% Mana
  const campHpCap = Math.floor(maxHp * 0.6);
  const campManaCap = Math.floor(maxMana * 0.5);

  if (initialHp >= campHpCap && initialMana >= campManaCap) {
    await lenwy.sendMessage(replyJid, {
      text: lang.code === "id"
        ? `⚠️ *HP sudah di atas 60% dan Mana di atas 50%!*\n\n` +
          `❤️ HP: ${initialHp}/${maxHp} (${Math.floor((initialHp/maxHp)*100)}%)\n` +
          `💙 Mana: ${initialMana}/${maxMana} (${Math.floor((initialMana/maxMana)*100)}%)\n\n` +
          `💡 *Camp heal limit:*\n` +
          `• HP: sampai 60%\n` +
          `• Mana: sampai 50%\n\n` +
          `Untuk full heal, kunjungi *Inn* di kota!\n\n` +
          `Ketik *${prefix}inn* di kota untuk full heal + buff.`
        : `⚠️ *HP is already above 60% and Mana above 50%!*\n\n` +
          `❤️ HP: ${initialHp}/${maxHp} (${Math.floor((initialHp/maxHp)*100)}%)\n` +
          `💙 Mana: ${initialMana}/${maxMana} (${Math.floor((initialMana/maxMana)*100)}%)\n\n` +
          `💡 *Camp heal limit:*\n` +
          `• HP: up to 60%\n` +
          `• Mana: up to 50%\n\n` +
          `For full heal, visit an *Inn* in town!\n\n` +
          `Type *${prefix}inn* in town for full heal + buff.`
    });
    return;
  }

  const sent = await lenwy.sendMessage(replyJid, {
    text: getText(lang, "campCmd.settingUpCamp", {
      hp: String(initialHp),
      maxHp: String(maxHp),
      mana: String(initialMana),
      maxMana: String(maxMana),
    }),
  });

  const frames = campAnimFrames(lang);

  const session = {
    playerJid,
    replyJid,
    messageKey: sent?.key,
    startTime: Date.now(),
    currentHp: initialHp,
    currentMana: initialMana,
    maxHp,
    maxMana,
    frameIndex: 0,
    secondsElapsed: 0,
    uiLangCode: lang.code,
    campFramesCached: frames,
  };

  campSessions.set(playerJid, session);

  startRegenLoop(lenwy, session);
}

// ── Regeneration Loop ────────────────────────────────────

async function startRegenLoop(lenwy, session) {
  const MAX_CAMP_TIME = 300;
  const UPDATE_EVERY  = 10; // update message every 10 seconds
  const prefix = cmdPrefix();

  const interval = setInterval(async () => {
    if (!campSessions.has(session.playerJid)) {
      clearInterval(interval);
      return;
    }

    const lang = getLanguage(session.uiLangCode || "id");

    session.secondsElapsed++;

    // Regen every second
    const hpRegen   = Math.ceil(session.maxHp   * 0.01);
    const manaRegen = Math.ceil(session.maxMana  * 0.01);

    const oldHp   = session.currentHp;
    const oldMana = session.currentMana;

    const campHpCap   = Math.floor(session.maxHp   * 0.6);
    const campManaCap = Math.floor(session.maxMana  * 0.5);

    session.currentHp   = Math.min(session.currentHp   + hpRegen,   campHpCap);
    session.currentMana = Math.min(session.currentMana + manaRegen, campManaCap);

    const hpGained   = session.currentHp   - oldHp;
    const manaGained = session.currentMana - oldMana;

    const reachedCampCap =
      session.currentHp >= campHpCap && session.currentMana >= campManaCap;

    // Save to DB every 10 seconds
    if (session.secondsElapsed % UPDATE_EVERY === 0 || reachedCampCap || session.secondsElapsed >= MAX_CAMP_TIME) {
      const players = loadPlayers();
      const playerData = players[session.playerJid];
      if (playerData) {
        playerData.stats.hp   = session.currentHp;
        playerData.stats.mana = session.currentMana;
        playerData.lastActive = new Date().toISOString();
        players[session.playerJid] = playerData;
        savePlayers(players);
      }
    }

    // Timeout
    if (session.secondsElapsed >= MAX_CAMP_TIME) {
      clearInterval(interval);
      campSessions.delete(session.playerJid);
      try {
        await lenwy.sendMessage(session.replyJid, {
          text: getText(lang, "campCmd.timeoutReached", {
            mins: "5",
            hp:    String(session.currentHp),
            maxHp: String(session.maxHp),
            mana:  String(session.currentMana),
            maxMana: String(session.maxMana),
            prefix,
          }),
        });
      } catch (err) {
        console.error("[CAMP] Failed to send timeout message:", err.message);
      }
      return;
    }

    // Only send a UI update every UPDATE_EVERY seconds (or when done)
    if (session.secondsElapsed % UPDATE_EVERY !== 0 && !reachedCampCap) return;

    session.frameIndex = (session.frameIndex + 1) % (session.campFramesCached?.length || 4);
    const frameList = session.campFramesCached || campAnimFrames(lang);
    const frame = frameList[session.frameIndex % frameList.length];

    let statusText = `${frame}\n\n`;

    if (reachedCampCap) {
      statusText += lang.code === "id"
        ? `✅ *Istirahat Selesai!*\n\n` +
          `❤️ HP: ${session.currentHp}/${session.maxHp} (60%)\n` +
          `💙 Mana: ${session.currentMana}/${session.maxMana} (50%)\n` +
          `⏱️ Waktu: ${session.secondsElapsed} detik\n\n` +
          `💡 *Camp heal limit:*\n• HP: sampai 60%\n• Mana: sampai 50%\n\n` +
          `Untuk full heal, kunjungi *Inn* di kota!\n\nKetik *${prefix}leave* untuk keluar.`
        : `✅ *Rest Complete!*\n\n` +
          `❤️ HP: ${session.currentHp}/${session.maxHp} (60%)\n` +
          `💙 Mana: ${session.currentMana}/${session.maxMana} (50%)\n` +
          `⏱️ Time: ${session.secondsElapsed} seconds\n\n` +
          `💡 *Camp heal limit:*\n• HP: up to 60%\n• Mana: up to 50%\n\n` +
          `For full heal, visit an *Inn* in town!\n\nType *${prefix}leave* to exit.`;
    } else {
      const hpPct   = Math.floor((session.currentHp   / session.maxHp)   * 100);
      const manaPct = Math.floor((session.currentMana / session.maxMana) * 100);
      statusText += getText(lang, "campCmd.regenBanner", {
        hp:      String(session.currentHp),
        maxHp:   String(session.maxHp),
        hpPct:   String(hpPct),
        hpGain:  String(hpGained),
        mana:    String(session.currentMana),
        maxMana: String(session.maxMana),
        manaPct: String(manaPct),
        manaGain: String(manaGained),
        secs:    String(session.secondsElapsed),
      });
    }

    try {
      // Just send a new message — no delete spam
      await lenwy.sendMessage(session.replyJid, { text: statusText });
    } catch (err) {
      console.error("[CAMP] Failed to send update:", err.message);
      clearInterval(interval);
      campSessions.delete(session.playerJid);
      return;
    }

    if (reachedCampCap) {
      clearInterval(interval);
    }
  }, 1000);

  session.intervalId = interval;
}

// ── Leave Camp ───────────────────────────────────────────

export async function leaveCamp(lenwy, replyJid, playerJid) {
  const players = loadPlayers();
  const viewer = players[playerJid];
  const lang = getLanguage(viewer ? getPlayerLanguage(viewer) : "id");

  const session = campSessions.get(playerJid);

  if (!session) {
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "campCmd.notCamping"),
    });
    return;
  }

  if (session.isInn) {
    return leaveInn(lenwy, replyJid, playerJid);
  }

  if (session.intervalId) {
    clearInterval(session.intervalId);
  }

  const player = players[playerJid];

  if (player) {
    player.stats.hp = session.currentHp;
    player.stats.mana = session.currentMana;
    player.lastActive = new Date().toISOString();
    players[playerJid] = player;
    savePlayers(players);
  }

  campSessions.delete(playerJid);

  await lenwy.sendMessage(replyJid, {
    text: getText(lang, "campCmd.leaveSummary", {
      hp: String(session.currentHp),
      maxHp: String(session.maxHp),
      mana: String(session.currentMana),
      maxMana: String(session.maxMana),
      secs: String(session.secondsElapsed ?? 0),
    }),
  });
}

// ── Command export ───────────────────────────────────────

export const info = {
  name: "Camp",
  menu: ["camp", "leave"],
  case: ["camp", "leave", "berkemah", "keluar"],
  description: "Set up camp to regenerate HP and Mana (wilderness only).",
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
  const { lenwy, replyJid, normalizedSender, LenwyText, command } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const px = cmdPrefix();
  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const langU = getLanguage("id");
    return LenwyText(getText(langU, "campCmd.notRegistered", { prefix: px }));
  }

  const lang = getLanguage(getPlayerLanguage(player));

  if (command === "camp" || command === "berkemah") {
    await startCamp(lenwy, replyJid, normalizedSender, player, lang);
  } else if (command === "leave" || command === "keluar") {
    await leaveCamp(lenwy, replyJid, normalizedSender);
  }
}
