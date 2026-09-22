"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/lib/api";
import { AdminUserListItem } from "@/types/admin";

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal / Confirm state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUserListItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminUsers(token, {
        search,
        role,
        status,
        sort,
        page,
        limit: 10,
      });
      setUsers(res.users);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, status, sort, page, token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = async (user: AdminUserListItem) => {
    if (!token) return;
    const newStatus = !user.is_active;
    setActionLoadingId(user.id);
    try {
      await updateAdminUserStatus(token, user.id, newStatus);
      showToast(`User ${user.full_name} is now ${newStatus ? "Active" : "Deactivated"}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangeRole = async (user: AdminUserListItem, newRole: "user" | "admin") => {
    if (!token) return;
    setActionLoadingId(user.id);
    try {
      await updateAdminUserRole(token, user.id, newRole);
      showToast(`User ${user.full_name} role changed to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!token || !deleteConfirmUser) return;
    setActionLoadingId(deleteConfirmUser.id);
    try {
      await deleteAdminUser(token, deleteConfirmUser.id);
      showToast(`User ${deleteConfirmUser.full_name} successfully deleted.`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/50 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" /> User Directory & Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total of <span className="text-white font-bold">{totalCount}</span> registered explorers and administrators
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <Shield className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-800">All Roles</option>
            <option value="user" className="bg-slate-800">Standard Users</option>
            <option value="admin" className="bg-slate-800">Administrators</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            <option value="all" className="bg-slate-800">All Statuses</option>
            <option value="active" className="bg-slate-800">Active Only</option>
            <option value="inactive" className="bg-slate-800">Inactive / Suspended</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
          >
            <option value="newest" className="bg-slate-800">Sort: Newest First</option>
            <option value="oldest" className="bg-slate-800">Sort: Oldest First</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-4 px-6">User / Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Active</th>
                <th className="py-4 px-6">Registered</th>
                <th className="py-4 px-6 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No users matching your criteria were found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = currentUser?.id === u.id;
                  const isProcessing = actionLoadingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{u.full_name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {u.favorites_count || 0} saves • {u.reviews_count || 0} reviews
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {u.email}
                      </td>

                      {/* Role Switcher */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {u.role === "admin" ? <ShieldCheck className="w-3 h-3 text-purple-400" /> : <Shield className="w-3 h-3 text-slate-400" />}
                          {u.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            u.is_active !== false
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active !== false ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {u.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "Never"}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "–"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Link
                            href={`/admin/users/${u.id}`}
                            title="View Full Profile & History"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Toggle Role */}
                          {!isCurrentAdmin && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleChangeRole(u, u.role === "admin" ? "user" : "admin")}
                              title={`Change role to ${u.role === "admin" ? "user" : "admin"}`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Toggle Active / Deactivate */}
                          {!isCurrentAdmin && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleToggleStatus(u)}
                              title={u.is_active !== false ? "Deactivate User" : "Activate User"}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.is_active !== false
                                  ? "bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                                  : "bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400"
                              }`}
                            >
                              {u.is_active !== false ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete Account */}
                          {!isCurrentAdmin && (
                            <button
                              disabled={isProcessing}
                              onClick={() => setDeleteConfirmUser(u)}
                              title="Delete Account"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete User Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to permanently delete the account for{" "}
                <span className="text-white font-semibold">{deleteConfirmUser.full_name}</span> ({deleteConfirmUser.email})?
                This action will cascade delete all saved favorites and reviews.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-950"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
