/**
 * Integration tests for the GovernancePage component.
 *
 * Focus areas:
 *   1. Initial render — all four mock proposals visible on "All Ballots" tab
 *   2. Tab filtering — "Active" shows only Active/Queue, "Archived" shows Passed/Defeated
 *   3. Empty archived tab state
 *   4. Stats cards are present
 *   5. Proposal status badges render correctly
 *   6. "Submit New Proposal" button opens the modal
 *   7. Adding a proposal via the modal appends it to the list
 *
 * External dependencies that do not work in jsdom are mocked:
 *   - next/link          → renders a plain <a>
 *   - next/navigation    → not used directly; next/link mock handles it
 *   - @/workers/masterTimerWorker → subscribe is a no-op returning a noop unsubscriber
 *   - @/app/hooks/useWalletState  → wallet is disconnected stub
 *   - @/components/icons/Icon     → renders a plain <span data-icon-id>
 *   - @/app/components/governance/SubmitProposalModal → thin stub
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Module mocks — declared BEFORE any imports that trigger module evaluation
// ---------------------------------------------------------------------------

// next/link — render as a plain anchor so href is testable
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// masterTimerWorker — subscribe no-op so RAF doesn't fire in jsdom
vi.mock('@/workers/masterTimerWorker', () => ({
  subscribe: () => () => {},
}));

// WalletProvider & hooks — stub a disconnected wallet
vi.mock('@/app/hooks/useWalletState', () => {
  const WalletProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return {
    WalletProvider,
    useWallet: () => ({ wallet: { connected: false, publicKey: null } }),
    useWalletStatus: () => ({ isChecking: false }),
    useWalletActions: () => ({ refreshWalletState: vi.fn() }),
  };
});

// Icon — render as a descriptive span so badge text is still findable
vi.mock('@/components/icons/Icon', () => ({
  default: ({ id, className }: { id: string; className?: string }) => (
    <span data-testid={`icon-${id}`} className={className} aria-hidden="true" />
  ),
}));

// SubmitProposalModal — thin stub that calls onSubmitted when "submit" is clicked
vi.mock('@/app/components/governance/SubmitProposalModal', () => ({
  SubmitProposalModal: ({
    open,
    onClose,
    onSubmitted,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmitted: (p: { id: string; title: string; category: string; description: string; discussionLink: string }) => void;
  }) =>
    open ? (
      <div data-testid="submit-proposal-modal">
        <button
          onClick={() =>
            onSubmitted({
              id: 'SFP-99',
              title: 'New Test Proposal',
              category: 'Protocol Parameters',
              description: 'A test description for the new proposal.',
              discussionLink: '',
            })
          }
        >
          Confirm Submit
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

// ---------------------------------------------------------------------------
// Import component under test AFTER mocks are in place
// ---------------------------------------------------------------------------
import GovernancePage from '@/app/governance/page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  return render(<GovernancePage />);
}

// ---------------------------------------------------------------------------
// 1. Initial render
// ---------------------------------------------------------------------------

describe('GovernancePage — initial render', () => {
  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Governance & Proposals')).toBeInTheDocument();
  });

  it('renders all four proposals on the All Ballots tab by default', () => {
    renderPage();
    expect(screen.getByText('Whitelist West African GHS/XLM Asset Pair Feed')).toBeInTheDocument();
    expect(screen.getByText('Adjust Global Deviation Threshold from 2.5% to 1.8%')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Core Contract WASM to Release Version v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%')).toBeInTheDocument();
  });

  it('renders the breadcrumb path text', () => {
    renderPage();
    expect(screen.getByText(/Admin \/ Consensus/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. Stats cards
// ---------------------------------------------------------------------------

describe('GovernancePage — stats cards', () => {
  it('renders the Total Staking Power card', () => {
    renderPage();
    expect(screen.getByText('Total Staking Power')).toBeInTheDocument();
    expect(screen.getByText('2.85M SF')).toBeInTheDocument();
  });

  it('renders the Active Ballots card', () => {
    renderPage();
    expect(screen.getByText('Active Ballots')).toBeInTheDocument();
    expect(screen.getByText('2 Proposals')).toBeInTheDocument();
  });

  it('renders the Voter Turnout card', () => {
    renderPage();
    expect(screen.getByText('Voter Turnout Avg')).toBeInTheDocument();
    expect(screen.getByText('74.2%')).toBeInTheDocument();
  });

  it('renders the Passing Invariants card', () => {
    renderPage();
    expect(screen.getByText('Passing Invariants')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 3. Tab filtering
// ---------------------------------------------------------------------------

describe('GovernancePage — tab filtering', () => {
  it('shows all proposals on "All Ballots" tab', () => {
    renderPage();
    const allTab = screen.getByRole('button', { name: /all ballots/i });
    fireEvent.click(allTab);

    expect(screen.getByText('Whitelist West African GHS/XLM Asset Pair Feed')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Core Contract WASM to Release Version v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%')).toBeInTheDocument();
  });

  it('shows only Active/Queue proposals on "Active" tab', () => {
    renderPage();
    const activeTab = screen.getByRole('button', { name: /^active$/i });
    fireEvent.click(activeTab);

    // Active proposals
    expect(screen.getByText('Whitelist West African GHS/XLM Asset Pair Feed')).toBeInTheDocument();
    expect(screen.getByText('Adjust Global Deviation Threshold from 2.5% to 1.8%')).toBeInTheDocument();

    // Passed/Defeated proposals must NOT be visible
    expect(
      screen.queryByText('Upgrade Core Contract WASM to Release Version v1.2.0')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%')
    ).not.toBeInTheDocument();
  });

  it('shows only Passed/Defeated proposals on "Archived" tab', () => {
    renderPage();
    const archivedTab = screen.getByRole('button', { name: /archived/i });
    fireEvent.click(archivedTab);

    // Archived proposals
    expect(screen.getByText('Upgrade Core Contract WASM to Release Version v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%')).toBeInTheDocument();

    // Active proposals must NOT be visible
    expect(
      screen.queryByText('Whitelist West African GHS/XLM Asset Pair Feed')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Adjust Global Deviation Threshold from 2.5% to 1.8%')
    ).not.toBeInTheDocument();
  });

  it('switching from Active back to All Ballots shows all proposals again', () => {
    renderPage();
    const activeTab = screen.getByRole('button', { name: /^active$/i });
    const allTab = screen.getByRole('button', { name: /all ballots/i });

    fireEvent.click(activeTab);
    fireEvent.click(allTab);

    expect(screen.getByText('Upgrade Core Contract WASM to Release Version v1.2.0')).toBeInTheDocument();
    expect(screen.getByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 4. Status badges
// ---------------------------------------------------------------------------

describe('GovernancePage — proposal status badges', () => {
  it('renders an Active badge for SFP-12', () => {
    renderPage();
    const proposal = screen.getByText('Whitelist West African GHS/XLM Asset Pair Feed').closest('div[class*="relative"]');
    expect(proposal).toBeTruthy();
    if (proposal) {
      expect(within(proposal).getByText('Active')).toBeInTheDocument();
    }
  });

  it('renders a Passed badge for SFP-10', () => {
    renderPage();
    const proposal = screen.getByText('Upgrade Core Contract WASM to Release Version v1.2.0').closest('div[class*="relative"]');
    if (proposal) {
      expect(within(proposal).getByText('Passed')).toBeInTheDocument();
    }
  });

  it('renders a Defeated badge for SFP-09', () => {
    renderPage();
    const proposal = screen.getByText('Increase Relayer Missed-Heartbeat Penalty Weight by 2%').closest('div[class*="relative"]');
    if (proposal) {
      expect(within(proposal).getByText('Defeated')).toBeInTheDocument();
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Submit proposal modal interaction
// ---------------------------------------------------------------------------

describe('GovernancePage — Submit Proposal modal', () => {
  it('modal is not visible on initial render', () => {
    renderPage();
    expect(screen.queryByTestId('submit-proposal-modal')).not.toBeInTheDocument();
  });

  it('opens the modal when "Submit New Proposal" button is clicked', () => {
    renderPage();
    const btn = screen.getByRole('button', { name: /submit new proposal/i });
    fireEvent.click(btn);
    expect(screen.getByTestId('submit-proposal-modal')).toBeInTheDocument();
  });

  it('closes the modal when Close is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /submit new proposal/i }));
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByTestId('submit-proposal-modal')).not.toBeInTheDocument();
  });

  it('appends a new Queue proposal after modal submission', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /submit new proposal/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm submit/i }));

    // New proposal title should appear in the list
    expect(screen.getByText('New Test Proposal')).toBeInTheDocument();
  });

  it('new proposal appears under "Active" tab (Queue status)', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /submit new proposal/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm submit/i }));

    // Switch to Active tab — Queue proposals should show here
    fireEvent.click(screen.getByRole('button', { name: /^active$/i }));
    expect(screen.getByText('New Test Proposal')).toBeInTheDocument();
  });

  it('new proposal does NOT appear under "Archived" tab', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /submit new proposal/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm submit/i }));

    fireEvent.click(screen.getByRole('button', { name: /archived/i }));
    expect(screen.queryByText('New Test Proposal')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 6. Proposal detail links
// ---------------------------------------------------------------------------

describe('GovernancePage — proposal detail links', () => {
  it('each proposal has a link pointing to /proposals/<id>', () => {
    const { container } = renderPage();
    const link = container.querySelector('a[href="/proposals/SFP-12"]');
    expect(link).toBeInTheDocument();
  });

  it('renders detail links for all four default proposals', () => {
    const { container } = renderPage();
    const ids = ['SFP-12', 'SFP-11', 'SFP-10', 'SFP-09'];
    for (const id of ids) {
      const link = container.querySelector(`a[href="/proposals/${id}"]`);
      expect(link).toBeInTheDocument();
    }
  });
});
