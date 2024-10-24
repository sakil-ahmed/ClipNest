import { app, globalShortcut, Menu, BrowserWindow, clipboard } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let previousClipboardContent = "";
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    },
    show: false
    // Start hidden
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (process.env.NODE_ENV === "development") {
    win == null ? void 0 : win.webContents.openDevTools();
  }
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  const monitorClipboard = () => {
    setInterval(() => {
      const currentContent = clipboard.readText();
      if (currentContent !== previousClipboardContent) {
        previousClipboardContent = currentContent;
        if (win) {
          win.webContents.send("clipboard-changed", currentContent);
        }
      }
    }, 100);
  };
  monitorClipboard();
  win.on("close", (event) => {
    event.preventDefault();
    win == null ? void 0 : win.hide();
  });
}
function toggleWindow() {
  if (win) {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  } else {
    createWindow();
  }
}
app.whenReady().then(() => {
  globalShortcut.register("CommandOrControl+.", toggleWindow);
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
