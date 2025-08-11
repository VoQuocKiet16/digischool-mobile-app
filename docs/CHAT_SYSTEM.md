# Chat System Documentation

## Tổng quan

Hệ thống chat sử dụng **Zustand** cho state management và **Socket.IO** cho real-time communication. Hệ thống được thiết kế để đảm bảo:

- **Real-time updates**: Tin nhắn mới hiển thị ngay lập tức
- **Cache management**: Dữ liệu được cache hiệu quả với TTL
- **Socket connection**: Quản lý connection tốt, tránh duplicate
- **State synchronization**: UI luôn đồng bộ với data

## Kiến trúc hệ thống

### 1. **Zustand Store** (`stores/chat.store.ts`)
```typescript
interface ChatStoreState {
  conversations: Record<string, CacheEntry<any>>; // key: myUserId
  messages: Record<string, CacheEntry<any>>;      // key: peerUserId
  getConversations: (userId: string) => CacheEntry<any> | undefined;
  setConversations: (userId: string, items: any[]) => void;
  getMessages: (peerUserId: string) => CacheEntry<any> | undefined;
  setMessages: (peerUserId: string, items: any[]) => void;
  clearCache: (type?: 'conversations' | 'messages', key?: string) => void;
}
```

### 2. **Chat Context** (`contexts/ChatContext.tsx`)
- Quản lý socket connection lifecycle
- Đảm bảo chỉ có 1 connection per user
- Tự động connect/disconnect khi user thay đổi

### 3. **Chat Service** (`services/chat.service.ts`)
- Quản lý Socket.IO connections
- Handle real-time events (new_message, message_read)
- API calls cho chat operations

### 4. **Chat State Hook** (`hooks/useChatState.ts`)
- Hook đơn giản để quản lý chat state
- Invalidate cache khi cần thiết
- Update conversations và messages real-time

## Cách hoạt động

### 1. **Connection Flow**
```
App Start → ChatContext → ChatService.connect() → Socket.IO Connection → Join Room
```

### 2. **Message Flow**
```
User A sends message → API call → Socket emit → User B receives → Update UI + Cache
```

### 3. **Cache Flow**
```
Read Cache → Check TTL → If stale → API call → Update Cache → Update UI
```

## TTL (Time To Live)

### 1. **Conversations**: 20 giây
- Danh sách hội thoại được cache 20 giây
- Sau đó tự động revalidate nền

### 2. **Messages**: 5 giây  
- Tin nhắn trong conversation được cache 5 giây
- Đảm bảo data luôn fresh

## Real-time Updates

### 1. **New Message Event**
```typescript
socket.on("new_message", (msg) => {
  // Update conversation list
  updateConversationWithMessage(msg);
  
  // Update messages in current chat
  setMessages(prev => [...prev, msg]);
  
  // Invalidate cache
  invalidateMessages(peerUserId);
  invalidateConversations();
});
```

### 2. **Message Read Event**
```typescript
socket.on("message_read", (data) => {
  // Mark conversation as read
  markConversationAsRead(data.from);
  
  // Update message status
  setMessages(prev => prev.map(msg => 
    msg._id === data.messageId ? { ...msg, status: "read" } : msg
  ));
});
```

## Cache Invalidation

### 1. **Khi có tin nhắn mới**
- Invalidate `messages` cache cho conversation đó
- Invalidate `conversations` cache để cập nhật conversation list

### 2. **Khi gửi tin nhắn**
- Invalidate `messages` cache cho conversation đó
- Invalidate `conversations` cache để cập nhật conversation list

### 3. **Khi mark as read**
- Invalidate `conversations` cache để reset unread count

## Sử dụng trong Components

### 1. **MessageListScreen**
```typescript
const {
  isConnected,
  getConversations,
  setConversations,
  updateConversationWithMessage,
  markConversationAsRead,
  invalidateConversations,
} = useChatState();

// Listen to real-time events
useEffect(() => {
  if (myId) {
    chatService.onNewMessage(myId, handleNewMessage);
    chatService.onMessageRead(myId, handleMessageRead);
  }
}, [myId]);
```

### 2. **MessageBoxScreen**
```typescript
const {
  getMessages,
  setMessages: setMessagesCache,
  invalidateMessages,
  invalidateConversations,
} = useChatState();

// Send message
const handleSend = async () => {
  // ... send logic ...
  
  // Invalidate cache
  invalidateMessages(userId);
  invalidateConversations();
};
```

## Socket Connection Management

### 1. **Connection Rules**
- Mỗi user chỉ có 1 socket connection
- Tự động reconnect khi mất kết nối
- Emit `join` event sau khi connect/reconnect

### 2. **Event Handling**
- `new_message`: Cập nhật conversation list và messages
- `message_read`: Cập nhật message status và unread count
- `connect/disconnect`: Log connection status

### 3. **Cleanup**
- Tự động cleanup event listeners
- Disconnect socket khi component unmount
- Clear cache khi user logout

## Performance Optimizations

### 1. **Cache Strategy**
- Cache-first render với background revalidation
- TTL ngắn để đảm bảo data fresh
- Invalidate cache có chọn lọc

### 2. **Real-time Updates**
- Chỉ update UI khi cần thiết
- Batch updates để tránh re-render
- Optimistic updates cho better UX

### 3. **Socket Management**
- Connection pooling để tránh duplicate
- Event debouncing để tránh spam
- Automatic reconnection với exponential backoff

## Troubleshooting

### 1. **Tin nhắn không hiển thị real-time**
- Kiểm tra socket connection status
- Kiểm tra event listeners có được đăng ký không
- Kiểm tra console log cho socket events

### 2. **Cache không được invalidate**
- Kiểm tra `invalidateCache` functions có được gọi không
- Kiểm tra TTL có quá ngắn không
- Kiểm tra cache key format có đúng không

### 3. **Socket connection issues**
- Kiểm tra network connectivity
- Kiểm tra token authentication
- Kiểm tra server socket endpoint

## Best Practices

### 1. **State Management**
- Sử dụng Zustand cho global state
- Sử dụng local state cho UI state
- Tránh duplicate state

### 2. **Cache Management**
- Invalidate cache khi có thay đổi
- Sử dụng TTL hợp lý
- Clear cache khi user logout

### 3. **Real-time Updates**
- Handle offline/online scenarios
- Implement retry logic
- Show connection status

### 4. **Error Handling**
- Handle API errors gracefully
- Show user-friendly error messages
- Implement fallback mechanisms

## Kết luận

Hệ thống chat được thiết kế để đảm bảo:
- **Performance tốt**: Cache hiệu quả, real-time updates
- **User Experience tốt**: Tin nhắn hiển thị ngay lập tức
- **Maintainability**: Code rõ ràng, dễ debug
- **Scalability**: Có thể mở rộng cho nhiều users 