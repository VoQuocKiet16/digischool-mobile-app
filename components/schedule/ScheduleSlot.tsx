import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ScheduleSlotProps {
  text: string;
  dayIndex: number;
  periodIndex: number;
  onAddActivity: (dayIndex: number, periodIndex: number, activity: string) => void;
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
      <Modal
        visible={modalVisible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Thêm hoạt động</Text>
            <TextInput
              style={styles.input}
              value={activity}
              onChangeText={setActivity}
              placeholder="Nhập tên hoạt động..."
              placeholderTextColor="#999"
            />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveActivity}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#3A546D',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#3A546D',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScheduleSlot;