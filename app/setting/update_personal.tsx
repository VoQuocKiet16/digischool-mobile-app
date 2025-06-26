import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import UpdateContactInfo from "../../components/setting/personal/update/UpdateContactInfo";
import UpdateProfileInfo from "../../components/setting/personal/update/UpdateProfileInfo";
import { useRouter } from "expo-router";

export default function UpdatePersonal() {
  const [avatar, setAvatar] = useState(
    require("../../assets/images/avatar1.png")
  );
  const [name, setName] = useState("Nguyễn Văn A");
  const [dob, setDob] = useState("01/01/2006");
  const [gender, setGender] = useState("Nam");
  const [phone, setPhone] = useState("0123456789");
  const [email, setEmail] = useState("hocsinh@email.com");
  const [address, setAddress] = useState("Hà Nội");
  const router = useRouter();

  // Hàm chọn ảnh đại diện (giả lập)
  const handleChangeAvatar = () => {
    // TODO: Thêm chức năng chọn ảnh từ thư viện
    alert("Chức năng đang phát triển!");
  };

  const handleSave = () => {
    // TODO: Gửi dữ liệu lên server
    alert("Đã lưu thông tin!");
  };

  return (
    <HeaderLayout title="Cập nhật thông tin cá nhân"  onBack={() => router.back()} style={{ fontSize: 20, fontWeight: 'bold' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarBox}>
          <View style={styles.avatarWrap}>
            <Image source={avatar} style={styles.avatar} />
          </View>
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={handleChangeAvatar}
          >
            <Ionicons name="camera-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.role}>Học sinh</Text>
        <UpdateProfileInfo />
        <UpdateContactInfo />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: "100%",
  },
  avatarBox: {
    position: "relative",
    width: 110,
    height: 110,
    marginBottom: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    width: 110,
    height: 110,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#25345D",
    overflow: "hidden",
    backgroundColor: "#f2f6fa",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 20,
  },
  cameraIcon: {
    position: "absolute",
    right: -12,
    bottom: -12,
    width: 40,
    height: 40,
    backgroundColor: "rgba(60,60,60,0.25)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  plusIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#25345D",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  role: {
    fontSize: 16,
    color: "#25345D",
    fontWeight: "bold",
    marginBottom: 6,
    alignSelf: "center",
  },
  form: {
    width: "90%",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#25345D",
    marginBottom: 4,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#25345D",
  },
  saveBtn: {
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 120,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    alignSelf: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
