import StaticPageContent from '../models/StaticPageContent.js';
import { STATIC_PAGE_TRANSLATIONS } from './staticPageTranslations.js';

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
      brandStory: {
        eyebrow: 'Câu chuyện thương hiệu',
        title: 'Khởi Nguồn Của Một Trải Nghiệm Khác Biệt',
        quote:
          '"Ẩm thực Nhật Bản là nghệ thuật của sự tĩnh lặng và tinh tế. Nhưng làm thế nào để thực khách có thể chạm vào nghệ thuật ấy ngay cả trước khi nếm thử?"',
        paragraphs: [
          'Đó là trăn trở nuôi dưỡng sự ra đời của Sakura Restaurant. Chúng tôi trân trọng một bữa ăn hoàn hảo không chỉ dừng lại ở hương vị đánh thức vị giác, mà phải là một cuộc hành trình trọn vẹn của mọi giác quan.',
          'Ra đời với khát vọng mang tinh hoa ẩm thực xứ Phù Tang đến gần hơn với thực khách Việt, Sakura Restaurant tự hào là một trong những nhà hàng tiên phong ứng dụng Công nghệ Thực tế Tăng cường (AR - Augmented Reality) vào không gian ẩm thực cao cấp.',
        ],
        highlight:
          'Đến với Sakura, bạn không chỉ đang gọi một món ăn, bạn đang mở ra một câu chuyện sống động trên chính chiếc bàn của mình.',
        image: '/about2.png',
        previewCard: {
          title: 'AR Preview Menu',
          subtitle: 'Scan to view dishes in 3D',
        },
      },
      visionMission: {
        title: 'Tầm Nhìn & Sứ Mệnh',
        subtitle: 'Định hướng tương lai của ẩm thực trải nghiệm.',
        vision:
          'Trở thành biểu tượng của sự đổi mới trong ngành F&B, nơi định nghĩa lại cách thực khách tương tác và thưởng thức ẩm thực Nhật Bản cao cấp.',
        mission:
          'Giao thoa hoàn hảo giữa kỹ thuật chế biến thủ công truyền thống và công nghệ hiện đại, mang đến những bữa ăn không chỉ chuẩn vị, an toàn mà còn mang lại sự ngạc nhiên và niềm vui.',
      },
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
          'Tại Sakura Restaurant, thực đơn giấy truyền thống được nâng tầm thành một không gian ẩm thực hiển thị ngay trước mắt.',
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
        image: '/about4.png',
      },
      chefStory: {
        eyebrow: 'Đội ngũ bếp chuyên gia',
        title: 'Những Nghệ Nhân Của Hương Vị',
        paragraphs: [
          'Ẩm thực Nhật Bản đòi hỏi tính kỷ luật và sự kiên nhẫn tuyệt đối. Đội ngũ đầu bếp tại Sakura Restaurant được dẫn dắt bởi những bếp trưởng dày dạn kinh nghiệm trong tinh hoa ẩm thực Nhật.',
          'Đối với họ, mỗi lưỡi dao lướt qua đều chứa đựng sự tôn kính với nguyên liệu, mỗi cách bài trí đều tuân theo những quy tắc thẩm mỹ khắt khe.',
        ],
        highlight:
          'Dựa trên triết lý "Ichi-go Ichi-e" (Nhất kỳ nhất hội), trân trọng mỗi cuộc gặp gỡ vì có thể chỉ diễn ra một lần trong đời, đội ngũ của chúng tôi cam kết đặt trọn tâm huyết vào từng món ăn.',
        image: '/about3.png',
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
      tocTitle: 'MỤC LỤC',
      supportTitle: 'Cần hỗ trợ?',
      supportText: 'Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ, vui lòng liên hệ với chúng tôi.',
      supportButtonLabel: 'Liên hệ ngay',
      contentMoreLabel: 'Xem tất cả điều khoản chi tiết bên dưới',
      sections: [
        { id: 'acceptance', number: '01.', title: 'Chấp Thuận Điều Khoản', iconKey: 'file-done' },
        { id: 'service-rules', number: '02.', title: 'Quy Định Sử Dụng Dịch Vụ', iconKey: 'database' },
        { id: 'account', number: '03.', title: 'Tài Khoản Người Dùng', iconKey: 'user' },
        { id: 'booking', number: '04.', title: 'Đặt Bàn & Hủy Đặt Bàn', iconKey: 'bank' },
        { id: 'payment', number: '05.', title: 'Thanh Toán & Hoàn Tiền', iconKey: 'credit-card' },
        { id: 'responsibilities', number: '06.', title: 'Quyền & Trách Nhiệm', iconKey: 'audit' },
        { id: 'content', number: '07.', title: 'Nội Dung Người Dùng', iconKey: 'file-text' },
        { id: 'limitation', number: '08.', title: 'Giới Hạn Trách Nhiệm', iconKey: 'warning' },
        { id: 'changes', number: '09.', title: 'Thay Đổi Điều Khoản', iconKey: 'sync' },
        { id: 'termination', number: '10.', title: 'Chấm Dứt Dịch Vụ', iconKey: 'stop' },
        { id: 'contact', number: '11.', title: 'Liên Hệ', iconKey: 'mail' },
      ],
      acceptanceParagraphs: [
        'Bằng việc truy cập và sử dụng website, ứng dụng Sakura Restaurant, đặt bàn, gọi món, thanh toán hoặc trải nghiệm các tính năng AR, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này.',
      ],
      acceptanceNoticeTitle: 'Lưu ý quan trọng',
      acceptanceNotice:
        'Chúng tôi có quyền cập nhật, chỉnh sửa các điều khoản này bất cứ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với sự chấp thuận của bạn đối với các thay đổi đó.',
      serviceRulesIntro:
        'Sakura Restaurant cung cấp nền tảng đặt bàn, trải nghiệm thực tế tăng cường (AR) và các dịch vụ liên quan cho mục đích cá nhân, phi thương mại. Bạn đồng ý:',
      serviceRules: [
        'Sử dụng dịch vụ đúng mục đích và theo đúng quy định của pháp luật.',
        'Không sử dụng dịch vụ cho mục đích kỹ thuật phá hoại hoặc gây hại nào.',
        'Không can thiệp, làm gián đoạn hoặc gây ảnh hưởng đến hoạt động của hệ thống.',
        'Không sao chép, khai thác hoặc phân phối trái phép nội dung, hình ảnh, dữ liệu món ăn và mô hình 3D.',
      ],
      accountItems: [
        'Bạn có thể cần tạo tài khoản để sử dụng một số tính năng như lưu lịch sử đặt bàn, đơn hàng hoặc tuỳ chọn trải nghiệm AR.',
        'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động xảy ra trong tài khoản của mình.',
        'Vui lòng thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hoạt động trái phép nào.',
      ],
      bookingCards: [
        {
          iconKey: 'bank',
          title: 'Đặt Bàn',
          text: 'Bạn có thể đặt bàn thông qua website/ứng dụng. Thông tin đặt bàn cần chính xác và đầy đủ để nhà hàng chuẩn bị phục vụ.',
        },
        {
          iconKey: 'close-circle',
          title: 'Hủy Đặt Bàn',
          text: 'Bạn có thể hủy đặt bàn theo chính sách của nhà hàng. Một số khung giờ cao điểm hoặc đặt cọc có thể áp dụng phí hủy.',
        },
      ],
      paymentCards: [
        {
          iconKey: 'credit-card',
          title: 'Thanh Toán',
          text: 'Thanh toán có thể được thực hiện bằng tiền mặt, chuyển khoản hoặc cổng thanh toán được hỗ trợ.',
        },
        {
          iconKey: 'sync',
          title: 'Hoàn Tiền',
          text: 'Chính sách hoàn tiền áp dụng theo từng trường hợp cụ thể và sẽ được thông báo khi đặt dịch vụ.',
        },
        {
          iconKey: 'warning',
          title: 'Sự Cố Thanh Toán',
          text: 'Nếu giao dịch phát sinh lỗi, vui lòng liên hệ bộ phận hỗ trợ để được xử lý.',
        },
      ],
      responsibilities: {
        restaurant: {
          title: 'Sakura Restaurant',
          items: [
            'Cung cấp dịch vụ đúng mô tả.',
            'Đảm bảo an toàn thông tin trong quá trình sử dụng dịch vụ.',
            'Hỗ trợ khách hàng khi phát sinh sự cố hợp lý.',
          ],
        },
        user: {
          title: 'Người Dùng',
          items: [
            'Cung cấp thông tin chính xác, trung thực.',
            'Tuân thủ các điều khoản và quy định của dịch vụ.',
            'Không sử dụng dịch vụ để thực hiện hành vi vi phạm pháp luật.',
          ],
        },
      },
      contentParagraphs: [
        'Bất kỳ nội dung nào bạn gửi lên hệ thống, bao gồm đánh giá, bình luận, hình ảnh, yêu cầu hỗ trợ hoặc thông tin đặt bàn, phải hợp pháp, không vi phạm quyền của bên thứ ba và không chứa nội dung xúc phạm, phân biệt đối xử hoặc gây hại.',
        'Sakura Restaurant có quyền xóa hoặc hạn chế hiển thị nội dung không phù hợp mà không cần thông báo trước.',
      ],
      limitationItems: [
        'Dịch vụ được cung cấp trong trạng thái tốt nhất có thể, nhưng không bảo đảm không bao giờ gián đoạn.',
        'Chúng tôi không chịu trách nhiệm cho sự cố phát sinh từ thiết bị, kết nối mạng hoặc thao tác sai của người dùng.',
        'Sakura Restaurant không chịu trách nhiệm đối với thiệt hại ngoài tầm kiểm soát hợp lý của nhà hàng.',
      ],
      changesParagraphs: [
        'Chúng tôi có quyền sửa đổi, bổ sung hoặc thay thế bất kỳ phần nào của Điều khoản dịch vụ này. Các thay đổi sẽ được công bố lại trên trang này và ngày cập nhật mới sẽ được hiển thị rõ ràng.',
      ],
      terminationParagraphs: [
        'Chúng tôi có thể tạm ngừng hoặc chấm dứt quyền truy cập của bạn vào dịch vụ bất kỳ lúc nào nếu phát hiện bạn vi phạm các điều khoản hoặc có hành vi gây ảnh hưởng đến hệ thống và người dùng khác.',
      ],
      contactIntro:
        'Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi qua:',
      contactMethods: [
        { iconKey: 'mail', text: 'contact@sakurarestaurant.vn' },
        { iconKey: 'phone', text: '1900 xxxx' },
      ],
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
        email: 'phunganhvan13122004@gmail.com',
        hotline: '0966 490 431',
        title: 'Cách Thức Ứng Tuyển',
        description:
          'Vui lòng gửi CV và Portfolio nếu có qua email bên dưới với tiêu đề theo cú pháp:',
        subjectFormat: '[ Vị Trí Ứng Tuyển ] - [ Họ Và Tên ]',
        privacyNote:
          'Bằng việc gửi đơn ứng tuyển, bạn đồng ý cho Sakura Restaurant lưu trữ và xử lý thông tin cá nhân của bạn cho mục đích tuyển dụng.',
      },
      featuredJobs: [
        {
          iconKey: 'customer-service',
          title: 'Nhân Viên Phục Vụ & Hướng Dẫn Viên AR',
          type: 'Part-time / Full-time',
          highlights: [
            'Chào đón và phục vụ khách hàng theo tiêu chuẩn Omotenashi.',
            'Hướng dẫn khách sử dụng tính năng AR để trải nghiệm menu tương tác.',
            'Giải đáp thắc mắc về các món ăn và chức năng công nghệ.',
          ],
          goodFit: [
            'Ngoại hình sáng, giao tiếp tốt bằng Anh/V hoặc Nhật là lợi thế.',
            'Quan tâm công nghệ và văn hóa Nhật Bản.',
            'Kỹ năng xử lý tình huống linh hoạt.',
          ],
          benefits: [
            'Mức lương cạnh tranh, service charge và tip.',
            'Đào tạo chuyên sâu về AR và văn hóa ẩm thực Nhật Bản.',
            'Môi trường làm việc hiện đại, năng động.',
          ],
        },
        {
          iconKey: 'shop',
          title: 'Đầu Bếp Chuyên Thớt / Sushi Chef',
          type: 'Full-time',
          highlights: [
            'Đảm nhiệm khu vực Sushi & Sashimi.',
            'Phối hợp cùng bộ phận R&D để phát triển các món ăn mới phù hợp với hình ảnh AR.',
            'Đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm tuyệt đối.',
          ],
          goodFit: [
            'Kinh nghiệm tối thiểu 2 năm ở vị trí tương đương.',
            'Kỹ năng dùng dao điêu luyện, am hiểu về hải sản tươi sống.',
            'Tinh thần sáng tạo, sẵn sàng tiếp thu cái mới.',
          ],
          benefits: [
            'Thu nhập hấp dẫn theo năng lực.',
            'Cơ hội thăng tiến lên bếp trưởng.',
            'Phúc lợi bảo hiểm, đồng phục và các chế độ theo hiện hành.',
          ],
        },
        {
          iconKey: 'code',
          title: 'Thực Tập Sinh Lập Trình Web - Định Hướng AR/WebXR',
          type: 'Internship',
          highlights: [
            'Tham gia phát triển và tối ưu nền tảng Web App của nhà hàng.',
            'Nghiên cứu tích hợp các tính năng WebXR/WebAR trên mobile.',
            'Hỗ trợ xử lý UI và nâng cấp giao diện người dùng.',
          ],
          goodFit: [
            'Sinh viên năm 3, năm 4 chuyên ngành CNTT/Thiết kế tương tác.',
            'Nắm chắc HTML, CSS, JavaScript cơ bản. Biết React/Three.js là lợi thế.',
            'Tư duy logic tốt, tinh thần học hỏi cao.',
          ],
          benefits: [
            'Hỗ trợ chi phí thực tập.',
            'Được mentor bởi các kỹ sư giàu kinh nghiệm.',
            'Cơ hội trở thành nhân viên chính thức sau khi tốt nghiệp.',
          ],
        },
      ],
      extraJobs: [
        {
          iconKey: 'home',
          title: 'Quản Lý Nhà Hàng',
          type: 'Full-time',
          location: 'Hồ Chí Minh',
          description: 'Quản lý vận hành, đội ngũ và trải nghiệm khách hàng theo tiêu chuẩn Sakura.',
        },
        {
          iconKey: 'notification',
          title: 'Nhân Viên Marketing',
          type: 'Full-time',
          location: 'Hồ Chí Minh',
          description: 'Lên kế hoạch truyền thông, quảng bá thương hiệu và các chiến dịch AR.',
        },
        {
          iconKey: 'experiment',
          title: 'Nhân Viên R&D Ẩm Thực',
          type: 'Full-time',
          location: 'Hồ Chí Minh',
          description: 'Nghiên cứu và phát triển món ăn mới kết hợp công nghệ AR và ẩm thực Nhật Bản.',
        },
        {
          iconKey: 'laptop',
          title: 'Nhân Viên IT Support',
          type: 'Full-time',
          location: 'Hồ Chí Minh',
          description: 'Hỗ trợ kỹ thuật hệ thống AR, thiết bị và phần mềm trong nhà hàng.',
        },
        {
          iconKey: 'wallet',
          title: 'Thu Ngân',
          type: 'Part-time',
          location: 'Hồ Chí Minh',
          description: 'Thanh toán, xuất hóa đơn và hỗ trợ khách hàng khi cần thiết.',
        },
        {
          iconKey: 'tool',
          title: 'Tạp Vụ',
          type: 'Part-time',
          location: 'Hồ Chí Minh',
          description: 'Giữ gìn vệ sinh khu vực làm việc, đảm bảo không gian sạch sẽ.',
        },
        {
          iconKey: 'shop',
          title: 'Runner (Phục Vụ Bếp)',
          type: 'Part-time',
          location: 'Hồ Chí Minh',
          description: 'Hỗ trợ vận chuyển món ăn từ bếp ra khu vực phục vụ.',
        },
        {
          iconKey: 'code',
          title: 'Thiết Kế 3D - AR Artist',
          type: 'Full-time',
          location: 'Hồ Chí Minh',
          description: 'Thiết kế mô hình 3D món ăn và hiệu ứng AR ấn tượng cho trải nghiệm khách hàng.',
        },
      ],
      applicationForm: {
        nationalityOptions: ['Việt Nam', 'Nhật Bản', 'Khác'],
        experienceOptions: ['Chưa có kinh nghiệm', 'Dưới 1 năm', '1-2 năm', 'Trên 2 năm'],
        referralOptions: ['Website Sakura', 'Facebook', 'LinkedIn', 'Bạn bè giới thiệu', 'Khác'],
        uploadFormats: 'PDF, DOC, DOCX (Tối đa 5MB)',
        fields: {
          fullName: { label: 'Họ và tên *', placeholder: 'Nhập họ và tên', requiredMessage: 'Vui lòng nhập họ và tên' },
          email: { label: 'Email *', placeholder: 'example@email.com', requiredMessage: 'Vui lòng nhập email', invalidMessage: 'Email không hợp lệ' },
          phone: { label: 'Số điện thoại *', placeholder: '0901 234 567', requiredMessage: 'Vui lòng nhập số điện thoại' },
          birthDate: { label: 'Ngày sinh', placeholder: 'DD/MM/YYYY' },
          address: { label: 'Địa chỉ', placeholder: 'Nhập địa chỉ hiện tại' },
          nationality: { label: 'Quốc tịch', placeholder: 'Chọn quốc tịch' },
          linkedIn: { label: 'LinkedIn (nếu có)', placeholder: 'https://linkedin.com/in/yourprofile' },
          position: { label: 'Vị trí ứng tuyển *', placeholder: 'Chọn vị trí', requiredMessage: 'Vui lòng chọn vị trí ứng tuyển' },
          workType: { label: 'Loại hình công việc *', requiredMessage: 'Vui lòng chọn loại hình công việc' },
          experience: { label: 'Kinh nghiệm làm việc *', placeholder: 'Chọn kinh nghiệm', requiredMessage: 'Vui lòng chọn kinh nghiệm' },
          expectedSalary: { label: 'Mức lương mong muốn', placeholder: 'Nhập mức lương mong muốn' },
          availableStartDate: { label: 'Ngày có thể bắt đầu', placeholder: 'DD/MM/YYYY' },
          referralSource: { label: 'Nguồn thông tin bạn biết đến vị trí này *', placeholder: 'Chọn nguồn', requiredMessage: 'Vui lòng chọn nguồn thông tin' },
          resume: { label: 'CV / Resume *', requiredMessage: 'Vui lòng tải lên CV / Resume' },
          introductionLetter: { label: 'Thư giới thiệu (nếu có)' },
          coverLetter: { placeholder: 'Nhập thư ngỏ của bạn...' },
        },
      },
      ui: {
        jobsTitle: 'Các Vị Trí Đang Tuyển Dụng',
        jobsDescription: 'Khám phá các cơ hội nghề nghiệp hấp dẫn và trở thành một phần của hành trình đổi mới cùng Sakura.',
        showAllJobsLabel: 'Xem tất cả vị trí tuyển dụng',
        collapseJobsLabel: 'Thu gọn vị trí tuyển dụng',
        applyButtonLabel: 'Ứng Tuyển Ngay',
        compactApplyButtonLabel: 'Ứng tuyển',
        jobDescriptionLabel: 'Mô tả công việc:',
        jobRequirementsLabel: 'Yêu cầu:',
        jobBenefitsLabel: 'Quyền lợi:',
        hotlineLabel: 'Hotline',
        applicationSuccessMessage: 'Đã ứng tuyển thành công',
        applicationErrorMessage: 'Gửi ứng tuyển thất bại. Vui lòng thử lại.',
        modalEyebrow: 'Ứng tuyển vị trí',
        modalFallbackTitle: 'Vị trí tuyển dụng',
        personalInfoTitle: 'Thông tin cá nhân',
        applicationInfoTitle: 'Thông tin ứng tuyển',
        applicationFilesTitle: 'Hồ sơ ứng tuyển',
        coverLetterTitle: 'Thư ngỏ (tùy chọn)',
        noteTitle: 'Lưu ý',
        dragUploadText: 'Kéo thả file vào đây hoặc',
        chooseFileLabel: 'Chọn file',
        submitApplicationLabel: 'Gửi Ứng Tuyển',
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
        representative: 'Mr Phung Van',
        email: 'van.pa@tinasoft.vn',
        hotline: '+84 (0) 966 490 431',
      },
      mediaContactLabels: {
        representative: 'Đại diện truyền thông',
        email: 'Email',
        hotline: 'Hotline (Press only)',
      },
      overviewCards: [
        {
          iconKey: 'safety-certificate',
          title: 'Về Sakura Restaurant',
          text: 'Sakura là biểu tượng của sự giao thoa tinh tế giữa nghệ thuật ẩm thực Nhật Bản truyền thống và công nghệ tương tác hiện đại.',
        },
        {
          iconKey: 'calendar',
          title: 'Thành lập',
          value: '2024',
        },
        {
          iconKey: 'share-alt',
          title: 'Mô hình',
          value: 'Fine Dining & AR Experience',
        },
        {
          title: 'Công nghệ cốt lõi',
          value: 'AR Menu & Projection Mapping',
          featured: true,
        },
      ],
      logoAssets: [
        { label: 'Primary Red', brandClass: 'text-[#e0001d]', bgClass: 'bg-white', format: 'SVG' },
        { label: 'Monochrome Dark', brandClass: 'text-[#111111]', bgClass: 'bg-white', format: 'SVG' },
        { label: 'Monochrome Light', brandClass: 'text-white', bgClass: 'bg-[#101010]', format: 'SVG' },
      ],
      mediaAssets: [
        {
          title: 'Nghệ Thuật Ẩm Thực',
          text: 'Độ phân giải cao. Chụp chuẩn cho sử dụng in ấn và digital.',
          image: '/presskit/sushi.png',
          format: 'JPG',
        },
        {
          title: 'Kiến Trúc Không Gian',
          text: 'Nội thất mang phong cách The Modern Ikikaitone.',
          image: '/presskit/canhSushi.png',
          format: 'JPG',
        },
      ],
      usageGuides: [
        {
          iconKey: 'check-circle',
          title: 'Quyền sử dụng',
          text: 'Tất cả tài nguyên trong Press Kit này được cấp phép sử dụng cho mục đích biên tập, báo chí và truyền thông liên quan đến Sakura Restaurant.',
        },
        {
          iconKey: 'apartment',
          title: 'Tỷ lệ & Khoảng trống',
          text: 'Vui lòng không thay đổi tỷ lệ, bóp méo logo hoặc thêm các hiệu ứng không có trong bộ nhận diện chuẩn.',
        },
        {
          iconKey: 'camera',
          title: 'Ghi nhận bản quyền',
          text: 'Khi xuất bản hình ảnh, video và tài liệu, vui lòng ghi rõ nguồn: “Hình ảnh & Video: Sakura Restaurant”.',
        },
      ],
      brandAssetsSection: {
        title: 'Tài Sản Thương Hiệu',
        logoHeading: 'Logo & Định Dạng',
        logoDescription: 'Tải xuống các phiên bản logo chính thức của Sakura Restaurant.',
        mediaHeading: 'Hình Ảnh Báo Chí',
        mediaDescription: 'Tải liệu hình ảnh chất lượng cao phục vụ truyền thông và báo chí.',
        mediaActionLabel: 'Tải toàn bộ bộ ảnh',
        usageHeading: 'Hướng Dẫn Sử Dụng',
      },
      contactCta: {
        title: 'Liên Hệ Truyền Thông',
        description:
          'Cần thêm thông tin, phỏng vấn hoặc yêu cầu trải nghiệm đặc biệt? Đội ngũ truyền thông của chúng tôi luôn sẵn sàng hỗ trợ.',
        actionLabel: 'Liên hệ ngay',
        backgroundImage: '/presskit/bg%20foot.png',
      },
    },
  },
];

function createNotFoundError() {
  const error = new Error('Không tìm thấy trang static');
  error.status = 404;
  return error;
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function mergeMissing(targetValue, sourceValue) {
  if (targetValue == null) return sourceValue;
  if (sourceValue == null) return targetValue;

  if (Array.isArray(sourceValue)) {
    return Array.isArray(targetValue) ? targetValue : sourceValue;
  }

  if (isPlainObject(sourceValue)) {
    const next = { ...(isPlainObject(targetValue) ? targetValue : {}) };
    for (const [key, value] of Object.entries(sourceValue)) {
      next[key] = mergeMissing(next[key], value);
    }
    return next;
  }

  return targetValue === undefined ? sourceValue : targetValue;
}

export async function ensureStaticPages() {
  await Promise.all(
    STATIC_PAGE_DEFAULTS.map(async (page) => {
      const defaultContent = {
        ...(page.content || {}),
        translations: {
          ...((page.content || {}).translations || {}),
          ...(STATIC_PAGE_TRANSLATIONS[page.slug] || {}),
        },
      };
      const defaultPage = { ...page, content: defaultContent };
      const existing = await StaticPageContent.findOne({ slug: page.slug });

      if (!existing) {
        await StaticPageContent.create(defaultPage);
        return;
      }

      const mergedContent = mergeMissing(existing.content || {}, defaultPage.content || {});
      const nextLabel = existing.label || defaultPage.label;

      if (
        JSON.stringify(mergedContent) !== JSON.stringify(existing.content || {}) ||
        nextLabel !== existing.label
      ) {
        existing.label = nextLabel;
        existing.content = mergedContent;
        await existing.save();
      }
    })
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
