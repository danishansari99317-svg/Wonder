import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, disableNetwork, enableNetwork } from "firebase/firestore";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

const DATA_FILE = path.join(process.cwd(), "store_backend.json");

import { 
  INITIAL_SUB_ADMIN_KEYS, 
  INITIAL_CATEGORIES, 
  INITIAL_ITEMS, 
  INITIAL_LEADERBOARD, 
  INITIAL_STAFF, 
  STORE_CONFIG, 
  INITIAL_COUPONS, 
  INITIAL_ACTIVITY_LOGS, 
  INITIAL_UPDATES,
  INITIAL_VOTE_LINKS,
  INITIAL_CONNECTION_GUIDE,
  INITIAL_RULES_CATEGORIES
} from "./src/data/storeData";

// Initialize Firebase SDK
const firebaseConfig = {
  projectId: "persuasive-photon-rz37z",
  appId: "1:109054142759:web:eabc4bb362459e831a2102",
  apiKey: "AIzaSyAi5eBWICuH9FCpwPzUw_xCo19xsRb0Jl0",
  authDomain: "persuasive-photon-rz37z.firebaseapp.com",
  storageBucket: "persuasive-photon-rz37z.firebasestorage.app",
  messagingSenderId: "109054142759",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, "ai-studio-minetaxwebstore-ca3394d8-070c-45e6-b1e8-cda0613cfa98");

// Default initial state across all website modules
const DEFAULT_STATE = {
  subAdminKeys: INITIAL_SUB_ADMIN_KEYS,
  items: INITIAL_ITEMS,
  categories: INITIAL_CATEGORIES,
  leaderboard: INITIAL_LEADERBOARD,
  staffList: INITIAL_STAFF,
  couponsList: INITIAL_COUPONS,
  activityLogs: INITIAL_ACTIVITY_LOGS,
  updatesList: INITIAL_UPDATES,
  voteLinks: [],
  tickets: [],
  config: STORE_CONFIG,
  saleConfig: STORE_CONFIG.sale,
  connectionGuide: INITIAL_CONNECTION_GUIDE,
  rulesCategories: INITIAL_RULES_CATEGORIES,
};

const QUOTA_STATUS_FILE = path.join(process.cwd(), ".firestore_quota.json");

// Firestore write quota circuit breaker: if daily free write quota is exhausted, back off and persist to local storage
let firestoreWriteBlockedUntil = 0;

try {
  if (fs.existsSync(QUOTA_STATUS_FILE)) {
    const raw = fs.readFileSync(QUOTA_STATUS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.blockedUntil && Date.now() < parsed.blockedUntil) {
      firestoreWriteBlockedUntil = parsed.blockedUntil;
      console.warn(`[Firestore] Daily write quota is exhausted. Network writes disabled until ${new Date(firestoreWriteBlockedUntil).toISOString()}. Serving from persistent local database.`);
      disableNetwork(db).catch(() => {});
    }
  }
} catch (e) {
  // Ignore quota read error
}

function recordQuotaExhaustion() {
  // Free daily quota resets at midnight Pacific / every 24h
  firestoreWriteBlockedUntil = Date.now() + 12 * 60 * 60 * 1000;
  try {
    fs.writeFileSync(QUOTA_STATUS_FILE, JSON.stringify({ blockedUntil: firestoreWriteBlockedUntil }), "utf-8");
  } catch (e) {}
  try {
    disableNetwork(db).catch(() => {});
  } catch (e) {}
  console.warn("[Firestore] Daily free write quota reached. Switched seamlessly to persistent local disk database.");
}

function isQuotaExhaustedError(err: any): boolean {
  if (!err) return false;
  const msg = `${err.message || ""} ${err.code || ""} ${err.details || ""}`;
  return (
    err.code === "resource-exhausted" ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("Quota exceeded")
  );
}

// Memory cache to serve rapid read requests instantly and reliably
let memoryCache: any = null;
let cacheTime = 0;
const CACHE_TTL_MS = 20000; // 20 seconds cache for instant response + preventing quota thrashing

function readLocalBackup(): any {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Local JSON fallback loading error:", err);
  }
  return null;
}

async function loadStoreData(forceFresh = false): Promise<any> {
  const now = Date.now();
  if (!forceFresh && memoryCache && (now - cacheTime < CACHE_TTL_MS)) {
    return memoryCache;
  }

  const localData = readLocalBackup();

  // If Firestore writes are currently blocked due to quota exhaustion, prefer local backup which contains latest edits
  if (now < firestoreWriteBlockedUntil && localData) {
    const merged = { ...DEFAULT_STATE, ...localData };
    memoryCache = merged;
    cacheTime = now;
    return merged;
  }

  // 1. Try reading from Firebase Firestore with 3s timeout
  try {
    const docRef = doc(db, "store", "global_state");
    const readPromise = getDoc(docRef);
    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore read timeout")), 3000)
    );
    const snap = await Promise.race([readPromise, timeoutPromise]);
    if (snap && snap.exists()) {
      const remoteData = snap.data();
      // If local backup has a more recent update timestamp than remote (e.g. while quota was exhausted), prefer local
      if (localData && (localData._lastUpdated || 0) > (remoteData._lastUpdated || 0)) {
        const merged = { ...DEFAULT_STATE, ...remoteData, ...localData };
        memoryCache = merged;
        cacheTime = now;
        return merged;
      }
      const merged = { ...DEFAULT_STATE, ...remoteData };
      memoryCache = merged;
      cacheTime = now;
      return merged;
    }
  } catch (err: any) {
    if (isQuotaExhaustedError(err)) {
      recordQuotaExhaustion();
    } else if (err.message === "Firestore read timeout") {
      console.warn("[Firestore] Read timeout. Serving from local database.");
    } else {
      console.error("Firestore loading error:", err);
    }
  }

  // 2. Use local filesystem cache as a robust fallback
  if (localData) {
    const merged = { ...DEFAULT_STATE, ...localData };
    memoryCache = merged;
    cacheTime = now;
    return merged;
  }

  // 3. Fallback to default hardcoded configuration
  memoryCache = DEFAULT_STATE;
  cacheTime = now;
  return DEFAULT_STATE;
}

async function saveStoreData(data: any): Promise<void> {
  const enrichedData = {
    ...data,
    _lastUpdated: Date.now(),
  };

  memoryCache = enrichedData;
  cacheTime = Date.now();

  // 1. Immediately write backup to local disk synchronously (Guaranteed instant persistence)
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(enrichedData, null, 2), "utf-8");
  } catch (err) {
    console.error("Backup JSON writing error:", err);
  }

  // 2. If Firestore writes are currently blocked due to quota exhaustion, skip remote call
  if (Date.now() < firestoreWriteBlockedUntil) {
    return;
  }

  // 3. Asynchronously sync to Firestore in background with timeout so quota limits never block the API response
  (async () => {
    try {
      const docRef = doc(db, "store", "global_state");
      const writePromise = setDoc(docRef, enrichedData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firestore write timeout")), 3500)
      );
      await Promise.race([writePromise, timeoutPromise]);
    } catch (err: any) {
      if (isQuotaExhaustedError(err) || err.message === "Firestore write timeout") {
        recordQuotaExhaustion();
      } else {
        console.error("Firestore saving error:", err);
      }
    }
  })();
}

// GET API: fetch latest state persistently from Firestore
app.get("/api/state", async (req, res) => {
  try {
    const data = await loadStoreData();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Unknown error occurred while fetching state." });
  }
});

// Queue to prevent concurrent POST /api/state overwrites
let saveQueue = Promise.resolve();

// POST API: save partial or merged state persistently in Firestore
app.post("/api/state", (req, res) => {
  saveQueue = saveQueue
    .then(async () => {
      try {
        const incoming = req.body;
        const current = await loadStoreData(false);
        const merged = { ...current, ...incoming };
        await saveStoreData(merged);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.json({ success: true, data: merged });
      } catch (err: any) {
        if (!res.headersSent) {
          res.status(500).json({ error: err.message || "Failed to save data persistently to Firebase." });
        }
      }
    })
    .catch((err) => {
      console.error("Queue execution error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server queue error." });
      }
    });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
