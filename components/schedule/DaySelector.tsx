import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useUserData } from "../../hooks/useUserData";

interface DaySelectorProps {
  days: string[];
  onCurrentDayChange?: (currentDayIndex: number) => void;
  showUtilityButton?: boolean;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  onCurrentDayChange,
  showUtilityButton = true,
}) => {
  const [currentDay, setCurrentDay] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { userData } = useUserData();

  // Xác định ngày hiện tại khi component mount
  useEffect(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

    // Chuyển đổi sang index của mảng days (Thứ 2 = 0, Thứ 3 = 1, ..., CN = 6)
    const dayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    setCurrentDay(dayIndex);

    // Gọi callback để truyền thông tin lên component cha
    if (onCurrentDayChange) {
      onCurrentDayChange(dayIndex);
    }
  }, [onCurrentDayChange]);

  const handleLeaveRequest = () => {
    setMenuVisible(false);
    const role = userData?.roleInfo?.type;
    if (role === "teacher") {
      router.push("/teachers/leave_request/leave_request");
    } else {
      router.push("/students/leave_request/leave_request");
    }
  };

  const toggleMenuVisibility = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={styles.container}>
      {showUtilityButton && (
        <TouchableOpacity
          style={styles.utilityButton}
          onPress={toggleMenuVisibility}
        >
          <MaterialIcons
            name="arrow-drop-down"
            size={25}
            color="#fff"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </TouchableOpacity>
      )}
      <View
        style={[styles.daysContainer, !showUtilityButton && { marginLeft: 50 }]}
      >
        {days.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayButton,
              currentDay === index && styles.selectedDayButton,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                currentDay === index && styles.selectedDayText,
                day === "CN" && !(currentDay === index) && styles.sundayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <Modal
        transparent={true}
        statusBarTranslucent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={toggleMenuVisibility}
      >
        <TouchableWithoutFeedback onPress={toggleMenuVisibility}>
          <View style={{ flex: 1 }}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Xuất TKB ra</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLeaveRequest}
              >
                <Text style={styles.menuItemText}>Xin phép nghỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f7f7f7",
  },
  utilityButton: {
    backgroundColor: "#29375C",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 10,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  selectedDayButton: {
    backgroundColor: "#29375C",
  },
  dayText: {
    fontWeight: "bold",
    color: "#29375C",
    fontSize: 13,
    fontFamily: "Baloo2-SemiBold",
  },
  selectedDayText: {
    color: "#fff",
  },
  sundayText: {
    color: "red",
  },
  menuContainer: {
    position: "absolute",
    top: 300,
    left: 12,
    backgroundColor: "#29375C",
    borderRadius: 8,
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    padding: 15,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
});

export default DaySelector;
