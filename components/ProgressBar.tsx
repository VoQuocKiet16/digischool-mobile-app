import { responsive, responsiveValues } from '@/utils/responsive';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
  size?: 'small' | 'medium' | 'large';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 5,
  labels = ['Tạo yêu cầu', 'Giáo viên phê duyệt', 'Quản lý phê duyệt', 'Xác nhận', 'Hoàn thành'],
  size = 'medium'
}) => {
  const getStepIcon = (stepIndex: number, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <View style={[styles.stepIcon, styles.completedStep, { backgroundColor: '#10B981' }]}>
          <MaterialIcons name="check" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color="#fff" />
        </View>
      );
    }
    
    if (isCurrent) {
      return (
        <View style={[styles.stepIcon, styles.currentStep, { backgroundColor: '#3B82F6' }]}>
          <MaterialIcons name="radio-button-checked" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color="#fff" />
        </View>
      );
    }
    
    return (
      <View style={[styles.stepIcon, styles.pendingStep, { backgroundColor: '#E5E7EB' }]}>
        <MaterialIcons name="radio-button-unchecked" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} color="#9CA3AF" />
      </View>
    );
  };

  const getStepLabel = (stepIndex: number, isCompleted: boolean, isCurrent: boolean) => {
    const labelStyle = [
      styles.stepLabel,
      isCompleted && styles.completedLabel,
      isCurrent && styles.currentLabel,
      !isCompleted && !isCurrent && styles.pendingLabel
    ];

    return (
      <ThemedText style={labelStyle} numberOfLines={2}>
        {labels[stepIndex]}
      </ThemedText>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <View key={index} style={styles.stepContainer}>
              {getStepIcon(index, isCompleted, isCurrent)}
              {getStepLabel(index, isCompleted, isCurrent)}
              
              {/* Connector line */}
              {index < totalSteps - 1 && (
                <View style={[
                  styles.connector,
                  isCompleted ? styles.completedConnector : styles.pendingConnector
                ]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: responsive.height(2),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveValues.padding.sm,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepIcon: {
    width: responsive.width(8),
    height: responsive.width(8),
    borderRadius: responsive.width(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsive.height(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedStep: {
    // Styles for completed steps
  },
  currentStep: {
    // Styles for current step
  },
  pendingStep: {
    // Styles for pending steps
  },
  stepLabel: {
    fontSize: responsiveValues.fontSize.xs,
    textAlign: 'center',
    fontFamily: 'Baloo2-Medium',
    maxWidth: responsive.width(20),
  },
  completedLabel: {
    color: '#10B981',
    fontWeight: '600',
  },
  currentLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  pendingLabel: {
    color: '#9CA3AF',
  },
  connector: {
    position: 'absolute',
    top: responsive.width(4), // Sử dụng width thay vì height để phù hợp với stepIcon
    left: '50%',
    right: 0,
    height: 2,
    zIndex: -1,
    transform: [{ translateX: responsive.width(4) }], // Offset để bắt đầu từ sau icon
  },
  completedConnector: {
    backgroundColor: '#10B981',
  },
  pendingConnector: {
    backgroundColor: '#E5E7EB',
  },
});

export default ProgressBar;
