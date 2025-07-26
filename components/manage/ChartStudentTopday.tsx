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
      {CARDS.map((c, i) => (
        <View style={styles.card} key={c.title}>
          {c.title === "Vắng có phép" ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/manage/attended?type=student")}
              style={{ flex: 1 }}
            >
              <Text style={styles.cardTitle}>
                <Text
                  style={[styles.linkText, { textDecorationLine: "underline" }]}
                >
                  {c.title}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginTop: 2,
                  justifyContent: "center",
                }}
              >
                <Text style={styles.bigNumber2}>{c.value}</Text>
                <Text style={styles.unitText}>người</Text>
              </View>
            </TouchableOpacity>
          ) : c.title === "Vắng không phép" ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/manage/absence?type=student")}
              style={{ flex: 1 }}
            >
              <Text style={styles.cardTitle}>
                <Text
                  style={[styles.linkText, { textDecorationLine: "underline" }]}
                >
                  {c.title}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginTop: 2,
                  justifyContent: "center",
                }}
              >
                <Text style={styles.bigNumber2}>{c.value}</Text>
                <Text style={styles.unitText}>người</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                <Text
                  style={[styles.linkText, { textDecorationLine: "underline" }]}
                >
                  {c.title}
                </Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginTop: 2,
                  justifyContent: "center",
                }}
              >
                <Text style={styles.bigNumber2}>{c.value}</Text>
                <Text style={styles.unitText}>người</Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#D7DCE5",
    borderRadius: 26,
    padding: 22,
    width: "92%",
    minHeight: 120,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  linkText: {
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
  },
  centerBox: {
    alignItems: "center",
    marginTop: 8,
  },
  bigNumber: {
    fontSize: 44,
    color: "#1A2343",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: -2,
  },
  bigNumber2: {
    fontSize: 55,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 1,
  },
  unitText: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginLeft: 6,
    marginBottom: 6,
  },
});
