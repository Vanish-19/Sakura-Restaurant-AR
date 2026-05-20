export const CHAT_DEFAULT_SUGGESTIONS = [
  'Món nào bán chạy nhất?',
  'Gợi ý món cho 2 người',
  'Hướng dẫn mình xem AR món ăn',
  'Nhà hàng mở cửa khi nào?',
];

export const CHAT_KNOWLEDGE_BASE = {
  restaurant: {
    name: 'Sakura Restaurant',
    positioning: 'Nhà hàng Nhật Bản có trải nghiệm AR Menu để khách xem mô hình 3D món ăn trước khi gọi.',
    hours: '10:00 - 22:00 hằng ngày',
    lastKitchenOrder: '21:30',
    address: [
      'Phong thí nghiệm AR/VR, Tầng 3, Toà nhà A',
      'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
      'Hà Nội, Việt Nam',
    ],
    hotline: ['1900 xxxx', '(+84) 28 1234 5678'],
    emails: {
      support: 'cskh@sakura-ar.vn',
      partner: 'partner@sakura-ar.vn',
    },
    guestWifi: 'Sakura_AR_Guest',
  },
  booking: {
    summary: 'Khách có thể đặt bàn qua chức năng của nhà hàng hoặc liên hệ hotline để được hỗ trợ nhanh.',
    dineIn: 'Khi đến bàn, khách quét QR để mở table session và gọi món ngay trên thiết bị.',
    takeaway: 'Khách có thể đặt mang về hoặc giao hàng, nhập thông tin liên hệ, địa chỉ nhận hàng rồi chọn COD hoặc thanh toán online.',
  },
  ar: {
    summary: 'AR Menu cho phép xem mô hình 3D món ăn trên bàn bằng USDZ hoặc GLB.',
    ios: 'iPhone/iPad dùng Quick Look với file USDZ.',
    android: 'Android dùng Scene Viewer hoặc WebXR với file GLB.',
    support: 'Nếu AR không chạy, hãy kiểm tra Wifi, camera permission và báo nhân viên hoặc hotline để được hỗ trợ.',
  },
  payments: {
    methods: ['SePay QR', 'COD'],
    summary: 'Nhà hàng hỗ trợ thanh toán online qua SePay hoặc thanh toán khi nhận món/nhận hàng bằng COD.',
    refund: 'Nếu có lỗi giao dịch, khách nên liên hệ hotline hoặc nhân viên để được kiểm tra đơn và thanh toán.',
  },
  faq: [
    {
      question: 'Làm sao để xem AR món ăn?',
      answer: 'Mở trang AR hoặc quét QR trên bàn, sau đó chọn món có model GLB/USDZ để xem trực tiếp bằng camera.',
    },
    {
      question: 'Có thể đặt món tại bàn không?',
      answer: 'Có. Khách quét QR của bàn để tạo table session rồi gọi món ngay trên điện thoại.',
    },
    {
      question: 'Có hỗ trợ giao hàng hoặc mang về không?',
      answer: 'Có. Khách thêm món vào giỏ, nhập thông tin liên hệ, địa chỉ nhận hàng rồi chọn phương thức thanh toán.',
    },
    {
      question: 'Nhà hàng có bài viết hoặc khuyến mãi không?',
      answer: 'Có khu vực blog/bài viết để đăng tin tức, chia sẻ và chương trình khuyến mãi.',
    },
    {
      question: 'Nếu AR lỗi thì phải làm sao?',
      answer: 'Khách nên kiểm tra Wifi, trình duyệt, quyền camera và báo nhân viên hoặc hotline để được hỗ trợ trực tiếp.',
    },
  ],
  quickLinks: {
    home: '/',
    ar: '/ar',
    contact: '/contact',
    cart: '/cart',
    blog: '/blog',
    orderHistory: '/orders/history',
  },
};
