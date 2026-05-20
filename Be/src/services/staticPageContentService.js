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
      valuesSection: {
        eyebrow: 'Giá trị cốt lõi',
        title: 'Bốn Giá Trị Định Hình Sakura',
        items: [
          {
            icon: 'safety',
            title: 'Chất Lượng Nguyên Bản',
            text: 'Sự tươi mới khắt khe. Chúng tôi tôn trọng triết lý shun để mỗi lát sashimi, chén miso và phần cơm đều giữ trọn tinh thần Nhật Bản.',
          },
          {
            icon: 'rocket',
            title: 'Sáng Tạo Đột Phá',
            text: 'Công nghệ AR luôn đi cùng trải nghiệm ẩm thực, giúp thực khách khám phá món ăn từ hình dáng, kết cấu đến câu chuyện phía sau.',
          },
          {
            icon: 'heart',
            title: 'Tinh Thần Omotenashi',
            text: 'Lòng hiếu khách Nhật Bản xuất hiện trong từng lời chào, từng chi tiết nhỏ và cảm giác được chăm sóc trọn vẹn tại bàn ăn.',
          },
          {
            icon: 'service',
            title: 'Không Gian Tĩnh Tại',
            text: 'Phong cách Zen, ánh sáng dịu và chất liệu tự nhiên tạo nên một nơi đủ tĩnh để thực khách tận hưởng hương vị.',
          },
        ],
      },
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
