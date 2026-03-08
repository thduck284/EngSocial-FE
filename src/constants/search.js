/** Filter options for Search page (tab Bài viết / Bạn bè / Cộng đồng) */

export const TIME_OPTIONS = ['all', 'today', 'week', 'month']

export const SORT_OPTIONS = ['newest', 'oldest', 'relevant', 'engagement', 'comments', 'likes']

export const CONTENT_TYPES = [
  { value: 'all', key: 'filterContentAll' },
  { value: 'image', key: 'filterContentWithImage' },
  { value: 'video', key: 'filterContentWithVideo' },
  { value: 'text', key: 'filterContentTextOnly' },
]

export const FRIEND_FILTER_OPTIONS = [
  { value: 'all', key: 'filterFriendsAll' },
  { value: 'connected', key: 'filterFriendsConnected' },
  { value: 'pending', key: 'filterFriendsPending' },
]

export const COMMUNITY_FILTER_OPTIONS = [
  { value: 'all', key: 'filterCommunityAll' },
  { value: 'joined', key: 'filterCommunityJoined' },
  { value: 'notJoined', key: 'filterCommunityNotJoined' },
]

/** Mock data for demo (tab Bài viết – replace with API later) */
export const MOCK_POSTS_COUNT = 128

export const MOCK_POSTS = [
  {
    id: '1',
    content:
      'Hôm nay mình vừa tổng hợp lại 12 thì trong English Grammar cực kỳ dễ nhớ. Ai cần thì comment bên dưới mình gửi file PDF nhé!',
    author: {
      name: 'Nguyễn Minh Anh',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBKxaDaK-W4YQ__s_tuDtMyEr5qtoiOOeqm0reNHLCZeH2zBlkJ97g3411Xsf3rR5qduKOEXWJCTptIhUGbIga52idwSW5DLqpk5g_UBCmi9EMfT6ZisTW-3AdEWbXSyMV4uEQYJARIiBWpeHH-TtKqbme0BXaG6XkiSHmSqZhe00RKExInHd7mgitvXXpuS2m-8_3m3WDk2JzQdnxuO9AWFXFlJqhFWfT3TLDMzDYw7_evJ2mZPvi3Vof9eGqDpwdON-2zzz4odA',
    },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXIrZaB0Uc9218vvUIVdp7tH9Y2YvtxxHGOMpjB1g6KPVcRB7DAYQ7aVvcVJiNu3_UXSx5pDjN8TL_MKhL7tA0th7p7hQK3gVVP5--QyDJD3QOrp5j2gzAyzPeHM3VxRFnWrMb6GDbdOdp7TCLkgtWyuaILXgb1kaMYCfyQogwcEM0X1tfRmFNv3KzMensvxnqQwBCKwkrotytsywK3inZx1nHwlf-aiAomCdd7b2nR0a1Jmwd_LDq-A77A-Mfw1Yay93gkKxbqA',
    ],
    likeCount: 42,
    commentCount: 12,
    liked: false,
    saved: false,
    groupName: null,
  },
  {
    id: '2',
    content:
      "Don't forget the importance of Subject-Verb Agreement in English Grammar. Many learners make mistakes here when speaking fast. Let's practice with these 5 sentences...",
    author: {
      name: 'Mr. Alex Smith',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmqCA0xecH16v9mkb2BdlIOwKXppcGzPC9fEc8nu-dZQ1Y39uQO6812ezX1DEsbZGj4XFg3cHeedDzfZMlUR8wXnGGt4u_CEcEbOKS7I1RUMuvPN3o3i4hNV1UQGOGZVUb7yyJsn_nlnzw4nX0bKQ60QpkUDntVxtRtDTrVGmUsHdhyD1QUp7__s-YhoeqRk-JNNyfx74iu6AHx4733q5XKRGpscCYX7ZDvcarHMDEnAKRRVNdJqYnLKiVohIksEGCqDzQdjTqpg',
    },
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    images: [],
    likeCount: 128,
    commentCount: 45,
    liked: true,
    saved: true,
    groupName: 'English Master Hub',
  },
]

/** Mock for right sidebar – friend suggestions */
export const MOCK_FRIEND_SUGGESTIONS = [
  {
    name: 'Lê Văn Toàn',
    mutual: '20',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCldQOiPBO2XRI1G-vo2dXBcEacJCgNEvRIVPfa_cclIiHEoQSneo-vqpqK5sqfCkbQKEoxVN2agzbIt73Zo-n935gKyFJH322-RUF-KL7vudqa7DsI9gQB4740540KrWeteC0p3Pmw76wCF-PFme-ameKh-AMBxNk4-T0gk7JNmJR6b1R_fa49Ev9fko_JRmDhH_FQaeFKhKXHzH1co20leN3YGOxN3VqhRtSapmWOXxRMiKFvTZ67xZu1vIkZW2Zo26FbZ7QJ4w',
  },
  {
    name: 'Trần Thu Hà',
    mutual: '12',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbvZ3ORh_ow4NCm9Y8N22dqFZyrB0GmBJnlOwNWMJKbNxemN3ADQPGVCJUJUL9CC5hcNX2pBjkO1BJ2yv04wF0hh_xT10JrARRbNz9J-0z9J259qAIuVVnmvKXhObjXFunqVC25KKSkWKxBRmJFgYxRM-Mw79lLzTcUo-lIjxkxoU89R3iV7pAeVBKHKJaDK-XRW50EbOQoIhH40yffhXXKW_TP46CyLNeWyj5euJQKZDOj54u5-rGSviS95zoA86VvEt3h7WnkQ',
  },
  {
    name: 'Hoàng Linh',
    mutual: '5',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADVF8tXiRk5hbit9fIuuP3EeunW6Fh-8oAyoo2jxg1AE9OrPro0UrL8N0415hv46MRQmRFeOCXQznl539pYXtoyA-6KTrvOFQIQDakiY4E4UmAJ3AWZQMX2koP4LkCpyafCQD7KXoZJ72fxKzvL0R8IQBQOtuwOxlj8GGllbefE5ER04YVBgmCoTwoAhwTecEnS-tGM3hQZGQeS5WLckUKu0bI5cTj8gtfxdqzPiysl4bptxuiTewwnyZBmRcmj_dJffsRJtrhiw',
  },
]

/** Mock for right sidebar – study groups */
export const MOCK_STUDY_GROUPS = [
  { title: 'IELTS 8.0+ Mastery', members: '24.5k thành viên', color: 'from-primary to-blue-600' },
  { title: 'English for Beginners', members: '82k thành viên', color: 'from-indigo-500 to-purple-600' },
]

/** Mock for right sidebar – leaderboard */
export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Bảo Trâm', xp: '12,450 XP', color: 'text-yellow-500' },
  { rank: 2, name: 'Quốc Cường', xp: '10,820 XP', color: 'text-gray-400' },
  { rank: 3, name: 'Minh Tuấn', xp: '9,100 XP', color: 'text-orange-400' },
]
