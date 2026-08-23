import { PrismaClient, RecCategory, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedItineraryDay {
  day: number;
  date: string;
  activities: Array<{
    time: string;
    title: string;
    description: string;
    location: string;
  }>;
}

interface SeedRecommendation {
  title: string;
  description: string;
  destination: string;
  image: string;
  category: RecCategory;
  price: number;
  rating: number;
  reviewCount: number;
  content: string;
}

const buildItineraryJson = (
  destination: string,
  days: SeedItineraryDay[],
): string => JSON.stringify({ destination, days });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@travelmind.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Admin';

  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: adminHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const demoUserHash = await bcrypt.hash('User@123456', 10);
  await prisma.user.upsert({
    where: { email: 'user@travelmind.local' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'user@travelmind.local',
      password: demoUserHash,
      role: UserRole.USER,
    },
  });

  const recommendations: SeedRecommendation[] = [
    {
      title: 'Hà Nội 3 ngày - Hồn Phố Cổ',
      description:
        'Khám phá 36 phố phường, bún chả phố cổ, hồ Hoàn Kiếm và những quán cà phê mang đậm dấu ấn thủ đô.',
      destination: 'Hà Nội',
      image:
        'https://images.unsplash.com/photo-1509923939220-5ddc4d18fa07?w=1200&q=80',
      category: 'CULTURE',
      price: 2800000,
      rating: 4.7,
      reviewCount: 256,
      content: buildItineraryJson('Hà Nội', [
        {
          day: 1,
          date: 'Ngày 1 - Phố Cổ & Hồ Hoàn Kiếm',
          activities: [
            {
              time: '07:30',
              title: 'Cà phê trứng & bánh mì',
              description:
                'Bắt đầu buổi sáng bằng cà phê trứng đặc trưng và ổ bánh mì nóng giòn ngay trung tâm.',
              location: 'Cà phê Giảng, Hà Nội',
            },
            {
              time: '09:00',
              title: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn',
              description:
                'Đi bộ quanh hồ, tham quan cầu Thê Húc và đền Ngọc Sơn - biểu tượng nghìn năm văn hiến.',
              location: 'Hồ Hoàn Kiếm',
            },
            {
              time: '11:30',
              title: 'Ăn trưa phố cổ',
              description:
                'Thử phở bò Hà Nội chính gốc hoặc bún chả Hàng Mành.',
              location: 'Phố Hàng Bông',
            },
            {
              time: '14:00',
              title: 'Văn Miếu - Quốc Tử Giám',
              description:
                'Tham quan trường đại học đầu tiên của Việt Nam, chiêm ngưỡng 82 bia Tiến sĩ.',
              location: 'Văn Miếu, Quốc Tử Giám',
            },
            {
              time: '19:00',
              title: 'Múa rối nước',
              description:
                'Xem buổi biểu diễn múa rối nước - nghệ thuật dân gian độc đáo ven sông Hồng.',
              location: 'Nhà hát Thăng Long',
            },
          ],
        },
        {
          day: 2,
          date: 'Ngày 2 - Lăng Chủ Tịch & Hồ Tây',
          activities: [
            {
              time: '08:00',
              title: 'Lăng Chủ Tịch Hồ Chí Minh',
              description:
                'Viếng lăng Bác, xem lễ thượng cờ. Trang phục lịch sự, không chụp ảnh bên trong.',
              location: 'Quảng trường Ba Đình',
            },
            {
              time: '10:30',
              title: 'Chùa Trấn Quốc',
              description:
                'Ngôi chùa cổ nhất Hà Nội nằm trên đảo nhỏ giữa Hồ Tây - thanh tịnh và nhiều góc chụp đẹp.',
              location: 'Hồ Tây',
            },
            {
              time: '13:00',
              title: 'Ăn trưa bún ốc & bánh tôm',
              description:
                'Bún ốc nguội + bánh tôm chiên giòn đặc sản Hồ Tây.',
              location: 'Phố Hàng Bún',
            },
            {
              time: '15:30',
              title: 'Đi bộ quanh Hồ Tây',
              description:
                'Thuê xe đạp đi 1 vòng hồ - lộng gió, view tuyệt vời lúc chiều tà.',
              location: 'Hồ Tây',
            },
          ],
        },
        {
          day: 3,
          date: 'Ngày 3 - Làng nghề & Ẩm thực đêm',
          activities: [
            {
              time: '09:00',
              title: 'Làng gốm Bát Tràng',
              description:
                'Trải nghiệm nặn gốm, mua đồ thủ công mỹ nghệ làm quà.',
              location: 'Làng Bát Tràng',
            },
            {
              time: '13:00',
              title: 'Phở cuốn Hà Nội',
              description:
                'Bữa trưa nhẹ nhàng: phở cuốn, nem cua bể ở Ngũ Xá.',
              location: 'Phố Ngũ Xá',
            },
            {
              time: '18:00',
              title: 'Phố Tạ Hiện beer street',
              description:
                'Khám phá "Khuya không ngủ" - nhâm nhi bia hơi và các món nhậu đường phố.',
              location: 'Phố Tạ Hiện',
            },
          ],
        },
      ]),
    },
    {
      title: 'Đà Lạt 3 ngày - Cao Nguyên Mộng Mơ',
      description:
        'Thành phố sương mù với rừng thông, hoa đào, biệt thự cổ và những quán cà phê view đồi.',
      destination: 'Đà Lạt, Lâm Đồng',
      image:
        'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1200&q=80',
      category: 'NATURE',
      price: 3200000,
      rating: 4.9,
      reviewCount: 412,
      content: buildItineraryJson('Đà Lạt', [
        {
          day: 1,
          date: 'Ngày 1 - Trung tâm thành phố',
          activities: [
            {
              time: '07:30',
              title: 'Cà phê ven hồ Xuân Hương',
              description:
                'Cà phê sáng với view hồ Xuân Hương và bồ câu bay - không gian yên bình đặc trưng Đà Lạt.',
              location: 'Hồ Xuân Hương',
            },
            {
              time: '09:30',
              title: 'Crazy House - Hằng Nga Guesthouse',
              description:
                'Khám phá công trình kiến trúc surreal của kiến trúc sư Đặng Việt Nga - như lạc vào rừng cổ tích.',
              location: 'Crazy House',
            },
            {
              time: '12:00',
              title: 'Ăn trưa lẩu gà lá é',
              description:
                'Lẩu gà lá é Đà Lạt - hương vị núi rừng Tây Nguyên.',
              location: 'Khu Hồ Xuân Hương',
            },
            {
              time: '14:30',
              title: 'Ga xe lửa Đà Lạt',
              description:
                'Khám phá nhà ga cổ từ thời Pháp, chụp ảnh check-in với đoàn tàu hoa hồng.',
              location: 'Ga Đà Lạt',
            },
            {
              time: '17:00',
              title: 'Chợ đêm Đà Lạt',
              description:
                'Thưởng thức bánh tráng nướng, sữa đậu nành nóng và mua đặc sản: mứt, hoa tươi, len.',
              location: 'Chợ đêm Đà Lạt',
            },
          ],
        },
        {
          day: 2,
          date: 'Ngày 2 - Thác & Đồi thông',
          activities: [
            {
              time: '07:00',
              title: 'Đồi cỏ hồng (Sunrise)',
              description:
                'Đón bình minh giữa đồi cỏ hồng lãng mạn - điểm sống ảo không thể bỏ lỡ mùa thu đông.',
              location: 'Đồi cỏ hồng phường 11',
            },
            {
              time: '10:00',
              title: 'Thác Datanla',
              description:
                'Đi xe trượt máng + chèo thuyền kayak dưới thác. Rất phù hợp cho gia đình và cặp đôi.',
              location: 'Thác Datanla',
            },
            {
              time: '13:00',
              title: 'Ăn trưa cơm lam gà nướng',
              description:
                'Cơm lam - đặc sản vùng cao, ăn kèm gà nướng xối mỡ và rau rừng.',
              location: 'Bản Cù Chầu',
            },
            {
              time: '15:00',
              title: 'Làng hoa Vạn Thành',
              description:
                'Check-in vườn hoa lớn nhất Đà Lạt, ngắm hàng trăm loài hoa khoe sắc.',
              location: 'Làng hoa Vạn Thành',
            },
          ],
        },
        {
          day: 3,
          date: 'Ngày 3 - Biệt thự cổ & Cà phê view',
          activities: [
            {
              time: '08:30',
              title: 'Dinh Bảo Đại',
              description:
                'Tham quan dinh thự mùa hè của vua Bảo Đại - kiến trúc Pháp giữa rừng thông.',
              location: 'Dinh Bảo Đại',
            },
            {
              time: '11:00',
              title: 'Tu viện Dục Uyên',
              description:
                'Tu viện linh thiêng, view tầng tầng lớp lớp trên đồi.',
              location: 'Phường 5',
            },
            {
              time: '13:00',
              title: 'Ăn trưa bánh ướt lòng gà',
              description: 'Bữa trưa dân dã mà đậm chất Đà Lạt.',
              location: 'Chợ Đà Lạt',
            },
            {
              time: '15:00',
              title: 'Quán cà phê rooftop view đồi thông',
              description:
                'Cà phê nóng, ngồi ngắm mây trôi qua cửa kính. Kết thúc chuyến đi 3 ngày hoàn hảo.',
              location: 'Khu Hồ Tùng Mậu',
            },
          ],
        },
      ]),
    },
    {
      title: 'Hội An 4 ngày - Phố Cổ Đèn Lồng',
      description:
        'Phố cổ UNESCO, ẩm thực miền Trung, làng rau Trà Quế, biển An Bàng và may đo may áo dài.',
      destination: 'Hội An, Quảng Nam',
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
      category: 'CULTURE',
      price: 4500000,
      rating: 4.8,
      reviewCount: 198,
      content: buildItineraryJson('Hội An', [
        {
          day: 1,
          date: 'Ngày 1 - Phố Cổ đèn lồng',
          activities: [
            {
              time: '08:00',
              title: 'Cao lầu & Cà phê',
              description:
                'Cao lầu chính gốc Hội An, cà phê Phố Cổ - bắt đầu ngày mới trên đường Nguyễn Huệ.',
              location: 'Cao Lầu Lễ Hội',
            },
            {
              time: '09:30',
              title: 'Phố cổ Hội An - Di sản UNESCO',
              description:
                'Tham quan Hội quán Quảng Đông, Phúc Kiến, chùa Cầu, nhà cổ Tấn Ký.',
              location: 'Phố Cổ Hội An',
            },
            {
              time: '14:00',
              title: 'Xưởng may áo dài Bảo Mẫu',
              description:
                'Đo và may áo dài may đo chỉ từ 1-2 ngày - kỷ niệm độc đáo từ Hội An.',
              location: 'Bảo Mẫu - Trần Phú',
            },
            {
              time: '18:30',
              title: 'Đèn lồng sông Hoài',
              description:
                'Đi thuyền sông Hoài, thả đèn hoa đăng và ngắm phố cổ lung linh về đêm.',
              location: 'Sông Hoài',
            },
          ],
        },
        {
          day: 2,
          date: 'Ngày 2 - Làng nghề & Tra Quế',
          activities: [
            {
              time: '08:00',
              title: 'Làng rau Trà Quế',
              description:
                'Trải nghiệm cầy cuốc, tưới rau, nấu bữa trưa bài bản cùng nông dân địa phương.',
              location: 'Làng rau Trà Quế',
            },
            {
              time: '13:00',
              title: 'Ăn trưa canh rau Trà Quế',
              description:
                'Cơm niêu + 8 món rau Trà Quế nấu dân dã. Tự tay hái và nấu.',
              location: 'Trà Quế',
            },
            {
              time: '15:00',
              title: 'Làng mộc Kim Bồng',
              description:
                'Xem nghệ nhân chạm khắc gỗ thuyền, thúng - nghề cổ 700 năm.',
              location: 'Kim Bồng',
            },
            {
              time: '19:00',
              title: 'White Rose & Bánh xèo',
              description:
                'Bánh bao bánh vạc đặc sản + bánh xèo giòn Hội An.',
              location: 'Phố Ẩm Thực',
            },
          ],
        },
        {
          day: 3,
          date: 'Ngày 3 - Biển An Bàng & Cù Lao Chàm',
          activities: [
            {
              time: '08:00',
              title: 'Biển An Bàng',
              description:
                'Tắm biển, nằm phơi nắng, dùng bữa sáng tại các quán ven biển kiểu resort.',
              location: 'Biển An Bàng',
            },
            {
              time: '10:00',
              title: 'Cù Lao Chàm',
              description:
                'Đi cano 30 phút. Lặn ngắm san hô, tham quan Bãi Chồng, Bãi Ông, Khu bảo tồn.',
              location: 'Cù Lao Chàm',
            },
            {
              time: '19:00',
              title: 'Buffet hải sản ven sông',
              description:
                'Buffet hải sản tươi sống ven sông Hoài giá bình dân, view đèn lồng.',
              location: 'Nhà hàng Sông Hoài',
            },
          ],
        },
        {
          day: 4,
          date: 'Ngày 4 - Mỹ Sơn hoặc rời đi',
          activities: [
            {
              time: '08:00',
              title: 'Thánh địa Mỹ Sơn',
              description:
                'Di tích Chăm Pa 1000 năm, đền tháp gạch giữa thung lũng - tour nửa ngày.',
              location: 'Mỹ Sơn',
            },
            {
              time: '13:00',
              title: 'Mua sắm & Cà phê',
              description:
                'Mua đặc sản: nước mắm Phú Sỹ, bánh đậu xanh, vải may.',
              location: 'Hội An',
            },
          ],
        },
      ]),
    },
    {
      title: 'Phú Quốc 5 ngày - Đảo Ngọc Resort',
      description:
        'Biển xanh cát trắng, lặn san hô Hòn Thơm, Bãi Sao, VinWonders và ẩm thực hải sản tươi sống.',
      destination: 'Phú Quốc, Kiên Giang',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      category: 'BEACH',
      price: 6800000,
      rating: 4.9,
      reviewCount: 312,
      content: buildItineraryJson('Phú Quốc', [
        {
          day: 1,
          date: 'Ngày 1 - Di chuyển & Nghỉ dưỡng',
          activities: [
            {
              time: '10:00',
              title: 'Di chuyển tới resort',
              description:
                'Taxi/Grab từ sân bay Phú Quốc về resort ở Bãi Trường hoặc Bãi Khem (~30 phút).',
              location: 'Sân bay Phú Quốc',
            },
            {
              time: '13:00',
              title: 'Check-in & Ăn trưa',
              description:
                'Ăn hải sản tươi sống: ghẹ, ốc, sò ngay tại resort hoặc nhà hàng gần biển.',
              location: 'Bãi Trường',
            },
            {
              time: '16:00',
              title: 'Tắm biển hoàng hôn',
              description:
                'Bơi trong hồ bơi resort hoặc đi dọc bờ biển ngắm hoàng hôn đầu tiên.',
              location: 'Bãi Trường',
            },
          ],
        },
        {
          day: 2,
          date: 'Ngày 2 - Bãi Sao - Địa điểm đẹp nhất',
          activities: [
            {
              time: '08:30',
              title: 'Bãi Sao',
              description:
                'Bãi biển đẹp nhất Phú Quốc: cát trắng mịn, nước xanh ngọc. Tắm thỏa thích.',
              location: 'Bãi Sao',
            },
            {
              time: '11:30',
              title: 'Ăn trưa giá treo trên biển',
              description:
                'Nhà hàng làng chài Mỹ Thanh - hải sản vừa đánh bắt vừa chế biến.',
              location: 'Làng chài Mỹ Thanh',
            },
            {
              time: '14:30',
              title: 'Nhà tù Phú Quốc',
              description:
                'Di tích lịch sử - nhà tù lớn nhất miền Nam. Cảm xúc và ý nghĩa.',
              location: 'Nhà tù Phú Quốc',
            },
            {
              time: '19:00',
              title: 'Dinh Cậu - Sunset',
              description:
                'Địa điểm ngắm hoàng hôn huyền thoại, kết hợp chợ đêm Dinh Cậu.',
              location: 'Dinh Cậu',
            },
          ],
        },
        {
          day: 3,
          date: 'Ngày 3 - Hòn Thơm - Cáp treo dài nhất',
          activities: [
            {
              time: '08:00',
              title: 'Cáp treo Hòn Thơm',
              description:
                'Cáp treo dài nhất thế giới (7.9km) vượt biển từ An Thới ra Hòn Thơm. View cực phẩm.',
              location: 'Ga cáp treo An Thới',
            },
            {
              time: '10:00',
              title: 'VinWonders / Vinpearl Safari',
              description:
                'Công viên giải trí đảo Hòn Thơm: aqua park, games, hoặc Safari ở Bắc đảo.',
              location: 'Hòn Thơm / Bắc đảo',
            },
            {
              time: '19:00',
              title: 'Grand World - Phố đêm',
              description:
                'Tham quan "Thành phố không ngủ" với cổng chào Venice, show nhạc nước.',
              location: 'Grand World',
            },
          ],
        },
        {
          day: 4,
          date: 'Ngày 4 - Lặn san hô & Đảo nhỏ',
          activities: [
            {
              time: '07:30',
              title: 'Tour 4 đảo / 3 đảo',
              description:
                'Lặn snorkel ở Hòn Móng Tay, Hòn Gầm Ghì. Cát vàng sa mạc giữa biển cực hiếm.',
              location: 'Hòn Móng Tay',
            },
            {
              time: '12:00',
              title: 'Ăn trưa trên đảo',
              description:
                'Cơm tấm với cá chiên, mực nướng, canh chua - bữa trưa đậm chất biển đảo.',
              location: 'Đảo nhỏ',
            },
            {
              time: '16:00',
              title: 'Chợ đêm Phú Quốc',
              description:
                'Thử bánh tráng cuốn cá mực, gỏi cá trích, nước mía lau. Rẻ mà ngon.',
              location: 'Chợ đêm Dinh Cậu',
            },
          ],
        },
        {
          day: 5,
          date: 'Ngày 5 - Suối Tranh & Ra sân bay',
          activities: [
            {
              time: '08:30',
              title: 'Suối Tranh',
              description:
                'Suối khoáng tự nhiên giữa rừng - tắm mát, leo thác nhẹ.',
              location: 'Suối Tranh',
            },
            {
              time: '11:00',
              title: 'Mua đặc sản',
              description:
                'Nước mắm Phú Quốc, tiêu, sim rừng, sữa ong chúa - đặc sản nổi tiếng quốc gia.',
              location: 'Chợ Dương Đông',
            },
            {
              time: '14:00',
              title: 'Di chuyển ra sân bay',
              description: 'Kết thúc chuyến đi 5 ngày đầy kỷ niệm.',
              location: 'Sân bay Phú Quốc',
            },
          ],
        },
      ]),
    },
  ];

  for (const rec of recommendations) {
    const existing = await prisma.recommendation.findFirst({
      where: { title: rec.title },
    });
    if (existing) {
      await prisma.recommendation.update({
        where: { id: existing.id },
        data: { ...rec, isPublished: true },
      });
    } else {
      await prisma.recommendation.create({
        data: { ...rec, isPublished: true },
      });
    }
  }

  await seedHeroSlides();

  console.log('Seed completed (Vietnamese).');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log('Demo User: user@travelmind.local / User@123456');
  console.log(`Recommendations seeded: ${recommendations.length}`);
}

async function seedHeroSlides() {
  const existing = await prisma.heroSlide.count();
  if (existing > 0) {
    console.log(`Hero slides already present (${existing}), skipping.`);
    return;
  }
  const defaults = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80',
    'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=1400&q=80',
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=1400&q=80',
  ];
  await Promise.all(
    defaults.map((url, idx) =>
      prisma.heroSlide.create({
        data: { imageUrl: url, sortOrder: idx, isActive: true },
      }),
    ),
  );
  console.log(`Hero slides seeded: ${defaults.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
