import { NextResponse } from 'next/server';

/**
 * GET /api/health/batch
 *
 * Returns the aggregated health status for the global network and the oracle
 * subsystem. In production, this would query live Soroban contract state,
 * relayer heartbeats, and Horizon node connectivity. For now, a lightweight
 * mock keeps the client-side healthService working end-to-end.
 */

interface HealthBatchResponse {
  global: {
    status: 'ACTIVE' | 'INACTIVE' | 'WARNING';
    checkedAt: number;
  };
  oracle: {
    status: 'Online' | 'Offline' | 'Lagging';
    checkedAt: number;
  };
}

// Simulate a realistic response — occasionally return WARNING/Lagging
// so the health indicator is exercised during development.
function buildResponse(): HealthBatchResponse {
  const now = Date.now();
  // Seed random from second bucket so CI runs are deterministic within a second
  const seed = Math.floor(now / 1000) % 100;

  const globalStatus =
    seed < 88 ? 'ACTIVE' : seed < 96 ? 'WARNING' : 'INACTIVE';
  const oracleStatus =
    seed < 88 ? 'Online' : seed < 96 ? 'Lagging' : 'Offline';

  return {
    global: { status: globalStatus, checkedAt: now },
    oracle: { status: oracleStatus, checkedAt: now },
  };
}

export async function GET(): Promise<NextResponse> {
  const body = buildResponse();

  return NextResponse.json(body, {
    status: 200,
    headers: {
      // Short TTL — health data should be fresh
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
