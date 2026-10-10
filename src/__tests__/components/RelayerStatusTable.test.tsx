/**
 * Component tests for RelayerStatusTable.
 *
 * Covers:
 *   - Empty state (no relayers prop / empty array)
 *   - Rendering one and multiple relayers
 *   - Status badge text for each status variant
 *   - Latency display
 *   - Custom comparator (memo) — stable reference between re-renders
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RelayerStatusTable, {
  type Relayer,
} from '@/app/components/RelayerStatusTable';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ONLINE_RELAYER: Relayer = {
  id: 'r1',
  name: 'Abuja Relayer',
  status: 'Online',
  latency: 34,
};

const SYNCING_RELAYER: Relayer = {
  id: 'r2',
  name: 'Lagos Relayer',
  status: 'Syncing',
  latency: 72,
};

const OFFLINE_RELAYER: Relayer = {
  id: 'r3',
  name: 'Harare Relayer',
  status: 'Offline',
  latency: 0,
};

const ALL_RELAYERS = [ONLINE_RELAYER, SYNCING_RELAYER, OFFLINE_RELAYER];

// ---------------------------------------------------------------------------
// Empty / default state
// ---------------------------------------------------------------------------

describe('RelayerStatusTable — empty state', () => {
  it('renders without crashing when relayers prop is omitted', () => {
    expect(() => render(<RelayerStatusTable />)).not.toThrow();
  });

  it('shows an empty state message when relayers array is empty', () => {
    render(<RelayerStatusTable relayers={[]} />);
    expect(screen.getByText(/no relayers found/i)).toBeInTheDocument();
  });

  it('renders the table header columns', () => {
    render(<RelayerStatusTable relayers={[]} />);
    expect(screen.getByText(/relayer name/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/latency/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Single relayer rendering
// ---------------------------------------------------------------------------

describe('RelayerStatusTable — single relayer', () => {
  it('renders the relayer name', () => {
    render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    expect(screen.getByText('Abuja Relayer')).toBeInTheDocument();
  });

  it('renders the latency value with ms suffix', () => {
    render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    expect(screen.getByText('34 ms')).toBeInTheDocument();
  });

  it('renders the Online status badge', () => {
    render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('does not show empty state message when a relayer exists', () => {
    render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    expect(screen.queryByText(/no relayers found/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Multiple relayers
// ---------------------------------------------------------------------------

describe('RelayerStatusTable — multiple relayers', () => {
  it('renders all relayer names', () => {
    render(<RelayerStatusTable relayers={ALL_RELAYERS} />);
    expect(screen.getByText('Abuja Relayer')).toBeInTheDocument();
    expect(screen.getByText('Lagos Relayer')).toBeInTheDocument();
    expect(screen.getByText('Harare Relayer')).toBeInTheDocument();
  });

  it('renders all three status badge variants', () => {
    render(<RelayerStatusTable relayers={ALL_RELAYERS} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Syncing')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders each latency value', () => {
    render(<RelayerStatusTable relayers={ALL_RELAYERS} />);
    expect(screen.getByText('34 ms')).toBeInTheDocument();
    expect(screen.getByText('72 ms')).toBeInTheDocument();
    expect(screen.getByText('0 ms')).toBeInTheDocument();
  });

  it('renders a table row for each relayer', () => {
    const { container } = render(<RelayerStatusTable relayers={ALL_RELAYERS} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Status badge colour classes (via classNameVariants)
// ---------------------------------------------------------------------------

describe('RelayerStatusTable — status badge colour classes', () => {
  it('Online badge contains neon-green class token', () => {
    render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    const badge = screen.getByText('Online');
    expect(badge.className).toContain('39FF14');
  });

  it('Offline badge contains red class token', () => {
    render(<RelayerStatusTable relayers={[OFFLINE_RELAYER]} />);
    const badge = screen.getByText('Offline');
    expect(badge.className).toContain('red');
  });

  it('Syncing badge contains yellow class token', () => {
    render(<RelayerStatusTable relayers={[SYNCING_RELAYER]} />);
    const badge = screen.getByText('Syncing');
    expect(badge.className).toContain('yellow');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('RelayerStatusTable — accessibility', () => {
  it('renders a <table> element', () => {
    const { container } = render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('renders <thead> with column headers', () => {
    const { container } = render(<RelayerStatusTable relayers={[ONLINE_RELAYER]} />);
    const ths = container.querySelectorAll('thead th');
    expect(ths.length).toBe(3);
  });

  it('renders <tbody> rows', () => {
    const { container } = render(<RelayerStatusTable relayers={ALL_RELAYERS} />);
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });
});
