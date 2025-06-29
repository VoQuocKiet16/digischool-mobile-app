import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface PlusIconProps {
  onPress?: (event: GestureResponderEvent) => void;
  text?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({ onPress, text = 'Thêm ghi chú' }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <FontAwesome name="plus" size={24} color="#2d3a5a" />
      </View>
      <Text style={styles.text}>{text}</Text>
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

export default PlusIcon;
