import { Link } from "react-router-dom";
import { useProfile, useServer } from "../../services/databaseServices";

export default function ServerCard(args: { id: string }) {
    const { value: server, loading: loadingServer } = useServer(args.id);
    const { value: profile, loading: loadingProfile } = useProfile(server?.user_id);

    return (
    <>
        {loadingServer ? (
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