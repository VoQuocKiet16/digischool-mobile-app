import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DaySelectorProps {
  days: string[];
}

const DaySelector: React.FC<DaySelectorProps> = ({ days }) => {
  const [selectedDay, setSelectedDay] = useState(2); // Thứ 4 is selected by default
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.utilityButton} onPress={() => setMenuVisible(true)}>
        <Text style={styles.utilityButtonText}>▼</Text>
      </TouchableOpacity>

      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDay === index && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === index && styles.selectedDayText,
                day === 'CN' && ! (selectedDay === index) && styles.sundayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Xuất TKB ra</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Xin phép nghỉ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#f7f8fa',
  },
  utilityButton: {
    backgroundColor: '#3A546D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  utilityButtonText: {
    color: '#fff',
    fontSize: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: '#3A546D',
  },
  dayText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 11,
  },
  selectedDayText: {
    color: '#fff',
  },
  sundayText: {
    color: 'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 155, // Adjust this value based on your header's height
    left: 15,
    backgroundColor: '#3A546D',
    borderRadius: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 15,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default DaySelector;