import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import NoteIcon from "../../components/PlusIcon";
import { getNotesByLesson } from "../../services/note_lesson.service";
import { getLessonSubtitle } from "../../utils/lessonSubtitle";


const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2;

const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n) + '...' : str);

const NoteCard = ({ title, content, remindTime, onPress }: { title: string; content: string; remindTime: string; onPress?: () => void }) => (
  <View style={[styles.card, { width: cardWidth }]}>
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{flex: 1}}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{truncate(title, 20)}</Text>
        <FontAwesome name="thumb-tack" size={18} color="#2d3a5a" />
      </View>
      <Text style={styles.cardContent}>{truncate(content, 30)}</Text>
      <View style={styles.cardFooter}>
        <MaterialCommunityIcons name="clock-outline" size={16} color="#2d3a5a" />
        <Text style={styles.remindText}>Nhắc hẹn trước {remindTime}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const NoteScreen = () => {
  const { lessonId, lessonData: lessonDataParam } = useLocalSearchParams<{ lessonId: string, lessonData?: string }>();
  const [lessonData, setLessonData] = useState<any>(lessonDataParam ? JSON.parse(lessonDataParam) : null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchNotes();
    }
  }, [lessonId]);

  const fetchNotes = async () => {
    setLoading(true);
    const res = await getNotesByLesson(lessonId);
    console.log('API getNotesByLesson result:', res);
    setLoading(false);
    if (res.success && Array.isArray(res.data?.data)) {
      setNotes(res.data.data);
    } else {
      setNotes([]);
    }
  };

  return (
    <HeaderLayout
      title="Danh sách ghi chú"
      subtitle={getLessonSubtitle(lessonData)}
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              remindTime={item.time ? `${item.time} phút` : ""}
              onPress={() => router.push({
                pathname: '/note/detail_note',
                params: {
                  id: item._id,
                  title: item.title,
                  content: item.content,
                  remindTime: item.time,
                  lessonData: JSON.stringify(lessonData),
                }
              })}
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchNotes}
        />
        <View style={styles.addNoteWrapper}>
          <NoteIcon onPress={() => router.push({ pathname: '/note/add_note', params: { lessonId, lessonData: JSON.stringify(lessonData) } })} />
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
