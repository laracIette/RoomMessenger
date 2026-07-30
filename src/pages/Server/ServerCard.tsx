import { Link } from "react-router-dom";
import { deleteServer, useProfile, useServer } from "../../services/databaseServices";
import { useAuth } from "../../components/AuthProvider/AuthProvider";

export default function ServerCard(args: { id: string }) {
    const { user } = useAuth();

    const { value: server, loading: loadingServer } = useServer(args.id);
    const { value: profile, loading: loadingProfile } = useProfile(server?.user_id);

    const canDelete: boolean = (!!server && !!user)
        && (server.user_id === user.id);

    const handleDeleteServer = () => {
        if (!server) return;

        deleteServer(server.id)
            .catch((err) => console.error(err.message));
    };

    return (
    <>
        {loadingServer ? (
        <p>Loading server...</p>
        ) : (
        !server ? (
        <p>Invalid server</p>
        ) : (
        <div>
            <Link to={`/server/${server.id}`}>
                <p>{server.name}</p>
                <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            </Link>
            {canDelete && <button onClick={handleDeleteServer}>Delete</button>}
        </div>
        )
        )}
    </>
    );
}