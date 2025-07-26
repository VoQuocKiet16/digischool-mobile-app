import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { fonts } from "../../../../utils/responsive";

export default function UpdateContactInfo() {
  const [phone, setPhone] = useState("0123456789");
  const [email, setEmail] = useState("hocsinh@email.com");
  const [address, setAddress] = useState("Hà Nội");
  const [showInfo, setShowInfo] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setShowInfo((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Thông tin liên hệ</Text>
        <Ionicons
          name={showInfo ? "chevron-down" : "chevron-forward"}
          size={24}
          color="#29375C"
          style={styles.icon}
        />
      </TouchableOpacity>
      {showInfo && (
        <>
          {/* Số điện thoại */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#7a869a"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {/* Email */}
          {/* <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor="#7a869a"
                keyboardType="email-address"
              />
            </View>
          </View> */}
          {/* Địa chỉ */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ"
                placeholderTextColor="#7a869a"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 25,
    color: "#29375C",
    flex: 1,
    fontFamily: fonts.bold,
  },
  icon: {
    color: "#29375C",
    marginLeft: 6,
    backgroundColor: "#C4C4C4",
    borderRadius: 20,
    padding: 4,
  },
  fieldWrap: {
    marginBottom: 25,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 17,
    paddingHorizontal: 25,
    backgroundColor: "#f7f7f7",
    marginTop: 8,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#29375C",
    fontFamily: fonts.semiBold,
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: fonts.semiBold,
  },
});
