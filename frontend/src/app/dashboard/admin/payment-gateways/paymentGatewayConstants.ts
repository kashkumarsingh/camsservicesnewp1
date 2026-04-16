/**
 * Payment gateways admin page — labels and copy (single source of truth).
 */

export const PAYMENT_GATEWAY_PAGE = {
  TITLE: 'Payment gateways',
  DESCRIPTION:
    'Configure API keys for Stripe (default), PayPal, and other gateways. Keys are stored securely and override environment variables when set.',
  SECTION_GATEWAYS: 'Gateways',
  CARD_DEFAULT_BADGE: 'Default',
  CARD_CONFIGURED: 'Configured',
  CARD_NOT_CONFIGURED: 'Not configured',
  BUTTON_CONFIGURE: 'Configure',
  BUTTON_EDIT: 'Edit',
  MODAL_TITLE: 'Configure gateway',
  MODAL_STRIPE_SECRET: 'Secret key',
  MODAL_STRIPE_PUBLIC: 'Publishable key',
  MODAL_WEBHOOK_SECRET: 'Webhook signing secret',
  MODAL_PAYPAL_SECRET: 'Client secret',
  MODAL_PAYPAL_PUBLIC: 'Client ID',
  MODAL_IS_DEFAULT: 'Use as default gateway',
  MODAL_IS_ACTIVE: 'Active',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  SAVING: 'Saving…',
  SUCCESS_UPDATE: 'Gateway updated.',
  ERROR_UPDATE: 'Failed to update gateway.',
} as const;
