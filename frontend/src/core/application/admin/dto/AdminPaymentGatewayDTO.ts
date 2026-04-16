/**
 * Admin Payment Gateway DTOs
 * API returns camelCase; types match backend AdminPaymentGatewayController.
 */

export interface AdminPaymentGatewayDTO {
  id: string | null;
  gateway: string;
  displayName: string;
  hasCredentials: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  /** Present on show/update response only */
  publicKey?: string | null;
  /** Present on show/update when secret is set (masked) */
  secretKeyMasked?: string | null;
  /** Present on show/update when webhook secret is set (masked) */
  webhookSecretMasked?: string | null;
}

export interface UpdatePaymentGatewayDTO {
  secretKey?: string | null;
  publicKey?: string | null;
  webhookSecret?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}
