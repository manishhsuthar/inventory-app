const { app, BrowserWindow } = require("electron");
const path = require("path");

// Disable Chromium sandbox (needed on some Linux setups)
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-setuid-sandbox");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon:path.join(__dirname, "../build/icons/512x512.png"),
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:8080"); // your dev port
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});