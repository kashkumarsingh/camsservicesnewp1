'use client';

import React, { useMemo, useState } from "react";
import SideCanvas from "@/components/ui/SideCanvas";
import { Filter } from "lucide-react";
import type { AdminActivityDTO, CreateActivityDTO, UpdateActivityDTO } from "@/core/application/admin/dto/AdminActivityDTO";
import { useAdminActivities } from "@/interfaces/web/hooks/admin/useAdminActivities";
import { toastManager } from "@/utils/toast";

type ActivityFormData = CreateActivityDTO | UpdateActivityDTO;

const CATEGORY_DATALIST_ID = "activity-category-datalist";
const CATEGORY_FILTER_DATALIST_ID = "activity-category-filter-datalist";

function formatDuration(duration: number | null): string {
  if (duration === null || Number.isNaN(duration)) return "—";
  if (duration === 1) return "1 hr";
  if (duration < 1) {
    const minutes = Math.round(duration * 60);
    return `${minutes} min`;
  }
  return `${duration} hrs`;
}

export const AdminActivitiesPageClient: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<AdminActivityDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    name: "",
    slug: "",
    category: "",
    description: "",
    duration: 1,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const isActiveFilterValue =
    statusFilter === "all" ? undefined : statusFilter === "active";

  const {
    activities,
    loading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch,
  } = useAdminActivities({
    isActive: isActiveFilterValue,
    search: search.trim() || undefined,
  });

  const filtered = useMemo(() => {
    let result = activities;
    if (categoryFilter) {
      result = result.filter((activity) => activity.category === categoryFilter);
    }
    return result;
  }, [activities, categoryFilter]);

  const categories = useMemo(() => {
    const cats = activities.map((a) => a.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [activities]);

  const handleCreateClick = () => {
    setFormData({
      name: "",
      slug: "",
      category: "",
      description: "",
      duration: 1,
      isActive: true,
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedActivity(null);
  };

  const handleEditClick = (activity: AdminActivityDTO) => {
    setFormData({
      name: activity.name,
      slug: activity.slug,
      category: activity.category ?? "",
      description: activity.description ?? "",
      duration: activity.duration ?? 1,
      isActive: activity.isActive,
    });
    setSelectedActivity(activity);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload: ActivityFormData = {
        ...formData,
        duration: Number.parseFloat(String(formData.duration ?? 1)) || 1,
      };
      if (isCreating) {
        await createActivity(payload as CreateActivityDTO);
        setIsCreating(false);
      } else if (isEditing && selectedActivity) {
        await updateActivity(selectedActivity.id, payload as UpdateActivityDTO);
        setIsEditing(false);
        setSelectedActivity(null);
      }
      setFormData({
        name: "",
        slug: "",
        category: "",
        description: "",
        duration: 1,
        isActive: true,
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity(id);
      if (selectedActivity?.id === id) setSelectedActivity(null);
      await refetch();
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete activity");
    }
  };

  const closeFormPanel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedActivity(null);
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Activities
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage the standard activity list that appears in parent bookings and trainer session plans.
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, description..."
              className="h-9 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Filter className="h-3.5 w-3.5" />
              {showFilters ? "Hide" : "Show"} filters
            </button>
            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              New activity
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Category
                </label>
                <input
                  type="text"
                  list={CATEGORY_FILTER_DATALIST_ID}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Type or choose category"
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                />
                <datalist id={CATEGORY_FILTER_DATALIST_ID}>
                  <option value="" />
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("");
                    setStatusFilter("all");
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
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Duration</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    Loading activities…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No activities found.
                  </td>
                </tr>
              ) : (
                filtered.map((activity) => (
                  <tr
                    key={activity.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{activity.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{activity.category || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">{formatDuration(activity.duration)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={
                          activity.isActive
                            ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {activity.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleEditClick(activity)}
                        className="mr-2 rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(activity.id)}
                        className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
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
      </div>

      {/* View details SideCanvas */}
      <SideCanvas
        isOpen={!!selectedActivity && !isCreating && !isEditing}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity ? selectedActivity.name : "Activity details"}
      >
        {selectedActivity && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-1 gap-2 text-xs text-slate-700 dark:text-slate-200">
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{selectedActivity.name}</dd>
              </div>
              <div>
                <dt className="font-medium">Category</dt>
                <dd>{selectedActivity.category || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium">Duration</dt>
                <dd>{formatDuration(selectedActivity.duration)}</dd>
              </div>
              <div>
                <dt className="font-medium">Status</dt>
                <dd>{selectedActivity.isActive ? "Active" : "Inactive"}</dd>
              </div>
              {selectedActivity.description && (
                <div>
                  <dt className="font-medium">Description</dt>
                  <dd className="mt-0.5">{selectedActivity.description}</dd>
                </div>
              )}
            </dl>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEditClick(selectedActivity)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedActivity.id)}
                className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </SideCanvas>

      {/* Create/Edit form SideCanvas */}
      <SideCanvas
        isOpen={isCreating || isEditing}
        onClose={closeFormPanel}
        title={isCreating ? "Create activity" : "Edit activity"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="activity-name" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Name *</label>
            <input
              id="activity-name"
              type="text"
              required
              value={formData.name ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label htmlFor="activity-slug" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Slug (optional)</label>
            <input
              id="activity-slug"
              type="text"
              value={formData.slug ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label htmlFor="activity-category" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Category (type or choose)</label>
            <input
              id="activity-category"
              type="text"
              list={CATEGORY_DATALIST_ID}
              value={formData.category ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="e.g. warm-up, ball skills, custom"
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
            <datalist id={CATEGORY_DATALIST_ID}>
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="activity-duration" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Duration (hours) *</label>
            <input
              id="activity-duration"
              type="number"
              min={0.25}
              max={8}
              step={0.25}
              required
              value={formData.duration ?? 1}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: Number.parseFloat(e.target.value) || 1 }))}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div>
            <label htmlFor="activity-description" className="block text-xs font-medium text-slate-700 dark:text-slate-200">Description (optional)</label>
            <textarea
              id="activity-description"
              rows={3}
              value={formData.description ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activity-active"
              checked={Boolean(formData.isActive ?? true)}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="activity-active" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Active (visible to parents and trainers)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : isCreating ? "Create" : "Update"}
            </button>
            <button
              type="button"
              onClick={closeFormPanel}
              className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </SideCanvas>
    </section>
  );
};
