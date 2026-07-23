import { useMessage, useProfile } from "../../services/databaseServices";

interface MessageArgs {
    id: string;
}

export default function Message(args: MessageArgs) {
    const { value: message, loading } = useMessage(args.id);

    const { value: profile, loading: loadingProfile } = useProfile(message?.user_id);

    return (
    <>
        {loading ? (
        <p>Loading message...</p>
        ) : (
        !message ? (
        <p>Invalid message</p>
        ) : (
        <div>
            <p>By {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            <p>At {new Date(message.created_at).toLocaleString()}</p>
            <p>{message.content}</p>
        </div>
        )
        )}
    </>
    );
}