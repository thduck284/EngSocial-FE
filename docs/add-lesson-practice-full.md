# Điền đầy đủ field cho bài Listening tại http://localhost:3000/manage/skills

Tham khảo: [British Council – A1 Listening: Request from your boss](https://learnenglish.britishcouncil.org/skills/listening/a1-listening/request-your-boss)

Mở **http://localhost:3000/manage/skills** → chọn **Skill: Listening** → điền lần lượt theo bảng dưới.

---

## 1. Nút đầu trang

| Nút | Hành động |
|-----|------------|
| **Lưu nháp** | Lưu `status: draft` — bài không hiện trên Skills. |
| **Đăng bài tập** | Lưu `status: published` — bài hiện trên trang Skills (tab Listening). |

---

## 2. Thông tin cơ bản (Basic info)

| Field trên form | Giá trị cần điền |
|-----------------|------------------|
| **Title** * | `Request from your boss (A1 Listening)` |
| **Slug (URL)** | `practice-listening-a1-request-your-boss` |
| **Short description** | `Listen to a dialogue between Susanne and Mario. She asks him to help with work tasks: email the customer in Germany, organise the team meeting, and write a report.` |

---

## 3. Nội dung Listening (Listening content)

### 3.1. Audio file

- **Ô:** File audio (upload)
- **Giá trị:** Tải file MP3 của bài nghe (dialogue Susanne & Mario, khoảng 1–2 phút).

### 3.2. Transcript

- **Ô:** Transcript
- **Giá trị:** Dán nguyên đoạn dưới đây.

```
Susanne: Hi, Mario. Can you help me prepare some things for the next month?

Mario: OK, sure. What can I help you with?

Susanne: I need to visit the customer in Germany. It's important.

Mario: What can I do to help?

Susanne: Can you send an email to the customer? Ask them when I can visit them next week. Please do this first. It's a priority and very urgent.

Mario: Right. I'll do it today.

Susanne: Thanks. This next task is also important. Can you invite everyone to the next team meeting?

Mario: Yes, I will.

Susanne: But first you need to book a meeting room. After that, please send everyone an email about it.

Mario: Yes, of course.

Susanne: And finally, can you write a short report about our new project? I have to give a presentation to our managers next month. Please do it when you have time – sometime in the next two or three weeks. It's not too urgent.

Mario: Sure, no problem. I can do it this week.

Susanne: There's no hurry. Take your time.
```

### 3.3. Duration (seconds)

- **Ô:** Duration (seconds)
- **Giá trị:** `90` (hoặc số giây đúng với file MP3 của bạn).

### 3.4. Accent

- **Ô:** Accent (dropdown)
- **Giá trị:** Chọn một trong: `American` | `British` | `Australian` (ví dụ: **British**).

### 3.5. Chapters / Timestamps

- **Ô:** Chương / Mốc thời gian (Label + Time), nút "+ Thêm mốc".
- **Giá trị:** (Tùy chọn) Thêm từng dòng:

| Label | Time |
|-------|------|
| Intro / First task | 0:00 |
| Email to customer (priority) | 0:15 |
| Team meeting task | 0:35 |
| Report task (not urgent) | 0:55 |

### 3.6. Từ vựng (Vocabulary) — tùy chọn

- **Ô:** Từ vựng (optional), nằm ngay dưới mục Chapters trong phần Nội dung Listening.
- **Cách điền:** Thêm từng cặp **Từ** + **Nghĩa**, hoặc dùng **Thêm nhanh**: dán nguyên khối dưới đây vào ô, bấm **Thêm vào danh sách**.

**Từ vựng gợi ý từ script (Request from your boss):**

```
prepare - chuẩn bị
visit - đi thăm / ghé thăm
customer - khách hàng
important - quan trọng
priority - ưu tiên
urgent - khẩn cấp
invite - mời
team meeting - cuộc họp nhóm
book - đặt (phòng, chỗ)
report - báo cáo
project - dự án
presentation - bài thuyết trình
managers - (các) quản lý
hurry - sự vội vàng / vội
take your time - cứ từ từ / không cần vội
```

---

## 4. Thumbnail (cột phải)

- **Ô:** Thumbnail (upload ảnh)
- **Giá trị:** Chọn file ảnh (JPG/PNG) cho thẻ bài tập.

---

## 5. Phân loại (Classification) — cột phải

| Field | Giá trị |
|-------|--------|
| **Skill** | `Listening` |
| **Level** | `A1` (hoặc A1 - Beginner tùy hiển thị) |
| **Topic** | `Work` |
| **Loại bài luyện** (Practice type) | `Dialogue` |
| **Độ dài** (Length) | `1-2 min` |

---

## 6. XP & Thời gian (cột phải)

| Field | Giá trị |
|-------|--------|
| **XP thưởng** (XP reward) | `50` |
| **Số phút** (Minutes) | `5` |

*(Khi lưu, hệ thống tự tạo chuỗi hiển thị `time`, VD: "5m".)*

---

## 7. Câu hỏi (Questions)

Chỉ hiện khi **Skill** = Listening (hoặc Reading). Có thể dùng "Thêm 3 câu trống" / "Thêm 5 câu trống" rồi điền từng câu.

### Câu 1

| Field | Giá trị |
|-------|--------|
| **Nội dung câu hỏi** | `Where does Susanne need to visit the customer?` |
| **Loại** | `Trắc nghiệm` (multiple_choice) |
| **Points** | `10` |
| **Options** | A = `Germany`, B = `France`, C = `Spain` |
| **Đáp án đúng** | `A` |
| **Giải thích** | (để trống hoặc ghi: From the dialogue: "I need to visit the customer in Germany.") |

### Câu 2

| Field | Giá trị |
|-------|--------|
| **Nội dung câu hỏi** | `What is the first thing Mario must do?` |
| **Loại** | `Trắc nghiệm` |
| **Points** | `10` |
| **Options** | A = `Book a meeting room`, B = `Send an email to the customer`, C = `Write a report` |
| **Đáp án đúng** | `B` |
| **Giải thích** | (optional) "Please do this first. It's a priority and very urgent." |

### Câu 3

| Field | Giá trị |
|-------|--------|
| **Nội dung câu hỏi** | `Before inviting everyone to the team meeting, what must Mario do?` |
| **Loại** | `Trắc nghiệm` |
| **Points** | `10` |
| **Options** | A = `Write a report`, B = `Send an email to the customer`, C = `Book a meeting room` |
| **Đáp án đúng** | `C` |
| **Giải thích** | (optional) "But first you need to book a meeting room. After that, please send everyone an email." |

### Câu 4

| Field | Giá trị |
|-------|--------|
| **Nội dung câu hỏi** | `The report about the new project is very urgent.` |
| **Loại** | `Đúng/Sai` (true_false) |
| **Points** | `10` |
| **Đáp án đúng** | `False` |
| **Giải thích** | `Susanne says "Please do it when you have time" and "It's not too urgent."` |

### Câu 5

| Field | Giá trị |
|-------|--------|
| **Nội dung câu hỏi** | `When does Susanne need the report?` |
| **Loại** | `Trắc nghiệm` |
| **Points** | `10` |
| **Options** | A = `Today`, B = `Next week`, C = `In the next two or three weeks (for presentation next month)` |
| **Đáp án đúng** | `C` |
| **Giải thích** | (optional) "sometime in the next two or three weeks" and "I have to give a presentation to our managers next month." |

---

## 8. Tóm tắt toàn bộ field (Listening tại /manage/skills)

| Khu vực | Các field |
|---------|-----------|
| **Đầu trang** | Lưu nháp, Đăng bài tập |
| **Thông tin cơ bản** | Title *, Slug, Short description |
| **Nội dung Listening** | Audio file (upload), Transcript, Duration (seconds), Accent, Chapters (Label + Time), **Từ vựng** (optional) |
| **Thumbnail** | Upload ảnh |
| **Phân loại** | Skill, Level, Topic, Loại bài luyện (Practice type), Độ dài (Length) |
| **XP & Thời gian** | XP thưởng, Số phút |
| **Câu hỏi** | Nội dung câu hỏi, Loại, Points, Options (nếu trắc nghiệm), Đáp án đúng, Giải thích |

Sau khi điền xong, bấm **Đăng bài tập** để bài hiển thị tại http://localhost:3000/skills (tab Listening).
