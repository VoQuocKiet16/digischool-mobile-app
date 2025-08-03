import React from "react";
import Toast from "react-native-toast-message";

interface ToastNotificationProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onPress?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  onClose,
  onPress,
}) => {
  React.useEffect(() => {
    if (visible) {
      Toast.show({
        type: 'success',
        text1: 'Bạn có thông báo mới',
        text2: '',
        position: 'top',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
        onPress: onPress,
        onHide: onClose,
      });
    }
  }, [visible, onPress, onClose]);

  return null;
};

export default ToastNotification; 