/**
 * Component tests for ModularStatsCard.
 *
 * ModularStatsCard is a server-compatible React component with no hooks,
 * no context, and no external dependencies beyond React itself. Tests cover:
 *   - Rendering the label, formatted value, and optional unit
 *   - Positive vs negative trend indicator colours and arrow direction
 *   - Zero trend edge case
 *   - Large numbers formatted with Intl.NumberFormat separators
 *   - Missing optional props (trend, unit)
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModularStatsCard from '@/app/components/ModularStatsCard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderCard(props: Parameters<typeof ModularStatsCard>[0]) {
  return render(<ModularStatsCard {...props} />);
}

// ---------------------------------------------------------------------------
// Label rendering
// ---------------------------------------------------------------------------

describe('ModularStatsCard — label', () => {
  it('renders the label text', () => {
    renderCard({ label: 'Network Throughput', value: 1000 });
    expect(screen.getByText('Network Throughput')).toBeInTheDocument();
  });

  it('renders the label in uppercase via CSS class (class contains "uppercase")', () => {
    renderCard({ label: 'Oracle Accuracy', value: 99.98 });
    const labelEl = screen.getByText('Oracle Accuracy');
    expect(labelEl.className).toContain('uppercase');
  });
});

// ---------------------------------------------------------------------------
// Value rendering
// ---------------------------------------------------------------------------

describe('ModularStatsCard — value', () => {
  it('renders a small integer value', () => {
    renderCard({ label: 'Active Nodes', value: 42 });
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('formats large numbers with comma separators', () => {
    renderCard({ label: 'TVL', value: 1245670 });
    // Intl.NumberFormat en-US produces "1,245,670"
    expect(screen.getByText('1,245,670')).toBeInTheDocument();
  });

  it('formats decimal values', () => {
    renderCard({ label: 'Oracle Accuracy', value: 99.98 });
    expect(screen.getByText('99.98')).toBeInTheDocument();
  });

  it('renders zero', () => {
    renderCard({ label: 'Errors', value: 0 });
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Unit rendering
// ---------------------------------------------------------------------------

describe('ModularStatsCard — unit', () => {
  it('renders the unit when provided', () => {
    renderCard({ label: 'Throughput', value: 1245670, unit: 'TPS' });
    expect(screen.getByText('TPS')).toBeInTheDocument();
  });

  it('does not render a unit element when unit is omitted', () => {
    renderCard({ label: 'Active Nodes', value: 1240 });
    expect(screen.queryByText('TPS')).not.toBeInTheDocument();
    expect(screen.queryByText('USD')).not.toBeInTheDocument();
  });

  it('renders percent unit', () => {
    renderCard({ label: 'Oracle Accuracy', value: 99.98, unit: '%' });
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Trend indicator
// ---------------------------------------------------------------------------

describe('ModularStatsCard — trend indicator', () => {
  it('does not render a trend section when trend is omitted', () => {
    renderCard({ label: 'Nodes', value: 100 });
    expect(screen.queryByText('vs last 24h')).not.toBeInTheDocument();
    expect(screen.queryByText('▲')).not.toBeInTheDocument();
    expect(screen.queryByText('▼')).not.toBeInTheDocument();
  });

  it('renders an upward arrow for a positive trend', () => {
    renderCard({ label: 'TVL', value: 1000, trend: 5.2 });
    expect(screen.getByText('▲')).toBeInTheDocument();
    expect(screen.queryByText('▼')).not.toBeInTheDocument();
  });

  it('renders a downward arrow for a negative trend', () => {
    renderCard({ label: 'TVL', value: 1000, trend: -2.4 });
    expect(screen.getByText('▼')).toBeInTheDocument();
    expect(screen.queryByText('▲')).not.toBeInTheDocument();
  });

  it('treats zero trend as positive (▲)', () => {
    renderCard({ label: 'TVL', value: 1000, trend: 0 });
    expect(screen.getByText('▲')).toBeInTheDocument();
  });

  it('renders the absolute trend value with % suffix', () => {
    renderCard({ label: 'TVL', value: 1000, trend: -2.4 });
    expect(screen.getByText('2.4%')).toBeInTheDocument();
  });

  it('renders the "vs last 24h" label alongside trend', () => {
    renderCard({ label: 'TVL', value: 1000, trend: 3.1 });
    expect(screen.getByText('vs last 24h')).toBeInTheDocument();
  });

  it('positive trend pill has emerald colour classes', () => {
    renderCard({ label: 'TVL', value: 1000, trend: 5 });
    // The pill wraps both the arrow and the value — find the pill container
    const pill = screen.getByText('▲').closest('div');
    expect(pill?.className).toContain('emerald');
  });

  it('negative trend pill has rose colour classes', () => {
    renderCard({ label: 'TVL', value: 1000, trend: -5 });
    const pill = screen.getByText('▼').closest('div');
    expect(pill?.className).toContain('rose');
  });
});

// ---------------------------------------------------------------------------
// Decorative elements
// ---------------------------------------------------------------------------

describe('ModularStatsCard — decorative elements', () => {
  it('renders two decorative cyber lines', () => {
    const { container } = renderCard({ label: 'Test', value: 42 });
    // Both lines have a gradient class
    const gradients = container.querySelectorAll('[class*="gradient"]');
    expect(gradients.length).toBeGreaterThanOrEqual(2);
  });
});
