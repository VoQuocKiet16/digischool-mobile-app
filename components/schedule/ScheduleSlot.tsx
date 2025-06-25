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
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = ({
  text,
  dayIndex,
  periodIndex,
  onAddActivity,
  hasNotification,
  isUserAdded,
}) => {
  const router = useRouter();

  const handleAdd = () => {
    if (text === 'Thêm hoạt động') {
      router.push({
        pathname: '/students/schedule/add_activity',
        params: { periodIndex }
      });
    }
  };

  const isEmpty = text === 'Thêm hoạt động' || !text;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={
          isEmpty
            ? styles.emptySlot
            : isUserAdded
            ? styles.userAddedSlot
            : styles.filledSlot
        }
        onPress={handleAdd}
        activeOpacity={0.7}
      >
        <Text
          style={isEmpty ? styles.emptySlotText : styles.filledSlotText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
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
});

export default ScheduleSlot;