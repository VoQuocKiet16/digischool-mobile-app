import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import PlusIcon from '../../components/PlusIcon';

const NEWS = [
  {
    id: '1',
    title: 'Bí kíp chinh phục phương trình bậc hai',
    desc: 'Phương trình bậc hai - một "đối thủ" quen thuộc trong toán học, nhưng làm thế nào để hạ gục nó một cách nhanh gọn?',
    time: '4 giờ trước',
    image: { uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80' },
    pinned: true,
  },
  {
    id: '2',
    title: 'Bí kíp chinh phục phương trình bậc hai',
    desc: 'Phương trình bậc hai - một "đối thủ" quen thuộc trong toán học, nhưng làm thế nào để hạ gục nó một cách nhanh gọn?',
    time: '4 giờ trước',
    image: { uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80' },
    pinned: true,
  },
  {
    id: '3',
    title: 'Bí kíp chinh phục phương trình bậc hai',
    desc: 'Phương trình bậc hai - một "đối thủ" quen thuộc trong toán học, nhưng làm thế nào để hạ gục nó một cách nhanh gọn?',
    time: '4 giờ trước',
    image: { uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80' },
    pinned: true,
  },
  {
    id: '4',
    title: 'Bí kíp chinh phục phương trình bậc hai',
    desc: 'Phương trình bậc hai - một "đối thủ" quen thuộc trong toán học, nhưng làm thế nào để hạ gục nó một cách nhanh gọn?',
    time: '4 giờ trước',
    image: { uri: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80' },
    pinned: true,
  },
];

export default function ManageNewsScreen() {
  return (
    <HeaderLayout
      title="Danh sách tin đăng"
      subtitle="Tin đăng của thầy Trung"
    >
      <View style={styles.container}>
        <FlatList
          data={NEWS}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={item.image} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Ionicons name="pin" size={20} color="#25345D" style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
                <View style={styles.cardFooter}>
                  <Ionicons name="time-outline" size={16} color="#7D88A7" style={{ marginRight: 4 }} />
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
              </View>
            </View>
          )}
        />
        <View style={styles.plusWrap}>
          <PlusIcon text="Thêm tin tức" onPress={() => { /* TODO: chuyển sang trang thêm tin */ }} />
        </View>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    paddingTop: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#25345D',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 18,
    width: 320,
    alignSelf: 'center',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#25345D',
    flex: 1,
  },
  cardDesc: {
    color: '#7D88A7',
    fontSize: 14,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTime: {
    color: '#7D88A7',
    fontSize: 13,
  },
  plusWrap: {
    marginTop: 8,
    marginBottom: 30,
    alignItems: 'flex-start',
    width: '90%',
  },
});
