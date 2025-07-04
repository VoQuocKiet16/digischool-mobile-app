import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function ManageSchedule() {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
  }, []);

  return <Header title="Quản lý thời khoá biểu" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"}/>;
}
