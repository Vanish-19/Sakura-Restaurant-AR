import StaticPageContent from '../models/StaticPageContent.js';

export const STATIC_PAGE_DEFAULTS = [
  {
    slug: 'about',
    label: 'About',
    content: {
      hero: {
        title: 'Về Chúng Tôi -',
        accent: 'Sakura Restaurant',
        subtitle: 'Nơi Giao Thoa Giữa Di Sản Ẩm Thực Truyền Thống Và Công Nghệ Tương Lai',
        backgroundImage: '/about1.png',
      },
      story: {
        eyebrow: 'Câu chuyện thương hiệu',
        title: 'Khởi Nguồn Của Một Trải Nghiệm Khác Biệt',
        quote:
          '"Ẩm thực Nhật Bản là nghệ thuật của sự tĩnh lặng và tinh tế. Nhưng làm thế nào để thực khách có thể chạm vào nghệ thuật ấy ngay cả trước khi nếm thử?"',
        paragraphs: [
          'Đó là trăn trở nuôi dưỡng sự ra đời của Sakura Restaurant. Chúng tôi trân trọng một bữa ăn hoàn hảo không chỉ dừng lại ở hương vị đánh thức vị giác, mà phải là một cuộc hành trình trọn vẹn của mọi giác quan.',
          'Ra đời với khát vọng mang tinh hoa ẩm thực xứ Phù Tang đến gần hơn với thực khách Việt, Sakura Restaurant tự hào là một trong những nhà hàng tiên phong ứng dụng Công nghệ Thực tế Tăng cường (AR - Augmented Reality) vào không gian ẩm thực cao cấp.',
          'Đến với Sakura, bạn không chỉ đang gọi một món ăn, bạn đang mở ra một câu chuyện sống động trên chính chiếc bàn của mình.',
        ],
        image: '/about2.png',
        imageAlt: 'Phòng ăn phong cách Nhật với trải nghiệm AR',
        cardTitle: 'AR Preview Menu',
        cardText: 'Scan to view dishes in 3D',
      },
      visionMission: {
        title: 'Tầm Nhìn & Sứ Mệnh',
        subtitle: 'Định hướng tương lai của ẩm thực trải nghiệm.',
        visionTitle: 'Tầm nhìn',
        visionText:
          'Trở thành biểu tượng của sự đổi mới trong ngành F&B, nơi định nghĩa lại cách thực khách tương tác và thưởng thức ẩm thực Nhật Bản cao cấp.',
        missionTitle: 'Sứ mệnh',
        missionText:
          'Giao thoa hoàn hảo giữa kỹ thuật chế biến thủ công truyền thống và công nghệ hiện đại, mang đến những bữa ăn không chỉ chuẩn vị, an toàn mà còn mang lại sự ngạc nhiên và niềm vui.',
      },
      coreValuesEyebrow: 'Giá trị cốt lõi',
      coreValuesTitle: 'Bốn Giá Trị Định Hình Sakura',
      coreValues: [
        {
          iconKey: 'safety-certificate',
          title: 'Chất Lượng Nguyên Bản',
          text: 'Sự tươi mới khắt khe. Chúng tôi tôn trọng triết lý shun để mỗi lát sashimi, chén miso và phần cơm đều giữ trọn tinh thần Nhật Bản.',
        },
        {
          iconKey: 'rocket',
          title: 'Sáng Tạo Đột Phá',
          text: 'Công nghệ AR luôn đi cùng trải nghiệm ẩm thực, giúp thực khách khám phá món ăn từ hình dáng, kết cấu đến câu chuyện phía sau.',
        },
        {
          iconKey: 'heart',
          title: 'Tinh Thần Omotenashi',
          text: 'Lòng hiếu khách Nhật Bản xuất hiện trong từng lời chào, từng chi tiết nhỏ và cảm giác được chăm sóc trọn vẹn tại bàn ăn.',
        },
        {
          iconKey: 'customer-service',
          title: 'Không Gian Tinh Tại',
          text: 'Phong cách Zen, ánh sáng dịu và chất liệu tự nhiên tạo nên một nơi đủ tĩnh để thực khách tận hưởng hương vị.',
        },
      ],
      arExperience: {
        title: 'Trải Nghiệm AR Độc Quyền',
        subtitle: 'Thưởng Thức Bằng Tri Giác Trước Khi Nếm Bằng Vị Giác',
        description:
          'Tại Sakura Restaurant, công thực đơn giấy truyền thống được nâng tầm thành một không gian ẩm thực hiển thị ngay trước mắt.',
        image: '/about4.png',
        imageAlt: 'AR Experience Preview',
        features: [
          {
            title: 'Chiêm ngưỡng chân thực',
            text: 'Các món ăn được tái hiện với kích thước, màu sắc và kết cấu gần như thật ngay trên bàn của bạn.',
          },
          {
            title: 'Tương tác trực quan',
            text: 'Khám phá từng góc nhìn của món ăn bằng cách xoay, phóng to và quan sát trước khi gọi món.',
          },
          {
            title: 'Thấu hiểu món ăn',
            text: 'Công nghệ AR kết nối nguyên liệu, kỹ thuật chế biến và câu chuyện văn hóa đằng sau mỗi lựa chọn.',
          },
        ],
      },
      artisans: {
        eyebrow: 'Đội ngũ bếp chuyên gia',
        title: 'Những Nghệ Nhân Của Hương Vị',
        image: '/about3.png',
        imageAlt: 'Nghệ nhân cắt sashimi',
        paragraphs: [
          'Ẩm thực Nhật Bản đòi hỏi tính kỷ luật và sự kiên nhẫn tuyệt đối. Đội ngũ đầu bếp tại Sakura Restaurant được dẫn dắt bởi những bếp trưởng dày dạn kinh nghiệm trong tinh hoa ẩm thực Nhật.',
          'Đối với họ, mỗi lưỡi dao lướt qua đều chứa đựng sự tôn kính với nguyên liệu, mỗi cách bài trí đều tuân theo những quy tắc thẩm mỹ khắt khe.',
        ],
        quote:
          'Dựa trên triết lý "Ichi-go Ichi-e" (Nhất kỳ nhất hội), trân trọng mỗi cuộc gặp gỡ vì có thể chỉ diễn ra một lần trong đời, đội ngũ của chúng tôi cam kết đặt trọn tâm huyết vào từng món ăn.',
      },
    },
  },
  {
    slug: 'contact',
    label: 'Contact',
    content: {
      hero: {
        title: 'Liên Hệ & Đặt Bàn',
        subtitle: 'Kết Nối Với Không Gian Ẩm Thực Tương Lai',
        description:
          'Tại Sakura, chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Dù bạn có thắc mắc, cần đặt bàn hay muốn hợp tác, hãy liên hệ với chúng tôi qua các kênh dưới đây.',
        backgroundImage: '/bgheadContact.png',
      },
      contactSection: {
        title: 'Thông Tin Liên Hệ',
        items: [
          {
            iconKey: 'environment',
            title: 'Địa Chỉ',
            lines: [
              'Phong thí nghiệm AR/VR, Tầng 3, Toà nhà A',
              'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
              'Hà Nội, Việt Nam',
            ],
            action: 'Xem trên bản đồ',
          },
          {
            iconKey: 'phone',
            title: 'Hotline (24/7)',
            lines: ['1900 xxxx', '(+84) 28 1234 5678'],
          },
          {
            iconKey: 'mail',
            title: 'Email',
            lines: ['Chăm sóc khách hàng: cskh@sakura-ar.vn', 'Đối tác & truyền thông: partner@sakura-ar.vn'],
          },
          {
            iconKey: 'clock-circle',
            title: 'Giờ Phục Vụ',
            lines: ['10:00 Sáng - 10:00 Tối', 'Lưu ý: Bếp nhận order cuối cùng vào lúc 9:30 Tối'],
          },
        ],
      },
      supportCard: {
        title: 'Trải nghiệm AR của bạn gặp trục trặc?',
        description: 'Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn nhanh chóng.',
        actionLabel: 'Hỗ trợ kỹ thuật AR',
        backgroundImage: '/bgBody.png',
      },
      contactForm: {
        title: 'Gửi Thông Điệp Cho Chúng Tôi',
        submitLabel: 'Gửi Yêu Cầu Của Bạn',
        successMessage: 'Cảm ơn bạn. Sakura Restaurant sẽ liên hệ lại trong thời gian sớm nhất.',
        fields: {
          name: {
            label: 'Họ Và Tên *',
            placeholder: 'Nhập họ và tên của bạn',
            requiredMessage: 'Vui lòng nhập họ tên',
          },
          phone: {
            label: 'Số Điện Thoại *',
            placeholder: 'Nhập số điện thoại của bạn',
            requiredMessage: 'Vui lòng nhập số điện thoại',
          },
          email: {
            label: 'Email *',
            placeholder: 'Nhập email của bạn',
            requiredMessage: 'Vui lòng nhập email',
            invalidMessage: 'Email không hợp lệ',
          },
          purpose: {
            label: 'Mục Đích Liên Hệ *',
            placeholder: 'Chọn mục đích liên hệ',
            requiredMessage: 'Vui lòng chọn mục đích liên hệ',
          },
          guests: {
            label: 'Số Lượng Khách (Nếu đặt bàn)',
            placeholder: 'Nhập số lượng khách',
          },
          message: {
            label: 'Yêu Cầu Đặc Biệt / Tin Nhắn',
            placeholder: 'Hãy cho chúng tôi biết thêm yêu cầu đặc biệt về vị trí ngồi, chế độ ăn, hoặc hỗ trợ kỹ thuật AR...',
          },
        },
        purposeOptions: [
          { value: 'booking', label: 'Đặt bàn' },
          { value: 'support', label: 'Hỗ trợ trải nghiệm AR' },
          { value: 'partner', label: 'Hợp tác đối tác' },
          { value: 'other', label: 'Khác' },
        ],
      },
      serviceCards: [
        {
          iconKey: 'wifi',
          title: 'Kết nối Wifi',
          text: 'Đảm bảo thiết bị của bạn được kết nối với mạng "Sakura_AR_Guest" để tối ưu hoá tốc độ tải mô hình 3D.',
        },
        {
          iconKey: 'book',
          title: 'Hướng dẫn sử dụng',
          text: 'Xem nhanh hướng dẫn tương tác AR để biết cách quét mã và xem món ăn chi tiết.',
          action: 'Xem hướng dẫn',
        },
        {
          iconKey: 'heart',
          title: 'Hỗ trợ trực tiếp',
          text: 'Vui lòng thông báo cho nhân viên phục vụ tại bàn hoặc gọi Hotline để đội ngũ kỹ thuật hỗ trợ ngay lập tức.',
        },
      ],
    },
  },
  {
    slug: 'privacy-policy',
    label: 'Privacy & Policy',
    content: {
      hero: {
        eyebrow: 'Last updated: October 2023',
        title: 'CHÍNH SÁCH BẢO MẬT DỮ LIỆU',
        subtitle: '(PRIVACY POLICY) - Sakura Restaurant',
        backgroundImage: '/headbgPrivacy.png',
      },
      tocTitle: 'MỤC LỤC',
      supportTitle: 'Bạn có thắc mắc về chính sách bảo mật?',
      supportText: 'Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn.',
      supportButtonLabel: 'Liên hệ ngay',
      contentMoreLabel: 'Xem tất cả chính sách chi tiết bên dưới',
      sections: [
        { id: 'intro', number: '01.', title: 'Giới thiệu chung', iconKey: 'file-protect' },
        { id: 'collected-data', number: '02.', title: 'Dữ liệu chúng tôi thu thập', iconKey: 'database' },
        { id: 'usage-purpose', number: '03.', title: 'Mục đích sử dụng thông tin', iconKey: 'aim' },
        { id: 'security', number: '04.', title: 'Cam kết bảo mật dữ liệu', iconKey: 'safety' },
        { id: 'user-rights', number: '05.', title: 'Quyền kiểm soát của người dùng', iconKey: 'user' },
        { id: 'updates', number: '06.', title: 'Cập nhật chính sách', iconKey: 'sync' },
        { id: 'contact', number: '07.', title: 'Liên hệ', iconKey: 'mail' },
      ],
      introParagraphs: [
        'Chào mừng quý khách đến với Sakura Restaurant. Việc bảo vệ dữ liệu cá nhân và xây dựng niềm tin với khách hàng là một trong những ưu tiên hàng đầu của chúng tôi.',
        'Chính sách này giải thích chi tiết về các loại thông tin chúng tôi thu thập khi quý khách truy cập website, trải nghiệm thực đơn Thực tế tăng cường (AR), đặt bàn, gửi yêu cầu hỗ trợ hoặc sử dụng các dịch vụ trực tuyến khác.',
        'Bằng việc tiếp tục sử dụng website và dịch vụ của Sakura Restaurant, quý khách xác nhận đã đọc, hiểu và đồng ý với các nguyên tắc xử lý dữ liệu được trình bày dưới đây.',
      ],
      collectedDataIntro:
        'Chúng tôi chỉ thu thập những thông tin thực sự cần thiết nhằm mang lại trải nghiệm ẩm thực và dịch vụ tốt nhất cho quý khách.',
      dataItems: [
        {
          iconKey: 'user',
          title: 'Thông tin cá nhân (Được cung cấp tự nguyện)',
          text: 'Khi quý khách đăng ký tài khoản, đặt bàn trực tuyến hoặc điền form liên hệ, chúng tôi sẽ yêu cầu các thông tin cơ bản bao gồm họ và tên, số điện thoại, địa chỉ email, yêu cầu đặc biệt khi đặt bàn và ghi chú dị ứng thực phẩm.',
        },
        {
          iconKey: 'camera',
          title: 'Quyền truy cập Camera cho tính năng AR',
          text: 'Để hiển thị mô hình món ăn 3D sống động ngay trên bàn thực tế, hệ thống WebXR/AR của chúng tôi sẽ yêu cầu quyền truy cập Camera trên thiết bị của quý khách.',
        },
        {
          iconKey: 'safety',
          title: 'Cam kết tuyệt đối về Camera',
          text: 'Chúng tôi không thu thập, lưu trữ, ghi hình hoặc truyền tải bất kỳ dữ liệu hình ảnh hoặc video nào từ camera của quý khách về máy chủ.',
        },
        {
          iconKey: 'bar-chart',
          title: 'Dữ liệu hệ thống và tương tác',
          text: 'Hệ thống tự động ghi nhận các thông tin tiêu chuẩn gồm địa chỉ IP, loại trình duyệt, hệ điều hành, thời gian truy cập, lịch sử tương tác với menu AR và cookies ẩn danh để tối ưu tốc độ tải trang.',
        },
      ],
      usagePurposeIntro:
        'Toàn bộ dữ liệu thu thập được hệ thống của Sakura Restaurant xử lý cho các mục đích sau:',
      purposeItems: [
        {
          iconKey: 'fork',
          title: 'Vận hành dịch vụ',
          text: 'Khởi tạo tính năng AR, xử lý yêu cầu đặt bàn, gửi email xác nhận và chuẩn bị trước các yêu cầu đặc biệt của khách tại nhà hàng.',
        },
        {
          iconKey: 'customer-service',
          title: 'Hỗ trợ khách hàng',
          text: 'Phản hồi nhanh chóng các thắc mắc, khiếu nại hoặc hỗ trợ kỹ thuật khi quý khách gặp sự cố với tính năng AR.',
        },
        {
          iconKey: 'sync',
          title: 'Cải thiện nền tảng',
          text: 'Dựa trên báo cáo lỗi và dữ liệu tương tác, đội ngũ phát triển sẽ tối ưu giao diện, hiệu suất và tốc độ tải của các tệp 3D.',
        },
        {
          iconKey: 'gift',
          title: 'Truyền thông & Khuyến mãi',
          text: 'Gửi thông tin về thực đơn mới, sự kiện ẩm thực hoặc mã giảm giá khi quý khách đồng ý nhận thông báo.',
        },
      ],
      securityParagraphs: [
        'Chúng tôi áp dụng các tiêu chuẩn mã hóa bảo mật tiên tiến, bao gồm giao thức SSL/TLS trong quá trình truyền tải dữ liệu. Mọi thông tin cá nhân của quý khách được lưu trữ an toàn trong hệ cơ sở dữ liệu khép kín và chỉ những nhân sự có thẩm quyền mới được phép truy cập khi cần phục vụ công việc.',
      ],
      securityHighlight:
        'Sakura Restaurant cam kết không bán, trao đổi hoặc chia sẻ trái phép dữ liệu cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích thương mại.',
      userRightsIntro:
        'Quý khách hoàn toàn làm chủ dữ liệu của mình. Theo quy định, quý khách có các quyền sau:',
      userRights: [
        'Yêu cầu trích xuất toàn bộ dữ liệu cá nhân mà chúng tôi đang lưu trữ.',
        'Yêu cầu chỉnh sửa hoặc cập nhật các thông tin không còn chính xác.',
        'Yêu cầu xóa bỏ hoàn toàn tài khoản và lịch sử đặt bàn khỏi hệ thống của Sakura Restaurant.',
        'Rút lại sự đồng ý nhận thông tin khuyến mãi bất kỳ lúc nào.',
      ],
      updatesParagraphs: [
        'Chúng tôi có quyền điều chỉnh và cập nhật Chính sách bảo mật này theo thời gian để phù hợp với các thay đổi về công nghệ, quy định pháp luật hoặc quy trình vận hành dịch vụ.',
        'Các phiên bản cập nhật sẽ được thông báo rõ ràng trên website, kèm ngày hiệu lực mới. Trong trường hợp thay đổi quan trọng liên quan đến quyền riêng tư, Sakura Restaurant có thể gửi thông báo qua email hoặc hiển thị thông báo nổi bật trên hệ thống.',
      ],
      contactIntro:
        'Nếu quý khách có bất kỳ câu hỏi nào về các điều khoản bảo mật, quy trình xử lý dữ liệu hoặc cách công nghệ AR của chúng tôi hoạt động, vui lòng liên hệ với bộ phận phụ trách về kỹ thuật qua:',
      contactMethods: [
        { iconKey: 'mail', text: 'van.pa@tinasoft.vn - anh.nv5@tinasoft.vn' },
        { iconKey: 'phone', text: 'Hotline: 0966 490 431' },
      ],
    },
  },
  {
    slug: 'terms-of-service',
    label: 'Terms Of Service',
    content: {
      hero: {
        eyebrow: 'Last updated: October 2023',
        title: 'ĐIỀU KHOẢN DỊCH VỤ',
        subtitle: '(TERMS OF SERVICE) - Sakura Restaurant',
        backgroundImage: '/headbgPrivacy.png',
      },
    },
  },
  {
    slug: 'career',
    label: 'Careers',
    content: {
      hero: {
        eyebrow: 'Tuyển dụng',
        title: 'Cơ Hội Nghề Nghiệp',
        subtitle: 'Khởi Đầu Tương Lai Cùng Ngành Ẩm Thực Công Nghệ',
        description:
          'Tại Sakura Restaurant, chúng tôi không chỉ đơn thuần phục vụ những món ăn ngon. Chúng tôi đang kiến tạo một trải nghiệm ẩm thực đa giác quan, nơi truyền thống Nhật Bản hòa quyện cùng công nghệ tương lai.',
        backgroundImage: '/headbgPrivacy.png',
      },
      application: {
        email: 'career@sakurarestaurant.vn',
        hotline: '1900 xxxx',
      },
    },
  },
  {
    slug: 'press-kit',
    label: 'Press Kit',
    content: {
      hero: {
        eyebrow: 'Press Kit',
        title: 'Tài Nguyên Truyền Thông',
        subtitle: 'Kết nối di sản ẩm thực truyền thống với công nghệ AR tương lai.',
        description:
          'Bộ tài nguyên truyền thông chính thức của Sakura Restaurant dành cho báo chí, đối tác và các đơn vị truyền thông. Vui lòng tuân thủ các quy định sử dụng khi khai thác tài liệu.',
        backgroundImage: '/presskit/bgheadpress.png',
      },
      mediaContact: {
        representative: 'Ms. Linh Nguyen',
        email: 'press@sakura-restaurant.com',
        hotline: '+84 (0) 90 123 4567',
      },
    },
  },
];

function createNotFoundError() {
  const error = new Error('Không tìm thấy trang static');
  error.status = 404;
  return error;
}

function mergeContent(defaultContent = {}, storedContent = {}) {
  return {
    ...defaultContent,
    ...(storedContent || {}),
    hero: {
      ...(defaultContent.hero || {}),
      ...(storedContent?.hero || {}),
    },
  };
}

function withDefaultContent(page) {
  if (!page) return page;
  const defaults = STATIC_PAGE_DEFAULTS.find((item) => item.slug === page.slug);
  if (!defaults) return page;

  return {
    ...page,
    label: page.label || defaults.label,
    content: mergeContent(defaults.content, page.content),
  };
}

export async function ensureStaticPages() {
  await Promise.all(
    STATIC_PAGE_DEFAULTS.map((page) =>
      StaticPageContent.updateOne(
        { slug: page.slug },
        { $setOnInsert: page },
        { upsert: true }
      )
    )
  );
}

export async function getStaticPages() {
  await ensureStaticPages();
  const pages = await StaticPageContent.find({}).sort({ createdAt: 1 }).lean();
  return pages.map(withDefaultContent);
}

export async function getStaticPageBySlug(slug) {
  await ensureStaticPages();
  const page = await StaticPageContent.findOne({ slug }).lean();
  if (!page) throw createNotFoundError();
  return withDefaultContent(page);
}

export async function updateStaticPage(slug, { label, content, adminId }) {
  await ensureStaticPages();
  const page = await StaticPageContent.findOneAndUpdate(
    { slug },
    {
      ...(label ? { label } : {}),
      content: content || {},
      ...(adminId ? { updatedBy: adminId } : {}),
    },
    { new: true }
  ).lean();

  if (!page) throw createNotFoundError();
  return page;
}
