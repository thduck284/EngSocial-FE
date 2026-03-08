# Đặc tả giao diện: Trang cá nhân người dùng khác (Public Profile)

## 1. Ngữ cảnh

- **Trang:** Hồ sơ công khai của một người dùng khác (không phải tài khoản đang đăng nhập).
- **Route gợi ý:** `/profile/:userId` hoặc `/user/:userId`. Ví dụ: `/profile/abc123` — khi `userId` trùng với user hiện tại có thể redirect về `/profile` (trang của tôi).
- **Vào trang khi:** Click vào avatar/tên user ở bài viết, bình luận, kết quả tìm kiếm bạn bè, gợi ý kết bạn, v.v.

---

## 2. Bố cục tổng thể

- **Header:** Giống toàn app (logo, ô tìm kiếm, nav, thông báo, avatar user đang đăng nhập).
- **Main:** Layout 2 cột (desktop): **Cột trái** (avatar, thông tin cơ bản, nút hành động, danh sách bạn bè) + **Cột phải** (tab Giới thiệu / Thông tin cá nhân / Bài viết / Ảnh / Video, nội dung tương ứng). Mobile: 1 cột, xếp lần lượt.

---

## 3. Cột trái (Left — Thông tin & Hành động)

### 3.1 Khối Avatar & Tên

- **Avatar:** Ảnh đại diện tròn (ví dụ 160x160px), không có nút đổi ảnh (khác với trang của tôi).
- **Tên hiển thị:** Tên người dùng (displayName hoặc username).
- **Level & XP:** Dòng text *"Level X · Y XP"* (key dùng chung `dashboard.level`, `profile.xp`). Thanh tiến độ XP (progress bar) từ 0 → xpMax; có thể hiển thị *"Z XP đến Level X+1"* (`profile.toLevel`).
- **Quan hệ với user hiện tại (nếu có):**
  - *"X bạn chung"* (`userProfile.mutualFriends`) — khi chưa kết bạn nhưng có bạn chung.
  - Badge *"Đã kết bạn"* (`userProfile.friendStatusConnected`) khi đã là bạn.
  - *"Đã gửi lời mời"* (`userProfile.friendStatusPending`) khi mình đã gửi lời mời kết bạn.

### 3.2 Nút hành động (Actions)

- **Chưa kết bạn & chưa gửi lời mời:** Nút **Thêm bạn** (icon `person_add`) — key `userProfile.addFriend`. Click → gửi lời mời, đổi trạng thái/nút.
- **Đã gửi lời mời (pending):** Nút **Đã gửi lời mời** disabled hoặc **Huỷ lời mời** (`userProfile.cancelRequest`).
- **Đã kết bạn:** Nút **Nhắn tin** (icon `chat_bubble`) — key `userProfile.sendMessage`; có thể thêm **Bạn bè** (đã kết bạn, không làm gì hoặc mở menu "Huỷ kết bạn").
- **Tuỳ chọn:** Nút **Báo cáo** (icon `flag` hoặc `report`) — key `userProfile.report` — mở modal hoặc trang báo cáo.

### 3.3 Khối Bạn bè

- **Tiêu đề:** *"Bạn bè (N)"* hoặc *"X bạn bè"* (`userProfile.friendsCount` hoặc `profile.friends` với count). Link *"Xem tất cả"* → trang danh sách bạn bè của user đó (route `/profile/:userId/friends` nếu có).
- **Danh sách:** 6–12 avatar + tên (grid hoặc list). Click vào một người → chuyển sang trang cá nhân của họ. Có thể hiển thị *"Y bạn chung"* với từng người nếu có.
- **Trạng thái trống:** *"Chưa có bạn bè."* (`userProfile.noFriends`).

---

## 4. Cột phải (Main — Tab nội dung)

### 4.1 Thanh tab

- Năm tab: **Giới thiệu** (`userProfile.tabAbout`), **Thông tin cá nhân** (`userProfile.tabPersonalInfo`), **Bài viết** (`userProfile.tabPosts`), **Ảnh** (`userProfile.tabPhotos`), **Video** (`userProfile.tabVideo`).
- Tab đang chọn: màu primary, gạch chân hoặc background nhẹ; tab khác: text xám. Click tab → đổi nội dung bên dưới. Trên mobile, thanh tab có thể cuộn ngang.

### 4.2 Tab « Giới thiệu »

- Nội dung **chỉ đọc** (không có form sửa):
  - **Giới thiệu / Bio:** Đoạn văn (có thể nhiều dòng). Nếu để trống: *"Chưa cập nhật giới thiệu."* (`userProfile.noBio`).
  - **Thông tin liên hệ (nếu công khai):** Số điện thoại, email (tuỳ thiết kế).
  - **Địa chỉ** (nếu công khai).
  - **Ngày tham gia:** *"Tham gia từ Tháng X, Năm Y"* (`userProfile.joinedSince`).
- Có thể thêm block **Thống kê kỹ năng** (Skill stats): Reading / Listening / Writing với XP từng kỹ năng (giống block trên trang của tôi nhưng read-only).
- Block **Thành tựu / Huy hiệu:** Danh sách achievement (icon + tên + ngày đạt). Nút *"Xem tất cả"* → trang thành tựu của user đó (nếu có).

### 4.3 Tab « Thông tin cá nhân »

- Hiển thị thông tin cá nhân mà user đó cho phép công khai (email, số điện thoại, địa chỉ, mục tiêu học, v.v.).
- **Trạng thái trống:** *"Chưa cập nhật thông tin cá nhân."* (`userProfile.noPersonalInfo`).

### 4.4 Tab « Bài viết »

- **Danh sách bài viết** do user đó đăng (công khai hoặc visible với user đang xem). Mỗi item là **thẻ bài viết** (post card): avatar, tên, thời gian, nội dung, ảnh (nếu có), hành động Thích / Bình luận / Chia sẻ.
- **Phân trang:** Nút *"Xem thêm"* hoặc pagination.
- **Trạng thái trống:** *"Chưa có bài viết nào."* (`userProfile.noPosts`).
- **Trạng thái tải:** Spinner hoặc skeleton.

### 4.5 Tab « Ảnh »

- Lưới ảnh do user đó đăng (từ bài viết hoặc album). Click ảnh → xem phóng to hoặc vào bài viết gốc.
- **Trạng thái trống:** *"Chưa có ảnh nào."* (`userProfile.noPhotos`).

### 4.6 Tab « Video »

- Danh sách hoặc lưới video do user đó đăng. Click → xem video hoặc vào bài viết gốc.
- **Trạng thái trống:** *"Chưa có video nào."* (`userProfile.noVideos`).

---

## 5. Breadcrumb & Back

- **Breadcrumb:** Trang chủ / Tìm kiếm (hoặc Cộng đồng) / **Tên người dùng** — key `userProfile.breadcrumb` hoặc dùng tên.
- **Nút quay lại:** *"Quay lại"* hoặc icon mũi tên — quay lại trang trước (history.back) hoặc link cố định (ví dụ `/home`).

---

## 6. Các label và nút (i18n gợi ý)

| Key | Vi (mẫu) | Ghi chú |
|-----|----------|--------|
| `userProfile.addFriend` | Thêm bạn | Nút kết bạn |
| `userProfile.cancelRequest` | Huỷ lời mời | Khi đã gửi lời mời |
| `userProfile.sendMessage` | Nhắn tin | Khi đã kết bạn |
| `userProfile.report` | Báo cáo | Tuỳ chọn |
| `userProfile.mutualFriends` | {{count}} bạn chung | Subtitle |
| `userProfile.friendStatusConnected` | Đã kết bạn | Badge |
| `userProfile.friendStatusPending` | Đã gửi lời mời | Badge |
| `userProfile.friendsCount` | {{count}} bạn bè | Tiêu đề khối |
| `userProfile.noFriends` | Chưa có bạn bè. | Empty |
| `userProfile.tabAbout` | Giới thiệu | Tab |
| `userProfile.tabPersonalInfo` | Thông tin cá nhân | Tab |
| `userProfile.tabPosts` | Bài viết | Tab |
| `userProfile.tabPhotos` | Ảnh | Tab |
| `userProfile.tabVideo` | Video | Tab |
| `userProfile.noBio` | Chưa cập nhật giới thiệu. | Empty bio |
| `userProfile.personalInfoTitle` | Thông tin cá nhân | Tiêu đề block |
| `userProfile.noPersonalInfo` | Chưa cập nhật thông tin cá nhân. | Empty |
| `userProfile.joinedSince` | Tham gia từ {{month}}, {{year}} | Text |
| `userProfile.noPosts` | Chưa có bài viết nào. | Empty posts |
| `userProfile.noPhotos` | Chưa có ảnh nào. | Empty |
| `userProfile.noVideos` | Chưa có video nào. | Empty |
| `userProfile.loadMorePosts` | Xem thêm bài viết | Nút phân trang |
| `userProfile.seeAllAchievements` | Xem tất cả huy hiệu | Link |
| `userProfile.viewAllFriends` | Xem tất cả | Link bạn bè |

*(Các key như `dashboard.level`, `profile.xp`, `profile.toLevel`, `profile.currentLevel` dùng chung với trang của tôi.)*

---

## 7. Hành vi & Quyền riêng tư

- **Quyền riêng tư:** Nếu user đó chọn ẩn thông tin (bio, bạn bè, bài viết) với "người lạ", chỉ hiển thị phần được phép (ví dụ chỉ avatar, tên, level). Có thể hiện thông báo *"Người dùng này giới hạn nội dung với người chưa kết bạn."* (`userProfile.privacyLimited`).
- **404:** Nếu `userId` không tồn tại → trang 404 hoặc thông báo *"Không tìm thấy người dùng."* (`userProfile.notFound`).
- **Redirect:** Nếu `userId` = user đang đăng nhập → chuyển hướng đến `/profile` (trang cá nhân của tôi).

---

## 8. Tóm tắt

- Trang **chỉ xem** (read-only), không có form sửa thông tin, không đổi avatar, không đăng xuất.
- **Cột trái:** Avatar, tên, level, XP, quan hệ (bạn chung / trạng thái kết bạn), nút **Thêm bạn** / **Nhắn tin** / **Báo cáo**, khối **Bạn bè**.
- **Cột phải:** Tab **Giới thiệu** (bio, thông tin, thống kê, thành tựu) và **Bài viết** (feed bài của user đó).
- Dùng namespace i18n `userProfile.*` để tách với `profile.*` (trang của tôi). Có thể gộp vào `profile` với key phân biệt (vd. `profile.addFriend` chỉ dùng cho trang người khác).
