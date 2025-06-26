import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ProfileSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={require('../../../../assets/images/avatar1.png')}
      />
      <Text style={styles.name}>Nguyen Van A</Text>
      <Text style={styles.role}>Hoc sinh - 12A4</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, backgroundColor: '#f0f0f0' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  role: { fontSize: 14, color: '#666' },
});

export default ProfileSection;