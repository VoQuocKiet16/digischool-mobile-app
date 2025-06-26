import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScheduleSlotProps {
  text: string;
  dayIndex: number;
  periodIndex: number;
  onAddActivity?: (dayIndex: number, periodIndex: number, activity: string) => void;
  hasNotification?: boolean;
  isUserAdded?: boolean;
  isSelected?: boolean;
  onSlotPress?: (dayIndex: number, periodIndex: number) => void;
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = ({
  text,
  dayIndex,
  periodIndex,
  onAddActivity,
  hasNotification,
  isUserAdded,
  isSelected,
  onSlotPress,
}) => {
  const router = useRouter();

  const isEmpty = text === 'Thêm hoạt động' || !text;

  const handleAdd = () => {
    if (onSlotPress && !isEmpty) {
      onSlotPress(dayIndex, periodIndex);
    } else if (onAddActivity && isEmpty) {
      onAddActivity(dayIndex, periodIndex, text);
    } else if (isEmpty) {
      router.push({
        pathname: '/students/schedule/add_activity',
        params: { periodIndex }
      });
    }
  };

  let slotStyle = styles.filledSlot;
  let slotText = text;
  let textStyle = styles.filledSlotText;
  if (isEmpty) {
    slotStyle = styles.emptySlot as any;
    textStyle = styles.emptySlotText;
  } else if (isSelected) {
    slotStyle = styles.selectedSlot;
    slotText = 'Đã chọn';
    textStyle = styles.selectedSlotText;
  } else if (isUserAdded) {
    slotStyle = styles.userAddedSlot;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={slotStyle}
        onPress={handleAdd}
        activeOpacity={onSlotPress && isEmpty ? 1 : 0.7}
        disabled={onSlotPress && isEmpty}
      >
        <Text
          style={textStyle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {slotText}
        </Text>
      </TouchableOpacity>
      {hasNotification && (
        <View style={styles.notificationPin}>
          <FontAwesome name="exclamation" size={12} color="#fff" style={styles.notificationText} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledSlot: {
    backgroundColor: '#3A546D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '90%',
    height: 77,
    minHeight: 77,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: '#D0D5DD',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '90%',
    height: 77,
    minHeight: 77,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  userAddedSlot: {
    backgroundColor: '#36a38f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '90%',
    height: 77,
    minHeight: 77,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  filledSlotText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  emptySlotText: {
    color: '#A0A0A0',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  notificationPin: {
    position: 'absolute',
    top: -6,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: '#F04438',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedSlot: {
    backgroundColor: '#FFA726',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '90%',
    height: 77,
    minHeight: 77,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedSlotText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default ScheduleSlot;