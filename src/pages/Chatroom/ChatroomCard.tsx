import { Link } from "react-router-dom";
import { deleteChatroom, useChatroom, useProfile } from "../../services/databaseServices";

interface ChatroomCardArgs {
    id: string;
}

export default function ChatroomCard(args: ChatroomCardArgs) {
    const { value: chatroom, loading: loadingChatroom } = useChatroom(args.id);
    const { value: profile, loading: loadingProfile } = useProfile(chatroom?.user_id);

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
        <div>
            <Link to={`/chatroom/${chatroom.id}`}>
                <p>{chatroom.name}</p>
                <p>Created on {new Date(chatroom.created_at).toLocaleString()}</p>
                <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
                <p>{chatroom.is_closed ? "Closed" : "Open"}</p>
                <p>{chatroom.visibility}</p>
            </Link>
            <button onClick={handleDeleteChatroom}>Delete</button>
        </div>
        )
        )}
    </>
    );
}