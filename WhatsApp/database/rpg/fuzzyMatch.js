// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  Fuzzy Matching Helper
  Base : Lenwy SCM — RPG Extension

  Auto-correct typos in commands using Levenshtein Distance
*/

/**
 * Calculate Levenshtein Distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity ratio (0 = completely different, 1 = identical)
 */
function similarityRatio(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - (distance / maxLength);
}

/**
 * Find best match from a list of options
 * @param {string} input - User input (possibly with typo)
 * @param {string[]} options - List of valid options
 * @param {number} threshold - Minimum similarity threshold (0-1), default 0.6
 * @returns {object|null} - { match: string, similarity: number, corrected: boolean } or null
 */
export function findBestMatch(input, options, threshold = 0.6) {
  if (!input || !options || options.length === 0) return null;

  const inputLower = input.toLowerCase().trim();
  
  // Check for exact match first
  const exactMatch = options.find(opt => opt.toLowerCase() === inputLower);
  if (exactMatch) {
    return { match: exactMatch, similarity: 1.0, corrected: false };
  }

  // Find best fuzzy match
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const option of options) {
    const similarity = similarityRatio(inputLower, option.toLowerCase());
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = option;
    }
  }

  if (bestMatch) {
    return { match: bestMatch, similarity: bestSimilarity, corrected: true };
  }

  return null;
}

/**
 * Find best match for location names
 * @param {string} input - User input location name
 * @param {object[]} locations - Array of location objects with 'name' property
 * @param {number} threshold - Minimum similarity threshold
 * @returns {object|null} - { location: object, similarity: number, corrected: boolean } or null
 */
export function findLocationMatch(input, locations, threshold = 0.6) {
  if (!input || !locations || locations.length === 0) return null;

  const inputLower = input.toLowerCase().trim();
  
  // Check for exact match first
  const exactMatch = locations.find(loc => loc.name.toLowerCase() === inputLower);
  if (exactMatch) {
    return { location: exactMatch, similarity: 1.0, corrected: false };
  }

  // Find best fuzzy match
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const location of locations) {
    const similarity = similarityRatio(inputLower, location.name.toLowerCase());
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = location;
    }
  }

  if (bestMatch) {
    return { location: bestMatch, similarity: bestSimilarity, corrected: true };
  }

  return null;
}

/**
 * Find best match for item names
 * @param {string} input - User input item name
 * @param {object} items - Items object with item IDs as keys
 * @param {number} threshold - Minimum similarity threshold
 * @returns {object|null} - { item: object, similarity: number, corrected: boolean } or null
 */
export function findItemMatch(input, items, threshold = 0.6) {
  if (!input || !items) return null;

  const inputLower = input.toLowerCase().trim().replace(/\s+/g, '_');
  
  // Check for exact match first (by ID)
  if (items[inputLower]) {
    return { item: items[inputLower], similarity: 1.0, corrected: false };
  }

  // Check for exact match by name
  const exactNameMatch = Object.values(items).find(
    item => item.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_') === inputLower
  );
  if (exactNameMatch) {
    return { item: exactNameMatch, similarity: 1.0, corrected: false };
  }

  // Find best fuzzy match
  let bestMatch = null;
  let bestSimilarity = 0;

  for (const item of Object.values(items)) {
    // Try matching against ID
    const idSimilarity = similarityRatio(inputLower, item.id.toLowerCase());
    
    // Try matching against name (cleaned)
    const cleanName = item.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
    const nameSimilarity = similarityRatio(inputLower, cleanName);
    
    const similarity = Math.max(idSimilarity, nameSimilarity);
    
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = item;
    }
  }

  if (bestMatch) {
    return { item: bestMatch, similarity: bestSimilarity, corrected: true };
  }

  return null;
}

/**
 * Find best match for player names
 * @param {string} input - User input player name
 * @param {object} players - Players object with JIDs as keys
 * @param {number} threshold - Minimum similarity threshold
 * @returns {object|null} - { jid: string, player: object, similarity: number, corrected: boolean } or null
 */
export function findPlayerMatch(input, players, threshold = 0.6) {
  if (!input || !players) return null;

  const inputLower = input.toLowerCase().trim();
  
  // Check for exact match first
  const exactMatch = Object.entries(players).find(
    ([jid, player]) => player.name.toLowerCase() === inputLower
  );
  if (exactMatch) {
    return { jid: exactMatch[0], player: exactMatch[1], similarity: 1.0, corrected: false };
  }

  // Find best fuzzy match
  let bestMatch = null;
  let bestJid = null;
  let bestSimilarity = 0;

  for (const [jid, player] of Object.entries(players)) {
    const similarity = similarityRatio(inputLower, player.name.toLowerCase());
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = player;
      bestJid = jid;
    }
  }

  if (bestMatch) {
    return { jid: bestJid, player: bestMatch, similarity: bestSimilarity, corrected: true };
  }

  return null;
}

/**
 * Generate auto-correct message
 * @param {string} input - Original user input
 * @param {string} corrected - Corrected value
 * @param {string} lang - Language code ('en' or 'id')
 * @returns {string} - Auto-correct message
 */
export function getAutoCorrectMessage(input, corrected, lang = 'en') {
  if (lang === 'id') {
    return `🔍 *Auto-correct:* "${input}" → "${corrected}"\n\n`;
  }
  return `🔍 *Auto-correct:* "${input}" → "${corrected}"\n\n`;
}

export default {
  levenshteinDistance,
  similarityRatio,
  findBestMatch,
  findLocationMatch,
  findItemMatch,
  findPlayerMatch,
  getAutoCorrectMessage,
};
