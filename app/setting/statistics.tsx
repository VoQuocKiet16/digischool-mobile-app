import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import manageService from '../../services/manage.service';
import { fonts } from '../../utils/responsive';
import { router } from 'expo-router';


interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Week {
  weekNumber: number;
  startDate: string;
  endDate: string;
  semester: string;
  hasData: boolean;
}

const StatisticsScreen = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(false);
  const [yearModal, setYearModal] = useState(false);
  const [weekModal, setWeekModal] = useState(false);

  // Animation values
  const yearDropdownAnimation = useRef(new Animated.Value(0)).current;
  const weekDropdownAnimation = useRef(new Animated.Value(0)).current;
  const yearArrowRotation = useRef(new Animated.Value(0)).current;
  const weekArrowRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const data = await manageService.getAcademicYears();
      setAcademicYears(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách năm học');
    }
  };

  const fetchWeeks = async (academicYearId: string) => {
    try {
      const data = await manageService.getAvailableWeeks(academicYearId);
      setWeeks(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách tuần');
    }
  };

  const handleExport = async () => {
    if (!selectedYear || !selectedWeek) {
      Alert.alert('Thông báo', 'Vui lòng chọn năm học và tuần');
      return;
    }

    setLoading(true);
    
    try {
      const blob = await manageService.exportWeeklyEvaluation(selectedYear, parseInt(selectedWeek));
      
      if (Platform.OS === 'web') {
        // Web platform
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thong-ke-danh-gia-tuan-${selectedWeek}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // React Native platform
        const fileName = `thong-ke-danh-gia-tuan-${selectedWeek}.xlsx`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1]; // Remove data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,
            
            await FileSystem.writeAsStringAsync(fileUri, base64Content, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Share file
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Xuất thống kê Excel',
              });
            } else {
              Alert.alert('Thành công', `File đã được lưu tại: ${fileUri}`);
            }
          } catch (writeError) {
            console.error('Lỗi khi ghi file:', writeError);
            Alert.alert('Lỗi', 'Không thể lưu file');
          }
        };
        reader.readAsDataURL(blob);
      }
      
      Alert.alert('Thành công', 'Đã xuất thống kê thành công!');
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi', 'Không thể xuất thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Animate dropdowns
  useEffect(() => {
    if (yearModal) {
      Animated.parallel([
        Animated.timing(yearDropdownAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(yearArrowRotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(yearDropdownAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(yearArrowRotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [yearModal]);

  useEffect(() => {
    if (weekModal) {
      Animated.parallel([
        Animated.timing(weekDropdownAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(weekArrowRotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(weekDropdownAnimation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(weekArrowRotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [weekModal]);

  const toggleYearDropdown = () => setYearModal(!yearModal);
  const toggleWeekDropdown = () => setWeekModal(!weekModal);

  const selectYear = (yearId: string) => {
    setSelectedYear(yearId);
    setSelectedWeek('');
    setYearModal(false);
    if (yearId) {
      fetchWeeks(yearId);
    }
  };

  const selectWeek = (weekNumber: number) => {
    setSelectedWeek(weekNumber.toString());
    setWeekModal(false);
  };

  return (
    <HeaderLayout title="Thống kê thi đua" onBack={() => router.back()}>
      <View style={styles.container}>
        
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>Năm học</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={toggleYearDropdown}
              activeOpacity={0.8}
            >
              <Text style={selectedYear ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedYear ? academicYears.find(y => y._id === selectedYear)?.name : "Chọn năm học"}
              </Text>
              <Animated.View
                style={{
                  transform: [{
                    rotate: yearArrowRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"],
                    }),
                  }],
                }}
              >
                <MaterialIcons name="arrow-drop-down" size={24} color="#29375C" />
              </Animated.View>
            </TouchableOpacity>
            {yearModal && (
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    opacity: yearDropdownAnimation,
                    transform: [{
                      translateY: yearDropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-5, 0],
                      }),
                    }],
                  },
                ]}
              >
                {academicYears.map((year, index) => (
                  <TouchableOpacity
                    key={`${year._id}-${index}`}
                    style={styles.modalItem}
                    onPress={() => selectYear(year._id)}
                  >
                    <Text style={styles.modalItemText}>{year.name}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>
        </View>

        {selectedYear && (
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Tuần</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={toggleWeekDropdown}
                activeOpacity={0.8}
              >
                <Text style={selectedWeek ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {selectedWeek ? `Tuần ${selectedWeek}` : "Chọn tuần"}
                </Text>
                <Animated.View
                  style={{
                    transform: [{
                      rotate: weekArrowRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    }],
                  }}
                >
                  <MaterialIcons name="arrow-drop-down" size={24} color="#29375C" />
                </Animated.View>
              </TouchableOpacity>
              {weekModal && (
                <Animated.View
                  style={[
                    styles.modalContent,
                    {
                      opacity: weekDropdownAnimation,
                      transform: [{
                        translateY: weekDropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-5, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  {weeks.map((week, index) => (
                    <TouchableOpacity
                      key={`${week.weekNumber}-${week.startDate}-${index}`}
                      style={styles.modalItem}
                      onPress={() => selectWeek(week.weekNumber)}
                    >
                      <Text style={styles.modalItemText}>
                        Tuần {week.weekNumber} ({formatDate(week.startDate)} - {formatDate(week.endDate)})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.exportButton,
            (!selectedYear || !selectedWeek) && styles.exportButtonDisabled
          ]}
          onPress={handleExport}
          disabled={!selectedYear || !selectedWeek || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>Xuất thống kê</Text>
          )}
        </TouchableOpacity>
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#29375C',
    fontFamily: fonts.bold,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: '#29375C',
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
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
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 6,
    color: '#29375C',
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
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
  modalContent: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: '#29375C',
    fontFamily: fonts.medium,
  },
  exportButton: {
    backgroundColor: '#29375C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 15,
  },
  exportButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fonts.semiBold,
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    lineHeight: 20,
    fontFamily: fonts.medium,
  },
});

export default StatisticsScreen;
