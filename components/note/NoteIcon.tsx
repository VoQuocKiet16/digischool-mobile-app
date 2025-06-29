import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';


interface NoteIconProps {
  onPress?: (event: GestureResponderEvent) => void;
}

const NoteIcon: React.FC<NoteIconProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <FontAwesome name="plus" size={24} color="#2d3a5a" />
      </View>
      <Text style={styles.text}>Thêm ghi chú</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9eaee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  text: {
    color: '#2d3a5a',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default NoteIcon;
