import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Quản Lý Thời Khoá Biểu',
    description: 'Cập nhật lịch học và nhận thông báo tự động về tiết vắng, kiểm tra và các thay đổi trong thời khoá biểu ngay trên ứng dụng. Nhắc nhở thông minh giúp bạn không bao giờ bỏ lỡ tiết học quan trọng.',
    image: require('../../assets/images/student1.png'),
  },
  {
    key: '2',
    title: 'Xin Phép Và Đánh Giá',
    description: 'Xin phép vắng học chỉ với vài thao tác, và ngay sau mỗi tiết học, bạn có thể dễ dàng đánh giá giáo viên, giúp nâng cao chất lượng giảng dạy và học tập.',
    image: require('../../assets/images/student2.png'),
  },
  {
    key: '3',
    title: 'Nhận Thông Báo',
    description: 'Nhận thông báo tức thì về các hoạt động trong trường như lịch kiểm tra, cuộc họp và các thông tin quan trọng từ giáo viên, quản lý và nhà trường để luôn cập nhật mọi thông tin cần thiết.',
    image: require('../../assets/images/student3.png'),
  },
];

function Indicator({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: total }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.dot,
            idx === current ? styles.activeDot : null,
            idx === current ? styles.activeDotLong : null,
          ]}
        />
      ))}
    </View>
  );
}

export default function TutorialScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const handleDone = () => {
    router.replace('/auth/login');
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      swiperRef.current.scrollBy(-1);
    }
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      swiperRef.current.scrollBy(1);
    }
  };

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      showsPagination={false}
      onIndexChanged={setCurrentIndex}
      scrollEnabled={false}
    >
      {slides.map((slide, idx) => (
        <View style={styles.slide} key={slide.key}>
          <Image source={slide.image} style={styles.image} resizeMode="cover" />
          <View style={styles.content}>
            <Indicator total={slides.length} current={idx === currentIndex ? currentIndex : idx} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={[styles.iconCircleOutline, currentIndex === 0 && { opacity: 0.3 }]}
                onPress={goToPrev}
                disabled={currentIndex === 0}
              >
                <Icon name="arrow-back" size={24} color="#25345D" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconCircleFilled, currentIndex === slides.length - 1 && { opacity: 0.3 }]}
                onPress={goToNext}
                disabled={currentIndex === slides.length - 1}
              >
                <Icon name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {idx === slides.length - 1 ? (
              <TouchableOpacity style={styles.button} onPress={handleDone}>
                <Text style={styles.buttonText}>Bắt đầu</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
    </Swiper>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: 350,
  },
  content: {
    backgroundColor: '#fff',
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  dot: {
    backgroundColor: '#25345D',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
  },
  activeDotLong: {
    width: 32,
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3a4b',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#7a869a',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#2d3a4b',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#25345D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
  },
  iconCircleFilled: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#25345D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
