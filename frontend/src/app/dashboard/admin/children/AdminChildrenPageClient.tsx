'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideCanvas from "@/components/ui/SideCanvas";
import { BaseModal } from "@/components/ui/Modal";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";
import { SKELETON_COUNTS } from "@/utils/skeletonConstants";
import { useAdminChildren, type AdminChildRow } from "@/interfaces/web/hooks/dashboard/useAdminChildren";
import { useAdminUsers } from "@/interfaces/web/hooks/dashboard/useAdminUsers";
import { useLiveRefresh } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import type { CreateChildDTO, UpdateChildDTO } from "@/core/application/admin/dto/AdminChildDTO";
import type { AdminChildChecklistDTO } from "@/core/application/admin/dto/AdminChildDTO";
import { Download, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Users, ClipboardCheck, Loader2 } from "lucide-react";
import { toastManager } from "@/utils/toast";

type ChildFormData = Partial<CreateChildDTO> & Partial<UpdateChildDTO>;

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

function ChecklistContentDisplay({ checklist }: { checklist: AdminChildChecklistDTO }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Checklist content
      </h4>
      <dl className="mt-3 space-y-2 text-sm">
        {(checklist.emergencyContactName || checklist.emergencyContactPhone) && (
          <>
            {checklist.emergencyContactName && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Emergency contact</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{checklist.emergencyContactName}</dd>
              </div>
            )}
            {checklist.emergencyContactRelationship && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Relationship</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{checklist.emergencyContactRelationship}</dd>
              </div>
            )}
            {checklist.emergencyContactPhone && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Emergency phone</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{checklist.emergencyContactPhone}</dd>
              </div>
            )}
            {checklist.emergencyContactPhoneAlt && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Alt. phone</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50">{checklist.emergencyContactPhoneAlt}</dd>
              </div>
            )}
            {checklist.emergencyContactAddress && (
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Emergency address</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">{checklist.emergencyContactAddress}</dd>
              </div>
            )}
          </>
        )}
        {(checklist.medicalConditions || checklist.allergies || checklist.medications) && (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Medical / allergies / medications</dt>
            <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">
              {checklist.medicalConditions && `Conditions: ${checklist.medicalConditions}\n`}
              {checklist.allergies && `Allergies: ${checklist.allergies}\n`}
              {checklist.medications && `Medications: ${checklist.medications}`}
            </dd>
          </div>
        )}
        {checklist.dietaryRequirements && (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Dietary requirements</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">{checklist.dietaryRequirements}</dd>
          </div>
        )}
        {checklist.specialNeeds && (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Special needs</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">{checklist.specialNeeds}</dd>
          </div>
        )}
        {checklist.behavioralNotes && (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Behavioral notes</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">{checklist.behavioralNotes}</dd>
          </div>
        )}
        {checklist.activityRestrictions && (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Activity restrictions</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">{checklist.activityRestrictions}</dd>
          </div>
        )}
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Consents</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-50">
            Photography: {checklist.consentPhotography ? "Yes" : "No"} · Medical treatment: {checklist.consentMedicalTreatment ? "Yes" : "No"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export const AdminChildrenPageClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Filter state
  const [search, setSearch] = useState("");
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>("");
  const [ageMinFilter, setAgeMinFilter] = useState<number | undefined>(undefined);
  const [ageMaxFilter, setAgeMaxFilter] = useState<number | undefined>(undefined);
  const [parentIdFilter, setParentIdFilter] = useState<string>("");
  const [hoursFilter, setHoursFilter] = useState<string>("");
  
  // UI state
  const [selectedChild, setSelectedChild] = useState<AdminChildRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isLinkingParent, setIsLinkingParent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<ChildFormData>({
    name: "",
    age: 0,
    gender: "prefer_not_to_say",
    approval_status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  // Review checklist modal: show checklist content before marking complete & approve
  const [reviewChecklistChildId, setReviewChecklistChildId] = useState<string | null>(null);
  const [reviewChecklistChild, setReviewChecklistChild] = useState<AdminChildRow | null>(null);
  const [reviewChecklistLoading, setReviewChecklistLoading] = useState(false);
  const [reviewChecklistSubmitting, setReviewChecklistSubmitting] = useState(false);

  // Data hooks
  const {
    children,
    loading,
    error,
    refetch: refetchChildren,
    createChild,
    updateChild,
    deleteChild,
    approveChild,
    completeChecklist,
    rejectChild,
    notifyParentToCompleteChecklist,
    linkParent,
    getChild,
  } = useAdminChildren({
    approvalStatus: approvalStatusFilter || undefined,
    ageMin: ageMinFilter,
    ageMax: ageMaxFilter,
    parentId: parentIdFilter || undefined,
    search: search || undefined,
    hours: hoursFilter === "0" ? "0" : undefined,
  });

  useLiveRefresh("children", () => void refetchChildren(true), { enabled: LIVE_REFRESH_ENABLED });

  // Load all users for parent selection
  const { users } = useAdminUsers({});

  // Filter only parents
  const parents = useMemo(
    () => users.filter((u) => u.role === "parent"),
    [users]
  );

  // Initialise filters from query string (e.g. ?parentId=123, ?hours=0 from dashboard "X children with 0 hours")
  useEffect(() => {
    const initialParentId = searchParams.get("parentId");
    if (initialParentId) {
      setParentIdFilter(initialParentId);
    }
    const initialHours = searchParams.get("hours");
    if (initialHours === "0") {
      setHoursFilter("0");
    }
  }, [searchParams]);

  // When "Review checklist" modal opens, fetch full child (with checklist) for display
  useEffect(() => {
    if (!reviewChecklistChildId || !getChild) return;
    setReviewChecklistLoading(true);
    setReviewChecklistChild(null);
    getChild(reviewChecklistChildId)
      .then((full) => {
        setReviewChecklistChild(full);
      })
      .catch(() => {
        setReviewChecklistChild(null);
      })
      .finally(() => {
        setReviewChecklistLoading(false);
      });
  }, [reviewChecklistChildId, getChild]);

  /**
   * Export to CSV
   */
  const handleExport = () => {
    const csvData = children.map((child) => ({
      ID: child.id,
      Name: child.name,
      Age: child.age,
      Gender: child.gender || "",
      "Date of Birth": child.dateOfBirth || "",
      Address: child.address || "",
      Postcode: child.postcode || "",
      City: child.city || "",
      Region: child.region || "",
      "Approval Status": child.approvalStatus,
      "Parent ID": child.parentId || "",
      "Parent Name": child.parentName || "",
      "Parent Email": child.parentEmail || "",
      "Parent Phone": child.parentPhone || "",
      "Created At": child.createdAt || "",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h as keyof typeof row]}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `children-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handle create child
   */
  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.user_id || !formData.name || formData.age === undefined) {
        toastManager.warning("Please fill in all required fields (Parent, Name, Age)");
        return;
      }

      const createData: CreateChildDTO = {
        user_id: formData.user_id,
        name: formData.name,
        age: formData.age,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        postcode: formData.postcode,
        city: formData.city,
        region: formData.region,
        approval_status: formData.approval_status,
      };

      await createChild(createData);
      setIsCreating(false);
      setFormData({
        name: "",
        age: 0,
        gender: "prefer_not_to_say",
        approval_status: "pending",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create child";
      toastManager.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle update child
   */
  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    setSubmitting(true);

    try {
      const updateData: UpdateChildDTO = {
        user_id: formData.user_id,
        name: formData.name,
        age: formData.age,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        postcode: formData.postcode,
        city: formData.city,
        region: formData.region,
      };

      await updateChild(selectedChild.id, updateData);
      setIsEditing(false);
      setSelectedChild(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update child";
      toastManager.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete child
   */
  const handleDelete = async (child: AdminChildRow) => {
    if (!confirm(`Are you sure you want to delete ${child.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteChild(child.id);
      toastManager.success(`${child.name} has been deleted.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete child";
      toastManager.error(message);
    }
  };

  /**
   * Handle approve child (only enabled when checklist is already completed)
   */
  const handleApprove = async (child: AdminChildRow) => {
    try {
      await approveChild(child.id);
      toastManager.success("Child approved.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve child";
      toastManager.error(message);
    }
  };

  /** Open "Review checklist" modal so admin can see content before confirming */
  const handleOpenCompleteChecklist = (child: AdminChildRow) => {
    setReviewChecklistChildId(child.id);
  };

  /** After reviewing checklist in modal, mark complete & approve */
  const handleConfirmCompleteChecklist = async () => {
    if (!reviewChecklistChildId) return;
    setReviewChecklistSubmitting(true);
    try {
      await completeChecklist(reviewChecklistChildId);
      setReviewChecklistChildId(null);
      setReviewChecklistChild(null);
      toastManager.success("Checklist marked complete and child approved.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to complete checklist";
      toastManager.error(message);
    } finally {
      setReviewChecklistSubmitting(false);
    }
  };

  /**
   * Handle notify parent about checklist
   */
  const handleNotifyParent = async (child: AdminChildRow) => {
    if (!child.parentEmail) {
      toastManager.warning("This child is not linked to a parent account.");
      return;
    }

    const confirmMessage =
      child.hasChecklist && !child.checklistCompleted
        ? `Send a reminder to ${child.parentEmail} to finish the checklist for ${child.name}?`
        : `Send a reminder to ${child.parentEmail} to complete the checklist for ${child.name}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await notifyParentToCompleteChecklist(child.id);
      toastManager.success("Parent has been notified about the checklist.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to notify parent";
      toastManager.error(message);
    }
  };

  /**
   * Handle reject child
   */
  const handleReject = async (child: AdminChildRow) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled

    try {
      await rejectChild(child.id, { rejection_reason: reason || undefined });
      toastManager.success("Child rejected.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject child";
      toastManager.error(message);
    }
  };

  /**
   * Handle link parent
   */
  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !selectedParentId) return;

    setSubmitting(true);

    try {
      await linkParent(selectedChild.id, { parent_id: selectedParentId });
      setIsLinkingParent(false);
      setSelectedChild(null);
      setSelectedParentId("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to link parent";
      toastManager.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = async (child: AdminChildRow) => {
    try {
      const fullChild = await getChild(child.id);
      setSelectedChild(fullChild);
      setIsViewingDetails(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load child details";
      toastManager.error(message);
    }
  };

  /**
   * Open edit form
   */
  const handleEdit = (child: AdminChildRow) => {
    setSelectedChild(child);
    setFormData({
      user_id: child.parentId || "",
      name: child.name,
      age: child.age,
      date_of_birth: child.dateOfBirth || undefined,
      gender: child.gender || undefined,
      address: child.address || undefined,
      postcode: child.postcode || undefined,
      city: child.city || undefined,
      region: child.region || undefined,
    });
    setIsEditing(true);
  };

  /**
   * Open link parent form
   */
  const handleOpenLinkParent = (child: AdminChildRow) => {
    setSelectedChild(child);
    setSelectedParentId(child.parentId || "");
    setIsLinkingParent(true);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Children Management
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              You can only approve children with a <span className="font-semibold">Complete</span> checklist.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Filter className="h-3 w-3" />
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  age: 0,
                  gender: "prefer_not_to_say",
                  approval_status: "pending",
                });
                setIsCreating(true);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              + New Child
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <label htmlFor="search" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Search
              </label>
              <input
                id="search"
                type="text"
                placeholder="Child name, parent name/email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label htmlFor="approvalStatus" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Approval Status
              </label>
              <select
                id="approvalStatus"
                value={approvalStatusFilter}
                onChange={(e) => setApprovalStatusFilter(e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageMin" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Min Age
              </label>
              <input
                id="ageMin"
                type="number"
                min="0"
                placeholder="Min"
                value={ageMinFilter ?? ""}
                onChange={(e) => setAgeMinFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label htmlFor="ageMax" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Max Age
              </label>
              <input
                id="ageMax"
                type="number"
                min="0"
                placeholder="Max"
                value={ageMaxFilter ?? ""}
                onChange={(e) => setAgeMaxFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label htmlFor="hoursFilter" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Remaining hours
              </label>
              <select
                id="hoursFilter"
                value={hoursFilter}
                onChange={(e) => setHoursFilter(e.target.value)}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">All</option>
                <option value="0">0 hours only</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* 0 hours filter active: explain what the admin should do */}
      {hoursFilter === '0' && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40"
        >
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            These children have no remaining package hours.
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            Contact their parents (e.g. via <strong>View Parent</strong> for email/phone) to encourage them to purchase more hours so their child can continue sessions.
          </p>
        </div>
      )}

      {/* Children table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Child Name
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Checklist Status
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Approval Status
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Parent
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Parent Email
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Age
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Gender
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Remaining hours
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={9} />
              ) : children.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No children found.
                  </td>
                </tr>
              ) : (
                children.map((child) => (
                  <tr key={child.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-slate-900 dark:text-slate-50">
                      {child.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs">
                      {child.hasChecklist ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            child.checklistCompleted
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {child.checklistCompleted ? "Complete" : "Pending"}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getApprovalBadgeClasses(
                          child.approvalStatus
                        )}`}
                      >
                        {child.approvalStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {child.parentName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {child.parentEmail || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {child.age}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {child.gender || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {child.remainingHours != null ? (
                        <span className={child.remainingHours === 0 ? "font-semibold text-amber-600 dark:text-amber-400" : ""}>
                          {child.remainingHours}h
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        {/* Complete checklist: open modal to review content, then confirm to mark complete & approve */}
                        {child.approvalStatus === "pending" &&
                          child.hasChecklist &&
                          !child.checklistCompleted && (
                            <button
                              onClick={() => handleOpenCompleteChecklist(child)}
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
                              title="Review checklist then mark complete and approve child"
                            >
                              <ClipboardCheck className="h-3 w-3" />
                              Complete checklist
                            </button>
                          )}
                        {/* Approve (only when checklist already completed) */}
                        {child.approvalStatus === "pending" && (
                          <button
                            onClick={() => handleApprove(child)}
                            disabled={!child.checklistCompleted}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                            title={
                              child.checklistCompleted
                                ? "Approve"
                                : "Checklist must be completed before approval"
                            }
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                        )}
                        {child.approvalStatus === "approved" && (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-400 opacity-60 cursor-not-allowed dark:bg-emerald-950/40"
                            title="Already approved"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </button>
                        )}
                        {child.approvalStatus === "rejected" && (
                          <button
                            onClick={() => handleApprove(child)}
                            disabled={!child.checklistCompleted}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                            title={
                              child.checklistCompleted
                                ? "Approve"
                                : "Checklist must be completed before approval"
                            }
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                        )}

                        {/* Reject button - always second where applicable */}
                        {(child.approvalStatus === "pending" ||
                          child.approvalStatus === "approved") && (
                          <button
                            onClick={() => handleReject(child)}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                            title="Reject"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        )}

                        {/* Notify Parent - always after Approve + Reject */}
                        {(child.hasChecklist === false ||
                          child.checklistCompleted === false) &&
                          child.parentEmail && (
                            <button
                              onClick={() => handleNotifyParent(child)}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
                              title="Email parent a checklist reminder"
                            >
                              Notify Parent
                            </button>
                          )}
                        <button
                          onClick={() => handleViewDetails(child)}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(child)}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleOpenLinkParent(child)}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
                          title="Link Parent"
                        >
                          <Users className="h-3 w-3" />
                        </button>
                        {child.parentId && (
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/parents?email=${encodeURIComponent(
                                  child.parentEmail || "",
                                )}`,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="View Parent"
                          >
                            View Parent
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(child)}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit SideCanvas */}
      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedChild(null);
        }}
        title={isCreating ? "Create New Child" : "Edit Child"}
      >
        <form onSubmit={isCreating ? handleCreateChild : handleUpdateChild} className="space-y-4">
          <div>
            <label htmlFor="parent" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Parent <span className="text-rose-500">*</span>
            </label>
            <select
              id="parent"
              value={formData.user_id || ""}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              required
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">Select a parent</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Child Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                id="age"
                type="number"
                min="0"
                max="255"
                value={formData.age ?? ""}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) })}
                required
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender || "prefer_not_to_say"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={formData.date_of_birth || ""}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="postcode" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Postcode
              </label>
              <input
                id="postcode"
                type="text"
                value={formData.postcode || ""}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                City
              </label>
              <input
                id="city"
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="region" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Region
            </label>
            <input
              id="region"
              type="text"
              value={formData.region || ""}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          {isCreating && (
            <div>
              <label htmlFor="approvalStatus" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Initial Approval Status
              </label>
              <select
                id="approvalStatus"
                value={formData.approval_status || "pending"}
                onChange={(e) => setFormData({ ...formData, approval_status: e.target.value as any })}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isCreating ? "Create Child" : "Update Child"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedChild(null);
              }}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </SideCanvas>

      {/* View Details SideCanvas */}
      <SideCanvas
        isOpen={isViewingDetails}
        onClose={() => {
          setIsViewingDetails(false);
          setSelectedChild(null);
        }}
        title="Child Details"
      >
        {selectedChild && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Basic Information</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Name:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.name}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Age:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.age}</dd>
                </div>
                {selectedChild.dateOfBirth && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Date of Birth:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.dateOfBirth}</dd>
                  </div>
                )}
                {selectedChild.gender && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Gender:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.gender}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Parent Information</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Parent:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.parentName || "—"}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Email:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.parentEmail || "—"}</dd>
                </div>
                {selectedChild.parentPhone && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Phone:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.parentPhone}</dd>
                  </div>
                )}
              </dl>
            </div>

            {(selectedChild.address || selectedChild.city || selectedChild.postcode) && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Address</h3>
                <dl className="mt-2 space-y-1.5">
                  {selectedChild.address && (
                    <div className="text-xs">
                      <dt className="text-slate-600 dark:text-slate-400">Street:</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.address}</dd>
                    </div>
                  )}
                  {selectedChild.city && (
                    <div className="flex justify-between text-xs">
                      <dt className="text-slate-600 dark:text-slate-400">City:</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.city}</dd>
                    </div>
                  )}
                  {selectedChild.postcode && (
                    <div className="flex justify-between text-xs">
                      <dt className="text-slate-600 dark:text-slate-400">Postcode:</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.postcode}</dd>
                    </div>
                  )}
                  {selectedChild.region && (
                    <div className="flex justify-between text-xs">
                      <dt className="text-slate-600 dark:text-slate-400">Region:</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.region}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Approval Status</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Status:</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getApprovalBadgeClasses(
                        selectedChild.approvalStatus
                      )}`}
                    >
                      {selectedChild.approvalStatus}
                    </span>
                  </dd>
                </div>
                {selectedChild.approvedAt && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Approved At:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(selectedChild.approvedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {selectedChild.approvedByName && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Approved By:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.approvedByName}</dd>
                  </div>
                )}
                {selectedChild.rejectedAt && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Rejected At:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(selectedChild.rejectedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {selectedChild.rejectionReason && (
                  <div className="text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Rejection Reason:</dt>
                    <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">{selectedChild.rejectionReason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Checklist</h3>
              <dl className="mt-2 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <dt className="text-slate-600 dark:text-slate-400">Status:</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-50">
                    {!selectedChild.hasChecklist && "Missing"}
                    {selectedChild.hasChecklist && !selectedChild.checklistCompleted && "Pending"}
                    {selectedChild.hasChecklist && selectedChild.checklistCompleted && "Complete"}
                  </dd>
                </div>
                {selectedChild.checklistCompletedAt && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-slate-600 dark:text-slate-400">Completed At:</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-50">
                      {new Date(selectedChild.checklistCompletedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {selectedChild.checklist && (
                  <>
                    {selectedChild.checklist.emergencyContactName && (
                      <div className="flex justify-between text-xs">
                        <dt className="text-slate-600 dark:text-slate-400">Emergency Contact:</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">
                          {selectedChild.checklist.emergencyContactName}
                        </dd>
                      </div>
                    )}
                    {selectedChild.checklist.emergencyContactPhone && (
                      <div className="flex justify-between text-xs">
                        <dt className="text-slate-600 dark:text-slate-400">Emergency Phone:</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-50">
                          {selectedChild.checklist.emergencyContactPhone}
                        </dd>
                      </div>
                    )}
                    {(selectedChild.checklist.medicalConditions ||
                      selectedChild.checklist.allergies) && (
                      <div className="text-xs">
                        <dt className="text-slate-600 dark:text-slate-400">Medical / Allergies:</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">
                          {selectedChild.checklist.medicalConditions || 'None reported'}
                          {selectedChild.checklist.allergies
                            ? `\nAllergies: ${selectedChild.checklist.allergies}`
                            : ''}
                        </dd>
                      </div>
                    )}
                    {selectedChild.checklist.activityRestrictions && (
                      <div className="text-xs">
                        <dt className="text-slate-600 dark:text-slate-400">Activity Restrictions:</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50 whitespace-pre-line">
                          {selectedChild.checklist.activityRestrictions}
                        </dd>
                      </div>
                    )}
                    {(selectedChild.checklist.consentPhotography ||
                      selectedChild.checklist.consentMedicalTreatment) && (
                      <div className="text-xs">
                        <dt className="text-slate-600 dark:text-slate-400">Consents:</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                          {selectedChild.checklist.consentPhotography && 'Photography consent; '}
                          {selectedChild.checklist.consentMedicalTreatment &&
                            'Emergency medical treatment consent'}
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>

            {selectedChild.bookings && selectedChild.bookings.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Booking History</h3>
                <div className="mt-2 space-y-2">
                  {selectedChild.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                          {booking.reference}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          {booking.status}
                        </span>
                      </div>
                      {booking.packageName && (
                        <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                          {booking.packageName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SideCanvas>

      {/* Link Parent SideCanvas */}
      <SideCanvas
        isOpen={isLinkingParent}
        onClose={() => {
          setIsLinkingParent(false);
          setSelectedChild(null);
          setSelectedParentId("");
        }}
        title="Link to Different Parent"
      >
        {selectedChild && (
          <form onSubmit={handleLinkParent} className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Currently linked to: <span className="font-medium text-slate-900 dark:text-slate-50">{selectedChild.parentName || "No parent"}</span>
              </p>
            </div>

            <div>
              <label htmlFor="newParent" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                Select New Parent <span className="text-rose-500">*</span>
              </label>
              <select
                id="newParent"
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                required
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
              >
                <option value="">Select a parent</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || !selectedParentId}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Linking..." : "Link Parent"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLinkingParent(false);
                  setSelectedChild(null);
                  setSelectedParentId("");
                }}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </SideCanvas>

      {/* Review checklist modal: admin must see checklist content before marking complete & approve */}
      <BaseModal
        isOpen={reviewChecklistChildId !== null}
        onClose={() => {
          if (!reviewChecklistSubmitting) {
            setReviewChecklistChildId(null);
            setReviewChecklistChild(null);
          }
        }}
        title={
          reviewChecklistChild
            ? `Review checklist – ${reviewChecklistChild.name}`
            : "Review checklist"
        }
        size="lg"
        preventBackdropClose={reviewChecklistSubmitting}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReviewChecklistChildId(null);
                setReviewChecklistChild(null);
              }}
              disabled={reviewChecklistSubmitting}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCompleteChecklist}
              disabled={reviewChecklistLoading || reviewChecklistSubmitting || !reviewChecklistChild?.checklist}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              {reviewChecklistSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Mark complete & approve
                </>
              )}
            </button>
          </div>
        }
      >
        {reviewChecklistLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : !reviewChecklistChild ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Failed to load checklist.</p>
        ) : !reviewChecklistChild.checklist ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">This child has no checklist.</p>
        ) : (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Review the checklist below. When satisfied, click &quot;Mark complete & approve&quot; to approve the child.
            </p>
            <ChecklistContentDisplay checklist={reviewChecklistChild.checklist} />
          </div>
        )}
      </BaseModal>
    </section>
  );
};
