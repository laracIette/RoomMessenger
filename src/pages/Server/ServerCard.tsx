import { Link } from "react-router-dom";
import { deleteServer, useProfile, useServer } from "../../services/databaseServices";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import ContextMenu, { useContextMenu } from "../../components/ContextMenu/ContextMenu";

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

    const { contextMenuVisible, contextMenuPosition, handleOnContextMenu } = useContextMenu();

    return (
    <>
        {loadingServer ? (
        <p>Loading server...</p>
        ) : (
        !server ? (
        <p>Invalid server</p>
        ) : (
        <div className="server" onContextMenu={handleOnContextMenu}>
            <Link to={`/server/${server.id}`}>
                <p>{server.name}</p>
                <p>Created by {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>
            </Link>

            <ContextMenu
                visible={contextMenuVisible}
                position={contextMenuPosition}
                actions={[
                    { label: "Copy id", action: () => navigator.clipboard.writeText(server.id) },
                    { label: "Copy user id", action: () => navigator.clipboard.writeText(server.user_id) },
                    ...(canDelete ? [{ label: "Delete", action: handleDeleteServer }] : []),
                ]}
            />
        </div>
        )
        )}
    </>
    );
}