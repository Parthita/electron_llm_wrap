const { app, BrowserWindow, BrowserView, ipcMain, session, Menu } = require('electron');
const path = require('path');

// Wayland support for Hyprland
app.commandLine.appendSwitch('ozone-platform', 'wayland');
app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform,WaylandWindowDecorations');
app.commandLine.appendSwitch('disable-gpu-sandbox');

// Performance flags
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

const SERVICES = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    color: '#10a37f',
  },
  claude: {
    name: 'Claude',
    url: 'https://claude.ai',
    color: '#d97706',
  },
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    color: '#4285f4',
  },
  deepseek: {
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    color: '#5b6ee1',
  },
};

let mainWindow;
let activeView = null;
let views = {};
let sidebarVisible = true;
const SIDEBAR_WIDTH = 56;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'AI Chat',
    backgroundColor: '#1a1a2e',
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  // Remove menu bar
  Menu.setApplicationMenu(null);

  // Set a proper user agent so sites don't block us
  const chromeVersion = process.versions.chrome;
  const userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

  // Create a BrowserView for each service
  for (const [key, svc] of Object.entries(SERVICES)) {
    const view = new BrowserView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        // Persist sessions so logins are saved
        partition: `persist:${key}`,
      },
    });

    view.webContents.setUserAgent(userAgent);
    view.webContents.loadURL(svc.url);

    // Open external links in default browser
    view.webContents.setWindowOpenHandler(({ url }) => {
      const { shell } = require('electron');
      // Allow same-origin popups (like Google login)
      const svcOrigin = new URL(svc.url).origin;
      const linkOrigin = new URL(url).origin;
      if (linkOrigin === svcOrigin) {
        return { action: 'allow' };
      }
      shell.openExternal(url);
      return { action: 'deny' };
    });

    views[key] = view;
  }

  // Switch to ChatGPT by default
  switchService('chatgpt');

  mainWindow.on('resize', () => layoutViews());
  mainWindow.on('maximize', () => layoutViews());
  mainWindow.on('unmaximize', () => layoutViews());
}

function layoutViews() {
  if (!activeView || !mainWindow) return;
  const [width, height] = mainWindow.getContentSize();
  const titleBarHeight = 38;
  const sidebarW = sidebarVisible ? SIDEBAR_WIDTH : 0;
  activeView.setBounds({
    x: sidebarW,
    y: titleBarHeight,
    width: width - sidebarW,
    height: height - titleBarHeight,
  });
}

function switchService(key) {
  if (!views[key]) return;

  // Remove current view
  if (activeView) {
    mainWindow.removeBrowserView(activeView);
  }

  activeView = views[key];
  mainWindow.addBrowserView(activeView);
  layoutViews();

  // Notify renderer which service is active
  mainWindow.webContents.send('service-changed', key);
}

// IPC handlers
ipcMain.on('switch-service', (_, key) => {
  switchService(key);
});

ipcMain.on('reload-service', () => {
  if (activeView) {
    activeView.webContents.reload();
  }
});

ipcMain.on('go-back', () => {
  if (activeView && activeView.webContents.canGoBack()) {
    activeView.webContents.goBack();
  }
});

ipcMain.on('go-forward', () => {
  if (activeView && activeView.webContents.canGoForward()) {
    activeView.webContents.goForward();
  }
});

ipcMain.on('toggle-sidebar', () => {
  sidebarVisible = !sidebarVisible;
  mainWindow.webContents.send('sidebar-toggled', sidebarVisible);
  layoutViews();
});

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

ipcMain.on('toggle-devtools', () => {
  if (activeView) {
    activeView.webContents.toggleDevTools();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
