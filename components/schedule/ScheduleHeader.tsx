import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScheduleHeaderProps {
  title: string;
  dateRange: string;
  year: string;
  onPressTitle?: () => void;
  onChangeYear?: () => void;
  onChangeDateRange?: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  title,
  dateRange,
  year,
  onPressTitle,
  onChangeYear,
  onChangeDateRange,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {title === "Buổi chiều" && (
          <TouchableOpacity
            onPress={onPressTitle}
            style={styles.arrowButtonLeft}
          >
            <MaterialIcons
              name="arrow-left"
              size={35}
              color="#29375C"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {title === "Buổi sáng" && (
          <TouchableOpacity
            onPress={onPressTitle}
            style={styles.arrowButtonRight}
          >
            <MaterialIcons
              name="arrow-right"
              size={35}
              color="#29375C"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.pickersContainer}>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={onChangeDateRange}
        >
          <Text style={styles.pickerText}>{dateRange}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerButton} onPress={onChangeYear}>
          <Text style={styles.pickerText}>{year}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#f7f8fa",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    color: "#29375C",
    textAlign: "center",
    fontFamily: "Baloo2-Bold",
  },
  arrowButtonLeft: {
    position: "absolute",
    left: 0,
    padding: 5,
  },
  arrowButtonRight: {
    position: "absolute",
    right: 0,
    padding: 5,
  },
  pickersContainer: {
    flexDirection: "row",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#29375C",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  pickerText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
  },
  pickerArrow: {
    color: "#fff",
  },
});

export default ScheduleHeader;
