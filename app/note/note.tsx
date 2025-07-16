import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import PlusIcon from "../../components/PlusIcon";
import { getNotesByLesson } from "../../services/note_lesson.service";
import { getLessonSubtitle } from "../../utils/lessonSubtitle";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2;

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n) + "..." : str;

const NoteCard = ({
  title,
  content,
  remindTime,
  onPress,
}: {
  title: string;
  content: string;
  remindTime: string;
  onPress?: () => void;
}) => (
  <View style={[styles.card, { width: cardWidth }]}>
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1 }}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{truncate(title, 10)}</Text>
        <MaterialIcons name="push-pin" size={18} color="#2d3a5a" style={{ transform: [{ rotate: '40deg' }] }} />
      </View>
      <Text style={styles.cardContent}>{truncate(content, 50)}</Text>
      <View style={styles.cardFooter}>
        <MaterialIcons name="access-time" size={16} color="#2d3a5a" />
        <Text style={styles.remindText}>Nhắc hẹn trước {remindTime}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const NoteScreen = () => {
  const { lessonId, lessonData: lessonDataParam } = useLocalSearchParams<{
    lessonId: string;
    lessonData?: string;
  }>();
  const [lessonData, setLessonData] = useState<any>(
    lessonDataParam ? JSON.parse(lessonDataParam) : null
  );
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
        {notes.length === 0 && (
          <Text style={styles.noNotesText}>Không có ghi chú nào</Text>
        )}
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              remindTime={item.time ? `${item.time}'` : ""}
              onPress={() =>
                router.push({
                  pathname: "/note/detail_note",
                  params: {
                    id: item._id,
                    title: item.title,
                    content: item.content,
                    remindTime: item.time,
                    lessonData: JSON.stringify(lessonData),
                  },
                })
              }
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchNotes}
          ListFooterComponent={
            notes.length > 0 ? (
              <View style={styles.addNoteWrapper}>
                <PlusIcon
                  onPress={() =>
                    router.push({
                      pathname: "/note/add_note",
                      params: {
                        lessonId,
                        lessonData: JSON.stringify(lessonData),
                      },
                    })
                  }
                />
              </View>
            ) : null
          }
        />
        {notes.length === 0 && (
          <View style={styles.addNoteWrapper}>
            <PlusIcon
              onPress={() =>
                router.push({
                  pathname: "/note/add_note",
                  params: { lessonId, lessonData: JSON.stringify(lessonData) },
                })
              }
            />
          </View>
        )}
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginVertical: 16,
    marginHorizontal: 8,
  },
  card: {
    backgroundColor: "#E5E8F0",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
  },
  cardContent: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },
  remindText: {
    fontSize: 13,
    color: "#29375C",
    marginLeft: 6,
    fontFamily: "Baloo2-Medium",
  },
  addNoteWrapper: {
    marginTop: 32,
    marginLeft: 16,
    marginBottom: 24,
  },
  noNotesText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Baloo2-Medium",
    fontSize: 14,
    color: "#A0A0A0",
  },
});

export default NoteScreen;
