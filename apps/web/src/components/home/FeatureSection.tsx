import { useTranslation } from 'react-i18next';

interface Feature {
  id: string;
  icon: JSX.Element;
  title: string;
  description: string;
}

const ICON_CLS = 'h-6 w-6';

const CompassIcon = () => (
  <svg className={ICON_CLS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2.6 6.3-6.3 2.6 2.6-6.3z" strokeLinejoin="round" />
  </svg>
);

const SparkIcon = () => (
  <svg className={ICON_CLS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WalletIcon = () => (
  <svg className={ICON_CLS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M16 12h2" strokeLinecap="round" />
  </svg>
);

const MapIcon = () => (
  <svg className={ICON_CLS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" strokeLinejoin="round" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

const ShieldIcon = () => (
  <svg className={ICON_CLS} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M12 3 4 6v6c0 5 3.5 8.4 8 9 4.5-.6 8-4 8-9V6z" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function FeatureSection() {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      id: 'ai-smart',
      icon: <SparkIcon />,
      title: t('home.f1Title', 'Gợi ý lịch trình'),
      description: t('home.f1Desc', 'AI phân tích sở thích và đề xuất lộ trình phù hợp.'),
    },
    {
      id: 'time-saving',
      icon: <CompassIcon />,
      title: t('home.f2Title', 'Tiết kiệm thời gian'),
      description: t('home.f2Desc', 'Hoàn tất kế hoạch trong vài phút thay vì hàng giờ.'),
    },
    {
      id: 'personalized',
      icon: <MapIcon />,
      title: t('home.f3Title', 'Cá nhân hóa'),
      description: t('home.f3Desc', 'Mỗi hành trình được điều chỉnh theo phong cách riêng.'),
    },
    {
      id: 'realtime',
      icon: <WalletIcon />,
      title: t('home.f4Title', 'Quản lý chi phí'),
      description: t('home.f4Desc', 'Theo dõi ngân sách dự kiến và chi tiêu thực tế.'),
    },
    {
      id: 'security',
      icon: <ShieldIcon />,
      title: t('home.f5Title', 'Chia sẻ riêng tư'),
      description: t('home.f5Desc', 'Mời bạn đồng hành hoặc chia sẻ qua đường dẫn công khai.'),
    },
  ];

  return (
    <section
      id="features"
      className="px-6 sm:px-12 lg:px-16 xl:px-24 py-24 bg-slate-50 dark:bg-slate-900/40"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {t('home.featuresTitle', 'Mọi thứ bạn cần cho một chuyến đi')}
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {t(
              'home.featuresSubtitle',
              'Từ lên ý tưởng đến đặt chỗ, theo dõi chi phí và đi cùng bạn bè — tất cả trong một nơi.',
            )}
          </p>
        </div>

        <div className="mt-12 grid gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900 p-6 flex flex-col gap-3"
            >
              <div className="text-sky-700 dark:text-sky-400">{f.icon}</div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}