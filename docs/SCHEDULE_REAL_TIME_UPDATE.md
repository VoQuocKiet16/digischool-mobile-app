# Schedule Real-Time Update Guide

## Tổng quan

Hệ thống real-time update cho schedule giúp hoạt động mới được hiển thị ngay lập tức trên UI mà không cần chuyển tab hoặc pull-to-refresh.

## Cách hoạt động

### 1. **Kiến trúc đơn giản**
```
AddActivity → router.back() → ScheduleScreen (useFocusEffect) → API Refresh → UI Update
```

- **AddActivity**: Khi thêm hoạt động thành công, chỉ cần `router.back()`
- **ScheduleScreen**: Sử dụng `useFocusEffect` để tự động refresh khi màn hình được focus
- **API Refresh**: Gọi API để lấy dữ liệu mới nhất
- **UI Update**: Hiển thị hoạt động mới ngay lập tức

### 2. **Flow hoạt động**

1. User thêm hoạt động mới
2. API call thành công
3. `router.back()` để quay lại schedule screen
4. `useFocusEffect` detect màn hình được focus
5. Tự động gọi `fetchSchedule(true)` để force refresh
6. UI cập nhật với hoạt động mới

## Sử dụng

### 1. **Trong AddActivity Screen**

```typescript
// Không cần gì phức tạp, chỉ cần router.back()
const handleSubmit = async () => {
  try {
    const res = await createActivity(data);
    if (res.success) {
      // Hiển thị success message
      setShowSuccess(true);
      
      // Quay lại schedule screen
      setTimeout(() => {
        router.back();
      }, 1200);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 2. **Trong Schedule Screen**

```typescript
import { useFocusEffect } from '@react-navigation/native';

export default function ScheduleScreen() {
  // Tự động refresh khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Schedule: Screen focused, refreshing...');
      fetchSchedule(true); // Force refresh
    }, [fetchSchedule])
  );

  return <ScheduleUI />;
}
```

## Lợi ích của cách tiếp cận đơn giản

### 1. **Đơn giản và dễ hiểu**
- Không cần context phức tạp
- Không cần state management phức tạp
- Code rõ ràng, dễ maintain

### 2. **Performance tốt**
- Chỉ refresh khi thực sự cần thiết (khi màn hình được focus)
- Không có infinite loop
- Không có unnecessary re-renders

### 3. **User Experience tốt**
- Hoạt động mới hiển thị ngay lập tức
- Không cần chuyển tab hoặc pull-to-refresh
- UI luôn đồng bộ với data

## Cách implement

### 1. **Trong AddActivity**
- Không cần import gì đặc biệt
- Chỉ cần `router.back()` sau khi API thành công

### 2. **Trong Schedule Screen**
- Import `useFocusEffect` từ `@react-navigation/native`
- Sử dụng `useFocusEffect` với `fetchSchedule(true)`
- Đảm bảo `fetchSchedule` function có `useCallback` để tránh infinite loop

### 3. **Trong _layout.tsx**
- Không cần wrap với provider đặc biệt
- Chỉ cần các provider cơ bản (UserProvider, SessionProvider, etc.)

## Ví dụ thực tế

### Student Schedule Screen

```typescript
import { useFocusEffect } from '@react-navigation/native';

export default function ScheduleStudentsScreen() {
  const fetchSchedule = useCallback(async (forceRefresh = false) => {
    // Logic fetch schedule
  }, [getCache, setCache]);

  // Tự động refresh khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Student Schedule: Screen focused, refreshing...');
      fetchSchedule(true); // Force refresh
    }, [fetchSchedule])
  );

  return <ScheduleUI />;
}
```

### Teacher Schedule Screen

```typescript
import { useFocusEffect } from '@react-navigation/native';

export default function ScheduleTeachersScreen() {
  const fetchSchedule = useCallback(async (forceRefresh = false) => {
    // Logic fetch schedule
  }, [getCache, setCache]);

  // Tự động refresh khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Teacher Schedule: Screen focused, refreshing...');
      fetchSchedule(true); // Force refresh
    }, [fetchSchedule])
  );

  return <ScheduleUI />;
}
```

## Lưu ý quan trọng

1. **Sử dụng useCallback**: Đảm bảo `fetchSchedule` function được wrap với `useCallback` để tránh infinite loop
2. **Force refresh**: Sử dụng `fetchSchedule(true)` để bỏ qua TTL và luôn lấy data mới nhất
3. **Dependencies array**: `useFocusEffect` chỉ cần phụ thuộc vào `fetchSchedule` function
4. **Console log**: Sử dụng console.log để debug và theo dõi quá trình refresh

## Troubleshooting

### 1. **Hoạt động mới không hiển thị**
- Kiểm tra `useFocusEffect` có được gọi không
- Đảm bảo `fetchSchedule(true)` được gọi
- Kiểm tra console log để debug

### 2. **Refresh quá nhiều lần**
- Kiểm tra `useCallback` dependencies array
- Đảm bảo `fetchSchedule` function không thay đổi liên tục
- Sử dụng `useRef` để track các giá trị cần thiết

### 3. **Performance issues**
- Chỉ refresh khi màn hình được focus
- Sử dụng `useCallback` để tránh re-render không cần thiết
- Kiểm tra TTL có quá ngắn không

## Kết luận

Cách tiếp cận đơn giản với `useFocusEffect` là giải pháp tốt nhất vì:
- **Đơn giản**: Không cần context phức tạp
- **Hiệu quả**: Hoạt động mới hiển thị ngay lập tức
- **Performance tốt**: Chỉ refresh khi cần thiết
- **Dễ maintain**: Code rõ ràng, dễ hiểu
- **Không có bugs**: Không có infinite loop hay unnecessary re-renders 