/**
 * API Health Check Endpoint
 * 
 * This endpoint can be used to verify the Next.js app is running
 * and can make requests to the Laravel backend.
 * 
 * Access at: /api/health
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/infrastructure/http/apiBaseUrl';
import { apiClient } from '@/infrastructure/http/ApiClient';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: unknown } }).response;
    if (response && typeof response.status === 'number') {
      return response.status;
    }
  }
  return undefined;
}

export async function GET() {
  try {
    const baseURL = getApiBaseUrl({ serverSide: true });
    
    // Try to ping the Laravel API
    let apiStatus = 'unknown';
    let apiResponse = null;
    
    try {
      await apiClient.get('/api/packages');
      apiStatus = 'connected';
      apiResponse = { success: true, data: 'API is reachable' };
    } catch (error: unknown) {
      apiStatus = 'error';
      apiResponse = {
        success: false,
        error: getErrorMessage(error),
        status: getErrorStatus(error),
      };
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      api: {
        baseURL,
        status: apiStatus,
        response: apiResponse,
      },
      version: '1.0.0',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        message: getErrorMessage(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

