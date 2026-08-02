import { Link } from "react-router-dom";
import { deleteServer } from "../../services/databaseServices";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import ContextMenu, { useContextMenu } from "../../components/ContextMenu/ContextMenu";
"id, name, created_at, user_id"
export default function ServerCard({ id, name, createdAt, userId }:
    { id: string, name: string, createdAt: string, userId: string }
) {
    const { user } = useAuth();

    const canDelete: boolean = (!!user)
        && (userId === user.id);

    const handleDeleteServer = () => {
        deleteServer(id)
            .catch((err) => console.error(err.message));
    };

    const { contextMenuVisible, contextMenuPosition, handleOnContextMenu } = useContextMenu();

    return (
    <div className="server card" onContextMenu={handleOnContextMenu}>
        <Link to={`/server/${id}`}>
            <p>{name}</p>
        </Link>

        <ContextMenu
            visible={contextMenuVisible}
            position={contextMenuPosition}
            actions={[
                { label: "Copy id", action: () => navigator.clipboard.writeText(id) },
                { label: "Copy user id", action: () => navigator.clipboard.writeText(userId) },
                ...(canDelete ? [{ label: "Delete", action: handleDeleteServer }] : []),
            ]}
        />
    </div>
    );
}