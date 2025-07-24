import { io, Socket } from "socket.io-client";
import api from "./api.config";

const SOCKET_URL =
  "https://digischool-app-374067302360.asia-southeast1.run.app/"; // Thay bằng URL backend của bạn

class ChatService {
  socket: Socket | null = null;
  myId: string | null = null;

  connect(userId: string, token: string) {
    if (this.socket) {
      return;
    }
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    this.socket.on("connect", () => {});
    this.socket.on("disconnect", () => {});
    this.socket.on("reconnect_attempt", () => {});
    this.socket.emit("join", userId);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onNewMessage(callback: (msg: any) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.on("new_message", callback);
  }

  offNewMessage(callback: (msg: any) => void) {
    this.socket?.off("new_message", callback);
  }

  sendMessageSocket(data: any) {
    this.socket?.emit("send_message", data);
  }

  markAsRead(from: string, to: string) {
    this.socket?.emit("mark_read", { from, to });
  }

  onMessageRead(callback: (msg: any) => void) {
    this.socket?.on("message_read", callback);
  }
  offMessageRead(callback: (msg: any) => void) {
    this.socket?.off("message_read", callback);
  }


  // REST API
  async getConversations(token: string) {
    try {
      const res = await api.get("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: res.data };
    } catch (error: any) {
      console.error("[getConversations] error:", error, error?.response?.data);
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
