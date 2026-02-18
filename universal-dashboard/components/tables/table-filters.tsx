import React from "react";
import { X } from "lucide-react";
import { Select } from "@/components/common/select";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface TableFilterConfig {
  id: string;
  label: string;
  type: "select" | "search" | "dateRange";
  options?: TableFilterOption[];
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}

export interface TableFiltersProps {
  config: TableFilterConfig[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onClearAll?: () => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  config,
  values,
  onChange,
  onClearAll,
}) => {
  const active: ActiveFilter[] = config
    .map((item) => {
      const value = values[item.id];
      if (!value) return null;
      const label =
        item.type === "select"
          ? item.options?.find((option) => option.value === value)?.label ??
            value
          : value;
      return {
        id: item.id,
        label: `${item.label}: ${label}`,
        value,
      };
    })
    .filter(Boolean) as ActiveFilter[];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {config.map((item) => {
          const value = values[item.id] ?? "";

          if (item.type === "search") {
            return (
              <div key={item.id} className="w-full max-w-xs">
                <Input
                  type="search"
                  placeholder={item.label}
                  value={value}
                  onChange={(event) => onChange(item.id, event.target.value)}
                  className="h-button-sm-h text-caption"
                />
              </div>
            );
          }

          if (item.type === "dateRange") {
            return (
              <div key={item.id} className="flex items-center gap-1 text-micro">
                <span className="text-slate-600 dark:text-slate-400">
                  {item.label}
                </span>
                <Input
                  type="date"
                  value={value}
                  onChange={(event) => onChange(item.id, event.target.value)}
                  className="h-button-sm-h w-auto text-caption"
                />
              </div>
            );
          }

          // select
          return (
            <div key={item.id} className="w-32">
              <Select
                value={value}
                onChange={(event) => onChange(item.id, event.target.value)}
                className="h-button-sm-h text-caption"
              >
                <option value="">{item.label}</option>
                {(item.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-micro">
          {active.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id, "")}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <span>{filter.label}</span>
              <X className="h-2.5 w-2.5" />
            </button>
          ))}
          {onClearAll && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-caption"
              onClick={onClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

