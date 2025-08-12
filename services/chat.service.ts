import { io, Socket } from "socket.io-client";
import api from "./api.config";

const SOCKET_URL =
  "https://digischool-app-374067302360.asia-southeast1.run.app/"; // Thay bằng URL backend của bạn

class ChatService {
  private sockets: Map<string, Socket> = new Map();
  private messageCallbacks: Map<string, Set<(msg: any) => void>> = new Map();
  private readCallbacks: Map<string, Set<(data: any) => void>> = new Map();

  connect(userId: string, token: string) {
    // Nếu đã có socket cho userId này, không tạo mới
    if (this.sockets.has(userId)) {
      console.log(`Socket already exists for user ${userId}, skipping connection`);
      return;
    }

    console.log(`Creating new socket connection for user ${userId}`);
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log(`Socket connected for user ${userId}`);
      // Emit join event sau khi connect thành công
      socket.emit("join", userId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected for user ${userId}`);
    });

    socket.on("reconnect_attempt", () => {
      console.log(`Socket reconnecting for user ${userId}`);
    });

    socket.on("reconnect", () => {
      console.log(`Socket reconnected for user ${userId}`);
      // Emit join event sau khi reconnect
      socket.emit("join", userId);
    });

    socket.on("new_message", (msg: any) => {
      console.log(`New message received for user ${userId}:`, msg);
      // Chỉ gọi callback cho user này
      const callbacks = this.messageCallbacks.get(userId);
      if (callbacks) {
        callbacks.forEach(callback => callback(msg));
      }
    });

    socket.on("message_read", (data: any) => {
      // Chỉ gọi callback cho user này
      const callbacks = this.readCallbacks.get(userId);
      if (callbacks) {
        callbacks.forEach(callback => callback(data));
      }
    });

    this.sockets.set(userId, socket);
  }

  disconnect(userId?: string) {
    if (userId) {
      // Disconnect specific user
      const socket = this.sockets.get(userId);
      if (socket) {
        socket.disconnect();
        this.sockets.delete(userId);
        this.messageCallbacks.delete(userId);
        this.readCallbacks.delete(userId);
      }
    } else {
      // Disconnect all
      this.sockets.forEach(socket => socket.disconnect());
      this.sockets.clear();
      this.messageCallbacks.clear();
      this.readCallbacks.clear();
    }
  }

  onNewMessage(userId: string, callback: (msg: any) => void) {
    if (!this.messageCallbacks.has(userId)) {
      this.messageCallbacks.set(userId, new Set());
    }
    this.messageCallbacks.get(userId)!.add(callback);
  }

  offNewMessage(userId: string, callback: (msg: any) => void) {
    const callbacks = this.messageCallbacks.get(userId);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  sendMessageSocket(userId: string, data: any) {
    const socket = this.sockets.get(userId);
    if (socket) {
      socket.emit("send_message", data);
    }
  }

  markAsRead(userId: string, from: string, to: string) {
    const socket = this.sockets.get(userId);
    if (socket) {
      socket.emit("mark_read", { from, to });
    }
  }

  onMessageRead(userId: string, callback: (data: any) => void) {
    if (!this.readCallbacks.has(userId)) {
      this.readCallbacks.set(userId, new Set());
    }
    this.readCallbacks.get(userId)!.add(callback);
  }

  offMessageRead(userId: string, callback: (data: any) => void) {
    const callbacks = this.readCallbacks.get(userId);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // REST API
  async getConversations(token: string) {
    try {
      const res = await api.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Lấy danh sách đoạn chat thất bại",
      };
    }
  }

  async getMessagesWith(userId: string, token: string) {
    try {
      const res = await api.get(`/api/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lấy lịch sử chat thất bại",
      };
    }
  }

  async sendMessageAPI(data: any, token: string) {
    try {
      const res = await api.post("/api/chat/message", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Gửi tin nhắn thất bại",
      };
    }
  }

  async uploadMedia(file: any, token: string) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/chat/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Upload file thất bại",
      };
    }
  }

  async searchUsers(keyword: string, token: string) {
    try {
      const res = await api.get(`/api/users?search=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res.data.data.users };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Tìm kiếm tài khoản thất bại",
      };
    }
  }
}

export default new ChatService();
