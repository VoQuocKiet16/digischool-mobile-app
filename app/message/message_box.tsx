import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const messages = [
  {
    id: "1",
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipisicing Elit, Sed Do Elusmod Tempor Incididunt Ut Labore Et Dolore.",
    time: "10 AM",
    isMe: false,
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "2",
    text: "Sed Do Elusmod Tempor Incididunt Ut Labore Et Magna Aliqua. Ut Enim Ad Minim Veniam, Quis Nostrud Exercitation Ullamco Laboris Nisi Ut Aliqui.",
    time: "10 AM",
    isMe: true,
    avatar: require("../../assets/images/avatar2.png"),
  },
  {
    id: "3",
    text: "Lorem Ipsum Dolor Sit",
    time: "10 AM",
    isMe: false,
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "4",
    text: "Sed Do Elusmod Tempor Incididunt Ut Labore Et Magna Aliqua. Ut Enim Ad Minim Veniam.",
    time: "10 AM",
    isMe: true,
    avatar: require("../../assets/images/avatar2.png"),
  },
  {
    id: "5",
    text: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing",
    time: "10 AM",
    isMe: false,
    avatar: require("../../assets/images/avt_default.png"),
  },
  {
    id: "6",
    text: "Sed Do Elusmod Tempor Incididunt Ut Labore Et",
    time: "10 AM",
    isMe: true,
    avatar: require("../../assets/images/avatar2.png"),
  },
  {
    id: "7",
    text: "Ok",
    time: "10 AM",
    isMe: false,
    avatar: require("../../assets/images/avt_default.png"),
  },
];

export default function MessageBoxScreen() {
  const [input, setInput] = useState("");

  const renderMessage = ({ item }: { item: (typeof messages)[0] }) => (
    <View
      style={[
        styles.messageRow,
        item.isMe ? styles.messageRowMe : styles.messageRowOther,
      ]}
    >
      {!item.isMe && <Image source={item.avatar} style={styles.avatar} />}
      <View
        style={[
          styles.bubble,
          item.isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isMe ? styles.textMe : styles.textOther,
          ]}
        >
          {item.text}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {item.isMe && <Image source={item.avatar} style={styles.avatar} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nguyễn Văn A</Text>
          <Text style={styles.headerSubtitle}>Truy cập 3 tiếng trước</Text>
        </View>
        {/* Danh sách tin nhắn */}
        <View style={styles.listWrapper}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            inverted
          />
        </View>
        {/* Input gửi tin nhắn */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={16}
        >
          <View style={styles.inputRow}>
            <Ionicons
              name="happy-outline"
              size={24}
              color="#29375C"
              style={{ marginHorizontal: 8 }}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn tại đây..."
              placeholderTextColor="#A0A0A0"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={24} color="#29375C" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#29375C",
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  listWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
  },
  bubble: {
    maxWidth: "70%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 2,
  },
  bubbleMe: {
    backgroundColor: "#3B4B7B",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#6D8FEF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  textMe: {
    color: "#fff",
  },
  textOther: {
    color: "#fff",
  },
  time: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.7,
    alignSelf: "flex-end",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    margin: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#29375C",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "transparent",
  },
  sendBtn: {
    padding: 6,
    borderRadius: 20,
  },
});
