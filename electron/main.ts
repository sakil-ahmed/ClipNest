// import {app, BrowserWindow, clipboard, globalShortcut , Menu} from 'electron'
// // import { createRequire } from 'node:module'
// import {fileURLToPath} from 'node:url'
// import path from 'node:path'
//
// // const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url))
//
//
// process.env.APP_ROOT = path.join(__dirname, '..')
//
// // 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
// export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
// export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
//
// process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
//
// let win: BrowserWindow | null
// let previousClipboardContent = '';
//
// function createWindow() {
//     win = new BrowserWindow({
//         icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.mjs'),
//         },
//     })
//     // Test active push message to Renderer-process.
//     win.webContents.on('did-finish-load', () => {
//         win?.webContents.send('main-process-message', (new Date).toLocaleString())
//     })
//
//     // Open DevTools if in development modeX
//     if (process.env.NODE_ENV === 'development') {
//         win?.webContents.openDevTools();
//     }
//
//     if (VITE_DEV_SERVER_URL) {
//         win.loadURL(VITE_DEV_SERVER_URL)
//     } else {
//         // win.loadFile('dist/index.html')
//         win.loadFile(path.join(RENDERER_DIST, 'index.html'))
//     }
//
//
// //   Add All Clipboard Action Here
//
//     // Set up a function to monitor clipboard
//     const monitorClipboard = () => {
//         setInterval(() => {
//             const currentContent = clipboard.readText();
//
//             // Check if clipboard content has changed
//             if (currentContent !== previousClipboardContent) {
//                 previousClipboardContent = currentContent;
//
//                 // Send the new clipboard content to the renderer process
//                 if (win) {
//                     win.webContents.send('clipboard-changed', currentContent);
//                 }
//             }
//         }, 1);
//     };
//
//     monitorClipboard();
//
//
// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
//     app.on('window-all-closed', () => {
//         if (process.platform !== 'darwin') {
//             app.quit()
//             win = null
//         }
//     })
//
//     app.on('activate', () => {
//         // On OS X it's common to re-create a window in the app when the
//         // dock icon is clicked and there are no other windows open.
//         if (BrowserWindow.getAllWindows().length === 0) {
//             createWindow()
//             Menu.setApplicationMenu(null);
//         }
//     })
// }
//
// app.whenReady().then(() => {
//     // createWindow()
//     globalShortcut.register('CommandOrControl+.', () => {
//         console.log('CommandOrControl+. is pressed')
//         createWindow()
//         Menu.setApplicationMenu(null);
//     })
// })





import { app, BrowserWindow, clipboard, globalShortcut, Menu } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;
let previousClipboardContent = '';

// Create the window function
function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
        show: false, // Start hidden
    });

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date()).toLocaleString());
    });

    // Open DevTools if in development mode
    if (process.env.NODE_ENV === 'development') {
        win?.webContents.openDevTools();
    }

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }

    // Set up a function to monitor clipboard
    const monitorClipboard = () => {
        setInterval(() => {
            const currentContent = clipboard.readText();

            // Check if clipboard content has changed
            if (currentContent !== previousClipboardContent) {
                previousClipboardContent = currentContent;

                // Send the new clipboard content to the renderer process
                if (win) {
                    win.webContents.send('clipboard-changed', currentContent);
                }
            }
        }, 100); // Check every 100 milliseconds
    };

    monitorClipboard();

    // Handle window close event
    win.on('close', (event) => {
        event.preventDefault(); // Prevent the window from closing
        win?.hide(); // Hide the window instead
    });
}

// Function to toggle window visibility
function toggleWindow() {
    if (win) {
        if (win.isVisible()) {
            win.hide(); // Hide the window
        } else {
            win.show(); // Show the window
            win.focus(); // Bring the window to focus
        }
    } else {
        createWindow(); // Create the window if it doesn't exist
    }
}

// App ready event
app.whenReady().then(() => {
    // Register global shortcut for CommandOrControl + .
    globalShortcut.register('CommandOrControl+.', toggleWindow);

    // Set application menu to null
    Menu.setApplicationMenu(null);

    // Create the initial window
    createWindow();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

// Re-create a window when the app is activated
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Clean up when the app is closed
app.on('will-quit', () => {
    globalShortcut.unregisterAll(); // Unregister all shortcuts
});
