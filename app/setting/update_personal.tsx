import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

export default function UpdatePersonal() {
  const [avatar, setAvatar] = useState(
    require("../../assets/images/avt_default.png")
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
    <HeaderLayout title="Thông tin cá nhân" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarBox}>
          <Image source={avatar} style={styles.avatar} />
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={handleChangeAvatar}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" />
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    backgroundColor: "rgba(60,60,60,0.25)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  role: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: fonts.medium,
    marginBottom: 25,
    alignSelf: "center",
  },
  form: {
    width: "90%",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 130,
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
