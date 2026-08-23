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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
          {mode === 'create' ? t('admin.newRecTitle') : t('admin.editRecTitle')}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">{t('admin.formDesc')}</p>
      </header>

      <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">{t('admin.fieldTitle')}</label>
            <input
              required
              className="input"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('admin.fieldDestination')}</label>
            <input
              required
              className="input"
              value={form.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('admin.fieldImage')}</label>
            <input
              className="input"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t('admin.fieldDescription')}</label>
            <textarea
              required
              className="input min-h-[100px]"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t('admin.fieldContent')}</label>
            <textarea
              required
              className="input min-h-[280px] font-mono text-xs"
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={sampleContent}
            />
            <p className="mt-2 text-xs text-ink-500 dark:text-slate-400">{t('admin.contentHelp')}</p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
            />
            {t('admin.publishLabel')}
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate('/admin/recommendations')}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
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
