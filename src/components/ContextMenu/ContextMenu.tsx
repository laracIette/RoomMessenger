import { useEffect, useState } from "react";

export default function ContextMenu({ actions, visible, position }: {
    visible: boolean,
    position: { x: number, y: number },
    actions: Array<{ label: string, action: () => void }>,
}) {
    return (
    <>
        {visible &&
        <div className="context-menu"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
        >
            {actions.map(({ label, action }) =>
            <button key={label} className="option" onClick={action}>{label}</button>
            )}
        </div>}
    </>
    );
}

export function useContextMenu() {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    const handleOnContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();

        window.dispatchEvent(new Event('close-context-menu'));

        setContextMenuPosition({ x: e.pageX, y: e.pageY });
        setContextMenuVisible(true);
    }

    useEffect(() => {
        const closeContextMenu = () => setContextMenuVisible(false);

        window.addEventListener('click', closeContextMenu);
        window.addEventListener('contextmenu', closeContextMenu);
        window.addEventListener('close-context-menu', closeContextMenu);

        return () => {
            window.removeEventListener('click', closeContextMenu);
            window.removeEventListener('contextmenu', closeContextMenu);
            window.removeEventListener('close-context-menu', closeContextMenu);
        };
    }, []);

    return { contextMenuVisible, contextMenuPosition, handleOnContextMenu };
}
