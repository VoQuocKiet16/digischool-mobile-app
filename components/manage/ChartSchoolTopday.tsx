import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import manageService, {
  DailySchoolStatistics,
  StudentChartData,
  TeacherAttendanceStatistics
} from "../../services/manage.service";

export default function ChartSchoolTopday() {
  // State buổi sáng/chiều
  const [session, setSession] = React.useState<"morning" | "afternoon">(
    "morning"
  );
  const [fadeAnim] = React.useState(new Animated.Value(1));

  // State cho dữ liệu API
  const [dailyStats, setDailyStats] = useState<DailySchoolStatistics | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherAttendanceStatistics | null>(null);
  const [studentChartData, setStudentChartData] = useState<StudentChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data từ API
  useEffect(() => {
    fetchDailyData();
  }, []);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching daily data...');
      
      // Fetch daily school statistics
      const dailyResponse = await manageService.getDailySchoolStatistics();
      console.log('📊 Daily stats:', dailyResponse);
      setDailyStats(dailyResponse);

      // Sử dụng teacherAttendance từ daily stats thay vì gọi API riêng
      if (dailyResponse.teacherAttendance) {
        setTeacherStats({
          date: dailyResponse.date,
          total: dailyResponse.teacherAttendance.total,
          attended: dailyResponse.teacherAttendance.attended,
          absent: dailyResponse.teacherAttendance.absent,
          late: dailyResponse.teacherAttendance.late,
          attendanceRate: dailyResponse.teacherAttendance.attendanceRate
        });
      } else {
        // Fallback nếu không có teacherAttendance
        const teacherResponse = await manageService.getTeacherAttendanceStatistics();
        console.log('👨‍🏫 Teacher stats:', teacherResponse);
        setTeacherStats(teacherResponse);
      }

      // Fetch student chart data
      const chartResponse = await manageService.getStudentChartData(undefined, session);
      console.log('📈 Chart data:', chartResponse);
      setStudentChartData(chartResponse);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      
      // Fallback data khi API fail
      const fallbackDailyStats = {
        date: new Date().toISOString(),
        total: 1200,
        breakdown: {
          students: 1100,
          teachers: 70,
          managers: 30
        },
        gradeLevels: {
          grade10: 400,
          grade11: 350,
          grade12: 350
        }
      };
      
      const fallbackTeacherStats = {
        date: new Date().toISOString(),
        total: 70,
        attended: 67,
        absent: 3,
        late: 0,
        attendanceRate: 96
      };
      
      const fallbackChartData = {
        date: new Date().toISOString(),
        session: session,
        periods: [
          { period: 1, grade10: 300, grade11: 400, grade12: 400 },
          { period: 2, grade10: 320, grade11: 390, grade12: 390 },
          { period: 3, grade10: 310, grade11: 410, grade12: 380 },
          { period: 4, grade10: 305, grade11: 405, grade12: 390 },
          { period: 5, grade10: 315, grade11: 395, grade12: 390 }
        ]
      };
      
      console.log('🔄 Using fallback data...');
      setDailyStats(fallbackDailyStats);
      setTeacherStats(fallbackTeacherStats);
      setStudentChartData(fallbackChartData);
      
      setError('Sử dụng dữ liệu mẫu (API chưa sẵn sàng)');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chart data khi session thay đổi
  useEffect(() => {
    if (!loading) {
      fetchStudentChartData();
    }
  }, [session]);

  const fetchStudentChartData = async () => {
    try {
      const chartResponse = await manageService.getStudentChartData(undefined, session);
      setStudentChartData(chartResponse);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  // Sử dụng dữ liệu thực từ API
  const total = dailyStats?.total || 0;
  const students = dailyStats?.breakdown?.students || 0;
  const teachers = dailyStats?.breakdown?.teachers || 0;
  const managers = dailyStats?.breakdown?.managers || 0;
  const checkedIn = teacherStats?.attended || 0;
  const totalTeachers = teacherStats?.total || 0;

  // Debug logging
  console.log('🔍 UI Data - Total:', total);
  console.log('🔍 UI Data - Students:', students);
  console.log('🔍 UI Data - Teachers:', teachers);
  console.log('🔍 UI Data - Managers:', managers);
  console.log('🔍 UI Data - Checked in:', checkedIn);
  console.log('🔍 UI Data - Total teachers:', totalTeachers);

  // Chuyển đổi dữ liệu chart
  const chartDataMorning = studentChartData?.periods?.slice(0, 5).map(period => ({
    k10: period.grade10,
    k11: period.grade11,
    k12: period.grade12
  })) || [];

  const chartDataAfternoon = studentChartData?.periods?.slice(5, 10).map(period => ({
    k10: period.grade10,
    k11: period.grade11,
    k12: period.grade12
  })) || [];

  console.log('🔍 UI Data - Chart data morning:', chartDataMorning);
  console.log('🔍 UI Data - Chart data afternoon:', chartDataAfternoon);

  const chartData =
    session === "morning" ? chartDataMorning : chartDataAfternoon;
  const barColors = ["#4B5B8C", "#F9A825", "#2E8B8B"];
  const barLabels = ["Khối 10", "Khối 11", "Khối 12"];
  
  // Tính maxY dựa trên dữ liệu thực tế
  const maxY = chartData.length > 0 
    ? Math.max(...chartData.map(bar => bar.k10 + bar.k11 + bar.k12))
    : 1;
  
  console.log('🔍 Chart Debug - Chart data:', chartData);
  console.log('🔍 Chart Debug - MaxY:', maxY);
  console.log('🔍 Chart Debug - Chart data length:', chartData.length);
  
  // Debug từng bar
  chartData.forEach((bar, index) => {
    console.log(`🔍 Chart Debug - Bar ${index}:`, {
      k10: bar.k10,
      k11: bar.k11,
      k12: bar.k12,
      total: bar.k10 + bar.k11 + bar.k12
    });
  });
  
  const barWidth = 28;
  const barGap = 22;
  const chartHeight = 120;

  // Tính toạ độ cột
  function getBarStack(bar: any, idx: number) {
    let y0 = 0;
    return [
      { h: bar.k10, color: barColors[0], y: y0 },
      { h: bar.k11, color: barColors[1], y: (y0 += bar.k10) },
      { h: bar.k12, color: barColors[2], y: (y0 += bar.k11) },
    ];
  }

  // Hàm chuyển mượt mà
  const handleSwitchSession = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSession((prev) => (prev === "morning" ? "afternoon" : "morning"));
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#29375C" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Error state - chỉ hiển thị thông báo nhỏ, không block UI
  if (error) {
    console.log('⚠️ Displaying error:', error);
  }

  return (
    <View style={styles.wrap}>
      {/* Error notification */}
      {error && (
        <View style={styles.errorNotification}>
          <Text style={styles.errorNotificationText}>{error}</Text>
        </View>
      )}
      
      {/* Card 1 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <Text style={styles.linkText}>Sĩ số toàn trường</Text>
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginTop: 2,
            justifyContent: "center",
          }}
        >
          <Text style={styles.bigNumber}>{total.toLocaleString()}</Text>
          <Text style={styles.unitText}>người</Text>
        </View>
        <View style={styles.row3}>
          <View style={styles.col3}>
            <Text style={styles.label3}>
              Học sinh{"\n"}
              <Text style={styles.bold3}>{students.toLocaleString()}</Text>
            </Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label3}>
              Giáo viên{"\n"}
              <Text style={styles.bold3}>{teachers.toLocaleString()}</Text>
            </Text>
          </View>
          <View style={styles.col3}>
            <Text style={styles.label3}>
              Quản lý{"\n"}
              <Text style={styles.bold3}>{managers.toLocaleString()}</Text>
            </Text>
          </View>
        </View>
      </View>
      {/* Card 2 */}
      <View style={styles.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={styles.cardTitle}>
            <Text style={styles.linkText}>Sĩ số giáo viên điểm danh</Text>
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            marginTop: 2,
            justifyContent: "center",
          }}
        >
          <Text style={styles.bigNumber2}>{checkedIn}/{totalTeachers}</Text>
          <Text style={styles.unitText}>người</Text>
        </View>
      </View>
      {/* Card 3: Chart */}
      <View style={[styles.card, { marginTop: 0, paddingBottom: 18 }]}>
        <Text style={styles.cardTitle}>
          <Text style={styles.linkText}>Biểu đồ học sinh</Text>{" "}
          <Text style={styles.orange}>
            {session === "morning" ? "Buổi sáng" : "Buổi chiều"}
          </Text>
        </Text>
        <Animated.View style={[styles.chartWrap, { opacity: fadeAnim }]}>
          {/* Trục Y + line ngang */}
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginRight: 6,
              height: chartHeight,
            }}
          >
            {[maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0].map((v, idx) => (
              <View
                key={`y-axis-${idx}-${v}`}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={styles.axisY}>{v}</Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#BFC6D1",
                    width: 210,
                    marginLeft: 4,
                    opacity: idx === 4 ? 0 : 1,
                  }}
                />
              </View>
            ))}
          </View>
          {/* Chart */}
          <View style={{ position: "absolute", left: 44, top: 0 }}>
            <Svg width={barWidth * 5 + barGap * 4} height={chartHeight}>
              {chartData.map((bar, i) => {
                let stack = getBarStack(bar, i);
                let yOffset = 0;
                return stack.map((seg, j) => {
                  // Tính chiều cao dựa trên tỷ lệ thực tế với scale factor
                  const totalValue = bar.k10 + bar.k11 + bar.k12;
                  const segmentRatio = totalValue > 0 ? seg.h / totalValue : 0;
                  
                  // Scale factor để giảm chiều cao tổng thể
                  const scaleFactor = 0.85; // Giảm 15% chiều cao
                  const h = (totalValue * chartHeight * scaleFactor) / maxY * segmentRatio;
                  const y = chartHeight - yOffset - h;
                  yOffset += h;
                  return (
                    <Rect
                      key={i + "-" + j}
                      x={i * (barWidth + barGap)}
                      y={y}
                      width={barWidth}
                      height={h}
                      fill={seg.color}
                      rx={0}
                    />
                  );
                });
              })}
            </Svg>
            {/* Nhãn trục X */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: barWidth * 5.3 + barGap * 4,
                marginTop: 8,
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Text key={`period-${i}`} style={styles.axisX}>{`Tiết ${i}`}</Text>
              ))}
            </View>
            {/* Mũi tên phải */}
            <View
              style={{
                position: "absolute",
                right: -40,
                top: chartHeight / 2 - 10,
              }}
            >
              <MaterialIcons name="chevron-right" size={22} color="#4B5B8C" />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                pointerEvents="box-none"
              >
                <AnimatedTouchableOpacity
                  onPress={handleSwitchSession}
                  activeOpacity={1}
                  style={{
                    width: 32,
                    height: 32,
                    position: "absolute",
                    top: -5,
                    left: -5,
                    backgroundColor: "transparent",
                  }}
                />
              </View>
            </View>
          </View>
        </Animated.View>
        {/* Chú thích màu */}
        <View style={styles.legendRow}>
          {barLabels.map((label, i) => (
            <View key={label} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: barColors[i] }]}
              />
              <Text style={styles.legend}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#D7DCE5",
    borderRadius: 26,
    padding: 22,
    width: "92%",
    minHeight: 120,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  linkText: {
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
  },
  bigNumber: {
    fontSize: 55,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 1,
  },
  bigNumber2: {
    fontSize: 55,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 1,
  },
  unitText: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginLeft: 6,
    marginBottom: 6,
  },
  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  col3: {
    flex: 1,
    alignItems: "center",
  },
  label3: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    textAlign: "center",
  },
  bold3: {
    color: "#29375C",
    fontSize: 22,
    fontFamily: "Baloo2-Bold",
  },
  axisY: {
    fontSize: 12,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginBottom: 0,
  },
  axisX: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    width: 42,
    textAlign: "center",
  },
  orange: {
    color: "#F9A825",
    fontFamily: "Baloo2-Bold",
    fontSize: 16,
  },
  legend: {
    fontSize: 13,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginLeft: 2,
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    paddingVertical: 8,
    paddingLeft: 0,
    marginTop: 8,
    marginBottom: 0,
    minHeight: 150,
    position: "relative",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  legendColor: {
    width: 22,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  // Loading và Error styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#29375C',
    fontFamily: 'Baloo2-Medium',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontFamily: 'Baloo2-Medium',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#29375C',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
  },
  errorNotification: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 12,
  },
  errorNotificationText: {
    color: '#856404',
    fontSize: 14,
    fontFamily: 'Baloo2-Medium',
    textAlign: 'center',
  },
});

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
