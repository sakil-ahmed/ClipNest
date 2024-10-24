import {useEffect, useState} from "react";

function App() {

    const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        window.ipcRenderer.on('clipboard-changed', (_event, data) => {
            setClipboardHistory(prevState => [...prevState, data])
        })

    }, []);


    // Handle keyboard navigation

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex(prevIndex => {
                if (prevIndex === null) return 0;
                return Math.min(prevIndex + 1, clipboardHistory.length - 1);
            });
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex(prevIndex => {
                if (prevIndex === null) return 0;
                return Math.max(prevIndex - 1, 0);
            });
        } else if (event.key === 'Enter') {
            if (selectedIndex !== null) {
                console.log(clipboardHistory[selectedIndex]);
                alert(`Copied: ${clipboardHistory[selectedIndex]}`);
            }
        }
    };
    // Attach keyboard event listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [clipboardHistory]);



    return (
        <>
            <div className={'app-container'}>

                <h2>Clipboard History</h2>
                <ul className={'clipboard-history-items'}>
                    {clipboardHistory.map((text, index) => (
                        <li tabIndex={index} className={'clipboard-history-item'} key={index}>{text}</li>
                    ))}
                </ul>
            </div>

        </>
    )
}

export default App
