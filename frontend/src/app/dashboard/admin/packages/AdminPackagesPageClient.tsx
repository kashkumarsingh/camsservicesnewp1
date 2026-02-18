'use client';

import React, { useMemo, useState } from "react";
import SideCanvas from "@/components/ui/SideCanvas";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";
import { SKELETON_COUNTS } from "@/utils/skeletonConstants";
import { Filter } from "lucide-react";
import type { AdminPackageDTO, CreatePackageDTO, UpdatePackageDTO } from "@/core/application/admin/dto/AdminPackageDTO";
import { useAdminPackages } from "@/interfaces/web/hooks/admin/useAdminPackages";
import { toastManager } from "@/utils/toast";

type PackageFormData = CreatePackageDTO | UpdatePackageDTO;

function getActiveBadgeClasses(isActive: boolean) {
  return isActive
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AdminPackagesPageClient: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedPackage, setSelectedPackage] = useState<AdminPackageDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
    name: "",
    price: 0,
    hours: 1,
    isActive: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterValue = activeFilter === "all" ? undefined : activeFilter === "active";

  const { packages, loading, error, createPackage, updatePackage, deletePackage } = useAdminPackages({
    isActive: activeFilterValue,
    search: search.trim() || undefined,
  });

  const filtered = useMemo(() => {
    let result = packages;
    
    // Apply age group filter
    if (ageGroupFilter) {
      result = result.filter((pkg) => pkg.ageGroup === ageGroupFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter) {
      result = result.filter((pkg) => pkg.difficultyLevel === difficultyFilter);
    }

    return result;
  }, [packages, ageGroupFilter, difficultyFilter]);

  const ageGroups = useMemo(() => {
    const groups = packages.map((p) => p.ageGroup).filter(Boolean) as string[];
    return Array.from(new Set(groups)).sort();
  }, [packages]);

  const handleCreateClick = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      hours: 1,
      durationWeeks: undefined,
      ageGroup: "",
      difficultyLevel: undefined,
      isActive: false,
      isPopular: false,
    });
    setIsCreating(true);
  };

  const handleEditClick = (pkg: AdminPackageDTO) => {
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || "",
      price: pkg.price,
      hours: pkg.hours,
      durationWeeks: pkg.durationWeeks || undefined,
      ageGroup: pkg.ageGroup || "",
      difficultyLevel: pkg.difficultyLevel || undefined,
      maxParticipants: pkg.maxParticipants || undefined,
      spotsRemaining: pkg.spotsRemaining || undefined,
      totalSpots: pkg.totalSpots || undefined,
      isActive: pkg.isActive,
      isPopular: pkg.isPopular,
    });
    setSelectedPackage(pkg);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isCreating) {
        await createPackage(formData as CreatePackageDTO);
        setIsCreating(false);
        toastManager.success("Package created successfully.");
      } else if (isEditing && selectedPackage) {
        await updatePackage(selectedPackage.id, formData as UpdatePackageDTO);
        setIsEditing(false);
        setSelectedPackage(null);
        toastManager.success("Package updated successfully.");
      }

      setFormData({
        name: "",
        price: 0,
        hours: 1,
        isActive: false,
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      await deletePackage(id);
      if (selectedPackage?.id === id) {
        setSelectedPackage(null);
      }
      toastManager.success("Package deleted successfully.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Packages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage packages with full CRUD operations, filtering, and search capabilities.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, description..."
              className="h-9 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-expanded={showFilters}
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters ? "Hide" : "Show"} filters
            </button>
            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              New package
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Age group
                </label>
                <select
                  value={ageGroupFilter}
                  onChange={(event) => setAgeGroupFilter(event.target.value)}
                  className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All age groups</option>
                  {ageGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Difficulty
                </label>
                <select
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value)}
                  className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All difficulty levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Status
                </label>
                <select
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value)}
                  className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setAgeGroupFilter("");
                    setDifficultyFilter("");
                    setActiveFilter("all");
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Hours
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Age Group
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Views
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={7} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No packages found.
                  </td>
                </tr>
              ) : (
                filtered.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {pkg.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      £{pkg.price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {pkg.hours}h
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {pkg.ageGroup || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getActiveBadgeClasses(
                          pkg.isActive
                        )}`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {pkg.views}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-right text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleEditClick(pkg)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      {" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
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
            Showing {filtered.length} of {packages.length} package{packages.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Detail View Canvas */}
      <SideCanvas
        isOpen={!!selectedPackage && !isEditing}
        onClose={() => setSelectedPackage(null)}
        title={selectedPackage ? selectedPackage.name : "Package details"}
      >
        {selectedPackage && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  handleEditClick(selectedPackage);
                  setSelectedPackage(null);
                }}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPackage(null);
                  handleDelete(selectedPackage.id);
                }}
                className="inline-flex items-center rounded-md border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Delete
              </button>
            </div>
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Name</dt>
                  <dd>{selectedPackage.name}</dd>
                </div>
                <div>
                  <dt className="font-medium">Slug</dt>
                  <dd>{selectedPackage.slug}</dd>
                </div>
                <div>
                  <dt className="font-medium">Price</dt>
                  <dd>£{selectedPackage.price}</dd>
                </div>
                <div>
                  <dt className="font-medium">Hours</dt>
                  <dd>{selectedPackage.hours}</dd>
                </div>
                <div>
                  <dt className="font-medium">Age Group</dt>
                  <dd>{selectedPackage.ageGroup || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Difficulty</dt>
                  <dd>{selectedPackage.difficultyLevel || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Description</dt>
                  <dd>{selectedPackage.description || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Views</dt>
                  <dd>{selectedPackage.views}</dd>
                </div>
                <div>
                  <dt className="font-medium">Status</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getActiveBadgeClasses(
                        selectedPackage.isActive
                      )}`}
                    >
                      {selectedPackage.isActive ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
              </dl>
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
          setSelectedPackage(null);
        }}
        title={isCreating ? "Create package" : "Edit package"}
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
            <label htmlFor="slug" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Price (£) *
            </label>
            <input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="hours" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Hours *
            </label>
            <input
              type="number"
              id="hours"
              required
              min="1"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="durationWeeks" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Duration (weeks)
            </label>
            <input
              type="number"
              id="durationWeeks"
              min="1"
              value={formData.durationWeeks || ""}
              onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value ? parseInt(e.target.value) : undefined })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="ageGroup" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Age Group
            </label>
            <input
              type="text"
              id="ageGroup"
              value={formData.ageGroup || ""}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="difficultyLevel" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Difficulty Level
            </label>
            <select
              id="difficultyLevel"
              value={formData.difficultyLevel || ""}
              onChange={(e) => setFormData({ ...formData, difficultyLevel: (e.target.value || undefined) as any })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            >
              <option value="">Select difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Active
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular || false}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPopular" className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Popular
              </label>
            </div>
          </div>

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
                setSelectedPackage(null);
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
