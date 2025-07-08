import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import LoadingModal from "../../../components/LoadingModal";
import { createLeaveRequest } from "../../../services/leave_request.service";

export default function LeaveRequestInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedSlots = params.selectedSlots
    ? JSON.parse(params.selectedSlots as string)
    : [];
  const periods = params.periods
    ? JSON.parse(params.periods as string)
    : ["Tiết 1", "Tiết 2", "Tiết 3", "Tiết 4", "Tiết 5"];
  const days = params.days
    ? JSON.parse(params.days as string)
    : ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const subjects = params.subjects ? JSON.parse(params.subjects as string) : [];
  const lessonIds = params.lessonIds
    ? JSON.parse(params.lessonIds as string)
    : [];

  const [phone, setPhone] = useState(params.phone ? String(params.phone) : "");
  const [reason, setReason] = useState(
    params.reason ? String(params.reason) : ""
  );
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [error, setError] = useState("");

  const [phoneCriteria, setPhoneCriteria] = useState({
    length: false,
    start0: false,
  });

  const checkPhoneCriteria = (value: string) => {
    setPhoneCriteria({
      length: value.trim().length === 10,
      start0: value.trim().startsWith("0"),
    });
  };

  useEffect(() => {
    checkPhoneCriteria(phone);
  }, [phone]);

  function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }

  const lessonsByDay: Record<string, { date: string; lessons: string[] }> = {};
  selectedSlots.forEach((slot: any, idx: number) => {
    const day = days[slot.col];
    const date = slot.date || slot.scheduledDate || "";
    const key = date ? `${day} | ${formatDate(date)}` : day;
    if (!lessonsByDay[key]) lessonsByDay[key] = { date, lessons: [] };
    lessonsByDay[key].lessons.push(subjects[idx]);
  });
  const lessonsByDayArr = Object.entries(lessonsByDay);

  const handleNext = () => {
    if (phone.trim() && reason.trim()) {
      setStep("confirm");
    }
  };

  const handleSubmit = async () => {
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");
    try {
      console.log("Dữ liệu gửi API xin nghỉ:", {
        lessonIds,
        phoneNumber: phone,
        reason,
      });
      const res = await createLeaveRequest({
        lessonIds,
        phoneNumber: phone,
        reason,
      });
      console.log("API xin nghỉ trả về:", res);
      if (res && res.success) {
        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          router.push("/");
        }, 1200);
      } else {
        console.error("API xin nghỉ trả về lỗi:", res);
        setError("Gửi yêu cầu thất bại!");
        setShowLoading(false);
      }
    } catch (e: any) {
      console.error("Lỗi gửi yêu cầu xin nghỉ:", e);
      if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError(
          "Tiết học này đã được xin nghỉ hoặc có lỗi xảy ra. Vui lòng thử lại!"
        );
      }
      setShowLoading(false);
    }
  };

  return (
    <HeaderLayout
      title={step === "form" ? "Thông tin nghỉ phép" : "Xác nhận thông tin"}
      subtitle={
        step === "form"
          ? "Hoàn thành mẫu thông tin nghỉ phép"
          : "Xác nhận lại thông tin nghỉ phép"
      }
      onBack={() => (step === "form" ? router.back() : setStep("form"))}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f7f7f7", marginTop: 20 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {step === "form" ? (
            <View style={{ padding: 20 }}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>
                  Số điện thoại xác nhận <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Vui lòng nhập SĐT xác nhận nghỉ phép"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={(value) => {
                    setPhone(value);
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <View style={styles.phoneCriteria}>
                <Text
                  style={{
                    fontSize: 14,
                    color: phoneCriteria.length ? "#2ecc40" : "#7a869a",
                    fontFamily: "Baloo2-Regular",
                    marginBottom: 5,
                  }}
                >
                  Đủ 10 số
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: phoneCriteria.start0 ? "#2ecc40" : "#7a869a",
                    fontFamily: "Baloo2-Regular",
                  }}
                >
                  Bắt đầu bằng số 0
                </Text>
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>
                  Lý do xin nghỉ <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.confirmInput}
                  placeholder="Vui lòng nhập lý do yêu cầu xin nghỉ"
                  placeholderTextColor="#9CA3AF"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!phoneCriteria.length ||
                    !phoneCriteria.start0 ||
                    !reason.trim()) &&
                    styles.buttonDisabled,
                ]}
                disabled={
                  !phoneCriteria.length ||
                  !phoneCriteria.start0 ||
                  !reason.trim()
                }
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.buttonText,
                    (!phoneCriteria.length ||
                      !phoneCriteria.start0 ||
                      !reason.trim()) &&
                      styles.buttonTextDisabled,
                  ]}
                >
                  Tiếp tục
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingRight: 30, paddingLeft: 30, paddingTop: 10 }}>
              <View style={[styles.card]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderBar} />
                  <Text style={styles.cardTitle}>Tiết học xin nghỉ</Text>
                  <View style={{ flex: 1 }} />
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color="#29345C"
                    style={styles.editIcon}
                    onPress={() => {
                      router.push({
                        pathname: "/students/leave_request/leave_request",
                        params: {
                          selectedSlots: JSON.stringify(selectedSlots),
                          lessonIds: JSON.stringify(lessonIds),
                          phone,
                          reason,
                        },
                      });
                    }}
                  />
                </View>
                {lessonsByDayArr.map(([key, value], idx) => (
                  <View key={idx} style={styles.dayBlock}>
                    <View style={styles.dayRow}>
                      <MaterialIcons
                        name="calendar-month"
                        size={18}
                        color="#29375C"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.dayText}>{key}</Text>
                    </View>
                    {value.lessons.map((lesson, i) => (
                      <View
                        key={i}
                        style={[
                          styles.lessonTagCard,
                          i !== value.lessons.length - 1 && { marginBottom: 8 },
                        ]}
                      >
                        <Text style={styles.lessonTagTextCard}>{lesson}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Số điện thoại xác nhận</Text>
                <Text style={styles.confirmInput}>{phone}</Text>
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Lý do xin nghỉ</Text>
                <Text style={styles.confirmInput}>{reason}</Text>
              </View>
              {error ? (
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {error}
                </Text>
              ) : null}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={showLoading}
              >
                <Text style={styles.buttonText}>
                  {showLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <LoadingModal
          visible={showLoading}
          text={loadingSuccess ? "Thành công" : "Đang gửi yêu cầu..."}
          success={loadingSuccess}
        />
      </SafeAreaView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  buttonDisabled: { backgroundColor: "#D1D5DB" },
  buttonText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#29375C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
    marginRight: 10,
    marginLeft: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderBar: {
    width: 4,
    height: 48,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 25,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    flexShrink: 0,
  },
  editIcon: {
    marginLeft: 8,
    marginRight: 2,
    backgroundColor: "#e6eef2",
    borderRadius: 100,
    padding: 10,
  },
  dayBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayText: {
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 16,
  },
  lessonTagCard: {
    backgroundColor: "#FFD6B0",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    alignSelf: "center",
  },
  lessonTagTextCard: {
    color: "#29375C",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  confirmInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  confirmLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
    zIndex: 2,
  },
  confirmInput: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  phoneCriteria: {
    marginLeft: 25,
    marginBottom: 30,
    marginTop: -10,
  },
});
