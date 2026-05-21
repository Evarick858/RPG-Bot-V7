# ⚔️ Complete Enemy System Guide

**Tutorial lengkap untuk menambahkan enemies/monsters di RPG Bot**

---

## 📚 Table of Contents

1. [Apa itu Enemy System?](#apa-itu-enemy-system)
2. [Enemy Structure](#enemy-structure)
3. [Stats & Balance](#stats--balance)
4. [Skills & Passives](#skills--passives)
5. [Drops & Rewards](#drops--rewards)
6. [Using .addenemy Command](#using-addenemy-command)
7. [Complete Examples](#complete-examples)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Apa itu Enemy System?

Enemy System adalah database untuk **semua enemies** yang bisa di-hunt player:
- Wild animals (wolves, bears, deer)
- Monsters (goblins, orcs, demons)
- Magical creatures (dragons, phoenixes)
- Undead (zombies, skeletons, ghosts)
- Bosses (dungeon bosses, world bosses)

### **Fitur:**
- ✅ 10 tier levels (1-10)
- ✅ Custom stats (HP, Mana, ATK, DEF, AGI)
- ✅ Skills & abilities
- ✅ Passive abilities
- ✅ Drop tables (items, gold, exp)
- ✅ Location-based spawning

---

## 🏗️ Enemy Structure

### **Required Fields:**

```javascript
"enemy_id": {
  "id": "enemy_id",                    // Unique ID
  "name": "🐺 Enemy Name",             // Display name with emoji
  "location": ["loc1", "loc2"],        // Where it spawns
  "tier": 3,                           // Difficulty tier (1-10)
  "stats": {                           // Combat stats
    "hp": 150,
    "mana": 50,
    "attack": 30,
    "defense": 20,
    "agility": 25
  },
  "drops": [                           // Item drops
    {
      "item": "wolf_pelt",
      "chance": 70,
      "min": 1,
      "max": 3
    }
  ],
  "xp": 50,                            // EXP reward
  "gold": {                            // Gold reward
    "min": 20,
    "max": 40
  },
  "skills": [],                        // Combat skills (optional)
  "passive": null                      // Passive ability (optional)
}
```

### **Field Explanations:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (must match key) |
| `name` | string | Display name with emoji |
| `location` | array | Location IDs where enemy spawns |
| `tier` | number | Difficulty level (1-10) |
| `stats` | object | Combat statistics |
| `drops` | array | Items that can drop |
| `xp` | number | Experience points reward |
| `gold` | object | Gold reward range (min/max) |
| `skills` | array | Active combat skills (optional) |
| `passive` | object | Passive ability (optional) |

---

## 📊 Stats & Balance

### **Stat Types:**

| Stat | Description | Effect |
|------|-------------|--------|
| `hp` | Health Points | How much damage enemy can take |
| `mana` | Mana Points | Used for casting skills |
| `attack` | Attack Power | Physical damage dealt |
| `defense` | Defense Power | Reduces incoming damage |
| `agility` | Agility/Speed | Dodge chance, turn order |

### **Tier-Based Stat Guidelines:**

| Tier | Level | HP | Mana | Attack | Defense | Agility | EXP | Gold |
|------|-------|-----|------|--------|---------|---------|-----|------|
| 1 | 1-5 | 20-50 | 20-40 | 5-15 | 3-10 | 10-20 | 3-10 | 1-5 |
| 2 | 6-10 | 50-100 | 40-60 | 15-25 | 10-20 | 20-30 | 10-25 | 5-15 |
| 3 | 11-15 | 100-200 | 60-100 | 25-40 | 20-35 | 30-40 | 25-50 | 15-30 |
| 4 | 16-20 | 200-350 | 100-150 | 40-60 | 35-50 | 40-50 | 50-100 | 30-60 |
| 5 | 21-25 | 350-500 | 150-200 | 60-80 | 50-70 | 50-60 | 100-200 | 60-120 |
| 6 | 26-30 | 500-700 | 200-300 | 80-110 | 70-90 | 60-70 | 200-350 | 120-200 |
| 7 | 31-35 | 700-1000 | 300-400 | 110-140 | 90-120 | 70-80 | 350-500 | 200-350 |
| 8 | 36-40 | 1000-1500 | 400-500 | 140-180 | 120-150 | 80-90 | 500-750 | 350-500 |
| 9 | 41-45 | 1500-2500 | 500-700 | 180-230 | 150-200 | 90-100 | 750-1200 | 500-800 |
| 10 | 46-50 | 2500-5000 | 700-1000 | 230-300 | 200-250 | 100-120 | 1200-2000 | 800-1500 |

### **Stat Distribution Tips:**

**Tank Enemy (High HP/DEF):**
```javascript
"stats": {
  "hp": 500,      // High
  "mana": 50,     // Low
  "attack": 40,   // Medium
  "defense": 100, // High
  "agility": 20   // Low
}
```

**DPS Enemy (High ATK/AGI):**
```javascript
"stats": {
  "hp": 200,      // Low
  "mana": 100,    // Medium
  "attack": 120,  // High
  "defense": 40,  // Low
  "agility": 80   // High
}
```

**Mage Enemy (High MANA/ATK):**
```javascript
"stats": {
  "hp": 250,      // Low
  "mana": 300,    // High
  "attack": 90,   // High
  "defense": 50,  // Low
  "agility": 60   // Medium
}
```

**Balanced Enemy:**
```javascript
"stats": {
  "hp": 350,      // Medium
  "mana": 150,    // Medium
  "attack": 70,   // Medium
  "defense": 70,  // Medium
  "agility": 60   // Medium
}
```

---

## ⚡ Skills & Passives

### **Skills Structure:**

```javascript
"skills": [
  {
    "id": "skill_id",
    "name": "Skill Name",
    "description": "What the skill does",
    "manaCost": 30,
    "cooldown": 3,
    "damageType": "physical", // or "magical"
    "baseDamage": 50,
    "effects": [
      {
        "type": "burn",
        "value": 10,
        "duration": 3
      }
    ]
  }
]
```

### **Skill Effect Types:**

| Effect Type | Description | Example |
|-------------|-------------|---------|
| `burn` | Damage over time (fire) | 10 damage per turn for 3 turns |
| `poison` | Damage over time (poison) | 15 damage per turn for 4 turns |
| `bleed` | Damage over time (physical) | 8 damage per turn for 5 turns |
| `stun` | Skip turns | Stun for 2 turns |
| `slow` | Reduce agility | -20 agility for 3 turns |
| `weaken` | Reduce attack | -30 attack for 3 turns |
| `defense_break` | Reduce defense | -40 defense for 3 turns |
| `heal` | Restore HP | Heal 100 HP |
| `shield` | Temporary defense | +50 defense for 2 turns |

### **Passive Abilities:**

```javascript
"passive": {
  "id": "passive_id",
  "name": "Passive Name",
  "emoji": "🔥",
  "effect": "effect_type",
  "value": 20
}
```

### **Passive Effect Types:**

| Effect | Description | Example |
|--------|-------------|---------|
| `attack_boost` | Permanent attack increase | +20 attack |
| `defense_boost` | Permanent defense increase | +30 defense |
| `agility_boost` | Permanent agility increase | +15 agility |
| `hp_regen` | HP regeneration per turn | +10 HP per turn |
| `mana_regen` | Mana regeneration per turn | +15 mana per turn |
| `lifesteal` | Heal on attack | 20% of damage dealt |
| `thorns` | Reflect damage | 15% damage reflected |
| `evasion` | Dodge chance | +20% dodge chance |

---

## 💰 Drops & Rewards

### **Drop Structure:**

```javascript
"drops": [
  {
    "item": "item_id",     // Item ID from items.js
    "chance": 70,          // Drop chance (0-100)
    "min": 1,              // Minimum quantity
    "max": 3               // Maximum quantity
  },
  {
    "item": "rare_item",
    "chance": 10,          // Rare drop
    "min": 1,
    "max": 1
  }
]
```

### **Drop Chance Guidelines:**

| Rarity | Chance | Example |
|--------|--------|---------|
| Common | 70-100% | Basic materials (fur, feathers) |
| Uncommon | 40-70% | Better materials (scales, fangs) |
| Rare | 10-40% | Rare materials (essence, crystals) |
| Epic | 3-10% | Epic materials (legendary scales) |
| Legendary | 0.5-3% | Legendary items (artifacts) |

### **Gold Rewards:**

```javascript
"gold": {
  "min": 50,   // Minimum gold
  "max": 100   // Maximum gold
}
```

**Gold Guidelines by Tier:**
- Tier 1: 1-5 gold
- Tier 2: 5-15 gold
- Tier 3: 15-30 gold
- Tier 4: 30-60 gold
- Tier 5: 60-120 gold
- Tier 6: 120-200 gold
- Tier 7: 200-350 gold
- Tier 8: 350-500 gold
- Tier 9: 500-800 gold
- Tier 10: 800-1500 gold

---

## 💻 Using .addenemy Command

### **Command Format:**

```
.addenemy "enemy_id": {
  "id": "enemy_id",
  "name": "🐉 Enemy Name",
  "location": ["location1"],
  "tier": 5,
  "stats": {
    "hp": 500,
    "mana": 200,
    "attack": 80,
    "defense": 60,
    "agility": 40
  },
  "drops": [
    {
      "item": "dragon_scale",
      "chance": 50,
      "min": 1,
      "max": 3
    }
  ],
  "xp": 500,
  "gold": {
    "min": 100,
    "max": 200
  },
  "skills": [],
  "passive": null
},
```

### **Step-by-Step:**

1. **Copy your enemy code** (with proper format)
2. **In WhatsApp, type:** `.addenemy` followed by the code
3. **Bot will validate:**
   - ✅ Basic structure
   - ✅ Required fields
   - ✅ ID matching
   - ✅ No duplicates
   - ✅ JavaScript syntax
4. **If valid:** Enemy added to database!
5. **If invalid:** Error message with details

### **Example Usage:**

```
.addenemy "fire_dragon": {
  "id": "fire_dragon",
  "name": "🐉 Fire Dragon",
  "location": ["dragon_peak", "volcanic_ridge"],
  "tier": 8,
  "stats": {
    "hp": 1200,
    "mana": 400,
    "attack": 150,
    "defense": 120,
    "agility": 70
  },
  "drops": [
    {
      "item": "dragon_scale",
      "chance": 80,
      "min": 2,
      "max": 5
    },
    {
      "item": "dragon_heart",
      "chance": 20,
      "min": 1,
      "max": 1
    }
  ],
  "xp": 600,
  "gold": {
    "min": 400,
    "max": 600
  },
  "skills": [],
  "passive": null
},
```

**Success Response:**
```
✅ ENEMY ADDED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━

Enemy ID: fire_dragon
File: enemies.js

✓ All validations passed
✓ Syntax is correct
✓ No duplicate ID

The enemy has been added to the database!
```

---

## 📝 Complete Examples

### **Example 1: Basic Tier 1 Enemy**

```javascript
"forest_rabbit": {
  "id": "forest_rabbit",
  "name": "🐰 Forest Rabbit",
  "location": ["peaceful_forest", "green_meadow"],
  "tier": 1,
  "stats": {
    "hp": 25,
    "mana": 20,
    "attack": 8,
    "defense": 5,
    "agility": 30
  },
  "drops": [
    {
      "item": "rabbit_hide",
      "chance": 80,
      "min": 1,
      "max": 2
    }
  ],
  "xp": 5,
  "gold": {
    "min": 2,
    "max": 5
  },
  "skills": [],
  "passive": {
    "id": "quick_escape",
    "name": "Quick Escape",
    "emoji": "💨",
    "effect": "agility_boost",
    "value": 10
  }
}
```

---

### **Example 2: Mid-Tier Enemy with Skills**

```javascript
"shadow_assassin": {
  "id": "shadow_assassin",
  "name": "🗡️ Shadow Assassin",
  "location": ["shadow_valley", "dark_alley"],
  "tier": 5,
  "stats": {
    "hp": 350,
    "mana": 200,
    "attack": 90,
    "defense": 50,
    "agility": 100
  },
  "drops": [
    {
      "item": "shadow_essence",
      "chance": 60,
      "min": 1,
      "max": 3
    },
    {
      "item": "assassin_blade",
      "chance": 15,
      "min": 1,
      "max": 1
    }
  ],
  "xp": 180,
  "gold": {
    "min": 80,
    "max": 150
  },
  "skills": [
    {
      "id": "shadow_strike",
      "name": "Shadow Strike",
      "description": "Strike from the shadows",
      "manaCost": 40,
      "cooldown": 3,
      "damageType": "physical",
      "baseDamage": 80,
      "effects": [
        {
          "type": "bleed",
          "value": 15,
          "duration": 3
        }
      ]
    }
  ],
  "passive": {
    "id": "shadow_cloak",
    "name": "Shadow Cloak",
    "emoji": "🌑",
    "effect": "evasion",
    "value": 25
  }
}
```

---

### **Example 3: Boss Enemy**

```javascript
"ancient_dragon_lord": {
  "id": "ancient_dragon_lord",
  "name": "🐲 Ancient Dragon Lord",
  "location": ["dragon_throne"],
  "tier": 10,
  "stats": {
    "hp": 5000,
    "mana": 1000,
    "attack": 280,
    "defense": 220,
    "agility": 100
  },
  "drops": [
    {
      "item": "dragon_soul",
      "chance": 100,
      "min": 1,
      "max": 1
    },
    {
      "item": "legendary_scale",
      "chance": 80,
      "min": 3,
      "max": 7
    },
    {
      "item": "dragon_crown",
      "chance": 30,
      "min": 1,
      "max": 1
    }
  ],
  "xp": 2000,
  "gold": {
    "min": 1000,
    "max": 1500
  },
  "skills": [
    {
      "id": "inferno_breath",
      "name": "Inferno Breath",
      "description": "Breathe devastating flames",
      "manaCost": 150,
      "cooldown": 4,
      "damageType": "magical",
      "baseDamage": 200,
      "effects": [
        {
          "type": "burn",
          "value": 50,
          "duration": 5
        }
      ]
    },
    {
      "id": "dragon_roar",
      "name": "Dragon Roar",
      "description": "Terrifying roar that weakens enemies",
      "manaCost": 100,
      "cooldown": 5,
      "effects": [
        {
          "type": "weaken",
          "value": 50,
          "duration": 4
        },
        {
          "type": "defense_break",
          "value": 60,
          "duration": 4
        }
      ]
    }
  ],
  "passive": {
    "id": "dragon_scales",
    "name": "Dragon Scales",
    "emoji": "🛡️",
    "effect": "defense_boost",
    "value": 50
  }
}
```

---

### **Example 4: Magical Creature**

```javascript
"crystal_golem": {
  "id": "crystal_golem",
  "name": "💎 Crystal Golem",
  "location": ["crystal_cavern", "ancient_quarry"],
  "tier": 6,
  "stats": {
    "hp": 800,
    "mana": 150,
    "attack": 70,
    "defense": 150,
    "agility": 30
  },
  "drops": [
    {
      "item": "crystal_shard",
      "chance": 90,
      "min": 3,
      "max": 7
    },
    {
      "item": "golem_core",
      "chance": 25,
      "min": 1,
      "max": 1
    }
  ],
  "xp": 250,
  "gold": {
    "min": 150,
    "max": 250
  },
  "skills": [
    {
      "id": "crystal_shield",
      "name": "Crystal Shield",
      "description": "Create a protective crystal barrier",
      "manaCost": 50,
      "cooldown": 4,
      "effects": [
        {
          "type": "shield",
          "value": 100,
          "duration": 3
        }
      ]
    }
  ],
  "passive": {
    "id": "stone_body",
    "name": "Stone Body",
    "emoji": "🗿",
    "effect": "defense_boost",
    "value": 40
  }
}
```

---

## 💡 Tips & Best Practices

### **✅ DO:**

1. **Match tier to location level** - Tier 3 enemy in level 15 zone
2. **Balance stats** - Don't make everything high
3. **Appropriate drops** - Wolf drops fur, not dragon scales
4. **Use emojis** - Makes enemies recognizable
5. **Test difficulty** - Make sure it's beatable
6. **Vary enemy types** - Tank, DPS, Mage, Balanced
7. **Scale rewards** - Higher tier = better rewards

### **❌ DON'T:**

1. **Don't use spaces in ID** - Use `fire_dragon` not `fire dragon`
2. **Don't make OP enemies** - Balance is key
3. **Don't forget drops** - Every enemy should drop something
4. **Don't make tier too high** - Match location level
5. **Don't duplicate IDs** - Each enemy needs unique ID
6. **Don't forget gold rewards** - Players need gold

---

## 🎯 Enemy Types & Roles

### **1. 🛡️ Tank (High HP/DEF)**
- High HP and Defense
- Low Agility
- Slow but tough
- Example: Golem, Bear, Turtle

### **2. ⚔️ DPS (High ATK/AGI)**
- High Attack and Agility
- Low HP and Defense
- Fast and deadly
- Example: Assassin, Wolf, Hawk

### **3. 🔮 Mage (High MANA/Skills)**
- High Mana and Magic Attack
- Low HP and Defense
- Powerful skills
- Example: Wizard, Elemental, Spirit

### **4. ⚖️ Balanced**
- Medium all stats
- Versatile
- Good for general enemies
- Example: Soldier, Bandit, Orc

### **5. 👑 Boss**
- Very high all stats
- Multiple skills
- Strong passive
- Unique drops
- Example: Dragon, Demon Lord, Ancient Beast

---

## 🔧 Troubleshooting

### **Problem: Enemy tidak spawn**
- ✅ Check `location` array - harus match location ID
- ✅ Check location's `enemies` array includes this enemy
- ✅ Check `tier` matches location level
- ✅ Restart bot after adding enemy

### **Problem: Enemy terlalu mudah/susah**
- ✅ Check `tier` - adjust to match difficulty
- ✅ Check `stats` - balance HP/ATK/DEF
- ✅ Compare with other enemies in same tier
- ✅ Test in actual combat

### **Problem: Drops tidak muncul**
- ✅ Check `drops` array syntax
- ✅ Check item IDs exist in items.js
- ✅ Check `chance` is 0-100
- ✅ Check `min` <= `max`

### **Problem: Skills tidak work**
- ✅ Check `manaCost` - enemy needs enough mana
- ✅ Check `cooldown` - skill has cooldown period
- ✅ Check `effects` array syntax
- ✅ Check effect types are valid

### **Problem: Validation failed**
- ✅ Check all required fields present
- ✅ Check ID matches key name
- ✅ Check JSON syntax (commas, quotes, brackets)
- ✅ Check `location`, `drops`, `skills` are arrays

---

## 📦 Template Kosong

### **Basic Enemy Template:**
```javascript
"enemy_id": {
  "id": "enemy_id",
  "name": "🐺 Enemy Name",
  "location": ["location1", "location2"],
  "tier": 3,
  "stats": {
    "hp": 150,
    "mana": 50,
    "attack": 30,
    "defense": 20,
    "agility": 25
  },
  "drops": [
    {
      "item": "item_id",
      "chance": 70,
      "min": 1,
      "max": 3
    }
  ],
  "xp": 50,
  "gold": {
    "min": 20,
    "max": 40
  },
  "skills": [],
  "passive": null
}
```

### **Enemy with Skills Template:**
```javascript
"enemy_id": {
  "id": "enemy_id",
  "name": "⚔️ Enemy Name",
  "location": ["location1"],
  "tier": 5,
  "stats": {
    "hp": 400,
    "mana": 200,
    "attack": 70,
    "defense": 50,
    "agility": 60
  },
  "drops": [
    {
      "item": "item_id",
      "chance": 60,
      "min": 1,
      "max": 2
    }
  ],
  "xp": 150,
  "gold": {
    "min": 80,
    "max": 120
  },
  "skills": [
    {
      "id": "skill_id",
      "name": "Skill Name",
      "description": "Skill description",
      "manaCost": 40,
      "cooldown": 3,
      "damageType": "physical",
      "baseDamage": 60,
      "effects": [
        {
          "type": "burn",
          "value": 15,
          "duration": 3
        }
      ]
    }
  ],
  "passive": {
    "id": "passive_id",
    "name": "Passive Name",
    "emoji": "🔥",
    "effect": "attack_boost",
    "value": 20
  }
}
```

---

## 🎓 Latihan

### **Exercise 1: Create a Basic Enemy**
Buat enemy "Ice Wolf" yang:
- Tier 4 (level 16-20)
- Drops ice fur
- Has ice-themed stats

### **Exercise 2: Create a Boss**
Buat boss "Demon King" yang:
- Tier 9 (level 41-45)
- Has 2-3 powerful skills
- Drops legendary items

### **Exercise 3: Create Enemy Family**
Buat 3 related enemies:
- Goblin (Tier 2)
- Goblin Warrior (Tier 4)
- Goblin King (Tier 6)

---

## 📚 Resources

- **Enemy Database:** `WhatsApp/database/rpg/enemies.js`
- **Combat System:** `WhatsApp/case/rpg/hunt.js`
- **Item Database:** `WhatsApp/database/rpg/items.js`
- **Location Database:** `WhatsApp/database/rpg/locations.js`

---

**Happy Enemy Creating! 🎉**

Use `.addenemy` command in WhatsApp to add your enemies instantly!
