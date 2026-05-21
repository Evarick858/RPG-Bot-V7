// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  !recipes Command
  Base : Lenwy SCM — RPG Extension

  View all discovered recipes (both craftable and not craftable)
  Usage: !recipes [category]
*/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { items } from "../../database/rpg/items.js";
import { resolveCraftMaterial } from "../../database/rpg/craftMaterials.js";
import { recipes, getRecipeById } from "../../database/rpg/recipes.js";
import { getLanguage, getText, getPlayerLanguage } from "../../database/rpg/languages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const playersPath = path.resolve(__dirname, "../../database/rpg/players.json");
const recipeCategoryLabels = {
  en: {
    weapon: "Weapon",
    armor: "Armor",
    consumable: "Consumable",
    tool: "Tool",
    material: "Material",
    utility: "Utility",
    shield: "Shield",
  },
  id: {
    weapon: "Senjata",
    armor: "Armor",
    consumable: "Konsumsi",
    tool: "Alat",
    material: "Material",
    utility: "Utilitas",
    shield: "Perisai",
  },
};

function getRecipeCategoryLabel(lang, category) {
  const labels = recipeCategoryLabels[lang?.code] || recipeCategoryLabels.en;
  return labels[category] || category;
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Recipes",
  menu: ["recipes"],
  case: ["recipes", "recipebook", "book", "resep", "buku"],
  description: "View all your discovered recipes",
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
  const { lenwy, normalizedSender, LenwyText, args } = leni;
  const sender = normalizedSender;
  
  const playersData = JSON.parse(fs.readFileSync(playersPath, "utf-8"));
  
  // Check if player is registered
  if (!playersData[sender]) {
    const lang = getLanguage("en");
    return LenwyText(getText(lang, "craft.needRegister"));
  }

  const player = playersData[sender];
  const lang = getLanguage(getPlayerLanguage(player));

  // Initialize recipes array if not exists
  if (!player.knownRecipes) {
    player.knownRecipes = [];
  }

  if (player.knownRecipes.length === 0) {
    return LenwyText(getText(lang, "recipes.empty"));
  }

  // Get all known recipes
  const knownRecipes = player.knownRecipes
    .map(id => getRecipeById(id))
    .filter(r => r !== null);

  // If no category specified, show category overview
  const categoryFilter = args[0]?.toLowerCase();
  
  if (!categoryFilter) {
    // Group by category and count
    const categoryCount = {};
    for (const recipe of knownRecipes) {
      if (!categoryCount[recipe.category]) {
        categoryCount[recipe.category] = 0;
      }
      categoryCount[recipe.category]++;
    }

    let message = `📖 *${lang.code === "id" ? "BUKU RESEP" : "RECIPE BOOK"}*\n\n`;
    message += getText(lang, "recipes.count", { count: player.knownRecipes.length }) + "\n\n";
    message += `${lang.code === "id" ? "Pilih kategori untuk melihat resep:" : "Select a category to view recipes:"}\n\n`;

    const categories = [
      { key: "weapon", icon: "⚔️" },
      { key: "armor", icon: "🛡️" },
      { key: "shield", icon: "🔰" },
      { key: "consumable", icon: "🧪" },
      { key: "tool", icon: "🔨" },
      { key: "material", icon: "📦" },
      { key: "utility", icon: "✨" }
    ];

    for (const cat of categories) {
      const count = categoryCount[cat.key] || 0;
      if (count > 0) {
        const label = getRecipeCategoryLabel(lang, cat.key);
        message += `${cat.icon} *!recipes ${cat.key}* - ${label} (${count})\n`;
      }
    }

    message += `\n💡 ${lang.code === "id" ? "Contoh: *!recipes weapon*" : "Example: *!recipes weapon*"}`;
    
    return LenwyText(message);
  }

  // Show specific category
  const filteredRecipes = knownRecipes.filter(r => r.category === categoryFilter);

  if (filteredRecipes.length === 0) {
    return LenwyText(getText(lang, "recipes.noCategoryFound", { category: categoryFilter }));
  }

  // Convert inventory array to bag object format
  const playerBag = {};
  for (const item of player.inventory || []) {
    playerBag[item.id] = item.qty;
  }

  const categoryLabel = getRecipeCategoryLabel(lang, categoryFilter);
  let message = `📖 *${categoryLabel.toUpperCase()}*\n`;
  message += `${lang.code === "id" ? `${filteredRecipes.length} resep tersedia` : `${filteredRecipes.length} recipes available`}\n\n`;

  for (const recipe of filteredRecipes) {
    const resultItem = items[recipe.result.itemId];
    const canCraft = checkCanCraft(recipe, playerBag);
    const statusIcon = canCraft ? getText(lang, "recipes.canCraft") : getText(lang, "recipes.cantCraft");
    
    message += `${statusIcon} *${resultItem?.name || recipe.result.itemId}*\n`;
    message += getText(lang, "recipes.result", { qty: recipe.result.quantity }) + "\n";
    message += getText(lang, "recipes.materials") + "\n";
    
    for (const mat of recipe.materials) {
      const matItem = resolveCraftMaterial(mat.itemId);
      const playerAmount = playerBag[mat.itemId] || 0;
      const hasEnough = playerAmount >= mat.quantity ? "✅" : "❌";
      message += `  ${hasEnough} ${matItem?.name || mat.itemId} (${playerAmount}/${mat.quantity})\n`;
    }
    
    message += getText(lang, "recipes.craftCommand", { id: recipe.id }) + "\n\n";
  }

  message += `🔙 ${lang.code === "id" ? "Ketik *!recipes* untuk kembali" : "Type *!recipes* to go back"}`;

  return LenwyText(message);
}

// ── Helper Functions ──────────────────────────────────────

/**
 * Check if player can craft a recipe
 */
function checkCanCraft(recipe, playerBag) {
  for (const mat of recipe.materials) {
    const playerAmount = playerBag[mat.itemId] || 0;
    if (playerAmount < mat.quantity) {
      return false;
    }
  }
  return true;
}
