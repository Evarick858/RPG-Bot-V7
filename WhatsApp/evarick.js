// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*  

  Made By Lenwy
  Base : Lenwy
  WhatsApp : wa.me/6283829814737
  Telegram : t.me/ilenwy
  Youtube : @Lenwy

  Channel : https://whatsapp.com/channel/0029VaGdzBSGZNCmoTgN2K0u

  Copy Code?, Recode?, Rename?, Reupload?, Reseller? Taruh Credit Ya :D

  Mohon Untuk Tidak Menghapus Watermark Di Dalam Kode Ini

*/

// [ ===== Import File ===== ]
import "./eva.js";
import "./database/Menu/EvarickMenu.js";

// [ ===== Import RPG Session Handlers ===== ]
import { handleReel } from "./case/rpg/fishing.js";
import { handleHit } from "./case/rpg/mining.js";
import { handleChop } from "./case/rpg/chopping.js";
import { handleForageAnswer } from "./case/rpg/foraging.js";
import { handleCombatInput } from "./case/rpg/hunt.js";
import { handlePvPInput } from "./case/rpg/pvpCombat.js";
import { handleStoryChoice } from "./case/rpg/storyHandler.js";
import { handleTamingInput } from "./case/rpg/searching.js";
import { handlePartyCommand } from "./case/rpg/party.js";
import { handleDungeonCommand } from "./case/rpg/dungeon.js";
import { handleDungeonCombatInput } from "./database/rpg/dungeonCombat.js";
import { getAllChoiceKeys, getEncounterById, getAvailableChoices } from "./database/rpg/story.js";

// [ ===== Import Centralized Session Manager ===== ]
import {
  fishingSessions,
  miningSessions,
  choppingSessions,
  foragingSessions,
  combatSessions,
  storySessions,
  searchingSessions,
} from "./database/rpg/sessionManager.js";
import { dungeonSessions } from "./case/rpg/dungeon.js";

// [ ===== Import Language System ===== ]
import { getText, getLanguage } from "./database/rpg/languages.js";

// Helper function to load user data
function loadUser(senderId) {
  try {
    const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");
    const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
    return data[senderId] || null;
  } catch {
    return null;
  }
}

// Helper function to get user language object
function getUserLanguage(senderId) {
  const user = loadUser(senderId);
  const langCode = user?.language || "id";
  return getLanguage(langCode);
}

// Helper function to send menu with image and audio
async function sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len) {
  try {
    const menuImagePath = path.join(process.cwd(), "WhatsApp", "database", "image", "evarick.jpeg");
    const menuAudioPath = path.join(process.cwd(), "WhatsApp", "database", "audio", "menu.mp3");
    
    // Send image with caption first
    if (fs.existsSync(menuImagePath)) {
      const menuImage = fs.readFileSync(menuImagePath);
      const imageOptions = {
        image: menuImage,
        caption: menuText,
      };
      
      if (isGroup) {
        await lenwy.sendMessage(replyJid, imageOptions, { quoted: len });
      } else {
        await lenwy.sendMessage(replyJid, imageOptions);
      }
      
      // Send audio after image if exists
      if (fs.existsSync(menuAudioPath)) {
        const menuAudio = fs.readFileSync(menuAudioPath);
        const audioOptions = {
          audio: menuAudio,
          mimetype: 'audio/mpeg',
          ptt: false, // false = audio biasa, true = voice note
        };
        
        await lenwy.sendMessage(replyJid, audioOptions);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("[MENU] Failed to send with media:", error);
    return false;
  }
}

// [ ===== Import Pustaka ===== ]
import fs from "fs";
import mime from "mime-types";
import { jidNormalizedUser } from "@yudzxml/baileys";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Track Messages
const processedMessages = new Set();
const groupMetadataCache = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Read Json File
function readJSONSync(pathFile) {
  try {
    return JSON.parse(fs.readFileSync(pathFile, "utf8"));
  } catch {
    return [];
  }
}

const pluginStatePath = path.join(
  process.cwd(),
  "WhatsApp",
  "database",
  "system",
  "plugins.json",
);

if (!fs.existsSync(pluginStatePath)) {
  fs.mkdirSync(path.dirname(pluginStatePath), { recursive: true });
  fs.writeFileSync(
    pluginStatePath,
    JSON.stringify({ disable: [], maintenance: [] }, null, 2),
  );
}

function readPluginState() {
  try {
    return JSON.parse(fs.readFileSync(pluginStatePath));
  } catch {
    return { disable: [], maintenance: [] };
  }
}

fs.watchFile(pluginStatePath, { interval: 1000 }, async () => {
  console.log(chalk.yellow.bold("[+] Plugins.json Berubah, Reloading State"));

  try {
    await loadPlugins();
    console.log(
      chalk.green.bold(`[+] Reload Selesai (${commands.size} Commands)`),
    );
  } catch (err) {
    console.error(chalk.red("❌ Gagal reload plugins.json:"), err);
  }
});

const caseDir = path.join(__dirname, "case");

let plugins = [];
let commands = new Map();
let categories = new Map();

async function loadPlugins() {
  plugins = [];
  commands.clear();
  categories.clear();

  const state = readPluginState();
  const disableList = state.disable || [];
  const maintenanceList = state.maintenance || [];

  const folders = fs.readdirSync(caseDir);

  for (let folder of folders) {
    const folderPath = path.join(caseDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    categories.set(folder.toLowerCase(), []);

    const files = fs.readdirSync(folderPath);

    for (let file of files) {
      if (!file.endsWith(".js")) continue;

      const module = await import(
        `./case/${folder}/${file}?update=${Date.now()}`
      );

      const plugin = module.default;
      const info = module.info;

      if (!plugin || !info) continue;

      const mainCommand = info.menu?.[0]?.toLowerCase();

      if (mainCommand) {
        info.enabled = !disableList.includes(mainCommand);
        info.maintenance = maintenanceList.includes(mainCommand);
      } else {
        info.enabled = true;
        info.maintenance = false;
      }

      plugins.push(plugin);

      for (let cmd of info.case) {
        commands.set(cmd.toLowerCase(), {
          execute: plugin,
          info,
          category: folder.toLowerCase(),
        });
      }

      categories.get(folder.toLowerCase()).push(info);
    }
  }
}

await loadPlugins();
globalThis.commands = commands;

let reloadTimeout;

function watchPlugins() {
  fs.watch(caseDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    clearTimeout(reloadTimeout);

    reloadTimeout = setTimeout(async () => {
      console.log(chalk.yellow.bold(`[+] Reloading Plugins`));

      try {
        await loadPlugins();
        console.log(
          chalk.green.bold(`[+] Reload Selesai (${commands.size} Commands)`),
        );
      } catch (err) {
        console.error(chalk.red("❌ Gagal reload:"), err);
      }
    }, 500);
  });
}

watchPlugins();

// Export Handler
export default async (lenwy, m, meta) => {
  const { body, mediaType, sender: originalSender, pushname } = meta;
  const msg = m.messages[0];
  if (!msg.message) return;

  const replyJid = msg.key.remoteJid;

  let authJid = originalSender;

  const key = msg.key;
  if (key.participantAlt) {
    authJid = key.participantAlt;
  } else if (key.remoteJidAlt) {
    authJid = key.remoteJidAlt;
  }

  const sender = authJid;
  let normalizedSender = jidNormalizedUser(sender);
  
  // Additional normalization for @lid (channel JIDs) -> convert to @s.whatsapp.net
  if (normalizedSender && normalizedSender.includes("@lid")) {
    normalizedSender = normalizedSender.split("@")[0].split(":")[0] + "@s.whatsapp.net";
  }

  const senderJid = sender
    ? sender.split(":")[0].split("@")[0] // Ambil Nomor Saja
    : null;

  // console.log(chalk.yellow(`[DEBUG JID] Sender Original: ${originalSender}`));
  // console.log(chalk.yellow(`[DEBUG JID] Sender Auth (PN): ${sender}`));
  // console.log(chalk.green(`[DEBUG JID] Sender Normal: ${normalizedSender}`));

  if (msg.key.fromMe) return;

  // Anti Double
  if (processedMessages.has(msg.key.id)) return;
  processedMessages.add(msg.key.id);
  setTimeout(() => processedMessages.delete(msg.key.id), 30000);

  const pplu = fs.readFileSync(globalThis.MenuImage);
  const len = {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: replyJid,
    },
    message: {
      contactMessage: {
        displayName: `${pushname}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Evarick,;;;\nFN: Evarick V1.0\nitem1.TEL;waid=${sender.split("@")[0]}:+${sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        jpegThumbnail: pplu,
        thumbnail: pplu,
        sendEphemeral: true,
      },
    },
  };

  // Custom Reply
  const lenwyreply = (teks) => {
    const shouldQuote = isGroup ? { quoted: len } : {};
    return lenwy.sendMessage(replyJid, { text: teks }, shouldQuote);
  };

  // Gambar Menu
  const MenuImage = fs.readFileSync(globalThis.MenuImage);

  // Deteksi Grup & Admin
  const isGroup = replyJid.endsWith("@g.us");

  // Bot Admin
  let isAdmin = false;
  let isBotAdmin = false;

  const GROUP_CACHE_TTL = 10 * 1000; // 10 Detik

  if (isGroup) {
    let metadataData = groupMetadataCache.get(replyJid);

    if (!metadataData || Date.now() - metadataData.time > GROUP_CACHE_TTL) {
      try {
        const metadata = await lenwy.groupMetadata(replyJid);
        groupMetadataCache.set(replyJid, { data: metadata, time: Date.now() });
        metadataData = groupMetadataCache.get(replyJid);
      } catch (e) {
        console.error("Gagal mengambil metadata grup:", e);
      }
    }

    const metadata = metadataData?.data;

    if (metadata) {
      const participants = metadata.participants;

      // Deteksi Format JID
      const isLidGroup = participants.some((p) => p.id.endsWith("@lid"));

      const normalizeJid = (jid) => {
        if (!jid) return "";
        return jid.split(":")[0].split("@")[0] + "@s.whatsapp.net";
      };

      let botJidForSearch;

      if (isLidGroup) {
        const rawLid = lenwy.user?.lid ?? lenwy.user?.id;
        botJidForSearch = rawLid.split(":")[0].split("@")[0] + "@lid";
      } else {
        botJidForSearch = normalizeJid(lenwy.user.id);
      }

      const senderJidClean = msg.key.participant ?? "";
      const userParticipant = participants.find((p) => p.id === senderJidClean);

      if (userParticipant) {
        isAdmin =
          userParticipant.admin === "admin" ||
          userParticipant.admin === "superadmin";
      }

      const botParticipant = participants.find((p) => p.id === botJidForSearch);

      isBotAdmin =
        botParticipant?.admin === "admin" ||
        botParticipant?.admin === "superadmin" ||
        false;

      // console.log("[BOT SEARCH JID]", botJidForSearch);
      // console.log("[BOT PARTICIPANT]", botParticipant);
      // console.log("[IS BOT ADMIN]", isBotAdmin);
    }
  }

  // Premium
  const premiumPath = path.join(
    process.cwd(),
    "WhatsApp",
    "database",
    "premium.json",
  );
  const premiumUsers = readJSONSync(premiumPath);
  const isPremium = premiumUsers.includes(normalizedSender);

  // Creator
  const CreatorPath = path.join(
    process.cwd(),
    "WhatsApp",
    "database",
    "creator.json",
  );
  const isCreatorArray = readJSONSync(CreatorPath);
  const isEvarick = isCreatorArray.includes(normalizedSender);

  // RPG Admins
  const AdminPath = path.join(
    process.cwd(),
    "WhatsApp",
    "database",
    "admins.json",
  );
  const adminArray = readJSONSync(AdminPath);
  const isRpgAdmin = adminArray.includes(normalizedSender);

  // Delete Message
  async function deleteMessage(msgKey, tag = "DELETE") {
    if (!msgKey) return;
    try {
      await lenwy.sendMessage(replyJid, {
        delete: {
          remoteJid: replyJid,
          fromMe: msgKey.fromMe ?? true,
          id: msgKey.id,
          participant: msgKey.participant || undefined,
        },
      });
      console.log(chalk.red.bold(`[${tag}]`), `Pesan Dihapus (${msgKey.id})`);
    } catch (err) {
      console.error(`[${tag}] Gagal hapus pesan:`, err);
    }
  }

  let usedPrefix = null;
  for (const pre of globalThis.prefix) {
    if (body.startsWith(pre)) {
      usedPrefix = pre;
      break;
    }
  }

  // ── RPG Session Interceptor ──────────────────────────────
  // Handles no-prefix RPG inputs when player has an active session
  // Must run BEFORE the prefix filter so "reel", "attack" etc. work
  const bodyLower = body.trim().toLowerCase();
  // Strip prefix from bodyLower so players can use . or ! even during sessions
  const bodyLowerClean = bodyLower.startsWith("!") || bodyLower.startsWith(".") ||
                         bodyLower.startsWith("#") || bodyLower.startsWith("/")
                         ? bodyLower.slice(1)
                         : bodyLower;
  const botJidCheck = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";

  if (normalizedSender !== botJidCheck) {
    // Load user language for session messages
    const lang = getUserLanguage(normalizedSender);
    
    // Story Encounters: MUST handle first and block all other commands
    // Get all available story choices dynamically
   const allStoryChoices = getAllChoiceKeys();
    if (storySessions.has(normalizedSender)) {
      const _storySession = storySessions.get(normalizedSender);
      const _storyEncounter = _storySession ? getEncounterById(_storySession.encounterId) : null;
      const _storyStage = _storySession?.currentStage && _storyEncounter?.stages
        ? _storyEncounter.stages[_storySession.currentStage]
        : _storyEncounter;
      const _stageKeys = _storyStage ? Object.keys(_storyStage.choices || {}) : [];
      if (allStoryChoices.includes(bodyLowerClean) || _stageKeys.includes(bodyLowerClean)) {
        await handleStoryChoice(lenwy, replyJid, normalizedSender, bodyLowerClean);
        return;
      }
      // Block all other commands during story encounter
      // Get current encounter to show available choices
      const session = storySessions.get(normalizedSender);
      const encounter = session ? getEncounterById(session.encounterId) : null;
      
      if (encounter) {
        const currentStage = session.currentStage || null;
        const stageData = currentStage && encounter.stages 
          ? encounter.stages[currentStage] 
          : encounter;
        
        const availableChoiceKeys = Object.keys(stageData.choices);
        const choiceList = availableChoiceKeys.map(key => `• ${key}`).join("\n");
        
        await lenwy.sendMessage(replyJid, {
          text: `📖 *Story Encounter Aktif!*\n\nKamu harus menyelesaikan story encounter saat ini sebelum menggunakan command lain.\n\n*Pilihan tersedia:*\n${choiceList}\n\n⚠️ *Jangan pakai prefix (. atau !)* — langsung ketik pilihannya:\nContoh: *help* atau *leave* (bukan .help atau !help)`
        });
      } else {
        await lenwy.sendMessage(replyJid, {
          text: getText(lang, "system.sessionBlocked.story")
        });
      }
      return;
    }

    // Fishing: handle "reel" input and block other commands
    if (fishingSessions.has(normalizedSender)) {
      if (bodyLowerClean === "reel") {
        await handleReel(lenwy, replyJid, normalizedSender);
        return;
      }
      // Block all other commands during fishing
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.fishing")
      });
      return;
    }

    // Mining: handle "hit" input and block other commands
    if (miningSessions.has(normalizedSender)) {
      if (bodyLowerClean === "hit") {
        await handleHit(lenwy, replyJid, normalizedSender);
        return;
      }
      // Block all other commands during mining
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.mining")
      });
      return;
    }

    // Chopping: handle "swing" input and block other commands
    if (choppingSessions.has(normalizedSender)) {
      if (bodyLowerClean === "swing") {
        await handleChop(lenwy, replyJid, normalizedSender);
        return;
      }
      // Block all other commands during chopping
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.chopping")
      });
      return;
    }

    // Foraging: handle odd-one-out answer and block other commands
    if (foragingSessions.has(normalizedSender)) {
      const s = foragingSessions.get(normalizedSender);

      // Accept button taps (forage_odd_🌿 format) or any text while session active
      const isForageButton = body.startsWith('forage_odd_') || body.startsWith('forage_');

      if (isForageButton) {
        await handleForageAnswer(lenwy, replyJid, normalizedSender, body.trim());
        return;
      }

      // Block all other commands during foraging
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.foraging")
      });
      return;
    }

    // Searching/Taming: handle emoji sequences and block other commands
    if (searchingSessions.has(normalizedSender)) {
      const handled = await handleTamingInput(lenwy, replyJid, normalizedSender, body.trim());
      if (handled) return;
      
      // Block all other commands during searching/taming
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.searching")
      });
      return;
    }

    // Combat: handle attack/defend/skill/item/run/status and block other commands
    const combatCommands = ["attack", "defend", "skill", "item", "run", "status"];
    const firstWord = bodyLower.split(" ")[0];
    
    // Remove prefix if present for combat commands
    const firstWordClean = firstWord.startsWith("!") || firstWord.startsWith(".") || 
                           firstWord.startsWith("#") || firstWord.startsWith("/") 
                           ? firstWord.slice(1) 
                           : firstWord;
    
    // Check for dungeon combat first
    let inDungeonCombat = false;
    for (const [partyId, session] of dungeonSessions.entries()) {
      if (session.party && session.party.members.includes(normalizedSender) && session.combat) {
        inDungeonCombat = true;
        if (combatCommands.includes(firstWordClean)) {
          const cleanBody = body.trim();
          const bodyToSend = cleanBody.startsWith("!") || cleanBody.startsWith(".") || 
                             cleanBody.startsWith("#") || cleanBody.startsWith("/")
                             ? cleanBody.slice(1)
                             : cleanBody;
          await handleDungeonCombatInput(lenwy, replyJid, normalizedSender, bodyToSend);
          return;
        }
        // Block all other commands during dungeon combat
        await lenwy.sendMessage(replyJid, {
          text: getText(lang, "system.sessionBlocked.dungeon")
        });
        return;
      }
    }
    
    if (combatSessions.has(normalizedSender)) {
      console.log(`[COMBAT DEBUG] Player in combat. Body: "${body}", FirstWord: "${firstWordClean}", IsCommand: ${combatCommands.includes(firstWordClean)}`);
      
      // Check if it's a PVP session
      const session = combatSessions.get(normalizedSender);
      if (session && session.mode === "pvp") {
        // PVP combat - use PVP handler
        if (combatCommands.includes(firstWordClean)) {
          const cleanBody = body.trim();
          const bodyToSend = cleanBody.startsWith("!") || cleanBody.startsWith(".") || 
                             cleanBody.startsWith("#") || cleanBody.startsWith("/")
                             ? cleanBody.slice(1)
                             : cleanBody;
          await handlePvPInput(lenwy, replyJid, normalizedSender, bodyToSend);
          return;
        }
        // Block all other commands during PVP combat
        await lenwy.sendMessage(replyJid, {
          text: getText(lang, "system.sessionBlocked.pvp")
        });
        return;
      }
      
      // Regular hunt combat
      if (combatCommands.includes(firstWordClean)) {
        const cleanBody = body.trim();
        const bodyToSend = cleanBody.startsWith("!") || cleanBody.startsWith(".") || 
                           cleanBody.startsWith("#") || cleanBody.startsWith("/")
                           ? cleanBody.slice(1)
                           : cleanBody;
        await handleCombatInput(lenwy, replyJid, normalizedSender, bodyToSend);
        return;
      }
      // Block all other commands during hunt combat
      await lenwy.sendMessage(replyJid, {
        text: getText(lang, "system.sessionBlocked.combat")
      });
      return;
    }
  }
  // ── End RPG Session Interceptor ──────────────────────────

  if (!usedPrefix && !globalThis.noprefix) return;

  const args = usedPrefix
    ? body.slice(usedPrefix.length).trim().split(" ")
    : body.trim().split(" ");

  const command = args.shift().toLowerCase();
  const q = args.join(" ");

  // Helper
  const LenwyText = (text) => {
    // For better iPhone compatibility, merge quote option into message options
    const messageOptions = { text };
    if (isGroup) {
      messageOptions.quoted = len;
    }
    return lenwy.sendMessage(replyJid, messageOptions);
  };

  const LenwyWait = () => lenwyreply(globalThis.mess.wait);

  // Send Video
  const LenwyVideo = (url, caption = "") => {
    const shouldQuote = isGroup ? { quoted: len } : {};
    return lenwy.sendMessage(replyJid, { video: { url }, caption }, shouldQuote);
  };

  // Send Image
  const LenwyImage = (url, caption = "") => {
    const shouldQuote = isGroup ? { quoted: len } : {};
    return lenwy.sendMessage(replyJid, { image: { url }, caption }, shouldQuote);
  };

  // Send Audio
  const LenwyAudio = (url, ptt = false) => {
    const shouldQuote = isGroup ? { quoted: len } : {};
    return lenwy.sendMessage(
      replyJid,
      { audio: { url }, mimetype: "audio/mpeg", ptt },
      shouldQuote,
    );
  };

  // Send File
  const LenwyFile = (buffer, fileName, mime) => {
    const shouldQuote = isGroup ? { quoted: len } : {};
    return lenwy.sendMessage(
      replyJid,
      { document: buffer, fileName, mimetype: mime },
      shouldQuote,
    );
  };

  // Label Menu
  function getLabel(info) {
    if (info.owner) return "Owner";
    if (info.premium) return "Premium";
    if (info.admin) return "Admin";
    if (info.botAdmin) return "BotAdmin";
    if (info.group) return "Group";
    if (info.private) return "Private";
    return "Public";
  }

  const labelPriority = {
    Public: 0,
    Owner: 1,
    Premium: 2,
    Admin: 3,
    BotAdmin: 4,
    Group: 5,
    Private: 6,
  };

  // ════════════════════════════════════════
  // RPG MENU - Shows menu categories
  // ════════════════════════════════════════
  if (command === "menu" || command === "help" || command === "commands") {
    // Load user data to get language preference
    const lang = getUserLanguage(normalizedSender);
    
    // Tambahkan owner menu jika user adalah owner
    const showOwnerMenu = isEvarick;

    let menuText = `╭─────────────────╮
🎮 *EVARICK RPG*
╰─────────────────╯

⚡ *CORE*
📋 !basicmenu
⚔️ !combatmenu
🏰 !dungeonmenu
📚 !guidemenu

🎒 *ITEMS*
🎒 !inventorymenu
🏪 !shopmenu
🔨 !craftingmenu

🌍 *WORLD*
🌲 !gatheringmenu
🐾 !petmenu
🏕️ !restmenu
📜 !questmenu
🤝 !tradingmenu
🎓 !skillmenu
🎁 !specialmenu`;

    if (showOwnerMenu) {
      menuText += `\n\n👑 *ADMIN*\n👑 !ownermenu`;
    }

    if (isRpgAdmin && !showOwnerMenu) {
      menuText += `\n\n👮 *ADMIN*\n👮 !adminmenu`;
    }

    menuText += `\n\n━━━━━━━━━━━━━━━━━━━━`;

    // Try to send with image and audio
    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    
    if (mediaSent) {
      return;
    }
    
    // Fallback to text only if media fails
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // OWNER MENU - Only visible to owner
  // ════════════════════════════════════════
  if (command === "ownermenu") {
    if (!isEvarick) {
      return LenwyText(globalThis.mess.creator);
    }

    const menuText = `╭─────────────────╮
👑 *OWNER*
╰─────────────────╯

💰 *ECONOMY*
• !givegold @player <amount>
• !giveitem @player <item> <amount>

⚔️ *PLAYER*
• !setlevel @player <level>
• !heal @player
• !resetplayer @player
• !setreputation @player <amount>
• !addxp @player <amount>
• !playerstats @player
• !setname <oldname> to <newname>

🚫 *BAN*
• !rpgban @player <reason>
• !rpgunban @player
• !rpgbanned

🌐 *SERVER*
• !serverinfo
• !maintenance <on/off>
• !broadcast <message>
• !redeemlist

🗺️ *WORLD*
• !teleport @player <location>
• !spawnenemy <enemy> <location>

📖 *STORY*
• !worldstory
• !addstory <story_code>
• !storyactions

🏅 *TITLES*
• !givetitle @player <title_id>
• !removetitle @player <title_id>

👮 *ADMINS*
• !addadmin @player
• !removeadmin @player
• !adminlist

📋 *LISTS*
• !addlist <name> note <note>
• !list
• !list <number>
• !removelist <number>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // ADMIN MENU - Visible to owner and rpg admins
  // ════════════════════════════════════════
  if (command === "adminmenu") {
    if (!isEvarick && !isRpgAdmin) {
      return LenwyText(globalThis.mess.creator);
    }

    const adminMenuText = `╭─────────────────╮
👮 *ADMIN*
╰─────────────────╯

📖 *STORY*
• !worldstory
• !addstory <story_code>
• !storyactions

🌐 *SERVER*
• !serverinfo

🚫 *BAN*
• !rpgban @player <reason>
• !rpgunban @player
• !rpgbanned

📋 *LISTS*
• !addlist <name> note <note>
• !list
• !list <number>
• !removelist <number>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent2 = await sendMenuWithMedia(lenwy, replyJid, adminMenuText, isGroup, len);
    if (mediaSent2) return;
    return LenwyText(adminMenuText);
  }

  // ════════════════════════════════════════
  // GUIDE MENU - Shows all guide topics
  // ════════════════════════════════════════
  if (command === "guidemenu") {
    const lang = getUserLanguage(normalizedSender);
    const isId = lang.code === "id";

    const guideMenuText = `╭─────────────────╮
📚 *GUIDE MENU*
╰─────────────────╯

${isId ? "Ketik *!guide <topik>* untuk membaca panduan." : "Type *!guide <topic>* to read a guide."}

🌟 *!guide starter* — ${isId ? "Panduan pemula" : "Beginner's guide"}
⚔️ *!guide combat* — ${isId ? "Sistem pertarungan" : "Combat system"}
📊 *!guide stats* — ${isId ? "Penjelasan stat" : "Stats explained"}
🏪 *!guide shop* — ${isId ? "Cara beli & jual" : "Buying & selling"}
✨ *!guide skills* — ${isId ? "Sistem skill" : "Skill system"}
🌲 *!guide gathering* — ${isId ? "Fishing, mining, dll" : "Fishing, mining, etc."}
🔨 *!guide crafting* — ${isId ? "Cara crafting" : "How to craft"}
🗺️ *!guide travel* — ${isId ? "Cara berpindah lokasi" : "How to travel"}
💼 *!guide items* — ${isId ? "Jenis & cara pakai item" : "Item types & usage"}
🏰 *!guide dungeon* — ${isId ? "Sistem dungeon & party" : "Dungeon & party"}
⚔️ *!guide pvp* — ${isId ? "Sistem PVP" : "PVP system"}
📜 *!guide quests* — ${isId ? "Sistem quest" : "Quest system"}
🐾 *!guide pets* — ${isId ? "Sistem pet" : "Pet system"}

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSentGuide = await sendMenuWithMedia(lenwy, replyJid, guideMenuText, isGroup, len);
    if (mediaSentGuide) return;
    return LenwyText(guideMenuText);
  }

  // ════════════════════════════════════════
  // WORLD STORY - Owner only command
  // ════════════════════════════════════════
  if (command === "worldstory") {
    if (!isEvarick && !isRpgAdmin) {
      return LenwyText(globalThis.mess.creator);
    }

    const worldStoryPath = path.join(process.cwd(), "WhatsApp", "worldstory.md");
    
    try {
      const storyContent = fs.readFileSync(worldStoryPath, "utf8");
      
      return LenwyText(
        `📖 *THE WORLD OF ELARION*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        storyContent +
        `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
        `✨ *End of Story* ✨`
      );
    } catch (error) {
      console.error("[WORLDSTORY] Error reading file:", error);
      return LenwyText("❌ *Error:* Could not load world story file.");
    }
  }

  // ════════════════════════════════════════
  // ════════════════════════════════════════
  // ADD STORY - Owner/Admin command
  // ════════════════════════════════════════
  if (command === "addstory") {
    if (!isEvarick && !isRpgAdmin) {
      return LenwyText(globalThis.mess.creator);
    }

    const storyPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "story.js");
    const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];

    // Use raw body to preserve newlines — q joins with spaces which breaks parsing
    const rawBody = body || "";
    // Strip the command prefix (e.g. "!addstory\n" or "!addstory ")
    const rawContent = rawBody.replace(/^[!./]?addstory\s*/i, "").trim();

    // ── No args: send the template ────────────────────────
    if (!rawContent) {
      return LenwyText(
        `📖 *ADD NEW STORY*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Copy the template, fill in the blanks, send it back.\n\n` +
        `*⭐ Rarity:* common, uncommon, rare, epic, legendary\n` +
        `*📍 Locations:* location ID or "all"\n` +
        `*🎯 Action:* help, leave, fight, talk, run, take, ignore...\n` +
        `*(Type !storyactions for full list)*\n` +
        `*➡️ Next Stage:* optional — links to a stage defined below\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `!addstory\n` +
        `📝 Story ID: your_story_id\n` +
        `🌍 Title (EN): Your Story Title\n` +
        `🌍 Title (ID): Judul Cerita\n` +
        `📖 Description (EN): Describe what the player sees.\n` +
        `📖 Description (ID): Deskripsikan apa yang pemain lihat.\n` +
        `✨ Emoji: 🧍\n` +
        `⭐ Rarity: common\n` +
        `📍 Locations: starter_village\n\n` +
        `=== Stage 1 ===\n\n` +
        `--- Choice 1 ---\n` +
        `🎯 Action: help\n` +
        `✅ Good Result (EN): Something good happens.\n` +
        `✅ Good Result (ID): Sesuatu yang baik terjadi.\n` +
        `💰 Good Gold: 200\n` +
        `⭐ Good EXP: 50\n` +
        `❌ Bad Result (EN): Something bad happens.\n` +
        `❌ Bad Result (ID): Sesuatu yang buruk terjadi.\n` +
        `💰 Bad Gold: -100\n` +
        `➡️ Next Stage: stage_two\n\n` +
        `--- Choice 2 ---\n` +
        `🎯 Action: leave\n` +
        `✅ Good Result (EN): You walk away quietly.\n` +
        `✅ Good Result (ID): Kamu pergi dengan tenang.\n` +
        `💰 Good Gold: 0\n` +
        `⭐ Good EXP: 10\n\n` +
        `--- Choice 3 ---\n` +
        `🎯 Action: fight\n` +
        `✅ Good Result (EN): You win!\n` +
        `✅ Good Result (ID): Kamu menang!\n` +
        `💰 Good Gold: 300\n` +
        `⭐ Good EXP: 100\n` +
        `❌ Bad Result (EN): You lose.\n` +
        `❌ Bad Result (ID): Kamu kalah.\n` +
        `💰 Bad Gold: -50\n\n` +
        `=== Stage 2 (stage_two) ===\n` +
        `📖 Stage Title (EN): The Next Chapter\n` +
        `📖 Stage Title (ID): Babak Berikutnya\n` +
        `📖 Stage Description (EN): What happens next.\n` +
        `📖 Stage Description (ID): Apa yang terjadi selanjutnya.\n\n` +
        `--- Choice 1 ---\n` +
        `🎯 Action: take\n` +
        `✅ Good Result (EN): You take the reward!\n` +
        `✅ Good Result (ID): Kamu mengambil hadiah!\n` +
        `💰 Good Gold: 500\n` +
        `⭐ Good EXP: 150\n\n` +
        `--- Choice 2 ---\n` +
        `🎯 Action: leave\n` +
        `✅ Good Result (EN): You leave gracefully.\n` +
        `✅ Good Result (ID): Kamu pergi dengan anggun.\n` +
        `💰 Good Gold: 0\n` +
        `⭐ Good EXP: 30\n\n` +
        `--- Choice 3 ---\n` +
        `🎯 Action: fight\n` +
        `✅ Good Result (EN): Victory!\n` +
        `✅ Good Result (ID): Kemenangan!\n` +
        `💰 Good Gold: 800\n` +
        `⭐ Good EXP: 200\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ Stage 1 always needs exactly 3 choices.\n` +
        `⚠️ Extra stages also need exactly 3 choices.\n` +
        `⚠️ Extra stages are optional — delete them if not needed.\n` +
        `⚠️ ➡️ Next Stage links a choice to a stage defined below.\n` +
        `⚠️ Bad Result is optional per choice.`
      );
    }

    // ── Helper: parse a block of lines into choice objects ──
    function parseChoiceBlock(choiceLines) {
      function getF(label) {
        // Normalize: strip invisible chars, compare lowercased
        const normalLabel = label.toLowerCase().replace(/\s+/g, " ").trim();
        const line = choiceLines.find(l => {
          const norm = l.toLowerCase().replace(/\s+/g, " ").trim();
          return norm.startsWith(normalLabel);
        });
        if (!line) return null;
        return line.slice(line.indexOf(":") + 1).trim() || null;
      }
      return {
        actionKey:  (getF("🎯 Action") || "").toLowerCase().trim(),
        goodEn:     getF("✅ Good Result (EN)"),
        goodId:     getF("✅ Good Result (ID)"),
        goodGold:   parseInt(getF("💰 Good Gold") || "0") || 0,
        goodExp:    parseInt(getF("⭐ Good EXP") || "0") || 0,
        badEn:      getF("❌ Bad Result (EN)"),
        badId:      getF("❌ Bad Result (ID)"),
        badGold:    parseInt(getF("💰 Bad Gold") || "0") || 0,
        nextStage:  (getF("➡️ Next Stage") || "").toLowerCase().replace(/\s+/g, "_").trim() || null,
      };
    }

    // ── Helper: build JS choices code from parsed choices ──
    function buildChoicesCode(choices, validChoiceKeys, stageNum, errors) {
      let code = "";
      for (let i = 0; i < choices.length; i++) {
        const c = choices[i];
        const num = i + 1;
        const label = `Stage ${stageNum} Choice ${num}`;

        if (!c.actionKey) {
          errors.push(`🎯 *${label}: Action is missing.*`);
          continue;
        }
        if (!validChoiceKeys.includes(c.actionKey)) {
          errors.push(`🎯 *${label}: Action "${c.actionKey}" is not valid.*\nType !storyactions for the full list.`);
        }
        if (!c.goodEn) errors.push(`✅ *${label}: Good Result (EN) is missing.*`);
        if (!c.goodId) errors.push(`✅ *${label}: Good Result (ID) is missing.*`);
        if ((c.badEn && !c.badId) || (!c.badEn && c.badId)) {
          errors.push(`❌ *${label}: If you add a Bad Result, both EN and ID are required.*`);
        }

        const hasBad = c.badEn && c.badId;
        const goodWeight = hasBad ? 70 : 100;

        let outcomes = `[\n          {\n            weight: ${goodWeight},\n            type: "good",\n            text: { en: "${(c.goodEn||"").replace(/"/g,'\\"')}",  id: "${(c.goodId||"").replace(/"/g,'\\"')}" },\n            rewards: { gold: ${c.goodGold}, exp: ${c.goodExp} },`;
        if (c.nextStage) outcomes += `\n            nextStage: "${c.nextStage}",`;
        outcomes += `\n          },`;

        if (hasBad) {
          outcomes += `\n          {\n            weight: 30,\n            type: "bad",\n            text: { en: "${(c.badEn||"").replace(/"/g,'\\"')}",  id: "${(c.badId||"").replace(/"/g,'\\"')}" },\n            rewards: { gold: ${c.badGold} },\n          },`;
        }
        outcomes += `\n        ]`;

        code += `\n      ${c.actionKey}: {\n        label: { en: "${(c.goodEn||"").replace(/"/g,'\\"').slice(0,30)}", id: "${(c.goodId||"").replace(/"/g,'\\"').slice(0,30)}" },\n        outcomes: ${outcomes},\n      },`;
      }
      return code;
    }

    try {
      const { getAllChoiceKeys } = await import("./database/rpg/story.js");
      const validChoiceKeys = getAllChoiceKeys();
      const errors = [];

      // ── Split into stage blocks ───────────────────────
      // Format: "=== Stage N ===" or "=== Stage N (stage_id) ==="
      const stageSplit = rawContent.split(/===\s*Stage\s*\d+[^=]*===/i);
      // stageSplit[0] = header fields, [1] = stage 1 choices, [2+] = extra stages

      const headerText = stageSplit[0];
      const headerLines = headerText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

      function getHeaderField(label) {
        const normalLabel = label.toLowerCase().replace(/\s+/g, " ").trim();
        const line = headerLines.find(l => {
          const norm = l.toLowerCase().replace(/\s+/g, " ").trim();
          return norm.startsWith(normalLabel);
        });
        if (!line) return null;
        return line.slice(line.indexOf(":") + 1).trim() || null;
      }

      // ── Extract main fields ───────────────────────────
      const storyId  = (getHeaderField("📝 Story ID") || "").toLowerCase().replace(/\s+/g, "_");
      const titleEn  = getHeaderField("🌍 Title (EN)");
      const titleId  = getHeaderField("🌍 Title (ID)");
      const descEn   = getHeaderField("📖 Description (EN)");
      const descId   = getHeaderField("📖 Description (ID)");
      const emoji    = getHeaderField("✨ Emoji");
      const rarity   = (getHeaderField("⭐ Rarity") || "").toLowerCase().trim();
      const locRaw   = getHeaderField("📍 Locations");

      if (!storyId)  errors.push("📝 *Story ID* is missing.");
      if (!titleEn)  errors.push("🌍 *Title (EN)* is missing.");
      if (!titleId)  errors.push("🌍 *Title (ID)* is missing.");
      if (!descEn)   errors.push("📖 *Description (EN)* is missing.");
      if (!descId)   errors.push("📖 *Description (ID)* is missing.");
      if (!emoji)    errors.push("✨ *Emoji* is missing.");
      if (!locRaw)   errors.push("📍 *Locations* is missing.");

      if (!rarity) {
        errors.push(`⭐ *Rarity* is missing. Valid: ${validRarities.join(", ")}`);
      } else if (!validRarities.includes(rarity)) {
        errors.push(`⭐ *"${rarity}" is not valid.* Valid: ${validRarities.join(", ")}`);
      }

      if (storyId && !/^[a-z0-9_]+$/.test(storyId)) {
        errors.push(`📝 *Story ID "${storyId}" is invalid.* Only lowercase, numbers, underscores. Example: lost_traveler`);
      }

      if (storyId && errors.length === 0) {
        const sc = fs.readFileSync(storyPath, "utf8");
        if (new RegExp(`\\b${storyId}\\s*:`).test(sc)) {
          errors.push(`📝 *Story ID "${storyId}" already exists!* Use a different ID.`);
        }
      }

      // ── Parse Stage 1 choices ─────────────────────────
      const stage1Text = stageSplit[1] || "";
      const stage1ChoiceSplit = stage1Text.split(/---\s*Choice\s*\d+\s*---/i).slice(1);

      if (stage1ChoiceSplit.length < 3) {
        errors.push(`🎯 *Stage 1 needs exactly 3 choices.* You provided ${stage1ChoiceSplit.length}.`);
      }

      const stage1Choices = stage1ChoiceSplit.slice(0, 3).map(b =>
        parseChoiceBlock(b.split("\n").map(l => l.trim()).filter(l => l.length > 0))
      );
      const stage1Code = buildChoicesCode(stage1Choices, validChoiceKeys, 1, errors);

      // ── Parse extra stages ────────────────────────────
      // Find stage IDs from the "=== Stage N (stage_id) ===" headers
      const stageHeaders = [...rawContent.matchAll(/===\s*Stage\s*\d+\s*\(([^)]+)\)\s*===/gi)];
      const extraStages = [];

      for (let si = 0; si < stageHeaders.length; si++) {
        const stageId = stageHeaders[si][1].toLowerCase().replace(/\s+/g, "_").trim();
        const stageText = stageSplit[si + 2] || "";
        const stageLines = stageText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

        function getStageField(label) {
          const line = stageLines.find(l => l.toLowerCase().startsWith(label.toLowerCase()));
          if (!line) return null;
          return line.slice(line.indexOf(":") + 1).trim() || null;
        }

        const stageTitleEn = getStageField("📖 Stage Title (EN)");
        const stageTitleId = getStageField("📖 Stage Title (ID)");
        const stageDescEn  = getStageField("📖 Stage Description (EN)");
        const stageDescId  = getStageField("📖 Stage Description (ID)");

        if (!stageTitleEn) errors.push(`📖 *Stage "${stageId}": Stage Title (EN) is missing.*`);
        if (!stageTitleId) errors.push(`📖 *Stage "${stageId}": Stage Title (ID) is missing.*`);
        if (!stageDescEn)  errors.push(`📖 *Stage "${stageId}": Stage Description (EN) is missing.*`);
        if (!stageDescId)  errors.push(`📖 *Stage "${stageId}": Stage Description (ID) is missing.*`);

        const stageChoiceSplit = stageText.split(/---\s*Choice\s*\d+\s*---/i).slice(1);
        if (stageChoiceSplit.length < 3) {
          errors.push(`🎯 *Stage "${stageId}" needs exactly 3 choices.* You provided ${stageChoiceSplit.length}.`);
        }

        const stageChoices = stageChoiceSplit.slice(0, 3).map(b =>
          parseChoiceBlock(b.split("\n").map(l => l.trim()).filter(l => l.length > 0))
        );
        const stageChoicesCode = buildChoicesCode(stageChoices, validChoiceKeys, si + 2, errors);

        extraStages.push({ stageId, stageTitleEn, stageTitleId, stageDescEn, stageDescId, stageChoicesCode });
      }

      // ── Report all errors ─────────────────────────────
      if (errors.length > 0) {
        return LenwyText(
          `❌ *STORY NOT ADDED — Fix these issues:*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          errors.map((e, i) => `${i + 1}. ${e}`).join("\n\n") +
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `Fix the issues and send again!`
        );
      }

      // ── Build the story JS object ─────────────────────
      const locations = locRaw.trim() === "all"
        ? `["all"]`
        : `[${locRaw.split(",").map(l => `"${l.trim()}"`).join(", ")}]`;

      let stagesCode = "";
      if (extraStages.length > 0) {
        stagesCode = `\n    stages: {`;
        for (const s of extraStages) {
          stagesCode += `\n      ${s.stageId}: {\n        title: { en: "${(s.stageTitleEn||"").replace(/"/g,'\\"')}", id: "${(s.stageTitleId||"").replace(/"/g,'\\"')}" },\n        description: { en: "${(s.stageDescEn||"").replace(/"/g,'\\"')}", id: "${(s.stageDescId||"").replace(/"/g,'\\"')}" },\n        choices: {${s.stageChoicesCode}\n        },\n      },`;
        }
        stagesCode += `\n    },`;
      }

      const storyCode = `\n  // ═══════════════════════════════════════════════════════\n  // ${(titleEn||"").toUpperCase()} (Added via !addstory)\n  // ═══════════════════════════════════════════════════════\n  ${storyId}: {\n    id: "${storyId}",\n    title: { en: "${(titleEn||"").replace(/"/g,'\\"')}", id: "${(titleId||"").replace(/"/g,'\\"')}" },\n    description: { en: "${(descEn||"").replace(/"/g,'\\"')}", id: "${(descId||"").replace(/"/g,'\\"')}" },\n    emoji: "${emoji}",\n    rarity: "${rarity}",\n    locations: ${locations},\n    choices: {${stage1Code}\n    },${stagesCode}\n  },`;

      // ── Insert into story.js ──────────────────────────
      const storyContent = fs.readFileSync(storyPath, "utf8");
      const closingPattern = /\n};(\s*\/\*\*|\s*export function)/;
      const matchPos = storyContent.match(closingPattern);

      if (!matchPos) {
        return LenwyText("❌ *Error:* Could not find the correct position to insert story. Contact the developer.");
      }

      const newContent =
        storyContent.slice(0, matchPos.index) +
        storyCode +
        "\n" +
        storyContent.slice(matchPos.index);

      fs.writeFileSync(storyPath, newContent, "utf8");

      const stageCount = 1 + extraStages.length;
      return LenwyText(
        `✅ *STORY ADDED!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 ID: ${storyId}\n` +
        `🌍 Title: ${titleEn}\n` +
        `✨ Emoji: ${emoji}\n` +
        `⭐ Rarity: ${rarity}\n` +
        `📍 Locations: ${locRaw}\n` +
        `📖 Stages: ${stageCount}\n` +
        `🎯 Stage 1 choices: ${stage1Choices.map(c => c.actionKey).join(", ")}\n` +
        (extraStages.length > 0 ? extraStages.map(s => `🎯 Stage "${s.stageId}" choices: ${s.stageChoicesCode.match(/^\s+(\w+):/gm)?.map(m => m.trim().replace(":", "")).join(", ") || "?"}`).join("\n") + "\n" : "") +
        `\nPlayers can now encounter this story when traveling!`
      );

    } catch (error) {
      console.error("[ADDSTORY] Error:", error);
      return LenwyText(`❌ *Unexpected error:* ${error.message}\n\nPlease check your template and try again.`);
    }
  }


  // ════════════════════════════════════════
  // STORY ACTIONS - Full reference guide
  // ════════════════════════════════════════
  if (command === "storyactions") {
    if (!isEvarick && !isRpgAdmin) {
      return LenwyText(globalThis.mess.creator);
    }

    const { getAllChoiceKeys } = await import("./database/rpg/story.js");
    const keys = getAllChoiceKeys();
    const cols = [];
    for (let i = 0; i < keys.length; i += 3) {
      cols.push(keys.slice(i, i + 3).join("  |  "));
    }

    return LenwyText(
      `📖 *STORY REFERENCE GUIDE*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +

      `⭐ *RARITY OPTIONS*\n` +
      `common, uncommon, rare, epic, legendary\n\n` +

      `📍 *LOCATION OPTIONS*\n` +
      `Use any location ID or type "all" for everywhere.\n` +
      `Multiple: starter_village, peaceful_forest\n\n` +

      `💰 *REWARD OPTIONS* (per choice outcome)\n` +
      `• 💰 Good Gold: 200       ← give gold (use negative to take)\n` +
      `• ⭐ Good EXP: 50         ← give experience\n` +
      `• 💰 Bad Gold: -100       ← take gold on bad outcome\n` +
      `• Items are not supported in the template yet\n\n` +

      `➡️ *NEXT STAGE*\n` +
      `• Add ➡️ Next Stage: stage_id to link a choice to a stage\n` +
      `• Leave it out and the story ends after that choice\n` +
      `• Each choice can link to a different stage\n` +
      `• Stage ID must match exactly: =\=\= Stage 2 (stage_id) =\=\=\n\n` +

      `❌ *BAD RESULT*\n` +
      `• Optional — skip those lines if you don't want a bad outcome\n` +
      `• If added, both EN and ID are required\n` +
      `• Bad outcome has 30% chance, good has 70%\n\n` +

      `📖 *STAGE RULES*\n` +
      `• Stage 1 is always required with exactly 3 choices\n` +
      `• Extra stages also need exactly 3 choices\n` +
      `• Max stages: unlimited\n` +
      `• Stage ID: lowercase, numbers, underscores only\n\n` +

      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 *VALID ACTIONS* (${keys.length} total)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      cols.join("\n") +
      `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
      `Type *!addstory* to get the template`
    );
  }

  // ════════════════════════════════════════
  // ADD ITEM - Owner only command
  // ════════════════════════════════════════
  if (command === "additem") {
    if (!isEvarick) {
      return LenwyText(globalThis.mess.creator);
    }

    if (!q.trim()) {
      return LenwyText(
        `📦 *ADD NEW ITEM*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Usage: !additem <item_code>\n\n` +
        `Example:\n` +
        `!additem "dragon_scale": {\n` +
        `  "id": "dragon_scale",\n` +
        `  "name": "🐉 Dragon Scale",\n` +
        `  "category": "material",\n` +
        `  "description": "Rare dragon scale",\n` +
        `  "buyPrice": 0,\n` +
        `  "sellPrice": 500\n` +
        `},\n\n` +
        `Categories: consumable, tool, utility, material, quest, weapon, armor, accessory`
      );
    }

    const itemsPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "items.js");
    
    try {
      let itemCode = q.trim();
      
      // VALIDATION 1: Basic structure
      if (!itemCode.includes("{") || !itemCode.includes("}")) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nItem code must contain { and } brackets.`);
      }
      
      // VALIDATION 2: Required fields
      const requiredFields = ["id:", "name:", "category:", "description:", "sellPrice:"];
      const missingFields = requiredFields.filter(field => !itemCode.includes(field));
      
      if (missingFields.length > 0) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Missing required fields:\n` +
          missingFields.map(f => `• ${f}`).join("\n") + "\n\n" +
          `Required: id, name, category, description, sellPrice`
        );
      }
      
      // VALIDATION 3: Extract and validate item ID
      const itemKeyMatch = itemCode.match(/^["']?(\w+)["']?:/);
      const idMatch = itemCode.match(/["']id["']:\s*["']([^"']+)["']/);
      
      if (!itemKeyMatch || !idMatch) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nCould not find item key or ID.`);
      }
      
      const itemKey = itemKeyMatch[1];
      const itemId = idMatch[1];
      
      if (itemKey !== itemId) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Item key and ID must match!\n` +
          `Key: ${itemKey}\nID: ${itemId}`
        );
      }
      
      // VALIDATION 4: Check category
      const validCategories = ["consumable", "tool", "utility", "material", "quest", "weapon", "armor", "accessory"];
      const categoryMatch = itemCode.match(/["']category["']:\s*["']([^"']+)["']/);
      
      if (categoryMatch && !validCategories.includes(categoryMatch[1])) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Invalid category: ${categoryMatch[1]}\n\n` +
          `Valid categories:\n${validCategories.join(", ")}`
        );
      }
      
      // VALIDATION 5: Check if item already exists
      const itemsContent = fs.readFileSync(itemsPath, "utf8");
      const existingItemPattern = new RegExp(`["']${itemId}["']:\\s*{`, "g");
      
      if (existingItemPattern.test(itemsContent)) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nItem ID "${itemId}" already exists!`);
      }
      
      // VALIDATION 6: Test JavaScript syntax
      try {
        const testCode = `const test = { ${itemCode} };`;
        eval(testCode);
      } catch (syntaxError) {
        return LenwyText(
          `❌ *SYNTAX ERROR*\n\n${syntaxError.message}\n\n` +
          `Please fix the syntax and try again.`
        );
      }
      
      // Find position before closing };
      const closingPattern = /\n};(\s*\/\*\*|\s*export)/;
      const match = itemsContent.match(closingPattern);
      
      if (!match) {
        return LenwyText("❌ *Error:* Could not find the correct position to insert item.");
      }
      
      const insertPosition = match.index;
      
      // Add proper indentation
      if (!itemCode.startsWith("  ")) {
        itemCode = "  " + itemCode.replace(/\n/g, "\n  ");
      }
      
      if (!itemCode.trim().endsWith(",")) {
        itemCode += ",";
      }
      
      const separator = "\n\n  // ═══════════════════════════════════════════════════════\n  // NEW ITEM (Added via additem command)\n  // ═══════════════════════════════════════════════════════\n\n";
      
      const newContent = 
        itemsContent.slice(0, insertPosition) + 
        separator + 
        itemCode + 
        "\n" +
        itemsContent.slice(insertPosition);
      
      fs.writeFileSync(itemsPath, newContent, "utf8");
      
      return LenwyText(
        `✅ *ITEM ADDED SUCCESSFULLY!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Item ID: ${itemId}\n` +
        `File: items.js\n\n` +
        `✓ All validations passed\n` +
        `✓ Syntax is correct\n` +
        `✓ Category is valid\n` +
        `✓ No duplicate ID\n\n` +
        `The item has been added to the database!`
      );
      
    } catch (error) {
      console.error("[ADDITEM] Error:", error);
      return LenwyText(`❌ *UNEXPECTED ERROR*\n\n${error.message}`);
    }
  }

  // ════════════════════════════════════════
  // ADD LOCATION - Owner only command
  // ════════════════════════════════════════
  if (command === "addlocation") {
    if (!isEvarick) {
      return LenwyText(globalThis.mess.creator);
    }

    if (!q.trim()) {
      return LenwyText(
        `🗺️ *ADD NEW LOCATION*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Usage: !addlocation <location_code>\n\n` +
        `Example:\n` +
        `!addlocation "dragon_peak": {\n` +
        `  "id": "dragon_peak",\n` +
        `  "name": "Dragon Peak",\n` +
        `  "emoji": "🏔️",\n` +
        `  "description": "A mountain peak...",\n` +
        `  "safe": false,\n` +
        `  "minLevel": 20,\n` +
        `  "connectedTo": ["volcanic_ridge"],\n` +
        `  "actions": ["hunt", "mine"],\n` +
        `  "enemies": ["dragon"]\n` +
        `},`
      );
    }

    const locationsPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "locations.js");
    
    try {
      let locationCode = q.trim();
      
      // VALIDATION 1: Basic structure
      if (!locationCode.includes("{") || !locationCode.includes("}")) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nLocation code must contain { and } brackets.`);
      }
      
      // VALIDATION 2: Required fields
      const requiredFields = ["id:", "name:", "emoji:", "description:", "safe:", "minLevel:", "connectedTo:", "actions:", "enemies:"];
      const missingFields = requiredFields.filter(field => !locationCode.includes(field));
      
      if (missingFields.length > 0) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Missing required fields:\n` +
          missingFields.map(f => `• ${f}`).join("\n")
        );
      }
      
      // VALIDATION 3: Extract and validate location ID
      const locationKeyMatch = locationCode.match(/^["']?(\w+)["']?:/);
      const idMatch = locationCode.match(/["']id["']:\s*["']([^"']+)["']/);
      
      if (!locationKeyMatch || !idMatch) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nCould not find location key or ID.`);
      }
      
      const locationKey = locationKeyMatch[1];
      const locationId = idMatch[1];
      
      if (locationKey !== locationId) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Location key and ID must match!\n` +
          `Key: ${locationKey}\nID: ${locationId}`
        );
      }
      
      // VALIDATION 4: Check if location already exists
      const locationsContent = fs.readFileSync(locationsPath, "utf8");
      const existingLocationPattern = new RegExp(`["']${locationId}["']:\\s*{`, "g");
      
      if (existingLocationPattern.test(locationsContent)) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nLocation ID "${locationId}" already exists!`);
      }
      
      // VALIDATION 5: Test JavaScript syntax
      try {
        const testCode = `const test = { ${locationCode} };`;
        eval(testCode);
      } catch (syntaxError) {
        return LenwyText(
          `❌ *SYNTAX ERROR*\n\n${syntaxError.message}\n\n` +
          `Please fix the syntax and try again.`
        );
      }
      
      // Find position before closing };
      const closingPattern = /\n};(\s*\/\*\*|\s*export)/;
      const match = locationsContent.match(closingPattern);
      
      if (!match) {
        return LenwyText("❌ *Error:* Could not find the correct position to insert location.");
      }
      
      const insertPosition = match.index;
      
      // Add proper indentation
      if (!locationCode.startsWith("  ")) {
        locationCode = "  " + locationCode.replace(/\n/g, "\n  ");
      }
      
      if (!locationCode.trim().endsWith(",")) {
        locationCode += ",";
      }
      
      const separator = "\n\n  // ═══════════════════════════════════════════════════════\n  // NEW LOCATION (Added via addlocation command)\n  // ═══════════════════════════════════════════════════════\n\n";
      
      const newContent = 
        locationsContent.slice(0, insertPosition) + 
        separator + 
        locationCode + 
        "\n" +
        locationsContent.slice(insertPosition);
      
      fs.writeFileSync(locationsPath, newContent, "utf8");
      
      return LenwyText(
        `✅ *LOCATION ADDED SUCCESSFULLY!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Location ID: ${locationId}\n` +
        `File: locations.js\n\n` +
        `✓ All validations passed\n` +
        `✓ Syntax is correct\n` +
        `✓ No duplicate ID\n\n` +
        `The location has been added to the database!`
      );
      
    } catch (error) {
      console.error("[ADDLOCATION] Error:", error);
      return LenwyText(`❌ *UNEXPECTED ERROR*\n\n${error.message}`);
    }
  }

  // ════════════════════════════════════════
  // ADD ENEMY - Owner only command
  // ════════════════════════════════════════
  if (command === "addenemy") {
    if (!isEvarick) {
      return LenwyText(globalThis.mess.creator);
    }

    if (!q.trim()) {
      return LenwyText(
        `⚔️ *ADD NEW ENEMY*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Usage: !addenemy <enemy_code>\n\n` +
        `Example:\n` +
        `!addenemy "fire_dragon": {\n` +
        `  "id": "fire_dragon",\n` +
        `  "name": "🐉 Fire Dragon",\n` +
        `  "location": ["dragon_peak"],\n` +
        `  "tier": 5,\n` +
        `  "stats": { "hp": 500, "mana": 200, "attack": 80, "defense": 60, "agility": 40 },\n` +
        `  "drops": [{ "item": "dragon_scale", "chance": 50, "min": 1, "max": 3 }],\n` +
        `  "xp": 500,\n` +
        `  "gold": { "min": 100, "max": 200 },\n` +
        `  "skills": [],\n` +
        `  "passive": null\n` +
        `},`
      );
    }

    const enemiesPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "enemies.js");
    
    try {
      let enemyCode = q.trim();
      
      // VALIDATION 1: Basic structure
      if (!enemyCode.includes("{") || !enemyCode.includes("}")) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nEnemy code must contain { and } brackets.`);
      }
      
      // VALIDATION 2: Required fields
      const requiredFields = ["id:", "name:", "location:", "tier:", "stats:", "drops:", "xp:", "gold:"];
      const missingFields = requiredFields.filter(field => !enemyCode.includes(field));
      
      if (missingFields.length > 0) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Missing required fields:\n` +
          missingFields.map(f => `• ${f}`).join("\n")
        );
      }
      
      // VALIDATION 3: Extract and validate enemy ID
      const enemyKeyMatch = enemyCode.match(/^["']?(\w+)["']?:/);
      const idMatch = enemyCode.match(/["']id["']:\s*["']([^"']+)["']/);
      
      if (!enemyKeyMatch || !idMatch) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nCould not find enemy key or ID.`);
      }
      
      const enemyKey = enemyKeyMatch[1];
      const enemyId = idMatch[1];
      
      if (enemyKey !== enemyId) {
        return LenwyText(
          `❌ *VALIDATION FAILED*\n\n` +
          `Enemy key and ID must match!\n` +
          `Key: ${enemyKey}\nID: ${enemyId}`
        );
      }
      
      // VALIDATION 4: Check if enemy already exists
      const enemiesContent = fs.readFileSync(enemiesPath, "utf8");
      const existingEnemyPattern = new RegExp(`["']${enemyId}["']:\\s*{`, "g");
      
      if (existingEnemyPattern.test(enemiesContent)) {
        return LenwyText(`❌ *VALIDATION FAILED*\n\nEnemy ID "${enemyId}" already exists!`);
      }
      
      // VALIDATION 5: Test JavaScript syntax
      try {
        const testCode = `const test = { ${enemyCode} };`;
        eval(testCode);
      } catch (syntaxError) {
        return LenwyText(
          `❌ *SYNTAX ERROR*\n\n${syntaxError.message}\n\n` +
          `Please fix the syntax and try again.`
        );
      }
      
      // Find position before closing };
      const closingPattern = /\n};(\s*\/\*\*|\s*export)/;
      const match = enemiesContent.match(closingPattern);
      
      if (!match) {
        return LenwyText("❌ *Error:* Could not find the correct position to insert enemy.");
      }
      
      const insertPosition = match.index;
      
      // Add proper indentation
      if (!enemyCode.startsWith("  ")) {
        enemyCode = "  " + enemyCode.replace(/\n/g, "\n  ");
      }
      
      if (!enemyCode.trim().endsWith(",")) {
        enemyCode += ",";
      }
      
      const separator = "\n\n  // ═══════════════════════════════════════════════════════\n  // NEW ENEMY (Added via addenemy command)\n  // ═══════════════════════════════════════════════════════\n\n";
      
      const newContent = 
        enemiesContent.slice(0, insertPosition) + 
        separator + 
        enemyCode + 
        "\n" +
        enemiesContent.slice(insertPosition);
      
      fs.writeFileSync(enemiesPath, newContent, "utf8");
      
      return LenwyText(
        `✅ *ENEMY ADDED SUCCESSFULLY!*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Enemy ID: ${enemyId}\n` +
        `File: enemies.js\n\n` +
        `✓ All validations passed\n` +
        `✓ Syntax is correct\n` +
        `✓ No duplicate ID\n\n` +
        `The enemy has been added to the database!`
      );
      
    } catch (error) {
      console.error("[ADDENEMY] Error:", error);
      return LenwyText(`❌ *UNEXPECTED ERROR*\n\n${error.message}`);
    }
  }

  // ════════════════════════════════════════
  // BASIC MENU
  // ════════════════════════════════════════
  if (command === "basicmenu") {
    const lang = getUserLanguage(normalizedSender);
    
    const menuText = `╭─────────────────╮
📋 *BASIC*
╰─────────────────╯

🎮 *PLAYER*
• !register <name>
• !profile
• !language

📊 *STATS*
• !addstat
• !addstat <stat> <amount>

🗺️ *TRAVEL*
• !location
• !map
• !travel <place>

💰 *ECONOMY*
• !gold

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // COMBAT MENU
  if (command === "combatmenu") {
    const lang = getUserLanguage(normalizedSender);
    
    const menuText = `╭─────────────────╮
⚔️ *COMBAT*
╰─────────────────╯

🎯 *PVE*
• !hunt
• attack
• defend
• skill <1/2/3/4>
• item <name>
• run
• status

⚔️ *PVP*
• !challenge @player
• !challenge <name>
• !accept
• !decline

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // DUNGEON MENU
  // ════════════════════════════════════════
  if (command === "dungeonmenu") {
    const menuText = `╭─────────────────╮
🏰 *DUNGEON*
╰─────────────────╯

👥 *PARTY*
• !party
• !party create
• !party invite @player
• !party accept
• !party decline
• !party leave
• !party kick @player

⚔️ *DUNGEON*
• !dungeon
• !dungeon start

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // INVENTORY MENU
  // ════════════════════════════════════════
  if (command === "inventorymenu") {
    const menuText = `╭─────────────────╮
🎒 *INVENTORY*
╰─────────────────╯

📦 *ITEMS*
• !bag
• !equip <item>
• !unequip <slot>
• !equipment
• !item <name>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // SHOP MENU
  // ════════════════════════════════════════
  if (command === "shopmenu") {
    const menuText = `╭─────────────────╮
🏪 *SHOP*
╰─────────────────╯

🛒 *TRADING*
• !shop
• !buy <item> <amount>
• !sell <item> <amount>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // GATHERING MENU
  // ════════════════════════════════════════
  if (command === "gatheringmenu") {
    const menuText = `╭─────────────────╮
🌲 *GATHERING*
╰─────────────────╯

🎣 *ACTIVITIES*
• !fish
• !mine
• !chop
• !forage
• !search

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // PET MENU
  // ════════════════════════════════════════
  if (command === "petmenu") {
    const menuText = `╭─────────────────╮
🐾 *PET*
╰─────────────────╯

🐾 *MANAGEMENT*
• !pets
• !pets <number>
• !pets equip <number>
• !pets unequip
• !pets pat <number>

⬆️ *UPGRADE*
• !petlevel <number>
• !petenhance <number>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // REST MENU
  // ════════════════════════════════════════
  if (command === "restmenu") {
    const menuText = `╭─────────────────╮
🏕️ *REST*
╰─────────────────╯

😴 *RECOVERY*
• !camp
• !inn
• !leave

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // QUEST MENU
  // ════════════════════════════════════════
  if (command === "questmenu") {
    const menuText = `╭─────────────────╮
📜 *QUEST*
╰─────────────────╯

📋 *QUESTS*
• !quests
• !quests daily
• !quests weekly
• !quests monthly

🎁 *CLAIM*
• !claim daily
• !claim weekly
• !claim monthly

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // TRADING MENU
  // ════════════════════════════════════════
  if (command === "tradingmenu") {
    const menuText = `╭─────────────────╮
🤝 *TRADING*
╰─────────────────╯

🎁 *GIVE*
• !giveitem @player <item> <amount>
• !givegold @player <amount>
• !givepet @player <number>

🔄 *TRADE*
• !trade @player
• !accepttrade
• !declinetrade

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // SKILL MENU
  // ════════════════════════════════════════
  if (command === "skillmenu") {
    const menuText = `╭─────────────────╮
🎓 *SKILL*
╰─────────────────╯

📚 *LEARNING*
• !study
• !study <skill>

⚙️ *MANAGEMENT*
• !myskills
• !equipskill <skill>
• !unequipskill <slot>

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // CRAFTING MENU
  // ════════════════════════════════════════
  if (command === "craftingmenu") {
    const menuText = `╭─────────────────╮
🔨 *CRAFTING*
╰─────────────────╯

⚒️ *CRAFT*
• !craft <item>
• !recipes

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // SPECIAL MENU
  // ════════════════════════════════════════
  if (command === "specialmenu") {
    const menuText = `╭─────────────────╮
🎁 *SPECIAL*
╰─────────────────╯

✨ *FEATURES*
• !redeem <code>
• !leaderboard
• !reputation
• !status

🏅 *TITLES*
• !titles
• !equiptitle <name>
• !unequiptitle

━━━━━━━━━━━━━━━━━━━━`;

    const mediaSent = await sendMenuWithMedia(lenwy, replyJid, menuText, isGroup, len);
    if (mediaSent) return;
    return LenwyText(menuText);
  }

  // ════════════════════════════════════════
  // PARTY COMMAND HANDLER
  // ════════════════════════════════════════
  if (command === "party") {
    await handlePartyCommand(lenwy, msg, args, { normalizedSender, replyJid });
    return;
  }

  // ════════════════════════════════════════
  // DUNGEON COMMAND HANDLER
  // ════════════════════════════════════════
  if (command === "dungeon") {
    await handleDungeonCommand(lenwy, msg, args, { normalizedSender, replyJid });
    return;
  }

  if (!commands.has(command)) return;

  const pluginData = commands.get(command);
  const { execute, info } = pluginData;

  // Control
  if (info.enabled === false) return LenwyText(globalThis.mess.disable);

  if (info.maintenance === true && !isEvarick)
    return LenwyText(globalThis.mess.maintenance);

  if (!isGroup) {
    if (!isPremium && !isEvarick) {
      if (!info.allowPrivate) {
        const lang = getUserLanguage(normalizedSender);
        return LenwyText(getText(lang, "system.notPremium"));
      }
    }
  }

  if (info.owner && !isEvarick) return LenwyText(globalThis.mess.creator);

  if (info.premium && !isPremium && !isEvarick)
    return LenwyText(globalThis.mess.premium);

  if (info.group && !isGroup) return LenwyText(globalThis.mess.group);

  if (info.private && isGroup) return LenwyText(globalThis.mess.private);

  if (info.admin && !isAdmin) return LenwyText(globalThis.mess.admin);

  if (info.botAdmin && !isBotAdmin) return LenwyText(globalThis.mess.botadmin);

  // ── Auto-end camping/inn when using other commands ───────
  // Import and use the camp helper to automatically end camping
  // when players use commands other than camp/inn/leave/accept/decline
  const { autoEndCamping } = await import("./database/rpg/campHelper.js");
  const campEnded = autoEndCamping(normalizedSender, command);
  
  if (campEnded) {
    // Notify player that camping ended
    const lang = getUserLanguage(normalizedSender);
    await lenwy.sendMessage(replyJid, {
      text: getText(lang, "system.campEnded", { command }),
    });
  }
  // ─────────────────────────────────────────────────────────

  try {
    await execute({
      command,
      args,
      q,
      lenwy,
      m,
      msg,
      len,
      replyJid,
      senderJid,
      lenwyreply,
      LenwyText,
      LenwyWait,
      LenwyVideo,
      LenwyImage,
      LenwyAudio,
      LenwyFile,
      isGroup,
      isAdmin,
      isBotAdmin,
      isPremium,
      isEvarick,
      isRpgAdmin,
      plugins,
      commands,
      normalizedSender,
      deleteMessage,
    });
  } catch (error) {
    console.error(chalk.red(`[COMMAND ERROR] ${command}:`), error);
    const lang = getUserLanguage(normalizedSender);
    await LenwyText(getText(lang, "system.commandError", { error: error.message }));
  }
};
