import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import LoadingModal from "../components/LoadingModal";
import manageService from "../services/manage.service";

// Data cứng cho demo
const ACADEMIC_YEARS = ["2025-2026", "2024-2025"];
const GRADE_LEVELS = ["10", "11", "12"];
const SEMESTERS = ["1", "2"];

// Data mẫu cho Excel preview
const SAMPLE_EXCEL_DATA = [
  {
    Lớp: "10A1",
    "Môn học": "Toán",
    "Giáo viên": "Nguyễn Văn A",
    Ngày: "Thứ 2",
    Tiết: 1,
    Tuần: 1,
    Buổi: "Sáng",
    "Bài học": "Chương 1: Hàm số"
  },
  {
    Lớp: "10A1",
    "Môn học": "Vật lý",
    "Giáo viên": "Trần Thị B",
    Ngày: "Thứ 2",
    Tiết: 2,
    Tuần: 1,
    Buổi: "Sáng",
    "Bài học": "Chương 1: Cơ học"
  },
  {
    Lớp: "10A1",
    "Môn học": "Chào cờ",
    "Giáo viên": "Lê Văn C",
    Ngày: "Thứ 2",
    Tiết: 3,
    Tuần: 1,
    Buổi: "Sáng",
    "Bài học": "Chào cờ"
  }
];

export default function ManageSchedule() {
  const [userName, setUserName] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  
  // Form data
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [weekNumber, setWeekNumber] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Dropdown states
  const [showAcademicYear, setShowAcademicYear] = useState(false);
  const [showGradeLevel, setShowGradeLevel] = useState(false);
  const [showSemester, setShowSemester] = useState(false);

  // Initialize service
  const scheduleService = manageService;

  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
  }, []);

  const handleImportExcel = () => {
    setShowImportModal(true);
  };

  const handlePreviewExcel = () => {
    setShowPreviewModal(true);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      Alert.alert("Lỗi", "Vui lòng chọn file Excel trước khi import.");
      return;
    }

    setIsLoading(true);
    setShowImportModal(false);
    setLoadingModalVisible(true);
    setLoadingSuccess(false);

    try {
      const importData = {
        academicYear,
        gradeLevel,
        semester,
        weekNumber,
        startDate,
        endDate,
        file: selectedFile,
      };

      const result = await scheduleService.importScheduleFromExcel(importData);
      
      if (result.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setLoadingModalVisible(false);
          setLoadingSuccess(false);
        }, 2000);
      } else {
        setLoadingModalVisible(false);
        Alert.alert("Lỗi", result.message || "Import thất bại");
      }
    } catch (error: any) {
      setLoadingModalVisible(false);
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = "Không thể import file. Vui lòng thử lại.";
      if (error.response?.status === 404) {
        errorMessage = "API endpoint không tồn tại (404). Vui lòng kiểm tra cấu hình backend.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Lỗi Import", errorMessage);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Tạo file object cho FormData
        const fileObject = {
          uri: file.uri,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          name: file.name,
        };
        
        setSelectedFile(fileObject);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn file. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Thời khoá biểu" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Quản lý thời khóa biểu</Text>
          <Text style={styles.headerSubtitle}>
            Tạo và quản lý thời khóa biểu cho các lớp học
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleImportExcel}
              activeOpacity={0.8}
            >
              <MaterialIcons name="file-upload" size={24} color="#29375C" />
              <Text style={styles.actionButtonText}>Import Excel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handlePreviewExcel}
              activeOpacity={0.8}
            >
              <MaterialIcons name="preview" size={24} color="#29375C" />
              <Text style={styles.actionButtonText}>Xem mẫu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Import Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Hướng dẫn import</Text>
          
          <View style={styles.instructionCard}>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Chuẩn bị file Excel</Text>
                <Text style={styles.stepDescription}>
                  File Excel phải có các cột: Lớp, Môn học, Giáo viên, Ngày, Tiết, Tuần, Buổi, Bài học
                </Text>
              </View>
            </View>

            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Cấu hình thông tin</Text>
                <Text style={styles.stepDescription}>
                  Chọn năm học, khối lớp, học kỳ và tuần học tương ứng
                </Text>
              </View>
            </View>

            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Upload và xử lý</Text>
                <Text style={styles.stepDescription}>
                  Hệ thống sẽ tự động tạo thời khóa biểu và lấp đầy các tiết trống
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Schedules */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Thời khóa biểu gần đây</Text>
          
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <MaterialIcons name="schedule" size={20} color="#29375C" />
              <Text style={styles.scheduleTitle}>Lớp 10A1 - Tuần 1</Text>
              <Text style={styles.scheduleDate}>01/09/2024 - 07/09/2024</Text>
            </View>
            <View style={styles.scheduleStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>30</Text>
                <Text style={styles.statLabel}>Tiết học</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Môn học</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Giáo viên</Text>
              </View>
            </View>
          </View>

          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <MaterialIcons name="schedule" size={20} color="#29375C" />
              <Text style={styles.scheduleTitle}>Lớp 11B2 - Tuần 2</Text>
              <Text style={styles.scheduleDate}>08/09/2024 - 14/09/2024</Text>
            </View>
            <View style={styles.scheduleStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>28</Text>
                <Text style={styles.statLabel}>Tiết học</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>9</Text>
                <Text style={styles.statLabel}>Môn học</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statLabel}>Giáo viên</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import thời khóa biểu</Text>
              <TouchableOpacity 
                onPress={() => setShowImportModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#29375C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Academic Year */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Năm học *</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowAcademicYear(!showAcademicYear)}
                  >
                    <Text style={styles.dropdownText}>{academicYear}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#29375C" />
                  </TouchableOpacity>
                  {showAcademicYear && (
                    <View style={styles.dropdownList}>
                      {ACADEMIC_YEARS.map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setAcademicYear(year);
                            setShowAcademicYear(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Grade Level */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Khối lớp *</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowGradeLevel(!showGradeLevel)}
                  >
                    <Text style={styles.dropdownText}>{gradeLevel}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#29375C" />
                  </TouchableOpacity>
                  {showGradeLevel && (
                    <View style={styles.dropdownList}>
                      {GRADE_LEVELS.map((grade) => (
                        <TouchableOpacity
                          key={grade}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setGradeLevel(grade);
                            setShowGradeLevel(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{grade}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Semester */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Học kỳ *</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => setShowSemester(!showSemester)}
                  >
                    <Text style={styles.dropdownText}>{semester}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#29375C" />
                  </TouchableOpacity>
                  {showSemester && (
                    <View style={styles.dropdownList}>
                      {SEMESTERS.map((sem) => (
                        <TouchableOpacity
                          key={sem}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSemester(sem);
                            setShowSemester(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{sem}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Week Number */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Tuần học</Text>
                <TextInput
                  style={styles.textInput}
                  value={weekNumber}
                  onChangeText={setWeekNumber}
                  placeholder="Nhập số tuần (1-52)"
                  keyboardType="numeric"
                />
              </View>



              {/* Date Range */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Ngày bắt đầu (tùy chọn)</Text>
                <TextInput
                  style={styles.textInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7B859C"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Ngày kết thúc (tùy chọn)</Text>
                <TextInput
                  style={styles.textInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7B859C"
                />
              </View>

              {/* File Upload */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>File Excel *</Text>
                <TouchableOpacity 
                  style={styles.fileUploadButton}
                  onPress={handleFileSelect}
                  disabled={isLoading}
                >
                  <MaterialIcons name="cloud-upload" size={24} color="#29375C" />
                  <Text style={styles.fileUploadText}>
                    {selectedFile ? selectedFile.name : "Chọn file Excel"}
                  </Text>
                </TouchableOpacity>
                {selectedFile && (
                  <Text style={styles.fileSelectedText}>
                    ✓ File đã chọn: {selectedFile.name}
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, isLoading && styles.disabledButton]}
                onPress={handleConfirmImport}
                disabled={isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? "Đang import..." : "Import"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mẫu file Excel</Text>
              <TouchableOpacity 
                onPress={() => setShowPreviewModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#29375C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.previewDescription}>
                File Excel phải có định dạng như sau:
              </Text>
              
              <View style={styles.previewTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Lớp</Text>
                  <Text style={styles.tableHeaderText}>Môn học</Text>
                  <Text style={styles.tableHeaderText}>Giáo viên</Text>
                  <Text style={styles.tableHeaderText}>Ngày</Text>
                  <Text style={styles.tableHeaderText}>Tiết</Text>
                  <Text style={styles.tableHeaderText}>Tuần</Text>
                  <Text style={styles.tableHeaderText}>Buổi</Text>
                  <Text style={styles.tableHeaderText}>Bài học</Text>
                </View>
                
                {SAMPLE_EXCEL_DATA.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{row.Lớp}</Text>
                    <Text style={styles.tableCell}>{row["Môn học"]}</Text>
                    <Text style={styles.tableCell}>{row["Giáo viên"]}</Text>
                    <Text style={styles.tableCell}>{row.Ngày}</Text>
                    <Text style={styles.tableCell}>{row.Tiết}</Text>
                    <Text style={styles.tableCell}>{row.Tuần}</Text>
                    <Text style={styles.tableCell}>{row.Buổi}</Text>
                    <Text style={styles.tableCell}>{row["Bài học"]}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.previewNotes}>
                <Text style={styles.noteTitle}>Lưu ý:</Text>
                <Text style={styles.noteText}>• Ngày: Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7</Text>
                <Text style={styles.noteText}>• Tiết: Số từ 1-10</Text>
                <Text style={styles.noteText}>• Buổi: Sáng, Chiều</Text>
                <Text style={styles.noteText}>• Môn học đặc biệt: "Chào cờ", "Sinh hoạt lớp"</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => setShowPreviewModal(false)}
              >
                <Text style={styles.confirmButtonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalVisible}
        text={loadingSuccess ? "Import thành công!" : "Đang import thời khóa biểu..."}
        success={loadingSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  quickActionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#D7DCE5",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
  },
  instructionsSection: {
    marginBottom: 30,
  },
  instructionCard: {
    backgroundColor: "#D7DCE5",
    borderRadius: 12,
    padding: 20,
  },
  instructionStep: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#29375C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    lineHeight: 20,
  },
  recentSection: {
    marginBottom: 30,
  },
  scheduleCard: {
    backgroundColor: "#D7DCE5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginLeft: 8,
    flex: 1,
  },
  scheduleDate: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  scheduleStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D7DCE5",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 8,
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D7DCE5",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7DCE5",
    zIndex: 1000,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D7DCE5",
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  fileUploadButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    borderWidth: 2,
    borderColor: "#D7DCE5",
    borderStyle: "dashed",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  fileUploadText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  fileSelectedText: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7ED957",
    marginTop: 8,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#D7DCE5",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#7B859C",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#29375C",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#fff",
  },
  disabledButton: {
    backgroundColor: "#7B859C",
    opacity: 0.6,
  },
  previewDescription: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginBottom: 15,
  },
  previewTable: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#29375C",
    padding: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Baloo2-SemiBold",
    color: "#fff",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
    padding: 8,
    textAlign: "center",
  },
  previewNotes: {
    backgroundColor: "#D7DCE5",
    borderRadius: 8,
    padding: 15,
  },
  noteTitle: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginBottom: 4,
  },
});
