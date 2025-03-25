import { socket } from "@/socket";
import { SocketEvent, UseChat } from "@/types/Chat.type";
import { useEffect, useState, useRef } from "react";

const useChat = (): UseChat => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [chatEvents, setChatEvents] = useState<SocketEvent[]>([]);
  const hasInitialized = useRef(false); // To ensure initialization happens only once

  useEffect(() => {
    if (hasInitialized.current) return; // Skip if already initialized
    hasInitialized.current = true; // Mark as initialized

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onChatEvent(value: SocketEvent) {
      setChatEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receiveCommunication", onChatEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receiveCommunication", onChatEvent);
    };
  }, []);

  const connect = () => {
    socket.connect();
  };

  const disconnect = () => {
    socket.disconnect();
  };

  const sendMessage = (message: string) => {
    if (message.trim()) {
      socket.emit("send-message", { message });
    }
  };

  return { isConnected, chatEvents, sendMessage, connect, disconnect };
};

export default useChat;
