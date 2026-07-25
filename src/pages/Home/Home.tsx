import { useAuth } from "../../components/AuthProvider/AuthProvider"
import { Navigate, useNavigate } from "react-router-dom";
import { insertServer, useProfile, useUserServers } from "../../services/databaseServices"
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

    const [newServerName, setNewServerName] = useState("");
    const navigate = useNavigate();

    const handleCreateServer = () => {
        if (!newServerName.trim()) return;

        var serverId: string | undefined;

        insertServer(newServerName)
            .then((server) => serverId = server?.id)
            .catch((err) => console.error(err.message))
            .finally(() => { if (serverId) navigate(`/server/${serverId}`); });
    }

    return (
    <>
        <p>Welcome {loadingProfile ? "Loading profile..." : (!profile ? "Invalid profile" : profile.username)}</p>

        {loadingServers ? (
        <p>Loading servers...</p>
        ) : (
        !servers || empty(servers) ? (
        <p>No servers found.</p>
        ) : (
        <div>
            <p>Servers</p>
            <div>
                {servers.map((id) => (
                <ServerCard key={id} id={id} />
                ))}
            </div>
        </div>
        )
        )}
        <input
            type="text"
            placeholder="Server"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
        />
        <button onClick={handleCreateServer}>Create server</button>
    </>
    );
}
