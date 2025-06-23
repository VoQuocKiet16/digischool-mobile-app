import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScheduleHeaderProps {
  title: string;
  dateRange: string;
  year: string;
  onPressTitle: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ title, dateRange, year, onPressTitle }) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {title === 'Buổi chiều' && (
          <TouchableOpacity onPress={onPressTitle} style={styles.arrowButtonLeft}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {title === 'Buổi sáng' && (
          <TouchableOpacity onPress={onPressTitle} style={styles.arrowButtonRight}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.pickersContainer}>
        <TouchableOpacity style={styles.pickerButton}>
          <Text style={styles.pickerText}>{dateRange}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerButton}>
          <Text style={styles.pickerText}>{year}</Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#f7f8fa',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3A546D',
    textAlign: 'center',
  },
  arrowButtonLeft: {
    position: 'absolute',
    left: 0,
    padding: 5,
  },
  arrowButtonRight: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  arrowText: {
    fontSize: 18,
    color: '#3A546D',
  },
  pickersContainer: {
    flexDirection: 'row',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A546D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  pickerText: {
    color: '#fff',
    marginRight: 8,
    fontSize: 14,
  },
  pickerArrow: {
    color: '#fff',
    fontSize: 10,
  },
});

export default ScheduleHeader;