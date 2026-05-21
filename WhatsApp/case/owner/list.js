// ============================================
// Evarick Bot - Proprietary Software
// Copyright (c) 2026 Evarick. All Rights Reserved.
// Unauthorized copying or distribution is strictly prohibited.
// See LICENSE file for full terms.
// ============================================

/*
  Commands : addlist, list
  Owner and Admin only

  Usage:
  - !addlist <name> note <anything>   → save a new list entry
  - !list                             → show all list entries (number + name)
  - !list <number>                    → show the note for that entry
  - !removelist <number>              → delete an entry
*/

import fs from "fs";
import path from "path";

const listsPath = path.join(process.cwd(), "WhatsApp", "database", "lists.json");

// ── Helpers ──────────────────────────────────────────────

function loadLists() {
  try {
    return JSON.parse(fs.readFileSync(listsPath, "utf8"));
  } catch {
    return [];
  }
}

function saveLists(lists) {
  fs.writeFileSync(listsPath, JSON.stringify(lists, null, 2), "utf8");
}

// ── Metadata ─────────────────────────────────────────────

export const info = {
  name: "List",
  menu: ["list"],
  case: ["addlist", "list", "removelist"],
  description: "Owner/Admin note list system.",
  hidden: true,
  owner: false,  // handled manually inside handler so admins can use it too
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  allowPrivate: true,
};

// ── Handler ──────────────────────────────────────────────

export default async function handler(leni) {
  const { command, q, lenwy, normalizedSender, LenwyText, isEvarick, isRpgAdmin } = leni;

  const botJid = lenwy.user?.id?.split(":")[0] + "@s.whatsapp.net";
  if (normalizedSender === botJid) return;

  // Owner or admin only
  if (!isEvarick && !isRpgAdmin) {
    return LenwyText("❌ This command is only available to the owner and admins.");
  }

  const lists = loadLists();

  // ════════════════════════════════════════
  // !addlist <name> note <anything>
  // ════════════════════════════════════════
  if (command === "addlist") {
    if (!q.trim()) {
      return LenwyText(
        `📋 *ADD LIST*\n\n` +
        `Usage: *!addlist <name> note <your note>*\n\n` +
        `Example:\n` +
        `!addlist Server Update note Maintenance scheduled for Sunday 10PM`
      );
    }

    // Split on " note " keyword
    const noteIndex = q.toLowerCase().indexOf(" note ");
    if (noteIndex === -1) {
      return LenwyText(
        `❌ *Missing "note" keyword.*\n\n` +
        `Usage: *!addlist <name> note <your note>*\n\n` +
        `Example:\n` +
        `!addlist Server Update note Maintenance scheduled for Sunday 10PM`
      );
    }

    const name = q.slice(0, noteIndex).trim();
    const note = q.slice(noteIndex + 6).trim();

    if (!name) return LenwyText(`❌ *Name cannot be empty.*`);
    if (!note) return LenwyText(`❌ *Note cannot be empty.*`);

    const entry = {
      id: lists.length + 1,
      name,
      note,
      createdAt: new Date().toISOString(),
      createdBy: normalizedSender.split("@")[0],
    };

    lists.push(entry);
    saveLists(lists);

    return LenwyText(
      `✅ *List added!*\n\n` +
      `📌 *#${entry.id} — ${entry.name}*\n` +
      `📝 ${entry.note}`
    );
  }

  // ════════════════════════════════════════
  // !removelist <number>
  // ════════════════════════════════════════
  if (command === "removelist") {
    const num = parseInt(q.trim());

    if (isNaN(num)) {
      return LenwyText(`❌ *Usage:* !removelist <number>\n\nExample: !removelist 3`);
    }

    const index = lists.findIndex(l => l.id === num);
    if (index === -1) {
      return LenwyText(`❌ *List #${num} not found.*\n\nType *!list* to see all entries.`);
    }

    const removed = lists.splice(index, 1)[0];
    saveLists(lists);

    return LenwyText(
      `🗑️ *List removed!*\n\n` +
      `Deleted: *#${removed.id} — ${removed.name}*`
    );
  }

  // ════════════════════════════════════════
  // !list          → show all entries
  // !list <number> → show specific note
  // ════════════════════════════════════════
  if (command === "list") {
    if (lists.length === 0) {
      return LenwyText(
        `📋 *Lists*\n\n` +
        `No entries yet.\n\n` +
        `Use *!addlist <name> note <note>* to add one.`
      );
    }

    // !list <number> — show specific entry
    const num = parseInt(q.trim());
    if (!isNaN(num)) {
      const entry = lists.find(l => l.id === num);
      if (!entry) {
        return LenwyText(`❌ *List #${num} not found.*\n\nType *!list* to see all entries.`);
      }

      const date = new Date(entry.createdAt).toLocaleDateString("en-GB");
      return LenwyText(
        `📌 *#${entry.id} — ${entry.name}*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 ${entry.note}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 By: ${entry.createdBy}\n` +
        `📅 ${date}`
      );
    }

    // !list — show all entries
    let msg = `📋 *Lists* (${lists.length})\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const entry of lists) {
      msg += `*${entry.id}.* ${entry.name}\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💡 Type *!list <number>* to see the note.`;

    return LenwyText(msg);
  }
}
