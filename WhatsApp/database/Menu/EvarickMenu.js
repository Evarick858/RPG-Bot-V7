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

import fs from "fs";
import path from "path";
const ordersFile = path.join(
  process.cwd(),
  "WhatsApp",
  "database",
  "orders.json",
);

globalThis.getOrderStats = function () {
  let totalOrders = 0;
  let totalAmount = 0;

  if (fs.existsSync(ordersFile)) {
    const data = JSON.parse(fs.readFileSync(ordersFile));

    for (let user in data) {
      let order = data[user];
      if (order.status === "paid") {
        totalOrders++;
        totalAmount += Number(order.amount) || 0;
      }
    }
  }

  return { totalOrders, totalAmount };
};

((globalThis.lenwymenu = `🎮 *EVARICK RPG BOT*

A text-based RPG adventure where you explore locations, battle monsters, gather resources, and become stronger!

✨ *Key Features:*
• Turn-based combat system
• Resource gathering (chop, mine, fish, forage)
• Crafting & trading system
• Quests & achievements
• Party system for group adventures
• Pet companions

📋 *Quick Start:*
• Type *!menu* to see all command categories
• Type *!register* to create your character
• Type *!profile* to view your stats

⚔️ *Evarick RPG Bot - Adventure Awaits!*\n`),
  // List Menu =========================
  (globalThis.storelist = `🎁 *Order Statistics*
*Order : ${getOrderStats().totalOrders}*
*Transaksi : Rp${getOrderStats().totalAmount.toLocaleString("id-ID")}*

*Contoh : Order A2*

📦 *Daftar Produk :*`));

