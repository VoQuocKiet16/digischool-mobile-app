import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const Slot_Information = () => {
  return (
    <View style={styles.container}>
      {/* Card 1: Thông tin bài học */}
      <ThemedView style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Thông tin bài học</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Chất và cấu tạo của chất</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>9:00 - 9:45</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="house.fill" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Thầy/Cô Nguyen Van B</ThemedText>
        </View>
      </ThemedView>

      {/* Card 2: Mô tả thêm */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Mô tả thêm</ThemedText>
        </View>
        <ThemedText style={styles.descText}>
          Kiểm tra 1 tiết về "Chất và cấu tạo của chất"
          Mang theo sách giáo khoa và ghi chú nếu cần.
        </ThemedText>
      </ThemedView>

      {/* Card 3: Thông tin kiểm tra */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Thông tin kiểm tra</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Kiểm tra 1 tiết</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Học 2 bài gần nhất</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="house.fill" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Mang theo dụng cụ thí nghiệm, nếu có</ThemedText>
        </View>
      </ThemedView>

      {/* Card 4: Tình trạng tiết học */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Tình trạng tiết học</ThemedText>
        </View>
        {/* Đã hoàn thành tiết học */}
        <View style={styles.statusRowGreen}>
          <View style={styles.statusIconWrap}>
            {/* Sử dụng icon check hoặc clipboard */}
            <IconSymbol name="house.fill" size={20} color="#fff" />
          </View>
          <ThemedText style={styles.statusTextWhite}>Đã hoàn thành tiết học</ThemedText>
        </View>
        {/* Đánh giá: A+ */}
        <View style={styles.statusRowGreen}>
          <View style={styles.statusIconWrap}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="#fff" />
          </View>
          <ThemedText style={styles.statusTextWhite}>Đánh giá: A+</ThemedText>
        </View>
        {/* Chưa đánh giá tiết học */}
        <View style={styles.statusRowBlueWrap}>
          <View style={styles.statusRowBlueLeft}>
            <View style={styles.statusIconWrapBlue}>
              <IconSymbol name="chevron.right" size={20} color={Colors.light.icon} />
            </View>
            <ThemedText style={styles.statusTextBlue}>Chưa đánh giá tiết học</ThemedText>
          </View>
          <View style={styles.statusAlertDot} />
          <View style={styles.statusArrowWrap}>
            <IconSymbol name="chevron.right" size={22} color={Colors.light.icon} />
          </View>
        </View>
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
  },
  card: {
    width: '92%',
    backgroundColor: '#F3F6FA',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBar: {
    width: 4,
    height: 28,
    backgroundColor: '#F9A825',
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
    color: '#26324D',
    fontWeight: '700',
    fontSize: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 4,
  },
  infoText: {
    marginLeft: 10,
    color: '#26324D',
    fontSize: 15,
  },
  descText: {
    color: '#26324D',
    fontSize: 15,
    marginLeft: 14,
    marginTop: 2,
    lineHeight: 22,
  },
  // Style cho card đánh giá tiết học
  statusRowGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5FC16E',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  statusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextWhite: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusRowBlueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B6E0E6',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  statusRowBlueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconWrapBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F6F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextBlue: {
    color: '#2CA6B0',
    fontSize: 16,
    fontWeight: '600',
  },
  statusAlertDot: {
    position: 'absolute',
    left: -2,
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: '#F04438',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  statusArrowWrap: {
    marginLeft: 8,
    marginRight: 2,
  },
});

export default Slot_Information;
