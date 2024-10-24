import { clipboard } from 'electron';

const clipboardHistory: string[] = [];

export function getClipboardText(): string {
    return clipboard.readText();
}

export function setClipboardText(text: string): void {
    clipboard.writeText(text);
    // Store the copied text in history
    clipboardHistory.push(text);
}

export function clearClipboard(): void {
    clipboard.writeText(''); // Clear the clipboard
}

export function resetClipboardHistory(): void {
    clipboardHistory.length = 0; // Clear the history array
}

export function getClipboardHistory(): string[] {
    return clipboardHistory;
}

export function watchClipboard(callback: (text: string) => void): NodeJS.Timeout {
    let lastClipboardText: string = '';

    return setInterval(() => {
        const currentText = getClipboardText();
        if (currentText !== lastClipboardText) {
            lastClipboardText = currentText;
            callback(currentText);
        }
    }, 1000); // Check every second
}
