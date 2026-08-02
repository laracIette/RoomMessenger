import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider/AuthProvider";
import { insertMessage, useChatroom, useChatroomMessages } from "../../services/databaseServices";
import Message from "../../components/Message/Message";
import { empty } from "../../utils";
import { useState } from "react";
import { differenceInHours } from "date-fns";

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

    const latestMessage = messages?.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    });

    const canSendMessage: boolean = (!!chatroom && !chatroom.is_closed)
        && (!latestMessage || differenceInHours(Date.now(), new Date(latestMessage.created_at)) < 24);

    return (
    <div className="chatroom">
        <div className="top">
            <p>Chatroom {loadingChatroom ? "Loading chatroom..." : (!chatroom ? "Invalid chatroom" : chatroom.name)}</p>
            {}
        </div>

        {loadingMessages ? (
            <p>Loading messages...</p>
        ) : (
        !messages || empty(messages) ? (
        <p>No messages found.</p>
        ) : (
        <div className="messages-wrapper">
            <div className="messages">
                {messages.map((message) => (
                <Message key={message.id}
                    id={message.id}
                    content={message.content}
                    createdAt={message.created_at}
                    userId={message.user_id}
                    chatroomId={message.chatroom_id}
                />
                ))}
            </div>
        </div>
        )
        )}
        {canSendMessage ? (
        <form className="send-message-bar" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <input
                type="text"
                placeholder="Message content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
            />
            <button>Send message</button>
        </form>
        ) : (
        <div className="chatroom-closed-bar">
            <p>Chatroom closed</p>
        </div>
        )}

    </div>
    );
}
