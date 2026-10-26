/**
 * Accentuate — Lesson Log + Usage Tracking + Shared Voice Library
 *
 * Handles four kinds of events, routed to separate sheet tabs:
 *   1. Lesson log entries (ADR account downloads) — written to "Lesson Log"
 *   2. General usage entries (every account, every generation) — written to "Usage"
 *   3. Voice library saves — written to "Voice Library"
 *   4. Voice library removals — deletes the matching row from "Voice Library"
 *
 * doGet supports two modes:
 *   - default: returns all "Usage" rows as JSON (for the usage dashboard)
 *   - ?type=voices: returns all "Voice Library" rows as JSON (for the
 *     in-app voice library picker)
 *
 * SETUP (same sheet/project as before — no new deployment needed if you're
 * updating an existing one, just replace the code and re-deploy):
 * 1. Open your Google Sheet, Extensions → Apps Script
 * 2. Replace everything with this file, Save
 * 3. Deploy → Manage deployments → edit the existing deployment → New version → Deploy
 *    (or Deploy → New deployment if this is the first time)
 *    - Type: Web app, Execute as: Me, Who has access: Anyone
 * 4. Copy the Web App URL — same CONFIG.LESSON_LOG_SCRIPT_URL slot in Accentuate,
 *    and the same URL is what the dashboard site and voice library fetch from.
 */

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === "save_voice") {
    const sheet = getSheet("Voice Library");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Voice ID", "Name", "Added By", "Added At", "Language", "Category"]);
    }
    sheet.appendRow([
      data.voiceId || "",
      data.name || "",
      data.addedBy || "",
      data.loggedAt || new Date().toISOString(),
      data.language || "",
      data.category || "",
    ]);
  } else if (data.action === "remove_voice") {
    const sheet = getSheet("Voice Library");
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.voiceId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } else if (data.characters !== undefined || data.email !== undefined) {
    // General usage event — every account, every feature
    const sheet = getSheet("Usage");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Logged At", "Email", "Feature", "Characters", "Seconds"]);
    }
    sheet.appendRow([
      data.loggedAt || new Date().toISOString(),
      data.email || "",
      data.mode || "",
      data.characters || 0,
      data.seconds || 0,
    ]);
  } else {
    // Lesson log entry — ADR account downloads
    const sheet = getSheet("Lesson Log");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Logged At", "Feature", "Lesson Code", "Timestamp", "Filename"]);
    }
    sheet.appendRow([
      data.loggedAt || new Date().toISOString(),
      data.mode || "",
      data.lessonCode || "",
      data.timestamp || "",
      data.filename || "",
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns rows as JSON. Default: "Usage" sheet (for the usage dashboard).
// ?type=voices: "Voice Library" sheet (for the in-app voice picker).
function doGet(e) {
  const wantsVoices = e && e.parameter && e.parameter.type === "voices";
  const sheet = getSheet(wantsVoices ? "Voice Library" : "Usage");
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return ContentService
      .createTextOutput(JSON.stringify({ rows: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const rows = values.slice(1).map((row) => {
    const entry = {};
    headers.forEach((h, i) => { entry[h] = row[i]; });
    return entry;
  });

  return ContentService
    .createTextOutput(JSON.stringify({ rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
