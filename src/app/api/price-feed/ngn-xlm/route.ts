import { NextResponse } from 'next/server';

/**
 * GET /api/price-feed/ngn-xlm
 *
 * Returns the latest NGN/XLM price data consumed by PriceFeedCard. In
 * production this would proxy a Soroban oracle contract read or an external
 * aggregation endpoint. This implementation produces deterministic mock data
 * with realistic ±1% variation so the dashboard widget remains functional
 * before a live backend is wired up.
 */

interface PriceFeedResponse {
  id: string;
  assetPair: string;
  price: number;
  decimals: number;
  source: string;
  timestamp: number;
  confidenceScore: number;
}

// NGN/XLM base price — roughly 0.000842 XLM per naira as of late 2026.
const BASE_PRICE = 0.000842;
const DECIMALS = 7;

function buildResponse(): PriceFeedResponse {
  const now = Date.now();
  // ±1% variation seeded off the 30-second bucket so responses within the
  // same bucket return the same price (cache-friendly, stable for tests).
  const bucket = Math.floor(now / 30_000);
  // Deterministic pseudo-random from bucket
  const pseudo = Math.sin(bucket) * 0.5 + 0.5; // 0..1
  const variation = (pseudo - 0.5) * 0.02; // ±1%
  const price = parseFloat((BASE_PRICE * (1 + variation)).toFixed(DECIMALS));

  return {
    id: 'ngn-xlm',
    assetPair: 'NGN-XLM',
    price,
    decimals: DECIMALS,
    source: 'stellarflow-oracle',
    timestamp: now,
    confidenceScore: 0.96 + pseudo * 0.03, // 0.96–0.99
  };
}

export async function GET(): Promise<NextResponse> {
  const body = buildResponse();

  return NextResponse.json(body, {
    status: 200,
    headers: {
      // Match the 30-second bucket life so downstream CDNs / service workers
      // can cache without serving stale data beyond one price cycle.
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=10',
    },
  });
}
