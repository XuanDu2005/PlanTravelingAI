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
    <div className="space-y-4">

      {/* Filter & Search Toolbar Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo họ tên, email người dùng..."
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/80 pl-10 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition"
          />
        </div>

        {/* High-Contrast Segmented Status Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          {(['ALL', 'ACTIVE', 'LOCKED'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t(`admin.filterStatus${s.charAt(0)}${s.slice(1).toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0D1527] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">{t('admin.colName')}</th>
                <th className="px-5 py-3.5">{t('admin.colEmail')}</th>
                <th className="px-5 py-3.5">{t('admin.colRole')}</th>
                <th className="px-5 py-3.5">{t('admin.colStatus')}</th>
                <th className="px-5 py-3.5">{t('admin.colCreated')}</th>
                <th className="px-5 py-3.5 text-right">{t('admin.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-2xs">
                          {(u.name?.charAt(0) || u.email.charAt(0)).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {u.name}
                            </span>
                            {self && (
                              <span className="rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 text-[10px] font-bold">
                                {t('admin.you')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono sm:hidden">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-cyan-300 px-2.5 py-1 text-[11px] font-bold">
                          👑 {t('admin.roleAdmin')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-[11px] font-semibold">
                          {t('admin.roleUser')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {t('admin.statusLocked')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t('admin.statusActive')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            locked ? openUnlockModal(u) : openLockModal(u)
                          }
                          disabled={rowBusy || lockBlocked}
                          title={lockBlocked ? lockBlockedReason : undefined}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                            locked
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
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
                          className="rounded-lg px-3 py-1.5 text-xs font-bold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="px-5 py-10 text-center text-xs text-slate-400"
                  >
                    {t('admin.usersNoMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Hiển thị <strong>{filtered.length}</strong> / <strong>{users.length}</strong> người dùng</span>
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
