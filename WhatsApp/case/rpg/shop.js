// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : shop
  Base : Lenwy SCM — RPG Extension

  Commands:
  - shop          → view current shop stock

  Rules:
  - Must be at a location with a shop
  - Shop stock is limited, resets every 30 minutes
  - Different shops sell different items
  - Prices vary by location
  - Bot is excluded
*/

import fs from "fs";
import path from "path";
import { getLocationById } from "../../database/rpg/locations.js";
import { 
  locationShops, 
  shopCategories, 
  getShopInventory, 
  getItemPrice,
  getTimeUntilRestock,
  formatRestockTime
} from "../../database/rpg/shopData.js";
import { items } from "../../database/rpg/items.js";
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

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Shop",
  menu: ["shop"],
  case: ["shop", "toko", "belanja"],
  description: "Browse the local shop. Stock resets every 30 minutes.",
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
    lenwy,
    normalizedSender,
    LenwyText,
  } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];

  if (!player) {
    const lang = getLanguage("id");
    return LenwyText(
      `⚠️ *${getText(lang, "common.notRegistered")}*\n\n${getText(lang, "common.registerFirst")}`
    );
  }

  const lang = getLanguage(getPlayerLanguage(player));

  const location = getLocationById(player.currentLocation);
  const shop = getShopInventory(player.currentLocation);

  if (!shop) {
    // Build shop locations list dynamically
    const shopLocationsList = Object.keys(locationShops)
      .map(id => {
        const loc = getLocationById(id);
        return loc ? `• ${loc.emoji} ${loc.name}` : `• ${id}`;
      })
      .join("\n");

    return LenwyText(getText(lang, "shop.noShopHere", { locations: shopLocationsList }));
  }

  // Get shop category info
  const category = shopCategories[shop.category];
  const timeUntilRestock = getTimeUntilRestock(player.currentLocation);

  // Build shop display
  let text = `${category.emoji} *${category.name}*\n`;
  text += `📍 ${location?.name || player.currentLocation}\n`;
  text += `💬 "${category.description}"\n\n`;
  text += `${getText(lang, "shop.yourGold", {gold: player.gold})}\n`;
  text += `⏱️ ${lang.code === "id" ? "Restock dalam" : "Restock in"}: *${formatRestockTime(timeUntilRestock)}*\n`;
  text += `💵 ${lang.code === "id" ? "Pengali harga" : "Price multiplier"}: *${shop.priceMultiplier}x*\n\n`;
  text += `*═══ ${lang.code === "id" ? "INVENTORI" : "INVENTORY"} ═══*\n`;

  // Group items by category
  const itemsByCategory = {};

  // Armor slot name shortener for shop display
  const armorSlotShort = {
    head: "Head",
    chest: "Chest",
    legs: "Legs",
    boots: "Boots",
  };
  // Words to strip from armor names (replaced by short slot label)
  const armorSlotWords = ["Head", "chest", "legs", "Boots", "Greaves", "Gauntlets", "Pauldrons"];

  function getArmorShortName(item) {
    if (item.category !== "armor" || !item.armorSlot) return null;
    const slot = item.armorSlot;
    const shortSlot = armorSlotShort[slot] || slot;
    // Strip the full item name down to set name + short slot
    let name = item.name || item.id;
    // Remove emoji prefix
    name = name.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\uFE0F\s]+/u, "").trim();
    // Remove known slot words
    for (const word of armorSlotWords) {
      name = name.replace(new RegExp(`\\b${word}\\b`, "i"), "").trim();
    }
    // Clean up extra spaces
    name = name.replace(/\s+/g, " ").trim();
    return `${name} ${shortSlot}`;
  }

  for (const shopItem of shop.inventory) {
    const itemData = items[shopItem.itemId];
    if (!itemData) continue;

    const cat = itemData.category || "other";
    if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
    
    const price = getItemPrice(shopItem.itemId, player.currentLocation);
    itemsByCategory[cat].push({
      ...itemData,
      stock: shopItem.stock,
      price: price,
    });
  }

  // Display items by category
  const categoryOrder = ["weapon", "armor", "consumable", "tool", "skill_book", "material", "utility", "other"];
  const categoryEmojis = {
    weapon: "⚔️",
    armor: "🛡️",
    consumable: "🧪",
    tool: "🔨",
    skill_book: "📚",
    material: "📦",
    utility: "🎒",
    other: "📦",
  };
  const categoryNames = lang.code === "id"
    ? {
        weapon: "senjata",
        armor: "armor",
        consumable: "konsumsi",
        tool: "alat",
        skill_book: "buku skill",
        material: "material",
        utility: "utilitas",
        other: "lainnya",
      }
    : {};

  for (const cat of categoryOrder) {
    if (!itemsByCategory[cat]) continue;

    const emoji = categoryEmojis[cat] || "📦";
    const catName = (categoryNames[cat] || cat.replace("_", " ")).toUpperCase();
    text += `\n${emoji} *${catName}*\n`;

    for (const item of itemsByCategory[cat]) {
      const stockText = item.stock > 0
        ? (lang.code === "id" ? `(${item.stock} tersisa)` : `(${item.stock} left)`)
        : (lang.code === "id" ? `(HABIS)` : `(OUT OF STOCK)`);

      // Get item emoji (use item's emoji or default based on category)
      const itemEmoji = item.emoji || categoryEmojis[cat] || "📦";
      
      // Format item name (capitalize first letter of each word)
      const itemName = item.name || item.id.split("_").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");

      if (cat === "skill_book") {
        // Skill books get a detailed display with requirements
        const classes = item.requiredClass?.join("/") || (lang.code === "id" ? "Semua" : "All");
        const level = item.requiredLevel || 1;
        text += `• ${itemEmoji} ${itemName} - ${item.price}g ${stockText}\n`;
        text += `  Lv${level}+ ${classes} | \`${item.id}\`\n`;
      } else if (cat === "armor") {
        // Armor: show short name (e.g. "Wool Chest") so players know what to type
        const shortName = getArmorShortName(item) || itemName;
        text += `• ${itemEmoji} ${shortName} - ${item.price}g ${stockText}\n`;
      } else {
        // Regular items - simple format
        text += `• ${itemEmoji} ${itemName} - ${item.price}g ${stockText}\n`;
      }
    }
  }

  const isId = lang.code === "id";
  text += `\n*═══ ${isId ? "CARA MEMBELI" : "HOW TO BUY"} ═══*\n`;
  text += `• *!buy <id>* — ${isId ? "Beli 1 item" : "Buy 1 item"}\n`;
  text += `• *!buy <id> <qty>* — ${isId ? "Beli beberapa" : "Buy multiple"}\n\n`;
  text += `*${isId ? "Contoh" : "Examples"}:*\n`;
  text += `!buy health_potion\n`;
  text += `!buy health_potion 5\n`;
  text += `!buy skill_book_meteor\n\n`;
  text += `📚 *${isId ? "Cara pakai Skill Book" : "How to use a Skill Book"}:*\n`;
  text += `1. ${isId ? "Beli" : "Buy"}: !buy skill_book_meteor\n`;
  text += `2. ${isId ? "Pelajari" : "Learn"}: !study skill_book_meteor\n`;
  text += `3. ${isId ? "Pasang" : "Equip"}: !equipskill meteor 1\n\n`;
  text += `💡 *Tip:* ${isId ? "Gunakan ID di bawah nama item untuk membeli" : "Use the ID shown below each item name to buy"}`;

  return LenwyText(text);
}
