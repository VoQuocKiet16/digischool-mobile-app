import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface MessageListScreenProps {
  userName?: string;
  roles?: string[];
}

const chatData = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: require("../../assets/images/avt_default.png"),
    lastMessage: "Bạn: Hey, please pay the rent for me before tomorrow.",
    time: "Now",
    unread: 10,
  },
  // ... có thể lặp lại cho demo ...
  {
    id: "2",
    name: "Nguyễn Văn A",
    avatar: require("../../assets/images/avt_default.png"),
    lastMessage: "Bạn: Hey, please pay the rent for me before tomorrow.",
    time: "Now",
    unread: 10,
  },
  {
    id: "3",
    name: "Nguyễn Văn A",
    avatar: require("../../assets/images/avt_default.png"),
    lastMessage: "Bạn: Hey, please pay the rent for me before tomorrow.",
    time: "Now",
    unread: 10,
  },
  {
    id: "4",
    name: "Nguyễn Văn A",
    avatar: require("../../assets/images/avt_default.png"),
    lastMessage: "Bạn: Hey, please pay the rent for me before tomorrow.",
    time: "Now",
    unread: 10,
  },
  {
    id: "5",
    name: "Nguyễn Văn A",
    avatar: require("../../assets/images/avt_default.png"),
    lastMessage: "Bạn: Hey, please pay the rent for me before tomorrow.",
    time: "Now",
    unread: 10,
  },
];

export default function MessageListScreen({
  userName,
  roles,
}: MessageListScreenProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#215562"
            style={{ marginLeft: 10, marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Find users..."
            placeholderTextColor="#A0A0A0"
            value={search}
            onChangeText={setSearch}
          />
          <MaterialIcons
            name="sort-by-alpha"
            size={22}
            color="#215562"
            style={{ marginHorizontal: 6 }}
          />
        </View>
        <TouchableOpacity
          style={styles.addChatBtn}
          onPress={() => router.push("/message/add_contact")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#215562"
          />
        </TouchableOpacity>
      </View>
      {/* Danh sách chat */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push("/message/message_box")}
            activeOpacity={0.8}
          >
            <View style={styles.chatItem}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.chatContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              <View style={styles.rightInfo}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E6EEF2",
    height: 44,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#29375C",
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  addChatBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E6EEF2",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#29375C",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: "#A0A0A0",
    marginBottom: 0,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 40,
  },
  time: {
    fontSize: 13,
    color: "#A0A0A0",
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: "#FFA726",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
