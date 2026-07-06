/** @typedef {{ label: string, body: string }} ReportEmailTplItem */

/** @type {Record<string, Record<string, { reporter: ReportEmailTplItem[], reported: ReportEmailTplItem[] }>>} */
export const viTemplates = {
  post: {
    reviewed: {
      reporter: [
        {
          label: 'Bài viết — báo cáo hợp lệ (cảm ơn)',
          body:
            'EngSocial xin cảm ơn bạn đã gửi báo cáo về {{targetLabel}}. Sau khi admin rà soát nội dung, đối chiếu với Tiêu chuẩn cộng đồng và lý do bạn cung cấp («{{reason}}»), chúng tôi xác nhận báo cáo là hợp lệ. Nội dung vi phạm đã được xử lý (ẩn, gỡ hoặc hạn chế hiển thị tùy mức độ). Sự chủ động của bạn góp phần giữ môi trường học tập an toàn và tôn trọng cho mọi thành viên.',
        },
        {
          label: 'Bài viết — đã xử lý xong',
          body:
            'Báo cáo {{targetLabel}} của bạn đã chuyển sang trạng thái «Đã xem». Admin ghi nhận nội dung có dấu hiệu vi phạm (spam, quấy rối, ngôn từ không phù hợp hoặc nội dung gây hiểu lầm). Chúng tôi đã áp dụng biện pháp phù hợp và sẽ tiếp tục theo dõi nếu hành vi lặp lại. Cảm ơn bạn đã tin tưởng và đồng hành cùng EngSocial.',
        },
        {
          label: 'Bài viết — phản hồi chi tiết cho reporter',
          body:
            'Kết quả xử lý báo cáo {{targetLabel}}: CHẤP NHẬN. Admin đã xem xét bối cảnh bài viết, tính chất vi phạm và mức độ ảnh hưởng tới cộng đồng. Lý do bạn nêu: «{{reason}}». Hiện tại nội dung đã được điều chỉnh theo quy định. Nếu bạn tiếp tục phát hiện vi phạm, hãy báo cáo kèm mô tả cụ thể để chúng tôi xử lý nhanh hơn.',
        },
      ],
      reported: [
        {
          label: 'Bài viết — vi phạm được xác nhận',
          body:
            'Có báo cáo liên quan tới {{targetLabel}} trên tài khoản của bạn. Sau khi admin kiểm tra, chúng tôi xác nhận nội dung vi phạm Tiêu chuẩn cộng đồng EngSocial (ví dụ: ngôn từ xúc phạm, quấy rối, spam hoặc chia sẻ nội dung không phù hợp). Bài viết đã được xử lý. Vui lòng đọc kỹ quy định cộng đồng trước khi đăng tải; vi phạm lặp lại có thể dẫn tới tạm ngưng hoặc khóa tài khoản.',
        },
        {
          label: 'Bài viết — cảnh báo chính thức',
          body:
            'EngSocial ghi nhận {{targetLabel}} của bạn không phù hợp tiêu chuẩn nền tảng. Admin đã áp dụng biện pháp kiểm duyệt tương ứng. Đây là thông báo chính thức: mọi hành vi tiếp theo vi phạm có thể bị xử lý nghiêm hơn, bao gồm hạn chế đăng bài hoặc khóa tài khoản. Hãy đảm bảo nội dung mang tính xây dựng, tôn trọng và hỗ trợ cộng đồng học tiếng Anh.',
        },
        {
          label: 'Bài viết — hậu quả & cam kết tuân thủ',
          body:
            'Kết quả rà soát báo cáo {{targetLabel}}: VI PHẠM. Chúng tôi đã gỡ hoặc hạn chế hiển thị nội dung theo quy định. Bạn có trách nhiệm tuân thủ Tiêu chuẩn cộng đồng khi tham gia EngSocial. Nếu cần làm rõ quy định hoặc khiếu nại, vui lòng tham khảo mục Trợ giúp (link đính kèm email này).',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Bài viết — báo cáo không được chấp nhận',
          body:
            'EngSocial đã xem xét báo cáo {{targetLabel}} của bạn. Sau khi đối chiếu nội dung, bối cảnh và lý do «{{reason}}», admin kết luận chưa đủ căn cứ để xác định vi phạm hoặc nội dung vẫn nằm trong phạm vi cho phép. Báo cáo chuyển sang «Bỏ qua». Cảm ơn bạn đã quan tâm; vui lòng chỉ báo cáo khi thấy dấu hiệu vi phạm rõ ràng.',
        },
        {
          label: 'Bài viết — chưa đủ cơ sở xử lý',
          body:
            'Báo cáo {{targetLabel}} của bạn hiện không được chấp nhận vì admin chưa tìm thấy vi phạm nghiêm trọng đối với Tiêu chuẩn cộng đồng. Nếu bạn có thêm bằng chứng (ảnh chụp, liên kết, mô tả chi tiết), có thể gửi báo cáo mới. EngSocial khuyến khích báo cáo trung thực, tránh lạm dụng công cụ báo cáo.',
        },
        {
          label: 'Bài viết — hướng dẫn báo cáo lại',
          body:
            'Kết quả xử lý báo cáo {{targetLabel}}: KHÔNG CHẤP NHẬN. Admin đã đọc mô tả của bạn nhưng chưa thấy cơ sở đủ mạnh để can thiệp. Bạn vẫn có thể báo cáo lại nếu có thêm thông tin cụ thể về hành vi vi phạm. Cảm ơn bạn đã đồng hành cùng cộng đồng EngSocial.',
        },
      ],
      reported: [
        {
          label: 'Bài viết — báo cáo không thành lập',
          body:
            'Có báo cáo về {{targetLabel}} liên quan tới bạn, nhưng sau khi admin rà soát, chúng tôi xác nhận nội dung không vi phạm Tiêu chuẩn cộng đồng hoặc chưa đủ căn cứ xử lý. Bạn có thể tiếp tục sử dụng EngSocial bình thường. Nếu cho rằng bị báo cáo sai hoặc cần giải thích thêm, xem mục Trợ giúp: {{helpUrl}}.',
        },
        {
          label: 'Bài viết — không vi phạm',
          body:
            'EngSocial thông báo: báo cáo liên quan {{targetLabel}} của bạn đã được admin xem xét và kết luận KHÔNG VI PHẠM. Không có hành động kiểm duyệt bổ sung. Chúng tôi khuyến khích bạn tiếp tục chia sẻ nội dung tích cực. Mọi thắc mắc về quy trình báo cáo, vui lòng tham khảo Trợ giúp (link đính kèm).',
        },
        {
          label: 'Bài viết — quyền khiếu nại',
          body:
            'Admin đã đóng báo cáo về {{targetLabel}} của bạn với kết luận không vi phạm. Nếu bạn cảm thấy bị hiểu nhầm hoặc muốn làm rõ thêm, hãy truy cập {{helpUrl}} để xem hướng dẫn liên hệ và quy trình hỗ trợ. EngSocial luôn sẵn sàng lắng nghe phản hồi minh bạch từ thành viên.',
        },
      ],
    },
  },
  message: {
    reviewed: {
      reporter: [
        {
          label: 'Tin nhắn — báo cáo hợp lệ',
          body:
            'Cảm ơn bạn đã báo cáo {{targetLabel}}. Admin đã đối chiếu nội dung tin nhắn với Tiêu chuẩn cộng đồng và lý do «{{reason}}». Báo cáo được CHẤP NHẬN; chúng tôi đã xử lý hoặc ghi nhận vi phạm tương ứng. Tin nhắn quấy rối, xúc phạm hoặc spam gây ảnh hưởng xấu tới trải nghiệm chat — sự báo cáo kịp thời của bạn rất quan trọng.',
        },
        {
          label: 'Tin nhắn — đã can thiệp',
          body:
            'Báo cáo {{targetLabel}} của bạn đã chuyển «Đã xem». EngSocial ghi nhận hành vi không phù hợp trong cuộc trò chuyện. Admin đã áp dụng biện pháp (cảnh báo, hạn chế hoặc xử lý tài khoản nếu cần). Cảm ơn bạn đã giúp duy trì không gian chat an toàn cho người học tiếng Anh.',
        },
        {
          label: 'Tin nhắn — phản hồi reporter',
          body:
            'Kết quả rà soát báo cáo {{targetLabel}}: HỢP LỆ. Chúng tôi đã xem xét ngữ cảnh hội thoại và mức độ nghiêm trọng. Lý do bạn cung cấp: «{{reason}}». Nếu tiếp tục gặp quấy rối, hãy chặn người dùng và báo cáo kèm ảnh chụp màn hình để admin xử lý nhanh hơn.',
        },
      ],
      reported: [
        {
          label: 'Tin nhắn — vi phạm chat',
          body:
            'Admin xác nhận {{targetLabel}} của bạn vi phạm quy định EngSocial (quấy rối, ngôn từ thô tục, spam hoặc nội dung không phù hợp). Chúng tôi đã ghi nhận và xử lý theo mức độ. Vui lòng giao tiếp tôn trọng trong mọi cuộc trò chuyện; vi phạm lặp lại có thể dẫn tới khóa tài khoản.',
        },
        {
          label: 'Tin nhắn — cảnh báo hành vi',
          body:
            'EngSocial cảnh báo: hành vi trong {{targetLabel}} của bạn không đạt Tiêu chuẩn cộng đồng. Đây là thông báo chính thức sau khi có báo cáo hợp lệ. Hãy tránh ngôn từ xúc phạm, đe dọa hoặc gửi nội dung gây khó chịu. Tuân thủ quy định giúp bạn và cộng đồng học tập thoải mái hơn.',
        },
        {
          label: 'Tin nhắn — hậu quả tiếp theo',
          body:
            'Báo cáo về {{targetLabel}} đã được xử lý với kết luận VI PHẠM. Admin có thể áp dụng hạn chế nhắn tin hoặc các biện pháp khác nếu hành vi tái diễn. Tham khảo Trợ giúp (link email) nếu bạn cần làm rõ quy định chat trên EngSocial.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Tin nhắn — báo cáo bị bỏ qua',
          body:
            'Báo cáo {{targetLabel}} của bạn không được chấp nhận. Admin đã xem nội dung và lý do «{{reason}}» nhưng chưa thấy vi phạm rõ ràng hoặc thiếu bối cảnh. Bạn có thể báo cáo lại nếu có thêm bằng chứng. Cảm ơn bạn đã quan tâm tới an toàn cộng đồng.',
        },
        {
          label: 'Tin nhắn — chưa đủ căn cứ',
          body:
            'EngSocial kết luận báo cáo {{targetLabel}} chưa đủ cơ sở xử lý. Đôi khi tranh luận gay gắt nhưng vẫn trong phạm vi cho phép. Nếu bạn tiếp tục cảm thấy bị quấy rối, hãy chặn người dùng và gửi báo cáo mới kèm mô tả chi tiết.',
        },
        {
          label: 'Tin nhắn — hướng dẫn reporter',
          body:
            'Kết quả: KHÔNG CHẤP NHẬN báo cáo {{targetLabel}}. Admin khuyến khích bạn chỉ sử dụng công cụ báo cáo khi có dấu hiệu vi phạm cụ thể, tránh báo cáo vì bất đồng quan điểm cá nhân.',
        },
      ],
      reported: [
        {
          label: 'Tin nhắn — không vi phạm',
          body:
            'Có báo cáo về {{targetLabel}} liên quan bạn, nhưng admin xác nhận không vi phạm quy định. Bạn có thể tiếp tục chat bình thường. Nếu cho rằng bị báo cáo sai, xem Trợ giúp: {{helpUrl}}.',
        },
        {
          label: 'Tin nhắn — báo cáo không thành lập',
          body:
            'EngSocial thông báo báo cáo {{targetLabel}} đã được đóng với kết luận không vi phạm. Không có hành động thêm đối với tài khoản của bạn. Link Trợ giúp đính kèm nếu bạn cần hỗ trợ.',
        },
        {
          label: 'Tin nhắn — quyền phản hồi',
          body:
            'Admin đã xem xét và bác bỏ báo cáo về {{targetLabel}} của bạn. Mọi thắc mắc về quy trình, vui lòng truy cập {{helpUrl}}.',
        },
      ],
    },
  },
  conversation: {
    reviewed: {
      reporter: [
        {
          label: 'Nhóm chat — báo cáo hợp lệ',
          body:
            'Cảm ơn bạn đã báo cáo {{targetLabel}}. Admin đã rà soát hoạt động nhóm, tin nhắn tiêu biểu và lý do «{{reason}}». Báo cáo được CHẤP NHẬN. Chúng tôi đã can thiệp (cảnh báo thành viên, hạn chế nhóm hoặc biện pháp phù hợp) để bảo vệ cộng đồng.',
        },
        {
          label: 'Nhóm chat — đã xử lý',
          body:
            'Báo cáo {{targetLabel}} chuyển «Đã xem». EngSocial ghi nhận nhóm có dấu hiệu vi phạm (spam hàng loạt, nội dung toxic, quấy rối tập thể…). Admin đã xử lý theo quy định. Cảm ơn bạn đã báo cáo kịp thời.',
        },
        {
          label: 'Nhóm chat — phản hồi reporter',
          body:
            'Kết quả rà soát {{targetLabel}}: HỢP LỆ. Lý do bạn nêu: «{{reason}}». Nếu tình trạng tái diễn, hãy báo cáo lại kèm ảnh chụp và mô tả cụ thể để admin theo dõi sát hơn.',
        },
      ],
      reported: [
        {
          label: 'Nhóm chat — vi phạm nhóm',
          body:
            'Admin xác nhận {{targetLabel}} mà bạn tham gia có vi phạm Tiêu chuẩn cộng đồng EngSocial. Chúng tôi đã ghi nhận và xử lý (cảnh báo, giải tán hoặc hạn chế tùy mức độ). Vui lòng tuân thủ quy tắc chat nhóm; vi phạm lặp lại có thể ảnh hưởng tài khoản cá nhân.',
        },
        {
          label: 'Nhóm chat — cảnh báo thành viên',
          body:
            'EngSocial cảnh báo hành vi trong {{targetLabel}} không phù hợp quy định. Bạn có trách nhiệm không chia sẻ nội dung xúc phạm, spam hoặc quấy rối trong nhóm. Admin sẽ theo dõi thêm nếu có báo cáo mới.',
        },
        {
          label: 'Nhóm chat — hậu quả',
          body:
            'Báo cáo về {{targetLabel}} đã được xử lý với kết luận VI PHẠM. Tham khảo Trợ giúp (link email) để nắm quy định nhóm chat trên EngSocial.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Nhóm chat — báo cáo bỏ qua',
          body:
            'Báo cáo {{targetLabel}} không được chấp nhận. Admin chưa thấy vi phạm nghiêm trọng sau khi xem lý do «{{reason}}» và nội dung nhóm. Bạn có thể báo cáo lại nếu có thêm bằng chứng cụ thể.',
        },
        {
          label: 'Nhóm chat — chưa đủ căn cứ',
          body:
            'EngSocial kết luận báo cáo {{targetLabel}} chưa đủ cơ sở. Một số tranh luận trong nhóm vẫn có thể nằm trong phạm vi cho phép. Cảm ơn bạn đã quan tâm an toàn cộng đồng.',
        },
        {
          label: 'Nhóm chat — hướng dẫn reporter',
          body:
            'Kết quả: KHÔNG CHẤP NHẬN báo cáo {{targetLabel}}. Vui lòng mô tả rõ hành vi vi phạm và thời điểm xảy ra nếu báo cáo lại.',
        },
      ],
      reported: [
        {
          label: 'Nhóm chat — không vi phạm',
          body:
            'Báo cáo về {{targetLabel}} liên quan bạn đã được admin xem xét và kết luận không vi phạm. Tiếp tục tham gia bình thường. Nếu cho rằng bị báo cáo sai: {{helpUrl}}.',
        },
        {
          label: 'Nhóm chat — đóng báo cáo',
          body:
            'EngSocial thông báo không có hành động thêm đối với {{targetLabel}} sau rà soát. Link Trợ giúp đính kèm nếu cần hỗ trợ.',
        },
        {
          label: 'Nhóm chat — khiếu nại',
          body:
            'Admin bác bỏ báo cáo về {{targetLabel}}. Mọi thắc mắc, truy cập {{helpUrl}}.',
        },
      ],
    },
  },
  user: {
    reviewed: {
      reporter: [
        {
          label: 'Tài khoản — báo cáo hợp lệ',
          body:
            'Cảm ơn bạn đã báo cáo {{targetLabel}}. Admin đã rà soát hồ sơ, hành vi và lý do «{{reason}}». Báo cáo được CHẤP NHẬN. Chúng tôi đã áp dụng biện pháp phù hợp (cảnh báo, tạm ngưng hoặc khóa tài khoản tùy mức độ) để bảo vệ cộng đồng EngSocial.',
        },
        {
          label: 'Tài khoản — đã xử lý user',
          body:
            'Báo cáo {{targetLabel}} chuyển «Đã xem». EngSocial ghi nhận tài khoản có hành vi vi phạm (giả mạo, quấy rối, spam, lạm dụng…). Admin đã can thiệp. Cảm ơn bạn đã góp phần giữ nền tảng an toàn.',
        },
        {
          label: 'Tài khoản — phản hồi reporter',
          body:
            'Kết quả rà soát báo cáo {{targetLabel}}: HỢP LỆ. Lý do: «{{reason}}». Nếu tiếp tục gặp hành vi xấu từ cùng tài khoản, hãy chặn và báo cáo lại kèm bằng chứng.',
        },
      ],
      reported: [
        {
          label: 'Tài khoản — vi phạm được xác nhận',
          body:
            'Admin xác nhận {{targetLabel}} của bạn vi phạm Tiêu chuẩn cộng đồng EngSocial. Chúng tôi đã ghi nhận và có thể áp dụng hạn chế (tạm ngưng, khóa hoặc gỡ nội dung liên quan). Vui lòng tuân thủ quy định; vi phạm nghiêm trọng hoặc lặp lại sẽ bị xử lý mạnh hơn.',
        },
        {
          label: 'Tài khoản — cảnh báo chính thức',
          body:
            'EngSocial gửi cảnh báo chính thức: có báo cáo hợp lệ về hành vi trên {{targetLabel}} của bạn. Hãy ngừng mọi hành vi quấy rối, spam hoặc giả mạo. Admin đang theo dõi và sẽ escalated nếu cần.',
        },
        {
          label: 'Tài khoản — hậu quả',
          body:
            'Báo cáo về {{targetLabel}} kết luận VI PHẠM. Xem Trợ giúp (link email) để biết quy định và quyền khiếu nại nếu bạn cho rằng quyết định chưa chính xác.',
        },
      ],
    },
    dismissed: {
      reporter: [
        {
          label: 'Tài khoản — báo cáo bỏ qua',
          body:
            'Báo cáo {{targetLabel}} không được chấp nhận. Admin đã xem lý do «{{reason}}» nhưng chưa thấy vi phạm đủ căn cứ. Bạn có thể báo cáo lại khi có bằng chứng rõ ràng hơn.',
        },
        {
          label: 'Tài khoản — chưa đủ căn cứ',
          body:
            'EngSocial kết luận báo cáo {{targetLabel}} chưa đủ cơ sở xử lý. Cảm ơn bạn đã quan tâm; tránh báo cáo vì xung đột cá nhân không liên quan vi phạm.',
        },
        {
          label: 'Tài khoản — hướng dẫn reporter',
          body:
            'Kết quả: KHÔNG CHẤP NHẬN báo cáo {{targetLabel}}. Mô tả cụ thể hành vi vi phạm sẽ giúp admin xử lý nhanh hơn nếu bạn báo cáo lại.',
        },
      ],
      reported: [
        {
          label: 'Tài khoản — không vi phạm',
          body:
            'Báo cáo về {{targetLabel}} của bạn đã được admin xem xét và kết luận không vi phạm. Tiếp tục sử dụng EngSocial bình thường. Nếu cho rằng bị báo cáo sai: {{helpUrl}}.',
        },
        {
          label: 'Tài khoản — đóng báo cáo',
          body:
            'EngSocial thông báo không có hành động thêm sau rà soát {{targetLabel}}. Tham khảo Trợ giúp nếu cần: link đính kèm email.',
        },
        {
          label: 'Tài khoản — quyền phản hồi',
          body:
            'Admin bác bỏ báo cáo liên quan {{targetLabel}}. Mọi thắc mắc, truy cập {{helpUrl}}.',
        },
      ],
    },
  },
}
