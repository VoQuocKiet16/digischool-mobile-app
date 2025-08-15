import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../../utils/responsive";

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
  const [showColorLegend, setShowColorLegend] = useState(false);

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
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowColorLegend(true)}
        >
          <MaterialIcons name="info" size={20} color="#29375C" />
        </TouchableOpacity>
      </View>

      {/* Modal chú thích màu sắc */}
      <Modal
        visible={showColorLegend}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorLegend(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chú thích màu sắc</Text>
              <TouchableOpacity
                onPress={() => setShowColorLegend(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#959698" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.colorLegendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#29375C" }]} />
                <Text style={styles.legendText}>Tiết học bình thường</Text>
              </View>
            
              
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#F04438" }]} />
                <Text style={styles.legendText}>Tiết học vắng mặt</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#059669" }]} />
                <Text style={styles.legendText}>Tiết học đã hoàn thành</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#5F99AE" }]} />
                <Text style={styles.legendText}>Hoạt động cá nhân</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.colorBox, { backgroundColor: "#E9762B" }]} />
                <Text style={styles.legendText}>Xung đột lịch học</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.medium,
  },
  pickerArrow: {
    color: "#fff",
  },
  infoButton: {
    position: "absolute",
    right: -50,
    top: 0,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: "#29375C",
  },
  closeButton: {
    padding: 5,
  },
  colorLegendContainer: {
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#29375C",
  },
});

export default ScheduleHeader;