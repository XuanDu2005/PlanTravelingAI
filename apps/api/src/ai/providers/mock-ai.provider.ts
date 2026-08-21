import { Injectable, Logger } from '@nestjs/common';
import {
  AiChatMessage,
  AiProvider,
  GeneratedItinerary,
  ItineraryActivity,
  ItineraryDay,
  TripItineraryInput,
} from '../ai.types';

const MORNING_TEMPLATES: Array<Omit<ItineraryActivity, 'time'>> = [
  {
    title: 'An sang tai quan cafe dia phuong',
    description: 'Bat dau ngay moi voi diem sang truyen thong va ca phe tuoi.',
    location: 'Quan cafe trung tam',
    estimatedCost: '100.000 VND',
    transport: 'Di bo',
    imageUrl: '',
    category: 'FOOD',
  },
  {
    title: 'Tham quan dia danh noi tieng',
    description: 'Kham pha bieu tuong duoc check-in nhieu nhat cua thanh pho.',
    location: 'Quang truong trung tam',
    estimatedCost: '150.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'SIGHTSEEING',
  },
  {
    title: 'Tour di bo van hoa',
    description: 'Di bo nhe nhang qua cac tuyen pho co va lang nghe huong dan vien.',
    location: 'Khu pho co',
    estimatedCost: '200.000 VND',
    transport: 'Di bo',
    imageUrl: '',
    category: 'CULTURE',
  },
  {
    title: 'Kham pha cho dia phuong',
    description: 'Mua sam tay nghe, trai cay tuoi va an vot duong pho.',
    location: 'Cho trung tam',
    estimatedCost: '150.000 VND',
    transport: 'Xe may',
    imageUrl: '',
    category: 'SHOPPING',
  },
  {
    title: 'Tham bao tang',
    description: 'Hieu them lich su va van hoa cua vung dat.',
    location: 'Bao tang thanh pho',
    estimatedCost: '100.000 VND',
    transport: 'Xe may',
    imageUrl: '',
    category: 'CULTURE',
  },
];

const AFTERNOON_TEMPLATES: Array<Omit<ItineraryActivity, 'time'>> = [
  {
    title: 'Nghi duong giua thien nhien',
    description: 'Chiem nguong canh quan tu mot goc nhin hoac vuon thuc vat.',
    location: 'Doi hoa',
    estimatedCost: '150.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'NATURE',
  },
  {
    title: 'Trai nghiem thuc hanh',
    description: 'Tham gia workshop ngan - nau an, lam gom hoac bia thu cong.',
    location: 'Studio workshop',
    estimatedCost: '300.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'CULTURE',
  },
  {
    title: 'Cafe va hieu sach doc',
    description: 'Buoi chieu yen binh lang qua cac quan cafe va hieu sach indie.',
    location: 'Pho den',
    estimatedCost: '120.000 VND',
    transport: 'Di bo',
    imageUrl: '',
    category: 'RELAX',
  },
  {
    title: 'Thuyen hoac xe dap quanh thanh pho',
    description: 'Kham pha thanh pho tu mot goc nhin moi.',
    location: 'Cau tau',
    estimatedCost: '200.000 VND',
    transport: 'Thuyen',
    imageUrl: '',
    category: 'SIGHTSEEING',
  },
];

const EVENING_TEMPLATES: Array<Omit<ItineraryActivity, 'time'>> = [
  {
    title: 'Khu pho am thuc',
    description: 'Thu cac mon an noi tieng cung huong dan vien dia phuong.',
    location: 'Cho dem',
    estimatedCost: '250.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'FOOD',
  },
  {
    title: 'Bua toi tren san thuong',
    description: 'Bua toi dang nho voi dem thanh pho lung linh.',
    location: 'Nha hang san thuong',
    estimatedCost: '500.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'NIGHTLIFE',
  },
  {
    title: 'Phong tra nhac song',
    description: 'Ket thuc ngay voi do uong va ban nhac acousic.',
    location: 'Quan bar song song',
    estimatedCost: '300.000 VND',
    transport: 'Grab',
    imageUrl: '',
    category: 'NIGHTLIFE',
  },
];

function buildActivity(
  time: string,
  template: Omit<ItineraryActivity, 'time'>,
  destination: string,
): ItineraryActivity {
  return {
    time,
    title: template.title,
    description: template.description,
    location: template.location,
    estimatedCost: template.estimatedCost,
    transport: template.transport,
    imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(
      destination,
    )}`,
    category: template.category,
  };
}

@Injectable()
export class MockAiProvider implements AiProvider {
  private readonly logger = new Logger('MockAiProvider');

  async generateItinerary(input: TripItineraryInput): Promise<GeneratedItinerary> {
    const destination = input.destination.trim() || 'Diem den';
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    const totalDays = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    this.logger.log(
      `MockAiProvider generating ${totalDays} day(s) for ${destination}`,
    );

    const destSlug = encodeURIComponent(
      destination
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-'),
    );

    const days: ItineraryDay[] = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateLabel = date.toISOString().slice(0, 10);

      const morning = buildActivity(
        '08:30',
        MORNING_TEMPLATES[i % MORNING_TEMPLATES.length],
        destination,
      );
      const afternoon = buildActivity(
        '13:30',
        AFTERNOON_TEMPLATES[i % AFTERNOON_TEMPLATES.length],
        destination,
      );
      const evening = buildActivity(
        '19:00',
        EVENING_TEMPLATES[i % EVENING_TEMPLATES.length],
        destination,
      );

      days.push({
        day: i + 1,
        date: dateLabel,
        theme:
          i === 0
            ? 'Kham pha trung tam'
            : i === totalDays - 1
              ? 'Mua sam va khoi hanh'
              : 'Trai nghiem dia phuong',
        activities: [morning, afternoon, evening],
      });
    }

    const summary =
      totalDays > 1
        ? `Ke hoach ${totalDays} ngay can bang cho ${destination}, ket hop van hoa, am thuc va nghi ngoi.`
        : `Ke hoach mot ngay nhịp nhe cho ${destination}, bao gom van hoa, am thuc va canh dep.`;

    return {
      title: `${totalDays} ngay tai ${destination}`,
      summary,
      coverImage: `https://source.unsplash.com/1200x800/?${destSlug}`,
      days,
      tips: [
        'Dat phong khach san truoc it nhat 1-2 tuan de co gia tot.',
        'Mang theo trang phuc thoai mai phu hop voi thoi tiet dia phuong.',
        'Thu tien ich giao tiep dia phuong de trai nghiem au hon.',
      ],
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
}
