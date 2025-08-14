# Hướng dẫn sử dụng chức năng Xuất TKB ra PDF

## Tổng quan
Chức năng xuất TKB ra PDF cho phép người dùng tạo file PDF từ dữ liệu thời khóa biểu hiện tại, với 2 định dạng khác nhau. **Đặc biệt, TKB được tách thành 2 bảng riêng biệt: Buổi sáng (Tiết 1-5) và Buổi chiều (Tiết 6-10)** để dễ đọc và quản lý.

## Cách sử dụng

### 1. Truy cập chức năng
- Trong màn hình TKB, nhấn vào nút dropdown (mũi tên xuống) ở góc trái trên
- Chọn "Xuất TKB ra" từ menu

### 2. Chọn định dạng PDF
Hệ thống sẽ hiển thị 2 tùy chọn:
- **Định dạng đơn giản**: TKB được hiển thị theo từng ngày, mỗi ngày có danh sách các tiết học, được tách riêng buổi sáng và chiều
- **Định dạng bảng**: TKB được hiển thị dạng bảng truyền thống với 2 bảng riêng biệt cho buổi sáng và chiều

### 3. Quá trình tạo PDF
- Sau khi chọn định dạng, hệ thống sẽ hiển thị thông báo "Đang tạo PDF..."
- Quá trình tạo PDF diễn ra trực tiếp trên thiết bị
- Thời gian tạo phụ thuộc vào độ phức tạp của TKB

### 4. Sau khi tạo thành công
Khi PDF được tạo thành công, bạn sẽ thấy 3 tùy chọn:
- **OK**: Đóng thông báo
- **Mở file**: Mở file PDF bằng ứng dụng mặc định
- **Chia sẻ**: Chia sẻ file PDF với các ứng dụng khác

## Định dạng PDF

### Định dạng đơn giản
```
THỜI KHÓA BIỂU

🌅 BUỔI SÁNG

Thứ 2
├── Tiết 1: Toán
├── Tiết 2: Văn
├── Tiết 3: Anh
├── Tiết 4: Lý
└── Tiết 5: Hóa

Thứ 3
├── Tiết 1: Lý
├── Tiết 2: Hóa
├── Tiết 3: Toán
├── Tiết 4: Văn
└── Tiết 5: Anh

🌆 BUỔI CHIỀU

Thứ 2
├── Tiết 6: Sinh
├── Tiết 7: Sử
├── Tiết 8: Địa
├── Tiết 9: GDCD
└── Tiết 10: Thể dục

Thứ 3
├── Tiết 6: Công nghệ
├── Tiết 7: Tin học
├── Tiết 8: Âm nhạc
├── Tiết 9: Mỹ thuật
└── Tiết 10: Hoạt động
```

### Định dạng bảng
```
🌅 BUỔI SÁNG

┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│  Tiết   │  Thứ 2  │  Thứ 3  │  Thứ 4  │  Thứ 5  │  Thứ 6  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 1  │  Toán   │   Lý    │   Hóa    │   Sinh   │   Văn    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 2  │  Văn    │  Hóa    │   Toán   │   Lý     │   Anh    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 3  │  Anh    │  Toán   │   Văn    │   Hóa    │   Toán   │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 4  │  Lý     │  Văn    │   Lý     │   Toán   │   Lý     │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 5  │  Hóa    │  Anh    │   Sinh   │   Văn    │   Hóa    │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

🌆 BUỔI CHIỀU

┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│  Tiết   │  Thứ 2  │  Thứ 3  │  Thứ 4  │  Thứ 5  │  Thứ 6  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 6  │  Sinh   │  Công   │   Sử    │   Địa   │   GDCD   │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 7  │  Sử     │  Tin    │   Địa   │   GDCD  │   Thể    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 8  │  Địa    │  Âm     │   GDCD  │   Thể   │   Công   │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 9  │  GDCD   │  Mỹ     │   Thể   │   Công  │   Tin    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Tiết 10 │  Thể    │  Hoạt   │   Công  │   Tin   │   Âm     │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

## Tính năng mới: Tách bảng Sáng/Chiều

### Lợi ích
- **Dễ đọc**: TKB được chia thành 2 phần rõ ràng
- **Quản lý tốt hơn**: Dễ dàng phân biệt lịch học buổi sáng và chiều
- **Giao diện đẹp**: Sử dụng icon và màu sắc để phân biệt
- **Linh hoạt**: Tự động phát hiện số tiết học và tạo bảng phù hợp

### Cách hoạt động
- **Buổi sáng**: Tự động lấy Tiết 1-5 từ dữ liệu TKB
- **Buổi chiều**: Tự động lấy Tiết 6-10 từ dữ liệu TKB
- **Icon trực quan**: 🌅 cho buổi sáng, 🌆 cho buổi chiều
- **Màu sắc**: Sử dụng màu xanh dương nhạt để phân biệt tiêu đề

## Lưu ý kỹ thuật

### Dependencies
- `expo-print`: Tạo PDF từ HTML
- `expo-file-system`: Quản lý file local
- `expo-sharing`: Mở và chia sẻ file

### Lưu trữ
- File PDF được lưu trong thư mục Documents của ứng dụng
- Tên file: `ThoiKhoaBieu_[format]_[ngày].pdf`
- Ví dụ: `ThoiKhoaBieu_simple_2024-01-15.pdf`

### Tương thích
- Hoạt động trên cả iOS và Android
- Không cần kết nối internet để tạo PDF
- PDF được tạo với chất lượng cao, hỗ trợ tiếng Việt
- Tự động xử lý TKB có ít hoặc nhiều tiết học

## Xử lý lỗi

### Lỗi thường gặp
1. **"Không thể tạo PDF"**: Kiểm tra quyền truy cập file, khởi động lại ứng dụng
2. **"Lỗi kết nối"**: Không áp dụng (tạo PDF local)
3. **File không mở được**: Kiểm tra xem thiết bị có ứng dụng đọc PDF không

### Khắc phục
- Khởi động lại ứng dụng
- Kiểm tra quyền truy cập file
- Cài đặt ứng dụng đọc PDF (Adobe Reader, Google PDF Viewer...)

## Tính năng nâng cao

### Tùy chỉnh giao diện
- Có thể thay đổi màu sắc, font chữ trong file `services/pdfService.ts`
- Hỗ trợ CSS để tùy chỉnh giao diện PDF
- Icon và màu sắc có thể tùy chỉnh

### Mở rộng
- Có thể thêm watermark, header/footer tùy chỉnh
- Hỗ trợ xuất nhiều định dạng khác (Excel, Word...)
- Tích hợp với cloud storage để lưu trữ online
- Có thể thêm thông tin giờ học cụ thể cho từng tiết

## Hỗ trợ
Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log console để xem lỗi chi tiết
2. Thử tạo PDF với định dạng khác
3. Liên hệ đội phát triển với thông tin lỗi cụ thể 