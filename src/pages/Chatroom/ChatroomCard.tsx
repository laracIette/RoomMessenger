import { Link } from "react-router-dom";
import { useChatroom, useProfile } from "../../services/databaseServices";

interface ChatroomCardArgs {
    id: string;
}

export default function ChatroomCard(args: ChatroomCardArgs) {
    const { value: chatroom, loading } = useChatroom(args.id);

    const { value: profile, loading: loadingProfile } = useProfile(chatroom?.user_id);

    return (
    <>
        {loading ? (
        <p>Loading chatroom...</p>
        ) : (
        !chatroom ? (
        <p>Invalid chatroom</p>
        ) : (
        <Link to={`/chatroom/${chatroom.id}`}>
            <p>{chatroom.name}</p>
            <p>Created on {new Date(chatroom.created_at).toLocaleString()}</p>
            <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            <p>{chatroom.is_closed ? "Closed" : "Open"}</p>
            <p>{chatroom.visibility}</p>
        </Link>
        )
        )}
    </>
    );
}