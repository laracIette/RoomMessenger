import { useMemo } from "react";
import { deleteMessage, useChatroom, useMessage, useProfile, useServer, useServerMember } from "../../services/databaseServices";
import { useAuth } from "../AuthProvider/AuthProvider";

export default function Message(args: { id: string }) {
    const { user } = useAuth();

    const { value: message, loading: loadingMessage } = useMessage(args.id);
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

    return (
    <>
        {loadingMessage ? (
        <p>Loading message...</p>
        ) : (
        !message ? (
        <p>Invalid message</p>
        ) : (
        <div className="message">
            <div className="top">
                <p className="name">{loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
                <p className="date">{new Date(message.created_at).toLocaleString()}</p>
            </div>
            <p className="content">{message.content}</p>
            {canDelete && <button onClick={handleDeleteMessage}>Delete</button>}
        </div>
        )
        )}
    </>
    );
}