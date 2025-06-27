import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";

export default function TabTwoScreen() {
  const goToAuth = () => {
    router.replace("/teachers/schedule/schedule");
  };
  return (
    <View style={styles.container}>
      <Header title="Tài khoản" studentName="HS Nguyễn Văn A" />
      <View style={styles.body}>
        <TouchableOpacity style={styles.button} onPress={goToAuth}>
          <Text style={styles.buttonText}>Thời khóa biểu giáo viên</Text>
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
