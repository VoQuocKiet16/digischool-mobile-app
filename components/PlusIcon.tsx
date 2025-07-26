import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../utils/responsive";

interface PlusIconProps {
  onPress?: (event: GestureResponderEvent) => void;
  text?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({
  onPress,
  text = "Thêm ghi chú",
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name="add" size={24} color="#29375C" />
      </View>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e9eaee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  text: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});

export default PlusIcon;
