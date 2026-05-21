// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  Test Command - Button Reply Test
  For testing @yudzxml/baileys button compatibility with iOS
*/

export const info = {
  name: "Test",
  menu: ["test"],
  case: ["test"],
  description: "Test button reply for iOS compatibility",
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
  const { lenwy, replyJid, normalizedSender } = leni;

  // Block bot from using commands
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  try {
    // Send message with button replies (iOS compatible format)
    const buttonMessage = {
      text: "👋 *Halo!*\n\nIni adalah test button untuk iOS compatibility.\n\nPilih salah satu:",
      footer: "Powered by @yudzxml/baileys",
      buttons: [
        {
          buttonId: "test_hi",
          buttonText: { displayText: "Hi" },
          type: 1,
        },
        {
          buttonId: "test_halo",
          buttonText: { displayText: "Halo" },
          type: 1,
        },
      ],
      headerType: 1,
    };

    await lenwy.sendMessage(replyJid, buttonMessage);
  } catch (error) {
    console.error("[TEST] Error sending button message:", error);
    
    // Fallback to text-only if button fails
    await lenwy.sendMessage(replyJid, {
      text: "👋 *Halo!*\n\n⚠️ Button tidak support di device ini.\n\nBalas dengan:\n• hi\n• halo",
    });
  }
}
