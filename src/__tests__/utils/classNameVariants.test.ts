/**
 * Unit tests for src/lib/classNameVariants.ts
 *
 * All functions are pure — no DOM required.
 */
import { describe, it, expect } from 'vitest';
import {
  CONSUMER_TIER_VARIANTS,
  CONSUMER_STATUS_TEXT_VARIANTS,
  CONSUMER_STATUS_DOT_VARIANTS,
  STAKER_HEALTH_BAR_VARIANTS,
  getHealthBarColor,
  RELAYER_STATUS_BADGE_VARIANTS,
  RELAYER_STATUS_DOT_VARIANTS,
  RELAYERS_PAGE_STATUS_VARIANTS,
  CONTRACT_HEALTH_ICON_VARIANTS,
  getBalanceColorClass,
} from '@/lib/classNameVariants';

// ---------------------------------------------------------------------------
// Static variant maps — spot-check key entries exist and are non-empty strings
// ---------------------------------------------------------------------------

describe('CONSUMER_TIER_VARIANTS', () => {
  it('has entries for all three tiers', () => {
    expect(CONSUMER_TIER_VARIANTS.Enterprise).toBeTruthy();
    expect(CONSUMER_TIER_VARIANTS.Developer).toBeTruthy();
    expect(CONSUMER_TIER_VARIANTS.Staging).toBeTruthy();
  });

  it('Enterprise variant contains purple colour classes', () => {
    expect(CONSUMER_TIER_VARIANTS.Enterprise).toContain('purple');
  });

  it('Developer variant contains blue colour classes', () => {
    expect(CONSUMER_TIER_VARIANTS.Developer).toContain('blue');
  });

  it('Staging variant contains gray colour classes', () => {
    expect(CONSUMER_TIER_VARIANTS.Staging).toContain('gray');
  });
});

describe('CONSUMER_STATUS_TEXT_VARIANTS', () => {
  it('active is green', () => {
    expect(CONSUMER_STATUS_TEXT_VARIANTS.active).toContain('green');
  });

  it('expired is red', () => {
    expect(CONSUMER_STATUS_TEXT_VARIANTS.expired).toContain('red');
  });

  it('paused is yellow', () => {
    expect(CONSUMER_STATUS_TEXT_VARIANTS.paused).toContain('yellow');
  });
});

describe('CONSUMER_STATUS_DOT_VARIANTS', () => {
  it('active dot is green', () => {
    expect(CONSUMER_STATUS_DOT_VARIANTS.active).toContain('green');
  });

  it('expired dot is red', () => {
    expect(CONSUMER_STATUS_DOT_VARIANTS.expired).toContain('red');
  });

  it('paused dot is yellow', () => {
    expect(CONSUMER_STATUS_DOT_VARIANTS.paused).toContain('yellow');
  });
});

describe('RELAYER_STATUS_BADGE_VARIANTS', () => {
  it('Online badge contains neon-green class', () => {
    // The neon green used is #39FF14 referenced as [#39FF14]
    expect(RELAYER_STATUS_BADGE_VARIANTS.Online).toContain('39FF14');
  });

  it('Offline badge is red', () => {
    expect(RELAYER_STATUS_BADGE_VARIANTS.Offline).toContain('red');
  });

  it('Syncing badge is yellow', () => {
    expect(RELAYER_STATUS_BADGE_VARIANTS.Syncing).toContain('yellow');
  });
});

describe('RELAYER_STATUS_DOT_VARIANTS', () => {
  it('Online dot uses neon-green', () => {
    expect(RELAYER_STATUS_DOT_VARIANTS.Online).toContain('39FF14');
  });

  it('Offline dot is red', () => {
    expect(RELAYER_STATUS_DOT_VARIANTS.Offline).toContain('red');
  });

  it('Syncing dot is yellow', () => {
    expect(RELAYER_STATUS_DOT_VARIANTS.Syncing).toContain('yellow');
  });
});

describe('RELAYERS_PAGE_STATUS_VARIANTS', () => {
  it('active variant contains green', () => {
    expect(RELAYERS_PAGE_STATUS_VARIANTS.active).toContain('green');
  });

  it('lagging variant contains yellow', () => {
    expect(RELAYERS_PAGE_STATUS_VARIANTS.lagging).toContain('yellow');
  });

  it('offline variant contains red', () => {
    expect(RELAYERS_PAGE_STATUS_VARIANTS.offline).toContain('red');
  });
});

describe('CONTRACT_HEALTH_ICON_VARIANTS', () => {
  it('safe is green', () => {
    expect(CONTRACT_HEALTH_ICON_VARIANTS.safe).toContain('green');
  });

  it('warning is yellow', () => {
    expect(CONTRACT_HEALTH_ICON_VARIANTS.warning).toContain('yellow');
  });

  it('error is red', () => {
    expect(CONTRACT_HEALTH_ICON_VARIANTS.error).toContain('red');
  });
});

// ---------------------------------------------------------------------------
// getHealthBarColor
// ---------------------------------------------------------------------------

describe('getHealthBarColor', () => {
  it('returns healthy (emerald) for values above 85', () => {
    expect(getHealthBarColor(100)).toBe(STAKER_HEALTH_BAR_VARIANTS.healthy);
    expect(getHealthBarColor(86)).toBe(STAKER_HEALTH_BAR_VARIANTS.healthy);
  });

  it('returns healthy for exactly 86', () => {
    expect(getHealthBarColor(86)).toBe(STAKER_HEALTH_BAR_VARIANTS.healthy);
  });

  it('returns warning (yellow) for values 71–85', () => {
    expect(getHealthBarColor(85)).toBe(STAKER_HEALTH_BAR_VARIANTS.warning);
    expect(getHealthBarColor(75)).toBe(STAKER_HEALTH_BAR_VARIANTS.warning);
    expect(getHealthBarColor(71)).toBe(STAKER_HEALTH_BAR_VARIANTS.warning);
  });

  it('returns critical (red) for values at or below 70', () => {
    expect(getHealthBarColor(70)).toBe(STAKER_HEALTH_BAR_VARIANTS.critical);
    expect(getHealthBarColor(50)).toBe(STAKER_HEALTH_BAR_VARIANTS.critical);
    expect(getHealthBarColor(0)).toBe(STAKER_HEALTH_BAR_VARIANTS.critical);
  });

  it('healthy class contains emerald', () => {
    expect(STAKER_HEALTH_BAR_VARIANTS.healthy).toContain('emerald');
  });

  it('warning class contains yellow', () => {
    expect(STAKER_HEALTH_BAR_VARIANTS.warning).toContain('yellow');
  });

  it('critical class contains red', () => {
    expect(STAKER_HEALTH_BAR_VARIANTS.critical).toContain('red');
  });
});

// ---------------------------------------------------------------------------
// getBalanceColorClass
// ---------------------------------------------------------------------------

describe('getBalanceColorClass', () => {
  it('returns yellow bold class for balances below 200', () => {
    const cls = getBalanceColorClass(199);
    expect(cls).toContain('yellow');
    expect(cls).toContain('font-bold');
  });

  it('returns yellow bold class for zero balance', () => {
    const cls = getBalanceColorClass(0);
    expect(cls).toContain('yellow');
  });

  it('returns gray class for balances of exactly 200', () => {
    const cls = getBalanceColorClass(200);
    expect(cls).toContain('gray');
    expect(cls).not.toContain('yellow');
  });

  it('returns gray class for balances above 200', () => {
    const cls = getBalanceColorClass(5000);
    expect(cls).toContain('gray');
  });
});
