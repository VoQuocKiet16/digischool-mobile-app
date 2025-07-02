import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CARDS = [
  { title: "Vắng có phép", value: 3 },
  { title: "Vắng không phép", value: 3 },
  { title: "Vi phạm", value: 3 },
];

export default function ChartStudentTopday() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      {CARDS.map((c, i) =>
        c.title === "Vắng có phép" ? (
          <TouchableOpacity key={c.title} onPress={() => router.push("/manage/attended?type=student")} activeOpacity={0.8} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <MaterialIcons name="subdirectory-arrow-left" size={20} color="#4B5B8C" />
            </View>
            <View style={styles.centerBox}>
              <Text style={styles.bigNumber}>{c.value}</Text>
              <Text style={styles.unitText}>người</Text>
            </View>
          </TouchableOpacity>
        ) : c.title === "Vắng không phép" ? (
          <TouchableOpacity key={c.title} onPress={() => router.push("/manage/absence?type=student")} activeOpacity={0.8} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <MaterialIcons name="subdirectory-arrow-left" size={20} color="#4B5B8C" />
            </View>
            <View style={styles.centerBox}>
              <Text style={styles.bigNumber}>{c.value}</Text>
              <Text style={styles.unitText}>người</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.card} key={c.title}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <MaterialIcons name="subdirectory-arrow-left" size={20} color="#4B5B8C" />
            </View>
            <View style={styles.centerBox}>
              <Text style={styles.bigNumber}>{c.value}</Text>
              <Text style={styles.unitText}>người</Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#D7DCE5',
    borderRadius: 22,
    padding: 18,
    width: '92%',
    minHeight: 90,
    marginBottom: 18,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#1A2343',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  bigNumber: {
    fontSize: 44,
    color: '#1A2343',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: -2,
  },
  unitText: {
    fontSize: 16,
    color: '#1A2343',
    marginTop: -2,
  },
});
