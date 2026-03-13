# AI Chat

Lightweight Electron wrapper for ChatGPT, Claude, Gemini, and DeepSeek. Built for Arch Linux + Hyprland (Wayland native).

## Why

ChatGPT lags in Firefox and struggles with large chats. This runs each service in its own sandboxed BrowserView with persistent sessions, GPU rasterization, and no browser overhead.

## Services

- **ChatGPT** — chatgpt.com
- **Claude** — claude.ai
- **Gemini** — gemini.google.com
- **DeepSeek** — chat.deepseek.com

## Install

```bash
npm install
npx electron-builder --linux AppImage
cp "dist/AI Chat-1.0.0.AppImage" ~/.local/bin/ai-chat
chmod +x ~/.local/bin/ai-chat
```

## Run

```bash
# From source
npm start

# Installed
~/.local/bin/ai-chat
```

## Hyprland keybind

Add to `~/.config/hypr/hyprland/keybinds.conf`:

```
bind = SUPER SHIFT, x, exec, ~/.local/bin/ai-chat
```

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+1` | ChatGPT |
| `Ctrl+2` | Claude |
| `Ctrl+3` | Gemini |
| `Ctrl+4` | DeepSeek |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+R` | Reload |
| `F12` | DevTools |
| `Alt+Left/Right` | Navigate back/forward |
