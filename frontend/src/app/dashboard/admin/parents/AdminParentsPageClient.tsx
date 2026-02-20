'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideCanvas from "@/components/ui/SideCanvas";
import { useAdminUsers, type AdminUserRow } from "@/interfaces/web/hooks/dashboard/useAdminUsers";
import type { CreateUserDTO, UpdateUserDTO } from "@/core/application/admin/dto/AdminUserDTO";
import {
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
} from "@/components/dashboard/universal";
import { RowActions, EditAction, DeleteAction, ApproveAction, RejectAction } from "@/components/dashboard/universal/RowActions";
import Button from "@/components/ui/Button";
import { Download, Users } from "lucide-react";
import { toastManager } from "@/utils/toast";
import { EMPTY_STATE } from "@/utils/emptyStateConstants";

type ParentFormData = CreateUserDTO | UpdateUserDTO;

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

export const AdminParentsPageClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Filters
  const [search, setSearch] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedApprovalStatus, setStagedApprovalStatus] = useState<string>("");

  // Selection / form state
  const [selectedParent, setSelectedParent] = useState<AdminUserRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ParentFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "parent",
    approvalStatus: "pending",
  });

  const { users, loading, error, createUser, updateUser, deleteUser, approveUser, rejectUser } =
    useAdminUsers({
      role: "parent",
      approvalStatus: approvalStatusFilter || undefined,
      search: search || undefined,
    });

  // Safety net: even if the backend returns users with an incorrect role,
  // this screen must only ever treat true parents as "parents".
  const parentUsers = users.filter((user) => user.role === "parent");

  // Seed filters from query params (e.g. ?email=parent@example.com&status=pending)
  useEffect(() => {
    const email = searchParams.get("email");
    const status = searchParams.get("status");

    if (email) {
      setSearch(email);
    }

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      setApprovalStatusFilter(status);
    }
  }, [searchParams]);

  const hasActiveFilters = approvalStatusFilter !== "";
  const activeFilterCount = approvalStatusFilter ? 1 : 0;
  const hasStagedFilters = stagedApprovalStatus !== "";
  const stagedFilterCount = stagedApprovalStatus ? 1 : 0;

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedApprovalStatus(approvalStatusFilter);
    }
  }, [filterPanelOpen, approvalStatusFilter]);

  const handleApplyFilters = useCallback(() => {
    setApprovalStatusFilter(stagedApprovalStatus);
    setFilterPanelOpen(false);
  }, [stagedApprovalStatus]);

  const handleResetAllStaged = useCallback(() => {
    setStagedApprovalStatus("");
  }, []);

  const handleClearFilters = () => {
    setApprovalStatusFilter("");
    setSearch("");
  };

  const handleExport = () => {
    const csvData = parentUsers.map((user) => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "",
      "Approval Status": user.approvalStatus,
      "Children Count": user.childrenCount || 0,
      "Created At": user.createdAt || "",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((h) => `"${row[h as keyof typeof row] ?? ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `parents-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleCreateClick = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "parent",
      approvalStatus: "approved",
    });
    setIsCreating(true);
  };

  const handleEditClick = (parent: AdminUserRow) => {
    setFormData({
      name: parent.name,
      email: parent.email,
      phone: parent.phone || "",
      role: "parent",
      approvalStatus: parent.approvalStatus,
      rejectionReason: parent.rejectionReason || "",
    });
    setSelectedParent(parent);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isCreating) {
        await createUser(formData as CreateUserDTO);
        setIsCreating(false);
      } else if (isEditing && selectedParent) {
        await updateUser(selectedParent.id, formData as UpdateUserDTO);
        setIsEditing(false);
        setSelectedParent(null);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "parent",
        approvalStatus: "pending",
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save parent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this parent? This will remove their dashboard access.",
      )
    ) {
      return;
    }

    try {
      await deleteUser(id);
      if (selectedParent?.id === id) {
        setSelectedParent(null);
      }
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete parent");
    }
  };

  const handleApprove = async (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      await approveUser(id);
      toastManager.success("Parent approved.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to approve parent");
    }
  };

  const handleReject = async (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const reason = prompt("Rejection reason (optional):");
    if (reason === null) return;
    try {
      await rejectUser(id, reason);
      toastManager.success("Parent rejected.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to reject parent");
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Parents
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage parent accounts, approvals, and their linked children.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search parents by name or email…"
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
            New parent
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
          title="Approval Status"
          onReset={() => setStagedApprovalStatus("")}
          isActive={stagedApprovalStatus !== ""}
        >
          <FilterSelect
            label=""
            value={stagedApprovalStatus}
            onChange={setStagedApprovalStatus}
            options={[
              { label: "All approval statuses", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

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
                  Children
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
                    colSpan={5}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    Loading parents…
                  </td>
                </tr>
              ) : parentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    {EMPTY_STATE.NO_PARENTS_FOUND.title}
                  </td>
                </tr>
              ) : (
                parentUsers.map((parent) => (
                  <tr
                    key={parent.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedParent(parent)}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {parent.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {parent.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {parent.childrenCount ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ${getApprovalBadgeClasses(
                          parent.approvalStatus,
                        )}`}
                      >
                        {parent.approvalStatus}
                      </span>
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-right text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <RowActions>
                        {parent.approvalStatus === "pending" && (
                          <>
                            <ApproveAction onClick={() => handleApprove(parent.id)} aria-label="Approve" />
                            <RejectAction onClick={() => handleReject(parent.id)} aria-label="Reject" />
                          </>
                        )}
                        <EditAction onClick={() => handleEditClick(parent)} aria-label="Edit" />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/children?parentId=${encodeURIComponent(parent.id)}`,
                            )
                          }
                          aria-label="View children"
                          title="View children"
                          className="min-w-0 p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Users className="h-3 w-3" aria-hidden />
                        </Button>
                        <DeleteAction onClick={() => handleDelete(parent.id)} aria-label="Delete" />
                      </RowActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing {parentUsers.length} parent{parentUsers.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Detail view */}
      <SideCanvas
        isOpen={!!selectedParent && !isEditing}
        onClose={() => setSelectedParent(null)}
        title={selectedParent ? selectedParent.name : "Parent details"}
        description="View parent details, approval status, and high-level activity."
      >
        {selectedParent && (
          <div className="space-y-4 text-sm">
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedParent.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd>{selectedParent.email}</dd>
                </div>
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd>{selectedParent.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Approval status</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getApprovalBadgeClasses(
                        selectedParent.approvalStatus,
                      )}`}
                    >
                      {selectedParent.approvalStatus}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Children</dt>
                  <dd>{selectedParent.childrenCount || 0}</dd>
                </div>
                <div>
                  <dt className="font-medium">Bookings</dt>
                  <dd>{selectedParent.bookingsCount || 0}</dd>
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
                  onClick={() => handleEditClick(selectedParent)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Edit parent
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/children?parentId=${encodeURIComponent(
                        selectedParent.id,
                      )}`,
                    )
                  }
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  View children
                </button>
                {selectedParent.approvalStatus === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleApprove(selectedParent.id, e);
                        setSelectedParent(null);
                      }}
                      className="inline-flex items-center rounded-md border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-600 shadow-sm hover:bg-emerald-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleReject(selectedParent.id, e);
                        setSelectedParent(null);
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

      {/* Create / Edit canvas */}
      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedParent(null);
        }}
        title={isCreating ? "Create parent" : "Edit parent"}
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
            <label
              htmlFor="approvalStatus"
              className="block text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              Approval Status
            </label>
            <select
              id="approvalStatus"
              value={formData.approvalStatus || "pending"}
              onChange={(e) =>
                setFormData({ ...formData, approvalStatus: e.target.value as any })
              }
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isCreating ? "Create parent" : "Update parent"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedParent(null);
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

