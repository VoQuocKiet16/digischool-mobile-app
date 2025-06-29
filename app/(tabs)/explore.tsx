import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TabTwoScreen() {
  const goToSlotDetail = () => {
    router.replace("/students/lesson_information/lesson_detail");
  };

  const goToSlotEvaluate = () => {
    router.replace("/students/lesson_information/lesson_evaluate");
  };


  const goToAddExamReminder = () => {
    router.push("/teachers/add_exam_reminder/add_exam_reminder");
  };

  const goToSubstituteRequest = () => {
    router.push("/teachers/substitute_request/substitute_request");
  };

  const goToTietHocThayThe = () => {
    router.push("/teachers/substitute_lesson/substitute_lesson");
  };

  const goToSelectMakeupLesson = () => {
    router.push("/teachers/select_makeup_lesson/select_makeup_lesson");
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={goToAddExamReminder}
        >
          <Text style={styles.buttonText}>Dặn dò kiểm tra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={goToSubstituteRequest}
        >
          <Text style={styles.buttonText}>Yêu cầu dạy thay</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={goToTietHocThayThe}
        >
          <Text style={styles.buttonText}>Tiết học thay thế</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={goToSelectMakeupLesson}
        >
          <Text style={styles.buttonText}>Chọn tiết dạy bù</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#2d3a4b",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
