'use client';

import React, { useMemo, useState } from "react";
import SideCanvas from "@/components/ui/SideCanvas";
import { TableRowsSkeleton } from "@/components/ui/Skeleton";
import { SKELETON_COUNTS } from "@/utils/skeletonConstants";
import { Filter } from "lucide-react";
import type { AdminServiceDTO, CreateServiceDTO, UpdateServiceDTO } from "@/core/application/admin/dto/AdminServiceDTO";
import { useAdminServices } from "@/interfaces/web/hooks/admin/useAdminServices";
import { toastManager } from "@/utils/toast";

type ServiceFormData = CreateServiceDTO | UpdateServiceDTO;

function getPublishedBadgeClasses(published: boolean) {
  return published
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

export const AdminServicesPageClient: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<AdminServiceDTO | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    slug: "",
    summary: "",
    description: "",
    category: "",
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const publishedFilterValue = publishedFilter === "all" ? undefined : publishedFilter === "published";

  const { services, loading, error, createService, updateService, deleteService, refetch } = useAdminServices({
    published: publishedFilterValue,
    search: search.trim() || undefined,
  });

  const safeServices = Array.isArray(services) ? services : [];

  const filtered = useMemo(() => {
    let result = safeServices;
    
    // Apply category filter
    if (categoryFilter) {
      result = result.filter((service) => service.category === categoryFilter);
    }

    return result;
  }, [safeServices, categoryFilter]);

  const categories = useMemo(() => {
    const cats = safeServices.map((s) => s.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [safeServices]);

  const handleCreateClick = () => {
    setFormData({
      title: "",
      slug: "",
      summary: "",
      description: "",
      category: "",
      published: false,
    });
    setIsCreating(true);
  };

  const handleEditClick = (service: AdminServiceDTO) => {
    setFormData({
      title: service.title,
      slug: service.slug,
      summary: service.summary || "",
      description: service.description || "",
      category: service.category || "",
      published: service.published,
    });
    setSelectedService(service);
    setIsEditing(true);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isCreating) {
        await createService(formData as CreateServiceDTO);
        setIsCreating(false);
        toastManager.success("Service created successfully.");
      } else if (isEditing && selectedService) {
        await updateService(selectedService.id, formData as UpdateServiceDTO);
        setIsEditing(false);
        setSelectedService(null);
        toastManager.success("Service updated successfully.");
      }

      setFormData({
        title: "",
        slug: "",
        summary: "",
        description: "",
        category: "",
        published: false,
      });
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await deleteService(id);
      if (selectedService?.id === id) {
        setSelectedService(null);
      }
      toastManager.success("Service deleted successfully.");
    } catch (err: unknown) {
      toastManager.error(err instanceof Error ? err.message : "Failed to delete service");
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Services
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage services with full CRUD operations, filtering, and search capabilities.
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
              placeholder="Search by title, summary, description..."
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
              New service
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
                  Status
                </label>
                <select
                  value={publishedFilter}
                  onChange={(event) => setPublishedFilter(event.target.value)}
                  className="mt-1 h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("");
                    setPublishedFilter("all");
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
                  Title
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Views
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Updated
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={6} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No services found.
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr
                    key={service.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedService(service)}
                  >
                    <td className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {service.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {service.category || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getPublishedBadgeClasses(
                          service.published
                        )}`}
                      >
                        {service.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {service.views}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {formatDateTime(service.updatedAt)}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-right text-xs"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleEditClick(service)}
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      {" "}
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id)}
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
            Showing {filtered.length} of {safeServices.length} service{safeServices.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Detail View Canvas */}
      <SideCanvas
        isOpen={!!selectedService && !isEditing}
        onClose={() => setSelectedService(null)}
        title={selectedService ? selectedService.title : "Service details"}
      >
        {selectedService && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  handleEditClick(selectedService);
                  setSelectedService(null);
                }}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  handleDelete(selectedService.id);
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
                  <dt className="font-medium">Title</dt>
                  <dd>{selectedService.title}</dd>
                </div>
                <div>
                  <dt className="font-medium">Slug</dt>
                  <dd>{selectedService.slug}</dd>
                </div>
                <div>
                  <dt className="font-medium">Category</dt>
                  <dd>{selectedService.category || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Summary</dt>
                  <dd>{selectedService.summary || "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium">Views</dt>
                  <dd>{selectedService.views}</dd>
                </div>
                <div>
                  <dt className="font-medium">Published</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getPublishedBadgeClasses(
                        selectedService.published
                      )}`}
                    >
                      {selectedService.published ? "Published" : "Draft"}
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
          setSelectedService(null);
        }}
        title={isCreating ? "Create service" : "Edit service"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            <label htmlFor="category" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Summary
            </label>
            <textarea
              id="summary"
              rows={3}
              value={formData.summary || ""}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published || false}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Published
            </label>
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
                setSelectedService(null);
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
