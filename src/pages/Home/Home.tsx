import { useAuth } from "../../components/AuthProvider/AuthProvider"
import { Navigate, useNavigate } from "react-router-dom";
import { insertServer, insertServerMember, useProfile, useUserServers } from "../../services/databaseServices"
import ServerCard from "../Server/ServerCard";
import { empty } from "../../utils";
import { useState } from "react";

export default function Home() {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const { value: profile, loading: loadingProfile } = useProfile(user.id);
    const { value: servers, loading: loadingServers } = useUserServers(profile?.id);

    const [message, setMessage] = useState<string | null>(null)
    const [newServerName, setNewServerName] = useState("");
    const [joinServerId, setJoinServerId] = useState("");

    const navigate = useNavigate();

    const handleCreateServer = () => {
        if (!newServerName.trim()) return;

        var serverId: string | undefined;

        insertServer(newServerName)
            .then((server) => serverId = server?.id)
            .catch((err) => setMessage(err.message))
            .finally(() => { if (serverId) navigate(`/server/${serverId}`); });
    }

    const handleJoinServer = () => {
        if (!user || !joinServerId.trim()) return;

        var serverId: string | undefined;

        insertServerMember(joinServerId, user.id)
            .then((serverMember) => serverId = serverMember?.server_id)
            .catch((err) => setMessage(err.message))
            .finally(() => { if (serverId) navigate(`/server/${serverId}`); });
    }

    return (
    <div className="home">
        <p>Welcome {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>

        <form className="create-server-bar" onSubmit={(e) => { e.preventDefault(); handleCreateServer(); }}>
            <input
                type="text"
                placeholder="Server name"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                required
            />
            <button>Create server</button>
        </form>
        <form className="join-server-bar" onSubmit={(e) => { e.preventDefault(); handleJoinServer(); }}>
            <input
                type="text"
                placeholder="Server id"
                value={joinServerId}
                onChange={(e) => setJoinServerId(e.target.value)}
                required
            />
            <button>Join server</button>
        </form>

        {loadingServers ? (
        <p>Loading servers...</p>
        ) : (
        !servers || empty(servers) ? (
        <p>No servers found.</p>
        ) : (
        <div className="servers">
            {servers.map((server) => (
            <ServerCard key={server.id}
                id={server.id}
                name={server.name}
                createdAt={server.created_at}
                userId={server.user_id}
            />
            ))}
        </div>
        )
        )}
        {message && <p>{message}</p>}
    </div>
    );
}
