import { Link } from "react-router-dom";
import { deleteChatroom, useChatroom, useProfile, useServer, useServerMember } from "../../services/databaseServices";
import { useMemo } from "react";
import { useAuth } from "../../components/AuthProvider/AuthProvider";

export default function ChatroomCard(args: { id: string }) {
    const { user } = useAuth();

    const { value: chatroom, loading: loadingChatroom } = useChatroom(args.id);
    // chatroom creator's profile
    const { value: profile, loading: loadingProfile } = useProfile(chatroom?.user_id);
    const { value: server } = useServer(chatroom?.server_id);

    const serverMemberQuery = useMemo(() => {
        return server && user ? { server_id: server.id, user_id: user.id } : undefined;
    }, [server, user]);
    // auth user's server member
    const { value: serverMember } = useServerMember(serverMemberQuery);

    const canDelete: boolean = (!!chatroom && !!user && !!serverMember)
        && (chatroom.user_id === user.id || ['Administrator', 'Owner'].includes(serverMember.role));

    const handleDeleteChatroom = () => {
        if (!chatroom) return;

        deleteChatroom(chatroom.id)
            .catch((err) => console.error(err.message));
    };

    return (
    <>
        {loadingChatroom ? (
        <p>Loading chatroom...</p>
        ) : (
        !chatroom ? (
        <p>Invalid chatroom</p>
        ) : (
        <div className="chatroom">
            <Link to={`/chatroom/${chatroom.id}`}>
                <p>{chatroom.name}</p>
                <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)} on {new Date(chatroom.created_at).toLocaleString()}</p>
                <p>{chatroom.is_closed ? "Closed" : "Open"}</p>
                <p>{chatroom.visibility}</p>
            </Link>
            {canDelete && <button onClick={handleDeleteChatroom}>Delete</button>}
        </div>
        )
        )}
    </>
    );
}