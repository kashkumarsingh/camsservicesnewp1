import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiErrorMessage } from '@/shared/utils/errorUtils';

export interface AdminRevenueReport {
  totalRevenue?: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  trendPercent?: number;
  byMonth?: Array<{ month: string; revenue: number }>;
}

interface AdminRevenueReportResponse {
  data?: AdminRevenueReport;
}

function isAdminRevenueReportResponse(
  value: AdminRevenueReport | AdminRevenueReportResponse,
): value is AdminRevenueReportResponse {
  return value !== null && typeof value === 'object' && 'data' in value;
}

export interface UseAdminRevenueReportOptions {
  dateFrom?: string;
  dateTo?: string;
}

export function useAdminRevenueReport(options: UseAdminRevenueReportOptions = {}) {
  const [report, setReport] = useState<AdminRevenueReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.dateFrom) params.append('date_from', options.dateFrom);
      if (options.dateTo) params.append('date_to', options.dateTo);
      const query = params.toString();
      const url = query ? `${API_ENDPOINTS.ADMIN_REPORTS_REVENUE}?${query}` : API_ENDPOINTS.ADMIN_REPORTS_REVENUE;

      const response = await apiClient.get<AdminRevenueReportResponse | AdminRevenueReport>(url);
      const raw = response.data;
      const data = isAdminRevenueReportResponse(raw) ? raw.data : raw;
      setReport(data ?? null);
    } catch (err: unknown) {
      setReport(null);
      setError(getApiErrorMessage(err, 'Failed to load revenue report'));
    } finally {
      setLoading(false);
    }
  }, [options.dateFrom, options.dateTo]);

  useEffect(() => {
    void fetchRevenueReport();
  }, [fetchRevenueReport]);

  return {
    report,
    loading,
    error,
    refetch: fetchRevenueReport,
  };
}

