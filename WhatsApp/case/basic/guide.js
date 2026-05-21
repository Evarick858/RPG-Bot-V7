// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  RPG Command : guide
  Base : Lenwy SCM — RPG Extension

  Shows in-game guides for new and existing players.
  Usage: !guide [topic]
  Example: !guide starter, !guide combat, !guide shop
*/

import fs from "fs";
import path from "path";
import { getLanguage, getPlayerLanguage } from "../../database/rpg/languages.js";

const playersPath = path.join(process.cwd(), "WhatsApp", "database", "rpg", "players.json");

function loadPlayer(jid) {
  try {
    const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
    return data[jid] || null;
  } catch {
    return null;
  }
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "Guide",
  menu: ["guide"],
  case: ["guide", "tutorial", "help2"],
  description: "In-game guides and tutorials for all RPG features.",
  hidden: false,
  owner: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Guide Content ─────────────────────────────────────────

const guides = {

  // ── GUIDE MENU ──────────────────────────────────────────
  menu: (lang) => `╭─────────────────╮
📚 *GUIDE MENU*
╰─────────────────╯

${lang === "id" ? "Ketik *!guide <topik>* untuk membaca panduan." : "Type *!guide <topic>* to read a guide."}

📖 *${lang === "id" ? "Topik Tersedia" : "Available Topics"}:*

🌟 *!guide starter*
   ${lang === "id" ? "Panduan untuk pemula" : "Beginner's guide"}

⚔️ *!guide combat*
   ${lang === "id" ? "Sistem pertarungan (hunt & pvp)" : "Combat system (hunt & pvp)"}

📊 *!guide stats*
   ${lang === "id" ? "Penjelasan semua stat" : "All stats explained"}

🏪 *!guide shop*
   ${lang === "id" ? "Cara beli & jual item" : "How to buy & sell items"}

✨ *!guide skills*
   ${lang === "id" ? "Sistem skill & cara pakainya" : "Skill system & how to use them"}

🌲 *!guide gathering*
   ${lang === "id" ? "Memancing, menambang, menebang, meramu" : "Fishing, mining, chopping, foraging"}

🔨 *!guide crafting*
   ${lang === "id" ? "Cara membuat item" : "How to craft items"}

🗺️ *!guide travel*
   ${lang === "id" ? "Cara berpindah lokasi" : "How to travel between locations"}

💼 *!guide items*
   ${lang === "id" ? "Jenis item & cara pakainya" : "Item types & how to use them"}

🏰 *!guide dungeon*
   ${lang === "id" ? "Sistem dungeon & party" : "Dungeon & party system"}

⚔️ *!guide pvp*
   ${lang === "id" ? "Sistem PVP & tantangan" : "PVP & challenge system"}

📜 *!guide quests*
   ${lang === "id" ? "Sistem quest & reward" : "Quest system & rewards"}

🐾 *!guide pets*
   ${lang === "id" ? "Sistem pet & taming" : "Pet & taming system"}

━━━━━━━━━━━━━━━━━━━━`,

  // ── STARTER ─────────────────────────────────────────────
  starter: (lang) => lang === "id"
    ? `╭─────────────────╮
🌟 *PANDUAN PEMULA*
╰─────────────────╯

Selamat datang di *Evarick RPG!* Berikut langkah pertama yang harus kamu lakukan:

*1️⃣ Daftar dulu*
• Ketik *!rpg* untuk membuat karakter
• Pilih nama dan kelas karaktermu

*2️⃣ Lihat profil kamu*
• Ketik *!profile* untuk melihat stats
• Ketik *!bag* untuk melihat inventori

*3️⃣ Mulai bertarung*
• Ketik *!hunt* untuk berburu monster
• Saat bertarung, ketik: *attack / defend / skill / item / run / status*

*4️⃣ Kumpulkan gold & level up*
• Kalahkan monster → dapat EXP & gold
• Level up → dapat stat points (*!addstat*)

*5️⃣ Beli equipment*
• Ketik *!travel* untuk pindah ke lokasi dengan toko
• Ketik *!shop* untuk melihat barang yang dijual
• Ketik *!buy <item>* untuk membeli

*6️⃣ Explore dunia*
• Ketik *!location* untuk melihat lokasi sekarang
• Ketik *!travel <lokasi>* untuk berpindah

💡 *Tips:*
• Selalu beli *Health Potion* sebelum berburu
• Gunakan *!daily* setiap hari untuk reward gratis
• Cek *!leaderboard* untuk melihat ranking

📚 Panduan lain: *!guide combat*, *!guide shop*, *!guide stats*`
    : `╭─────────────────╮
🌟 *BEGINNER'S GUIDE*
╰─────────────────╯

Welcome to *Evarick RPG!* Here's what to do first:

*1️⃣ Register your character*
• Type *!rpg* to create your character
• Choose your name and class

*2️⃣ Check your profile*
• Type *!profile* to see your stats
• Type *!bag* to see your inventory

*3️⃣ Start fighting*
• Type *!hunt* to fight monsters
• During battle, type: *attack / defend / skill / item / run / status*

*4️⃣ Earn gold & level up*
• Defeat monsters → get EXP & gold
• Level up → get stat points (*!addstat*)

*5️⃣ Buy equipment*
• Type *!travel* to move to a location with a shop
• Type *!shop* to see available items
• Type *!buy <item>* to purchase

*6️⃣ Explore the world*
• Type *!location* to see your current location
• Type *!travel <location>* to move

💡 *Tips:*
• Always buy *Health Potions* before hunting
• Use *!daily* every day for free rewards
• Check *!leaderboard* to see the rankings

📚 More guides: *!guide combat*, *!guide shop*, *!guide stats*`,

  // ── COMBAT ──────────────────────────────────────────────
  combat: (lang) => lang === "id"
    ? `╭─────────────────╮
⚔️ *PANDUAN COMBAT*
╰─────────────────╯

*Cara Memulai Pertarungan:*
• Ketik *!hunt* untuk berburu monster di lokasi sekarang

*Perintah Saat Bertarung:*
(Tanpa prefix — langsung ketik saja)

⚔️ *attack* — Serang musuh dengan serangan biasa
🛡️ *defend* — Bertahan, naikkan SP (Shield Points)
✨ *skill 1/2/3* — Gunakan skill di slot 1, 2, atau 3
💼 *item <nama>* — Gunakan item dari inventori
🏃 *run* — Coba kabur (20-55% berhasil tergantung luck)
📊 *status* — Lihat HP, mana, dan kondisi pertarungan

*Shield Points (SP):*
• SP melindungi HP kamu dari serangan
• Gunakan *defend* untuk mengisi SP
• Jika SP habis → *SHIELD BREAK* → serangan berikutnya 3x damage!

*Status Effects:*
• 🔥 Burn — Damage per giliran (api)
• ☠️ Poison — Damage per giliran (racun)
• 😵 Stun — Skip giliran
• 🤐 Silence — Tidak bisa pakai skill

*Tips Combat:*
• Gunakan *defend* saat HP rendah untuk isi SP
• Simpan skill untuk musuh yang kuat
• Bawa *Health Potion* untuk darurat
• Cek *status* untuk melihat cooldown skill

📚 Panduan lain: *!guide skills*, *!guide items*, *!guide pvp*`
    : `╭─────────────────╮
⚔️ *COMBAT GUIDE*
╰─────────────────╯

*How to Start a Fight:*
• Type *!hunt* to fight monsters at your current location

*Commands During Battle:*
(No prefix — just type them directly)

⚔️ *attack* — Attack the enemy with a basic strike
🛡️ *defend* — Guard yourself, gain SP (Shield Points)
✨ *skill 1/2/3* — Use the skill in slot 1, 2, or 3
💼 *item <name>* — Use an item from your inventory
🏃 *run* — Try to escape (20-55% chance based on luck)
📊 *status* — View HP, mana, and battle status

*Shield Points (SP):*
• SP absorbs damage before your HP takes a hit
• Use *defend* to restore SP
• If SP hits 0 → *SHIELD BREAK* → next hit deals 3x damage!

*Status Effects:*
• 🔥 Burn — Damage per turn (fire)
• ☠️ Poison — Damage per turn (poison)
• 😵 Stun — Skip your turn
• 🤐 Silence — Can't use skills

*Combat Tips:*
• Use *defend* when HP is low to rebuild SP
• Save skills for tough enemies
• Carry *Health Potions* for emergencies
• Check *status* to see skill cooldowns

📚 More guides: *!guide skills*, *!guide items*, *!guide pvp*`,

  // ── STATS ───────────────────────────────────────────────
  stats: (lang) => lang === "id"
    ? `╭─────────────────╮
📊 *PANDUAN STATS*
╰─────────────────╯

*Stat Utama:*

❤️ *Max HP* — Total nyawa kamu
   Naik → lebih tahan lama di pertarungan

💙 *Max Mana* — Energi untuk skill
   Naik → bisa pakai skill lebih sering

⚔️ *Attack* — Kekuatan serangan fisik
   Naik → damage lebih besar

🛡️ *Defense* — Ketahanan terhadap serangan
   Naik → damage yang diterima lebih kecil

💨 *Agility* — Kecepatan & kemampuan menghindar
   Naik → dodge chance lebih tinggi, kabur lebih mudah

🍀 *Luck* — Keberuntungan
   Naik → critical hit lebih sering, drop item lebih bagus

*Cara Menaikkan Stat:*
• Setiap level up → dapat *1 stat point*
• Ketik *!addstat <stat>* untuk mengalokasikan
• Contoh: *!addstat attack*, *!addstat maxhp*

*Stat dari Equipment:*
• Weapon → bonus Attack
• Armor → bonus Defense & HP
• Accessory → bonus campuran

*Rekomendasi Build:*
⚔️ *Warrior* — Fokus Attack + MaxHP
🛡️ *Tank* — Fokus Defense + MaxHP
🔮 *Mage* — Fokus MaxMana + Attack
💨 *Rogue* — Fokus Agility + Luck

📚 Panduan lain: *!guide combat*, *!guide skills*`
    : `╭─────────────────╮
📊 *STATS GUIDE*
╰─────────────────╯

*Main Stats:*

❤️ *Max HP* — Your total health
   Higher → survive longer in battle

💙 *Max Mana* — Energy for skills
   Higher → use skills more often

⚔️ *Attack* — Physical attack power
   Higher → deal more damage

🛡️ *Defense* — Resistance to attacks
   Higher → take less damage

💨 *Agility* — Speed & dodge ability
   Higher → better dodge chance, easier to escape

🍀 *Luck* — Fortune
   Higher → more critical hits, better item drops

*How to Raise Stats:*
• Every level up → gain *1 stat point*
• Type *!addstat <stat>* to allocate it
• Example: *!addstat attack*, *!addstat maxhp*

*Stats from Equipment:*
• Weapon → Attack bonus
• Armor → Defense & HP bonus
• Accessory → Mixed bonuses

*Recommended Builds:*
⚔️ *Warrior* — Focus Attack + MaxHP
🛡️ *Tank* — Focus Defense + MaxHP
🔮 *Mage* — Focus MaxMana + Attack
💨 *Rogue* — Focus Agility + Luck

📚 More guides: *!guide combat*, *!guide skills*`,

  // ── SHOP ────────────────────────────────────────────────
  shop: (lang) => lang === "id"
    ? `╭─────────────────╮
🏪 *PANDUAN TOKO*
╰─────────────────╯

*Cara Menggunakan Toko:*

1️⃣ Pergi ke lokasi yang punya toko
   • Ketik *!location* untuk cek lokasi sekarang
   • Ketik *!travel* untuk pindah ke kota/desa

2️⃣ Lihat barang yang dijual
   • Ketik *!shop* untuk melihat semua item
   • Ketik *!shop <kategori>* untuk filter
   • Kategori: *weapons, armor, potions, utility, tools*

3️⃣ Beli item
   • Ketik *!buy <nama_item>* untuk membeli 1
   • Ketik *!buy <nama_item> <jumlah>* untuk beli banyak
   • Contoh: *!buy health_potion 5*

4️⃣ Jual item
   • Ketik *!sell <nama_item>* untuk menjual 1
   • Ketik *!sell <nama_item> <jumlah>* untuk jual banyak
   • Contoh: *!sell wolf_pelt 10*

*Item Penting untuk Dibeli:*
🧪 *health_potion* — Pulihkan HP saat bertarung
💙 *mana_potion* — Pulihkan mana saat bertarung
🎣 *fishing_rod* — Untuk memancing
⛏️ *pickaxe* — Untuk menambang
🪓 *axe* — Untuk menebang pohon

*Tips Toko:*
• Harga jual = 50% dari harga beli
• Stok toko terbatas, refresh setiap beberapa jam
• Lokasi berbeda punya item berbeda

📚 Panduan lain: *!guide items*, *!guide travel*`
    : `╭─────────────────╮
🏪 *SHOP GUIDE*
╰─────────────────╯

*How to Use the Shop:*

1️⃣ Go to a location that has a shop
   • Type *!location* to check where you are
   • Type *!travel* to move to a town/village

2️⃣ Browse available items
   • Type *!shop* to see all items
   • Type *!shop <category>* to filter
   • Categories: *weapons, armor, potions, utility, tools*

3️⃣ Buy items
   • Type *!buy <item_name>* to buy 1
   • Type *!buy <item_name> <amount>* to buy multiple
   • Example: *!buy health_potion 5*

4️⃣ Sell items
   • Type *!sell <item_name>* to sell 1
   • Type *!sell <item_name> <amount>* to sell multiple
   • Example: *!sell wolf_pelt 10*

*Important Items to Buy:*
🧪 *health_potion* — Restore HP during battle
💙 *mana_potion* — Restore mana during battle
🎣 *fishing_rod* — For fishing
⛏️ *pickaxe* — For mining
🪓 *axe* — For chopping wood

*Shop Tips:*
• Sell price = 50% of buy price
• Shop stock is limited, refreshes every few hours
• Different locations sell different items

📚 More guides: *!guide items*, *!guide travel*`,

  // ── SKILLS ──────────────────────────────────────────────
  skills: (lang) => lang === "id"
    ? `╭─────────────────╮
✨ *PANDUAN SKILL*
╰─────────────────╯

*Cara Mendapatkan Skill:*
• Beli *Skill Book* di toko atau dari drop monster
• Gunakan skill book: *!item <nama_skill_book>*
• Skill akan masuk ke daftar skill yang dipelajari

*Cara Memasang Skill:*
• Ketik *!myskills* untuk melihat semua skill yang dimiliki
• Ketik *!equipskill <skill_id> <slot>* untuk memasang
• Slot tersedia: *1, 2, 3*
• Contoh: *!equipskill fireball 1*

*Cara Pakai Skill Saat Bertarung:*
• Ketik *skill 1* untuk pakai skill di slot 1
• Ketik *skill 2* untuk pakai skill di slot 2
• Ketik *skill 3* untuk pakai skill di slot 3

*Jenis Skill:*
⚔️ *Physical* — Damage fisik, dipengaruhi Attack
🔮 *Magical* — Damage magic, lebih kuat vs armor rendah
💚 *Heal* — Pulihkan HP sendiri
🛡️ *Buff* — Tingkatkan stat sementara
☠️ *Debuff* — Lemahkan musuh (poison, burn, stun)

*Cooldown & Mana:*
• Setiap skill punya *cooldown* (giliran tunggu)
• Setiap skill butuh *mana* untuk dipakai
• Cek *status* saat bertarung untuk lihat cooldown

*Tips Skill:*
• Pasang skill yang sesuai dengan build kamu
• Skill heal berguna untuk pertarungan panjang
• Skill debuff bisa membalik keadaan

📚 Panduan lain: *!guide combat*, *!guide stats*`
    : `╭─────────────────╮
✨ *SKILLS GUIDE*
╰─────────────────╯

*How to Get Skills:*
• Buy *Skill Books* from shops or monster drops
• Use the skill book: *!item <skill_book_name>*
• The skill gets added to your learned skills list

*How to Equip Skills:*
• Type *!myskills* to see all your learned skills
• Type *!equipskill <skill_id> <slot>* to equip
• Available slots: *1, 2, 3*
• Example: *!equipskill fireball 1*

*How to Use Skills in Battle:*
• Type *skill 1* to use the skill in slot 1
• Type *skill 2* to use the skill in slot 2
• Type *skill 3* to use the skill in slot 3

*Skill Types:*
⚔️ *Physical* — Physical damage, scales with Attack
🔮 *Magical* — Magic damage, stronger vs low armor
💚 *Heal* — Restore your own HP
🛡️ *Buff* — Temporarily boost your stats
☠️ *Debuff* — Weaken the enemy (poison, burn, stun)

*Cooldown & Mana:*
• Every skill has a *cooldown* (turns to wait)
• Every skill costs *mana* to use
• Check *status* during battle to see cooldowns

*Skill Tips:*
• Equip skills that match your build
• Heal skills are great for long fights
• Debuff skills can turn the tide of battle

📚 More guides: *!guide combat*, *!guide stats*`,

  // ── GATHERING ───────────────────────────────────────────
  gathering: (lang) => lang === "id"
    ? `╭─────────────────╮
🌲 *PANDUAN GATHERING*
╰─────────────────╯

Gathering adalah cara mendapatkan material untuk crafting dan dijual.

*🎣 Memancing (Fishing)*
• Butuh: *!buy fishing_rod* dulu
• Pergi ke lokasi dengan air (danau, sungai, laut)
• Ketik *!fishing* untuk mulai
• Saat muncul prompt, ketik *reel* untuk menarik ikan
• Ikan bisa dijual atau dipakai untuk crafting

*⛏️ Menambang (Mining)*
• Butuh: *!buy pickaxe* dulu
• Pergi ke lokasi tambang atau gua
• Ketik *!mining* untuk mulai
• Saat muncul prompt, ketik *hit* untuk memukul batu
• Ore bisa dijual atau dipakai untuk crafting

*🪓 Menebang (Chopping)*
• Butuh: *!buy axe* dulu
• Pergi ke lokasi hutan
• Ketik *!chopping* untuk mulai
• Saat muncul prompt, ketik *swing* untuk menebang
• Kayu bisa dijual atau dipakai untuk crafting

*🍄 Meramu (Foraging)*
• Tidak butuh alat khusus
• Pergi ke lokasi hutan atau padang
• Ketik *!foraging* untuk mulai
• Pilih tanaman yang berbeda dari yang lain
• Herbal bisa dijual atau dipakai untuk crafting

*Tips Gathering:*
• Tool yang lebih baik = hasil lebih banyak
• Gathering tidak bisa dilakukan saat dalam pertarungan
• Hasil gathering bisa dilihat di *!bag*

📚 Panduan lain: *!guide crafting*, *!guide travel*`
    : `╭─────────────────╮
🌲 *GATHERING GUIDE*
╰─────────────────╯

Gathering is how you collect materials for crafting and selling.

*🎣 Fishing*
• Requires: buy a *fishing_rod* first (*!buy fishing_rod*)
• Go to a water location (lake, river, ocean)
• Type *!fishing* to start
• When prompted, type *reel* to pull in the fish
• Fish can be sold or used for crafting

*⛏️ Mining*
• Requires: buy a *pickaxe* first (*!buy pickaxe*)
• Go to a mine or cave location
• Type *!mining* to start
• When prompted, type *hit* to strike the rock
• Ores can be sold or used for crafting

*🪓 Chopping*
• Requires: buy an *axe* first (*!buy axe*)
• Go to a forest location
• Type *!chopping* to start
• When prompted, type *swing* to chop
• Wood can be sold or used for crafting

*🍄 Foraging*
• No special tool required
• Go to a forest or meadow location
• Type *!foraging* to start
• Pick the plant that looks different from the others
• Herbs can be sold or used for crafting

*Gathering Tips:*
• Better tools = more resources per session
• You can't gather while in a battle
• View gathered materials in *!bag*

📚 More guides: *!guide crafting*, *!guide travel*`,

  // ── CRAFTING ────────────────────────────────────────────
  crafting: (lang) => lang === "id"
    ? `╭─────────────────╮
🔨 *PANDUAN CRAFTING*
╰─────────────────╯

Crafting memungkinkan kamu membuat item dari material yang dikumpulkan.

*Cara Crafting:*
1. Kumpulkan material yang dibutuhkan (dari gathering atau drop)
2. Ketik *!craft* untuk melihat semua resep yang tersedia
3. Ketik *!craft <nama_item>* untuk membuat item
4. Contoh: *!craft iron_sword*

*Melihat Resep:*
• *!craft* — Lihat semua resep
• *!craft weapons* — Resep senjata
• *!craft armor* — Resep armor
• *!craft potions* — Resep potion
• *!craft materials* — Resep material olahan

*Material Umum:*
🪨 *iron_ore* → dilebur jadi *iron_bar*
🌲 *oak_log* → diproses jadi *oak_plank*
🐟 *fish* → dimasak jadi makanan
🌿 *herb* → diracik jadi potion

*Tips Crafting:*
• Item crafted biasanya lebih kuat dari yang dibeli di toko
• Beberapa resep butuh level tertentu
• Cek *!bag* untuk melihat material yang kamu punya
• Crafting tidak butuh lokasi khusus

📚 Panduan lain: *!guide gathering*, *!guide items*`
    : `╭─────────────────╮
🔨 *CRAFTING GUIDE*
╰─────────────────╯

Crafting lets you create items from gathered materials.

*How to Craft:*
1. Collect the required materials (from gathering or drops)
2. Type *!craft* to see all available recipes
3. Type *!craft <item_name>* to craft an item
4. Example: *!craft iron_sword*

*Viewing Recipes:*
• *!craft* — See all recipes
• *!craft weapons* — Weapon recipes
• *!craft armor* — Armor recipes
• *!craft potions* — Potion recipes
• *!craft materials* — Processed material recipes

*Common Materials:*
🪨 *iron_ore* → smelt into *iron_bar*
🌲 *oak_log* → process into *oak_plank*
🐟 *fish* → cook into food
🌿 *herb* → brew into potions

*Crafting Tips:*
• Crafted items are usually stronger than shop-bought ones
• Some recipes require a minimum level
• Check *!bag* to see what materials you have
• Crafting can be done anywhere

📚 More guides: *!guide gathering*, *!guide items*`,

  // ── TRAVEL ──────────────────────────────────────────────
  travel: (lang) => lang === "id"
    ? `╭─────────────────╮
🗺️ *PANDUAN TRAVEL*
╰─────────────────╯

*Cara Berpindah Lokasi:*
• Ketik *!location* untuk melihat lokasi sekarang
• Ketik *!travel* untuk melihat lokasi yang bisa dituju
• Ketik *!travel <nama_lokasi>* untuk berpindah
• Contoh: *!travel dark_forest*

*Syarat Travel:*
• Level kamu harus memenuhi syarat minimum lokasi
• Lokasi harus terhubung dengan lokasi sekarang
• Tidak bisa travel saat dalam pertarungan

*Jenis Lokasi:*
🏘️ *Safe Zone* — Tidak ada musuh, ada toko & penginapan
⚔️ *Combat Zone* — Ada musuh untuk di-hunt
⛏️ *Gathering Zone* — Kaya sumber daya
🏰 *Dungeon Entrance* — Pintu masuk dungeon

*Cara Cepat Berpindah:*
• 📜 *Teleport Scroll* — Langsung ke Starter Village
• 🌀 *Town Portal* — Langsung ke Starter Village
• 🌀 *Dungeon Portal Scroll* — Langsung ke dungeon acak

*Tips Travel:*
• Explore semua lokasi untuk unlock lebih banyak area
• Lokasi dengan level lebih tinggi = reward lebih besar
• Beberapa lokasi punya story encounter saat travel

📚 Panduan lain: *!guide starter*, *!guide gathering*`
    : `╭─────────────────╮
🗺️ *TRAVEL GUIDE*
╰─────────────────╯

*How to Move Between Locations:*
• Type *!location* to see your current location
• Type *!travel* to see reachable locations
• Type *!travel <location_name>* to move there
• Example: *!travel dark_forest*

*Travel Requirements:*
• Your level must meet the location's minimum
• The location must be connected to your current one
• You can't travel while in a battle

*Location Types:*
🏘️ *Safe Zone* — No enemies, has shops & inns
⚔️ *Combat Zone* — Has monsters to hunt
⛏️ *Gathering Zone* — Rich in resources
🏰 *Dungeon Entrance* — Entry point to dungeons

*Fast Travel Options:*
• 📜 *Teleport Scroll* — Instantly go to Starter Village
• 🌀 *Town Portal* — Instantly go to Starter Village
• 🌀 *Dungeon Portal Scroll* — Instantly go to a random dungeon

*Travel Tips:*
• Explore all locations to unlock more areas
• Higher-level locations = better rewards
• Some locations trigger story encounters while traveling

📚 More guides: *!guide starter*, *!guide gathering*`,

  // ── ITEMS ───────────────────────────────────────────────
  items: (lang) => lang === "id"
    ? `╭─────────────────╮
💼 *PANDUAN ITEM*
╰─────────────────╯

*Jenis Item:*

🧪 *Consumable* — Item sekali pakai
   • Potion, makanan, scroll
   • Pakai di luar combat: *!item <nama>*
   • Pakai saat combat: ketik *item <nama>*

⚔️ *Weapon* — Senjata yang bisa dipakai
   • Tingkatkan Attack
   • Pasang dengan: *!equip <nama>*

🛡️ *Armor* — Baju besi yang bisa dipakai
   • Tingkatkan Defense & HP
   • Slot: Head, chest, legs, boots
   • Pasang dengan: *!equip <nama>*

💍 *Accessory* — Aksesori
   • Bonus stat campuran
   • Pasang dengan: *!equip <nama>*

🌀 *Utility* — Item spesial
   • Teleport scroll, bag expansion, dll
   • Pakai dengan: *!item <nama>*

🪨 *Material* — Bahan crafting
   • Tidak bisa dipakai langsung
   • Digunakan untuk *!craft*

📜 *Skill Book* — Buku skill
   • Pelajari skill baru
   • Pakai dengan: *!item <nama_skill_book>*

*Cara Lihat Inventori:*
• *!bag* — Lihat semua item yang dimiliki
• *!bag combat* — Lihat item yang bisa dipakai saat combat

*Tips Item:*
• Item dengan *usableInBattle: true* bisa dipakai saat hunt/pvp
• Jual material yang tidak dibutuhkan untuk gold
• Equipment yang lebih tinggi tier-nya = stat lebih besar

📚 Panduan lain: *!guide shop*, *!guide crafting*`
    : `╭─────────────────╮
💼 *ITEMS GUIDE*
╰─────────────────╯

*Item Types:*

🧪 *Consumable* — Single-use items
   • Potions, food, scrolls
   • Use outside combat: *!item <name>*
   • Use during combat: type *item <name>*

⚔️ *Weapon* — Equippable weapons
   • Boosts Attack
   • Equip with: *!equip <name>*

🛡️ *Armor* — Equippable armor
   • Boosts Defense & HP
   • Slots: Head, chest, legs, boots
   • Equip with: *!equip <name>*

💍 *Accessory* — Accessories
   • Mixed stat bonuses
   • Equip with: *!equip <name>*

🌀 *Utility* — Special items
   • Teleport scrolls, bag expansions, etc.
   • Use with: *!item <name>*

🪨 *Material* — Crafting ingredients
   • Can't be used directly
   • Used for *!craft*

📜 *Skill Book* — Skill books
   • Learn new skills
   • Use with: *!item <skill_book_name>*

*How to View Inventory:*
• *!bag* — See all your items
• *!bag combat* — See items usable during combat

*Item Tips:*
• Items with *usableInBattle* can be used during hunt/pvp
• Sell unneeded materials for gold
• Higher tier equipment = bigger stat bonuses

📚 More guides: *!guide shop*, *!guide crafting*`,

  // ── DUNGEON ─────────────────────────────────────────────
  dungeon: (lang) => lang === "id"
    ? `╭─────────────────╮
🏰 *PANDUAN DUNGEON*
╰─────────────────╯

Dungeon adalah area khusus dengan musuh kuat dan reward besar. Bisa solo atau party!

*Cara Masuk Dungeon:*
1. Pergi ke lokasi *Dungeon Entrance*
   • Contoh: *Forgotten Crypt Entrance* (Level 10+)
   • Contoh: *Volcanic Rift Gate* (Level 20+)
   • Contoh: *Frozen Abyss Portal* (Level 30+)
2. Ketik *!dungeon* untuk melihat info dungeon
3. Ketik *!dungeon start* untuk masuk

*Sistem Party:*
• Buat party: *!party create*
• Undang teman: *!party invite @teman*
• Teman bergabung: *!party join <party_id>*
• Lihat party: *!party*
• Keluar party: *!party leave*

*Saat di Dalam Dungeon:*
• Perintah sama seperti hunt: *attack / defend / skill / item / run / status*
• Semua anggota party bertarung bersama
• Jika satu anggota mati, yang lain tetap bisa lanjut

*Reward Dungeon:*
• Gold & EXP lebih besar dari hunt biasa
• Item langka yang tidak ada di toko
• Boss drop equipment tier tinggi

*Tips Dungeon:*
• Bawa banyak potion sebelum masuk
• Koordinasi dengan party untuk skill
• Dungeon lebih mudah dengan party penuh

📚 Panduan lain: *!guide combat*, *!guide pvp*`
    : `╭─────────────────╮
🏰 *DUNGEON GUIDE*
╰─────────────────╯

Dungeons are special areas with tough enemies and big rewards. Go solo or with a party!

*How to Enter a Dungeon:*
1. Travel to a *Dungeon Entrance* location
   • Example: *Forgotten Crypt Entrance* (Level 10+)
   • Example: *Volcanic Rift Gate* (Level 20+)
   • Example: *Frozen Abyss Portal* (Level 30+)
2. Type *!dungeon* to see dungeon info
3. Type *!dungeon start* to enter

*Party System:*
• Create a party: *!party create*
• Invite a friend: *!party invite @friend*
• Friend joins: *!party join <party_id>*
• View party: *!party*
• Leave party: *!party leave*

*Inside the Dungeon:*
• Same commands as hunt: *attack / defend / skill / item / run / status*
• All party members fight together
• If one member dies, others can continue

*Dungeon Rewards:*
• More gold & EXP than regular hunting
• Rare items not found in shops
• Boss drops high-tier equipment

*Dungeon Tips:*
• Stock up on potions before entering
• Coordinate skills with your party
• Dungeons are easier with a full party

📚 More guides: *!guide combat*, *!guide pvp*`,

  // ── PVP ─────────────────────────────────────────────────
  pvp: (lang) => lang === "id"
    ? `╭─────────────────╮
⚔️ *PANDUAN PVP*
╰─────────────────╯

PVP memungkinkan kamu bertarung melawan pemain lain!

*Cara Menantang Pemain Lain:*
• Ketik *!challenge @pemain* untuk menantang
• Pemain yang ditantang harus ketik *!accept* untuk menerima
• Atau *!decline* untuk menolak

*Saat Bertarung PVP:*
• Perintah sama seperti hunt: *attack / defend / skill / item / run / status*
• Giliran bergantian antara dua pemain
• Pemain yang HP-nya habis duluan kalah

*Sistem Bounty:*
• Pemain dengan banyak kill bisa punya bounty
• Kalahkan pemain ber-bounty untuk dapat reward ekstra
• Ketik *!bounty* untuk melihat daftar bounty

*Aturan PVP:*
• Tidak ada penalti kematian saat PVP (tidak kehilangan level/stat)
• HP kamu setelah PVP sesuai kondisi saat pertarungan berakhir
• Tidak bisa menantang pemain yang sedang dalam pertarungan lain

*Tips PVP:*
• Pelajari skill musuh sebelum menantang
• Bawa item heal untuk pertarungan panjang
• Gunakan skill debuff untuk melemahkan lawan

📚 Panduan lain: *!guide combat*, *!guide skills*`
    : `╭─────────────────╮
⚔️ *PVP GUIDE*
╰─────────────────╯

PVP lets you fight against other players!

*How to Challenge Another Player:*
• Type *!challenge @player* to challenge them
• The challenged player types *!accept* to accept
• Or *!decline* to refuse

*During PVP Battle:*
• Same commands as hunt: *attack / defend / skill / item / run / status*
• Turns alternate between the two players
• The first player to reach 0 HP loses

*Bounty System:*
• Players with many kills can have a bounty on their head
• Defeat a bounty player for extra rewards
• Type *!bounty* to see the bounty list

*PVP Rules:*
• No death penalty in PVP (no level/stat loss)
• Your HP after PVP reflects your condition when the fight ended
• You can't challenge a player who is already in a battle

*PVP Tips:*
• Learn your opponent's skills before challenging
• Bring healing items for long fights
• Use debuff skills to weaken your opponent

📚 More guides: *!guide combat*, *!guide skills*`,

  // ── QUESTS ──────────────────────────────────────────────
  quests: (lang) => lang === "id"
    ? `╭─────────────────╮
📜 *PANDUAN QUEST*
╰─────────────────╯

Quest memberikan reward ekstra untuk aktivitas yang kamu lakukan sehari-hari!

*Jenis Quest:*
📅 *Daily Quest* — Reset setiap hari
📆 *Weekly Quest* — Reset setiap minggu
🗓️ *Monthly Quest* — Reset setiap bulan

*Cara Melihat Quest:*
• Ketik *!quest* untuk melihat semua quest aktif
• Ketik *!quest daily* untuk quest harian
• Ketik *!quest weekly* untuk quest mingguan
• Ketik *!quest monthly* untuk quest bulanan

*Cara Klaim Reward:*
• Selesaikan target quest (otomatis terlacak)
• Ketik *!claim daily* untuk klaim reward harian
• Ketik *!claim weekly* untuk klaim reward mingguan
• Ketik *!claim monthly* untuk klaim reward bulanan

*Contoh Quest:*
• Kalahkan 5 monster → Gold + EXP
• Kumpulkan 500 gold → Item reward
• Travel ke 3 lokasi → Teleport Scroll
• Craft 5 item → Gold + EXP

*Tips Quest:*
• Klaim quest setiap hari untuk reward gratis
• Quest harian bisa diselesaikan sambil aktivitas biasa
• Reward quest lebih besar dari grinding biasa

📚 Panduan lain: *!guide starter*, *!guide combat*`
    : `╭─────────────────╮
📜 *QUESTS GUIDE*
╰─────────────────╯

Quests give you extra rewards for your everyday activities!

*Quest Types:*
📅 *Daily Quest* — Resets every day
📆 *Weekly Quest* — Resets every week
🗓️ *Monthly Quest* — Resets every month

*How to View Quests:*
• Type *!quest* to see all active quests
• Type *!quest daily* for daily quests
• Type *!quest weekly* for weekly quests
• Type *!quest monthly* for monthly quests

*How to Claim Rewards:*
• Complete the quest target (tracked automatically)
• Type *!claim daily* to claim daily rewards
• Type *!claim weekly* to claim weekly rewards
• Type *!claim monthly* to claim monthly rewards

*Example Quests:*
• Defeat 5 monsters → Gold + EXP
• Earn 500 gold → Item reward
• Travel to 3 locations → Teleport Scroll
• Craft 5 items → Gold + EXP

*Quest Tips:*
• Claim quests every day for free rewards
• Daily quests complete naturally through normal play
• Quest rewards are better than regular grinding

📚 More guides: *!guide starter*, *!guide combat*`,

  // ── PETS ────────────────────────────────────────────────
  pets: (lang) => lang === "id"
    ? `╭─────────────────╮
🐾 *PANDUAN PET*
╰─────────────────╯

Pet adalah teman setia yang memberikan bonus stat dan kemampuan pasif!

*Cara Mendapatkan Pet:*
• Gunakan *!searching* di lokasi yang sesuai
• Ikuti mini-game taming (masukkan urutan emoji yang benar)
• Berhasil → pet tertangkap dan masuk ke koleksi

*Cara Mengelola Pet:*
• *!mypets* — Lihat semua pet yang dimiliki
• *!petinfo <nama_pet>* — Detail info pet
• *!activatepet <nama_pet>* — Aktifkan pet (bonus stat aktif)
• *!deactivatepet* — Nonaktifkan pet aktif

*Bonus dari Pet:*
• Setiap pet punya bonus stat unik
• Contoh: Wolf → +Attack, Turtle → +Defense
• Bonus aktif saat pet di-activate

*Skill Pet:*
• Beberapa pet punya skill khusus
• Gunakan *!petskill* saat bertarung untuk pakai skill pet
• Skill pet punya cooldown tersendiri

*Tips Pet:*
• Pilih pet yang sesuai dengan build kamu
• Pet langka punya bonus lebih besar
• Beberapa pet hanya bisa ditemukan di lokasi tertentu

📚 Panduan lain: *!guide combat*, *!guide travel*`
    : `╭─────────────────╮
🐾 *PETS GUIDE*
╰─────────────────╯

Pets are loyal companions that give you stat bonuses and passive abilities!

*How to Get Pets:*
• Use *!searching* at a suitable location
• Complete the taming mini-game (enter the correct emoji sequence)
• Success → pet is captured and added to your collection

*How to Manage Pets:*
• *!mypets* — See all your pets
• *!petinfo <pet_name>* — Detailed pet info
• *!activatepet <pet_name>* — Activate a pet (stat bonus becomes active)
• *!deactivatepet* — Deactivate your current pet

*Pet Bonuses:*
• Each pet has unique stat bonuses
• Example: Wolf → +Attack, Turtle → +Defense
• Bonuses are active when the pet is activated

*Pet Skills:*
• Some pets have special skills
• Use *!petskill* during battle to use your pet's skill
• Pet skills have their own cooldown

*Pet Tips:*
• Choose a pet that matches your build
• Rare pets have bigger bonuses
• Some pets can only be found in specific locations

📚 More guides: *!guide combat*, *!guide travel*`,

};

// ── Handler ──────────────────────────────────────────────

export default async function handler(leni) {
  const { lenwy, normalizedSender, LenwyText, args } = leni;

  // Block bot
  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  // Detect player language
  const player = loadPlayer(normalizedSender);
  const langCode = player?.language || "id";
  const lang = langCode === "en" ? "en" : "id";

  const topic = args[0]?.toLowerCase();

  // No topic → show guide menu
  if (!topic) {
    return LenwyText(guides.menu(lang));
  }

  // Match topic to guide
  const topicMap = {
    starter:   guides.starter,
    start:     guides.starter,
    pemula:    guides.starter,
    combat:    guides.combat,
    battle:    guides.combat,
    bertarung: guides.combat,
    stats:     guides.stats,
    stat:      guides.stats,
    shop:      guides.shop,
    toko:      guides.shop,
    beli:      guides.shop,
    skills:    guides.skills,
    skill:     guides.skills,
    gathering: guides.gathering,
    gather:    guides.gathering,
    farming:   guides.gathering,
    crafting:  guides.crafting,
    craft:     guides.crafting,
    travel:    guides.travel,
    jalan:     guides.travel,
    pindah:    guides.travel,
    items:     guides.items,
    item:      guides.items,
    dungeon:   guides.dungeon,
    pvp:       guides.pvp,
    challenge: guides.pvp,
    quests:    guides.quests,
    quest:     guides.quests,
    daily:     guides.quests,
    pets:      guides.pets,
    pet:       guides.pets,
  };

  const guideFunc = topicMap[topic];

  if (!guideFunc) {
    return LenwyText(
      lang === "id"
        ? `❓ *Topik "${topic}" tidak ditemukan.*\n\nKetik *!guide* untuk melihat semua topik yang tersedia.`
        : `❓ *Topic "${topic}" not found.*\n\nType *!guide* to see all available topics.`
    );
  }

  return LenwyText(guideFunc(lang));
}
