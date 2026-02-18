/**
 * API Health Check Endpoint
 * 
 * This endpoint can be used to verify the Next.js app is running
 * and can make requests to the Laravel backend.
 * 
 * Access at: /api/health
 */

import { NextResponse } from 'next/server';
import { apiClient } from '@/infrastructure/http/ApiClient';

export async function GET() {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9080/api/v1';
    
    // Try to ping the Laravel API
    let apiStatus = 'unknown';
    let apiResponse = null;
    
    try {
      const response = await apiClient.get('/api/packages');
      apiStatus = 'connected';
      apiResponse = { success: true, data: 'API is reachable' };
    } catch (error: any) {
      apiStatus = 'error';
      apiResponse = {
        success: false,
        error: error.message || 'Unknown error',
        status: error.response?.status,
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
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

