import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminService, recommendationService } from '@/services';
import { Recommendation } from '@/types';
import LoadingState from '@/components/LoadingState';

interface Props {
  mode: 'create' | 'edit';
}

const sampleContent = JSON.stringify(
  {
    title: '3 ngày ở Đà Lạt',
    summary: 'Kế hoạch cuối tuần cân bằng ở thành phố cao nguyên sương mù.',
    days: [
      {
        day: 1,
        date: '2026-01-01',
        activities: [
          {
            time: '08:00',
            title: 'Cà phê ven hồ',
            description: 'Khởi đầu buổi sáng với một ly cà phê Việt Nam.',
            location: 'Hồ Xuân Hương',
          },
          {
            time: '10:00',
            title: 'Crazy House',
            description: 'Khám phá kiến trúc siêu thực.',
            location: 'Crazy House',
          },
          {
            time: '19:00',
            title: 'Ăn tối ở chợ đêm',
            description: 'Thử lẩu và rượu vang Đà Lạt.',
            location: 'Chợ đêm Đà Lạt',
          },
        ],
      },
      {
        day: 2,
        date: '2026-01-02',
        activities: [
          {
            time: '09:00',
            title: 'Đi bộ trong rừng thông',
            description: 'Đi bộ nhẹ qua các đồi thông.',
            location: 'Rừng Bidoup',
          },
        ],
      },
    ],
  },
  null,
  2,
);

export default function AdminRecommendationFormPage({ mode }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    destination: '',
    image: '',
    content: '',
    isPublished: false,
  });
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    setLoading(true);
    recommendationService
      .byId(id)
      .then((rec: Recommendation) => {
        setForm({
          title: rec.title,
          description: rec.description,
          destination: rec.destination,
          image: rec.image,
          content: JSON.stringify(rec.content ?? sampleContent, null, 2),
          isPublished: rec.isPublished,
        });
      })
      .catch(() => toast.error(t('admin.loadError')))
      .finally(() => setLoading(false));
  }, [id, mode, t]);

  if (loading) return <LoadingState message={t('admin.formLoading')} />;

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(form.content || sampleContent);
      const payload = {
        title: form.title,
        description: form.description,
        destination: form.destination,
        image: form.image,
        content: JSON.stringify(parsed),
        isPublished: form.isPublished,
      };
      setSubmitting(true);
      if (mode === 'create') {
        await adminService.createRecommendation(payload);
        toast.success(t('admin.createSuccess'));
      } else if (id) {
        await adminService.updateRecommendation(id, payload);
        toast.success(t('admin.updateSuccess'));
      }
      navigate('/admin/recommendations');
    } catch (err) {
      const msg =
        err instanceof SyntaxError ? t('admin.jsonError') : t('admin.saveError');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">

      {/* Form Card */}
      <form
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-4 sm:p-6 space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin.fieldTitle')}
            </label>
            <input
              required
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin.fieldDestination')}
            </label>
            <input
              required
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              value={form.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin.fieldImage')}
            </label>
            <input
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin.fieldDescription')}
            </label>
            <textarea
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[80px] resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('admin.fieldContent')}
            </label>
            <textarea
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-slate-100 min-h-[220px] resize-y focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={sampleContent}
            />
            <p className="mt-1 text-[11px] text-slate-400">{t('admin.contentHelp')}</p>
          </div>

          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('admin.publishLabel')}
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            onClick={() => navigate('/admin/recommendations')}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            disabled={submitting}
          >
            {submitting
              ? t('admin.saving')
              : mode === 'create'
              ? t('admin.create')
              : t('admin.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
