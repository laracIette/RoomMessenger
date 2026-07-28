import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import { insertMessage, useChatroom, useChatroomMessages } from "../../services/databaseServices";
import Message from "../../components/Message/Message";
import { empty } from "../../utils";
import { useState } from "react";

export default function Chatroom() {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const { chatroomId } = useParams();
    if (!chatroomId) {
        return <p>No chatroom address provided</p>;
    }

    const { value: chatroom, loading: loadingChatroom } = useChatroom(chatroomId);
    const { value: messages, loading: loadingMessages } = useChatroomMessages(chatroom?.id);

    const [messageContent, setMessageContent] = useState("");

    const handleSendMessage = () => {
        if (!messageContent.trim() || !chatroom) return;

        insertMessage(messageContent, chatroom.id)
            .then(() => setMessageContent(""))
            .catch((err) => console.error(err.message));
    };

    return (
    <>
        <p>Chatroom {loadingChatroom ? "Loading chatroom..." : (!chatroom ? "Invalid chatroom" : chatroom.name)}</p>

        {loadingMessages ? (
            <p>Loading messages...</p>
        ) : (
        !messages || empty(messages) ? (
        <p>No messages found.</p>
        ) : (
        <div>
            {messages.map((id) => (
            <Message key={id} id={id} />
            ))}
        </div>
        )
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <input
                type="text"
                placeholder="Message content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
            />
            <button>Send message</button>
        </form>
    </>
    );
}
