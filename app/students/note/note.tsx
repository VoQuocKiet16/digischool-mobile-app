import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../../components/layout/HeaderLayout";
import NoteIcon from "../../../components/note/NoteIcon";

const notes = [
  {
    id: "1",
    title: "Ghi chú 1",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "50",
  },
  {
    id: "2",
    title: "Ghi chú 2",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "30'",
  },
  {
    id: "3",
    title: "Ghi chú 3",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "30'",
  },
  {
    id: "4",
    title: "Ghi chú 4",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "30'",
  },
  {
    id: "5",
    title: "Ghi chú 5",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "30'",
  },
  {
    id: "6",
    title: "Ghi chú 6",
    content:
      "Phản ứng oxi hóa - khử: Lập phương trình (2H₂ + O₂ → 2H₂O). Làm bài 1, 2 (SGK p.45). Chuẩn bị kiểm tra.",
    remindTime: "30'",
  },
];

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2;

const NoteCard = ({ title, content, remindTime, onPress }: { title: string; content: string; remindTime: string; onPress?: () => void }) => (
  <View style={[styles.card, { width: cardWidth }]}>
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{flex: 1}}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <FontAwesome name="thumb-tack" size={18} color="#2d3a5a" />
      </View>
      <Text style={styles.cardContent}>{content}</Text>
      <View style={styles.cardFooter}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="#2d3a5a" />
        <Text style={styles.remindText}>Nhắc hẹn trước {remindTime}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const NoteScreen = () => {
  return (
    <HeaderLayout
      title="Danh sách ghi chú"
      subtitle="Sáng → Tiết 3 → Hóa học → 10a3"
      onBack={() => {}}
    >
      <View style={styles.container}>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              remindTime={item.remindTime}
              onPress={() => router.push({
                pathname: '/students/note/detail_note',
                params: {
                  id: item.id,
                  title: item.title,
                  content: item.content,
                  remindTime: item.remindTime,
                }
              })}
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.addNoteWrapper}>
          <NoteIcon onPress={() => router.push('/students/note/add_note')} />
        </View>
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#F6F8FB",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#F6F8FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 4,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3a5a",
  },
  cardContent: {
    fontSize: 14,
    color: "#2d3a5a",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  remindText: {
    fontSize: 13,
    color: "#2d3a5a",
    marginLeft: 6,
    fontWeight: "500",
  },
  addNoteWrapper: {
    marginTop: 32,
    marginLeft: 8,
    marginBottom: 24,
  },
});

export default NoteScreen;
