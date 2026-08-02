import { Link } from "react-router-dom";
import { deleteChatroom, updateChatroom, useProfile, useServer, useServerMember } from "../../services/databaseServices";
import { useMemo } from "react";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import ContextMenu, { useContextMenu } from "../../components/ContextMenu/ContextMenu";

export default function ChatroomCard({ id, name, createdAt, userId, isClosed, visibility, serverId }:
    { id: string, name: string, createdAt: string, userId: string, isClosed: boolean, visibility: string, serverId: string }
) {
    const { user } = useAuth();

    // chatroom creator's profile
    const { value: profile, loading: loadingProfile } = useProfile(userId);
    const { value: server } = useServer(serverId);

    // auth user's server member
    const serverMemberQuery = useMemo(() => {
        return server && user ? { serverId: server.id, userId: user.id } : undefined;
    }, [server, user]);
    const { value: serverMember } = useServerMember(serverMemberQuery);

    const hasRights: boolean = (!!user && !!serverMember)
        && (userId === user.id || ['Administrator', 'Owner'].includes(serverMember.role));

    const handleDeleteChatroom = () => {
        deleteChatroom(id)
            .catch((err) => console.error(err.message));
    };

    const handleOpenChatroom = () => {
        updateChatroom(id, { is_closed: false })
            .catch((err) => console.error(err.message));
    }

    const handleCloseChatroom = () => {
        updateChatroom(id, { is_closed: true })
            .catch((err) => console.error(err.message));
    }

    const { contextMenuVisible, contextMenuPosition, handleOnContextMenu } = useContextMenu();

    return (
    <div className="chatroom card" onContextMenu={handleOnContextMenu}>
        <Link to={`/chatroom/${id}`}>
            <div className="top">
                <p>{name}</p>
                <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            </div>
            <div className="bottom">
                <p>{isClosed ? "Closed" : "Open"}</p>
                <p>{visibility}</p>
            </div>
        </Link>

        <ContextMenu
            visible={contextMenuVisible}
            position={contextMenuPosition}
            actions={[
                { label: "Copy id", action: () => navigator.clipboard.writeText(id) },
                { label: "Copy user id", action: () => navigator.clipboard.writeText(userId) },
                ...(hasRights ? [
                    { label: "Delete", action: handleDeleteChatroom },
                    isClosed
                        ? { label: "Open", action: handleOpenChatroom }
                        : { label: "Close", action: handleCloseChatroom },
                ] : []),
            ]}
        />
    </div>
    );
}