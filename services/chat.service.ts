import { io, Socket } from "socket.io-client";
import api from "./api.config";

const SOCKET_URL =
  "https://digischool-app-374067302360.asia-southeast1.run.app/"; // Thay bằng URL backend của bạn

class ChatService {
  socket: Socket | null = null;

  connect(userId: string, token: string) {
    if (this.socket) {
      console.log("Socket đã connect rồi với userId:", userId);
      return;
    }
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: `Bearer ${token}` },
    });
    this.socket.emit("join", userId);
    console.log("Socket vừa được connect với userId:", userId);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onNewMessage(callback: (msg: any) => void) {
    if (!this.socket) {
      console.log("Socket chưa connect, không thể lắng nghe new_message");
      return;
    }
    console.log("Đăng ký lắng nghe new_message");
    this.socket.on("new_message", callback);
  }

  offNewMessage(callback: (msg: any) => void) {
    this.socket?.off("new_message", callback);
  }

  sendMessageSocket(data: any) {
    this.socket?.emit("send_message", data);
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
}

export default new ChatService();
