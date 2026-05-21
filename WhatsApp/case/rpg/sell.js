// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : sell
  Base : Lenwy SCM — RPG Extension

  Enhanced selling system with multiple options:
  
  Single item:
  - sell <item>              → Sell 1 item
  - sell <item> <qty>        → Sell X items
  - sell all <item>          → Sell all of that item
  
  Multiple items:
  - sell <item1>, <item2>    → Sell 1 of each
  - sell <item1>, <item2> <qty> → Sell X of each
  - sell <item1>, <item2> all   → Sell all of each
  
  By category:
  - sell <category> all      → Sell all items in category
  - sell <category> <qty>    → Sell X of each in category
  
  Categories: weapon, armor, material, consumable, tool, fish, ore, wood, herb
  
  Confirmation:
  - sell confirm             → Confirm pending sale

  Rules:
  - Must be at a location with a shop
  - Item must have sellPrice > 0
  - Equipped items cannot be sold
  - Quest items cannot be sold
  - Large sales require confirmation
*/

import fs from "fs";
import path from "path";
import { canDoAction } from "../../database/rpg/locations.js";
import { hasShop } from "../../database/rpg/shopData.js";
import { items } from "../../database/rpg/items.js";
import { fishList } from "../../database/rpg/fish.js";
import { ores } from "../../database/rpg/ores.js";
import { woods } from "../../database/rpg/woods.js";
import { herbs } from "../../database/rpg/herbs.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";

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
  const updated = {
    _comment: data._comment,
    _template: data._template,
    ...players,
  };
  fs.writeFileSync(playersPath, JSON.stringify(updated, null, 2), "utf8");
}

// Get item data from any database
function getItemData(itemId) {
  // Check items.js first
  if (items[itemId]) return items[itemId];

  // Check fish
  if (fishList[itemId]) return fishList[itemId];

  // Check ores
  if (ores[itemId]) return ores[itemId];

  // Check woods
  if (woods[itemId]) return woods[itemId];

  // Check herbs
  if (herbs[itemId]) return herbs[itemId];

  return null;
}

// Get all items from player inventory by category
function getItemsByCategory(player, category) {
  const categoryMap = {
    weapon: "weapon",
    armor: "armor",
    material: "material",
    consumable: "consumable",
    tool: "tool",
    utility: "utility",
    quest: "quest",
    fish: "fish",
    ore: "ore",
    wood: "wood",
    herb: "herb",
  };

  const targetCategory = categoryMap[category.toLowerCase()];
  if (!targetCategory) return [];

  const result = [];

  for (const invItem of player.inventory) {
    if (invItem.qty <= 0) continue;

    const itemData = getItemData(invItem.id);
    if (!itemData) continue;

    // Check category
    let matches = false;
    if (targetCategory === "fish" && fishList[invItem.id]) matches = true;
    else if (targetCategory === "ore" && ores[invItem.id]) matches = true;
    else if (targetCategory === "wood" && woods[invItem.id]) matches = true;
    else if (targetCategory === "herb" && herbs[invItem.id]) matches = true;
    else if (itemData.category === targetCategory) matches = true;

    if (matches) {
      result.push({
        invItem,
        itemData,
      });
    }
  }

  return result;
}

// Check if item is equipped
function isItemEquipped(player, itemId) {
  if (!player.equipment) return false;
  
  return Object.values(player.equipment).some(equipped => 
    equipped && equipped.id === itemId
  );
}

// Check if item can be sold
function canSellItem(itemData, player, itemId) {
  // Must have sell price
  if (!itemData.sellPrice || itemData.sellPrice <= 0) return false;
  
  // Cannot sell quest items
  if (itemData.category === "quest") return false;
  
  // Cannot sell equipped items
  if (isItemEquipped(player, itemId)) return false;
  
  return true;
}

export const info = {
  name: "Sell",
  menu: ["sell"],
  case: ["sell", "jual"],
  description: "Sell items from your inventory to the shop.",
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
  const { lenwy, normalizedSender, LenwyText, q } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  const players = loadPlayers();
  const player = players[normalizedSender];
  const lang = player ? getLanguage(getPlayerLanguage(player)) : getLanguage("id");

  if (!player) {
    return LenwyText(
      `⚠️ *${getText(lang, "common.notRegistered")}*\n\n` +
      getText(lang, "common.registerFirst")
    );
  }

  if (!canDoAction(player.currentLocation, "shop") || !hasShop(player.currentLocation)) {
    return LenwyText(getText(lang, "sell.noShopToSell"));
  }

  // Initialize pending sale if not exists
  if (!player.pendingSale) {
    player.pendingSale = null;
  }

  // Handle confirmation
  if (q.trim().toLowerCase() === "confirm" || q.trim().toLowerCase() === "konfirmasi") {
    if (!player.pendingSale) {
      return LenwyText(getText(lang, "sell.noPendingSale"));
    }

    // Execute the sale
    const sale = player.pendingSale;
    let totalEarned = 0;
    const soldItems = [];

    for (const item of sale.items) {
      const invItem = player.inventory.find(i => i.id === item.itemId);
      if (!invItem || invItem.qty < item.qty) continue;

      const earned = item.sellPrice * item.qty;
      totalEarned += earned;

      invItem.qty -= item.qty;
      if (invItem.qty <= 0) {
        player.inventory = player.inventory.filter(i => i.id !== item.itemId);
      }

      soldItems.push({
        name: item.name,
        qty: item.qty,
        earned: earned,
      });
    }

    player.gold += totalEarned;
    player.stats_tracker.totalGoldEarned = (player.stats_tracker.totalGoldEarned || 0) + totalEarned;
    player.lastActive = new Date().toISOString();
    player.pendingSale = null;

    players[normalizedSender] = player;
    savePlayers(players);

    // Build success message
    let text = getText(lang, "sell.saleSuccessTitle");
    text += getText(lang, "sell.itemsSoldHeader");
    
    for (const item of soldItems) {
      text += `• ${item.name} x${item.qty} → *${item.earned}g*\n`;
    }

    text += `\n*═══════════════*\n`;
    text += getText(lang, "sell.totalEarned", { total: totalEarned });
    text += getText(lang, "sell.currentGold", { gold: player.gold });

    return LenwyText(text);
  }

  // Cancel pending sale if new command
  if (player.pendingSale) {
    player.pendingSale = null;
  }

  if (!q.trim()) {
    return LenwyText(getText(lang, "sell.usageExtended"));
  }

  const input = q.trim().toLowerCase();
  const parts = input.split(/\s+/);

  // Check if it's a category sell
  const categories = ["weapon", "armor", "material", "consumable", "tool", "utility", "fish", "ore", "wood", "herb"];
  const firstWord = parts[0];

  if (categories.includes(firstWord)) {
    // Selling by category
    const category = firstWord;
    const secondWord = parts[1];

    let sellAll = false;
    let qty = 1;

    if (secondWord === "all" || secondWord === "semua") {
      sellAll = true;
    } else if (secondWord && /^\d+$/.test(secondWord)) {
      qty = Math.max(1, Math.min(9999, parseInt(secondWord)));
    } else {
      return LenwyText(getText(lang, "sell.categoryFormatError", { category }));
    }

    const categoryItems = getItemsByCategory(player, category);
    
    if (categoryItems.length === 0) {
      return LenwyText(getText(lang, "sell.noCategoryItems", { category }));
    }

    // Build sale list
    const saleItems = [];
    let totalValue = 0;
    const skippedItems = [];

    for (const { invItem, itemData } of categoryItems) {
      if (!canSellItem(itemData, player, invItem.id)) {
        skippedItems.push(itemData.name);
        continue;
      }

      const qtyToSell = sellAll ? invItem.qty : Math.min(qty, invItem.qty);
      const value = itemData.sellPrice * qtyToSell;

      saleItems.push({
        itemId: invItem.id,
        name: itemData.name,
        qty: qtyToSell,
        sellPrice: itemData.sellPrice,
      });

      totalValue += value;
    }

    if (saleItems.length === 0) {
      return LenwyText(
        getText(lang, "sell.noCategoryItems", { category }) +
        (skippedItems.length > 0 ? `\n\n${getText(lang, "sell.cannotSellItems", { items: skippedItems.join(", ") })}` : "")
      );
    }

    // Require confirmation for category sales
    player.pendingSale = {
      items: saleItems,
      totalValue: totalValue,
    };
    players[normalizedSender] = player;
    savePlayers(players);

    let text = getText(lang, "sell.confirmTitle");
    text += getText(lang, "sell.categoryLabel", { category });
    text += getText(lang, "sell.itemsToSellHeader");

    for (const item of saleItems.slice(0, 10)) {
      text += `• ${item.name} x${item.qty} → *${item.sellPrice * item.qty}g*\n`;
    }

    if (saleItems.length > 10) {
      text += getText(lang, "sell.andMoreItems", { count: saleItems.length - 10 });
    }

    text += `\n*═══════════════*\n`;
    text += getText(lang, "sell.totalValue", { total: totalValue });
    text += getText(lang, "sell.itemCount", { count: saleItems.length });

    if (skippedItems.length > 0) {
      text += getText(lang, "sell.skippedItems", { 
        items: skippedItems.slice(0, 5).join(", ") + (skippedItems.length > 5 ? "..." : "")
      });
    }

    text += getText(lang, "sell.confirmPrompt");

    return LenwyText(text);
  }

  // Check if comma-separated (multiple items)
  if (input.includes(",")) {
    const segments = input.split(",").map(s => s.trim());
    
    // Check if last segment has quantity or "all"
    let sellAll = false;
    let qty = 1;
    const lastSegment = segments[segments.length - 1];
    const lastParts = lastSegment.split(/\s+/);

    if (lastParts.length > 1) {
      const lastWord = lastParts[lastParts.length - 1];
      if (lastWord === "all" || lastWord === "semua") {
        sellAll = true;
        segments[segments.length - 1] = lastParts.slice(0, -1).join("_");
      } else if (/^\d+$/.test(lastWord)) {
        qty = Math.max(1, Math.min(9999, parseInt(lastWord)));
        segments[segments.length - 1] = lastParts.slice(0, -1).join("_");
      }
    }

    // Process each item
    const saleItems = [];
    let totalValue = 0;
    const notFound = [];
    const cannotSell = [];

    for (let itemName of segments) {
      itemName = itemName.replace(/\s+/g, "_");
      const itemData = getItemData(itemName);

      if (!itemData) {
        notFound.push(itemName);
        continue;
      }

      if (!canSellItem(itemData, player, itemData.id)) {
        cannotSell.push(itemData.name);
        continue;
      }

      const invItem = player.inventory.find(i => i.id === itemData.id);
      if (!invItem || invItem.qty <= 0) {
        notFound.push(itemData.name);
        continue;
      }

      const qtyToSell = sellAll ? invItem.qty : Math.min(qty, invItem.qty);
      const value = itemData.sellPrice * qtyToSell;

      saleItems.push({
        itemId: itemData.id,
        name: itemData.name,
        qty: qtyToSell,
        sellPrice: itemData.sellPrice,
      });

      totalValue += value;
    }

    if (saleItems.length === 0) {
      let errorMsg = getText(lang, "sell.noItemsToSell");
      if (notFound.length > 0) {
        errorMsg += getText(lang, "sell.notFoundItems", { items: notFound.join(", ") });
      }
      if (cannotSell.length > 0) {
        errorMsg += getText(lang, "sell.cannotSellItems", { items: cannotSell.join(", ") });
      }
      return LenwyText(errorMsg);
    }

    // If selling multiple items or large quantity, require confirmation
    if (saleItems.length > 1 || totalValue > 1000) {
      player.pendingSale = {
        items: saleItems,
        totalValue: totalValue,
      };
      players[normalizedSender] = player;
      savePlayers(players);

      let text = getText(lang, "sell.confirmTitle");
      text += getText(lang, "sell.itemsToSellHeader");

      for (const item of saleItems) {
        text += `• ${item.name} x${item.qty} → *${item.sellPrice * item.qty}g*\n`;
      }

      text += `\n*═══════════════*\n`;
      text += getText(lang, "sell.totalValue", { total: totalValue });

      if (notFound.length > 0 || cannotSell.length > 0) {
        text += getText(lang, "sell.skippedLabel");
        if (notFound.length > 0) text += `${notFound.join(", ")}\n`;
        if (cannotSell.length > 0) text += `${cannotSell.join(", ")}\n`;
        text += `\n`;
      }

      text += getText(lang, "sell.confirmPrompt");

      return LenwyText(text);
    }

    // Single item, small value - sell immediately
    const item = saleItems[0];
    const invItem = player.inventory.find(i => i.id === item.itemId);
    invItem.qty -= item.qty;
    if (invItem.qty <= 0) {
      player.inventory = player.inventory.filter(i => i.id !== item.itemId);
    }

    player.gold += totalValue;
    player.stats_tracker.totalGoldEarned = (player.stats_tracker.totalGoldEarned || 0) + totalValue;
    player.lastActive = new Date().toISOString();
    players[normalizedSender] = player;
    savePlayers(players);

    return LenwyText(
      getText(lang, "sell.soldSuccessfully") +
      `\n• ${item.name} x${item.qty}\n` +
      getText(lang, "sell.earnedGold", { earned: totalValue }) +
      `\n` +
      getText(lang, "sell.currentGold", { gold: player.gold })
    );
  }

  // Single item sell (original logic)
  let sellAll = false;
  let itemNameParts = parts;
  let qty = 1;

  if (parts[0] === "all" || parts[0] === "semua") {
    sellAll = true;
    itemNameParts = parts.slice(1);
  } else {
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      qty = Math.max(1, Math.min(9999, parseInt(lastPart)));
      itemNameParts = parts.slice(0, -1);
    }
  }

  const itemName = itemNameParts.join("_");
  const itemData = getItemData(itemName);

  if (!itemData) {
    return LenwyText(getText(lang, "sell.itemNotFound", { item: itemName.replace(/_/g, " ") }));
  }

  if (!canSellItem(itemData, player, itemData.id)) {
    let reasonKey = "sell.cannotSellGeneric";
    if (itemData.category === "quest") {
      reasonKey = "sell.questItemsCannotSell";
    } else if (isItemEquipped(player, itemData.id)) {
      reasonKey = "sell.itemEquipped";
    }
    return LenwyText(getText(lang, reasonKey, { item: itemData.name }));
  }

  const invItem = player.inventory.find((i) => i.id === itemData.id);
  if (!invItem || invItem.qty <= 0) {
    return LenwyText(getText(lang, "sell.notInInventory", { item: itemData.name }));
  }

  if (sellAll) qty = invItem.qty;
  qty = Math.min(qty, invItem.qty);

  const totalEarned = itemData.sellPrice * qty;

  // Require confirmation for large sales
  if (totalEarned > 1000 || qty > 50) {
    player.pendingSale = {
      items: [{
        itemId: itemData.id,
        name: itemData.name,
        qty: qty,
        sellPrice: itemData.sellPrice,
      }],
      totalValue: totalEarned,
    };
    players[normalizedSender] = player;
    savePlayers(players);

    return LenwyText(
      getText(lang, "sell.confirmTitle") +
      `\n• ${itemData.name} x${qty}\n` +
      getText(lang, "sell.totalValue", { total: totalEarned }) +
      `\n` +
      getText(lang, "sell.confirmPrompt")
    );
  }

  // Sell immediately for small sales
  invItem.qty -= qty;
  if (invItem.qty <= 0) {
    player.inventory = player.inventory.filter((i) => i.id !== itemData.id);
  }

  player.gold += totalEarned;
  player.stats_tracker.totalGoldEarned = (player.stats_tracker.totalGoldEarned || 0) + totalEarned;
  player.lastActive = new Date().toISOString();
  players[normalizedSender] = player;
  savePlayers(players);

  return LenwyText(
    getText(lang, "sell.soldSuccessfully") +
    `\n• ${itemData.name} x${qty}\n` +
    getText(lang, "sell.earnedGold", { earned: totalEarned }) +
    `\n` +
    getText(lang, "sell.currentGold", { gold: player.gold })
  );
}
