export default function ContextMenu({ actions, visible, position }: {
    visible: boolean,
    position: { x: number, y: number }
    actions: Array<{ label: string, action: () => void }>
}) {
    if (!visible)
    {
        return <></>;
    }

    return (
    <div className="context-menu"
        style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
        }}
    >
        {actions.map(({ label, action }) =>
        <button key={label} className="option" onClick={action}>{label}</button>
        )}
    </div>
    );
}