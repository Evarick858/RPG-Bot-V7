# 📖 Complete Story System Guide

**Tutorial lengkap untuk membuat story encounters di RPG Bot**

---

## 📚 Table of Contents

1. [Apa itu Story System?](#apa-itu-story-system)
2. [Bilingual Support (EN + ID)](#bilingual-support)
3. [Basic Story Structure](#basic-story-structure)
4. [Multi-Stage Stories](#multi-stage-stories)
5. [150 Available Choices](#available-choices)
6. [Complete Examples](#complete-examples)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Apa itu Story System?

Story System adalah **random encounters** yang muncul saat player travel (10% chance).

### **Fitur:**
- ✅ Random encounters saat travel
- ✅ Player bisa pilih action (max 3 pilihan)
- ✅ Setiap pilihan punya outcome berbeda (good/neutral/bad)
- ✅ Rewards: gold, exp, items, reputation
- ✅ **Multi-stage**: Story bisa berlanjut dengan pilihan baru
- ✅ **Bilingual**: Support English + Indonesian

---

## 🌍 Bilingual Support (EN + ID)

**PENTING:** Semua story HARUS support 2 bahasa!

### **Format Bilingual:**

```javascript
// ✅ BENAR - Bilingual format
{
  en: "English text here",
  id: "Teks Indonesia di sini"
}

// ❌ SALAH - Single language
"Only one language"
```

### **Yang Perlu Bilingual:**
- ✅ `title` - Judul story
- ✅ `description` - Deskripsi story
- ✅ `label` - Label pilihan
- ✅ `text` - Outcome text
- ✅ Stage `title` dan `description`

### **Yang TIDAK Perlu Bilingual:**
- ❌ `id` - Story ID (string biasa)
- ❌ `emoji` - Emoji (universal)
- ❌ `rarity` - Rarity level
- ❌ `locations` - Location IDs
- ❌ `rewards` - Reward values

---

## 🏗️ Basic Story Structure

### **Template Dasar:**

```javascript
story_id: {
  id: "story_id",
  
  // Bilingual title
  title: {
    en: "🎭 Story Title",
    id: "🎭 Judul Story"
  },
  
  // Bilingual description
  description: {
    en: "Story description in English...",
    id: "Deskripsi story dalam Bahasa Indonesia..."
  },
  
  emoji: "🎭",
  rarity: "common", // common, uncommon, rare, epic, legendary
  locations: ["all"], // atau ["forest", "mountain", dll]
  
  choices: {
    choice1: {
      label: {
        en: "🎯 Choice 1",
        id: "🎯 Pilihan 1"
      },
      
      // Optional: Required items
      requiredItems: [{ id: "health_potion", qty: 1 }],
      
      // Optional: Required gold
      requiredGold: 100,
      
      outcomes: [
        {
          weight: 60, // Probability (total harus 100)
          type: "good", // good, neutral, bad
          text: {
            en: "Good outcome in English!",
            id: "Hasil bagus dalam Bahasa Indonesia!"
          },
          rewards: {
            gold: 500,
            exp: 100,
            items: [{ id: "elixir", qty: 2 }],
            reputation: 10,
            damage: 0 // Optional: damage to player
          }
        },
        {
          weight: 40,
          type: "bad",
          text: {
            en: "Bad outcome!",
            id: "Hasil buruk!"
          },
          rewards: {
            gold: -200,
            damage: 50,
            reputation: -5
          }
        }
      ]
    },
    
    choice2: {
      label: {
        en: "🚶 Leave",
        id: "🚶 Pergi"
      },
      outcomes: [
        {
          weight: 100,
          type: "neutral",
          text: {
            en: "You leave safely.",
            id: "Kamu pergi dengan selamat."
          },
          rewards: { exp: 20 }
        }
      ]
    }
  }
}
```

---

## 🎬 Multi-Stage Stories

Story yang **berlanjut** setelah player pilih option pertama!

### **Cara Kerja:**

1. Player pilih option di Stage 1
2. Jika outcome punya `nextStage`, story berlanjut
3. Player dapat pilihan baru di Stage 2
4. Bisa branching (pilihan A → Stage 2A, pilihan B → Stage 2B)
5. Jika tidak ada `nextStage`, story selesai

### **Flow Example:**

```
Stage 1: Mysterious Cave
├─ Enter → Stage 2A (Inside Cave)
├─ Observe → Stage 2B (Cautious Entry)
└─ Leave → END

Stage 2A: Inside Cave
├─ Left Path → Stage 3A (Water Source)
├─ Right Path → Stage 3B (Crystal Room)
└─ Go Back → END

Stage 3A: Water Source
├─ Drink → END (Good)
├─ Fill Bottle → END (Good)
└─ Leave → END (Neutral)
```

### **Multi-Stage Template:**

```javascript
mysterious_cave: {
  id: "mysterious_cave",
  
  title: {
    en: "🕳️ Mysterious Cave",
    id: "🕳️ Gua Misterius"
  },
  
  description: {
    en: "You discover a dark cave...",
    id: "Kamu menemukan gua gelap..."
  },
  
  emoji: "🕳️",
  rarity: "uncommon",
  locations: ["mountain_path", "dark_forest"],
  
  // STAGE 1: Initial choices
  choices: {
    enter: {
      label: {
        en: "🚪 Enter Cave",
        id: "🚪 Masuk Gua"
      },
      outcomes: [
        {
          weight: 100,
          type: "neutral",
          text: {
            en: "You enter the cave carefully...",
            id: "Kamu masuk gua dengan hati-hati..."
          },
          rewards: { exp: 50 },
          nextStage: "inside_cave" // ← Continue to next stage
        }
      ]
    },
    
    leave: {
      label: {
        en: "🚶 Leave",
        id: "🚶 Pergi"
      },
      outcomes: [
        {
          weight: 100,
          type: "neutral",
          text: {
            en: "You decide to leave.",
            id: "Kamu memutuskan untuk pergi."
          },
          rewards: { exp: 20 }
          // No nextStage = story ends
        }
      ]
    }
  },
  
  // STAGES: Additional story stages
  stages: {
    
    inside_cave: {
      title: {
        en: "🕳️ Inside the Cave",
        id: "🕳️ Di Dalam Gua"
      },
      
      description: {
        en: "You see two paths...",
        id: "Kamu melihat dua jalur..."
      },
      
      choices: {
        left: {
          label: {
            en: "⬅️ Left Path",
            id: "⬅️ Jalur Kiri"
          },
          outcomes: [
            {
              weight: 100,
              type: "good",
              text: {
                en: "You find treasure!",
                id: "Kamu menemukan harta!"
              },
              rewards: { gold: 1000, exp: 300 }
              // No nextStage = story ends
            }
          ]
        },
        
        back: {
          label: {
            en: "🔙 Go Back",
            id: "🔙 Kembali"
          },
          outcomes: [
            {
              weight: 100,
              type: "neutral",
              text: {
                en: "You exit safely.",
                id: "Kamu keluar dengan selamat."
              },
              rewards: { exp: 80 }
            }
          ]
        }
      }
    }
    
  }
}
```

### **Multi-Stage Rules:**

✅ **DO:**
- Maksimal 2-4 stages (jangan terlalu panjang)
- Setiap stage harus punya option "Leave" atau "Go Back"
- Gunakan `nextStage: "stage_id"` untuk lanjut
- Buat branching paths yang menarik

❌ **DON'T:**
- Jangan buat stage terlalu banyak (>5 stages)
- Jangan paksa player terus lanjut (harus ada exit option)
- Jangan lupa bilingual text di semua stages

---

## 🎮 150 Available Choices

**All 150 choice types organized by category:**

### **🤝 Social & Interaction (7)**
- `help` - ❤️ Help
- `ignore` - 👁️ Ignore
- `attack` - ⚔️ Attack
- `threaten` - 😠 Threaten
- `trade` - 🤝 Trade
- `follow` - 👣 Follow
- `leave` - 🚶 Leave

### **🔍 Investigation & Observation (6)**
- `investigate` - 🔍 Investigate
- `observe` - 👀 Observe
- `hide` - 🫣 Hide
- `run` - 🏃 Run Away
- `sneak` - 🤫 Sneak Past
- `search` - 🔎 Search Carefully

### **💬 Communication (5)**
- `negotiate` - 💬 Negotiate
- `ask` - ❓ Ask Questions
- `lie` - 🤥 Lie
- `truth` - 🗣️ Tell the Truth
- `talk` - 💬 Talk

### **🙏 Religious & Mystical (6)**
- `pray` - 🙏 Pray
- `touch` - ✋ Touch Object
- `destroy` - 💥 Destroy Object
- `take` - 🤲 Take Artifact
- `offering` - 🎁 Leave Offering
- `read` - 📖 Read Inscription

### **📦 Chest & Container Actions (4)**
- `open` - 🔓 Open Chest
- `force` - 💪 Force Open
- `usekey` - 🔑 Use Key
- `burn` - 🔥 Burn It

### **🗺️ Exploration Actions (8)**
- `dig` - ⛏️ Dig
- `rush` - ⚡ Rush Forward
- `wait` - ⏳ Wait Quietly
- `listen` - 👂 Listen Closely
- `callout` - 📢 Call Out
- `silent` - 🤐 Stay Silent
- `lighttorch` - 🔦 Light Torch
- `extinguish` - 💨 Extinguish Torch

### **📜 Pacts & Agreements (3)**
- `accept` - ✅ Accept Pact
- `refuse` - ❌ Refuse Pact
- `askname` - 🏷️ Ask Name

### **👻 Spirit & Supernatural (7)**
- `followspirit` - 👻 Follow Spirit
- `banish` - ✨ Banish Spirit
- `useholy` - 📿 Use Holy Item
- `darkmagic` - 🌑 Use Forbidden Magic
- `absorb` - ⚡ Absorb Power
- `seal` - 🔒 Seal It
- `keeprelic` - 💎 Keep Relic

### **🛡️ Sacrifice & Protection (6)**
- `sacrificeitem` - 🎁 Sacrifice Item
- `sacrificeally` - 💀 Sacrifice Ally
- `protect` - 🛡️ Protect Ally
- `betray` - 🗡️ Betray Ally
- `recruit` - 🤝 Recruit Ally
- `refuseally` - 🚫 Refuse Ally

### **💰 Trading & Commerce (8)**
- `sharefood` - 🍞 Share Food
- `heal` - 💊 Heal Stranger
- `rob` - 💰 Rob Merchant
- `haggle` - 💵 Haggle
- `buy` - 🛒 Buy Item
- `sell` - 💸 Sell Item
- `tradeinfo` - 📰 Trade Information
- `rumors` - 🗨️ Ask Rumors

### **🤫 Secrets & Information (4)**
- `reveal` - 🔓 Reveal Secret
- `hidesecret` - 🤫 Hide Secret
- `warn` - ⚠️ Warn Village
- `ignorewarning` - 🙈 Ignore Warning

### **🏰 Dungeon & Location (5)**
- `enter` - 🚪 Enter Dungeon
- `retreat` - 🔙 Retreat
- `camp` - 🏕️ Set Camp
- `sleep` - 😴 Sleep
- `awake` - 👁️ Stay Awake

### **🎣 Gathering Activities (7)**
- `hunt` - 🏹 Hunt at Night
- `fish` - 🎣 Fish
- `mine` - ⛏️ Mine
- `chop` - 🪓 Chop Wood
- `forage` - 🍄 Forage
- `track` - 🐾 Track Creature
- `trap` - 🪤 Set Trap

### **⛓️ Prisoner & Enemy Actions (4)**
- `free` - 🔓 Free Prisoner
- `execute` - ⚔️ Execute Prisoner
- `spare` - 🕊️ Spare Enemy
- `finish` - 💀 Finish Enemy

### **⚔️ Combat Actions (4)**
- `intimidate` - 😈 Intimidate
- `duel` - ⚔️ Challenge Duel
- `surrender` - 🏳️ Surrender
- `fight` - ⚔️ Fight

### **🗺️ Navigation & Movement (5)**
- `shortcut` - 🛤️ Take Shortcut
- `bridge` - 🌉 Cross Bridge
- `swim` - 🏊 Swim Across
- `climb` - 🧗 Climb Cliff
- `descend` - ⬇️ Descend Deeper

### **⚙️ Device & Mechanism (3)**
- `activate` - ⚙️ Activate Device
- `disable` - 🔧 Disable Device
- `ringbell` - 🔔 Ring Bell

### **🧪 Consumables & Items (5)**
- `drinkpotion` - 🧪 Drink Potion
- `eatfruit` - 🍎 Eat Strange Fruit
- `readbook` - 📚 Read Ancient Book
- `wearcursed` - 👑 Wear Cursed Item
- `removecursed` - 🚫 Remove Cursed Item

### **🌀 Portal & Dimensional (4)**
- `enterportal` - 🌀 Enter Portal
- `closeportal` - 🚫 Close Portal
- `touchcrystal` - 💎 Touch Crystal
- `breakcrystal` - 💥 Break Crystal

### **🙇 Respect & Honor (5)**
- `kneel` - 🧎 Kneel
- `bow` - 🙇 Bow
- `demand` - ❗ Demand Answers
- `accuse` - 👉 Accuse
- `forgive` - 🕊️ Forgive

### **🎁 Rewards & Missions (4)**
- `takereward` - 💰 Take Reward
- `refusereward` - 🚫 Refuse Reward
- `escort` - 🛡️ Escort Traveler
- `abandon` - 🚶 Abandon Traveler

### **✨ Supernatural Phenomena (3)**
- `followlights` - ✨ Follow Lights
- `ignorevoices` - 🙉 Ignore Voices
- `chaseshadow` - 👤 Chase Shadow

### **📋 Evidence & Investigation (2)**
- `hideevidence` - 🗑️ Hide Evidence
- `showevidence` - 📋 Reveal Evidence

### **⚰️ Tomb & Ancient Sites (4)**
- `opensarcophagus` - ⚰️ Open Sarcophagus
- `sealtomb` - 🔒 Seal Tomb
- `uselever` - 🎚️ Use Ancient Lever
- `pullsword` - ⚔️ Pull Sword from Stone

### **💧 Water & Wishes (3)**
- `drinkspring` - 💧 Drink from Spring
- `throwcoin` - 🪙 Throw Coin
- `wish` - ⭐ Make a Wish

### **⏰ Timing & Trust (4)**
- `enteralone` - 🚶 Enter Alone
- `waitmorning` - 🌅 Wait for Morning
- `trust` - 🤝 Trust the Stranger
- `distrust` - 🤨 Distrust the Stranger

### **🐉 Creature Interaction (3)**
- `study` - 📝 Study Creature
- `capture` - 🪤 Capture Creature
- `release` - 🕊️ Release Creature

### **✨ Area Effects (5)**
- `harvest` - 💎 Harvest Crystal
- `purify` - ✨ Purify Area
- `corrupt` - 🌑 Corrupt Area
- `lightcandle` - 🕯️ Light Candle
- `extinguishflame` - 💨 Extinguish Flame

### **🗺️ Map & Navigation (6)**
- `readmap` - 🗺️ Read Map
- `ignoremap` - 🚫 Ignore Map
- `opengate` - 🚪 Open the Gate
- `lockgate` - 🔒 Lock the Gate
- `soundhorn` - 📯 Sound the Horn
- `followprints` - 👣 Follow Footprints

### **⚰️ Death & Respect (2)**
- `bury` - ⚰️ Bury the Dead
- `loot` - 💰 Loot the Dead

### **📜 Mission & Fate (4)**
- `acceptmission` - ✅ Accept Mission
- `declinemission` - ❌ Decline Mission
- `challengefate` - ⚡ Challenge Fate
- `turnback` - 🔙 Turn Back

### **🌑 Void & Madness (3)**
- `gazevoid` - 👁️ Gaze Into Void
- `resist` - 🛡️ Resist the Whisper
- `embrace` - 🌑 Embrace the Whisper

### **💭 Dream & Reality (3)**
- `enterdream` - 💭 Enter Dream
- `wakeup` - ⏰ Wake Up Immediately
- `staylonger` - 😴 Stay Longer

**Total: 150 choices available!**

---

## 📝 Complete Examples

### **Example 1: Simple Story (Single Stage)**

```javascript
injured_traveler: {
  id: "injured_traveler",
  
  title: {
    en: "🤕 Injured Traveler",
    id: "🤕 Pengembara Terluka"
  },
  
  description: {
    en: "You find a wounded traveler by the roadside...",
    id: "Kamu menemukan pengembara terluka di pinggir jalan..."
  },
  
  emoji: "🤕",
  rarity: "common",
  locations: ["all"],
  
  choices: {
    help: {
      label: {
        en: "❤️ Help (Requires: 1x Health Potion)",
        id: "❤️ Bantu (Perlu: 1x Health Potion)"
      },
      requiredItems: [{ id: "health_potion", qty: 1 }],
      outcomes: [
        {
          weight: 70,
          type: "good",
          text: {
            en: "You heal them. They reward you generously!",
            id: "Kamu menyembuhkan mereka. Mereka memberi hadiah!"
          },
          rewards: { gold: 300, exp: 150, reputation: 15 }
        },
        {
          weight: 30,
          type: "bad",
          text: {
            en: "It was a trap! They steal your gold!",
            id: "Ini jebakan! Mereka mencuri emasmu!"
          },
          rewards: { gold: -400, reputation: -5 }
        }
      ]
    },
    
    ignore: {
      label: {
        en: "👁️ Ignore",
        id: "👁️ Abaikan"
      },
      outcomes: [
        {
          weight: 100,
          type: "bad",
          text: {
            en: "You ignore them and feel guilty.",
            id: "Kamu mengabaikan mereka dan merasa bersalah."
          },
          rewards: { reputation: -10 }
        }
      ]
    },
    
    leave: {
      label: {
        en: "🚶 Leave",
        id: "🚶 Pergi"
      },
      outcomes: [
        {
          weight: 100,
          type: "neutral",
          text: {
            en: "You walk away.",
            id: "Kamu pergi."
          },
          rewards: { reputation: -3 }
        }
      ]
    }
  }
}
```

### **Example 2: Multi-Stage Story**

Lihat `mysterious_cave` di `story.js` untuk contoh lengkap multi-stage story dengan 5 stages dan multiple branching paths!

---

## 💡 Tips & Best Practices

### **✅ DO:**

1. **Selalu gunakan bilingual format** untuk semua text
2. **Maksimal 3 pilihan** per stage (WhatsApp button limit)
3. **Total weight = 100** untuk semua outcomes
4. **Berikan option "Leave"** di setiap stage
5. **Balance rewards** - jangan terlalu banyak atau terlalu sedikit
6. **Test semua paths** - pastikan semua pilihan work
7. **Gunakan emoji** yang sesuai dengan story theme
8. **Reputation matters** - good actions = +rep, evil = -rep

### **❌ DON'T:**

1. **Jangan hardcode text** - harus bilingual!
2. **Jangan lebih dari 3 choices** - WhatsApp limit
3. **Jangan buat stage terlalu panjang** - max 4 stages
4. **Jangan lupa exit option** - player harus bisa keluar
5. **Jangan weight tidak balance** - total harus 100
6. **Jangan reward terlalu OP** - balance game economy

---

## 🎲 Rarity & Locations

### **Rarity Levels:**
- `common` - Sering muncul (50% chance)
- `uncommon` - Kadang muncul (30% chance)
- `rare` - Jarang muncul (15% chance)
- `epic` - Sangat jarang (4% chance)
- `legendary` - Extremely rare (1% chance)

### **Location Options:**
- `["all"]` - Bisa muncul di semua lokasi
- `["forest", "mountain"]` - Hanya di lokasi tertentu
- `["peaceful_forest", "dark_forest"]` - Specific locations

**Available Locations:**
- `starter_village`, `peaceful_forest`, `green_meadow`
- `dark_forest`, `mountain_path`, `desert_oasis`
- `mystic_temple`, `shadow_valley`, `crystal_cave`
- `floating_sanctuary`, `ancient_ruins`, `volcanic_crater`

---

## 🔧 Troubleshooting

### **Problem: Story tidak muncul**
- ✅ Check `rarity` - legendary sangat jarang
- ✅ Check `locations` - pastikan match dengan lokasi player
- ✅ Story chance = 10% saat travel

### **Problem: Pilihan tidak muncul**
- ✅ Check `requiredItems` - player harus punya item
- ✅ Check `requiredGold` - player harus punya gold cukup
- ✅ Max 3 choices - lebih dari itu tidak akan muncul

### **Problem: Text tidak bilingual**
- ✅ Pastikan semua text gunakan format `{ en: "...", id: "..." }`
- ✅ Check `title`, `description`, `label`, `text`
- ✅ Jangan lupa stage title & description juga bilingual

### **Problem: Multi-stage tidak lanjut**
- ✅ Check `nextStage: "stage_id"` ada di outcome
- ✅ Check `stages: { stage_id: {...} }` sudah didefinisikan
- ✅ Check stage_id match (case-sensitive)

### **Problem: Weight error**
- ✅ Total weight semua outcomes harus = 100
- ✅ Example: weight 60 + weight 40 = 100 ✅
- ✅ Example: weight 50 + weight 30 = 80 ❌

---

## 📦 Template Kosong

```javascript
my_story: {
  id: "my_story",
  
  title: {
    en: "🎭 Story Title",
    id: "🎭 Judul Story"
  },
  
  description: {
    en: "Description...",
    id: "Deskripsi..."
  },
  
  emoji: "🎭",
  rarity: "common",
  locations: ["all"],
  
  choices: {
    choice1: {
      label: {
        en: "🎯 Choice 1",
        id: "🎯 Pilihan 1"
      },
      outcomes: [
        {
          weight: 100,
          type: "good",
          text: {
            en: "Outcome...",
            id: "Hasil..."
          },
          rewards: { gold: 100, exp: 50 }
        }
      ]
    },
    
    leave: {
      label: {
        en: "🚶 Leave",
        id: "🚶 Pergi"
      },
      outcomes: [
        {
          weight: 100,
          type: "neutral",
          text: {
            en: "You leave.",
            id: "Kamu pergi."
          },
          rewards: { exp: 20 }
        }
      ]
    }
  }
}
```

---

## 🎓 Latihan

### **Exercise 1: Simple Story**
Buat story tentang "Mysterious Merchant" dengan 3 pilihan:
- Talk (good: dapat info, bad: boring)
- Buy (good: dapat item, bad: scam)
- Leave (neutral)

### **Exercise 2: Multi-Stage Story**
Buat story tentang "Haunted House" dengan 2 stages:
- Stage 1: Enter/Observe/Leave
- Stage 2: Explore/Run/Fight Ghost

---

## 📚 Resources

- **Full Choice List:** `STORY_CHOICES_GUIDE.md`
- **Story Code:** `WhatsApp/database/rpg/story.js`
- **Story Handler:** `WhatsApp/case/rpg/storyHandler.js`
- **Example Story:** Search for `mysterious_cave` in `story.js`

---

**Happy Story Creating! 🎉**

Jika ada pertanyaan atau butuh bantuan, check code di `story.js` atau lihat contoh `mysterious_cave`!
