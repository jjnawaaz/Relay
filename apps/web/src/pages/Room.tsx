import { ArrowLeft, Send, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: number;
  user: string;
  message: string;
  time: string;
};

type ChatResponse = {
  success: boolean;
  data: {
    chats: {
      id: number;
      eventId: string;
      message: string;
      userId: string;
      user: {
        id: string;
        name: string;
      };
      createdAt: string;
    }[];
    nextCursor: number | null;
    hasMore: boolean;
  };
};

export function Room() {
  const { roomId } = useParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const isInRoomRef = useRef(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMessagesRef = useRef(false);

  const numericRoomId = Number(roomId);

  const fetchMessages = async (cursor?: number) => {
    if (!roomId || Number.isNaN(numericRoomId)) {
      return;
    }

    if (isLoadingMessagesRef.current) {
      return;
    }

    try {
      isLoadingMessagesRef.current = true;
      setIsLoadingMessages(true);

      const token = sessionStorage.getItem("accessToken");

      if (!token) {
        console.error("No access token found");
        return;
      }

      const params = new URLSearchParams({
        limit: "30",
      });

      if (cursor !== undefined) {
        params.set("cursor", String(cursor));
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/room/${numericRoomId}/chats?${params}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        console.error("Failed to fetch messages:", response.status);
        return;
      }

      const data: ChatResponse = await response.json();

      if (!data.success) {
        return;
      }

      const incomingMessages = data.data.chats.map((chat) => ({
        id: chat.id,
        user: chat.user.name,
        message: chat.message,
        time: new Date(chat.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      }));

      if (cursor !== undefined) {
        setMessages((currentMessages) => [
          ...incomingMessages,
          ...currentMessages,
        ]);
      } else {
        setMessages(incomingMessages);
      }

      setNextCursor(data.data.nextCursor);
      setHasMoreMessages(data.data.hasMore);
    } catch (error) {
      console.error("Failed to fetch room messages:", error);
    } finally {
      isLoadingMessagesRef.current = false;
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!roomId || Number.isNaN(numericRoomId)) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchMessages();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [roomId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (container.scrollTop > 50) {
        return;
      }

      if (!hasMoreMessages || nextCursor === null) {
        return;
      }

      if (isLoadingMessagesRef.current) {
        return;
      }

      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;

      fetchMessages(nextCursor).then(() => {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;

          container.scrollTop =
            newScrollHeight - previousScrollHeight + previousScrollTop;
        });
      });
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [nextCursor, hasMoreMessages]);

  useEffect(() => {
    if (!roomId || Number.isNaN(numericRoomId)) {
      return;
    }

    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      console.error("No access token found");
      return;
    }

    const socket = new WebSocket(import.meta.env.VITE_WS_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);

      socket.send(
        JSON.stringify({
          type: "AUTH",
          token,
        }),
      );
    };

    socket.onmessage = (event) => {
      const rawMessage = event.data.toString();

      try {
        const data = JSON.parse(rawMessage);

        if (data.type === "AUTH_SUCCESS") {
          if (socket.readyState !== WebSocket.OPEN) {
            console.error("Cannot join room because WebSocket is not open");
            return;
          }

          socket.send(
            JSON.stringify({
              type: "join-room",
              roomId: numericRoomId,
            }),
          );

          return;
        }

        if (data.type === "TOKEN_EXPIRING") {
          return;
        }
      } catch {
        // Plain text messages are handled below.
      }

      if (rawMessage === "Authentication required") {
        console.error("Authentication required");
        socket.close();
        return;
      }

      if (rawMessage === "Authentication Failed") {
        console.error("Authentication failed");
        socket.close();
        return;
      }

      if (rawMessage === "Access Token Expired") {
        console.error("Access token expired");
        socket.close();
        return;
      }

      if (
        rawMessage === "User added to room" ||
        rawMessage === "User already exists in room"
      ) {
        setIsInRoom(true);
        isInRoomRef.current = true;
        return;
      }

      if (
        rawMessage === "User left room" ||
        rawMessage === "User doesnt exists in room" ||
        rawMessage === "User doesn't exist in the room"
      ) {
        return;
      }

      if (
        rawMessage === "invalid message" ||
        rawMessage === "Invalid message format"
      ) {
        console.error(rawMessage);
        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          user: "User",
          message: rawMessage,
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsInRoom(false);
      isInRoomRef.current = false;

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN && isInRoomRef.current) {
        socket.send(
          JSON.stringify({
            type: "leave-room",
            roomId: numericRoomId,
          }),
        );
      }

      isInRoomRef.current = false;

      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [roomId, numericRoomId]);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = messageInput.trim();

    if (!message) {
      return;
    }

    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    if (!isInRoom) {
      console.error("User has not joined the room");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: numericRoomId,
        message,
      }),
    );

    setMessageInput("");
  };

  const roomName = roomId ? `Room ${roomId}` : "Room";

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>

            <div>
              <h1 className="font-semibold">{roomName}</h1>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" />

                <span>
                  {!isConnected
                    ? "Connecting..."
                    : !isInRoom
                      ? "Joining room..."
                      : "Connected"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <span className="text-sm font-bold">R</span>
          </div>
        </div>
      </header>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-8">
          {hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                disabled={isLoadingMessages}
                onClick={() => {
                  if (nextCursor !== null) {
                    fetchMessages(nextCursor);
                  }
                }}
              >
                {isLoadingMessages ? "Loading..." : "Load older messages"}
              </Button>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {message.user.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{message.user}</span>

                  <span className="text-xs text-muted-foreground">
                    {message.time}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-4xl px-6 py-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            <Input
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              placeholder={`Message ${roomName.toLowerCase()}`}
              disabled={!isInRoom}
              className="h-12 rounded-xl"
            />

            <Button
              type="submit"
              size="icon"
              disabled={!isInRoom || !messageInput.trim()}
              className="size-12 shrink-0 rounded-xl"
            >
              <Send className="size-5" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
