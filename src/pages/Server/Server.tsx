import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import { insertChatroom, useServer, useServerChatrooms } from "../../services/databaseServices";
import ChatroomCard from "../Chatroom/ChatroomCard";
import { empty } from "../../utils";
import { useState } from "react";

export default function Server() {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const { serverId } = useParams();
    if (!serverId) {
        return <p>No server address provided</p>;
    }

    const navigate = useNavigate();

    const { value: server, loading: loadingServer } = useServer(serverId);
    const { value: chatrooms, loading: loadingChatrooms } = useServerChatrooms(server?.id);

    const [newChatroomName, setNewChatroomName] = useState("");

    const handleCreateChatroom = () => {
        if (!newChatroomName.trim() || !server) return;

        var chatroomId: string | undefined;

        insertChatroom(newChatroomName, server.id)
            .then((chatroom) => chatroomId = chatroom?.id)
            .catch((err) => console.error(err.message))
            .finally(() => { if (chatroomId) navigate(`/chatroom/${chatroomId}`); });
    }

    return (
    <>
        <p>Server {loadingServer ? "Loading server..." : (!server ? "Invalid server" : server.name)}</p>
        {loadingChatrooms ? (
        <p>Loading chatrooms...</p>
        ) : (
        !chatrooms || empty(chatrooms) ? (
        <p>No chatrooms</p>
        ) : (
        <div>
            <p>Chatrooms</p>
            <div>{
                chatrooms.map((id) => (
                <ChatroomCard key={id} id={id} />
                ))
            }</div>
        </div>
        )
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleCreateChatroom(); }}>
            <input
                type="text"
                placeholder="Chatroom name"
                value={newChatroomName}
                onChange={(e) => setNewChatroomName(e.target.value)}
                required
            />
            <button>Create chatroom</button>
        </form>
    </>
    );
}
