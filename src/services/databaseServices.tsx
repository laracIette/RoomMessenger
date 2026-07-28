import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"
import type { RealtimeChannel } from "@supabase/supabase-js";

function use<T, U>(fetchFunc: (id: T) => Promise<U>, id: T | undefined) {
    const [value, setValue] = useState<U | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        fetchFunc(id)
            .then((v) => setValue(v))
            .catch((err) => {
                console.error("Failed fetch:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [id]);

    return { value, loading, error };
}

type setValueFunc<T> = React.Dispatch<React.SetStateAction<T | undefined>>;

function useWithChannel<T, U>(
    fetchFunc: (id: T) => Promise<U>,
    id: T | undefined,
    createChannel: (setValueFunc: setValueFunc<U>, id: T) => RealtimeChannel
) {
    const [value, setValue] = useState<U | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const channel = createChannel(setValue, id);

        fetchFunc(id)
            .then((v) => setValue(v))
            .then(() => channel.subscribe())
            .catch((err) => {
                console.error("Failed fetch:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    return { value, loading, error };
}

async function fetchUserServers(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("server_members")
        .select("server_id")
        .eq("user_id", userId);

    if (error) {
        throw error;
    }

    return data.map((item) => item.server_id);
}

async function fetchServerChatrooms(serverId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("chatrooms")
        .select("id")
        .eq("server_id", serverId);

    if (error) {
        throw error;
    }

    return data.map((chatroom) => chatroom.id);
}

async function fetchChatroomMessages(chatroomId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("messages")
        .select("id")
        .eq("chatroom_id", chatroomId);

    if (error) {
        throw error;
    }

    return data.map((message) => message.id);
}

async function fetchProfile(profileId: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, created_at, display_name")
        .eq("id", profileId)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function fetchServer(serverId: string) {
    const { data, error } = await supabase
        .from("servers")
        .select("id, name, created_at, user_id")
        .eq("id", serverId)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function fetchChatroom(chatroomId: string) {
    const { data, error } = await supabase
        .from("chatrooms")
        .select("id, name, created_at, user_id, is_closed, visibility, server_id")
        .eq("id", chatroomId)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function fetchMessage(messageId: string) {
    const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, user_id, chatroom_id")
        .eq("id", messageId)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

function createHook<T, U>(func: (id: T) => Promise<U>) {
    return (id: T | undefined) => use(func, id);
}

function createHookWithChannel<T, U>(
    func: (id: T) => Promise<U>,
    createChannel: (setValueFunc: setValueFunc<U>, id: T) => RealtimeChannel
) {
    return (id: T | undefined) => useWithChannel(func, id, createChannel);
}

async function insertIntoTable(table: string, row: any) {
    const { data, error } = await supabase
        .from(table)
        .insert(row)
        .select("id")
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function deleteFromTable(table: string, id: string) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }
}

export const insertServer = async (name: string) => insertIntoTable("servers", { name: name });
export const insertChatroom = async (name: string, serverId: string) => insertIntoTable("chatrooms", { name: name, server_id: serverId });
export const insertMessage = async (content: string, chatroomId: string) => insertIntoTable("messages", { content: content, chatroom_id: chatroomId });

export const deleteChatroom = async (id: string) => deleteFromTable("chatrooms", id);
export const deleteMessage = async (id: string) => deleteFromTable("messages", id);

export const useUserServers = createHook(fetchUserServers);
export const useProfile = createHook(fetchProfile);
export const useServer = createHook(fetchServer);
export const useChatroom = createHook(fetchChatroom);
export const useMessage = createHook(fetchMessage);

export const useServerChatrooms = createHookWithChannel(
    fetchServerChatrooms,
    (setValueFunc: setValueFunc<string[]>, id: string) => {
        return supabase
            .channel(`server_chatrooms_${id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chatrooms', filter: `server_id=eq.${id}` },
                (payload) => {
                    setValueFunc((chatrooms) => chatrooms ? [...chatrooms, payload.new.id as string] : [payload.new.id as string]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'chatrooms', filter: `server_id=eq.${id}` },
                (payload) => {
                    setValueFunc((chatrooms) => chatrooms ? chatrooms.filter((chatroomId) => chatroomId !== payload.old.id) : []);
                }
            );
    }
);
export const useChatroomMessages = createHookWithChannel(
    fetchChatroomMessages,
    (setValueFunc: setValueFunc<string[]>, id: string) => {
        return supabase
            .channel(`chatroom_messages_${id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${id}` },
                (payload) => {
                    setValueFunc((messages) => messages ? [...messages, payload.new.id as string] : [payload.new.id as string]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${id}` },
                (payload) => {
                    setValueFunc((messages) => messages ? messages.filter((messageId) => messageId !== payload.old.id) : []);
                }
            );
    }
);
