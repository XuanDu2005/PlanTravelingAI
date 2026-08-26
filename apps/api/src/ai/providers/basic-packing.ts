import { PackingItemSuggestion, PackingListInput } from '../ai.types';

const BASE_PACKING: Array<Omit<PackingItemSuggestion, 'quantity'>> = [
  { name: 'CMND/CCCD hoặc Hộ chiếu', category: 'Giấy tờ' },
  { name: 'Bảo hiểm du lịch', category: 'Giấy tờ' },
  { name: 'Vé máy bay/tàu (bản in/ảnh)', category: 'Giấy tờ' },
  { name: 'Xác nhận đặt phòng khách sạn', category: 'Giấy tờ' },
  { name: 'Tiền mặt + thẻ ATM', category: 'Giấy tờ' },

  { name: 'Áo thun', category: 'Trang phục' },
  { name: 'Quần short', category: 'Trang phục' },
  { name: 'Quần dài', category: 'Trang phục' },
  { name: 'Đồ lót', category: 'Trang phục' },
  { name: 'Tất/vớ', category: 'Trang phục' },
  { name: 'Áo khoác nhẹ', category: 'Trang phục' },

  { name: 'Bàn chải + kem đánh răng', category: 'Cá nhân' },
  { name: 'Dầu gội/sữa tắm (size nhỏ)', category: 'Cá nhân' },
  { name: 'Khăn mặt', category: 'Cá nhân' },
  { name: 'Kem chống nắng', category: 'Cá nhân' },
  { name: 'Son dưỡng môi', category: 'Cá nhân' },
  { name: 'Khăn giấy/khăn ướt', category: 'Cá nhân' },

  { name: 'Thuốc cá nhân thường dùng', category: 'Sức khoẻ' },
  { name: 'Băng cá nhân + thuốc sát trùng', category: 'Sức khoẻ' },
  { name: 'Khẩu trang', category: 'Sức khoẻ' },
  { name: 'Thuốc chống say xe', category: 'Sức khoẻ' },

  { name: 'Điện thoại + sạc', category: 'Điện tử' },
  { name: 'Pin dự phòng', category: 'Điện tử' },
  { name: 'Tai nghe', category: 'Điện tử' },
  { name: 'Adapter sạc', category: 'Điện tử' },
];

function applyQuantities(days: number, travelers: number): PackingItemSuggestion[] {
  return BASE_PACKING.map((item) => {
    const lower = item.name.toLowerCase();
    let quantity = 1;
    if (lower.includes('áo thun')) quantity = Math.min(7, days);
    else if (lower.includes('quần short')) quantity = Math.min(5, Math.max(1, Math.ceil(days / 2)));
    else if (lower.includes('quần dài')) quantity = Math.max(1, Math.ceil(days / 3));
    else if (lower.includes('đồ lót')) quantity = days + 1;
    else if (lower.includes('tất/vớ') || lower.includes('tất')) quantity = days + 1;
    else if (lower.includes('khẩu trang')) quantity = Math.max(2, Math.ceil(days / 2));
    else if (lower.includes('bàn chải')) quantity = Math.max(1, travelers);
    return { ...item, quantity };
  });
}

function addContextualItems(
  list: PackingItemSuggestion[],
  destination: string,
  preferences: string,
  travelers: number,
): PackingItemSuggestion[] {
  const dest = destination.toLowerCase();
  const pref = preferences.toLowerCase();

  const isBeach = /(bien|beach|dao|phu quoc|nha trang|halong|ha long|hai|sea)/.test(dest);
  const isCold = /(snow|tuyet|sapa|ha giang|dong bang|alps|rocky|hokkaido)/.test(dest);
  const isHike = /(trekking|leo nui|mountain|sapa|ha giang|y ty|tam dao)/.test(dest);
  const isCity = /(ha noi|hanoi|ho chi minh|hcm|sai gon|da nang|hue|tokyo|seoul|singapore|bangkok|kuala|london|paris)/.test(dest);
  const wantsCamera = /(anh|photo|may anh|instagram|landscape|sunset|check.?in)/.test(pref);
  const hasKids = /(tre em|con nho|con gai|con trai|kid|family)/.test(pref);
  const isInternational = /(nuoc ngoai|quoc te|abroad|international|nhat|han|trung|thai|my|chau)/.test(dest);

  const items: PackingItemSuggestion[] = [];

  if (isBeach) {
    items.push(
      { name: 'Đồ bơi', category: 'Trang phục', quantity: travelers },
      { name: 'Khăn tắm biển', category: 'Cá nhân', quantity: 1 },
      { name: 'Dép xỏ ngón', category: 'Trang phục', quantity: 1 },
      { name: 'Kính bơi + ống thở', category: 'Cá nhân', quantity: 1 },
      { name: 'Túi chống nước cho điện thoại', category: 'Điện tử', quantity: 1 },
    );
  }
  if (isCold) {
    items.push(
      { name: 'Áo khoác dày', category: 'Trang phục', quantity: 1 },
      { name: 'Găng tay + khăn quàng cổ', category: 'Trang phục', quantity: 1 },
      { name: 'Mũ len', category: 'Trang phục', quantity: 1 },
      { name: 'Kem dưỡng ẩm', category: 'Cá nhân', quantity: 1 },
    );
  }
  if (isHike) {
    items.push(
      { name: 'Giày leo núi', category: 'Trang phục', quantity: 1 },
      { name: 'Gậy trekking', category: 'Điện tử', quantity: 1 },
      { name: 'Ba lô leo núi', category: 'Trang phục', quantity: 1 },
      { name: 'Đèn pin/đèn đeo đầu', category: 'Điện tử', quantity: 1 },
      { name: 'Áo mưa nhẹ', category: 'Trang phục', quantity: 1 },
    );
  }
  if (isCity) {
    items.push(
      { name: 'Giày thể thao thoải mái', category: 'Trang phục', quantity: 1 },
      { name: 'Bản đồ offline (Google Maps)', category: 'Điện tử', quantity: 1 },
    );
  }
  if (wantsCamera) {
    items.push(
      { name: 'Máy ảnh + ống kính', category: 'Điện tử', quantity: 1 },
      { name: 'Pin máy ảnh dự phòng', category: 'Điện tử', quantity: 2 },
      { name: 'Thẻ nhớ', category: 'Điện tử', quantity: 1 },
      { name: 'Chân máy (tripod mini)', category: 'Điện tử', quantity: 1 },
    );
  }
  if (hasKids) {
    items.push(
      { name: 'Đồ ăn vặt cho bé', category: 'Sức khoẻ', quantity: 1 },
      { name: 'Khăn ướt + tã dự phòng', category: 'Cá nhân', quantity: 1 },
    );
  }
  if (isInternational) {
    items.push(
      { name: 'Passport còn hạn > 6 tháng', category: 'Giấy tờ', quantity: 1 },
      { name: 'Bảo hiểm quốc tế (Worldwide)', category: 'Giấy tờ', quantity: 1 },
      { name: 'Đổi ngoại tệ', category: 'Giấy tờ', quantity: 1 },
      { name: 'Sim/quốc tế hoặc eSIM', category: 'Điện tử', quantity: 1 },
    );
  }

  return [...list, ...items];
}

/**
 * Build a comprehensive "basic" packing checklist using only static rules
 * (no AI calls). Used as the fallback for every provider so the user ALWAYS
 * receives a usable checklist, even when the AI call fails or returns an
 * empty / unparseable payload.
 */
export function buildBasicPackingList(input: PackingListInput): PackingItemSuggestion[] {
  const days = Math.max(1, input.daysCount);
  const travelers = Math.max(1, input.travelers);

  const base = applyQuantities(days, travelers);
  const withContext = addContextualItems(base, input.destination ?? '', input.preferences ?? '', travelers);

  // De-duplicate by (name lower | category) to keep the list tidy.
  const seen = new Set<string>();
  return withContext.filter((item) => {
    const key = `${item.name.toLowerCase()}|${item.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
