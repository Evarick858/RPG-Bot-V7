# 📦 Complete Item System Guide

**Tutorial lengkap untuk menambahkan items, weapons, armor, dan materials di RPG Bot**

---

## 📚 Table of Contents

1. [Apa itu Item System?](#apa-itu-item-system)
2. [Item Categories](#item-categories)
3. [Basic Item Structure](#basic-item-structure)
4. [Weapon & Armor Structure](#weapon--armor-structure)
5. [Using .additem Command](#using-additem-command)
6. [Complete Examples](#complete-examples)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Apa itu Item System?

Item System adalah database untuk **semua items** yang ada di game:
- Materials (crafting, drops)
- Consumables (potions, food)
- Weapons (swords, bows, staffs)
- Armor (Heads, chests, boots)
- Tools (fishing rod, pickaxe, axe)
- Accessories (rings, amulets)

### **Fitur:**
- ✅ 8 kategori items berbeda
- ✅ Buy & sell prices
- ✅ Equipment stats (weapon/armor)
- ✅ Consumable effects
- ✅ Crafting recipes
- ✅ Enemy drops

---

## 📂 Item Categories

### **1. 🧪 Consumable**
Items yang bisa digunakan (potions, food, scrolls)

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `effect` - What it does (heal, mana, buff)
- `value` - How much (heal 100 HP, +20 ATK)

**Example:**
```javascript
"super_potion": {
  "id": "super_potion",
  "name": "🧪 Super Potion",
  "category": "consumable",
  "description": "Restores 200 HP",
  "buyPrice": 150,
  "sellPrice": 75,
  "effect": "heal",
  "value": 200
}
```

---

### **2. 🔨 Tool**
Gathering tools (fishing rod, pickaxe, axe)

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `toolType` - fishing, mining, chopping, foraging
- `efficiency` - Bonus success rate (0-100)

**Example:**
```javascript
"diamond_pickaxe": {
  "id": "diamond_pickaxe",
  "name": "⛏️ Diamond Pickaxe",
  "category": "tool",
  "description": "Best mining tool",
  "buyPrice": 5000,
  "sellPrice": 2500,
  "toolType": "mining",
  "efficiency": 50
}
```

---

### **3. 🎁 Utility**
Special items (teleports, bag expansions)

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `utilityType` - teleport, bag_expansion, etc.

**Example:**
```javascript
"teleport_scroll": {
  "id": "teleport_scroll",
  "name": "📜 Teleport Scroll",
  "category": "utility",
  "description": "Teleport to any location",
  "buyPrice": 500,
  "sellPrice": 250,
  "utilityType": "teleport"
}
```

---

### **4. 🪨 Material**
Crafting materials & enemy drops

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`

**Example:**
```javascript
"dragon_scale": {
  "id": "dragon_scale",
  "name": "🐉 Dragon Scale",
  "category": "material",
  "description": "Rare dragon scale for crafting",
  "buyPrice": 0,
  "sellPrice": 500
}
```

---

### **5. 📜 Quest**
Quest-related items

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`

**Example:**
```javascript
"ancient_key": {
  "id": "ancient_key",
  "name": "🔑 Ancient Key",
  "category": "quest",
  "description": "Opens the ancient temple",
  "buyPrice": 0,
  "sellPrice": 0
}
```

---

### **6. ⚔️ Weapon**
Equippable weapons

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `stats` - { attack, defense, agility, hp, mana }
- `tier` - 1-10 (level requirement)
- `slot` - "weapon"

**Example:**
```javascript
"legendary_sword": {
  "id": "legendary_sword",
  "name": "⚔️ Legendary Sword",
  "category": "weapon",
  "description": "A sword of legends",
  "buyPrice": 10000,
  "sellPrice": 5000,
  "tier": 8,
  "slot": "weapon",
  "stats": {
    "attack": 120,
    "defense": 20,
    "agility": 15,
    "hp": 0,
    "mana": 0
  }
}
```

---

### **7. 🛡️ Armor**
Equippable armor pieces

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `stats` - { attack, defense, agility, hp, mana }
- `tier` - 1-10 (level requirement)
- `slot` - "Head", "chest", "legs", "boots"

**Example:**
```javascript
"dragon_Head": {
  "id": "dragon_Head",
  "name": "🪖 Dragon Head",
  "category": "armor",
  "description": "Head forged from dragon scales",
  "buyPrice": 8000,
  "sellPrice": 4000,
  "tier": 7,
  "slot": "Head",
  "stats": {
    "attack": 10,
    "defense": 80,
    "agility": 5,
    "hp": 200,
    "mana": 50
  }
}
```

---

### **8. 💍 Accessory**
Rings, amulets, accessories

**Required Fields:**
- `id`, `name`, `category`, `description`, `buyPrice`, `sellPrice`
- `stats` - { attack, defense, agility, hp, mana }
- `tier` - 1-10
- `slot` - "accessory"

**Example:**
```javascript
"phoenix_ring": {
  "id": "phoenix_ring",
  "name": "💍 Phoenix Ring",
  "category": "accessory",
  "description": "Ring of rebirth",
  "buyPrice": 15000,
  "sellPrice": 7500,
  "tier": 9,
  "slot": "accessory",
  "stats": {
    "attack": 30,
    "defense": 30,
    "agility": 30,
    "hp": 300,
    "mana": 300
  }
}
```

---

## 🏗️ Basic Item Structure

### **Template Dasar (Material/Consumable):**

```javascript
"item_id": {
  "id": "item_id",
  "name": "🎯 Item Name",
  "category": "material", // or consumable, tool, utility, quest
  "description": "Item description here",
  "buyPrice": 100, // 0 if not buyable
  "sellPrice": 50  // How much player gets when selling
}
```

### **Template dengan Effect (Consumable):**

```javascript
"healing_potion": {
  "id": "healing_potion",
  "name": "🧪 Healing Potion",
  "category": "consumable",
  "description": "Restores 100 HP",
  "buyPrice": 50,
  "sellPrice": 25,
  "effect": "heal", // heal, mana, buff, damage
  "value": 100      // Amount
}
```

---

## ⚔️ Weapon & Armor Structure

### **Weapon Template:**

```javascript
"weapon_id": {
  "id": "weapon_id",
  "name": "⚔️ Weapon Name",
  "category": "weapon",
  "description": "Weapon description",
  "buyPrice": 5000,
  "sellPrice": 2500,
  "tier": 5, // Level requirement (1-10)
  "slot": "weapon",
  "stats": {
    "attack": 80,   // Main stat for weapons
    "defense": 10,  // Optional
    "agility": 15,  // Optional
    "hp": 0,        // Optional
    "mana": 0       // Optional
  }
}
```

### **Armor Template:**

```javascript
"armor_id": {
  "id": "armor_id",
  "name": "🛡️ Armor Name",
  "category": "armor",
  "description": "Armor description",
  "buyPrice": 4000,
  "sellPrice": 2000,
  "tier": 5, // Level requirement (1-10)
  "slot": "chest", // Head, chest, legs, boots
  "stats": {
    "attack": 5,      // Optional
    "defense": 100,   // Main stat for armor
    "agility": 10,    // Optional
    "hp": 150,        // Optional
    "mana": 50        // Optional
  }
}
```

### **Armor Slots:**
- `Head` - Head armor
- `chest` - Body armor
- `legs` - Leg armor
- `boots` - Foot armor

---

## 💻 Using .additem Command

### **Command Format:**

```
.additem "item_id": {
  "id": "item_id",
  "name": "🎯 Item Name",
  "category": "material",
  "description": "Description",
  "buyPrice": 100,
  "sellPrice": 50
},
```

### **Step-by-Step:**

1. **Copy your item code** (with proper format)
2. **In WhatsApp, type:** `.additem` followed by the code
3. **Bot will validate:**
   - ✅ Basic structure
   - ✅ Required fields
   - ✅ ID matching
   - ✅ Valid category
   - ✅ No duplicates
   - ✅ JavaScript syntax
4. **If valid:** Item added to database!
5. **If invalid:** Error message with details

### **Example Usage:**

```
.additem "phoenix_feather": {
  "id": "phoenix_feather",
  "name": "🔥 Phoenix Feather",
  "category": "material",
  "description": "Rare feather from a phoenix",
  "buyPrice": 0,
  "sellPrice": 1000
},
```

**Success Response:**
```
✅ ITEM ADDED SUCCESSFULLY!
━━━━━━━━━━━━━━━━━━━━

Item ID: phoenix_feather
File: items.js

✓ All validations passed
✓ Syntax is correct
✓ Category is valid
✓ No duplicate ID

The item has been added to the database!
```

---

## 📝 Complete Examples

### **Example 1: Basic Material**

```javascript
"unicorn_horn": {
  "id": "unicorn_horn",
  "name": "🦄 Unicorn Horn",
  "category": "material",
  "description": "Magical horn from a unicorn. Used in legendary crafting.",
  "buyPrice": 0,
  "sellPrice": 2000
}
```

### **Example 2: Consumable with Effect**

```javascript
"elixir_of_strength": {
  "id": "elixir_of_strength",
  "name": "💪 Elixir of Strength",
  "category": "consumable",
  "description": "Temporarily increases attack by 50 for 5 turns",
  "buyPrice": 500,
  "sellPrice": 250,
  "effect": "buff_attack",
  "value": 50,
  "duration": 5
}
```

### **Example 3: Legendary Weapon**

```javascript
"excalibur": {
  "id": "excalibur",
  "name": "⚔️ Excalibur",
  "category": "weapon",
  "description": "The legendary sword of kings. Unmatched power.",
  "buyPrice": 50000,
  "sellPrice": 25000,
  "tier": 10,
  "slot": "weapon",
  "stats": {
    "attack": 200,
    "defense": 50,
    "agility": 30,
    "hp": 500,
    "mana": 200
  }
}
```

### **Example 4: Epic Armor Set Piece**

```javascript
"celestial_chest": {
  "id": "celestial_chest",
  "name": "✨ Celestial chest",
  "category": "armor",
  "description": "Armor blessed by the gods. Part of Celestial Set.",
  "buyPrice": 30000,
  "sellPrice": 15000,
  "tier": 9,
  "slot": "chest",
  "stats": {
    "attack": 40,
    "defense": 180,
    "agility": 25,
    "hp": 600,
    "mana": 300
  },
  "setBonus": "celestial_set"
}
```

### **Example 5: Gathering Tool**

```javascript
"master_fishing_rod": {
  "id": "master_fishing_rod",
  "name": "🎣 Master Fishing Rod",
  "category": "tool",
  "description": "The best fishing rod. Catches rare fish easily.",
  "buyPrice": 10000,
  "sellPrice": 5000,
  "toolType": "fishing",
  "efficiency": 75
}
```

---

## 💡 Tips & Best Practices

### **✅ DO:**

1. **Use descriptive IDs** - `dragon_scale` not `ds1`
2. **Balance prices** - sellPrice = 50% of buyPrice
3. **Tier = Level requirement** - Tier 5 = Level 5+
4. **Use emojis** - Makes items look better
5. **Test in-game** - Make sure item works
6. **Logical stats** - Weapons = high ATK, Armor = high DEF
7. **Set buyPrice = 0** for drops/quest items

### **❌ DON'T:**

1. **Don't use spaces in ID** - Use `dragon_scale` not `dragon scale`
2. **Don't make OP items** - Balance game economy
3. **Don't forget sellPrice** - Required field!
4. **Don't mix categories** - Weapon is weapon, not material
5. **Don't duplicate IDs** - Each item needs unique ID
6. **Don't forget tier** - Required for equipment

---

## 🎲 Item Tiers & Balance

### **Tier Guidelines:**

| Tier | Level | Attack | Defense | HP | Price Range |
|------|-------|--------|---------|----|-----------| 
| 1 | 1-5 | 10-20 | 10-20 | 50-100 | 50-200 |
| 2 | 6-10 | 20-35 | 20-35 | 100-150 | 200-500 |
| 3 | 11-15 | 35-50 | 35-50 | 150-250 | 500-1000 |
| 4 | 16-20 | 50-70 | 50-70 | 250-350 | 1000-2000 |
| 5 | 21-25 | 70-90 | 70-90 | 350-450 | 2000-4000 |
| 6 | 26-30 | 90-110 | 90-110 | 450-600 | 4000-7000 |
| 7 | 31-35 | 110-135 | 110-135 | 600-750 | 7000-12000 |
| 8 | 36-40 | 135-160 | 135-160 | 750-900 | 12000-20000 |
| 9 | 41-45 | 160-190 | 160-190 | 900-1200 | 20000-35000 |
| 10 | 46-50 | 190-250 | 190-250 | 1200-1500 | 35000-50000 |

### **Material Sell Prices:**

| Rarity | Sell Price Range |
|--------|------------------|
| Common | 1-10 gold |
| Uncommon | 10-50 gold |
| Rare | 50-200 gold |
| Epic | 200-1000 gold |
| Legendary | 1000-5000 gold |

---

## 🔧 Troubleshooting

### **Problem: Item tidak muncul di shop**
- ✅ Check `buyPrice` - harus > 0 untuk bisa dibeli
- ✅ Check category - harus valid category
- ✅ Restart bot setelah add item

### **Problem: Item tidak bisa equip**
- ✅ Check `category` - harus "weapon" atau "armor"
- ✅ Check `slot` - harus ada (weapon, Head, etc.)
- ✅ Check `tier` - player level harus cukup
- ✅ Check `stats` - harus ada stats object

### **Problem: Validation failed**
- ✅ Check all required fields present
- ✅ Check ID matches key name
- ✅ Check category is valid
- ✅ Check JSON syntax (commas, quotes)

### **Problem: Duplicate ID error**
- ✅ Item ID already exists in database
- ✅ Use different ID or remove old item first
- ✅ Check items.js for existing IDs

---

## 📦 Template Kosong

### **Material Template:**
```javascript
"item_id": {
  "id": "item_id",
  "name": "🎯 Item Name",
  "category": "material",
  "description": "Description here",
  "buyPrice": 0,
  "sellPrice": 100
}
```

### **Weapon Template:**
```javascript
"weapon_id": {
  "id": "weapon_id",
  "name": "⚔️ Weapon Name",
  "category": "weapon",
  "description": "Description here",
  "buyPrice": 5000,
  "sellPrice": 2500,
  "tier": 5,
  "slot": "weapon",
  "stats": {
    "attack": 80,
    "defense": 10,
    "agility": 15,
    "hp": 0,
    "mana": 0
  }
}
```

### **Armor Template:**
```javascript
"armor_id": {
  "id": "armor_id",
  "name": "🛡️ Armor Name",
  "category": "armor",
  "description": "Description here",
  "buyPrice": 4000,
  "sellPrice": 2000,
  "tier": 5,
  "slot": "chest",
  "stats": {
    "attack": 5,
    "defense": 100,
    "agility": 10,
    "hp": 150,
    "mana": 50
  }
}
```

---

## 🎓 Latihan

### **Exercise 1: Create a Material**
Buat material "Demon Horn" yang:
- Rare drop dari demon enemies
- Sell price: 800 gold
- Used for crafting dark weapons

### **Exercise 2: Create a Weapon**
Buat weapon "Ice Blade" yang:
- Tier 6 (level 26+)
- Attack: 110, Agility: 20
- Price: 8000 gold

### **Exercise 3: Create Armor Set**
Buat 4-piece armor set "Shadow Set":
- Head, chest, legs, Boots
- Tier 7
- Focus on agility and defense

---

## 📚 Resources

- **Item Database:** `WhatsApp/database/rpg/items.js`
- **Shop System:** `WhatsApp/case/rpg/shop.js`
- **Equipment System:** `WhatsApp/case/rpg/equip.js`
- **Crafting System:** `WhatsApp/case/rpg/craft.js`

---

**Happy Item Creating! 🎉**

Use `.additem` command in WhatsApp to add your items instantly!
