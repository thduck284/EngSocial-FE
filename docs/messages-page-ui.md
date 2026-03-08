# Giao diện trang Nhắn tin (Messages)

Mô tả layout, text, label và button cho trang nhắn tin giữa người dùng.

---

## 1. Layout tổng quan

- **Route:** `/messages` (hoặc `/chat`)
- **Header:** Dùng **cùng header với trang Home** (AppHeader): logo EngSocial, ô tìm kiếm, menu điều hướng (Trang chủ, Kỹ năng, Bài học, …), đổi ngôn ngữ, thông báo, icon nhắn tin, avatar + dropdown (Trang cá nhân, Cài đặt, Đăng xuất). Không có header riêng cho trang tin nhắn.
- **Nội dung (3 cột kiểu Facebook):**
  - **Left bar:** Danh sách cuộc trò chuyện (conversation list).
  - **Main (giữa):** Vùng chat đang chọn (header cuộc trò chuyện + tin nhắn + ô nhập). Khi chưa chọn hội thoại: empty state “Chọn một cuộc trò chuyện”.
  - **Right bar:** Cột phải (thông tin cuộc trò chuyện / người chat, hoặc danh sách bạn bè đang online / gợi ý nhắn tin; khi chưa chọn chat có thể để trống hoặc nội dung mặc định).
- **Responsive:** Trên mobile: ẩn left/right bar, chỉ hiển thị main (list hoặc chat), dùng nút back để chuyển.

---

## 2. Left bar – Danh sách cuộc trò chuyện

### 2.1 Header sidebar
| Thành phần | Loại | Nội dung (VI / EN) |
|------------|------|--------------------|
| Tiêu đề | Heading | **Tin nhắn** / Messages |
| Ô tìm kiếm | Placeholder | Tìm cuộc trò chuyện... / Search conversations... |

### 2.2 Bộ lọc / tab (tùy chọn)
| Label | VI | EN |
|-------|----|----|
| Tab tất cả | Tất cả | All |
| Tab chưa đọc | Chưa đọc | Unread |

### 2.3 Một item hội thoại (trong list)
| Thành phần | Mô tả |
|------------|--------|
| Avatar | Ảnh đại diện người chat (hoặc nhóm). |
| Tên | Tên người hoặc tên nhóm. |
| Tin nhắn xem trước | Dòng cuối (text rút gọn) hoặc "Ảnh", "File". |
| Thời gian | "2 phút", "Hôm qua", "12/03" (tương đối). |
| Badge chưa đọc | Số (ví dụ 2) hoặc chấm xanh khi có tin mới. |

### 2.4 Trạng thái rỗng sidebar
| Text | VI | EN |
|------|----|----|
| Chưa có cuộc trò chuyện | Chưa có cuộc trò chuyện nào. | No conversations yet. |
| Gợi ý | Nhắn tin với bạn bè từ trang cá nhân hoặc trang bạn bè. | Message friends from their profile or the Friends page. |

---

## 3. Main – Vùng chat (khi đã chọn 1 hội thoại)

### 3.1 Header cuộc trò chuyện
| Thành phần | Loại | Nội dung / Ghi chú |
|------------|------|--------------------|
| Nút back (mobile) | Icon | Quay lại danh sách. |
| Avatar | Ảnh | Người đang chat. |
| Tên | Text | Tên người nhận. |
| Trạng thái | Text nhỏ | **Đang hoạt động** / Online hoặc "Hoạt động X phút trước". |
| Menu (3 chấm) | Button | Mở menu: Xem trang cá nhân, Chặn, Báo cáo. |

### 3.2 Khung tin nhắn
| Thành phần | Mô tả |
|------------|--------|
| Vùng cuộn | Danh sách tin nhắn, scroll xuống dưới mới nhất. |
| Tin của tôi | Căn phải, màu primary (hoặc bubble riêng). |
| Tin đối phương | Căn trái, bubble khác màu (ví dụ xám). |
| Mỗi bubble | Nội dung text, thời gian gửi (nhỏ, bên dưới hoặc bên cạnh). |
| Hỗ trợ | Ảnh (thumbnail), file đính kèm (tên + icon). |
| Trạng thái đã xem | "Đã gửi", "Đã xem" (tùy chọn). |

### 3.3 Trạng thái rỗng vùng chat (chưa chọn hội thoại)
| Text | VI | EN |
|------|----|----|
| Tiêu đề | Chọn một cuộc trò chuyện | Choose a conversation |
| Mô tả | Chọn từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới từ trang bạn bè / cá nhân. | Select from the list or start a new chat from Friends or a profile. |

### 3.4 Trạng thái không có tin nhắn (đã chọn hội thoại nhưng chưa ai gửi)
| Text | VI | EN |
|------|----|----|
| Nội dung | Chưa có tin nhắn. Hãy gửi lời chào! | No messages yet. Say hello! |

---

## 4. Right bar – Cột phải

- **Khi đã chọn 1 cuộc trò chuyện:** Hiển thị thông tin người đang chat (avatar lớn, tên, nút **Xem trang cá nhân**); có thể thêm **Chặn**, **Báo cáo**; hoặc danh sách ảnh/file đã gửi trong cuộc trò chuyện (tùy chọn).
- **Khi chưa chọn hội thoại:** Có thể hiển thị **Bạn bè đang online** (avatar + tên, bấm vào mở chat mới) hoặc **Gợi ý nhắn tin**; hoặc để trống / placeholder.

### 4.1 Label / nút (khi có chọn chat)
| Thành phần | VI | EN |
|------------|----|----|
| Tiêu đề | Thông tin cuộc trò chuyện | Conversation info |
| Nút | Xem trang cá nhân | View profile |
| Nút | Chặn | Block |
| Nút | Báo cáo | Report |

### 4.2 Khi chưa chọn chat (tùy chọn)
| Thành phần | VI | EN |
|------------|----|----|
| Tiêu đề | Bạn bè đang online | Friends online |
| Gợi ý | Chọn một cuộc trò chuyện hoặc bắt đầu nhắn tin với bạn bè. | Select a conversation or start a chat with a friend. |

---

## 5. Ô nhập tin & hành động (trong Main)

### 5.1 Ô nhập
| Thành phần | Placeholder / Label |
|------------|---------------------|
| Ô nhập text | **Nhập tin nhắn...** / Type a message... |
| Nút gửi | Icon gửi (send), tooltip: **Gửi** / Send |

### 5.2 Nút đính kèm (tùy chọn)
| Icon / Hành động | Tooltip (VI / EN) |
|------------------|-------------------|
| Đính kèm ảnh | Đính kèm ảnh / Attach image |
| Gửi file | Gửi file / Send file |
| Emoji | Chọn emoji / Pick emoji |

### 5.3 Phím tắt
- Gợi ý: Enter = gửi, Shift+Enter = xuống dòng (nếu hỗ trợ).

---

## 6. Menu ngữ cảnh (header chat)

| Mục menu | VI | EN |
|----------|----|----|
| Xem trang cá nhân | Xem trang cá nhân | View profile |
| Chặn | Chặn | Block |
| Báo cáo | Báo cáo cuộc trò chuyện | Report conversation |

---

## 7. Toast / Thông báo nhanh

| Tình huống | Text (VI / EN) |
|------------|----------------|
| Gửi thất bại | Gửi tin nhắn thất bại. / Failed to send message. |
| Kết nối lỗi | Mất kết nối. Đang thử kết nối lại... / Connection lost. Reconnecting... |
| Đã kết nối lại | Đã kết nối lại. / Reconnected. |

---

## 8. Các label dùng chung (gợi ý key i18n)

| Key (gợi ý) | VI | EN |
|-------------|----|----|
| `messages.title` | Tin nhắn | Messages |
| `messages.searchConversations` | Tìm cuộc trò chuyện... | Search conversations... |
| `messages.all` | Tất cả | All |
| `messages.unread` | Chưa đọc | Unread |
| `messages.noConversations` | Chưa có cuộc trò chuyện nào. | No conversations yet. |
| `messages.chooseConversation` | Chọn một cuộc trò chuyện | Choose a conversation |
| `messages.noMessagesYet` | Chưa có tin nhắn. Hãy gửi lời chào! | No messages yet. Say hello! |
| `messages.inputPlaceholder` | Nhập tin nhắn... | Type a message... |
| `messages.send` | Gửi | Send |
| `messages.viewProfile` | Xem trang cá nhân | View profile |
| `messages.block` | Chặn | Block |
| `messages.report` | Báo cáo cuộc trò chuyện | Report conversation |
| `messages.online` | Đang hoạt động | Online |
| `messages.sent` | Đã gửi | Sent |
| `messages.seen` | Đã xem | Seen |

---

## 9. Tóm tắt vùng chức năng

1. **Left bar:** Tiêu đề "Tin nhắn", ô tìm, danh sách cuộc trò chuyện (avatar, tên, preview, thời gian, badge).
2. **Main:** Header chat (back mobile, avatar, tên, trạng thái online, menu) → Vùng tin nhắn (bubble trái/phải, thời gian, đính kèm) → Ô nhập "Nhập tin nhắn...", nút gửi, đính kèm (tùy chọn). Empty state khi chưa chọn / chưa có tin.
3. **Right bar:** Khi đã chọn chat: thông tin cuộc trò chuyện (avatar, tên, Xem trang cá nhân, Chặn, Báo cáo). Khi chưa chọn: Bạn bè đang online hoặc gợi ý nhắn tin / để trống.

File này dùng làm tài liệu giao diện và tham chiếu cho copy (text/label/button) khi triển khai trang nhắn tin.
