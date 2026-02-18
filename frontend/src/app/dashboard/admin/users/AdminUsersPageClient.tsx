'use client';

import React, { useMemo, useState } from "react";
import SideCanvas from "@/components/ui/SideCanvas";
import { useAdminUsers, type AdminUserRow } from "@/interfaces/web/hooks/dashboard/useAdminUsers";
import type { CreateUserDTO, UpdateUserDTO } from "@/core/application/admin/dto/AdminUserDTO";
import { Download, Filter } from "lucide-react";
import { toastManager } from "@/utils/toast";

type UserFormData = CreateUserDTO | UpdateUserDTO;

const INTERNAL_ROLES: Array<"editor" | "admin" | "super_admin"> = [
  "editor",
  "admin",
  "super_admin",
];

function getApprovalBadgeClasses(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "rejected":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  }
}

export const AdminUsersPageClient: React.FC = () => {
  // Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>("");
  
  // UI state
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Data hooks
  const { users, loading, error, createUser, updateUser, deleteUser, approveUser, rejectUser } = useAdminUsers({
    role: roleFilter || undefined,
    approvalStatus: approvalStatusFilter || undefined,
    search: search || undefined,
  });

  const internalUsers = useMemo(
    () => users.filter((user) => INTERNAL_ROLES.includes(user.role as typeof INTERNAL_ROLES[number])),
    [users]
  );

  /**
   * Export to CSV
   */
  const handleExport = () => {
    const csvData = internalUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "",
      Role: user.role,
      "Approval Status": user.approvalStatus,
      "Created At": user.createdAt || "",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h as keyof typeof row]}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `internal-users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  /**
   * Handle create user
   */
  const handleCreateClick = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "editor",
      approvalStatus: "pending",
    });
    setIsCreating(true);
  };

  /**
   * Handle edit user
   */
  const handleEditClick = (user: AdminUserRow) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      approvalStatus: user.approvalStatus,
      rejectionReason: user.rejectionReason || "",
    });
    setSelectedUser(user);
    setIsEditing(true);
  };

  /**
   * Handle form submit (create or update)
   */
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isCreating) {
        await createUser(formData as CreateUserDTO);
        setIsCreating(false);
      } else if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, formData as UpdateUserDTO);
        setIsEditing(false);
        setSelectedUser(null);
      }
      
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "editor",
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete user
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteUser(id);
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  /**
   * Handle approve user
   */
  const handleApprove = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await approveUser(id);
      toastManager.success("User approved.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to approve user");
    }
  };

  /**
   * Handle reject user
   */
  const handleReject = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const reason = prompt("Rejection reason (optional):");
    if (reason === null) return;
    try {
      await rejectUser(id, reason);
      toastManager.success("User rejected.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to reject user");
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Admin &amp; internal users
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage internal team accounts (admin, super admin, and editor roles) with full CRUD operations and approvals.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="h-9 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Filter size={14} />
            Filters
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={users.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download size={14} />
            Export
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            New user
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">All internal roles</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <select
              value={approvalStatusFilter}
              onChange={(e) => setApprovalStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">All approval statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setRoleFilter("");
                setApprovalStatusFilter("");
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Internal users table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Approval
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : internalUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                internalUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getApprovalBadgeClasses(
                          user.approvalStatus
                        )}`}
                      >
                        {user.approvalStatus}
                      </span>
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-right text-xs space-x-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {user.approvalStatus === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleApprove(user.id, e)}
                            className="inline-flex items-center rounded-md border border-emerald-300 px-2 py-1 text-[11px] font-medium text-emerald-600 shadow-sm hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleReject(user.id, e)}
                            className="inline-flex items-center rounded-md border border-rose-300 px-2 py-1 text-[11px] font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEditClick(user)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center rounded-md border border-rose-300 px-2 py-1 text-[11px] font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing {internalUsers.length} internal user{internalUsers.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Detail View Canvas */}
      <SideCanvas
        isOpen={!!selectedUser && !isEditing}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? selectedUser.name : "User details"}
        description="View user account details and metadata."
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedUser.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd>{selectedUser.email}</dd>
                </div>
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd>{selectedUser.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Role</dt>
                  <dd>{selectedUser.role}</dd>
                </div>
                <div>
                  <dt className="font-medium">Approval status</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getApprovalBadgeClasses(
                        selectedUser.approvalStatus
                      )}`}
                    >
                      {selectedUser.approvalStatus}
                    </span>
                  </dd>
                </div>
                {selectedUser.rejectionReason && (
                  <div>
                    <dt className="font-medium">Rejection reason</dt>
                    <dd>{selectedUser.rejectionReason}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium">Children</dt>
                  <dd>{selectedUser.childrenCount || 0}</dd>
                </div>
                <div>
                  <dt className="font-medium">Bookings</dt>
                  <dd>{selectedUser.bookingsCount || 0}</dd>
                </div>
              </dl>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actions
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditClick(selectedUser)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Edit user
                </button>
                {selectedUser.approvalStatus === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleApprove(selectedUser.id, e);
                        setSelectedUser(null);
                      }}
                      className="inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm hover:bg-emerald-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleReject(selectedUser.id, e);
                        setSelectedUser(null);
                      }}
                      className="inline-flex items-center rounded-md border border-rose-600 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </SideCanvas>

      {/* Create/Edit Form Canvas */}
      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedUser(null);
        }}
        title={isCreating ? "Create user" : "Edit user"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Password {isCreating ? "*" : "(leave blank to keep current)"}
            </label>
            <input
              type="password"
              id="password"
              required={isCreating}
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Role *
            </label>
            <select
              id="role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="approvalStatus" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Approval Status
            </label>
            <select
              id="approvalStatus"
              value={formData.approvalStatus || "pending"}
              onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value as any })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {formData.approvalStatus === "rejected" && (
            <div>
              <label htmlFor="rejectionReason" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Rejection Reason
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={formData.rejectionReason || ""}
                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isCreating ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedUser(null);
              }}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </SideCanvas>
    </section>
  );
};
