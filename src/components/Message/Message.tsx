import { useMemo } from "react";
import { deleteMessage, useChatroom, useProfile, useServer, useServerMember } from "../../services/databaseServices";
import { useAuth } from "../AuthProvider/AuthProvider";
import ContextMenu, { useContextMenu } from "../ContextMenu/ContextMenu";
"id, content, created_at, user_id, chatroom_id"
export default function Message({ id, content, createdAt, userId, chatroomId }:
    { id: string, content: string, createdAt: string, userId: string, chatroomId: string }
) {
    const { user } = useAuth();

    // message creator's profile
    const { value: profile, loading: loadingProfile } = useProfile(userId);
    const { value: chatroom } = useChatroom(chatroomId);
    const { value: server } = useServer(chatroom?.server_id);

    // auth user's server member
    const serverMemberQuery = useMemo(() => {
        return server && user ? { serverId: server.id, userId: user.id } : undefined;
    }, [server, user]);
    const { value: serverMember } = useServerMember(serverMemberQuery);

    const canDelete: boolean = (!!user && !!serverMember)
        && (userId === user.id || ['Administrator', 'Owner'].includes(serverMember.role));

    const handleDeleteMessage = () => {
        deleteMessage(id)
            .catch((err) => console.error(err.message));
    };

    const { contextMenuVisible, contextMenuPosition, handleOnContextMenu } = useContextMenu();

    return (
    <div className="message" onContextMenu={handleOnContextMenu}>
        <div className="top">
            <p className="name">{loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            <p className="date">{new Date(createdAt).toLocaleString()}</p>
        </div>

        <p className="content">{content}</p>

        <ContextMenu
            visible={contextMenuVisible}
            position={contextMenuPosition}
            actions={[
                { label: "Copy text", action: () => navigator.clipboard.writeText(content) },
                { label: "Copy id", action: () => navigator.clipboard.writeText(id) },
                { label: "Copy user id", action: () => navigator.clipboard.writeText(userId) },
                ...(canDelete ? [{ label: "Delete", action: handleDeleteMessage }] : []),
            ]}
        />
    </div>
    );
}