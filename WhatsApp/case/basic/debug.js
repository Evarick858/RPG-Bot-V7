// ============================================
// Debug Command - Comprehensive iOS Testing
// ============================================

export const info = {
  name: "Debug",
  menu: ["debug"],
  case: ["debug"],
  description: "Debug message compatibility for iOS",
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

  const testType = args[0]?.toLowerCase() || "menu";

  // ═══════════════════════════════════════════════════════
  // TEST MENU
  // ═══════════════════════════════════════════════════════
  if (testType === "menu") {
    await lenwy.sendMessage(replyJid, {
      text: `🔍 *DEBUG MENU*\n\n` +
        `Test iOS message compatibility:\n\n` +
        `*Available Tests:*\n` +
        `• !debug simple - Plain text\n` +
        `• !debug emoji - Common emojis\n` +
        `• !debug special - Special chars\n` +
        `• !debug bar - Progress bars\n` +
        `• !debug long - Long message\n` +
        `• !debug format - Text formatting\n` +
        `• !debug all - All tests combined\n\n` +
        `*Example:* !debug emoji`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 1: SIMPLE TEXT
  // ═══════════════════════════════════════════════════════
  if (testType === "simple") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 1: Simple Text\n\n` +
        `This is a plain text message.\n` +
        `No emojis, no special characters.\n` +
        `Just basic ASCII text.\n\n` +
        `Can you see this message?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 2: EMOJI TEST
  // ═══════════════════════════════════════════════════════
  if (testType === "emoji") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 2: Emoji Test\n\n` +
        `Basic Emojis:\n` +
        `😀 😃 😄 😁 😆\n\n` +
        `RPG Emojis:\n` +
        `👤 User\n` +
        `⚔️ Attack\n` +
        `🛡️ Defense\n` +
        `❤️ HP\n` +
        `💧 Mana\n` +
        `💰 Gold\n` +
        `📊 Stats\n` +
        `🎖️ Level\n` +
        `✨ XP\n` +
        `🎒 Bag\n` +
        `🏹 Hunt\n` +
        `⛏️ Mine\n` +
        `🎣 Fish\n` +
        `🪓 Chop\n` +
        `🍄 Forage\n\n` +
        `Can you see all emojis?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 3: SPECIAL CHARACTERS
  // ═══════════════════════════════════════════════════════
  if (testType === "special") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 3: Special Characters\n\n` +
        `Symbols:\n` +
        `• Bullet point\n` +
        `★ Star\n` +
        `♦ Diamond\n` +
        `→ Arrow\n` +
        `═ Double line\n` +
        `─ Single line\n\n` +
        `Separators:\n` +
        `========================\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `────────────────────────\n\n` +
        `Can you see all symbols?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 4: PROGRESS BARS
  // ═══════════════════════════════════════════════════════
  if (testType === "bar") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 4: Progress Bars\n\n` +
        `Bar Style 1 (■□):\n` +
        `[■■■■■■■■□□] 80%\n` +
        `[■■■■■□□□□□] 50%\n` +
        `[■■□□□□□□□□] 20%\n\n` +
        `Bar Style 2 (▰▱):\n` +
        `[▰▰▰▰▰▰▰▰▱▱] 80%\n` +
        `[▰▰▰▰▰▱▱▱▱▱] 50%\n` +
        `[▰▰▱▱▱▱▱▱▱▱] 20%\n\n` +
        `Bar Style 3 (█░):\n` +
        `[████████░░] 80%\n` +
        `[█████░░░░░] 50%\n` +
        `[██░░░░░░░░] 20%\n\n` +
        `Which bars can you see?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 5: LONG MESSAGE
  // ═══════════════════════════════════════════════════════
  if (testType === "long") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 5: Long Message\n\n` +
        `This is a test of a longer message to see if message length affects iOS compatibility.\n\n` +
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n` +
        `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n` +
        `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\n` +
        `Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\n` +
        `========================\n\n` +
        `Additional content:\n` +
        `• Line 1\n` +
        `• Line 2\n` +
        `• Line 3\n` +
        `• Line 4\n` +
        `• Line 5\n\n` +
        `Can you see the entire message?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 6: TEXT FORMATTING
  // ═══════════════════════════════════════════════════════
  if (testType === "format") {
    await lenwy.sendMessage(replyJid, {
      text: `TEST 6: Text Formatting\n\n` +
        `*Bold Text*\n` +
        `_Italic Text_\n` +
        `~Strikethrough Text~\n` +
        `\`Monospace Text\`\n\n` +
        `*Bold with emoji* ⚔️\n` +
        `_Italic with emoji_ 🛡️\n\n` +
        `Mixed: *Bold* and _Italic_ and ~Strike~\n\n` +
        `Can you see all formatting?`
    });
    return;
  }

  // ═══════════════════════════════════════════════════════
  // TEST 7: ALL COMBINED
  // ═══════════════════════════════════════════════════════
  if (testType === "all") {
    await lenwy.sendMessage(replyJid, {
      text: `🔍 *COMPREHENSIVE TEST*\n\n` +
        `========================\n` +
        `👤 *Profile Simulation*\n` +
        `========================\n\n` +
        `🎖️ Level: 10 | 💰 Gold: 1000\n` +
        `❤️ HP: [■■■■■■■■□□] 80/100\n` +
        `💧 Mana: [■■■■■□□□□□] 50/100\n` +
        `✨ XP: [■■□□□□□□□□] 200/1000\n\n` +
        `========================\n` +
        `📊 *Stats*\n` +
        `========================\n` +
        `⚔️ Attack: 25 (+5)\n` +
        `🛡️ Defense: 20 (+3)\n` +
        `⚡ Agility: 15\n` +
        `🍀 Luck: 10\n\n` +
        `========================\n` +
        `⚔️ *Equipment*\n` +
        `========================\n` +
        `🗡️ Weapon: Iron Sword\n` +
        `🛡️ Shield: Wooden Shield\n` +
        `🦺 Armor: 2/4 pieces\n` +
        `💍 Accessory: None\n\n` +
        `========================\n\n` +
        `Can you see everything?`
    });
    return;
  }

  // Unknown test type
  await lenwy.sendMessage(replyJid, {
    text: `❌ Unknown test: ${testType}\n\n` +
      `Use *!debug menu* to see available tests.`
  });
}
