/**
 * useAdminPaymentGateways Hook (Interface Layer)
 *
 * Purpose: List payment gateways (Stripe default, PayPal, etc.) and update gateway keys.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { getApiErrorMessage } from '@/shared/utils/errorUtils';
import type { AdminPaymentGatewayDTO, UpdatePaymentGatewayDTO } from '@/core/application/admin/dto/AdminPaymentGatewayDTO';
import { extractList } from '@/infrastructure/http/responseHelpers';

export function useAdminPaymentGateways() {
  const [gateways, setGateways] = useState<AdminPaymentGatewayDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ data: AdminPaymentGatewayDTO[] }>(API_ENDPOINTS.ADMIN_PAYMENT_GATEWAYS);
      const list = extractList(response);
      setGateways(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load payment gateways'));
      setGateways([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const fetchGatewayBySlug = useCallback(
    async (gateway: string): Promise<AdminPaymentGatewayDTO | null> => {
      try {
        const response = await apiClient.get<AdminPaymentGatewayDTO>(
          API_ENDPOINTS.ADMIN_PAYMENT_GATEWAY_BY_SLUG(gateway)
        );
        return response.data ?? null;
      } catch (err: unknown) {
        return null;
      }
    },
    []
  );

  const updateGateway = useCallback(
    async (gateway: string, data: UpdatePaymentGatewayDTO): Promise<AdminPaymentGatewayDTO> => {
      const response = await apiClient.put<AdminPaymentGatewayDTO>(
        API_ENDPOINTS.ADMIN_PAYMENT_GATEWAY_BY_SLUG(gateway),
        data
      );
      if (!response.data) throw new Error('Failed to update payment gateway');
      await fetchGateways();
      return response.data;
    },
    [fetchGateways]
  );

  return {
    gateways,
    loading,
    error,
    refetch: fetchGateways,
    fetchGatewayBySlug,
    updateGateway,
  };
}
