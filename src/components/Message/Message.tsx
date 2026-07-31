import { useEffect, useMemo, useState } from "react";
import { deleteMessage, useChatroom, useMessage, useProfile, useServer, useServerMember } from "../../services/databaseServices";
import { useAuth } from "../AuthProvider/AuthProvider";
import ContextMenu from "../ContextMenu/ContextMenu";

export default function Message({ id }: { id: string }) {
    const { user } = useAuth();

    const { value: message, loading: loadingMessage } = useMessage(id);
    // message creator's profile
    const { value: profile, loading: loadingProfile } = useProfile(message?.user_id);
    const { value: chatroom } = useChatroom(message?.chatroom_id);
    const { value: server } = useServer(chatroom?.server_id);

    const serverMemberQuery = useMemo(() => {
        return server && user ? { server_id: server.id, user_id: user.id } : undefined;
    }, [server, user]);
    // auth user's server member
    const { value: serverMember } = useServerMember(serverMemberQuery);

    const canDelete: boolean = (!!message && !!user && !!serverMember)
        && (message.user_id === user.id || ['Administrator', 'Owner'].includes(serverMember.role));

    const handleDeleteMessage = () => {
        if (!message) return;

        deleteMessage(message.id)
            .catch((err) => console.error(err.message));
    };

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

    return (
    <>
        {loadingMessage ? (
        <p>Loading message...</p>
        ) : (
        !message ? (
        <p>Invalid message</p>
        ) : (
        <div className="message" onContextMenu={handleOnContextMenu}>
            <div className="top">
                <p className="name">{loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
                <p className="date">{new Date(message.created_at).toLocaleString()}</p>
            </div>

            <p className="content">{message.content}</p>

            <ContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                actions={[
                    { label: "Copy text", action: () => navigator.clipboard.writeText(message.content) },
                    { label: "Copy id", action: () => navigator.clipboard.writeText(message.id) },
                    { label: "Copy user id", action: () => navigator.clipboard.writeText(message.user_id) },
                    ...(canDelete ? [{ label: "Delete", action: handleDeleteMessage }] : []),
                ]}
            />
        </div>
        )
        )}
    </>
    );
}