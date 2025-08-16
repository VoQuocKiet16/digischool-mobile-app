import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import SafeScreen from "../../components/SafeScreen";
import { useChatContext } from "../../contexts/ChatContext";
import chatService from "../../services/chat.service";
import { fonts, responsive, responsiveValues } from "../../utils/responsive";

// Hàm format giờ:phút
function formatHourMinute(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

// Hàm format label ngày
function formatDateLabel(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return "Hôm nay";
  if (isYesterday) return "Hôm qua";
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

export default function MessageBoxScreen() {
  // Nhận params từ router
  const { userId, token: paramToken, myId: paramMyId, name } = useLocalSearchParams();
  const { currentUserId, currentToken } = useChatContext();

  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageForViewer, setSelectedImageForViewer] = useState<any>(null);
  const [imageViewerOpacity] = useState(new Animated.Value(0));
  const [imageViewerScale] = useState(new Animated.Value(0.8));
  const [token, setToken] = useState<string | null>(paramToken as string || currentToken);
  const [myId, setMyId] = useState<string | null>(paramMyId as string || currentUserId);
  const [isReady, setIsReady] = useState(false);
  const [myName, setMyName] = useState<string>('bạn');
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Lấy token và myId từ AsyncStorage nếu chưa có
  useEffect(() => {
    let done = false;
    const getData = async () => {
      if (!token) {
        const t = await AsyncStorage.getItem("token");
        if (t) setToken(t);
      }
      if (!myId) {
        const id = await AsyncStorage.getItem("userId");
        if (id) setMyId(id);
      }
      setIsReady(true);
    };
    getData();
    return () => { done = true; };
  }, []);

  // Lấy tên người gửi từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('name').then(name => {
      if (name) setMyName(name);
    });
  }, []);

  // Load messages từ API
  useEffect(() => {
    if (!isReady) return; // Chờ lấy xong token/myId

    // Gọi API ngay lập tức
    fetchMessagesFromAPI();
  }, [isReady, userId]);

  // Tách fetch messages ra ngoài để có thể gọi lại
  const fetchMessagesFromAPI = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await chatService.getMessagesWith(userId as string, token as string);
      if (res.success) {
        const filtered = (res.data || []).filter((msg: any) => !!msg.content || !!msg.mediaUrl);
        const sorted = filtered.sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || a.time || 0).getTime();
          const timeB = new Date(b.createdAt || b.time || 0).getTime();
          return timeA - timeB;
        });
        setMessages(sorted);
      } else {
        setError(res.message || "Lỗi không xác định");
        if (!messages.length) setMessages([]);
      }
    } catch (err) {
      setError("Lỗi kết nối server");
      if (!messages.length) setMessages([]);
    } finally {
      setLoading(false);
    }
  };



  // Lắng nghe tin nhắn mới
  useEffect(() => {
    if (!isReady) return;

    const actualUserId = myId as string;
    chatService.onNewMessage(actualUserId, (msg) => {
      const isRelevantMessage = (
        (msg.sender === actualUserId && msg.receiver === userId) ||
        (msg.sender === userId && msg.receiver === actualUserId)
      );
      if (!isRelevantMessage) return;
      
      setMessages((prev) => {
        const idx = prev.findIndex(
          (m) =>
            !m._id &&
            m.content === msg.content &&
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            (!m.mediaUrl || m.mediaUrl === msg.mediaUrl)
        );
        const next = idx !== -1 ? (() => { const arr = [...prev]; arr[idx] = { ...msg }; return arr; })() : [...prev, msg];
        return next;
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    
    return () => {
      // ChatContext quản lý lifecycle socket
    };
  }, [isReady, userId, token, myId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  useEffect(() => {
    const handleRead = (data: any) => {
      setMessages((prev) => {
        let updated = prev.map((msg) =>
          data.messageId && msg._id === data.messageId
            ? { ...msg, status: "read" }
            : data.from && msg.sender === myId && msg.receiver === data.from
              ? { ...msg, status: "read" }
              : msg
        );
        // Nếu không có messageId nào khớp, thử cập nhật status cho tin nhắn cuối cùng do mình gửi
        if (data.messageId && !prev.some(msg => msg._id === data.messageId)) {
          const myMsgs = updated.filter(m => m.sender === myId);
          if (myMsgs.length > 0) {
            const lastMsgId = myMsgs[myMsgs.length - 1]._id;
            updated = updated.map(msg =>
              msg._id === lastMsgId ? { ...msg, status: "read" } : msg
            );
          }
        }
        return updated;
      });
    };
    const actualUserId = myId as string;
    chatService.onMessageRead(actualUserId, handleRead);
    return () => {
      chatService.offMessageRead(actualUserId, handleRead);
    };
  }, [myId]);

  // Thêm useEffect để lắng nghe sự kiện bàn phím
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll xuống tin nhắn cuối cùng khi bàn phím xuất hiện
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageLoading(true);
      setSelectedImage(asset);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Cho phép chọn tất cả loại file
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFileLoading(true);
        setSelectedFile(asset);
        
        // Reset fileLoading sau khi file được set thành công
        setTimeout(() => {
          setFileLoading(false);
        }, 100);
      }
    } catch (error) {
      console.error('❌ Lỗi khi chọn file:', error);
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  // Hàm xử lý long press vào media
  const handleLongPressMedia = (media: any) => {
    setSelectedMedia(media);
    setShowMenu(true);
  };

  // Hàm xử lý bấm vào ảnh để xem
  const handlePressImage = (image: any) => {
    setSelectedImageForViewer(image);
    setShowImageViewer(true);
    
    // Reset animation values
    imageViewerOpacity.setValue(0);
    imageViewerScale.setValue(0.8);
    
    // Animate in
    Animated.parallel([
      Animated.timing(imageViewerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageViewerScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Hàm đóng image viewer với animation
  const closeImageViewer = () => {
    Animated.parallel([
      Animated.timing(imageViewerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(imageViewerScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowImageViewer(false);
      setSelectedImageForViewer(null);
    });
  };

  // Hàm xử lý bấm vào file để mở
  const handlePressFile = async (file: any) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này');
        return;
      }

      await Sharing.shareAsync(file.mediaUrl);
    } catch (error) {
      console.error('❌ Lỗi khi mở file:', error);
      Alert.alert('Lỗi', 'Không thể mở file');
    }
  };

  // Hàm tải file về máy
  const handleDownloadFile = async () => {
    if (!selectedMedia) return;
    
    try {
      setShowMenu(false);
      
      // Kiểm tra quyền truy cập media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập để tải file về máy');
        return;
      }

      // Tải file từ URL
      const fileName = selectedMedia.content || 'file';
      const fileExtension = selectedMedia.mediaUrl.split('.').pop() || '';
      const localFileName = `${fileName}.${fileExtension}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        selectedMedia.mediaUrl,
        FileSystem.documentDirectory + localFileName
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }
      
      // Lưu vào media library
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      
      Alert.alert('Thành công', 'File đã được tải về máy');
      
    } catch (error) {
      console.error('❌ Lỗi khi tải file:', error);
      Alert.alert('Lỗi', 'Không thể tải file về máy');
    }
  };

  // Hàm tải hình ảnh về máy
  const handleDownloadImage = async () => {
    if (!selectedMedia) return;
    
    try {
      setShowMenu(false);
      
      // Kiểm tra quyền truy cập media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập để tải ảnh về máy');
        return;
      }

      // Tải ảnh từ URL
      const fileName = `image_${Date.now()}.jpg`;
      const localFileName = FileSystem.documentDirectory + fileName;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        selectedMedia.mediaUrl,
        localFileName
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Download failed');
      }
      
      // Lưu vào media library
      const asset = await MediaLibrary.createAssetAsync(result.uri);
      await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      
      Alert.alert('Thành công', 'Ảnh đã được tải về máy');
      
    } catch (error) {
      console.error('❌ Lỗi khi tải ảnh:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh về máy');
    }
  };

  // Hàm chia sẻ media
  const handleShareMedia = async () => {
    if (!selectedMedia) return;
    
    try {
      setShowMenu(false);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này');
        return;
      }

      await Sharing.shareAsync(selectedMedia.mediaUrl);
      
    } catch (error) {
      console.error('❌ Lỗi khi chia sẻ:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ media');
    }
  };

  const handleSend = async () => {
    if (sending) return;
    
    // Set user has interacted when they send a message
    setHasUserInteracted(true);
    
    setSending(true);
    // Nếu có ảnh, upload trước
    if (selectedImage) {
      const localUri = selectedImage.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename ?? "");
      // Xác định đúng mime type
      let type = "image";
      if (match) {
        const ext = match[1].toLowerCase();
        if (ext === "jpg" || ext === "jpeg") type = "image/jpeg";
        else if (ext === "png") type = "image/png";
        else if (ext === "heic") type = "image/heic";
        else if (ext === "webp") type = "image/webp";
        else type = `image/${ext}`;
      }
      const fileObj = {
        uri: localUri,
        name: filename,
        type,
      };
      try {
        const uploadRes = await chatService.uploadMedia(
          fileObj,
          token as string
        );
        if (uploadRes.success && uploadRes.data.url) {
          // Thêm tin nhắn tạm thời vào messages
          const tempMsg = {
            sender: myId,
            receiver: userId,
            content: "",
            mediaUrl: uploadRes.data.url,
            type: "image",
            createdAt: new Date().toISOString(),
            status: "sending",
            avatar: null,
          };
          setMessages((prev) => { const next = [...prev, tempMsg]; return next; });

          await chatService.sendMessageAPI(
            {
              receiver: userId,
              content: "",
              mediaUrl: uploadRes.data.url,
              type: "image",
            },
            token as string
          );
          const actualUserId = myId as string;
          chatService.sendMessageSocket(actualUserId, {
            sender: actualUserId,
            receiver: userId,
            content: "",
            mediaUrl: uploadRes.data.url,
            type: "image",
          });
          setSelectedImage(null);

          // Scroll xuống tin nhắn cuối cùng sau khi gửi
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } else {
          Alert.alert("Lỗi gửi ảnh", uploadRes.message || "Không gửi được ảnh");
        }
      } catch (err) {
        Alert.alert("Lỗi gửi ảnh", "Không gửi được ảnh");
      }
      setSending(false);
      return;
    }

    // Nếu có file, upload trước
    if (selectedFile) {
      setFileLoading(true); // Set loading khi bắt đầu gửi
      
      const localUri = selectedFile.uri;
      const filename = selectedFile.name || localUri.split("/").pop();
      const fileObj = {
        uri: localUri,
        name: filename,
        type: selectedFile.mimeType || 'application/octet-stream',
      };
      
      try {
        const uploadRes = await chatService.uploadMedia(
          fileObj,
          token as string
        );
        
        if (uploadRes.success && uploadRes.data.url) {
          // Thêm tin nhắn tạm thời vào messages
          const tempMsg = {
            sender: myId,
            receiver: userId,
            content: filename || "File",
            mediaUrl: uploadRes.data.url,
            type: "file",
            createdAt: new Date().toISOString(),
            status: "sending",
            avatar: null,
          };
          setMessages((prev) => { const next = [...prev, tempMsg]; return next; });

          await chatService.sendMessageAPI(
            {
              receiver: userId,
              content: filename || "File",
              mediaUrl: uploadRes.data.url,
              type: "file",
            },
            token as string
          );
          const actualUserId = myId as string;
          chatService.sendMessageSocket(actualUserId, {
            sender: actualUserId,
            receiver: userId,
            content: filename || "File",
            mediaUrl: uploadRes.data.url,
            type: "file",
          });
          setSelectedFile(null);
          setFileLoading(false);

          // Scroll xuống tin nhắn cuối cùng sau khi gửi
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } else {
          Alert.alert("Lỗi gửi file", uploadRes.message || "Không gửi được file");
        }
      } catch (err) {
        console.error('❌ Lỗi exception khi upload file:', err);
        Alert.alert("Lỗi gửi file", "Không gửi được file");
      }
      setSending(false);
      return;
    }
    // Nếu chỉ gửi text
    if (!input.trim()) {
      setSending(false);
      return;
    }
    const data = {
      receiver: userId,
      content: input.replace(/^[\s\n]+|[\s\n]+$/g, ""),
      type: "text",
    };
    // Thêm tin nhắn tạm thời vào messages
    const tempMsg = {
      sender: myId,
      receiver: userId,
      content: data.content,
      type: "text",
      createdAt: new Date().toISOString(),
      status: "sending",
      avatar: null,
    };
    setMessages((prev) => { const next = [...prev, tempMsg]; return next; });
    // Invalidate cache để đảm bảo data luôn fresh
    // invalidateMessages(userId as string); // This line is removed
    const res = await chatService.sendMessageAPI(data, token as string);
    if (!res.success) {
      Alert.alert("Lỗi gửi tin nhắn", res.message || "Gửi tin nhắn thất bại");
      setSending(false);
      return;
    }
    const actualUserId = myId as string;
    chatService.sendMessageSocket(actualUserId, {
      sender: actualUserId,
      receiver: userId,
      content: input,
      type: "text",
    });
    setInput("");
    setSending(false);
    // Invalidate conversation cache để cập nhật conversation list
    // invalidateConversations(); // This line is removed
    // Scroll xuống tin nhắn cuối cùng sau khi gửi
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Xác định id tin nhắn mới nhất của mình
  const myLastMessageId = (() => {
    const myMsgs = messages.filter((m) => m.sender === myId);
    const lastId = myMsgs.length > 0 ? myMsgs[myMsgs.length - 1]._id : null;
    return lastId;
  })();

  // Hàm kiểm tra tin nhắn này có phải là tin cuối cùng của mình không
  function isLastMyMsg(item: any, messages: any[], myId: any) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === myId) {
        return messages[i]._id === item._id;
      }
    }
    return false;
  }

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.sender === myId;
    const isMyLastMsg = isMe && item._id === myLastMessageId;
    // Khôi phục lại hai dòng này để tránh lỗi linter
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
    // Chỉ hiển thị thời gian nếu là cuối cụm (tin nhắn tiếp theo khác sender hoặc là cuối danh sách)
    const showTime = !nextMsg || nextMsg.sender !== item.sender;
    
    // Logic hiển thị avatar: luôn hiển thị avatar cho tin nhắn cuối cùng của mỗi người
    const showAvatar = isMe ? (!nextMsg || nextMsg.sender !== item.sender) : (!nextMsg || nextMsg.sender !== item.sender);
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {isMe && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 8, width: '100%' }}>
            <View style={{ flexShrink: 1, flexGrow: 1, maxWidth: '90%', alignItems: 'flex-end' }}>
                             <LinearGradient
                 colors={["#29375C", "#29375C"]}
                 start={{ x: 0, y: 1 }}
                 end={{ x: 1, y: 1 }}
                 style={[styles.bubble, styles.bubbleMe]}
               >
                 {item.mediaUrl && item.type === "image" ? (
                   <TouchableOpacity
                     onPress={() => handlePressImage(item)}
                     onLongPress={() => handleLongPressMedia(item)}
                     activeOpacity={0.8}
                   >
                     <Image
                       source={{ uri: item.mediaUrl }}
                       style={{
                         width: 180,
                         height: 180,
                         borderRadius: 12,
                         marginBottom: 4,
                       }}
                     />
                   </TouchableOpacity>
                                                  ) : item.mediaUrl && item.type === "file" ? (
                    <TouchableOpacity
                      onPress={() => handlePressFile(item)}
                      onLongPress={() => handleLongPressMedia(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.fileMessageContainer}>
                        <Ionicons name="document" size={32} color="#fff" />
                        <Text style={[styles.messageText, { color: '#fff', marginLeft: 8 }]} numberOfLines={1}>
                          {(item.content || "File").length > 20 
                            ? (item.content || "File").substring(0, 20) + "..." 
                            : (item.content || "File")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                ) : (
                  <Text style={[styles.messageText, { color: '#fff' }]}> {(item.content || "").replace(/^[\s\n]+|[\s\n]+$/g, "")}</Text>
                )}
              </LinearGradient>
              {showTime && (
                  <Text style={styles.timeBelow}>{formatHourMinute(item.createdAt)}</Text>
              )}
            </View>
            {showAvatar ? (
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar }
                    : require("../../assets/images/avt_default.png")
                }
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}
          </View>
        )}
        {/* Tin nhắn của người nhận */}
        {!isMe && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end', marginBottom: 8, width: '100%' }}>
            {showAvatar ? (
              <Image
                source={
                  item.avatar
                    ? { uri: item.avatar }
                    : require("../../assets/images/avt_default.png")
                }
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={{ flexShrink: 1, flexGrow: 1, maxWidth: '90%', alignItems: 'flex-start' }}>
                             <View style={[styles.bubble, styles.bubbleOther]}>
                 {item.mediaUrl && item.type === "image" ? (
                   <TouchableOpacity
                     onPress={() => handlePressImage(item)}
                     onLongPress={() => handleLongPressMedia(item)}
                     activeOpacity={0.8}
                   >
                     <Image
                       source={{ uri: item.mediaUrl }}
                       style={{
                         width: 180,
                         height: 180,
                         borderRadius: 12,
                         marginBottom: 4,
                       }}
                     />
                   </TouchableOpacity>
                                                  ) : item.mediaUrl && item.type === "file" ? (
                    <TouchableOpacity
                      onPress={() => handlePressFile(item)}
                      onLongPress={() => handleLongPressMedia(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.fileMessageContainer}>
                        <Ionicons name="document" size={32} color="#fff" />
                        <Text style={[styles.messageText, styles.textOther, { marginLeft: 8 }]} numberOfLines={1}>
                          {(item.content || "File").length > 20 
                            ? (item.content || "File").substring(0, 20) + "..." 
                            : (item.content || "File")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                ) : (
                  <Text style={[styles.messageText, styles.textOther]}>
                    {(item.content || "").replace(/^[\s\n]+|[\s\n]+$/g, "")}
                  </Text>
                )}
              </View>
              {showTime && (
                <Text style={[styles.timeBelow, { alignSelf: 'flex-start' }]}>{formatHourMinute(item.createdAt)}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Hàm mark as read khi user thực sự tương tác
  const markAsReadWhenInteracting = () => {
    if (hasUserInteracted && myId && userId) {
      const actualUserId = myId as string;
      // Chỉ mark as read cho conversation hiện tại
      chatService.markAsRead(actualUserId, actualUserId, userId as string);
    }
  };

  // Mark as read khi user gửi tin nhắn
  useEffect(() => {
    if (hasUserInteracted) {
      markAsReadWhenInteracting();
    }
  }, [hasUserInteracted, userId]); // Thêm userId vào dependency để đảm bảo chỉ mark as read cho conversation hiện tại

  // Mark as read khi màn hình box focus trở lại (chỉ khi user đã tương tác)
  useFocusEffect(
    React.useCallback(() => {
      if (myId && userId && hasUserInteracted) {
        chatService.markAsRead(myId as string, myId as string, userId as string);
      }
    }, [myId, userId, hasUserInteracted])
  );

  return (
    <SafeScreen>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{name || "Đoạn chat"}</Text>
          </View>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : responsiveValues.padding.lg}
        >
          <View style={{ flex: 1, backgroundColor: "#29375C" }}>
            {/* Danh sách tin nhắn */}
            <View style={[styles.listWrapper, { flex: 1 }]}>
              {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} />
              ) : error ? (
                <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
                  {error}
                </Text>
              ) : messages.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 24 }}>
                  <View style={{
                    alignItems: 'center',
                    width: 320,
                    maxWidth: '100%',
                  }}>
                    <Text style={{ color: '#29375C', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', fontFamily: fonts.bold }}>
                      Xin chào bạn !
                    </Text>
                    <Text style={{ color: '#29375C', fontSize: 15, marginBottom: 18, textAlign: 'center', lineHeight: 22, fontFamily: fonts.regular }}>
                      Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện với {name || 'người nhận'} nhé.
                    </Text>
                  </View>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) =>
                    item._id?.toString() ||
                    item.id?.toString() ||
                    Math.random().toString()
                  }
                  renderItem={({ item, index }) => {
                    // Xác định có cần chèn label ngày không
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const currDate = item.createdAt ? new Date(item.createdAt).toDateString() : '';
                    const prevDate = prevMsg && prevMsg.createdAt ? new Date(prevMsg.createdAt).toDateString() : '';
                    const showDateLabel = !prevMsg || currDate !== prevDate;
                    return (
                      <>
                        {showDateLabel && formatDateLabel(item.createdAt) && (
                          <View style={{ alignItems: 'center', marginVertical: 8 }}>
                            <Text style={{ backgroundColor: '#BFC6D1', color: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14 }}>
                              {formatDateLabel(item.createdAt)}
                            </Text>
                          </View>
                        )}
                        {renderMessage({ item, index })}
                      </>
                    );
                  }}
                  contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: keyboardVisible ? responsiveValues.padding.xl : responsiveValues.padding.sm }
                  ]}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => {
                    // Chỉ scroll tự động khi không phải user đang scroll
                    if (!keyboardVisible) {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }
                  }}
                  onLayout={() => {
                    // Scroll xuống cuối khi layout thay đổi
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: false });
                    }, 100);
                  }}
                  keyboardShouldPersistTaps="handled"
                  maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10,
                  }}
                />
              )}
            </View>
            {/* Preview ảnh và file đã chọn (nếu có) và input gửi tin nhắn */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.inputContainer}>
                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    {imageLoading ? (
                      <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#29375C" />
                        {/* Render ảnh ẩn để ép sự kiện load */}
                        <Image
                          source={{ uri: selectedImage.uri }}
                          style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
                          onLoad={() => setImageLoading(false)}
                          onLoadEnd={() => setImageLoading(false)}
                        />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={{ width: 100, height: 100, borderRadius: 8 }}
                        onLoad={() => setImageLoading(false)}
                        onLoadEnd={() => setImageLoading(false)}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedImage(null);
                        setImageLoading(false);
                      }}
                      style={{ marginLeft: -16, marginBottom: 100 }}
                    >
                      <Ionicons name="close-circle" size={28} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
                {selectedFile && (
                  <View style={styles.filePreviewContainer}>
                    {fileLoading ? (
                      <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#29375C" />
                      </View>
                    ) : (
                      <View style={styles.fileInfo}>
                        <Ionicons name="document" size={40} color="#29375C" />
                        <View style={styles.fileDetails}>
                                                     <Text style={styles.fileName} numberOfLines={1}>
                             {(selectedFile.name || 'File').length > 20 
                               ? (selectedFile.name || 'File').substring(0, 20) + "..." 
                               : (selectedFile.name || 'File')}
                           </Text>
                          <Text style={styles.fileSize}>
                            {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                          </Text>
                        </View>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedFile(null);
                        setFileLoading(false);
                      }}
                      style={{ marginLeft: 16 }}
                    >
                      <Ionicons name="close-circle" size={28} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputRow}>
                  <TouchableOpacity
                    onPress={handlePickFile}
                    disabled={sending}
                    style={{ marginHorizontal: 8 }}
                  >
                    <Ionicons name="document-outline" size={24} color="#29375C" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    disabled={sending}
                  >
                    <Ionicons name="image" size={24} color="#29375C" />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { maxHeight: 100, textAlignVertical: 'top' }]}
                    placeholder="Nhập tin nhắn tại đây..."
                    placeholderTextColor="#A0A0A0"
                    value={input}
                    onChangeText={setInput}
                    editable={!sending}
                    multiline={true}
                    blurOnSubmit={false}
                    onFocus={() => {
                      // Scroll xuống tin nhắn cuối cùng khi focus vào input
                      setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                    }}
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={handleSend}
                    disabled={sending}
                  >
                    <Ionicons
                      name="send"
                      size={24}
                      color={sending ? "#A0A0A0" : "#29375C"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
                         </TouchableWithoutFeedback>
           </View>
         </KeyboardAvoidingView>
       </View>
       
               {/* Menu popup khi long press media */}
        {showMenu && selectedMedia && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuBackground}
              onPress={() => setShowMenu(false)}
              activeOpacity={1}
            />
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  if (selectedMedia.type === "image") {
                    handleDownloadImage();
                  } else if (selectedMedia.type === "file") {
                    handleDownloadFile();
                  }
                }}
              >
                <Ionicons name="download-outline" size={24} color="#29375C" />
                <Text style={styles.menuItemText}>Tải về máy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleShareMedia}
              >
                <Ionicons name="share-outline" size={24} color="#29375C" />
                <Text style={styles.menuItemText}>Chia sẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close-outline" size={24} color="#A0A0A0" />
                <Text style={[styles.menuItemText, { color: '#A0A0A0' }]}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modal xem ảnh */}
        {showImageViewer && selectedImageForViewer && (
          <Animated.View 
            style={[
              styles.imageViewerOverlay,
              {
                opacity: imageViewerOpacity,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.imageViewerBackground}
              onPress={closeImageViewer}
              activeOpacity={1}
            />
            <Animated.View 
              style={[
                styles.imageViewerContainer,
                {
                  transform: [{ scale: imageViewerScale }],
                }
              ]}
            >
              <TouchableOpacity
                style={styles.imageViewerCloseButton}
                onPress={closeImageViewer}
              >
                <Ionicons name="close-circle" size={32} color="#000" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImageForViewer.mediaUrl }}
                style={styles.imageViewerImage}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>
        )}
      </SafeScreen>
   );
 }

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#29375C",
    paddingTop: responsive.height(6),
    paddingBottom: responsive.height(2),
    paddingHorizontal: responsiveValues.padding.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: responsiveValues.fontSize.xl,
    fontFamily: fonts.semiBold,
    marginBottom: responsiveValues.padding.xs,
  },
  listContent: {
    paddingHorizontal: responsiveValues.padding.md,
    paddingTop: responsiveValues.padding.md,
    paddingBottom: responsiveValues.padding.sm,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  listWrapper: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    flex: 1,
    overflow: "hidden",
    marginBottom: 0, // Đảm bảo không có khoảng cách
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: responsiveValues.padding.md,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: responsiveValues.iconSize.lg,
    height: responsiveValues.iconSize.lg,
    borderRadius: responsiveValues.borderRadius.xl,
    marginHorizontal: responsiveValues.padding.xs,
  },
  bubble: {
    maxWidth: "70%",
    borderRadius: 35,
    paddingVertical: responsiveValues.padding.sm,
    paddingHorizontal: responsiveValues.padding.md,
    marginHorizontal: responsiveValues.padding.xs,
  },
  bubbleMe: {
    borderBottomRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: "#5E6987",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: responsiveValues.fontSize.md,
    marginBottom: responsiveValues.padding.xs,
    fontFamily: fonts.regular,
  },
  textMe: {
    color: "#fff",
  },
  textOther: {
    color: "#fff",
  },
  timeBelow: {
    fontSize: responsiveValues.fontSize.xs,
    color: '#A0A0A0',
    marginTop: responsiveValues.padding.xs,
    alignSelf: 'flex-end',
    fontFamily: fonts.regular,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: responsiveValues.borderRadius.xxxl,
    marginHorizontal: responsiveValues.padding.lg,
    marginBottom: responsiveValues.padding.lg,
    paddingHorizontal: responsiveValues.padding.lg,
    paddingVertical: responsiveValues.padding.sm,
    shadowColor: "#29375C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: responsiveValues.fontSize.md,
    color: "#29375C",
    paddingVertical: responsiveValues.padding.xs,
    paddingHorizontal: responsiveValues.padding.xs,
    marginLeft: responsiveValues.padding.md,
    fontFamily: fonts.regular,
  },
  sendBtn: {
    padding: responsiveValues.padding.xs,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0, // Loại bỏ border radius để liền mạch với listWrapper
    borderTopRightRadius: 0,
    shadowColor: "#000",
  },
  imagePreviewContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 2,
    alignSelf: "stretch",
  },
  filePreviewContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 2,
    alignSelf: "stretch",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: responsiveValues.fontSize.md,
    color: "#29375C",
    fontFamily: fonts.medium,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: responsiveValues.fontSize.sm,
    color: "#A0A0A0",
    fontFamily: fonts.regular,
  },
  fileMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveValues.padding.xs,
    maxWidth: "100%",
    flexShrink: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  menuBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: responsiveValues.fontSize.md,
    color: '#29375C',
    fontFamily: fonts.medium,
    marginLeft: 12,
  },
  imageViewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
  },
  imageViewerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageViewerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Đảm bảo transform hoạt động mượt mà
    backfaceVisibility: 'hidden',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1002,
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
});