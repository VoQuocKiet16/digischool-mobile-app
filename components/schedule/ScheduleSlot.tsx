import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ScheduleSlotProps {
  text: string;
  dayIndex: number;
  periodIndex: number;
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
  hasNotification?: boolean;
}

const ScheduleSlot: React.FC<ScheduleSlotProps> = ({
  text,
  dayIndex,
  periodIndex,
  onAddActivity,
  hasNotification,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activity, setActivity] = useState('');

  const handleAdd = () => {
    if (text === 'Thêm hoạt động') {
      setModalVisible(true);
    }
  };

  const saveActivity = () => {
    if (activity) {
      onAddActivity(dayIndex, periodIndex, activity);
      setActivity('');
      setModalVisible(false);
    }
  };

  const isEmpty = text === 'Thêm hoạt động';
  const textParts = text.split(' ');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={isEmpty ? styles.emptySlot : styles.filledSlot}
        onPress={handleAdd}
        activeOpacity={0.7}
      >
        <Text style={isEmpty ? styles.emptySlotText : styles.filledSlotText}>{textParts[0]}</Text>
        {textParts.length > 1 && (
          <Text style={isEmpty ? styles.emptySlotText : styles.filledSlotText}>
            {textParts.slice(1).join(' ')}
          </Text>
        )}
      </TouchableOpacity>
      {hasNotification && (
        <View style={styles.notificationPin}>
          <Text style={styles.notificationText}>!</Text>
        </View>
      )}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={activity}
              onChangeText={setActivity}
              placeholder="Nhập hoạt động"
            />
            <Button title="Lưu" onPress={saveActivity} />
            <Button title="Hủy" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  filledSlotText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 6,
    textAlign: 'center',
  },
  emptySlotText: {
    color: '#A0A0A0',
    fontWeight: '600',
    fontSize: 4,
    textAlign: 'center',
  },
  notificationPin: {
    position: 'absolute',
    top: -8,
    right: 4,
    width: 20,
    height: 20,
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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});

export default ScheduleSlot;