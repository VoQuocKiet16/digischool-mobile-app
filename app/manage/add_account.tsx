import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import LoadingModal from '../../components/LoadingModal';
import ErrorModal from '../../components/notifications_modal/ErrorModal';
import SuccessModal from '../../components/notifications_modal/SuccessModal';
import { useNotificationContext } from '../../contexts/NotificationContext';
import manageService from '../../services/manage.service';
import { fonts } from '../../utils/responsive';
import { router } from 'expo-router';

// Data cứng cho demo
const ACCOUNT_TYPES = [
  { id: 'student', name: 'Học sinh', icon: 'school' },
  { id: 'teacher', name: 'Giáo viên', icon: 'person' },
  { id: 'parent', name: 'Phụ huynh', icon: 'family-restroom' }
];

const GENDERS = ['Nam', 'Nữ', 'Khác'];
const ACADEMIC_YEARS = ['2024-2025', '2025-2026'];

// Data mẫu cho Excel preview
const SAMPLE_STUDENT_DATA = [
  {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    studentId: 'HS001',
    className: '10A1',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '2005-01-15',
    gender: 'Nam',
    phone: '0123456789',
    address: 'Ninh Kiều, Cần Thơ'
  },
  {
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    studentId: 'HS002',
    className: '10A1',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '2005-03-20',
    gender: 'Nữ',
    phone: '0987654321',
    address: 'Cái Răng, Cần Thơ'
  }
];

const SAMPLE_TEACHER_DATA = [
  {
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    teacherId: 'GV001',
    subjectName: 'Toán',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '1985-05-10',
    gender: 'Nam',
    phone: '0123456789',
    address: 'Ninh Kiều, Cần Thơ'
  },
  {
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    teacherId: 'GV002',
    subjectName: 'Văn học',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '1988-08-25',
    gender: 'Nữ',
    phone: '0987654321',
    address: 'Cái Răng, Cần Thơ'
  }
];

const SAMPLE_PARENT_DATA = [
  {
    name: 'Nguyễn Văn E',
    email: 'nguyenvane@example.com',
    parentId: 'PH001',
    childStudentId: 'HS001',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '1980-12-05',
    gender: 'Nam',
    phone: '0123456789',
    address: 'Ninh Kiều, Cần Thơ'
  },
  {
    name: 'Trần Thị F',
    email: 'tranthif@example.com',
    parentId: 'PH002',
    childStudentId: 'HS002',
    school: 'THPT Phan Văn Trị',
    dateOfBirth: '1982-07-15',
    gender: 'Nữ',
    phone: '0987654321',
    address: 'Cái Răng, Cần Thơ'
  }
];

export default function AddAccount() {
  const { hasUnreadNotification } = useNotificationContext();
  const [userName, setUserName] = useState('');
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState('student');
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  
  // Manual create states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualAccountType, setManualAccountType] = useState('student');
  
  // Manual create form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Nam');
  const [studentId, setStudentId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [parentId, setParentId] = useState('');
  const [className, setClassName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  
  // Dropdown states
  const [showGender, setShowGender] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);
  const [showManualAccountType, setShowManualAccountType] = useState(false);
  const [showPreviewAccountType, setShowPreviewAccountType] = useState(false);
  
  // Success/Error states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const arrowRotation = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem('userName').then(name => {
      if (name) setUserName(name);
    });
  }, []);

  // Animate dropdown when modal state changes
  useEffect(() => {
    if (showAccountType || showManualAccountType || showPreviewAccountType) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showAccountType, showManualAccountType, showPreviewAccountType]);

  // Animate modal when it opens/closes
  useEffect(() => {
    if (showImportModal || showManualModal || showPreviewModal) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showImportModal, showManualModal, showPreviewModal]);

  // Animate dropdown when modal state changes
  useEffect(() => {
    if (showAccountType || showManualAccountType || showPreviewAccountType) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(arrowRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [showAccountType, showManualAccountType, showPreviewAccountType]);

  // Animate modal when it opens/closes
  useEffect(() => {
    if (showImportModal || showManualModal || showPreviewModal) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showImportModal, showManualModal, showPreviewModal]);

  const handleImportExcel = () => {
    setShowImportModal(true);
  };

  const handleManualCreate = () => {
    setShowManualModal(true);
  };

  const handlePreviewExcel = () => {
    setShowPreviewModal(true);
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        const fileObject = {
          uri: file.uri,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          name: file.name,
        };
        
        setSelectedFile(fileObject);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn file. Vui lòng thử lại.');
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn file Excel trước khi import.');
      return;
    }

    setShowImportModal(false);
    setLoadingModalVisible(true);
    setLoadingSuccess(false);

    try {
      const importData = {
        file: selectedFile,
        accountType: selectedAccountType as 'student' | 'teacher' | 'parent',
      };

      let result;
      switch (selectedAccountType) {
        case 'student':
          result = await manageService.importStudentsFromExcel(importData);
          break;
        case 'teacher':
          result = await manageService.importTeachersFromExcel(importData);
          break;
        case 'parent':
          result = await manageService.importParentsFromExcel(importData);
          break;
        default:
          throw new Error('Loại tài khoản không hợp lệ');
      }
      
      if (result.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setLoadingModalVisible(false);
          setLoadingSuccess(false);
          setSuccessMessage(`Import thành công! ${result.data.success.length} tài khoản đã được tạo.`);
          setShowSuccess(true);
        }, 2000);
      } else {
        setLoadingModalVisible(false);
        setErrorMessage(result.message || 'Import thất bại');
        setShowError(true);
      }
    } catch (error: any) {
      setLoadingModalVisible(false);
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Không thể import file. Vui lòng thử lại.';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại (404). Vui lòng kiểm tra cấu hình backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setSelectedFile(null);
    }
  };

  const handleManualCreateAccount = async () => {
    // Validate required fields
    if (!name || !email) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      setShowError(true);
      return;
    }

    setShowManualModal(false);
    setLoadingModalVisible(true);
    setLoadingSuccess(false);

    try {
      let accountData: any = {
        name,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        gender,
      };

      let result;
      switch (manualAccountType) {
        case 'student':
          if (!studentId || !className) {
            throw new Error('Vui lòng nhập mã học sinh và lớp học.');
          }
          accountData.studentId = studentId;
          accountData.className = className;
          result = await manageService.createStudent(accountData);
          break;
        case 'teacher':
          if (!teacherId || !subjectId) {
            throw new Error('Vui lòng nhập mã giáo viên và môn học.');
          }
          accountData.teacherId = teacherId;
          accountData.subjectId = subjectId;
          result = await manageService.createTeacher(accountData);
          break;
        case 'parent':
          if (!parentId || childrenIds.length === 0) {
            throw new Error('Vui lòng nhập mã phụ huynh và chọn con cái.');
          }
          accountData.parentId = parentId;
          accountData.childrenIds = childrenIds;
          result = await manageService.createParent(accountData);
          break;
        default:
          throw new Error('Loại tài khoản không hợp lệ');
      }
      
      if (result.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setLoadingModalVisible(false);
          setLoadingSuccess(false);
          setSuccessMessage('Tạo tài khoản thành công!');
          setShowSuccess(true);
          // Reset form
          resetManualForm();
        }, 2000);
      } else {
        setLoadingModalVisible(false);
        setErrorMessage(result.message || 'Tạo tài khoản thất bại');
        setShowError(true);
      }
    } catch (error: any) {
      setLoadingModalVisible(false);
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Không thể tạo tài khoản. Vui lòng thử lại.';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại (404). Vui lòng kiểm tra cấu hình backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrorMessage(errorMessage);
      setShowError(true);
    }
  };

  const resetManualForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDateOfBirth('');
    setGender('Nam');
    setStudentId('');
    setTeacherId('');
    setParentId('');
    setClassName('');
    setSubjectId('');
    setChildrenIds([]);
  };

  const getSampleData = () => {
    switch (selectedAccountType) {
      case 'student':
        return SAMPLE_STUDENT_DATA;
      case 'teacher':
        return SAMPLE_TEACHER_DATA;
      case 'parent':
        return SAMPLE_PARENT_DATA;
      default:
        return SAMPLE_STUDENT_DATA;
    }
  };

  const getAccountTypeName = (type: string) => {
    return ACCOUNT_TYPES.find(t => t.id === type)?.name || type;
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 32}}>
      <HeaderLayout
        title="Thêm tài khoản"
        subtitle="Tạo tài khoản học sinh, giáo viên, phụ huynh"
        onBack={() => {router.back()}} 
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          
          <View style={styles.actionButtons}>
            <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  handleButtonPress();
                  handleImportExcel();
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="file-upload" size={24} color="#29375C" />
                <Text style={styles.actionButtonText}>Import Excel</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  handleButtonPress();
                  handleManualCreate();
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person-add" size={24} color="#29375C" />
                <Text style={styles.actionButtonText}>Tạo thủ công</Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ flex: 1, transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  handleButtonPress();
                  handlePreviewExcel();
                }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="preview" size={24} color="#29375C" />
                <Text style={styles.actionButtonText}>Xem mẫu</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Hướng dẫn sử dụng</Text>
          <View style={styles.instructionItem}>
            <MaterialIcons name="file-upload" size={20} color="#4CAF50" />
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>Import Excel:</Text> Tải lên file Excel chứa danh sách tài khoản cần tạo
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="person-add" size={20} color="#2196F3" />
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>Tạo thủ công:</Text> Tạo từng tài khoản một với thông tin chi tiết
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <MaterialIcons name="preview" size={20} color="#FF9800" />
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>Xem mẫu:</Text> Xem cấu trúc file Excel mẫu để chuẩn bị dữ liệu
            </Text>
          </View>
        </View>
      </HeaderLayout>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import tài khoản từ Excel</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <MaterialIcons name="close" size={24} color="#22304A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Account Type Selection */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Loại tài khoản <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowAccountType(!showAccountType)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        selectedAccountType ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {selectedAccountType ? getAccountTypeName(selectedAccountType) : "Chọn loại tài khoản"}
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
                  {showAccountType && (
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
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity 
                          key={type.id}
                          style={styles.modalItem} 
                          onPress={() => {
                            setSelectedAccountType(type.id);
                            setShowAccountType(false);
                          }}
                        >
                          <MaterialIcons name={type.icon as any} size={20} color="#22304A" />
                          <Text style={styles.modalItemText}>{type.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* File Selection */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chọn file Excel <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.fileButton} 
                    onPress={handleFileSelect}
                  >
                    <MaterialIcons name="attach-file" size={20} color="#22304A" />
                    <Text style={styles.fileButtonText}>
                      {selectedFile ? selectedFile.name : 'Chọn file Excel (.xlsx)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Import Button */}
              <TouchableOpacity
                style={[styles.importButton, !selectedFile && styles.disabledButton]}
                onPress={handleConfirmImport}
                disabled={!selectedFile}
              >
                <Text style={[styles.importButtonText, !selectedFile && styles.disabledButtonText]}>
                  Import tài khoản
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Manual Create Modal */}
      <Modal
        visible={showManualModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowManualModal(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo tài khoản thủ công</Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <MaterialIcons name="close" size={24} color="#22304A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Account Type Selection */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Loại tài khoản <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowManualAccountType(!showManualAccountType)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        manualAccountType ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {manualAccountType ? getAccountTypeName(manualAccountType) : "Chọn loại tài khoản"}
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
                  {showManualAccountType && (
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
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity 
                          key={type.id}
                          style={styles.modalItem} 
                          onPress={() => {
                            setManualAccountType(type.id);
                            setShowManualAccountType(false);
                          }}
                        >
                          <MaterialIcons name={type.icon as any} size={20} color="#22304A" />
                          <Text style={styles.modalItemText}>{type.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Basic Information */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Họ và tên <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Email <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    placeholder="Nhập email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>Địa chỉ</Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    placeholder="Nhập địa chỉ"
                    placeholderTextColor="#9CA3AF"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>Ngày sinh</Text>
                  <TextInput
                    style={styles.inputTextOutline}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>Giới tính</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowGender(!showGender)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        gender ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {gender || "Chọn giới tính"}
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
                  {showGender && (
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
                      {GENDERS.map(g => (
                        <TouchableOpacity 
                          key={g}
                          style={styles.modalItem} 
                          onPress={() => {
                            setGender(g);
                            setShowGender(false);
                          }}
                        >
                          <Text style={styles.modalItemText}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Specific Information based on account type */}
              {manualAccountType === 'student' && (
                <>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Mã học sinh <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Nhập mã học sinh"
                        placeholderTextColor="#9CA3AF"
                        value={studentId}
                        onChangeText={setStudentId}
                      />
                    </View>
                  </View>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Lớp học <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Nhập lớp học"
                        placeholderTextColor="#9CA3AF"
                        value={className}
                        onChangeText={setClassName}
                      />
                    </View>
                  </View>
                </>
              )}

              {manualAccountType === 'teacher' && (
                <>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Mã giáo viên <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Nhập mã giáo viên"
                        placeholderTextColor="#9CA3AF"
                        value={teacherId}
                        onChangeText={setTeacherId}
                      />
                    </View>
                  </View>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Mã môn học <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Nhập mã môn học"
                        placeholderTextColor="#9CA3AF"
                        value={subjectId}
                        onChangeText={setSubjectId}
                      />
                    </View>
                  </View>
                </>
              )}

              {manualAccountType === 'parent' && (
                <>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Mã phụ huynh <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Nhập mã phụ huynh"
                        placeholderTextColor="#9CA3AF"
                        value={parentId}
                        onChangeText={setParentId}
                      />
                    </View>
                  </View>
                  <View style={styles.fieldWrap}>
                    <View style={styles.outlineInputBox}>
                      <Text style={styles.floatingLabel}>
                        Mã học sinh con <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.inputTextOutline}
                        placeholder="Phân cách bằng dấu phẩy"
                        placeholderTextColor="#9CA3AF"
                        value={childrenIds.join(', ')}
                        onChangeText={(text) => setChildrenIds(text.split(',').map(id => id.trim()))}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.createButton, (!name || !email) && styles.disabledButton]}
                onPress={handleManualCreateAccount}
                disabled={!name || !email}
              >
                <Text style={[styles.createButtonText, (!name || !email) && styles.disabledButtonText]}>
                  Tạo tài khoản
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mẫu file Excel</Text>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                <MaterialIcons name="close" size={24} color="#22304A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Account Type Selection for Preview */}
              <View style={styles.fieldWrap}>
                <View style={styles.outlineInputBox}>
                  <Text style={styles.floatingLabel}>
                    Chọn loại tài khoản để xem mẫu
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowPreviewAccountType(!showPreviewAccountType)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        selectedAccountType ? styles.dropdownText : styles.dropdownPlaceholder
                      }
                    >
                      {selectedAccountType ? getAccountTypeName(selectedAccountType) : "Chọn loại tài khoản"}
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
                  {showPreviewAccountType && (
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
                      {ACCOUNT_TYPES.map(type => (
                        <TouchableOpacity 
                          key={type.id}
                          style={styles.modalItem} 
                          onPress={() => {
                            setSelectedAccountType(type.id);
                            setShowPreviewAccountType(false);
                          }}
                        >
                          <MaterialIcons name={type.icon as any} size={20} color="#22304A" />
                          <Text style={styles.modalItemText}>{type.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </View>

              <Text style={styles.previewText}>
                Cấu trúc file Excel cho {getAccountTypeName(selectedAccountType)}:
              </Text>
              
              <View style={styles.sampleDataContainer}>
                {getSampleData().map((item, index) => (
                  <View key={index} style={styles.sampleDataItem}>
                    <Text style={styles.sampleDataTitle}>Mẫu {index + 1}:</Text>
                    {Object.entries(item).map(([key, value]) => (
                      <Text key={key} style={styles.sampleDataText}>
                        {key}: {value}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalVisible}
        success={loadingSuccess}
        text={
          loadingSuccess
            ? "Thành công!"
            : "Đang xử lý..."
        }
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Thành công"
        message={successMessage}
        buttonText="Xác nhận"
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showError}
        onClose={() => setShowError(false)}
        title="Lỗi"
        message={errorMessage}
        buttonText="Thử lại"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22304A',
    marginBottom: 16,
    fontFamily: fonts.semiBold,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#22304A',
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
  instructionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22304A',
    marginBottom: 12,
    fontFamily: fonts.semiBold,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontFamily: fonts.regular,
  },
  instructionBold: {
    fontWeight: 'bold',
    color: '#22304A',
    fontFamily: fonts.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22304A',
    fontFamily: fonts.semiBold,
  },
  modalBody: {
    padding: 20,
  },
  fieldWrap: {
    marginTop: 10,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: '#29375C',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -16,
    left: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    color: '#29375C',
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: '#29375C',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  required: {
    color: '#E53935',
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0,
    minHeight: 22,
  },
  dropdownText: {
    color: '#29375C',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    minHeight: 22,
  },
  fileButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#22304A',
    flex: 1,
    fontFamily: fonts.medium,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#22304A',
    fontFamily: fonts.medium,
  },
  importButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.semiBold,
  },
  createButton: {
    backgroundColor: '#29375C',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.semiBold,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22304A',
    marginBottom: 16,
    fontFamily: fonts.semiBold,
  },
  sampleDataContainer: {
    borderRadius: 8,
    padding: 16,
    paddingTop: 0,
  },
  sampleDataItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sampleDataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22304A',
    marginBottom: 8,
    fontFamily: fonts.semiBold,
  },
  sampleDataText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: fonts.regular,
  },
});
