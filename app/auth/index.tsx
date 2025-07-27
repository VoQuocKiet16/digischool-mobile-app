import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

const { width } = Dimensions.get("window");

const slides = [
  {
    key: "1",
    title: "Quản Lý Thời Khoá Biểu",
    description:
      "Cập nhật lịch học và nhận thông báo tự động về tiết vắng, kiểm tra và các thay đổi trong thời khoá biểu ngay trên ứng dụng. Nhắc nhở thông minh giúp bạn không bao giờ bỏ lỡ tiết học quan trọng.",
    image: require("../../assets/images/student1.png"),
  },
  {
    key: "2",
    title: "Xin Phép Và Đánh Giá",
    description:
      "Xin phép vắng học chỉ với vài thao tác, và ngay sau mỗi tiết học, bạn có thể dễ dàng đánh giá giáo viên, giúp nâng cao chất lượng giảng dạy và học tập.",
    image: require("../../assets/images/student2.png"),
  },
  {
    key: "3",
    title: "Nhận Thông Báo",
    description:
      "Nhận thông báo tức thì về các hoạt động trong trường như lịch kiểm tra, cuộc họp và các thông tin quan trọng từ giáo viên, quản lý và nhà trường để luôn cập nhật mọi thông tin cần thiết.",
    image: require("../../assets/images/student3.png"),
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Shared values for animations
  const imageOpacity = useSharedValue(1);
  const imageScale = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);
  const indicatorOpacity = useSharedValue(1);

  // Animation function
  const animateTransition = useCallback(
    (direction: "next" | "prev", newIndex: number) => {
      if (isTransitioning) return;

      setIsTransitioning(true);

      // Animate out
      imageOpacity.value = withTiming(0.7, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      imageScale.value = withTiming(0.95, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      textOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      textTranslateY.value = withTiming(direction === "next" ? -20 : 20, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      indicatorOpacity.value = withTiming(0.5, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });

      // Change content and animate in
      setTimeout(() => {
        setCurrentIndex(newIndex);

        imageOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
        imageScale.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
        textOpacity.value = withTiming(1, {
          duration: 250,
          easing: Easing.out(Easing.quad),
        });
        textTranslateY.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.quad),
        });
        indicatorOpacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });

        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 200);
    },
    [isTransitioning]
  );

  // Animated styles
  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));

  const handleDone = useCallback(() => {
    router.replace("/auth/login");
  }, [router]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      animateTransition("prev", currentIndex - 1);
    }
  }, [currentIndex, isTransitioning, animateTransition]);

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1 && !isTransitioning) {
      animateTransition("next", currentIndex + 1);
    } else if (currentIndex === slides.length - 1 && !isTransitioning) {
      // Chuyển đến trang login khi ở slide cuối
      router.replace("/auth/login");
    }
  }, [currentIndex, isTransitioning, animateTransition, router]);

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.slide}>
      <Animated.Image
        source={currentSlide.image}
        style={[styles.image, imageStyle]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Animated.View style={indicatorStyle}>
          <Indicator total={slides.length} current={currentIndex} />
        </Animated.View>
        <Animated.Text style={[styles.title, textStyle]}>
          {currentSlide.title}
        </Animated.Text>
        <Animated.Text style={[styles.description, textStyle]}>
          {currentSlide.description}
        </Animated.Text>
        <View style={styles.iconRow}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={styles.iconCircleOutline}
              onPress={goToPrev}
              disabled={isTransitioning}
            >
              <Icon name="arrow-back" size={32} color="#29375C" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconCircleFilled}
            onPress={goToNext}
            disabled={isTransitioning}
          >
            <Icon name="arrow-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  image: {
    width: width,
    height: 350,
  },
  content: {
    backgroundColor: "#fff",
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 58,
    marginTop: 8,
  },
  dot: {
    backgroundColor: "#29375C",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#29375C",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: fonts.bold,
  },
  description: {
    fontSize: 15,
    color: "#7a869a",
    textAlign: "center",
    marginBottom: 90,
    fontFamily: fonts.medium,
  },
  button: {
    backgroundColor: "#2d3a4b",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircleOutline: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#29375C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#fff",
  },
  iconCircleFilled: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#29375C",
    justifyContent: "center",
    alignItems: "center",
  },
});
