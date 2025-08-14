import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Activity } from '../types/schedule.types';

interface ScheduleData {
  periods: string[];
  days: string[];
  scheduleData: (Activity | null)[][];
  dateRange?: { start: string; end: string } | null;
}

export class PDFService {
  /**
   * Tạo HTML content cho PDF theo định dạng bảng với 2 bảng sáng/chiều
   */
  private static generateTableHTML(scheduleData: ScheduleData): string {
    const { periods, days, scheduleData: data, dateRange } = scheduleData;
    
    // Kiểm tra cấu trúc dữ liệu thực tế
    let actualPeriodsCount = 0;
    let actualDaysCount = 0;
    
    // Tìm số tiết học và số ngày thực tế
    if (data.length > 0) {
      actualPeriodsCount = data.length; // Số tiết học (10)
      if (data[0]) {
        actualDaysCount = data[0].length; // Số ngày (7)
      }
    }
    
    // Tạo periods cho buổi sáng (Tiết 1-5)
    const morningPeriods: string[] = [];
    for (let i = 0; i < Math.min(5, actualPeriodsCount); i++) {
      morningPeriods.push(`Tiết ${i + 1}`);
    }
    
    // Tạo periods cho buổi chiều (chỉ khi có dữ liệu)
    const afternoonPeriods: string[] = [];
    if (actualPeriodsCount > 5) {
      for (let i = 5; i < actualPeriodsCount; i++) {
        // Kiểm tra xem tiết này có dữ liệu không
        const hasData = data[i] && data[i].some(slot => slot && slot.text && slot.text.trim() !== '');
        if (hasData) {
          afternoonPeriods.push(`Tiết ${i + 1}`);
        }
      }
    }
    
    // Nếu không có tiết nào có dữ liệu, vẫn hiển thị tất cả 5 tiết buổi chiều
    if (afternoonPeriods.length === 0 && actualPeriodsCount > 5) {
      for (let i = 5; i < actualPeriodsCount; i++) {
        afternoonPeriods.push(`Tiết ${i + 1}`);
      }
    }

    if (actualPeriodsCount > 5 && afternoonPeriods.length < 5) {
        afternoonPeriods.length = 0; // Reset array
        for (let i = 5; i < actualPeriodsCount; i++) {
          afternoonPeriods.push(`Tiết ${i + 1}`);
        }
      }
    for (let i = 5; i < actualPeriodsCount; i++) {
      const periodData = data[i];
      if (periodData) {
        const nonEmptySlots = periodData.filter(slot => slot && slot.text && slot.text.trim() !== '');
      }
    }
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 20px;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
            color: #29375C;
          }
          .session-title {
            text-align: center;
            margin: 30px 0 20px 0;
            font-size: 16px;
            font-weight: bold;
            color: #1976d2;
            background-color: #e3f2fd;
            padding: 8px;
            border-radius: 6px;
            border: 2px solid #bbdefb;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 30px;
          }
          .schedule-table th,
          .schedule-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
          }
          .schedule-table th {
            background-color: #f7f7f7;
            font-weight: bold;
            color: #29375C;
          }
          .period-cell {
            background-color: #f7f7f7;
            font-weight: bold;
            color: #29375C;
            width: 80px;
          }
          .day-header {
            background-color: #29375C;
            color: white;
            font-weight: bold;
          }
          .sunday {
            color: #ff0000;
          }
          .empty-slot {
            background-color: #f9f9f9;
            color: #999;
          }
          .user-added {
            background-color: #e3f2fd;
            color: #1976d2;
          }
          .current-day {
            background-color: #BACDDD;
          }
        </style>
      </head>
      <body>
        <div class="header">
          THỜI KHÓA BIỂU
        </div>
    `;

    // Thêm thông tin ngày nếu có
    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      htmlContent += `
        <div style="text-align: center; margin-bottom: 15px; color: #666;">
          Từ ngày: ${startDate.toLocaleDateString('vi-VN')} - Đến ngày: ${endDate.toLocaleDateString('vi-VN')}
        </div>
      `;
    }

    // Tạo bảng buổi sáng
    if (morningPeriods.length > 0) {
      htmlContent += `
        <div class="session-title">🌅 BUỔI SÁNG</div>
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="period-cell">Tiết</th>
      `;

      // Thêm header cho các ngày
      days.forEach((day, index) => {
        const isSunday = day === 'CN';
        htmlContent += `
          <th class="day-header ${isSunday ? 'sunday' : ''}">${day}</th>
        `;
      });

      htmlContent += `
            </tr>
          </thead>
          <tbody>
      `;

      // Thêm các hàng tiết buổi sáng
      morningPeriods.forEach((period, periodIndex) => {
        htmlContent += `
          <tr>
            <td class="period-cell">${period}</td>
        `;

        // Thêm dữ liệu cho từng ngày
        for (let dayIndex = 0; dayIndex < actualDaysCount; dayIndex++) {
          const slotData = data[periodIndex] && data[periodIndex][dayIndex];
          
          if (!slotData || !slotData.text || slotData.text === '') {
            htmlContent += `
              <td class="empty-slot">-</td>
            `;
          } else {
            const cellClass = slotData.type === 'user-added' ? 'user-added' : '';
            htmlContent += `
              <td class="${cellClass}">${slotData.text}</td>
            `;
          }
        }

        htmlContent += `
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    // Tạo bảng buổi chiều
    if (afternoonPeriods.length > 0) {
      htmlContent += `
        <div class="session-title">🌆 BUỔI CHIỀU</div>
        <table class="schedule-table">
          <thead>
            <tr>
              <th class="period-cell">Tiết</th>
      `;

      // Thêm header cho các ngày
      days.forEach((day, index) => {
        const isSunday = day === 'CN';
        htmlContent += `
          <th class="day-header ${isSunday ? 'sunday' : ''}">${day}</th>
        `;
      });

      htmlContent += `
            </tr>
          </thead>
          <tbody>
      `;

      // Thêm các hàng tiết buổi chiều
      afternoonPeriods.forEach((period, periodIndex) => {
        const actualPeriodIndex = periodIndex + 5; // Offset để lấy đúng index trong data (Tiết 6-10)
        htmlContent += `
          <tr>
            <td class="period-cell">${period}</td>
        `;

        // Thêm dữ liệu cho từng ngày
        for (let dayIndex = 0; dayIndex < actualDaysCount; dayIndex++) {
          const slotData = data[actualPeriodIndex] && data[actualPeriodIndex][dayIndex];
          
          if (!slotData || !slotData.text || slotData.text === '') {
            htmlContent += `
              <td class="empty-slot">-</td>
            `;
          } else {
            const cellClass = slotData.type === 'user-added' ? 'user-added' : '';
            htmlContent += `
              <td class="${cellClass}">${slotData.text}</td>
            `;
          }
        }

        htmlContent += `
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    // Thêm thông tin debug
    htmlContent += `
      <div style="text-align: center; margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px; font-size: 10px; color: #666;">
        Debug: Tổng tiết: ${actualPeriodsCount}, Sáng: ${morningPeriods.length}, Chiều: ${afternoonPeriods.length}, Cấu trúc: ${data.length} ngày × ${actualPeriodsCount} tiết/ngày, Định dạng: 5 tiết sáng + 5 tiết chiều
      </div>
    </html>
    `;

    return htmlContent;
  }

  /**
   * Tạo PDF trực tiếp trên thiết bị
   */
  static async generateSchedulePDF(scheduleData: ScheduleData, format: 'simple' | 'table'): Promise<string | null> {
    try {
      // Chỉ sử dụng định dạng bảng
      const htmlContent = this.generateTableHTML(scheduleData);

      // Tạo PDF từ HTML
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      return uri;
    } catch (error) {

      return null;
    }
  }

  /**
   * Mở file PDF bằng ứng dụng mặc định
   */
  static async openPDF(fileUri: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Mở TKB PDF',
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Xóa file PDF local
   */
  static async deleteLocalPDF(fileUri: string): Promise<boolean> {
    try {
      if (fileUri) {
        await FileSystem.deleteAsync(fileUri);
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Kiểm tra xem file có tồn tại không
   */
  static async fileExists(fileUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }
} 