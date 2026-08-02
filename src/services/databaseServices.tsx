import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"
import { type RealtimeChannel } from "@supabase/supabase-js";

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

async function fetchSingle<T extends string>(table: string, selectQuery: T, matchQuery: Record<string, any>) {
    const { data, error } = await supabase
        .from(table)
        .select(selectQuery)
        .match(matchQuery)
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function fetchAll<T extends string>(table: string, selectQuery: T, matchQuery: Record<string, any>) {
    const { data, error } = await supabase
        .from(table)
        .select(selectQuery)
        .match(matchQuery);

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

async function insertIntoTable<T extends string>(table: string, row: any, selectQuery: T) {
    const { data, error } = await supabase
        .from(table)
        .insert(row)
        .select(selectQuery)
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
        .match({ id: id });

    if (error) {
        throw error;
    }
}

async function updateFromTable(table: string, id: string, values: Record<string, any>) {
    const { error } = await supabase
        .from(table)
        .update(values)
        .match({ id: id });

    if (error) {
        throw error;
    }
}

export const insertServer = async (name: string) => insertIntoTable("servers", { name: name }, "id");
export const insertServerMember = async (serverId: string, userId: string) => insertIntoTable("server_members", { server_id: serverId, user_id: userId }, "server_id, user_id");
export const insertChatroom = async (name: string, serverId: string) => insertIntoTable("chatrooms", { name: name, server_id: serverId }, "id");
export const insertMessage = async (content: string, chatroomId: string) => insertIntoTable("messages", { content: content, chatroom_id: chatroomId }, "id");

export const updateChatroom = async (id: string, values: Record<string, any>) => updateFromTable("chatrooms", id, values);

export const deleteServer = async (id: string) => deleteFromTable("servers", id);
export const deleteChatroom = async (id: string) => deleteFromTable("chatrooms", id);
export const deleteMessage = async (id: string) => deleteFromTable("messages", id);

export const useProfile = createHook(async (id: string) => fetchSingle("profiles", "id, username, created_at, display_name", { id: id }));
export const useServer = createHook(async (id: string) => fetchSingle("servers", "id, name, created_at, user_id", { id: id }));
export const useServerMember = createHook(async ({ serverId, userId }: { serverId: string, userId: string }) => fetchSingle("server_members", "joined_at, role", { server_id: serverId, user_id: userId }));
export const useChatroom = createHook(async (id: string) => fetchSingle("chatrooms", "id, name, created_at, user_id, is_closed, visibility, server_id", { id: id }));
export const useMessage = createHook(async (id: string) => fetchSingle("messages", "id, content, created_at, user_id, chatroom_id", { id: id }));

export const useUserServers = createHookWithChannel(
    async (userId: string) => fetchAll("servers", "id, name, created_at, user_id", { user_id: userId }),
    (setValueFunc: setValueFunc<any[]>, userId: string) => {
        return supabase
            .channel(`user_servers_${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'servers', filter: `user_id=eq.${userId}` },
                (payload) => {
                    setValueFunc((servers) => servers ? [...servers, payload.new.id as string] : [payload.new.id as string]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'servers', filter: `user_id=eq.${userId}` },
                (payload) => {
                    setValueFunc((servers) => servers ? servers.filter((serverId) => serverId !== payload.old.id) : []);
                }
            );
    }
);
export const useServerChatrooms = createHookWithChannel(
    async (serverId: string) => fetchAll("chatrooms", "id, name, created_at, user_id, is_closed, visibility, server_id", { server_id: serverId }),
    (setValueFunc: setValueFunc<any[]>, serverId: string) => {
        return supabase
            .channel(`server_chatrooms_${serverId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chatrooms', filter: `server_id=eq.${serverId}` },
                (payload) => {
                    setValueFunc((chatrooms) => chatrooms ? [...chatrooms, payload.new] : [payload.new]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'chatrooms', filter: `server_id=eq.${serverId}` },
                (payload) => {
                    setValueFunc((chatrooms) => chatrooms ? chatrooms.map((chatroom) => chatroom.id === payload.new.id ? payload.new : chatroom) : []);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'chatrooms', filter: `server_id=eq.${serverId}` },
                (payload) => {
                    setValueFunc((chatrooms) => chatrooms ? chatrooms.filter((chatroom) => chatroom.id !== payload.old.id) : []);
                }
            );
    }
);
export const useChatroomMessages = createHookWithChannel(
    async (chatroomId: string) => fetchAll("messages", "id, content, created_at, user_id, chatroom_id", { chatroom_id: chatroomId }),
    (setValueFunc: setValueFunc<any[]>, chatroomId: string) => {
        return supabase
            .channel(`chatroom_messages_${chatroomId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${chatroomId}` },
                (payload) => {
                    setValueFunc((messages) => messages ? [...messages, payload.new] : [payload.new]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'messages', filter: `chatroom_id=eq.${chatroomId}` },
                (payload) => {
                    setValueFunc((messages) => messages ? messages.filter((message) => message.id !== payload.old.id) : []);
                }
            );
    }
);
