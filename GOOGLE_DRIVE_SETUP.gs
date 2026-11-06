// ============================================================================
// Y.O.K.E. GOOGLE DRIVE CLOUD STORAGE SCRIPT (Zero-Login for Dhanya!)
// ============================================================================
// How to connect your Google Drive in 2 minutes:
// 1. Open https://script.google.com and click "New Project".
// 2. Paste this entire code into Code.gs and click Save (💾).
// 3. Click "Deploy" (top right) -> "New deployment".
// 4. Select type: "Web app".
//    - Execute as: "Me" (your Google account)
//    - Who has access: "Anyone"
// 5. Click "Deploy", authorize access, and copy the "Web app URL" (starts with https://script.google.com/macros/s/...).
// 6. Paste that URL into `GDRIVE_CLOUD_URL` inside `config.js` (or as `GDRIVE_WEBHOOK_URL` in Vercel)!
//
// Every message Dhanya sends and every reply from Y.O.K.E. will automatically
// be saved inside a "YOKE_Dhanya_Chats" folder in your Google Drive!

const FOLDER_NAME = "YOKE_Dhanya_Chats";
const LOG_FILE_NAME = "Dhanya_Chat_History.json";
const READABLE_DOC_NAME = "Dhanya_Chat_Log.txt";

function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

// POST: Saves new chat messages from Dhanya & Y.O.K.E. to Google Drive
function doPost(e) {
  try {
    const folder = getOrCreateFolder();
    const payload = JSON.parse(e.postData.contents || "{}");
    const time = payload.timestamp || new Date().toISOString();
    const userMsg = payload.userMessage || "";
    const yokeReply = payload.yokeReply || "";

    // 1. Append to human-readable text file in Google Drive
    let txtFile;
    const txtFiles = folder.getFilesByName(READABLE_DOC_NAME);
    if (txtFiles.hasNext()) {
      txtFile = txtFiles.next();
      const prev = txtFile.getBlob().getDataAsString();
      txtFile.setContent(prev + `\n[${time}]\nDhanya: ${userMsg}\nY.O.K.E: ${yokeReply}\n----------------------------------------`);
    } else {
      folder.createFile(READABLE_DOC_NAME, `=== Y.O.K.E. CLOUD CHAT LOG ===\n[${time}]\nDhanya: ${userMsg}\nY.O.K.E: ${yokeReply}\n----------------------------------------`);
    }

    // 2. Save latest JSON history for cross-device restore
    if (Array.isArray(payload.fullHistory)) {
      const jsonFiles = folder.getFilesByName(LOG_FILE_NAME);
      const jsonContent = JSON.stringify({ updated: time, history: payload.fullHistory }, null, 2);
      if (jsonFiles.hasNext()) {
        jsonFiles.next().setContent(jsonContent);
      } else {
        folder.createFile(LOG_FILE_NAME, jsonContent, MimeType.PLAIN_TEXT);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET: Loads saved chat history from Google Drive when Dhanya opens the site on any device
function doGet(e) {
  try {
    const folder = getOrCreateFolder();
    const jsonFiles = folder.getFilesByName(LOG_FILE_NAME);
    if (!jsonFiles.hasNext()) {
      return ContentService.createTextOutput(JSON.stringify({ history: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const content = jsonFiles.next().getBlob().getDataAsString();
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ history: [], error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
