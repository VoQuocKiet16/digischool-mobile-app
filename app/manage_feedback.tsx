import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import LoadingModal from "../components/LoadingModal";
import { useNotificationContext } from "../contexts/NotificationContext";
import manageService, { FeedbackData, FeedbackStats } from "../services/manage.service";

// Status options
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả", color: "#29375C" },
  { value: "pending", label: "Chờ xử lý", color: "#FF9500" },
  { value: "reviewed", label: "Đã xem", color: "#007AFF" },
  { value: "resolved", label: "Đã giải quyết", color: "#34C759" },
];

// Rating options
const RATING_OPTIONS = [
  { value: 0, label: "Tất cả" },
  { value: 1, label: "1 sao" },
  { value: 2, label: "2 sao" },
  { value: 3, label: "3 sao" },
  { value: 4, label: "4 sao" },
  { value: 5, label: "5 sao" },
];

export default function ManageFeedback() {
  const { hasUnreadNotification, isLoading: notificationLoading } = useNotificationContext();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  
  // Data states
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("userName").then(name => {
      if (name) setUserName(name);
    });
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedRating, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load feedbacks
      const feedbacksResponse = await manageService.getParentFeedbacks({
        status: selectedStatus === "all" ? undefined : selectedStatus,
        rating: selectedRating === 0 ? undefined : selectedRating,
        page: currentPage,
        limit: 10,
      });
      
      setFeedbacks(feedbacksResponse.feedbacks);
      setTotalPages(feedbacksResponse.pagination.pages);

      // Load stats
      try {
        const statsResponse = await manageService.getFeedbackStats();
        setStats(statsResponse);
      } catch (error) {

      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu feedback. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackPress = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const handleRespond = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || "");
    setNewStatus(feedback.status);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback) return;

    setLoadingModalVisible(true);
    try {
      await manageService.updateFeedbackStatus(
        selectedFeedback._id,
        newStatus,
        adminResponse
      );
      
      setShowResponseModal(false);
      setShowDetailModal(false);
      loadData(); // Reload data
      Alert.alert("Thành công", "Đã cập nhật phản hồi thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể cập nhật phản hồi. Vui lòng thử lại.");
    } finally {
      setLoadingModalVisible(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name={star <= rating ? "star" : "star-border"}
            size={16}
            color={star <= rating ? "#FFD700" : "#D7DCE5"}
          />
        ))}
      </View>
    );
  };

  const renderStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: statusOption?.color || "#29375C" }]}>
        <Text style={styles.statusBadgeText}>{statusOption?.label || status}</Text>
      </View>
    );
  };

  const renderFeedbackItem = ({ item }: { item: FeedbackData }) => (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => handleFeedbackPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.feedbackHeader}>
        <View style={styles.userInfo}>
          <MaterialIcons name="person" size={20} color="#29375C" />
          <Text style={styles.userName}>{item.user.name}</Text>
        </View>
        <View style={styles.feedbackMeta}>
          {renderStars(item.rating)}
          {renderStatusBadge(item.status)}
        </View>
      </View>
      
      <Text style={styles.feedbackDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.feedbackFooter}>
        <Text style={styles.feedbackDate}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        {item.adminResponse && (
          <View style={styles.responseIndicator}>
            <MaterialIcons name="reply" size={16} color="#34C759" />
            <Text style={styles.responseText}>Đã phản hồi</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => {
    if (!stats) return null;
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Thống kê tổng quan</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng cộng</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reviewed}</Text>
            <Text style={styles.statLabel}>Đã xem</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>Đã giải quyết</Text>
          </View>
        </View>
        <View style={styles.averageRating}>
          <Text style={styles.averageLabel}>Đánh giá trung bình:</Text>
          {renderStars(Math.round(stats.averageRating))}
          <Text style={styles.averageText}>{stats.averageRating.toFixed(1)}/5</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Quản lý Feedback" name={userName ? `QL ${userName}` : "QL Nguyễn Văn A"} hasUnreadNotification={!notificationLoading && hasUnreadNotification} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {renderStatsCard()}

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Bộ lọc</Text>
          
          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedStatus === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedStatus === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Đánh giá:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              {RATING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedRating === option.value && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedRating(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedRating === option.value && styles.filterOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Feedbacks List */}
        <View style={styles.feedbacksSection}>
          <Text style={styles.sectionTitle}>Danh sách feedback</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#29375C" style={{marginBottom: 12}} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : feedbacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="feedback" size={48} color="#D7DCE5" />
              <Text style={styles.emptyText}>Không có feedback nào</Text>
            </View>
          ) : (
            <FlatList
              data={feedbacks}
              renderItem={renderFeedbackItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <MaterialIcons name="chevron-left" size={20} color={currentPage === 1 ? "#D7DCE5" : "#29375C"} />
              </TouchableOpacity>
              
              <Text style={styles.paginationText}>
                Trang {currentPage} / {totalPages}
              </Text>
              
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <MaterialIcons name="chevron-right" size={20} color={currentPage === totalPages ? "#D7DCE5" : "#29375C"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết feedback</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#29375C" />
              </TouchableOpacity>
            </View>

            {selectedFeedback && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Phụ huynh:</Text>
                  <Text style={styles.detailValue}>{selectedFeedback.user.name}</Text>
                  <Text style={styles.detailSubValue}>{selectedFeedback.user.email}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Đánh giá:</Text>
                  <View style={styles.ratingSection}>
                    {renderStars(selectedFeedback.rating)}
                    <Text style={styles.ratingText}>{selectedFeedback.rating}/5 sao</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Nội dung:</Text>
                  <Text style={styles.detailDescription}>{selectedFeedback.description}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Trạng thái:</Text>
                  {renderStatusBadge(selectedFeedback.status)}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Ngày gửi:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>

                {selectedFeedback.adminResponse && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Phản hồi của admin:</Text>
                    <Text style={styles.detailDescription}>{selectedFeedback.adminResponse}</Text>
                    {selectedFeedback.respondedAt && (
                      <Text style={styles.detailSubValue}>
                        Phản hồi lúc: {new Date(selectedFeedback.respondedAt).toLocaleString('vi-VN')}
                      </Text>
                    )}
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.respondButton}
                onPress={() => {
                  setShowDetailModal(false);
                  handleRespond(selectedFeedback!);
                }}
              >
                <Text style={styles.respondButtonText}>Phản hồi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phản hồi feedback</Text>
              <TouchableOpacity 
                onPress={() => setShowResponseModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#29375C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Trạng thái *</Text>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => {
                      // Simple dropdown implementation
                      const currentIndex = STATUS_OPTIONS.findIndex(opt => opt.value === newStatus);
                      const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
                      setNewStatus(STATUS_OPTIONS[nextIndex].value);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {STATUS_OPTIONS.find(opt => opt.value === newStatus)?.label || newStatus}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#29375C" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Phản hồi</Text>
                <TextInput
                  style={styles.textArea}
                  value={adminResponse}
                  onChangeText={setAdminResponse}
                  placeholder="Nhập phản hồi cho phụ huynh..."
                  placeholderTextColor="#7B859C"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowResponseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleSubmitResponse}
              >
                <Text style={styles.confirmButtonText}>Gửi phản hồi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalVisible}
        text="Đang xử lý..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    backgroundColor: "#D7DCE5",
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginTop: 4,
    textAlign: "center",
  },
  averageRating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  averageLabel: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  averageText: {
    fontSize: 14,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
  },
  filtersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 15,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterOption: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D7DCE5",
  },
  filterOptionActive: {
    backgroundColor: "#29375C",
    borderColor: "#29375C",
  },
  filterOptionText: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  filterOptionTextActive: {
    color: "#fff",
  },
  feedbacksSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#f7f7f7",
  },
  loadingText: {
    color: '#29375C',
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginTop: 10,
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
  },
  feedbackMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: "Baloo2-SemiBold",
    color: "#fff",
  },
  feedbackDescription: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    lineHeight: 20,
    marginBottom: 8,
  },
  feedbackFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackDate: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  responseIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  responseText: {
    fontSize: 12,
    fontFamily: "Baloo2-Medium",
    color: "#34C759",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 15,
  },
  paginationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D7DCE5",
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#D7DCE5",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#29375C",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  detailSubValue: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    marginTop: 4,
  },
  detailDescription: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#7B859C",
    lineHeight: 20,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#D7DCE5",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#7B859C",
  },
  respondButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  respondButtonText: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#fff",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#29375C",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#fff",
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Baloo2-SemiBold",
    color: "#29375C",
    marginBottom: 8,
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D7DCE5",
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D7DCE5",
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    color: "#29375C",
    minHeight: 100,
  },
}); 