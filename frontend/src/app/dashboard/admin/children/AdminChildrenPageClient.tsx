'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideCanvas from "@/components/ui/SideCanvas";
import { BaseModal } from "@/components/ui/Modal";
import {
  Breadcrumbs,
  DataTable,
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
  type Column,
  type SortDirection,
} from "@/components/dashboard/universal";
import {
  RowActions,
  ViewAction,
  EditAction,
  DeleteAction,
  ApproveAction,
  RejectAction,
} from "@/components/dashboard/universal/RowActions";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from "@/utils/appConstants";
import { useAdminChildren, type AdminChildRow } from "@/interfaces/web/hooks/dashboard/useAdminChildren";
import { useAdminUsers } from "@/interfaces/web/hooks/dashboard/useAdminUsers";
import { useLiveRefresh } from "@/core/liveRefresh/LiveRefreshContext";
import { LIVE_REFRESH_ENABLED } from "@/utils/liveRefreshConstants";
import type { CreateChildDTO, UpdateChildDTO } from "@/core/application/admin/dto/AdminChildDTO";
import type { AdminChildChecklistDTO } from "@/core/application/admin/dto/AdminChildDTO";
import { Download, CheckCircle, Users, ClipboardCheck, Loader2 } from "lucide-react";
import { toastManager } from "@/utils/toast";
import { EMPTY_STATE } from "@/utils/emptyStateConstants";
import { DEFAULT_TABLE_SORT } from "@/utils/dashboardConstants";

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
  const [sortKey, setSortKey] = useState<string | null>(DEFAULT_TABLE_SORT.sortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TABLE_SORT.sortDirection);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>("");
  const [ageMinFilter, setAgeMinFilter] = useState<number | undefined>(undefined);
  const [ageMaxFilter, setAgeMaxFilter] = useState<number | undefined>(undefined);
  const [parentIdFilter, setParentIdFilter] = useState<string>("");
  const [hoursFilter, setHoursFilter] = useState<string>("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedApprovalStatus, setStagedApprovalStatus] = useState<string>("");
  const [stagedAgeMin, setStagedAgeMin] = useState<number | undefined>(undefined);
  const [stagedAgeMax, setStagedAgeMax] = useState<number | undefined>(undefined);
  const [stagedHours, setStagedHours] = useState<string>("");

  // UI state
  const [selectedChild, setSelectedChild] = useState<AdminChildRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isLinkingParent, setIsLinkingParent] = useState(false);
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

  const hasActiveFilters =
    approvalStatusFilter !== "" ||
    ageMinFilter != null ||
    ageMaxFilter != null ||
    hoursFilter !== "";
  const activeFilterCount =
    (approvalStatusFilter ? 1 : 0) +
    (ageMinFilter != null ? 1 : 0) +
    (ageMaxFilter != null ? 1 : 0) +
    (hoursFilter ? 1 : 0);
  const hasStagedFilters =
    stagedApprovalStatus !== "" ||
    stagedAgeMin != null ||
    stagedAgeMax != null ||
    stagedHours !== "";
  const stagedFilterCount =
    (stagedApprovalStatus ? 1 : 0) +
    (stagedAgeMin != null ? 1 : 0) +
    (stagedAgeMax != null ? 1 : 0) +
    (stagedHours ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedApprovalStatus(approvalStatusFilter);
      setStagedAgeMin(ageMinFilter);
      setStagedAgeMax(ageMaxFilter);
      setStagedHours(hoursFilter);
    }
  }, [filterPanelOpen, approvalStatusFilter, ageMinFilter, ageMaxFilter, hoursFilter]);

  const handleApplyFilters = useCallback(() => {
    setApprovalStatusFilter(stagedApprovalStatus);
    setAgeMinFilter(stagedAgeMin);
    setAgeMaxFilter(stagedAgeMax);
    setHoursFilter(stagedHours);
    setFilterPanelOpen(false);
  }, [stagedApprovalStatus, stagedAgeMin, stagedAgeMax, stagedHours]);

  const handleResetAllStaged = useCallback(() => {
    setStagedApprovalStatus("");
    setStagedAgeMin(undefined);
    setStagedAgeMax(undefined);
    setStagedHours("");
  }, []);

  const handleClearFilters = () => {
    setApprovalStatusFilter("");
    setAgeMinFilter(undefined);
    setAgeMaxFilter(undefined);
    setHoursFilter("");
    setSearch("");
  };

  const sortedChildren = useMemo(() => {
    const list = [...children];
    const key = sortKey ?? DEFAULT_TABLE_SORT.sortKey;
    const dir = sortDirection ?? DEFAULT_TABLE_SORT.sortDirection;
    list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (key === "name") {
        aVal = a.name ?? "";
        bVal = b.name ?? "";
      } else if (key === "parentName") {
        aVal = a.parentName ?? "";
        bVal = b.parentName ?? "";
      } else if (key === "age") {
        aVal = a.age ?? 0;
        bVal = b.age ?? 0;
      } else if (key === "remainingHours") {
        aVal = a.remainingHours ?? -1;
        bVal = b.remainingHours ?? -1;
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
  }, [children, sortKey, sortDirection]);

  const handleSortChange = (key: string | null, dir: "asc" | "desc" | null) => {
    setSortKey(key);
    setSortDirection(dir ?? "asc");
  };

  const childColumns: Column<AdminChildRow>[] = useMemo(
    () => [
      { id: "name", header: "Child Name", sortable: true, accessor: (row) => row.name },
      {
        id: "checklistStatus",
        header: "Checklist Status",
        sortable: false,
        accessor: (row) =>
          row.hasChecklist ? (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold ${
                row.checklistCompleted
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {row.checklistCompleted ? "Complete" : "Pending"}
            </span>
          ) : (
            <span className="inline-flex rounded-full px-2 py-0.5 text-2xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              Missing
            </span>
          ),
      },
      {
        id: "approvalStatus",
        header: "Approval Status",
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
      { id: "parentName", header: "Parent", sortable: true, accessor: (row) => row.parentName || "—" },
      { id: "parentEmail", header: "Parent Email", sortable: false, accessor: (row) => row.parentEmail || "—" },
      { id: "age", header: "Age", sortable: true, align: "right", accessor: (row) => row.age },
      { id: "gender", header: "Gender", sortable: false, accessor: (row) => row.gender || "—" },
      {
        id: "remainingHours",
        header: "Remaining hours",
        sortable: true,
        align: "right",
        accessor: (row) =>
          row.remainingHours != null ? (
            <span
              className={
                row.remainingHours === 0 ? "font-semibold text-amber-600 dark:text-amber-400" : ""
              }
            >
              {row.remainingHours}h
            </span>
          ) : (
            "—"
          ),
      },
    ],
    []
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
        <Breadcrumbs
          items={[
            { label: "Admin", href: ROUTES.DASHBOARD_ADMIN },
            { label: "Children" },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Children Management
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            You can only approve children with a <span className="font-semibold">Complete</span> checklist.
          </p>
        </div>
      </header>

      {/* Toolbar: Search (left) + Filter + Export + New Child (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search children…"
          className="min-w-[160px] max-w-[320px] w-full md:w-auto flex-1"
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <FilterTriggerButton
              ref={filterTriggerRef}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              onClick={() => setFilterPanelOpen(true)}
            />
            <Button type="button" size="sm" variant="bordered" onClick={handleExport} icon={<Download className="h-3.5 w-3.5" />}>
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setFormData({
                  name: "",
                  age: 0,
                  gender: "prefer_not_to_say",
                  approval_status: "pending",
                });
                setIsCreating(true);
              }}
            >
              + New Child
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
              { label: "All", value: "" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Min Age"
          onReset={() => setStagedAgeMin(undefined)}
          isActive={stagedAgeMin != null}
        >
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={stagedAgeMin ?? ""}
            onChange={(e) => setStagedAgeMin(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            aria-label="Min age"
          />
        </FilterSection>
        <FilterSection
          title="Max Age"
          onReset={() => setStagedAgeMax(undefined)}
          isActive={stagedAgeMax != null}
        >
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={stagedAgeMax ?? ""}
            onChange={(e) => setStagedAgeMax(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            aria-label="Max age"
          />
        </FilterSection>
        <FilterSection
          title="Remaining hours"
          onReset={() => setStagedHours("")}
          isActive={stagedHours !== ""}
        >
          <FilterSelect
            label=""
            value={stagedHours}
            onChange={setStagedHours}
            options={[
              { label: "All", value: "" },
              { label: "0 hours only", value: "0" },
            ]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

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
      <DataTable<AdminChildRow>
        columns={childColumns}
        data={sortedChildren}
        isLoading={loading}
        error={error}
        onRetry={() => void refetchChildren(true)}
        emptyTitle={EMPTY_STATE.NO_CHILDREN_FOUND.title}
        emptyMessage={EMPTY_STATE.NO_CHILDREN_FOUND.message}
        searchable
        searchPlaceholder="Search children…"
        searchQuery={search}
        onSearchQueryChange={setSearch}
        sortable
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        renderRowActions={(child) => (
          <RowActions>
            {child.approvalStatus === "pending" && child.hasChecklist && !child.checklistCompleted && (
              <Button
                type="button"
                size="sm"
                variant="bordered"
                onClick={(e) => {
                  e?.stopPropagation();
                  handleOpenCompleteChecklist(child);
                }}
                className="min-w-0 border-blue-300 bg-blue-50 p-1.5 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                aria-label="Complete checklist"
                title="Complete checklist"
              >
                <ClipboardCheck className="h-3 w-3" />
              </Button>
            )}
            {child.approvalStatus === "pending" && (
              <ApproveAction
                onClick={() => handleApprove(child)}
                disabled={!child.checklistCompleted}
                aria-label="Approve"
              />
            )}
            {child.approvalStatus === "rejected" && (
              <ApproveAction
                onClick={() => handleApprove(child)}
                disabled={!child.checklistCompleted}
                aria-label="Approve"
                title="Re-approve"
              />
            )}
            {(child.approvalStatus === "pending" || child.approvalStatus === "approved") && (
              <RejectAction onClick={() => handleReject(child)} aria-label="Reject" />
            )}
            {(child.hasChecklist === false || child.checklistCompleted === false) && child.parentEmail && (
              <Button
                type="button"
                size="sm"
                variant="bordered"
                onClick={(e) => {
                  e?.stopPropagation();
                  handleNotifyParent(child);
                }}
                aria-label="Notify parent"
                title="Notify parent"
                className="min-w-0 p-1.5 text-2xs"
              >
                Notify
              </Button>
            )}
            <ViewAction onClick={() => handleViewDetails(child)} aria-label="View details" title="View details" />
            <EditAction onClick={() => handleEdit(child)} aria-label="Edit" />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e?.stopPropagation();
                handleOpenLinkParent(child);
              }}
              aria-label="Link parent"
              title="Link parent"
              className="min-w-0 p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Users className="h-3 w-3" />
            </Button>
            {child.parentId && (
              <Button
                type="button"
                size="sm"
                variant="bordered"
                onClick={(e) => {
                  e?.stopPropagation();
                  router.push(
                    `/dashboard/admin/parents?email=${encodeURIComponent(child.parentEmail ?? "")}`
                  );
                }}
                aria-label="View parent"
                title="View parent"
                className="min-w-0 p-1.5 text-2xs"
              >
                View Parent
              </Button>
            )}
            <DeleteAction onClick={() => handleDelete(child)} aria-label="Delete" />
          </RowActions>
        )}
        onRowClick={(child) => handleViewDetails(child)}
        responsive
      />

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
                      className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ${getApprovalBadgeClasses(
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
                        <span className="text-2xs text-slate-600 dark:text-slate-400">
                          {booking.status}
                        </span>
                      </div>
                      {booking.packageName && (
                        <div className="mt-1 text-2xs text-slate-600 dark:text-slate-400">
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
