# Đặc tả giao diện: Kết quả tìm kiếm (Trang chủ /home)

## 1. Ngữ cảnh

- **Trang:** Trang chủ (`/home`).
- **Ô tìm kiếm:** Nằm trên header, placeholder: *"Tìm kiếm bài viết, bạn bè..."* (key: `header.searchPlaceholder`).
- **Kích hoạt tìm kiếm:** Người dùng nhập từ khóa rồi nhấn **Enter** hoặc bấm nút **Tìm kiếm** (icon hoặc button bên cạnh ô input).

---

## 2. Sau khi ấn tìm kiếm

### 2.1 Cách hiển thị kết quả

- **Option A (đề xuất):** Chuyển sang route `/search?q=...` — một trang riêng hiển thị kết quả.
- **Option B:** Giữ nguyên `/home`, hiển thị panel/overlay kết quả phía dưới ô tìm kiếm (dropdown full-width).

Tài liệu mô tả theo **Option A** (trang kết quả riêng). Nếu chọn Option B, bố cục bên dưới vẫn áp dụng cho nội dung trong panel.

---

## 3. Bố cục trang kết quả tìm kiếm

Trang `/search?q=...` dùng **layout 3 cột** giống trang chủ: **Header** (full width) + **Left bar** + **Main** (kết quả) + **Right bar**.

### 3.1 Header (full width)

- Giống header trang chủ: logo EngSocial, **ô tìm kiếm** (pre-fill từ khóa `q`, focus khi vào trang), nav (Trang chủ, Luyện kỹ năng, Bài học, …), icon thông báo, avatar + dropdown.
- Label/placeholder ô tìm kiếm: *"Tìm kiếm bài viết, bạn bè..."* (`header.searchPlaceholder`). Nhập mới + Enter → cập nhật `q` và reload kết quả.

### 3.2 Left bar — Bộ lọc (Filter)

- **Cột trái** (ví dụ `col-span-3` trên desktop), dùng làm **sidebar bộ lọc**.
- **Nguyên tắc:** Left bar **không** có chọn loại (Bài viết / Bạn bè / Cộng đồng). Loại do **tab đang chọn ở Main** quyết định. Nội dung bộ lọc bên trái **thay đổi theo tab hiện tại** — chỉ hiển thị filter phù hợp với tab đó.

**Left bar tạm focus tab « Bài viết » — bộ lọc chi tiết như sau:**

- **Tiêu đề:** *"Bộ lọc bài viết"* (`search.filterPostsTitle`).

- **Thời gian đăng:**
  - *Mọi lúc* (`search.filterTimeAll`)
  - *Hôm nay* (`search.filterTimeToday`)
  - *Tuần này* (`search.filterTimeWeek`)
  - *Tháng này* (`search.filterTimeMonth`)
  - *Năm nay* (`search.filterTimeYear`)
  - *Tuỳ chọn* (`search.filterTimeCustom`): hai ô date (Từ ngày – Đến ngày), label `search.filterTimeFrom` / `search.filterTimeTo`.

- **Sắp xếp:**
  - *Mới nhất* (`search.sortNewest`)
  - *Cũ nhất* (`search.sortOldest`)
  - *Liên quan nhất* (`search.sortRelevant`)
  - *Nhiều tương tác nhất* (`search.sortMostEngagement`) — theo like + comment.
  - *Nhiều bình luận* (`search.sortMostComments`).
  - *Nhiều lượt thích* (`search.sortMostLikes`).

- **Loại nội dung:**
  - *Tất cả* (`search.filterContentAll`)
  - *Có ảnh* (`search.filterContentWithImage`)
  - *Có video* (`search.filterContentWithVideo`)
  - *Chỉ văn bản* (`search.filterContentTextOnly`).

- **Tác giả / Nguồn:**
  - *Tất cả* (`search.filterAuthorAll`)
  - *Chỉ bạn bè* (`search.filterAuthorFriends`) — bài viết từ người đã kết bạn.
  - *Chỉ bài của tôi* (`search.filterAuthorMe`).

- **Phạm vi hiển thị (nếu bài viết có visibility):**
  - *Tất cả* (`search.filterVisibilityAll`)
  - *Công khai* (`search.filterVisibilityPublic`)
  - *Bạn bè* (`search.filterVisibilityFriends`).

- **Tương tác (checkbox, có thể chọn kết hợp):**
  - *Có bình luận* (`search.filterHasComments`)
  - *Có lượt thích* (`search.filterHasLikes`)
  - *Đã lưu* (`search.filterSaved`) — bài tôi đã bookmark (nếu có API).

- **Nút:** *"Áp dụng"* (`search.applyFilters`), *"Xoá bộ lọc"* (`search.clearFilters`).

*(Query params gợi ý: `time`, `sort`, `contentType`, `author`, `visibility`, `hasComments`, `hasLikes`, `dateFrom`, `dateTo`.)*

---

**Khi Main đang ở tab « Bạn bè »:** Left bar hiện bộ lọc đơn giản (ví dụ Tất cả / Đã kết bạn / Chưa kết bạn) + Áp dụng / Xoá. *(Chi tiết mở rộng sau.)*

**Khi Main đang ở tab « Cộng đồng »:** Left bar hiện bộ lọc đơn giản (Tất cả / Đã tham gia / Chưa tham gia) + Áp dụng / Xoá. *(Chi tiết mở rộng sau.)*

- Đổi tab ở Main → left bar cập nhật bộ lọc tương ứng. Filter thay đổi → cập nhật query params và refetch kết quả.

### 3.3 Main (khu vực giữa — kết quả tìm kiếm)

- **Cột giữa** (ví dụ `col-span-6`), chứa toàn bộ nội dung tìm kiếm.
- **Tiêu đề:** Một dòng phía trên tab, ví dụ *"Kết quả tìm kiếm cho «{{query}}»"* (`search.resultsFor`).
- **Thanh tab (Tabs)** và **nội dung từng tab** (Bài viết / Bạn bè / Cộng đồng) như mô tả ở mục 3.4 và §4.

### 3.4 Right bar (sidebar phải)

- **Cột phải** (ví dụ `col-span-3`), cuộn độc lập.
- **Ô tìm nhanh** (tuỳ chọn): placeholder *"Tìm kiếm nhanh..."* (`dashboard.quickSearch`), có thể trùng từ khóa với header hoặc dùng cho tìm trong kết quả.
- Khối **Gợi ý kết bạn** (`dashboard.friendSuggestions`): 3–5 thẻ user (avatar, tên, *"X bạn chung"*), nút **Thêm bạn** (icon `person_add`), link *"Xem tất cả gợi ý"* (`dashboard.viewAllSuggestions`) → `/friends` hoặc tương đương.
- Khối **Nhóm học** (`dashboard.studyGroups`): danh sách nhóm (icon, tên, số thành viên), có thể link vào trang nhóm/cộng đồng.

*(Có thể tái dùng component sidebar phải của Dashboard.)*

### 3.5 Thanh tab (Tabs) — trong Main

- Ba tab ngang, cùng cấp:
  - **Bài viết** (`search.tabPosts`)
  - **Bạn bè** (`search.tabFriends`)
  - **Cộng đồng** (`search.tabCommunity`)
- Tab đang chọn: màu primary, gạch chân hoặc background nhẹ; tab khác: text xám.
- Click tab → chuyển nội dung kết quả tương ứng, không reload trang (có thể cập nhật URL: `/search?q=...&tab=posts|friends|community`).

**Tóm tắt layout (desktop):**

| Vùng       | Nội dung chính |
|-----------|-----------------|
| **Header** | Logo, ô tìm kiếm (pre-fill `q`), nav, thông báo, avatar |
| **Left bar** | Bộ lọc theo tab Main. **Tab Bài viết (focus):** Thời gian (Mọi lúc→Tuỳ chọn), Sắp xếp (6 lựa chọn), Loại nội dung, Tác giả, Phạm vi, Tương tác (checkbox); tab Bạn bè/Cộng đồng → filter đơn giản; luôn có Áp dụng / Xoá bộ lọc |
| **Main**  | Tiêu đề "Kết quả tìm kiếm cho «…»", tabs (Bài viết / Bạn bè / Cộng đồng), danh sách kết quả |
| **Right bar** | Tìm kiếm nhanh, gợi ý kết bạn, nhóm học |

Responsive: left/right bar có thể thu gọn hoặc chuyển xuống dưới; main luôn chứa tabs + kết quả.

---

## 4. Nội dung từng tab

### 4.1 Tab « Bài viết »

- **Label khu vực (tuỳ chọn):** *"Bài viết"* hoặc không cần thêm nếu đã có tab.
- **Danh sách:** Dạng thẻ bài viết (post card), giống feed trang chủ:
  - Avatar người đăng (trái), tên, thời gian đăng (tương đối, ví dụ *"5 phút trước"*).
  - Nội dung text (rút gọn nếu dài, ví dụ 2–3 dòng + "Xem thêm").
  - Ảnh/thumbnail (nếu có), tối đa 1 ảnh xem trước.
  - Hàng hành động: **Thích** (icon + số), **Bình luận** (icon + số), **Chia sẻ**, **Lưu** (icon).
- **Nút/Xem thêm:** Cuối danh sách, nút *"Xem thêm bài viết"* (`search.loadMorePosts`) nếu có phân trang.
- **Trạng thái trống:** Icon (ví dụ `article` hoặc `feed`), text *"Không có bài viết nào phù hợp."* (`search.noPosts`).
- **Trạng thái tải:** Spinner hoặc skeleton thẻ bài viết; text *"Đang tải..."* (`common.loading`) nếu cần.

### 4.2 Tab « Bạn bè »

- **Danh sách:** Dạng thẻ người dùng (user card):
  - Avatar (trái), tên, subtitle (ví dụ *"X bạn chung"* hoặc level/XP nếu có).
  - Nút **Thêm bạn** / **Kết bạn** (`search.addFriend`) hoặc **Đã kết bạn** (`search.friendAdded`) nếu đã gửi lời mời / đã là bạn.
- **Trạng thái trống:** Icon (ví dụ `person_search`), text *"Không tìm thấy bạn bè."* (`search.noFriends`).
- **Trạng thái tải:** Spinner hoặc skeleton thẻ bạn bè.

### 4.3 Tab « Cộng đồng »

- **Danh sách:** Thẻ nhóm / cộng đồng (group/community card):
  - Ảnh bìa hoặc icon nhóm (trái), tên nhóm, mô tả ngắn (1–2 dòng).
  - Số thành viên (ví dụ *"1.2k thành viên"*).
  - Nút **Tham gia** (`search.join`) hoặc **Đã tham gia** (`search.joined`) nếu đã ở trong nhóm.
- **Trạng thái trống:** Icon (ví dụ `groups`), text *"Không có nhóm/cộng đồng nào phù hợp."* (`search.noCommunities`).
- **Trạng thái tải:** Spinner hoặc skeleton thẻ nhóm.

---

## 5. Các label và nút dùng chung (i18n gợi ý)

| Key | Vi (mẫu) | Ghi chú |
|-----|----------|--------|
| `header.searchPlaceholder` | Tìm kiếm bài viết, bạn bè... | Ô input header |
| `search.resultsFor` | Kết quả tìm kiếm cho «{{query}}» | Tiêu đề khu vực |
| `search.tabPosts` | Bài viết | Tab |
| `search.tabFriends` | Bạn bè | Tab |
| `search.tabCommunity` | Cộng đồng | Tab |
| `search.loadMorePosts` | Xem thêm bài viết | Nút phân trang |
| `search.noPosts` | Không có bài viết nào phù hợp. | Empty state |
| `search.noFriends` | Không tìm thấy bạn bè. | Empty state |
| `search.noCommunities` | Không có nhóm/cộng đồng nào phù hợp. | Empty state |
| `search.addFriend` | Thêm bạn | Nút trên thẻ bạn bè |
| `search.friendAdded` | Đã kết bạn | Trạng thái đã gửi/đã là bạn |
| `search.join` | Tham gia | Nút trên thẻ cộng đồng |
| `search.joined` | Đã tham gia | Đã ở trong nhóm |
| `search.filterTitle` | Bộ lọc | Tiêu đề left bar chung |
| `search.filterPostsTitle` | Bộ lọc bài viết | Tiêu đề khi tab Bài viết |
| `search.filterTimeAll` | Mọi lúc | Thời gian |
| `search.filterTimeToday` | Hôm nay | Thời gian |
| `search.filterTimeWeek` | Tuần này | Thời gian |
| `search.filterTimeMonth` | Tháng này | Thời gian |
| `search.filterTimeYear` | Năm nay | Thời gian |
| `search.filterTimeCustom` | Tuỳ chọn | Thời gian (hiện date range) |
| `search.filterTimeFrom` | Từ ngày | Date from |
| `search.filterTimeTo` | Đến ngày | Date to |
| `search.sortNewest` | Mới nhất | Sắp xếp |
| `search.sortOldest` | Cũ nhất | Sắp xếp |
| `search.sortRelevant` | Liên quan nhất | Sắp xếp |
| `search.sortMostEngagement` | Nhiều tương tác nhất | Sắp xếp |
| `search.sortMostComments` | Nhiều bình luận | Sắp xếp |
| `search.sortMostLikes` | Nhiều lượt thích | Sắp xếp |
| `search.filterContentAll` | Tất cả | Loại nội dung |
| `search.filterContentWithImage` | Có ảnh | Loại nội dung |
| `search.filterContentWithVideo` | Có video | Loại nội dung |
| `search.filterContentTextOnly` | Chỉ văn bản | Loại nội dung |
| `search.filterAuthorAll` | Tất cả | Tác giả |
| `search.filterAuthorFriends` | Chỉ bạn bè | Tác giả |
| `search.filterAuthorMe` | Chỉ bài của tôi | Tác giả |
| `search.filterVisibilityAll` | Tất cả | Phạm vi |
| `search.filterVisibilityPublic` | Công khai | Phạm vi |
| `search.filterVisibilityFriends` | Bạn bè | Phạm vi |
| `search.filterHasComments` | Có bình luận | Checkbox tương tác |
| `search.filterHasLikes` | Có lượt thích | Checkbox tương tác |
| `search.filterSaved` | Đã lưu | Checkbox bài đã bookmark |
| `search.applyFilters` | Áp dụng | Nút áp dụng bộ lọc |
| `search.clearFilters` | Xoá bộ lọc | Nút reset filter |
| `common.loading` | Đang tải... | Loading chung |

*(Các nút Thích, Bình luận, Chia sẻ, Lưu dùng chung với feed/bài viết hiện có.)*

---

## 6. Hành vi bổ sung

- **Ô tìm kiếm trên trang kết quả:** Nhập từ khóa mới và Enter → cập nhật `q` và reload kết quả (cùng tab hoặc reset về tab « Bài viết »).
- **Query rỗng:** Nếu người dùng xóa hết text và Enter, có thể chuyển về `/home` hoặc hiển thị thông báo *"Vui lòng nhập từ khóa tìm kiếm."* (`search.enterKeyword`).
- **Responsive:** Trên mobile, tab có thể cuộn ngang hoặc thu gọn thành dropdown « Loại: Bài viết / Bạn bè / Cộng đồng ».

---

## 7. Tóm tắt

- **Left bar = Bộ lọc theo tab Main.** Tạm focus **Bài viết:** thời gian (Mọi lúc / Hôm nay / Tuần / Tháng / Năm / Tuỳ chọn từ–đến), sắp xếp (Mới nhất, Cũ nhất, Liên quan, Nhiều tương tác/bình luận/thích), loại nội dung (Tất cả / Có ảnh / Có video / Chỉ text), tác giả (Tất cả / Chỉ bạn bè / Chỉ tôi), phạm vi, checkbox (Có bình luận, Có lượt thích, Đã lưu); Bạn bè/Cộng đồng filter đơn giản. Luôn có Áp dụng / Xoá bộ lọc.
- Một trang kết quả với **ba tab: Bài viết, Bạn bè, Cộng đồng** trong Main; mỗi tab: danh sách thẻ, nút hành động, empty state và trạng thái tải.
- Label và text dùng key i18n như bảng trên để thống nhất và hỗ trợ đa ngôn ngữ.
