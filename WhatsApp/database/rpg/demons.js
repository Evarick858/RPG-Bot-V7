// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Demon System
  Base : Lenwy SCM — RPG Extension

  Demons are special encounters during hunt:
  - 10% chance to appear instead of a normal enemy when starting hunt
  - 10% chance to ambush after winning a hunt

  Demon stats = 2x the player's current stats (calculated at spawn)
  Demons have 3 skills + 3 passives each
  When demon HP hits 0 → it flees (not killed) with a flee quote
  When player loses → demon says a defeat quote
  20% chance to drop 1 demon material on flee

  Demon drops:
  - demon_bone, demon_claw, demon_heart, demon_eye, demon_tooth
*/

// ── Demon drop pool ───────────────────────────────────────

export const demonDropPool = [
  { id: "demon_bone",  chance: 20 },
  { id: "demon_claw",  chance: 20 },
  { id: "demon_heart", chance: 20 },
  { id: "demon_eye",   chance: 20 },
  { id: "demon_tooth", chance: 20 },
];

/**
 * Roll for a demon drop (20% total chance, 1 item)
 * @returns {string|null} item id or null
 */
export function rollDemonDrop() {
  if (Math.random() * 100 >= 20) return null; // 80% no drop
  const pick = demonDropPool[Math.floor(Math.random() * demonDropPool.length)];
  return pick.id;
}

// ── Demon registry ────────────────────────────────────────

export const demons = {

  // ════════════════════════════════════════
  // BAAL — Lord of War
  // ════════════════════════════════════════
  baal: {
    id: "baal",
    name: "Baal",
    title: "Lord of War",
    emoji: "👹",
    description: "The ancient lord of war. His presence alone breaks the will of warriors.",

    skills: [
      {
        id: "war_cry",
        name: "War Cry",
        damageType: "physical",
        effect: "debuff_def",
        value: 20,
        duration: 4,
        damage: 0,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A terrifying war cry that shatters the enemy's defense.",
      },
      {
        id: "crushing_blow",
        name: "Crushing Blow",
        damageType: "physical",
        effect: "damage",
        value: 40,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A devastating physical strike.",
      },
      {
        id: "blood_frenzy",
        name: "Blood Frenzy",
        damageType: "physical",
        effect: "bleed",
        value: 15,
        duration: 5,
        damage: 20,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Sends the enemy into a bleeding frenzy.",
      },
    ],

    passives: [
      { id: "warlord_aura", name: "Warlord Aura", emoji: "⚔️", effect: "attack_boost", value: 15 },
      { id: "iron_skin", name: "Iron Skin", emoji: "🛡️", effect: "defense_boost", value: 10 },
      { id: "berserker", name: "Berserker", emoji: "💢", effect: "berserker_rage", value: 20, threshold: 30, defensePenalty: 5 },
    ],

    fleeQuote: "\"This is not over, mortal. I will return when you least expect it.\"",
    defeatQuote: "\"You dare strike me? I am WAR ITSELF. You will regret this.\"",
  },

  // ════════════════════════════════════════
  // LILITH — Queen of Shadows
  // ════════════════════════════════════════
  lilith: {
    id: "lilith",
    name: "Lilith",
    title: "Queen of Shadows",
    emoji: "🌑",
    description: "The queen of shadows. She moves unseen and strikes where it hurts most.",

    skills: [
      {
        id: "shadow_strike",
        name: "Shadow Strike",
        damageType: "hybrid",
        effect: "blind",
        value: 50,
        duration: 4,
        damage: 25,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Strikes from the shadows, blinding the target.",
      },
      {
        id: "soul_drain",
        name: "Soul Drain",
        damageType: "magical",
        effect: "drain",
        value: 30,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Drains the soul, stealing HP from the enemy.",
      },
      {
        id: "dark_curse",
        name: "Dark Curse",
        damageType: "magical",
        effect: "curse",
        value: 50,
        duration: 5,
        damage: 0,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Curses the enemy, halving all healing they receive.",
      },
    ],

    passives: [
      { id: "shadow_veil", name: "Shadow Veil", emoji: "🌑", effect: "dodge_boost", value: 25 },
      { id: "lifedrain_aura", name: "Lifedrain Aura", emoji: "🧛", effect: "lifesteal", value: 15 },
      { id: "dark_regen", name: "Dark Regen", emoji: "💜", effect: "regen", value: 12 },
    ],

    fleeQuote: "\"Enjoy your victory, little one. The shadows remember everything.\"",
    defeatQuote: "\"You think you can hurt me? I am the darkness between your heartbeats.\"",
  },

  // ════════════════════════════════════════
  // MALPHAS — Prince of Plague
  // ════════════════════════════════════════
  malphas: {
    id: "malphas",
    name: "Malphas",
    title: "Prince of Plague",
    emoji: "🦅",
    description: "A demon of plague and corruption. His touch rots everything it touches.",

    skills: [
      {
        id: "plague_breath",
        name: "Plague Breath",
        damageType: "magical",
        effect: "poison",
        value: 20,
        duration: 6,
        damage: 15,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Breathes a cloud of plague, poisoning the enemy.",
      },
      {
        id: "rot_strike",
        name: "Rot Strike",
        damageType: "hybrid",
        effect: "debuff_atk",
        value: 15,
        duration: 4,
        damage: 20,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A rotting strike that weakens the enemy's attack.",
      },
      {
        id: "corruption",
        name: "Corruption",
        damageType: "magical",
        effect: "manaburn",
        value: 50,
        damage: 10,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Corrupts the enemy's mana, burning it away.",
      },
    ],

    passives: [
      { id: "plague_aura", name: "Plague Aura", emoji: "☠️", effect: "poison_on_hit", value: 8, chance: 30, duration: 4 },
      { id: "decay", name: "Decay", emoji: "🦅", effect: "defense_boost", value: 8 },
      { id: "undying", name: "Undying", emoji: "💀", effect: "defense_boost_low_hp", value: 15, threshold: 25 },
    ],

    fleeQuote: "\"The plague I leave behind will finish what I started.\"",
    defeatQuote: "\"You cannot kill what is already dead. I am the rot in your bones.\"",
  },

  // ════════════════════════════════════════
  // ASMODEUS — Demon of Wrath
  // ════════════════════════════════════════
  asmodeus: {
    id: "asmodeus",
    name: "Asmodeus",
    title: "Demon of Wrath",
    emoji: "🔥",
    description: "Pure wrath given form. The angrier he gets, the more dangerous he becomes.",

    skills: [
      {
        id: "hellfire",
        name: "Hellfire",
        damageType: "magical",
        effect: "burn",
        value: 18,
        duration: 5,
        damage: 35,
        manaCost: 45,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Unleashes hellfire that burns the enemy for multiple turns.",
      },
      {
        id: "wrath_strike",
        name: "Wrath Strike",
        damageType: "hybrid",
        effect: "damage",
        value: 50,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A strike fueled by pure wrath.",
      },
      {
        id: "inferno",
        name: "Inferno",
        damageType: "magical",
        effect: "mark",
        value: 25,
        duration: 4,
        damage: 20,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Marks the enemy with hellfire, increasing all damage they take.",
      },
    ],

    passives: [
      { id: "wrath_aura", name: "Wrath Aura", emoji: "🔥", effect: "burn_on_hit", value: 10, chance: 35, duration: 4 },
      { id: "enrage", name: "Enrage", emoji: "😡", effect: "enrage", value: 25, threshold: 30 },
      { id: "fire_body", name: "Fire Body", emoji: "🔥", effect: "thorns", value: 10 },
    ],

    fleeQuote: "\"My wrath is eternal. You have only delayed the inevitable.\"",
    defeatQuote: "\"IMPOSSIBLE! I am WRATH! I cannot be stopped by a mere mortal!\"",
  },

  // ════════════════════════════════════════
  // BELIAL — Master of Illusions
  // ════════════════════════════════════════
  belial: {
    id: "belial",
    name: "Belial",
    title: "Master of Illusions",
    emoji: "👁️",
    description: "Nothing about Belial is real. He fights with lies and illusions.",

    skills: [
      {
        id: "mind_shatter",
        name: "Mind Shatter",
        damageType: "magical",
        effect: "silence",
        value: 1,
        duration: 4,
        damage: 20,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Shatters the enemy's mind, silencing their skills.",
      },
      {
        id: "illusion_strike",
        name: "Illusion Strike",
        damageType: "hybrid",
        effect: "blind",
        value: 50,
        duration: 4,
        damage: 30,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Strikes through illusions, blinding the enemy.",
      },
      {
        id: "false_reality",
        name: "False Reality",
        damageType: "none",
        effect: "evasion_buff",
        value: 40,
        duration: 4,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Creates illusions that make Belial nearly impossible to hit.",
      },
    ],

    passives: [
      { id: "mirage", name: "Mirage", emoji: "👁️", effect: "dodge_boost", value: 30 },
      { id: "mind_fog", name: "Mind Fog", emoji: "🌫️", effect: "slow_on_hit", value: 10, chance: 30, duration: 4 },
      { id: "illusion_armor", name: "Illusion Armor", emoji: "✨", effect: "damage_reduction", value: 10 },
    ],

    fleeQuote: "\"Was any of this real? Were YOU real? I wonder...\"",
    defeatQuote: "\"You hit an illusion. The real me was never here.\"",
  },

  // ════════════════════════════════════════
  // AZAZEL — Lord of Chaos
  // ════════════════════════════════════════
  azazel: {
    id: "azazel",
    name: "Azazel",
    title: "Lord of Chaos",
    emoji: "⚡",
    description: "Chaos incarnate. His attacks are unpredictable and devastating.",

    skills: [
      {
        id: "chaos_bolt",
        name: "Chaos Bolt",
        damageType: "hybrid",
        effect: "stun",
        value: 1,
        duration: 2,
        damage: 35,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A bolt of pure chaos that stuns the enemy.",
      },
      {
        id: "storm_surge",
        name: "Storm Surge",
        damageType: "magical",
        effect: "debuff_def",
        value: 18,
        duration: 4,
        damage: 25,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A surge of storm energy that weakens defenses.",
      },
      {
        id: "chaos_nova",
        name: "Chaos Nova",
        damageType: "hybrid",
        effect: "damage",
        value: 55,
        manaCost: 50,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "An explosion of chaotic energy.",
      },
    ],

    passives: [
      { id: "chaos_aura", name: "Chaos Aura", emoji: "⚡", effect: "crit_boost", value: 20 },
      { id: "storm_body", name: "Storm Body", emoji: "🌪️", effect: "agility_to_dodge", value: 1 },
      { id: "last_stand", name: "Last Stand", emoji: "💥", effect: "last_stand", value: 20, threshold: 15 },
    ],

    fleeQuote: "\"Chaos cannot be contained. I'll be back — everywhere at once.\"",
    defeatQuote: "\"You think order can defeat chaos? You're just delaying entropy.\"",
  },

  // ════════════════════════════════════════
  // MAMMON — Lord of Greed
  // ════════════════════════════════════════
  mammon: {
    id: "mammon",
    name: "Mammon",
    title: "Lord of Greed",
    emoji: "💰",
    description: "Greed given flesh. He steals everything — gold, health, even luck.",

    skills: [
      {
        id: "gold_drain",
        name: "Gold Drain",
        damageType: "magical",
        effect: "manaburn",
        value: 60,
        damage: 15,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Drains the enemy's resources, burning their mana.",
      },
      {
        id: "greed_strike",
        name: "Greed Strike",
        damageType: "hybrid",
        effect: "lifesteal",
        value: 40,
        damage: 30,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A strike that steals life from the enemy.",
      },
      {
        id: "cursed_wealth",
        name: "Cursed Wealth",
        damageType: "magical",
        effect: "curse",
        value: 50,
        duration: 5,
        damage: 10,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Curses the enemy with greed, halving their healing.",
      },
    ],

    passives: [
      { id: "greed_aura", name: "Greed Aura", emoji: "💰", effect: "lifesteal", value: 20 },
      { id: "miser_shield", name: "Miser Shield", emoji: "🛡️", effect: "defense_boost", value: 12 },
      { id: "lucky_coin", name: "Lucky Coin", emoji: "🍀", effect: "luck_boost", value: 15 },
    ],

    fleeQuote: "\"I've taken enough from you today. Consider it... a down payment.\"",
    defeatQuote: "\"You dare take from ME? Everything in this world belongs to Mammon!\"",
  },

  // ════════════════════════════════════════
  // LEVIATHAN — Demon of the Abyss
  // ════════════════════════════════════════
  leviathan: {
    id: "leviathan",
    name: "Leviathan",
    title: "Demon of the Abyss",
    emoji: "🌊",
    description: "The great serpent of the deep. Patient, ancient, and utterly merciless.",

    skills: [
      {
        id: "tidal_wave",
        name: "Tidal Wave",
        damageType: "magical",
        effect: "slow",
        value: 20,
        duration: 5,
        damage: 30,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A crushing wave that slows the enemy significantly.",
      },
      {
        id: "abyss_pull",
        name: "Abyss Pull",
        damageType: "magical",
        effect: "drain",
        value: 35,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Pulls the enemy into the abyss, draining their HP.",
      },
      {
        id: "deep_freeze",
        name: "Deep Freeze",
        damageType: "magical",
        effect: "freeze",
        value: 1,
        duration: 4,
        damage: 25,
        manaCost: 45,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Freezes the enemy solid, halving their defense.",
      },
    ],

    passives: [
      { id: "abyssal_regen", name: "Abyssal Regen", emoji: "🌊", effect: "regen", value: 15 },
      { id: "deep_armor", name: "Deep Armor", emoji: "🐚", effect: "damage_reduction", value: 12 },
      { id: "crushing_depth", name: "Crushing Depth", emoji: "⬇️", effect: "defense_boost", value: 10 },
    ],

    fleeQuote: "\"The abyss is patient. It has waited eons. It can wait a little longer.\"",
    defeatQuote: "\"You cannot drown the ocean, mortal. I am endless.\"",
  },

  // ════════════════════════════════════════
  // BEELZEBUB — Lord of Decay
  // ════════════════════════════════════════
  beelzebub: {
    id: "beelzebub",
    name: "Beelzebub",
    title: "Lord of Decay",
    emoji: "🪰",
    description: "The lord of flies and decay. Everything he touches rots from within.",

    skills: [
      {
        id: "swarm",
        name: "Swarm",
        damageType: "physical",
        effect: "bleed",
        value: 12,
        duration: 6,
        damage: 20,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Unleashes a swarm of flies that cause bleeding.",
      },
      {
        id: "decay_touch",
        name: "Decay Touch",
        damageType: "hybrid",
        effect: "debuff_atk",
        value: 20,
        duration: 5,
        damage: 15,
        manaCost: 30,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "A touch of decay that weakens the enemy's attack.",
      },
      {
        id: "pestilence",
        name: "Pestilence",
        damageType: "magical",
        effect: "poison",
        value: 25,
        duration: 6,
        damage: 10,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Spreads pestilence that poisons the enemy heavily.",
      },
    ],

    passives: [
      { id: "rot_aura", name: "Rot Aura", emoji: "🪰", effect: "poison_on_hit", value: 10, chance: 35, duration: 5 },
      { id: "decay_armor", name: "Decay Armor", emoji: "🦴", effect: "defense_boost", value: 8 },
      { id: "undying_swarm", name: "Undying Swarm", emoji: "🐝", effect: "defense_boost_low_hp", value: 18, threshold: 30 },
    ],

    fleeQuote: "\"I leave my children behind. They will finish the job.\"",
    defeatQuote: "\"You cannot kill decay. I am in the air you breathe.\"",
  },

  // ════════════════════════════════════════
  // SAMAEL — Angel of Death
  // ════════════════════════════════════════
  samael: {
    id: "samael",
    name: "Samael",
    title: "Angel of Death",
    emoji: "☠️",
    description: "The angel of death. Cold, precise, and inevitable.",

    skills: [
      {
        id: "death_mark",
        name: "Death Mark",
        damageType: "hybrid",
        effect: "execute",
        value: 30,
        manaCost: 50,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Marks the enemy for death. Instantly kills if below 30% HP.",
      },
      {
        id: "soul_rend",
        name: "Soul Rend",
        damageType: "magical",
        effect: "manaburn",
        value: 70,
        damage: 25,
        manaCost: 40,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Tears the soul, burning massive amounts of mana.",
      },
      {
        id: "death_coil",
        name: "Death Coil",
        damageType: "magical",
        effect: "curse",
        value: 50,
        duration: 6,
        damage: 20,
        manaCost: 35,
        cooldown: 7,
        cooldownRemaining: 0,
        description: "Coils death around the enemy, cursing and damaging them.",
      },
    ],

    passives: [
      { id: "death_aura", name: "Death Aura", emoji: "☠️", effect: "crit_boost", value: 25 },
      { id: "reaper_step", name: "Reaper Step", emoji: "👣", effect: "agility_to_dodge", value: 1 },
      { id: "inevitable", name: "Inevitable", emoji: "⏳", effect: "enrage", value: 30, threshold: 40 },
    ],

    fleeQuote: "\"Death is not defeated. Death merely... waits.\"",
    defeatQuote: "\"You cannot kill Death itself. I will be there at your last breath.\"",
  },

};

// ── Helpers ───────────────────────────────────────────────

/**
 * Get a random demon
 */
export function getRandomDemon() {
  const keys = Object.keys(demons);
  return demons[keys[Math.floor(Math.random() * keys.length)]];
}

/**
 * Get demon by ID
 */
export function getDemonById(id) {
  return demons[id] || null;
}

/**
 * Build demon combat stats from player's TOTAL stats including equipment (2x)
 */
export function buildDemonStats(playerData) {
  const ps = playerData.stats;

  // Calculate equipment bonuses
  let equipHp = 0, equipMana = 0, equipAtk = 0, equipDef = 0;
  let equipAgi = 0, equipLuck = 0;
  let equipPhysAtk = 0, equipMagAtk = 0, equipHybAtk = 0;
  let equipPhysDef = 0, equipMagDef = 0, equipHybDef = 0;

  if (playerData.equipment) {
    const eq = playerData.equipment;
    const pieces = [
      eq.weapon,
      eq.offhand,
      eq.armor?.head,
      eq.armor?.chest,
      eq.armor?.legs,
      eq.armor?.boots,
      eq.accessory,
    ];
    for (const piece of pieces) {
      if (!piece?.id || !piece.stats) continue;
      const s = piece.stats;
      equipHp      += s.hp          || 0;
      equipMana    += s.mana        || 0;
      equipAtk     += s.attack      || 0;
      equipDef     += s.defense     || 0;
      equipAgi     += s.agility     || 0;
      equipLuck    += s.luck        || 0;
      equipPhysAtk += s.physicalAtk || 0;
      equipMagAtk  += s.magicalAtk  || 0;
      equipHybAtk  += s.hybridAtk   || 0;
      equipPhysDef += s.physicalDef || 0;
      equipMagDef  += s.magicalDef  || 0;
      equipHybDef  += s.hybridDef   || 0;
    }
  }

  // Total = base + equipment, then × 2
  const totalMaxHp   = (ps.maxHp   || ps.hp   || 100) + equipHp;
  const totalMaxMana = (ps.maxMana || ps.mana  || 50)  + equipMana;

  return {
    hp:          totalMaxHp   * 2,
    maxHp:       totalMaxHp   * 2,
    mana:        totalMaxMana * 2,
    maxMana:     totalMaxMana * 2,
    attack:      ((ps.attack      || 10) + equipAtk)     * 2,
    defense:     ((ps.defense     || 5)  + equipDef)     * 2,
    agility:     ((ps.agility     || 5)  + equipAgi)     * 2,
    luck:        ((ps.luck        || 5)  + equipLuck)    * 2,
    physicalAtk: ((ps.physicalAtk || 0)  + equipPhysAtk) * 2,
    magicalAtk:  ((ps.magicalAtk  || 0)  + equipMagAtk)  * 2,
    hybridAtk:   ((ps.hybridAtk   || 0)  + equipHybAtk)  * 2,
    physicalDef: ((ps.physicalDef || 0)  + equipPhysDef) * 2,
    magicalDef:  ((ps.magicalDef  || 0)  + equipMagDef)  * 2,
    hybridDef:   ((ps.hybridDef   || 0)  + equipHybDef)  * 2,
  };
}

export default demons;
