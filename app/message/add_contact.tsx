import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";

const EXISTING_ACCOUNTS = [
  {
    id: "1",
    name: "Nguyen Thi Bich",
    username: "hocsinh1",
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "2",
    name: "Nguyen Thi Bich",
    username: "hocsinh1",
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "3",
    name: "Nguyen Thi Bich",
    username: "hocsinh1",
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "4",
    name: "Nguyen Thi Bich",
    username: "hocsinh1",
    avatar: require("../../assets/images/avt_default.png"),
  },
];

export default function AddContactScreen() {
  const [username, setUsername] = useState("");

  return (
    <HeaderLayout
      title="Thêm liên hệ"
      subtitle="Thêm liên hệ mới"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Form tìm kiếm */}
        <View style={styles.formBox}>
          <Text style={styles.label}>Tên người dùng</Text>
          <TextInput
            style={styles.input}
            placeholder="hocsinh1"
            placeholderTextColor="#A0A0A0"
            value={username}
            onChangeText={setUsername}
          />
          <TouchableOpacity style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Tìm kiếm tài khoản</Text>
          </TouchableOpacity>
        </View>
        {/* Danh sách tài khoản */}
        <View style={styles.listWrapper}>
          <Text style={styles.listTitle}>Tài khoản tồn tại</Text>
          <FlatList
            data={EXISTING_ACCOUNTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.accountRow}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={styles.infoBox}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.username}>{item.username}</Text>
                </View>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={28}
                  color="#fff"
                  style={styles.chatIcon}
                />
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontWeight: "bold",
    color: "#25345D",
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A0A0A0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#25345D",
    backgroundColor: "#F6F8FB",
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listWrapper: {
    backgroundColor: "#25345D",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginTop: 32,
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  listTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 18,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: "#fff",
  },
  infoBox: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#fff",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },
  chatIcon: {
    marginLeft: 12,
  },
});
