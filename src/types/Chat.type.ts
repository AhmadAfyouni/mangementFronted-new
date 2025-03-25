export interface ChatMessage {
  emp: string;
  sender_Id: string;
  department: string;
  message: string;
  date: Date;
  files: string[];
}

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SocketEvent {
  message: string;
  files?: string[];
}

export interface UseChat {
  isConnected: boolean;
  chatEvents: SocketEvent[];
  sendMessage: (message: string) => void;
  connect: () => void;
  disconnect: () => void;
}
