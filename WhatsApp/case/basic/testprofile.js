// Test Profile - Simple version to test iOS compatibility

export const info = {
  name: "TestProfile",
  menu: ["testprofile"],
  case: ["testprofile", "tp"],
  description: "Test simple profile message for iOS",
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

  // Simple message without complex formatting
  const simpleMessage = 
    `Profile Test\n\n` +
    `Name: TestUser\n` +
    `Level: 5\n` +
    `HP: 100/100\n` +
    `Gold: 500\n\n` +
    `This is a simple test message.`;

  return LenwyText(simpleMessage);
}
