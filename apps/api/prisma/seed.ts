import { PrismaClient, RecCategory, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface SeedItineraryDay {
  day: number;
  date: string;
  theme?: string;
  activities: Array<{
    time: string;
    title: string;
    description: string;
    location: string;
    estimatedCost?: string;
    transport?: string;
    imageUrl?: string;
    imageSourceUrl?: string;
    category?: string;
    suggestedPlaces?: Array<{
      name: string;
      address: string;
      specialty: string;
      priceRange: string;
    }>;
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
  minTravelers?: number;
  maxTravelers?: number;
  content: string;
}

const buildItineraryJson = (
  destination: string,
  days: SeedItineraryDay[],
): string => JSON.stringify({
  destination,
  days: days.map((day) => ({
    ...day,
    theme: day.theme ?? day.date.replace(/^Ngày\s+\d+\s*-?\s*/i, ''),
    activities: day.activities.map((activity, index) => {
      const text = `${activity.title} ${activity.description}`.toLowerCase();
      const isFood = /ăn|ẩm thực|cà phê|bánh|phở|bún|hải sản|beer/.test(text);
      const isTransport = /sân bay|di chuyển|xe |tàu|check-in/.test(text);
      const isShopping = /mua|chợ|đặc sản/.test(text);
      const isNightlife = /đêm|bar|bia|beer/.test(text);
      const estimatedCost = isShopping
        ? '300.000 VND/người'
        : isFood
          ? '180.000 VND/người'
          : isTransport
            ? '200.000 VND/người'
            : index === 0
              ? '120.000 VND/người'
              : '150.000 VND/người';

      return {
        ...activity,
        estimatedCost: activity.estimatedCost ?? estimatedCost,
        transport: activity.transport ?? (isTransport ? 'Xe đưa đón' : 'Đi bộ / xe máy'),
        category: activity.category ?? (isFood ? 'FOOD' : isShopping ? 'SHOPPING' : isNightlife ? 'NIGHTLIFE' : isTransport ? 'TRANSPORT' : 'SIGHTSEEING'),
      };
    }),
  })),
});

interface AdditionalJourney {
  title: string;
  description: string;
  destination: string;
  image: string;
  category: RecCategory;
  price: number;
  rating: number;
  reviewCount: number;
  days: number;
  minTravelers: number;
  maxTravelers: number;
  highlights: string[];
  localFood: string;
  tip: string;
}

const CATEGORY_ACTIVITY: Record<RecCategory, string> = {
  NATURE: 'NATURE',
  CULTURE: 'CULTURE',
  RESORT: 'RELAX',
  ADVENTURE: 'NATURE',
  BEACH: 'NATURE',
};

const commonsImage = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1200`;

const DANANG_PLACE_IMAGES: Record<string, { imageUrl: string; sourceUrl: string }> = {
  'Bãi biển Mỹ Khê': {
    imageUrl: commonsImage('My Khe Beach, Da Nang, Vietnam.jpg'),
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:My_Khe_Beach,_Da_Nang,_Vietnam.jpg',
  },
  'Bán đảo Sơn Trà': {
    imageUrl: commonsImage('Da Nang view from top of Son Tra.jpg'),
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Nang_view_from_top_of_Son_Tra.jpg',
  },
  'Ngũ Hành Sơn': {
    imageUrl: commonsImage('Da Nang - coastal view from Marble Mountains Mar 2024 01.jpg'),
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Nang_-_coastal_view_from_Marble_Mountains_Mar_2024_01.jpg',
  },
  'Cầu Rồng': {
    imageUrl: commonsImage('Dragon Bridge at night (Danang) - DSC02098.JPG'),
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dragon_Bridge_at_night_(Danang)_-_DSC02098.JPG',
  },
  'Bà Nà Hills': {
    imageUrl: commonsImage('Golden Bridge at Ba Na Hills 20250718.jpg'),
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Golden_Bridge_at_Ba_Na_Hills_20250718.jpg',
  },
};

const DANANG_DINING_GUIDE = [
  {
    name: 'Mì Quảng Bà Mua',
    address: '19–21 Trần Bình Trọng, Hải Châu, Đà Nẵng',
    specialty: 'Mì Quảng, bánh tráng cuốn thịt heo',
    priceRange: '45.000–90.000 VND/người',
  },
  {
    name: 'Bánh tráng cuốn thịt heo Mậu',
    address: '35 Đỗ Thúc Tịnh, Cẩm Lệ, Đà Nẵng',
    specialty: 'Bánh tráng cuốn thịt heo, mắm nêm',
    priceRange: '70.000–130.000 VND/người',
  },
  {
    name: 'Hải sản Mộc Quán',
    address: '26 Tô Hiến Thành, Phước Mỹ, Sơn Trà, Đà Nẵng',
    specialty: 'Hải sản tươi sống, món miền Trung',
    priceRange: '180.000–350.000 VND/người',
  },
];

const MI_QUANG_IMAGE = {
  imageUrl: commonsImage('Mi Quang 1A Danang.jpg'),
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mi_Quang_1A_Danang.jpg',
};

function buildAdditionalRecommendations(): SeedRecommendation[] {
  const journeys: AdditionalJourney[] = [
    {
      title: 'Ninh Bình 3 ngày - Miền Di Sản Xanh',
      description: 'Đi thuyền Tràng An, chinh phục Hang Múa và thong dong giữa đồng lúa Tam Cốc.',
      destination: 'Ninh Bình',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
      category: 'NATURE', price: 2600000, rating: 4.8, reviewCount: 184, days: 3, minTravelers: 1, maxTravelers: 6,
      highlights: ['Quần thể danh thắng Tràng An', 'Hang Múa', 'Tam Cốc - Bích Động', 'Cố đô Hoa Lư', 'Vườn chim Thung Nham'],
      localFood: 'Cơm cháy và dê núi Ninh Bình', tip: 'Nên đi thuyền buổi sáng và mang giày bám tốt khi leo Hang Múa.',
    },
    {
      title: 'Sa Pa 4 ngày - Mây Núi Tây Bắc',
      description: 'Săn mây Fansipan, trekking bản làng và ngắm ruộng bậc thang giữa núi rừng Tây Bắc.',
      destination: 'Sa Pa, Lào Cai',
      image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?w=1200&q=80',
      category: 'NATURE', price: 4800000, rating: 4.9, reviewCount: 326, days: 4, minTravelers: 1, maxTravelers: 8,
      highlights: ['Đỉnh Fansipan', 'Bản Cát Cát', 'Thung lũng Mường Hoa', 'Đèo Ô Quy Hồ', 'Bản Tả Van'],
      localFood: 'Cá hồi, cá tầm và đồ nướng Sa Pa', tip: 'Mang áo khoác nhẹ vì nhiệt độ thay đổi nhanh giữa ngày và đêm.',
    },
    {
      title: 'Hạ Long 3 ngày - Kỳ Quan Vịnh Xanh',
      description: 'Du thuyền giữa kỳ quan thiên nhiên, chèo kayak và đón bình minh trên vịnh.',
      destination: 'Hạ Long, Quảng Ninh',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
      category: 'NATURE', price: 5900000, rating: 4.8, reviewCount: 271, days: 3, minTravelers: 2, maxTravelers: 10,
      highlights: ['Du thuyền vịnh Hạ Long', 'Hang Sửng Sốt', 'Đảo Ti Tốp', 'Làng chài Cửa Vạn', 'Chèo kayak hang Luồn'],
      localFood: 'Chả mực giã tay và hải sản Hạ Long', tip: 'Đặt cabin có ban công sớm nếu đi vào cuối tuần hoặc mùa cao điểm.',
    },
    {
      title: 'Huế 4 ngày - Dấu Ấn Cố Đô',
      description: 'Chạm vào chiều sâu di sản qua Đại Nội, lăng tẩm, nhã nhạc và ẩm thực cung đình.',
      destination: 'Huế, Thừa Thiên Huế',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
      category: 'CULTURE', price: 3900000, rating: 4.7, reviewCount: 208, days: 4, minTravelers: 1, maxTravelers: 8,
      highlights: ['Đại Nội Huế', 'Chùa Thiên Mụ', 'Lăng Khải Định', 'Lăng Minh Mạng', 'Phố đi bộ bên sông Hương'],
      localFood: 'Bún bò Huế, cơm hến và bánh bèo', tip: 'Thuê áo dài khi tham quan Đại Nội để có bộ ảnh đúng chất cố đô.',
    },
    {
      title: 'Sài Gòn 3 ngày - Nhịp Sống Không Ngủ',
      description: 'Đan xen kiến trúc trăm năm, bảo tàng, cà phê hẻm và nhịp sống đô thị sôi động.',
      destination: 'TP. Hồ Chí Minh',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&q=80',
      category: 'CULTURE', price: 3500000, rating: 4.6, reviewCount: 397, days: 3, minTravelers: 1, maxTravelers: 10,
      highlights: ['Dinh Độc Lập', 'Bưu điện Thành phố', 'Bảo tàng Chứng tích Chiến tranh', 'Chợ Bến Thành', 'Phố đi bộ Nguyễn Huệ'],
      localFood: 'Cơm tấm, bánh mì và cà phê sữa đá', tip: 'Dùng metro và xe buýt điện để di chuyển nhanh giữa các điểm trung tâm.',
    },
    {
      title: 'Đà Nẵng 4 ngày - Biển Xanh Thành Phố',
      description: 'Tắm biển Mỹ Khê, khám phá Sơn Trà, Ngũ Hành Sơn và nhịp đêm bên sông Hàn.',
      destination: 'Đà Nẵng',
      image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80',
      category: 'BEACH', price: 4600000, rating: 4.8, reviewCount: 452, days: 4, minTravelers: 1, maxTravelers: 10,
      highlights: ['Bãi biển Mỹ Khê', 'Bán đảo Sơn Trà', 'Ngũ Hành Sơn', 'Cầu Rồng', 'Bà Nà Hills'],
      localFood: 'Mì Quảng, bánh tráng cuốn thịt heo và hải sản', tip: 'Xem lịch phun lửa Cầu Rồng trước khi sắp xếp buổi tối cuối tuần.',
    },
    {
      title: 'Nha Trang 5 ngày - Nắng Vàng Vịnh Biển',
      description: 'Lặn ngắm san hô, đi đảo, thư giãn suối khoáng và thưởng thức hải sản tươi.',
      destination: 'Nha Trang, Khánh Hòa',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      category: 'BEACH', price: 6200000, rating: 4.7, reviewCount: 338, days: 5, minTravelers: 2, maxTravelers: 12,
      highlights: ['Hòn Mun', 'Vịnh Ninh Vân', 'Tháp Bà Ponagar', 'Bãi Dài', 'Suối khoáng nóng I-Resort'],
      localFood: 'Bún cá, nem nướng và hải sản Nha Trang', tip: 'Mang túi chống nước và dùng kem chống nắng thân thiện với san hô.',
    },
    {
      title: 'Quy Nhơn 4 ngày - Biển Vắng Nắng Trong',
      description: 'Khám phá Kỳ Co, Eo Gió, làng chài và những cung đường biển còn nguyên vẻ hoang sơ.',
      destination: 'Quy Nhơn, Bình Định',
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
      category: 'BEACH', price: 4400000, rating: 4.8, reviewCount: 193, days: 4, minTravelers: 2, maxTravelers: 8,
      highlights: ['Kỳ Co', 'Eo Gió', 'Hòn Khô', 'Tháp Đôi', 'Ghềnh Ráng Tiên Sa'],
      localFood: 'Bánh xèo tôm nhảy và bún chả cá Quy Nhơn', tip: 'Khởi hành ra đảo sớm để biển êm và tránh nắng gắt buổi trưa.',
    },
    {
      title: 'Mũi Né 3 ngày - Nghỉ Dưỡng Miền Cát',
      description: 'Resort bên biển, đồi cát lúc bình minh và những buổi chiều chậm rãi đầy nắng.',
      destination: 'Mũi Né, Bình Thuận',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
      category: 'RESORT', price: 5200000, rating: 4.7, reviewCount: 165, days: 3, minTravelers: 2, maxTravelers: 6,
      highlights: ['Đồi cát trắng', 'Bãi biển Hàm Tiến', 'Suối Tiên', 'Làng chài Mũi Né', 'Spa bên biển'],
      localFood: 'Hải sản làng chài và bánh căn Phan Thiết', tip: 'Đặt xe jeep ngắm bình minh trước một ngày để có khung giờ đẹp.',
    },
    {
      title: 'Hồ Tràm 2 ngày - Cuối Tuần Chữa Lành',
      description: 'Một kỳ nghỉ ngắn với hồ bơi, spa, rừng nguyên sinh và bữa tối bên bờ biển.',
      destination: 'Hồ Tràm, Bà Rịa - Vũng Tàu',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
      category: 'RESORT', price: 3800000, rating: 4.6, reviewCount: 142, days: 2, minTravelers: 2, maxTravelers: 6,
      highlights: ['Resort Hồ Tràm', 'Bãi biển Hồ Cốc', 'Khu bảo tồn Bình Châu - Phước Bửu', 'Suối khoáng Bình Châu'],
      localFood: 'Hải sản Hồ Tràm và lẩu cá đuối', tip: 'Phù hợp chuyến cuối tuần; nên chọn gói có bữa sáng và trả phòng muộn.',
    },
    {
      title: 'Côn Đảo 4 ngày - Tĩnh Lặng Giữa Đại Dương',
      description: 'Nghỉ dưỡng riêng tư, tìm hiểu lịch sử và khám phá những bãi biển trong veo.',
      destination: 'Côn Đảo, Bà Rịa - Vũng Tàu',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
      category: 'RESORT', price: 8900000, rating: 4.9, reviewCount: 119, days: 4, minTravelers: 1, maxTravelers: 6,
      highlights: ['Bãi Đầm Trầu', 'Bãi Nhát', 'Vườn quốc gia Côn Đảo', 'Bảo tàng Côn Đảo', 'Hòn Bảy Cạnh'],
      localFood: 'Ốc vú nàng và cá mú đỏ', tip: 'Đặt vé máy bay sớm và tôn trọng quy định bảo tồn rùa biển.',
    },
    {
      title: 'Phú Yên 4 ngày - Retreat Hoa Vàng Cỏ Xanh',
      description: 'Chậm lại giữa bờ biển thanh bình, resort nhỏ xinh và cảnh quan điện ảnh miền Trung.',
      destination: 'Tuy Hòa, Phú Yên',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
      category: 'RESORT', price: 5100000, rating: 4.8, reviewCount: 136, days: 4, minTravelers: 2, maxTravelers: 8,
      highlights: ['Gành Đá Đĩa', 'Bãi Xép', 'Mũi Điện', 'Vịnh Vũng Rô', 'Tháp Nghinh Phong'],
      localFood: 'Mắt cá ngừ đại dương và sò huyết đầm Ô Loan', tip: 'Thuê xe riêng theo ngày để chủ động dừng ở các cung đường ven biển.',
    },
    {
      title: 'Hà Giang 8 ngày - Cung Đường Đá Nở Hoa',
      description: 'Road trip qua đèo Mã Pì Lèng, cao nguyên đá và những bản làng sát biên giới.',
      destination: 'Hà Giang',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      category: 'ADVENTURE', price: 7900000, rating: 4.9, reviewCount: 287, days: 8, minTravelers: 1, maxTravelers: 8,
      highlights: ['Dốc Thẩm Mã', 'Cột cờ Lũng Cú', 'Đèo Mã Pì Lèng', 'Sông Nho Quế', 'Phố cổ Đồng Văn', 'Dinh Vua Mèo'],
      localFood: 'Thắng dền, cháo ấu tẩu và lợn cắp nách', tip: 'Chỉ tự lái khi có kinh nghiệm đường đèo; luôn kiểm tra phanh trước mỗi chặng.',
    },
    {
      title: 'Phong Nha 5 ngày - Thám Hiểm Vương Quốc Hang Động',
      description: 'Băng rừng, chèo kayak và khám phá hệ thống hang động kỳ vĩ của Quảng Bình.',
      destination: 'Phong Nha, Quảng Bình',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
      category: 'ADVENTURE', price: 7800000, rating: 4.9, reviewCount: 214, days: 5, minTravelers: 2, maxTravelers: 10,
      highlights: ['Động Phong Nha', 'Động Thiên Đường', 'Sông Chày - Hang Tối', 'Thung lũng Sinh Tồn', 'Suối Nước Moọc'],
      localFood: 'Cháo canh và cá trắm sông Son', tip: 'Chuẩn bị giày thoát nước, túi khô và tuân thủ tuyệt đối hướng dẫn an toàn.',
    },
    {
      title: 'Cao Bằng 5 ngày - Biên Cương Hùng Vĩ',
      description: 'Chinh phục thác Bản Giốc, động Ngườm Ngao và cung đường đèo miền Đông Bắc.',
      destination: 'Cao Bằng',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
      category: 'ADVENTURE', price: 5600000, rating: 4.8, reviewCount: 173, days: 5, minTravelers: 2, maxTravelers: 8,
      highlights: ['Thác Bản Giốc', 'Động Ngườm Ngao', 'Núi Mắt Thần', 'Hồ Thang Hen', 'Đèo Mã Phục'],
      localFood: 'Bánh cuốn nước xương và vịt quay bảy vị', tip: 'Mang giấy tờ tùy thân vì một số điểm tham quan nằm gần khu vực biên giới.',
    },
    {
      title: 'Tà Xùa 3 ngày - Săn Mây Trên Sống Lưng Khủng Long',
      description: 'Hành trình ngắn nhưng giàu thử thách với biển mây, đường núi và những điểm ngắm sao.',
      destination: 'Tà Xùa, Sơn La',
      image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1200&q=80',
      category: 'ADVENTURE', price: 3200000, rating: 4.7, reviewCount: 156, days: 3, minTravelers: 2, maxTravelers: 6,
      highlights: ['Sống lưng khủng long', 'Mỏm cá heo', 'Cây cô đơn', 'Đỉnh Gió', 'Thảo nguyên Tà Xùa'],
      localFood: 'Lợn bản nướng và cơm lam', tip: 'Theo dõi dự báo mây và tránh chạy xe máy khi đường trơn hoặc sương mù dày.',
    },
  ];

  return journeys.map((journey) => {
    const activityCategory = CATEGORY_ACTIVITY[journey.category];
    const isDanang = journey.destination === 'Đà Nẵng';
    const days: SeedItineraryDay[] = Array.from({ length: journey.days }, (_, index) => {
      const first = journey.highlights[(index * 2) % journey.highlights.length];
      const second = journey.highlights[(index * 2 + 1) % journey.highlights.length];
      const firstImage = isDanang ? DANANG_PLACE_IMAGES[first] : undefined;
      const secondImage = isDanang ? DANANG_PLACE_IMAGES[second] : undefined;
      const featuredRestaurant = isDanang
        ? DANANG_DINING_GUIDE[index % DANANG_DINING_GUIDE.length]
        : undefined;
      return {
        day: index + 1,
        date: `Ngày ${index + 1} - ${first}`,
        theme: `${first} & ${second}`,
        activities: [
          { time: '07:30', title: `Khởi đầu ngày mới tại ${first}`, description: `Tận hưởng buổi sáng và khám phá những góc đẹp nhất tại ${first}.`, location: first, estimatedCost: '150.000 VND', transport: 'Xe đưa đón', category: activityCategory, imageUrl: firstImage?.imageUrl, imageSourceUrl: firstImage?.sourceUrl },
          { time: '11:30', title: featuredRestaurant ? `Ăn trưa tại ${featuredRestaurant.name}` : `Thưởng thức ${journey.localFood}`, description: featuredRestaurant ? `Gợi ý địa phương nổi tiếng để thưởng thức ${featuredRestaurant.specialty}. Có thể chọn thêm các quán bên dưới theo vị trí và ngân sách.` : `Dừng chân dùng bữa với món địa phương đặc trưng của ${journey.destination}.`, location: featuredRestaurant ? `${featuredRestaurant.name}, ${featuredRestaurant.address}` : journey.destination, estimatedCost: featuredRestaurant?.priceRange ?? '250.000 VND', transport: 'Đi bộ', category: 'FOOD', imageUrl: isDanang ? MI_QUANG_IMAGE.imageUrl : undefined, imageSourceUrl: isDanang ? MI_QUANG_IMAGE.sourceUrl : undefined, suggestedPlaces: isDanang ? DANANG_DINING_GUIDE : undefined },
          { time: '14:00', title: `Khám phá ${second}`, description: `Dành buổi chiều trải nghiệm cảnh quan, văn hóa và các hoạt động nổi bật tại ${second}.`, location: second, estimatedCost: '300.000 VND', transport: 'Xe đưa đón', category: activityCategory, imageUrl: secondImage?.imageUrl, imageSourceUrl: secondImage?.sourceUrl },
          { time: '18:30', title: 'Tự do khám phá về đêm', description: `Thư giãn, dạo phố và cảm nhận nhịp sống buổi tối tại ${journey.destination}.`, location: journey.destination, estimatedCost: '300.000 VND', transport: 'Đi bộ', category: 'NIGHTLIFE' },
        ],
      };
    });

    return {
      title: journey.title,
      description: journey.description,
      destination: journey.destination,
      image: journey.image,
      category: journey.category,
      price: journey.price,
      rating: journey.rating,
      reviewCount: journey.reviewCount,
      minTravelers: journey.minTravelers,
      maxTravelers: journey.maxTravelers,
      content: JSON.stringify({
        title: journey.title,
        summary: journey.description,
        destination: journey.destination,
        coverImage: journey.image,
        days,
        tips: [journey.tip, 'Chuẩn bị giấy tờ cá nhân, bảo hiểm du lịch và kiểm tra thời tiết trước ngày khởi hành.', 'Tôn trọng văn hóa địa phương và hạn chế đồ nhựa dùng một lần.'],
      }),
    };
  });
}

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
    ...buildAdditionalRecommendations(),
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
