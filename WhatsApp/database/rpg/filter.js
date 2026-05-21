// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  Name Filter System
  Validates player names for registration
  - Blocks profanity and inappropriate words
  - Enforces character restrictions (no spaces, underscores, hyphens)
  - Checks for leetspeak variations
*/

// ══════════════════════════════════════════════════════════
// BAD WORDS LIST
// ══════════════════════════════════════════════════════════
const badWords = [
  // English profanity
  "fuck", "shit", "bitch", "ass", "damn", "hell", "crap", "piss",
  "dick", "cock", "pussy", "cunt", "whore", "slut", "bastard",
  "nigga", "nigger", "fag", "faggot", "retard", "rape", "sex",
  "porn", "xxx", "anal", "penis", "vagina", "boob", "tit",
  "nazi", "hitler", "kill", "die", "death", "murder", "suicide",
  
  // Indonesian profanity (comprehensive list)
  "anjing", "babi", "kontol", "memek", "ngentot", "jancok", "bangsat",
  "tolol", "goblok", "bodoh", "tai", "puki", "kimak", "asu",
  "bajingan", "kampret", "monyet", "setan", "iblis", "pepek",
  "colmek", "coli", "bokep", "jembut", "perek", "lonte",
  
  // More Indonesian slang and profanity
  "anjir", "anjrit", "anjay", "anjg", "njing", "njir",
  "bego", "begoamat", "geblek", "gblk", "gblok",
  "eek", "ee", "taik", "tae", "taek", "tahi",
  "kentut", "entut", "kentot", "kntl", "ktl", "kontl",
  "mmk", "meki", "memex", "meme", "mimik",
  "ngtot", "ngntot", "entot", "ngewe", "ewe",
  "jnck", "jancuk", "cok", "coeg", "coegg",
  "bgst", "bngst", "bngsat", "bangke", "bngke",
  "tlol", "tll", "tolo", "tolol",
  "goblog", "gblg", "gblok", "goblo",
  "pantek", "pntek", "panteg", "panteq",
  "peler", "plr", "pelir", "pler",
  "itil", "itl", "kelentit", "klentit",
  "toket", "toked", "toket", "tete", "susu",
  "colok", "clok", "colay", "colmek", "clmk",
  "onani", "onani", "crot", "crot", "crotz",
  "desah", "desah", "stw", "abg", "jablay",
  "jablay", "jamet", "alay", "perek", "prk",
  "pelacur", "lacur", "sundal", "sndl",
  "bencong", "banci", "bnci", "bencong",
  "homo", "lesbi", "lesbian", "gay",
  "kampang", "kmpng", "kmpret", "kmpretz",
  "sialan", "sial", "sialn", "sial",
  "kunyuk", "knyuk", "knyok", "kunyok",
  "brengsek", "brgsek", "brengsek", "brngsk",
  "keparat", "kprt", "kparat", "kepret",
  "bedebah", "bdebah", "bedhebah",
  "sinting", "gila", "edan", "edyan",
  "ndasmu", "silit", "jubur", "juburmu",
  "peju", "pejuh", "sperma", "sperm",
  "ngaceng", "aceng", "tegang", "tegak",
  "horny", "birahi", "nafsu", "nafsuan",
  "remes", "pegang", "colok", "masukin",
  "jilat", "jilmek", "emut", "hisap",
  "doggy", "doggystyle", "missionary",
  "blowjob", "handjob", "footjob",
  "orgasme", "klimaks", "cumshot",
  "threesome", "foursome", "gangbang",
  "incest", "inces", "sedarah",
  "pedo", "pedofil", "pedophile",
  "zoofil", "zoophile", "beastiality",
  
  // Common inappropriate combinations (keep specific bad combos only)
  "pussydestroyer", "asslicker", "dickhead", "shithead",
  "fuckboy", "fuckgirl", "sexgod", "sexgoddess",
  
  // Leetspeak common patterns (will be checked after conversion)
  "fuk", "sht", "btch", "dck", "psy", "cnt", "whr", "slt",
  "ngg", "fgt", "kll", "dth", "mrdr", "scd",
];

// ══════════════════════════════════════════════════════════
// LEETSPEAK CONVERSION MAP
// ══════════════════════════════════════════════════════════
const leetMap = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "!": "i",
  "|": "i",
  "()": "o",
  "[]": "o",
  "{}": "o",
};

// ══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════

/**
 * Convert leetspeak to normal text
 * Example: "p4ssw0rd" -> "password"
 */
function convertLeetspeak(text) {
  let converted = text.toLowerCase();
  
  // Replace multi-character patterns first
  converted = converted.replace(/\(\)/g, "o");
  converted = converted.replace(/\[\]/g, "o");
  converted = converted.replace(/\{\}/g, "o");
  
  // Replace single characters
  for (const [leet, normal] of Object.entries(leetMap)) {
    if (leet.length === 1) {
      converted = converted.split(leet).join(normal);
    }
  }
  
  return converted;
}

/**
 * Check if text contains repeated characters (e.g., "aaaa", "xxxx")
 * Used to detect obfuscation attempts
 */
function hasExcessiveRepeats(text) {
  const pattern = /(.)\1{3,}/; // 4 or more repeated characters
  return pattern.test(text);
}

/**
 * Remove common obfuscation characters
 * Example: "p.u.s.s.y" -> "pussy"
 */
function removeObfuscation(text) {
  return text
    .toLowerCase()
    .replace(/[._\-\s]/g, "") // Remove dots, underscores, hyphens, spaces
    .replace(/[^a-z0-9]/g, ""); // Remove any other special chars
}

/**
 * Check if name contains bad words (with various checks)
 */
function containsBadWord(name) {
  const cleaned = removeObfuscation(name);
  const converted = convertLeetspeak(cleaned);
  
  // Check against bad words list
  for (const badWord of badWords) {
    // Direct match
    if (cleaned.includes(badWord)) {
      return { found: true, word: badWord, type: "direct" };
    }
    
    // Leetspeak match
    if (converted.includes(badWord)) {
      return { found: true, word: badWord, type: "leetspeak" };
    }
    
    // Check if bad word is at start or end
    if (cleaned.startsWith(badWord) || cleaned.endsWith(badWord)) {
      return { found: true, word: badWord, type: "boundary" };
    }
  }
  
  return { found: false };
}

// ══════════════════════════════════════════════════════════
// MAIN VALIDATION FUNCTION
// ══════════════════════════════════════════════════════════

/**
 * Validate player name for registration
 * @param {string} name - The name to validate
 * @returns {object} - { valid: boolean, error: string }
 */
export function validateName(name) {
  // Check length
  if (name.length < 3) {
    return {
      valid: false,
      error: "Name must be at least 3 characters long.",
    };
  }
  
  if (name.length > 16) {
    return {
      valid: false,
      error: "Name must be 16 characters or less.",
    };
  }
  
  // Check for spaces
  if (name.includes(" ")) {
    return {
      valid: false,
      error: "Name cannot contain spaces.",
    };
  }
  
  // Check for underscores
  if (name.includes("_")) {
    return {
      valid: false,
      error: "Name cannot contain underscores (_).",
    };
  }
  
  // Check for hyphens
  if (name.includes("-")) {
    return {
      valid: false,
      error: "Name cannot contain hyphens (-).",
    };
  }
  
  // Check for special characters (only alphanumeric allowed)
  if (!/^[a-zA-Z0-9]+$/.test(name)) {
    return {
      valid: false,
      error: "Name can only contain letters (A-Z) and numbers (0-9).",
    };
  }
  
  // Check for excessive repeated characters
  if (hasExcessiveRepeats(name)) {
    return {
      valid: false,
      error: "Name cannot have too many repeated characters.",
    };
  }
  
  // Check for bad words
  const badWordCheck = containsBadWord(name);
  if (badWordCheck.found) {
    return {
      valid: false,
      error: "Name contains inappropriate language. Please choose a different name.",
      details: badWordCheck, // For logging/debugging (don't show to user)
    };
  }
  
  // All checks passed
  return {
    valid: true,
    error: null,
  };
}

/**
 * Get a friendly error message for the user
 * @param {object} validation - Result from validateName()
 * @param {string} lang - Language code ("id" or "en")
 * @returns {string} - Formatted error message
 */
export function getValidationError(validation, lang = "en") {
  if (validation.valid) return null;
  
  const messages = {
    en: {
      title: "⚠️ *Invalid Name*\n\n",
      rules: "\n\n📋 *Name Rules:*\n" +
             "• 3-16 characters\n" +
             "• Letters and numbers only\n" +
             "• No spaces, underscores, or hyphens\n" +
             "• No inappropriate language\n\n" +
             "Example: *JohnDoe123* ✅",
    },
    id: {
      title: "⚠️ *Nama Tidak Valid*\n\n",
      rules: "\n\n📋 *Aturan Nama:*\n" +
             "• 3-16 karakter\n" +
             "• Hanya huruf dan angka\n" +
             "• Tanpa spasi, underscore, atau tanda hubung\n" +
             "• Tanpa kata-kata tidak pantas\n\n" +
             "Contoh: *JohnDoe123* ✅",
    },
  };
  
  const msg = messages[lang] || messages.en;
  return msg.title + validation.error + msg.rules;
}

// ══════════════════════════════════════════════════════════
// EXPORT FOR TESTING
// ══════════════════════════════════════════════════════════

export const _internal = {
  convertLeetspeak,
  removeObfuscation,
  containsBadWord,
  hasExcessiveRepeats,
};
