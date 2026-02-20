'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import SideCanvas from "@/components/ui/SideCanvas";
import {
  DataTable,
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
  type Column,
  type SortDirection,
} from "@/components/dashboard/universal";
import { RowActions, EditAction, DeleteAction, ApproveAction, RejectAction } from "@/components/dashboard/universal/RowActions";
import Button from "@/components/ui/Button";
import { useAdminUsers, type AdminUserRow } from "@/interfaces/web/hooks/dashboard/useAdminUsers";
import type { CreateUserDTO, UpdateUserDTO } from "@/core/application/admin/dto/AdminUserDTO";
import { Download } from "lucide-react";
import { toastManager } from "@/utils/toast";
import { EMPTY_STATE } from "@/utils/emptyStateConstants";
import { DEFAULT_TABLE_SORT } from "@/utils/dashboardConstants";

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
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedRole, setStagedRole] = useState<string>("");
  const [stagedApprovalStatus, setStagedApprovalStatus] = useState<string>("");

  // UI state
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Data hooks
  const { users, loading, error, refetch, createUser, updateUser, deleteUser, approveUser, rejectUser } = useAdminUsers({
    role: roleFilter || undefined,
    approvalStatus: approvalStatusFilter || undefined,
    search: search || undefined,
  });

  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT.sortDirection);

  const internalUsers = useMemo(
    () => users.filter((user) => INTERNAL_ROLES.includes(user.role as (typeof INTERNAL_ROLES)[number])),
    [users]
  );

  const sortedUsers = useMemo(() => {
    const list = [...internalUsers];
    const key = sortKey ?? DEFAULT_TABLE_SORT.sortKey;
    const dir = sortDirection ?? DEFAULT_TABLE_SORT.sortDirection;
    list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (key === "name") {
        aVal = a.name ?? "";
        bVal = b.name ?? "";
      } else if (key === "email") {
        aVal = a.email ?? "";
        bVal = b.email ?? "";
      } else if (key === "approvalStatus") {
        aVal = a.approvalStatus ?? "";
        bVal = b.approvalStatus ?? "";
      } else {
        aVal = a.name ?? "";
        bVal = b.name ?? "";
      }
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [internalUsers, sortKey, sortDirection]);

  const hasActiveFilters = roleFilter !== "" || approvalStatusFilter !== "";
  const activeFilterCount = (roleFilter ? 1 : 0) + (approvalStatusFilter ? 1 : 0);
  const hasStagedFilters = stagedRole !== "" || stagedApprovalStatus !== "";
  const stagedFilterCount = (stagedRole ? 1 : 0) + (stagedApprovalStatus ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedRole(roleFilter);
      setStagedApprovalStatus(approvalStatusFilter);
    }
  }, [filterPanelOpen, roleFilter, approvalStatusFilter]);

  const handleApplyFilters = useCallback(() => {
    setRoleFilter(stagedRole);
    setApprovalStatusFilter(stagedApprovalStatus);
    setFilterPanelOpen(false);
  }, [stagedRole, stagedApprovalStatus]);

  const handleResetAllStaged = useCallback(() => {
    setStagedRole("");
    setStagedApprovalStatus("");
  }, []);

  const handleClearFilters = () => {
    setRoleFilter("");
    setApprovalStatusFilter("");
    setSearch("");
  };

  const handleSortChange = (key: string | null, dir: "asc" | "desc" | null) => {
    setSortKey(key);
    setSortDirection(dir ?? "asc");
  };

  const userColumns: Column<AdminUserRow>[] = useMemo(
    () => [
      { id: "name", header: "Name", sortable: true, accessor: (row) => row.name },
      { id: "email", header: "Email", sortable: true, accessor: (row) => row.email },
      {
        id: "approvalStatus",
        header: "Approval",
        sortable: true,
        accessor: (row) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ${getApprovalBadgeClasses(
              row.approvalStatus
            )}`}
          >
            {row.approvalStatus}
          </span>
        ),
      },
    ],
    []
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
  const handleApprove = async (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
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
  const handleReject = async (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
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

      {/* Toolbar: Search (left) + Filter + Export + New user (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email…"
          className="min-w-[160px] max-w-[320px] w-full md:w-auto flex-1"
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <FilterTriggerButton
            ref={filterTriggerRef}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onClick={() => setFilterPanelOpen(true)}
          />
          <Button type="button" size="sm" variant="bordered" onClick={handleExport} disabled={users.length === 0} icon={<Download className="h-3.5 w-3.5" />}>
            Export CSV
          </Button>
          <Button type="button" size="sm" variant="primary" onClick={handleCreateClick}>
            New user
          </Button>
        </div>
      </div>

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        onResetAll={handleResetAllStaged}
        hasActiveFilters={hasStagedFilters}
        activeFilterCount={stagedFilterCount}
        title="Filter"
        triggerRef={filterTriggerRef}
      >
        <FilterSection
          title="Role"
          onReset={() => setStagedRole("")}
          isActive={stagedRole !== ""}
        >
          <FilterSelect
            label=""
            value={stagedRole}
            onChange={setStagedRole}
            options={[
              { label: "All internal roles", value: "" },
              { label: "Editor", value: "editor" },
              { label: "Admin", value: "admin" },
              { label: "Super Admin", value: "super_admin" },
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Approval"
          onReset={() => setStagedApprovalStatus("")}
          isActive={stagedApprovalStatus !== ""}
        >
          <FilterSelect
            label=""
            value={stagedApprovalStatus}
            onChange={setStagedApprovalStatus}
            options={[
              { label: "All statuses", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      <DataTable<AdminUserRow>
        columns={userColumns}
        data={sortedUsers}
        isLoading={loading}
        error={error}
        onRetry={() => void refetch()}
        emptyTitle={EMPTY_STATE.NO_USERS_FOUND.title}
        emptyMessage={EMPTY_STATE.NO_USERS_FOUND.message}
        searchable
        searchPlaceholder="Search by name, email…"
        searchQuery={search}
        onSearchQueryChange={setSearch}
        sortable
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        renderRowActions={(user) => (
          <RowActions>
            {user.approvalStatus === "pending" && (
              <>
                <ApproveAction onClick={() => handleApprove(user.id)} aria-label="Approve" />
                <RejectAction onClick={() => handleReject(user.id)} aria-label="Reject" />
              </>
            )}
            <EditAction onClick={() => handleEditClick(user)} aria-label="Edit" />
            <DeleteAction onClick={() => handleDelete(user.id)} aria-label="Delete" />
          </RowActions>
        )}
        onRowClick={(user) => setSelectedUser(user)}
        responsive
      />

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
                      className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ${getApprovalBadgeClasses(
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
