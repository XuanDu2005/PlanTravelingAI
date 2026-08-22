import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { adminService } from '@/services';
import { AdminUser } from '@/types';
import { useAuth } from '@/store/AuthContext';
import { useConfirm } from '@/components/ConfirmProvider';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import LockUserModal from './LockUserModal';

type StatusFilter = 'ALL' | 'ACTIVE' | 'LOCKED';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [lockModal, setLockModal] = useState<{ mode: 'lock' | 'unlock'; user: AdminUser } | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      setUsers(await adminService.listUsers());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, query, statusFilter]);

  const adminCount = useMemo(
    () => users?.filter((u) => u.role === 'ADMIN').length ?? 0,
    [users],
  );

  const activeAdminsCount = useMemo(
    () => users?.filter((u) => u.role === 'ADMIN' && u.status === 'ACTIVE').length ?? 0,
    [users],
  );

  const isSelf = (id: string) => currentUser?.id === id;
  const isLastAdmin = (u: AdminUser) => u.role === 'ADMIN' && adminCount <= 1;
  const isLastActiveAdmin = (u: AdminUser) =>
    u.role === 'ADMIN' && u.status === 'ACTIVE' && activeAdminsCount <= 1;

  const handleDelete = async (u: AdminUser) => {
    if (u.id === currentUser?.id) {
      toast.error(t('admin.deleteUserSelf'));
      return;
    }
    const ok = await confirm({
      title: t('admin.deleteUserConfirmTitle'),
      description: t('admin.deleteUserConfirm', {
        name: u.name?.trim() || u.email,
      }),
      confirmLabel: t('admin.deleteUser'),
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(u.id);
    try {
      await adminService.deleteUser(u.id);
      setUsers((prev) => (prev ? prev.filter((x) => x.id !== u.id) : prev));
      toast.success(t('admin.deleteUserSuccess'));
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        toast.error(t('admin.deleteUserLastAdmin'));
      } else {
        toast.error(t('admin.deleteUserError'));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openLockModal = (u: AdminUser) => setLockModal({ mode: 'lock', user: u });
  const openUnlockModal = (u: AdminUser) => setLockModal({ mode: 'unlock', user: u });
  const closeLockModal = () => setLockModal(null);

  const handleConfirmStatus = async (reason: string | undefined) => {
    if (!lockModal) return;
    const target = lockModal.user;
    const nextStatus: 'ACTIVE' | 'LOCKED' = lockModal.mode === 'lock' ? 'LOCKED' : 'ACTIVE';
    setStatusChangingId(target.id);
    try {
      await adminService.setUserStatus(target.id, nextStatus, reason);
      setUsers((prev) =>
        prev
          ? prev.map((x) => (x.id === target.id ? { ...x, status: nextStatus } : x))
          : prev,
      );
      toast.success(
        nextStatus === 'LOCKED'
          ? t('admin.lockUserSuccess')
          : t('admin.unlockUserSuccess'),
      );
      closeLockModal();
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        toast.error(t('admin.lockUserLastAdminError'));
      } else {
        toast.error(t('admin.lockUserError'));
      }
    } finally {
      setStatusChangingId(null);
    }
  };

  if (error) return <ErrorState message={t('admin.usersError')} />;
  if (!users) return <LoadingState message={t('admin.usersLoading')} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-slate-100">
          {t('admin.usersTitle')}
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-slate-400">
          {t('admin.usersSubtitle', { count: users.length })}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.tripsSearchPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-surface-100 dark:bg-surface-200 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-900/40"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 text-xs dark:bg-surface-100">
          {(['ALL', 'ACTIVE', 'LOCKED'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 font-medium transition ${
                statusFilter === s
                  ? 'bg-white text-brand-700 shadow dark:bg-surface-200 dark:text-brand-300'
                  : 'text-ink-600 hover:text-ink-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {t(`admin.filterStatus${s.charAt(0)}${s.slice(1).toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100 text-sm dark:divide-surface-100">
            <thead className="bg-ink-100/40 text-left text-xs uppercase tracking-wide text-ink-500 dark:bg-surface-100 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">{t('admin.colName')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.colEmail')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.colRole')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.colStatus')}</th>
                <th className="px-5 py-3 font-medium">{t('admin.colCreated')}</th>
                <th className="px-5 py-3 font-medium text-right">
                  {t('admin.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-surface-100">
              {filtered.map((u) => {
                const self = isSelf(u.id);
                const lastAdmin = isLastAdmin(u);
                const lastActiveAdmin = isLastActiveAdmin(u);
                const locked = u.status === 'LOCKED';

                const deleteBlocked = self || lastAdmin;
                const deleteBlockedReason = self
                  ? t('admin.deleteUserSelf')
                  : lastAdmin
                  ? t('admin.deleteUserLastAdmin')
                  : '';

                const lockBlocked = self || (locked ? false : lastActiveAdmin);
                const lockBlockedReason = self
                  ? t('admin.lockUserSelf')
                  : locked
                  ? ''
                  : t('admin.lockUserLastAdmin');

                const rowBusy = deletingId === u.id || statusChangingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-surface-100">
                    <td className="px-5 py-3 font-medium text-ink-900 dark:text-slate-100">
                      {u.name}
                      {self && (
                        <span className="ml-2 text-xs font-normal text-ink-500 dark:text-slate-400">
                          {t('admin.you')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-700 dark:text-slate-200">{u.email}</td>
                    <td className="px-5 py-3">
                      {u.role === 'ADMIN' ? (
                        <span className="badge-success">{t('admin.roleAdmin')}</span>
                      ) : (
                        <span className="badge">{t('admin.roleUser')}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {locked ? (
                        <span className="badge-warning">{t('admin.statusLocked')}</span>
                      ) : (
                        <span className="badge-success">{t('admin.statusActive')}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            locked ? openUnlockModal(u) : openLockModal(u)
                          }
                          disabled={rowBusy || lockBlocked}
                          title={lockBlocked ? lockBlockedReason : undefined}
                          className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            locked
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/30 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                              : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700/30 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                          }`}
                        >
                          {statusChangingId === u.id
                            ? t('admin.saving')
                            : locked
                            ? t('admin.unlockUser')
                            : t('admin.lockUser')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          disabled={rowBusy || deleteBlocked}
                          title={deleteBlocked ? deleteBlockedReason : undefined}
                          className="btn-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === u.id
                            ? t('admin.deletingUser')
                            : t('admin.deleteUser')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-sm text-ink-500 dark:text-slate-400"
                  >
                    {t('admin.usersNoMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lockModal && (
        <LockUserModal
          open
          mode={lockModal.mode}
          userName={lockModal.user.name?.trim() || lockModal.user.email}
          onConfirm={handleConfirmStatus}
          onClose={closeLockModal}
        />
      )}
    </div>
  );
}
