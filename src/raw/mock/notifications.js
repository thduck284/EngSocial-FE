// Mock: Notifications list
// Note: content uses JSX, so this will need to be used in a component context
export const mockNotifications = [
  {
    id: 1,
    unread: true,
    type: 'comment',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-oVK9sv1zsEIrhZzFDWplBlNkGHOdWpMbfTbee50oMU_zw-Ke6yEJXg6qfeJMQuzYIBYSCR2NsxAUFBeIt3-HI22-nmAsn1-IWrcRz7UMBQmPBdKmeh2Hly6x0Jh3FdPPmh4TvFYG9uTn6uKbUu5qLMDKcRKuIgylfjQyX3RE9dOnXqEY9hhu9ajD7YxkmmN4JbXVLfCDBKsAgckxTigEveGgkSnICu6GtlSNl3ASvkfcJ949M4pIxOuOgkRa4AsXYZniiPUQLZ30',
    userName: 'Elena Rodriguez',
    action: 'commented',
    time: '2 phút trước',
  },
  {
    id: 2,
    unread: false,
    type: 'challenge',
    icon: 'emoji_events',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
    title: 'Thử thách mới:',
    message: 'Vua Từ Vựng Tuần 48 đã bắt đầu! Tham gia ngay.',
    time: '1 giờ trước',
  },
  {
    id: 3,
    unread: false,
    type: 'goal',
    icon: 'check_circle',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500',
    message: 'Bạn đã hoàn thành mục tiêu học tập hàng ngày. Chúc mừng!',
    time: '4 giờ trước',
  },
  {
    id: 4,
    unread: false,
    type: 'follow',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlcLPs4U31IUEEkJ-7hiUMKLh8ld5wo1RGeCtIBeEHQPkQ9Ofijva7BfHev8yilRvXN0WPV1TDMIaTpGbzOuUoOlbfMPoEor2V85bY0F4kWKK4kebj07jDy5_vLBJ1csR9LujDeRN9STlII7d3COtb7raAS-xwu5RFjTTcPx3ONz7Q2NBUxQVSBhZlMDRkw_LwZ8K5gqYmcGI598qawEvh0vzZE2x7589wg9hwhK6vQbh9YXMR7amiN-Pa6H0mmcK1kts2TBtvMFYk',
    userName: 'Alex Thompson',
    action: 'followed',
    time: 'Hôm qua',
  },
]
