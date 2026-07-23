import { useAuth } from "../../components/AuthProvider/AuthProvider"
import { Navigate } from "react-router-dom";
import { useProfile, useUserServers } from "../../services/databaseServices"
import ServerCard from "../Server/ServerCard";
import { empty } from "../../utils";

export default function Home() {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const { value: profile, loading: loadingProfile } = useProfile(user.id);
    const { value: servers, loading: loadingServers } = useUserServers(profile?.id);

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
    </>
    );
}
