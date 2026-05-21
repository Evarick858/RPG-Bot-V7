// Test Emoji - Test which emojis break iOS

export const info = {
  name: "TestEmoji",
  menu: ["testemoji"],
  case: ["testemoji", "te"],
  description: "Test emoji compatibility for iOS",
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

  // Test common RPG emojis
  const emojiTest = 
    `Emoji Test\n\n` +
    `👤 User\n` +
    `⚔️ Attack\n` +
    `🛡️ Defense\n` +
    `❤️ HP\n` +
    `💧 Mana\n` +
    `💰 Gold\n` +
    `📊 Stats\n` +
    `🎖️ Level\n` +
    `✨ XP\n` +
    `🎒 Bag\n\n` +
    `Can you see all emojis?`;

  return LenwyText(emojiTest);
}
