import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import {
  createManualNotification,
  getClasses,
  getGrades
} from "../../services/notification.service";
import { getAllSubjects } from "../../services/subjects.service";
import { fonts } from "../../utils/responsive";

export default function NotificationCreateScreen() {
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [content, setContent] = useState("");
  const [scopeModal, setScopeModal] = useState(false);
  const [hasFilledFromParams, setHasFilledFromParams] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // States cho manager role
  const [scopeType, setScopeType] = useState("");
  const [department, setDepartment] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [departmentModal, setDepartmentModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "manager" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho API data
  const [departments, setDepartments] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [classes, setClasses] = useState<Array<{id: string, name: string, grade: number}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string>("");
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();

  // Animation values
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const arrowRotation = useRef(new Animated.Value(0)).current;
  const departmentDropdownAnimation = useRef(new Animated.Value(0)).current;
  const departmentArrowRotation = useRef(new Animated.Value(0)).current;
  const gradeDropdownAnimation = useRef(new Animated.Value(0)).current;
  const gradeArrowRotation = useRef(new Animated.Value(0)).current;
  const classDropdownAnimation = useRef(new Animated.Value(0)).current;
  const classArrowRotation = useRef(new Animated.Value(0)).current;

  // Animate dropdown when modal state changes
  React.useEffect(() => {
    if (scopeModal) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [scopeModal]);

  // Lấy user role và token từ AsyncStorage
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        // Lấy role
        const roleData = await AsyncStorage.getItem("role");
        if (roleData) {
          const roles = JSON.parse(roleData);
          if (Array.isArray(roles) && roles.length > 0) {
            const role = roles[0];
            if (role === "teacher" || role === "homeroom_teacher") {
              setUserRole("teacher");
            } else if (role === "manager") {
              setUserRole("manager");
            } else {
              setUserRole("teacher");
            }
          } else {
            setUserRole("teacher");
          }
        } else {
          setUserRole("teacher");
        }

        // Lấy token
        const userToken = await AsyncStorage.getItem("token");
        if (userToken) {
          setToken(userToken);
          
          // Load data cho manager
          if (userToken) {
            try {
              const [subjectsRes, gradeRes, classRes] = await Promise.all([
                getAllSubjects(),
                getGrades(userToken),
                getClasses(userToken)
              ]);
              
              if (subjectsRes.success && subjectsRes.data?.subjects) {
                // Lọc bỏ "Sinh hoạt lớp" và "Chào cờ"
                const filteredSubjects = subjectsRes.data.subjects
                  .filter(subject => 
                    subject.subjectName !== "Sinh hoạt lớp" && 
                    subject.subjectName !== "Chào cờ"
                  )
                  .map(subject => subject.subjectName);
                setDepartments(filteredSubjects);
              }
              if (gradeRes.success) setGrades(gradeRes.data.map((g: number) => `Khối ${g}`));
              if (classRes.success) setClasses(classRes.data);
            } catch (error) {
      
            }
          }
        }
      } catch (error) {
     
        setUserRole("teacher");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  // Nhận nội dung từ trang edit_notification_content nếu có
  React.useEffect(() => {
    if (!hasFilledFromParams && params && params.editedContent !== undefined) {
      setContent(params.editedContent as string);
      if (params.title !== undefined) setTitle(params.title as string);
      if (params.scope !== undefined) setScope(params.scope as string);
      
      // Khôi phục các giá trị dropdown cho manager
      if (params.scopeType !== undefined) setScopeType(params.scopeType as string);
      if (params.department !== undefined) setDepartment(params.department as string);
      if (params.grade !== undefined) setGrade(params.grade as string);
      if (params.selectedClass !== undefined) setSelectedClass(params.selectedClass as string);
      

      
      setHasFilledFromParams(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, hasFilledFromParams]);

  // Khôi phục tên lớp sau khi classes được load
  React.useEffect(() => {
    if (params && params.selectedClass && classes.length > 0 && !selectedClassName) {
      const classItem = classes.find(c => c.id === params.selectedClass);
      if (classItem) {
        setSelectedClassName(classItem.name);
      }
    }
  }, [classes, params, selectedClassName]);

  const toggleDropdown = () => {
    setScopeModal(!scopeModal);
  };

  const selectScope = (selectedScope: string) => {
    setScope(selectedScope);
    setScopeModal(false);
  };

  const selectScopeType = (type: string) => {
    setScopeType(type);
    setScopeModal(false);
    // Reset các dropdown con khi thay đổi loại phạm vi
    setDepartment("");
    setGrade("");
    setSelectedClass("");
    setSelectedClassName("");
  };

  const isValid = Boolean(
    title.trim() && 
    content.trim() && 
    (userRole === "teacher" || 
     (userRole === "manager" && scopeType && 
      (scopeType === "Toàn trường" || 
       (scopeType === "Bộ môn" && department) ||
       (scopeType === "Khối" && grade) ||
       (scopeType === "Lớp" && selectedClass)
      )
     )
    )
  );

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || !token) return;
    
    setIsSubmitting(true);
    setShowLoading(true);
    setLoadingSuccess(false);
    
    try {
      const notificationData: any = {
        title: title.trim(),
        content: content.trim(),
      };

      // Thêm scope data cho manager
      if (userRole === "manager") {
        notificationData.scopeType = scopeType;
        
        if (scopeType === "Bộ môn") {
          notificationData.department = department;
        } else if (scopeType === "Khối") {
          notificationData.grade = grade.replace("Khối ", "");
        } else if (scopeType === "Lớp") {
          notificationData.selectedClass = selectedClass;
        }
      }

      const response = await createManualNotification(notificationData, token);
      
      if (response.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          setIsSubmitting(false);
          router.push("/notification/notification_list");
        }, 1000);
      } else {
        Alert.alert("Lỗi", response.message || "Gửi thông báo thất bại!");
        setShowLoading(false);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      Alert.alert("Lỗi", "Gửi thông báo thất bại. Vui lòng thử lại!");
      setShowLoading(false);
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <HeaderLayout
        title="Tạo thông báo"
        onBack={() => router.back()}
        subtitle="Tạo mẫu thông báo gửi đến học sinh"
      >
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: "#29375C", fontSize: 16 }}>Đang tải...</Text>
        </View>
      </HeaderLayout>
    );
  }

  return (
    <HeaderLayout
      title="Tạo thông báo"
      onBack={() => router.push("/notification/notification_list")}
      subtitle="Tạo mẫu thông báo gửi đến học sinh"
    >
      <View style={styles.container}>
        {/* Tiêu đề */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
            Tiêu đề <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
              style={styles.inputTextOutline}
              placeholder="Nhập tiêu đề thông báo"
              placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        </View>

        {/* Phạm vi thông báo */}
        {userRole === "teacher" ? (
          // Giáo viên chỉ có 1 option
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
            Phạm vi thông báo <Text style={styles.required}>*</Text>
          </Text>
              <Text style={styles.teacherScopeText}>Lớp đảm nhiệm</Text>
            </View>
          </View>
        ) : (
          // Manager có nhiều options
          <>
            {/* Loại phạm vi */}
            <View style={styles.fieldWrap}>
              <View style={styles.outlineInputBox}>
                <Text style={styles.floatingLabel}>
                  Loại phạm vi <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={toggleDropdown}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      scopeType ? styles.dropdownText : styles.dropdownPlaceholder
                    }
                  >
                    {scopeType || "Chọn loại phạm vi"}
                  </Text>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: arrowRotation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "180deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#29375C"
                    />
                  </Animated.View>
                </TouchableOpacity>
                {scopeModal && (
                  <Animated.View
                    style={[
                      styles.modalContent,
                      {
                        opacity: dropdownAnimation,
                        transform: [
                          {
                            translateY: dropdownAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-5, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {["Toàn trường", "Bộ môn", "Khối", "Lớp"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={styles.modalItem}
                        onPress={() => selectScopeType(type)}
                      >
                        <Text style={styles.modalItemText}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Dropdown bổ sung cho manager */}
            {scopeType === "Bộ môn" && (
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chọn bộ môn <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setDepartmentModal(!departmentModal)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        department ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {department || "Chọn bộ môn"}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: departmentArrowRotation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "180deg"],
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color="#29375C"
                      />
                    </Animated.View>
                  </TouchableOpacity>
                  {departmentModal && (
                    <Animated.View style={[styles.modalContent, { maxHeight: 200 }]}>
                      <ScrollView 
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        {departments.map((dept, index) => (
                          <TouchableOpacity
                            key={`dept-${index}-${dept}`}
                            style={styles.modalItem}
                            onPress={() => {
                              setDepartment(dept);
                              setDepartmentModal(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{dept}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>
              </View>
            )}

            {scopeType === "Khối" && (
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chọn khối <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setGradeModal(!gradeModal)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        grade ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {grade || "Chọn khối"}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: gradeArrowRotation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "180deg"],
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color="#29375C"
                      />
                    </Animated.View>
                  </TouchableOpacity>
                  {gradeModal && (
                    <Animated.View style={[styles.modalContent, { maxHeight: 150 }]}>
                      <ScrollView 
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        {grades.map((gradeItem, index) => (
                          <TouchableOpacity
                            key={`grade-${index}-${gradeItem}`}
                            style={styles.modalItem}
                            onPress={() => {
                              setGrade(gradeItem);
                              setGradeModal(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{gradeItem}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>
              </View>
            )}

            {scopeType === "Lớp" && (
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chọn lớp <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setClassModal(!classModal)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        selectedClassName ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {selectedClassName || "Chọn lớp"}
                    </Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: classArrowRotation.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", "180deg"],
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color="#29375C"
                      />
                    </Animated.View>
                  </TouchableOpacity>
                  {classModal && (
                    <Animated.View style={[styles.modalContent, { maxHeight: 200 }]}>
                      <ScrollView 
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        {classes.map((classItem, index) => (
                          <TouchableOpacity
                            key={`class-${index}-${classItem.id}`}
                            style={styles.modalItem}
                                                      onPress={() => {
                            setSelectedClass(classItem.id);
                            setSelectedClassName(classItem.name);
                            setClassModal(false);
                          }}
                          >
                            <Text style={styles.modalItemText}>{classItem.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {/* Nội dung */}
        <View
          style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        >
          <TouchableOpacity
            style={[
              styles.contentInputBox,
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
                justifyContent: content.trim() ? "space-between" : "flex-start",
              },
            ]}
            onPress={() =>
              content.trim()
                ? setPreviewVisible(true)
                : router.push({
                    pathname: "/notification/edit_notification_content" as any,
                    params: { 
                      content, 
                      title, 
                      scope,
                      scopeType,
                      department,
                      grade,
                      selectedClass,
                      selectedClassName
                    },
                  })
            }
            activeOpacity={0.85}
          >
            <MaterialIcons
              name="edit"
              size={22}
              color="#29375C"
              style={{ marginRight: 10 }}
            />
            <Text
              style={[
                styles.contentInputText,
                content.trim() && { textDecorationLine: "underline" },
              ]}
            >
              {content.trim() ? "Xem trước nội dung" : "Thêm nội dung"}
              {!content.trim() && <Text style={styles.required}>*</Text>}
            </Text>
            {content.trim() ? (
              <TouchableOpacity
                style={{
                  backgroundColor: "#29375C",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginLeft: 10,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/notification/edit_notification_content" as any,
                    params: { 
                      content, 
                      title, 
                      scope,
                      scopeType,
                      department,
                      grade,
                      selectedClass,
                      selectedClassName
                    },
                  })
                }
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: fonts.medium,
                    fontSize: 14,
                  }}
                >
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Modal xem trước nội dung dạng WebView */}
        <Modal
          visible={previewVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.25)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "92%",
                height: "70%",
                backgroundColor: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                elevation: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  backgroundColor: "#f7f7f7",
                  borderBottomWidth: 1,
                  borderColor: "#E0E0E0",
                }}
              >
                <Text
                  style={{
                    color: "#29375C",
                    fontFamily: fonts.semiBold,
                    fontSize: 16,
                  }}
                >
                  Xem trước nội dung
          </Text>
                <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#29375C" />
                </TouchableOpacity>
        </View>
              <WebView
                originWhitelist={["*"]}
                source={{
                  html: `<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body style='font-family:sans-serif;padding:16px;'>${content}</body></html>`,
                }}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
          />
        </View>
          </View>
        </Modal>

        {/* Nút gửi thông báo */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!isValid || isSubmitting) && styles.saveBtnDisabled,
          ]}
          disabled={!isValid || isSubmitting}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.saveBtnText,
              (!isValid || isSubmitting) && { color: "#A0A0A0" },
            ]}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi thông báo"}
          </Text>
        </TouchableOpacity>

        {/* Loading Modal */}
        <LoadingModal
          visible={showLoading}
          text={
            loadingSuccess
              ? "Gửi thành công!"
              : "Đang gửi..."
          }
          success={loadingSuccess}
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fieldWrap: {
    marginBottom: 5,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 20,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    minHeight: 22,
  },
  dropdownText: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: fonts.medium,
  },
  teacherScopeText: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
    paddingTop: 8,
  },
  contentInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 20,
  },
  contentInputText: {
    color: "#29375C",
    fontFamily: fonts.medium,
    fontSize: 16,
  },

  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
});
