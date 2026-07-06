'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SideCanvas from '@/components/ui/SideCanvas';
import {
  Breadcrumbs,
  FilterPanel,
  FilterSection,
  FilterSelect,
  FilterTriggerButton,
  SearchInput,
} from '@/components/dashboard/universal';
import { RowActions, EditAction, DeleteAction } from '@/components/dashboard/universal/RowActions';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import { TabbedSidePanelContent } from '@/components/ui/TabbedSidePanelContent';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import { Download } from 'lucide-react';
import { toastManager } from '@/dashboard/utils/toast';
import { useAdminStaff, type AdminStaffRow } from '@/interfaces/web/hooks/admin/useAdminStaff';
import type { CreateStaffDTO, UpdateStaffDTO } from '@/core/application/admin/dto/AdminStaffDTO';
import {
  createEmptyStaffForm,
  getStaffEmploymentStatusLabel,
  getStaffVisaStatusLabel,
  STAFF_EMPLOYMENT_STATUS_OPTIONS,
  STAFF_VISA_STATUS_OPTIONS,
} from '@/core/application/admin/dto/AdminStaffDTO';
import { StaffForm } from './StaffForm';

type StaffFormData = CreateStaffDTO | UpdateStaffDTO;

function getEmploymentBadgeClasses(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'on_leave':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'offboarded':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

function staffToFormData(member: AdminStaffRow): UpdateStaffDTO {
  return {
    name: member.name,
    email: member.email ?? '',
    phone: member.phone ?? '',
    addressLineOne: member.addressLineOne ?? '',
    addressLineTwo: member.addressLineTwo ?? '',
    city: member.city ?? '',
    county: member.county ?? '',
    postcode: member.postcode ?? '',
    jobTitle: member.jobTitle,
    department: member.department ?? '',
    citizenship: member.citizenship ?? '',
    visaStatus: member.visaStatus,
    rightToWorkVerified: member.rightToWorkVerified,
    rightToWorkVerifiedAt: member.rightToWorkVerifiedAt ?? '',
    rightToWorkExpiresAt: member.rightToWorkExpiresAt ?? '',
    startDate: member.startDate ?? '',
    employmentStatus: member.employmentStatus,
    hasDbsCheck: member.hasDbsCheck,
    dbsCertificateNumber: member.dbsCertificateNumber ?? '',
    dbsIssuedAt: member.dbsIssuedAt ?? '',
    dbsExpiresAt: member.dbsExpiresAt ?? '',
    emergencyContactName: member.emergencyContactName ?? '',
    emergencyContactPhone: member.emergencyContactPhone ?? '',
    notes: member.notes ?? '',
  };
}

export const AdminStaffPageClient: React.FC = () => {
  const [search, setSearch] = useState('');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('');
  const [visaStatusFilter, setVisaStatusFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const [stagedEmploymentStatus, setStagedEmploymentStatus] = useState('');
  const [stagedVisaStatus, setStagedVisaStatus] = useState('');

  const [selectedStaff, setSelectedStaff] = useState<AdminStaffRow | null>(null);
  const [detailsTabId, setDetailsTabId] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>(createEmptyStaffForm());

  const { staff, loading, error, createStaff, updateStaff, deleteStaff } = useAdminStaff({
    employmentStatus: employmentStatusFilter || undefined,
    visaStatus: visaStatusFilter || undefined,
    search: search || undefined,
  });

  const hasActiveFilters = employmentStatusFilter !== '' || visaStatusFilter !== '';
  const activeFilterCount = (employmentStatusFilter ? 1 : 0) + (visaStatusFilter ? 1 : 0);
  const hasStagedFilters = stagedEmploymentStatus !== '' || stagedVisaStatus !== '';
  const stagedFilterCount = (stagedEmploymentStatus ? 1 : 0) + (stagedVisaStatus ? 1 : 0);

  useEffect(() => {
    if (filterPanelOpen) {
      setStagedEmploymentStatus(employmentStatusFilter);
      setStagedVisaStatus(visaStatusFilter);
    }
  }, [filterPanelOpen, employmentStatusFilter, visaStatusFilter]);

  const handleApplyFilters = useCallback(() => {
    setEmploymentStatusFilter(stagedEmploymentStatus);
    setVisaStatusFilter(stagedVisaStatus);
    setFilterPanelOpen(false);
  }, [stagedEmploymentStatus, stagedVisaStatus]);

  const handleResetAllStaged = useCallback(() => {
    setStagedEmploymentStatus('');
    setStagedVisaStatus('');
  }, []);

  const handleClearFilters = () => {
    setEmploymentStatusFilter('');
    setVisaStatusFilter('');
    setSearch('');
  };

  const handleCreateClick = () => {
    setFormData(createEmptyStaffForm());
    setIsCreating(true);
  };

  const handleEditClick = (member: AdminStaffRow) => {
    setFormData(staffToFormData(member));
    setSelectedStaff(member);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name?.trim() || !formData.jobTitle?.trim()) {
      toastManager.error('Name and job title are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isCreating) {
        await createStaff(formData as CreateStaffDTO);
        toastManager.success('Staff member onboarded.');
        setIsCreating(false);
      } else if (isEditing && selectedStaff) {
        await updateStaff(selectedStaff.id, formData as UpdateStaffDTO);
        toastManager.success('Staff record updated.');
        setIsEditing(false);
        setSelectedStaff(null);
      }
      setFormData(createEmptyStaffForm());
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to save staff record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff record? This cannot be undone.')) return;
    try {
      await deleteStaff(id);
      toastManager.success('Staff record deleted.');
      if (selectedStaff?.id === id) setSelectedStaff(null);
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : 'Failed to delete staff record');
    }
  };

  const handleExport = () => {
    if (staff.length === 0) return;
    const csvData = staff.map((member) => ({
      ID: member.id,
      Name: member.name,
      Email: member.email ?? '',
      Phone: member.phone ?? '',
      'Job Title': member.jobTitle,
      Department: member.department ?? '',
      Citizenship: member.citizenship ?? '',
      'Visa Status': getStaffVisaStatusLabel(member.visaStatus),
      'Right to Work Verified': member.rightToWorkVerified ? 'Yes' : 'No',
      'Start Date': member.startDate ?? '',
      Status: getStaffEmploymentStatusLabel(member.employmentStatus),
      'DBS on File': member.hasDbsCheck ? 'Yes' : 'No',
      'Onboarded At': member.onboardedAt ?? '',
      'Recorded By': member.onboardedByName ?? '',
    }));

    const headers = Object.keys(csvData[0] ?? {});
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((h) => `"${String(row[h as keyof typeof row] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `staff-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedStaff = useMemo(
    () => [...staff].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [staff]
  );

  const detailTabs = selectedStaff
    ? [
        {
          id: 'overview',
          label: 'Overview',
          content: (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Job title</p>
                <p className="text-slate-900 dark:text-slate-50">{selectedStaff.jobTitle}</p>
                {selectedStaff.department && (
                  <p className="text-slate-600 dark:text-slate-400">{selectedStaff.department}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact</p>
                <p className="text-slate-900 dark:text-slate-50">{selectedStaff.email || '—'}</p>
                <p className="text-slate-600 dark:text-slate-400">{selectedStaff.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Onboarding</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {formatDate(selectedStaff.onboardedAt ?? selectedStaff.startDate)}
                </p>
                {selectedStaff.onboardedByName && (
                  <p className="text-slate-600 dark:text-slate-400">
                    Recorded by {selectedStaff.onboardedByName}
                  </p>
                )}
              </div>
            </div>
          ),
        },
        {
          id: 'right-to-work',
          label: 'Right to work',
          content: (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Citizenship</p>
                <p className="text-slate-900 dark:text-slate-50">{selectedStaff.citizenship || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visa status</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {getStaffVisaStatusLabel(selectedStaff.visaStatus)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verified</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {selectedStaff.rightToWorkVerified ? 'Yes' : 'No'}
                  {selectedStaff.rightToWorkVerifiedAt
                    ? ` · ${formatDate(selectedStaff.rightToWorkVerifiedAt)}`
                    : ''}
                </p>
              </div>
              {selectedStaff.rightToWorkExpiresAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Expires</p>
                  <p className="text-slate-900 dark:text-slate-50">
                    {formatDate(selectedStaff.rightToWorkExpiresAt)}
                  </p>
                </div>
              )}
            </div>
          ),
        },
        {
          id: 'compliance',
          label: 'DBS',
          content: (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Enhanced DBS</p>
                <p className="text-slate-900 dark:text-slate-50">
                  {selectedStaff.hasDbsCheck ? 'On file' : 'Not recorded'}
                </p>
              </div>
              {selectedStaff.dbsCertificateNumber && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Certificate</p>
                  <p className="text-slate-900 dark:text-slate-50">{selectedStaff.dbsCertificateNumber}</p>
                </div>
              )}
              {(selectedStaff.dbsIssuedAt || selectedStaff.dbsExpiresAt) && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Validity</p>
                  <p className="text-slate-900 dark:text-slate-50">
                    {formatDate(selectedStaff.dbsIssuedAt)} – {formatDate(selectedStaff.dbsExpiresAt)}
                  </p>
                </div>
              )}
              {selectedStaff.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notes</p>
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selectedStaff.notes}</p>
                </div>
              )}
            </div>
          ),
        },
      ]
    : [];

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Staff' },
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
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Staff management
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Keep records of internal staff onboarding: job titles, visa status, citizenship, and compliance.
          Separate from trainers who deliver sessions.{' '}
          <Link href={ROUTES.DASHBOARD_ADMIN_DOCUMENTS} className="font-medium text-primary-blue hover:underline">
            View compliance documents
          </Link>
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
          placeholder="Search by name, email, or job title…"
          className="min-w-[160px] max-w-[320px] w-full md:w-auto flex-1"
        />
        <div className="flex flex-shrink-0 items-center gap-2">
          <FilterTriggerButton
            ref={filterTriggerRef}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onClick={() => setFilterPanelOpen(true)}
          />
          {hasActiveFilters && (
            <DashboardButton type="button" size="sm" variant="bordered" onClick={handleClearFilters}>
              Clear filters
            </DashboardButton>
          )}
          <DashboardButton
            type="button"
            size="sm"
            variant="bordered"
            onClick={handleExport}
            disabled={staff.length === 0}
            icon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </DashboardButton>
          <DashboardButton type="button" size="sm" variant="primary" onClick={handleCreateClick}>
            Onboard staff
          </DashboardButton>
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
          title="Employment status"
          onReset={() => setStagedEmploymentStatus('')}
          isActive={stagedEmploymentStatus !== ''}
        >
          <FilterSelect
            label=""
            value={stagedEmploymentStatus}
            onChange={setStagedEmploymentStatus}
            options={[{ label: 'All statuses', value: '' }, ...STAFF_EMPLOYMENT_STATUS_OPTIONS]}
            size="panel"
          />
        </FilterSection>
        <FilterSection
          title="Visa status"
          onReset={() => setStagedVisaStatus('')}
          isActive={stagedVisaStatus !== ''}
        >
          <FilterSelect
            label=""
            value={stagedVisaStatus}
            onChange={setStagedVisaStatus}
            options={[{ label: 'All visa types', value: '' }, ...STAFF_VISA_STATUS_OPTIONS]}
            size="panel"
          />
        </FilterSection>
      </FilterPanel>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[480px] overflow-x-auto overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Job title
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Citizenship
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visa status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  RTW
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-xs text-slate-500">
                    Loading staff records…
                  </td>
                </tr>
              ) : sortedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-xs text-slate-500">
                    No staff records yet. Use &quot;Onboard staff&quot; to add your first team member.
                  </td>
                </tr>
              ) : (
                sortedStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => {
                      setSelectedStaff(member);
                      setDetailsTabId('overview');
                    }}
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900 dark:text-slate-50">
                      {member.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-200">
                      {member.jobTitle}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-300">
                      {member.citizenship || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-300">
                      {getStaffVisaStatusLabel(member.visaStatus)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          member.rightToWorkVerified
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {member.rightToWorkVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getEmploymentBadgeClasses(member.employmentStatus)}`}
                      >
                        {getStaffEmploymentStatusLabel(member.employmentStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions>
                        <EditAction onClick={() => handleEditClick(member)} />
                        <DeleteAction onClick={() => handleDelete(member.id)} />
                      </RowActions>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SideCanvas
        isOpen={Boolean(selectedStaff) && !isEditing}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.name ?? 'Staff profile'}
        description={selectedStaff?.jobTitle}
        footer={
          selectedStaff ? (
            <div className="flex justify-end gap-2">
              <DashboardButton
                type="button"
                size="sm"
                variant="bordered"
                onClick={() => setSelectedStaff(null)}
              >
                Close
              </DashboardButton>
              <DashboardButton
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleEditClick(selectedStaff)}
              >
                Edit profile
              </DashboardButton>
            </div>
          ) : undefined
        }
      >
        {selectedStaff && (
          <TabbedSidePanelContent
            tabs={detailTabs}
            activeTabId={detailsTabId}
            onTabChange={setDetailsTabId}
          />
        )}
      </SideCanvas>

      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedStaff(null);
        }}
        title={isCreating ? 'Onboard new staff member' : 'Edit staff profile'}
        description={
          isCreating
            ? 'Record job title, visa status, citizenship, and compliance details'
            : selectedStaff?.name
        }
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton
              type="button"
              size="sm"
              variant="bordered"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </DashboardButton>
            <DashboardButton
              type="submit"
              form="staff-form"
              size="sm"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : isCreating ? 'Onboard staff' : 'Save changes'}
            </DashboardButton>
          </div>
        }
      >
        <form id="staff-form" onSubmit={handleFormSubmit}>
          <StaffForm
            formData={formData}
            onChange={setFormData}
            isCreating={isCreating}
          />
        </form>
      </SideCanvas>
    </section>
  );
};
