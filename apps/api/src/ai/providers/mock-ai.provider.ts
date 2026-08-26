import { Injectable, Logger } from '@nestjs/common';
import {
  AiChatMessage,
  AiProvider,
  GeneratedItinerary,
  ItineraryActivity,
  ItineraryDay,
  PackingItemSuggestion,
  PackingListInput,
  TripItineraryInput,
} from '../ai.types';
import { computeBudgetBreakdown, type BudgetTier } from '../budget';

interface Template {
  title: string;
  description: string;
  location: string;
  costPerPerson: number;
  transport: string;
  category: string;
}

const LOW_TEMPLATES: Template[] = [
  {
    title: 'Dạo bộ quanh trung tâm và ăn sáng quán bình dân',
    description: 'Bắt đầu ngày với bánh mì/bún phở quán cóc địa phương, đi bộ ngắm phố phường.',
    location: 'Khu trung tâm',
    costPerPerson: 60_000,
    transport: 'Đi bộ',
    category: 'FOOD',
  },
  {
    title: 'Tham quan điểm check-in miễn phí nổi tiếng',
    description: 'Một địa danh biểu tượng của thành phố, không mất vé vào cổng.',
    location: 'Quảng trường trung tâm',
    costPerPerson: 30_000,
    transport: 'Đi bộ',
    category: 'SIGHTSEEING',
  },
  {
    title: 'Khám phá chợ địa phương',
    description: 'Mua sắm trái cây tươi, đồ ăn vặt đường phố với giá bình dân.',
    location: 'Chợ truyền thống',
    costPerPerson: 80_000,
    transport: 'Xe máy/Xe buýt',
    category: 'SHOPPING',
  },
  {
    title: 'Bảo tàng công cộng / di tích lịch sử',
    description: 'Vào cổng tự do, tìm hiểu văn hoá địa phương.',
    location: 'Bảo tàng / di tích',
    costPerPerson: 50_000,
    transport: 'Xe buýt',
    category: 'CULTURE',
  },
  {
    title: 'Workshop trải nghiệm tại làng nghề',
    description: 'Làng nghề truyền thống, học làm gốm/dệt với phí hỗ trợ nhỏ.',
    location: 'Làng nghề',
    costPerPerson: 120_000,
    transport: 'Xe khách',
    category: 'CULTURE',
  },
  {
    title: 'Ăn tối tại chợ đêm',
    description: 'Ăn vặt và món địa phương giá rẻ tại chợ đêm.',
    location: 'Chợ đêm',
    costPerPerson: 150_000,
    transport: 'Xe máy',
    category: 'FOOD',
  },
  {
    title: 'Phố đi bộ ban đêm',
    description: 'Dạo chơi phố đi bộ, nghe nhạc đường phố, không mất phí.',
    location: 'Phố đi bộ',
    costPerPerson: 50_000,
    transport: 'Đi bộ',
    category: 'NIGHTLIFE',
  },
];

const MID_TEMPLATES: Template[] = [
  {
    title: 'Ăn sáng nhà hàng địa phương được đánh giá cao',
    description: 'Quán ăn sáng chất lượng cao, không gian thoải mái.',
    location: 'Nhà hàng trung tâm',
    costPerPerson: 180_000,
    transport: 'Grab',
    category: 'FOOD',
  },
  {
    title: 'Tour tham quan nửa ngày có hướng dẫn viên',
    description: 'Tour nhóm nhỏ với hướng dẫn viên bản địa, đi các điểm nổi bật.',
    location: 'Điểm xuất phát tour',
    costPerPerson: 400_000,
    transport: 'Xe du lịch',
    category: 'SIGHTSEEING',
  },
  {
    title: 'Spa/massage thư giãn 90 phút',
    description: 'Liệu trình massage truyền thống giữa ngày.',
    location: 'Spa uy tín',
    costPerPerson: 450_000,
    transport: 'Grab',
    category: 'RELAX',
  },
  {
    title: 'Bữa trưa hải sản tại nhà hàng nổi tiếng',
    description: 'Nhà hàng hải sản view đẹp, được review tốt trên các nền tảng.',
    location: 'Nhà hàng hải sản',
    costPerPerson: 350_000,
    transport: 'Grab',
    category: 'FOOD',
  },
  {
    title: 'Workshop chuyên sâu (nấu ăn / làm gốm)',
    description: 'Workshop chuyên nghiệp với nghệ nhân, bao gồm nguyên liệu và sản phẩm mang về.',
    location: 'Studio',
    costPerPerson: 500_000,
    transport: 'Grab',
    category: 'CULTURE',
  },
  {
    title: 'Bữa tối fine-dining khu trung tâm',
    description: 'Nhà hàng fine-dining hoặc rooftop view đẹp, set menu.',
    location: 'Nhà hàng rooftop',
    costPerPerson: 800_000,
    transport: 'Grab',
    category: 'FOOD',
  },
  {
    title: 'Show diễn / buổi hoà nhạc buổi tối',
    description: 'Show diễn nghệ thuật hoặc buổi hoà nhạc acoustic.',
    location: 'Nhà hát / phòng trà',
    costPerPerson: 350_000,
    transport: 'Grab',
    category: 'NIGHTLIFE',
  },
];

const HIGH_TEMPLATES: Template[] = [
  {
    title: 'Ăn sáng tại khách sạn 5 sao / villa riêng',
    description: 'Bữa sáng gourmet riêng tư trong phòng hoặc bên hồ bơi.',
    location: 'Khách sạn/Villa',
    costPerPerson: 600_000,
    transport: 'Đã bao gồm',
    category: 'FOOD',
  },
  {
    title: 'Tour riêng (private tour) cả ngày',
    description: 'Xe riêng, hướng dẫn viên riêng, lịch trình tuỳ chỉnh.',
    location: 'Đón tại khách sạn',
    costPerPerson: 2_500_000,
    transport: 'Xe riêng',
    category: 'SIGHTSEEING',
  },
  {
    title: 'Trải nghiệm yacht / thuyền riêng nửa ngày',
    description: 'Yacht riêng với đồ uống và đồ ăn nhẹ phục vụ.',
    location: 'Cảng / bến du thuyền',
    costPerPerson: 3_500_000,
    transport: 'Yacht riêng',
    category: 'ADVENTURE',
  },
  {
    title: 'Spa đẳng cấp resort 5 sao',
    description: 'Liệu trình spa cao cấp 2-3 giờ trong resort.',
    location: 'Spa resort',
    costPerPerson: 1_800_000,
    transport: 'Grab',
    category: 'RELAX',
  },
  {
    title: 'Bữa trưa Michelin / nhà hàng chef’s table',
    description: 'Set menu Michelin hoặc chef’s table, gồm pairing rượu.',
    location: 'Nhà hàng fine-dining',
    costPerPerson: 2_000_000,
    transport: 'Grab',
    category: 'FOOD',
  },
  {
    title: 'Trải nghiệm độc quyền (helicopter tour / hot air balloon)',
    description: 'Tour độc quyền trên không hoặc khám phá hang động riêng.',
    location: 'Sân bay / điểm hẹn',
    costPerPerson: 5_000_000,
    transport: 'Helicopter riêng',
    category: 'ADVENTURE',
  },
  {
    title: 'Bữa tối fine-dining 7-course có sommelier',
    description: 'Menu 7 món với sommelier chọn rượu.',
    location: 'Nhà hàng Michelin',
    costPerPerson: 3_500_000,
    transport: 'Grab',
    category: 'FOOD',
  },
  {
    title: 'Rooftop bar / club VIP đêm',
    description: 'Rooftop bar cao cấp với cocktail signature và view toàn cảnh.',
    location: 'Rooftop bar',
    costPerPerson: 1_200_000,
    transport: 'Grab',
    category: 'NIGHTLIFE',
  },
];

const TIME_SLOTS: Record<string, string> = {
  MORNING: '08:30',
  AFTERNOON: '13:30',
  EVENING: '19:00',
};

function pickPool(tier: BudgetTier): Template[] {
  switch (tier) {
    case 'backpacker':
    case 'budget':
      return LOW_TEMPLATES;
    case 'mid':
      return MID_TEMPLATES;
    case 'premium':
    case 'luxury':
      return HIGH_TEMPLATES;
  }
}

function buildActivity(
  time: string,
  template: Template,
  destination: string,
): ItineraryActivity {
  return {
    time,
    title: template.title,
    description: template.description,
    location: template.location,
    estimatedCost: `${template.costPerPerson.toLocaleString('vi-VN')} VND/người`,
    transport: template.transport,
    imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(
      destination,
    )}`,
    category: template.category,
  };
}

const TIER_TIPS: Record<BudgetTier, string[]> = {
  backpacker: [
    'Đặt phòng hostel/nhà nghỉ sớm để có giá tốt nhất.',
    'Ăn tại quán bình dân và chợ đêm để tiết kiệm chi phí ăn uống.',
    'Ưu tiên đi bộ, xe buýt công cộng hoặc xe máy thuê để tiết kiệm di chuyển.',
  ],
  budget: [
    'Khách sạn 2-3 sao giá tầm trung là lựa chọn hợp lý.',
    'Đặt phòng trước 1-2 tuần để có giá tốt hơn.',
    'Kết hợp ăn quán bình dân với một vài bữa nhà hàng trung cấp.',
  ],
  mid: [
    'Khách sạn 3-4 sao, có thể chọn phòng có view đẹp.',
    'Đặt tour nửa ngày để có trải nghiệm đáng tiền.',
    'Mang theo đồ đã phối sẵn để giảm chi phí đồ lót/quần áo.',
  ],
  premium: [
    'Khách sạn 4-5 sao, ưu tiên resort có hồ bơi và spa.',
    'Đặt private tour để được cá nhân hoá lịch trình.',
    'Mang theo trang phục phù hợp nhà hàng fine-dining.',
  ],
  luxury: [
    'Ưu tiên villa riêng hoặc suite hạng sang của khách sạn 5 sao trở lên.',
    'Đặt trước trải nghiệm độc quyền (yacht, helicopter, private guide) vì lịch kín nhanh.',
    'Yêu cầu butler/concierge đặt trước các nhà hàng Michelin và show đặc biệt.',
  ],
};

const TIER_THEMES: Record<BudgetTier, string[]> = {
  backpacker: [
    'Khám phá tiết kiệm',
    'Đi bộ và chợ đêm',
    'Văn hoá bình dân',
    'Hoạt động miễn phí',
  ],
  budget: [
    'Khám phá giá rẻ',
    'Điểm nổi bật thành phố',
    'Ẩm thực địa phương',
    'Mua sắm bình dân',
  ],
  mid: [
    'Khám phá cân bằng',
    'Văn hoá và ẩm thực',
    'Trải nghiệm đáng nhớ',
    'Nghỉ dưỡng nhẹ nhàng',
  ],
  premium: [
    'Trải nghiệm đẳng cấp',
    'Ẩm thực fine-dining',
    'Spa và riêng tư',
    'Di sản và nghệ thuật',
  ],
  luxury: [
    'Độc quyền và riêng tư',
    'Fine-dining và sommelier',
    'Yacht và helicopter',
    'Nghỉ dưỡng đẳng cấp',
  ],
};

@Injectable()
export class MockAiProvider implements AiProvider {
  private readonly logger = new Logger('MockAiProvider');

  async generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary> {
    const destination = input.destination.trim() || 'Điểm đến';
    const breakdown = computeBudgetBreakdown(input);

    this.logger.log(
      `MockAiProvider generating ${breakdown.days} day(s) for ${destination} | budget ${breakdown.totalLabel} (~${breakdown.perPersonPerDayLabel}/người/ngày, tier=${breakdown.tier})`,
    );

    const pool = pickPool(breakdown.tier);
    const themes = TIER_THEMES[breakdown.tier];
    const days: ItineraryDay[] = [];
    // Use the day's perPersonPerDay cap to scale activity count
    // Backpacker: 2 activities/day, mid: 3 activities, premium+: 3-4 activities
    const activitiesPerDay = breakdown.tier === 'backpacker' ? 2 : 3;

    for (let i = 0; i < breakdown.days; i += 1) {
      const date = new Date(input.startDate);
      date.setDate(date.getDate() + i);
      const dateLabel = date.toISOString().slice(0, 10);

      // Cycle templates deterministically, but for premium/luxury we offset by day
      // so consecutive days don't repeat the same activity.
      const morningIdx = (i * 3 + 0) % pool.length;
      const afternoonIdx = (i * 3 + 1) % pool.length;
      const eveningIdx = (i * 3 + 2) % pool.length;

      const morning = buildActivity(TIME_SLOTS.MORNING, pool[morningIdx], destination);

      const activities: ItineraryActivity[] = [morning];
      if (activitiesPerDay >= 3) {
        const afternoon = buildActivity(TIME_SLOTS.AFTERNOON, pool[afternoonIdx], destination);
        const evening = buildActivity(TIME_SLOTS.EVENING, pool[eveningIdx], destination);
        activities.push(afternoon, evening);
      }

      const dayCostPerPerson = activities.reduce(
        (sum, a) =>
          sum +
          Number(
            (a.estimatedCost || '0').replace(/[^0-9]/g, '') || 0,
          ),
        0,
      );

      days.push({
        day: i + 1,
        date: dateLabel,
        theme: themes[i % themes.length],
        activities,
        // Help downstream consumers reason about the day total without parsing strings.
        ...({
          dayCostPerPerson,
        } as object),
      } as ItineraryDay);
    }

    const totalPerPerson = days.reduce(
      (sum, d) =>
        sum +
        ((d as unknown as { dayCostPerPerson?: number }).dayCostPerPerson ?? 0),
      0,
    );

    const summary =
      breakdown.days > 1
        ? `Kế hoạch ${breakdown.days} ngày cho ${destination} với ngân sách ${breakdown.totalLabel} (${breakdown.tier === 'backpacker' ? 'tiết kiệm' : breakdown.tier === 'budget' ? 'bình dân' : breakdown.tier === 'mid' ? 'trung bình khá' : breakdown.tier === 'premium' ? 'cao cấp' : 'sang trọng'}). Tổng chi ước tính ~${totalPerPerson.toLocaleString('vi-VN')} VND/người.`
        : `Kế hoạch một ngày cho ${destination}, ngân sách ${breakdown.totalLabel} (${breakdown.tier}).`;

    return {
      title: `${breakdown.days} ngày tại ${destination}`,
      summary,
      coverImage: `https://source.unsplash.com/1200x800/?${encodeURIComponent(destination)}`,
      days,
      tips: TIER_TIPS[breakdown.tier],
    };
  }

  async chat(messages: AiChatMessage[]): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const userText = (lastUser?.content ?? '').toLowerCase();

    let reply: string;
    if (/da nang|danang/.test(userText)) {
      reply =
        'Da Nang co Bien My Khe, Ba Na Hills, Pho co Hoi An gan do, va Ngu Hanh Son. Ban nen o 3-4 ngay, di Bana mot ngay va di Hoi An mot buoi toi de xem den long.';
    } else if (/ha long|halong/.test(userText)) {
      reply =
        'Ha Long Bay noi tieng voi hang tram dao da va hang Luon. Tour 1 ngay tu Hang Gai re hon, con tour 2 ngay 1 dem tren du thuyen se trai nghiem dang nho hon.';
    } else if (/phu quoc|phuquoc/.test(userText)) {
      reply =
        'Phu Quoc co VinWonders, Grand World, Bai Sao, va di tu mua gan do. Thoi gian ly tuong la 4 ngay 3 dem, nen o khu Bai Truong de tien di lai.';
    } else if (/sai gon|ho chi minh|tp.hcm|hcm/.test(userText)) {
      reply =
        'TP.HCM co Dinh Doc Lap, Nha tho Duc Ba, Ben Thanh, va cho dem. Nen di pho di bo Nguyen Hue vao buoi toi, an banh mi o quan 1 la kinh dien.';
    } else if (/nha trang/.test(userText)) {
      reply =
        'Nha Trang co Vinpearl, Thap Ponagar, va cac dao. Nen di tour 4 dao 1 ngay, toi di cho dem an hai san.';
    } else if (/hue/.test(userText)) {
      reply =
        'Hue co Dai Noi, Lang Minh Mang, va am thuc rat dang thu. Nen di thuyen song Huong mot buoi chieu de cam nhan khong khi.';
    } else if (/visa|thị thuc|passport/.test(userText)) {
      reply =
        'Hieu nho: nhieu nuoc mien visa cho VN (Thai Lan, Singapore, Indonesia, Malaysia...). Khi can visa, dat truoc it nhat 2-4 tuan vi xu ly cham.';
    } else if (/chi phi|gia|ngansach|ngan sach|tiền|tien|đặt phòng|dat phong/.test(userText)) {
      reply =
        'Mot chuyen di noi dia trung binh 2-3 trieu VND/nguoi cho 3 ngay 2 dem (khach san 3-4* + di chuyen + an uong). Bay quoc te them 3-10 trieu tuy diem den.';
    } else {
      reply =
        'Cam on ban da hoi! Day la phan hoi mau (AI chua duoc cau hinh). Ban co the dat AI_API_KEY trong file .env de nhan cau tra loi that tu Gemini hoac OpenAI.';
    }

    this.logger.log(`MockAiProvider.chat -> "${reply.slice(0, 60)}..."`);
    return reply;
  }

  async generatePackingList(input: PackingListInput): Promise<PackingItemSuggestion[]> {
    const dest = (input.destination || '').toLowerCase();
    const days = Math.max(1, input.daysCount);
    const travelers = Math.max(1, input.travelers);
    const pref = (input.preferences || '').toLowerCase();

    const isBeach = /(bien|beach|dao|phu quoc|nha trang|halong|ha long|hai|sea)/.test(dest);
    const isCold = /(snow|tuyet|sapa|ha giang|dong bang|alps|rocky|hokkaido)/.test(dest);
    const isHike = /(trekking|leo|nui|mountain|sapa|ha giang|y ty|tam dao)/.test(dest);
    const isCity = /(ha noi|hanoi|ho chi minh|hcm|sai gon|da nang|hue|tokyo|seoul|singapore|bangkok|kuala|london|paris)/.test(dest);
    const wantsCamera = /(anh|photo|may anh|instagram|landscape|sunset|check.?in)/.test(pref);

    const base: PackingItemSuggestion[] = [
      { name: 'CMND/CCCD hoặc Hộ chiếu', category: 'Giấy tờ', quantity: 1 },
      { name: 'Bảo hiểm du lịch (bản in/ảnh)', category: 'Giấy tờ', quantity: 1 },
      { name: 'Vé máy bay/tàu (bản in)', category: 'Giấy tờ', quantity: 1 },
      { name: 'Đặt phòng khách sạn', category: 'Giấy tờ', quantity: 1 },
      { name: 'Tiền mặt + thẻ ATM', category: 'Giấy tờ', quantity: 1 },

      { name: 'Áo thun', category: 'Trang phục', quantity: Math.min(7, days) },
      { name: 'Quần short', category: 'Trang phục', quantity: Math.min(5, Math.ceil(days / 2)) },
      { name: 'Quần dài', category: 'Trang phục', quantity: Math.max(1, Math.ceil(days / 3)) },
      { name: 'Đồ lót', category: 'Trang phục', quantity: days + 1 },
      { name: 'Tất/vớ', category: 'Trang phục', quantity: days + 1 },
      { name: 'Áo khoác nhẹ', category: 'Trang phục', quantity: 1 },

      { name: 'Bàn chải + kem đánh răng', category: 'Cá nhân', quantity: 1 },
      { name: 'Dầu gội/sữa tắm (size nhỏ)', category: 'Cá nhân', quantity: 1 },
      { name: 'Khăn mặt', category: 'Cá nhân', quantity: 1 },
      { name: 'Kem chống nắng', category: 'Cá nhân', quantity: 1 },
      { name: 'Son dưỡng môi', category: 'Cá nhân', quantity: 1 },

      { name: 'Thuốc cá nhân thường dùng', category: 'Sức khoẻ', quantity: 1 },
      { name: 'Băng cá nhân + thuốc sát trùng', category: 'Sức khoẻ', quantity: 1 },
      { name: 'Khẩu trang', category: 'Sức khoẻ', quantity: 1 },
      { name: 'Thuốc chống say xe', category: 'Sức khoẻ', quantity: 1 },

      { name: 'Điện thoại + sạc', category: 'Điện tử', quantity: 1 },
      { name: 'Pin dự phòng', category: 'Điện tử', quantity: 1 },
      { name: 'Tai nghe', category: 'Điện tử', quantity: 1 },
      { name: 'Adapter sạc', category: 'Điện tử', quantity: 1 },
    ];

    if (isBeach) {
      base.push(
        { name: 'Đồ bơi', category: 'Trang phục', quantity: travelers },
        { name: 'Khăn tắm biển', category: 'Cá nhân', quantity: 1 },
        { name: 'Dép xỏ ngón', category: 'Trang phục', quantity: 1 },
        { name: 'Kính bơi + ống thở', category: 'Cá nhân', quantity: 1 },
        { name: 'Túi chống nước cho điện thoại', category: 'Điện tử', quantity: 1 },
      );
    }
    if (isCold) {
      base.push(
        { name: 'Áo khoác dày', category: 'Trang phục', quantity: 1 },
        { name: 'Găng tay + khăn quàng cổ', category: 'Trang phục', quantity: 1 },
        { name: 'Mũ len', category: 'Trang phục', quantity: 1 },
        { name: 'Kem dưỡng ẩm', category: 'Cá nhân', quantity: 1 },
      );
    }
    if (isHike) {
      base.push(
        { name: 'Giày leo núi', category: 'Trang phục', quantity: 1 },
        { name: 'Gậy trekking', category: 'Điện tử', quantity: 1 },
        { name: 'Ba lô leo núi', category: 'Trang phục', quantity: 1 },
        { name: 'Đèn pin/đèn đeo đầu', category: 'Điện tử', quantity: 1 },
        { name: 'Áo mưa nhẹ', category: 'Trang phục', quantity: 1 },
      );
    }
    if (isCity) {
      base.push(
        { name: 'Giày thể thao thoải mái', category: 'Trang phục', quantity: 1 },
        { name: 'Bản đồ offline (Google Maps)', category: 'Điện tử', quantity: 1 },
      );
    }
    if (wantsCamera) {
      base.push(
        { name: 'Máy ảnh + ống kính', category: 'Điện tử', quantity: 1 },
        { name: 'Pin máy ảnh dự phòng', category: 'Điện tử', quantity: 2 },
        { name: 'Thẻ nhớ', category: 'Điện tử', quantity: 1 },
        { name: 'Chân máy (tripod mini)', category: 'Điện tử', quantity: 1 },
      );
    }

    const seen = new Set<string>();
    return base.filter((item) => {
      const key = `${item.name.toLowerCase()}|${item.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}