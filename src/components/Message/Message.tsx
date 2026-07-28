import { deleteMessage, useMessage, useProfile } from "../../services/databaseServices";

interface MessageArgs {
    id: string;
}

export default function Message(args: MessageArgs) {
    const { value: message, loading: loadingMessage } = useMessage(args.id);
    const { value: profile, loading: loadingProfile } = useProfile(message?.user_id);

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
        <div>
            <p>By {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            <p>At {new Date(message.created_at).toLocaleString()}</p>
            <p>{message.content}</p>
            <button onClick={handleDeleteMessage}>Delete</button>
        </div>
        )
        )}
    </>
    );
}