import { Link } from "react-router-dom";
import { useProfile, useServer } from "../../services/databaseServices";

interface ServerCardArgs {
    id: string;
}

export default function ServerCard(args: ServerCardArgs) {
    const { value: server, loading } = useServer(args.id);

    const { value: profile, loading: loadingProfile } = useProfile(server?.user_id);

    return (
    <>
        {loading ? (
        <p>Loading server...</p>
        ) : (
        !server ? (
        <p>Invalid server</p>
        ) : (
        <Link to={`/server/${server.id}`}>
            <p>{server.name}</p>
            <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
        </Link>
        )
        )}
    </>
    );
}