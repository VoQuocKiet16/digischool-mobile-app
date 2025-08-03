# Single Session Implementation - Frontend

## Tổng quan

Frontend React Native đã được cập nhật để hỗ trợ **Single Session** - chỉ cho phép một thiết bị đăng nhập tại một thời điểm. Khi user đăng nhập trên thiết bị mới, thiết bị cũ sẽ tự động logout và hiển thị thông báo.

## Các thay đổi chính

### 1. API Configuration Updates

**File**: `services/api.config.ts`

- Thêm response interceptor để xử lý 401 errors
- Clear tất cả session data khi nhận được 401
- Emit custom event để thông báo session expiration

```typescript
// Response interceptor để xử lý session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear all session data
      await AsyncStorage.multiRemove([...]);
      
      // Emit custom event
      const event = new CustomEvent('sessionExpired', {
        detail: { message: alertMessage }
      });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);
```

### 2. Session Context

**File**: `contexts/SessionContext.tsx`

- Quản lý trạng thái session expiration
- Hiển thị modal thông báo khi session hết hạn
- Xử lý navigation về login screen

```typescript
interface SessionContextType {
  isSessionExpired: boolean;
  sessionExpiredMessage: string;
  showSessionExpiredModal: (message: string) => void;
  hideSessionExpiredModal: () => void;
  handleLoginAgain: () => void;
}
```

### 3. Session Expired Modal

**File**: `components/notifications_modal/SessionExpiredModal.tsx`

- Modal component để hiển thị thông báo session expiration
- UI đẹp với icon warning và button đăng nhập lại
- Responsive design cho mobile

### 4. Auth Service Updates

**File**: `services/auth.service.ts`

- Cập nhật logout function để clear tất cả session data
- Thêm function `handleSessionExpiration` để xử lý session expiration
- Clear comprehensive list của session data

```typescript
export const logout = async () => {
  // Clear all session data first
  await AsyncStorage.multiRemove([
    "token", "userId", "role", "userName", 
    "userEmail", "userPhone", "userAddress", 
    "userRoleInfo", "userInfo"
  ]);
  // ... rest of logout logic
};
```

### 5. Login Flow Updates

**File**: `app/auth/login.tsx`

- Clear session data trước khi login mới
- Đảm bảo không có session cũ tồn tại

```typescript
const handleLogin = async () => {
  // Clear any existing session data before login
  await AsyncStorage.multiRemove([...]);
  
  const res = await login(email, password);
  // ... rest of login logic
};
```

### 6. Session Check Hook

**File**: `hooks/useSessionCheck.ts`

- Kiểm tra session status định kỳ (mỗi 5 phút)
- Gọi API getMe để verify session validity
- Hiển thị modal nếu session expired

```typescript
export const useSessionCheck = () => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          await getMe(); // Verify session
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          showSessionExpiredModal(alertMessage);
        }
      }
    };
    
    // Check every 5 minutes
    intervalRef.current = setInterval(checkSession, 5 * 60 * 1000);
  }, []);
};
```

### 7. Layout Updates

**File**: `app/_layout.tsx`

- Thêm SessionProvider vào provider tree
- Thêm SessionExpiredModal vào layout
- Sử dụng useSessionCheck hook

```typescript
export default function RootLayout() {
  return (
    <UserProvider>
      <SessionProvider>
        <NotificationProvider>
          <RootLayoutContent />
          <SessionExpiredModal />
        </NotificationProvider>
      </SessionProvider>
    </UserProvider>
  );
}
```

## Cách hoạt động

### 1. Login Flow
1. User nhập email/password
2. Clear tất cả session data cũ
3. Gọi API login
4. Lưu token và user data mới
5. Navigate đến home screen

### 2. Session Expiration Detection
1. API interceptor catch 401 errors
2. Clear session data
3. Emit custom event
4. SessionContext lắng nghe event
5. Hiển thị modal thông báo
6. User click "Đăng nhập lại"
7. Navigate về login screen

### 3. Periodic Session Check
1. Hook kiểm tra session mỗi 5 phút
2. Gọi API getMe để verify
3. Nếu 401, hiển thị modal
4. User được yêu cầu login lại

## Các loại thông báo

### 1. Session Expired (Default)
```
"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
```

### 2. Multi-device Login
```
"Tài khoản đã đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại."
```

### 3. Token Invalidated
```
"Phiên đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại."
```

## Session Data Cleared

Khi session expired, các data sau sẽ được clear:

- `token` - JWT token
- `userId` - User ID
- `role` - User role
- `userName` - User name
- `userEmail` - User email
- `userPhone` - User phone
- `userAddress` - User address
- `userRoleInfo` - User role info
- `userInfo` - User info
- `userDateOfBirth` - User date of birth
- `userGender` - User gender

## Testing Scenarios

### 1. Multi-device Login Test
```typescript
// Test script
const testMultiDeviceLogin = async () => {
  // Login on device A
  const deviceA = await login('user@example.com', 'password');
  
  // Login on device B
  const deviceB = await login('user@example.com', 'password');
  
  // Device A should show session expired modal
  // Device B should work normally
};
```

### 2. Session Expiration Test
```typescript
// Test session expiration
const testSessionExpiration = async () => {
  // Login user
  await login('user@example.com', 'password');
  
  // Simulate session change on backend
  // Frontend should show modal after 401 response
};
```

## Security Features

1. **Automatic Session Clearing**: Clear tất cả session data khi logout hoặc session expired
2. **Periodic Session Check**: Kiểm tra session validity định kỳ
3. **Modal Confirmation**: User phải xác nhận khi session expired
4. **Secure Navigation**: Tự động redirect về login screen
5. **Event-based Communication**: Sử dụng custom events để tránh circular dependencies

## Performance Impact

- **Minimal**: Chỉ thêm 1 API call mỗi 5 phút
- **Memory Usage**: Không ảnh hưởng đáng kể
- **User Experience**: Smooth transition với modal đẹp

## Troubleshooting

### Common Issues

1. **Modal không hiển thị**
   - Check SessionProvider đã được wrap đúng
   - Verify event listener đã được setup

2. **Session không clear**
   - Check AsyncStorage.multiRemove có đúng keys
   - Verify API interceptor đã catch 401

3. **Navigation không hoạt động**
   - Check router.replace("/auth") có đúng path
   - Verify SessionContext handleLoginAgain function

### Debug Commands

```typescript
// Check current session data
console.log('Token:', await AsyncStorage.getItem('token'));
console.log('User ID:', await AsyncStorage.getItem('userId'));

// Test session check
const { showSessionExpiredModal } = useSessionContext();
showSessionExpiredModal('Test message');

// Clear all session data manually
await AsyncStorage.multiRemove([...]);
```

## Rollback Plan

Nếu cần rollback:

1. **Remove SessionProvider** từ _layout.tsx
2. **Remove SessionExpiredModal** component
3. **Remove useSessionCheck** hook
4. **Remove response interceptor** từ api.config.ts
5. **Remove session clearing** từ login.tsx

---

**Lưu ý**: Đảm bảo test kỹ trên staging environment trước khi deploy production. 