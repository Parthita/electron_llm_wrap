const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  switchService: (key) => ipcRenderer.send('switch-service', key),
  reload: () => ipcRenderer.send('reload-service'),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  toggleSidebar: () => ipcRenderer.send('toggle-sidebar'),
  devtools: () => ipcRenderer.send('toggle-devtools'),
  toggleShortcuts: () => ipcRenderer.send('toggle-shortcuts'),
  onServiceChanged: (cb) => ipcRenderer.on('service-changed', (_, key) => cb(key)),
  onSidebarToggled: (cb) => ipcRenderer.on('sidebar-toggled', (_, visible) => cb(visible)),
  onShortcutsToggled: (cb) => ipcRenderer.on('shortcuts-toggled', (_, visible) => cb(visible)),
});
