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
  return StaticPageContent.find({}).sort({ createdAt: 1 }).lean();
}

export async function getStaticPageBySlug(slug) {
  await ensureStaticPages();
  const page = await StaticPageContent.findOne({ slug }).lean();
  if (!page) throw createNotFoundError();
  return page;
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
