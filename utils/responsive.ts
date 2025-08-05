import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions for design reference (iPhone 14 Pro)
const baseWidth = 393;
const baseHeight = 852;

// Font families
export const fonts = {
  bold: "Baloo2-Bold",
  extraBold: "Baloo2-ExtraBold", 
  medium: "Baloo2-Medium",
  regular: "Baloo2-Regular",
  semiBold: "Baloo2-SemiBold",
};

// Helper function to get font style for Android compatibility
export const getFontStyle = (fontFamily: string) => {
  if (Platform.OS === 'android') {
    switch (fontFamily) {
      case fonts.bold:
        return { fontFamily, fontWeight: 'bold' as const };
      case fonts.extraBold:
        return { fontFamily, fontWeight: '900' as const };
      case fonts.semiBold:
        return { fontFamily, fontWeight: '600' as const };
      case fonts.medium:
        return { fontFamily, fontWeight: '500' as const };
      case fonts.regular:
        return { fontFamily, fontWeight: '400' as const };
      default:
        return { fontFamily };
    }
  }
  return { fontFamily };
};

// Responsive utility functions
export const responsive = {
  // Width calculations
  width: (percentage: number) => width * (percentage / 100),
  widthByBase: (size: number) => (width / baseWidth) * size,
  
  // Height calculations
  height: (percentage: number) => height * (percentage / 100),
  heightByBase: (size: number) => (height / baseHeight) * size,
  
  // Font size with min/max limits
  fontSize: (size: number, min = 12, max = 32) => {
    const calculated = (width / baseWidth) * size;
    return Math.max(min, Math.min(max, calculated));
  },
  
  // Padding/Margin with responsive scaling
  spacing: (size: number) => Math.min(size, width * 0.05),
  
  // Border radius
  borderRadius: (size: number) => Math.min(size, width * 0.03),
  
  // Icon size
  iconSize: (size: number) => Math.min(size, width * 0.06),
  
  // Card dimensions
  cardWidth: (percentage: number) => width * (percentage / 100),
  cardHeight: (percentage: number) => height * (percentage / 100),
  
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Aspect ratios
  aspectRatio: width / height,
  
  // Breakpoints
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  isTablet: width >= 768,
};

// Predefined responsive values
export const responsiveValues = {
  // Spacing
  padding: {
    s: responsive.spacing(-50),
    xs: responsive.spacing(4),
    sm: responsive.spacing(8),
    md: responsive.spacing(16),
    lg: responsive.spacing(24),
    xl: responsive.spacing(32),
    xxl: responsive.spacing(40),
    xxxl: responsive.spacing(55),
  },
  
  // Font sizes
  fontSize: {
    xs: responsive.fontSize(10),
    sm: responsive.fontSize(14),
    md: responsive.fontSize(16),
    lg: responsive.fontSize(18),
    xl: responsive.fontSize(20),
    xxl: responsive.fontSize(24),
    xxxl: responsive.fontSize(28),
  },
  
  // Icon sizes
  iconSize: {
    sm: responsive.iconSize(16),
    md: responsive.iconSize(20),
    lg: responsive.iconSize(24),
    xl: responsive.iconSize(28),
    xxl: responsive.iconSize(32),
    xxxl: responsive.iconSize(55),
    xxxxl: responsive.iconSize(80),
  },
  
  // Border radius
  borderRadius: {
    sm: responsive.borderRadius(4),
    md: responsive.borderRadius(8),
    lg: responsive.borderRadius(12),
    xl: responsive.borderRadius(16),
    xxl: responsive.borderRadius(20),
    xxxl: responsive.borderRadius(28),
    xxxxl: responsive.borderRadius(32),
  },
};

export default responsive; 