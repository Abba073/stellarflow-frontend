"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useIsHydrated } from "@/app/hooks/useIsHydrated";
import { WalletProvider, useWallet, useWalletStatus, useWalletActions } from "@/app/hooks/useWalletState";
import Icon from "@/components/icons/Icon";
import { ICON_IDS } from "@/components/icons/iconIds";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VoteRecord {
  voter: string;
  shortenedVoter: string;
  vote: "For" | "Against";
  weight: number;
  timestamp: string;
}

interface ProposalDetail {
  id: string;
  title: string;
  description: string;
  proposer: string;
  shortenedProposer: string;
  status: "Active" | "Passed" | "Defeated" | "Queue";
  votesFor: number;
  votesAgainst: number;
  quorumThreshold: number;
  endsInLedgers: number;
  submittedAt: string;
  category: string;
  discussionLink: string;
  votes: VoteRecord[];
}

// ---------------------------------------------------------------------------
// Mock data — keyed by proposal ID
// ---------------------------------------------------------------------------

const MOCK_PROPOSALS: Record<string, ProposalDetail> = {
  "SFP-12": {
    id: "SFP-12",
    title: "Whitelist West African GHS/XLM Asset Pair Feed",
    description:
      "This proposal requests the whitelisting of the GHS/XLM (Ghanaian Cedi to XLM) asset pair inside the StellarFlow oracle registry. The West African market currently lacks a reliable on-chain GHS price feed for DeFi applications. Approving this proposal will allow relayers in the West Africa cluster to begin submitting verified GHS/XLM price ticks, which downstream lending pools and DEXs can consume via the existing subscription model.\n\nThe feed will be governed by the same deviation threshold (2.5%) and heartbeat frequency (every 5 ledgers) as existing pairs. An initial bond of 15,000 XLM will be required from participating relayers.",
    proposer: "GA5THZLKMNPQRSXYZABCDEFGHIJKLMNBC9A",
    shortenedProposer: "GA5T...C9A",
    status: "Active",
    votesFor: 785000,
    votesAgainst: 120000,
    quorumThreshold: 60,
    endsInLedgers: 4200,
    submittedAt: "2026-10-05T09:14:00Z",
    category: "Asset Onboarding",
    discussionLink: "https://forum.stellarflow.io/t/sfp-12",
    votes: [
      { voter: "GA1XVHZLKMNPQRSXYZ000001", shortenedVoter: "GA1X...0001", vote: "For", weight: 120000, timestamp: "2026-10-05T10:00:00Z" },
      { voter: "GB2YVHZLKMNPQRSXYZ000002", shortenedVoter: "GB2Y...0002", vote: "For", weight: 95000, timestamp: "2026-10-05T11:30:00Z" },
      { voter: "GC3ZVHZLKMNPQRSXYZ000003", shortenedVoter: "GC3Z...0003", vote: "Against", weight: 80000, timestamp: "2026-10-06T08:15:00Z" },
      { voter: "GD4AVHZLKMNPQRSXYZ000004", shortenedVoter: "GD4A...0004", vote: "For", weight: 200000, timestamp: "2026-10-06T14:22:00Z" },
      { voter: "GE5BVHZLKMNPQRSXYZ000005", shortenedVoter: "GE5B...0005", vote: "For", weight: 370000, timestamp: "2026-10-07T09:00:00Z" },
      { voter: "GF6CVHZLKMNPQRSXYZ000006", shortenedVoter: "GF6C...0006", vote: "Against", weight: 40000, timestamp: "2026-10-07T16:45:00Z" },
    ],
  },
  "SFP-11": {
    id: "SFP-11",
    title: "Adjust Global Deviation Threshold from 2.5% to 1.8%",
    description:
      "This proposal aims to tighten the acceptable deviation window for oracle price submissions from the current 2.5% to 1.8%. Tighter deviation bounds reduce the window of manipulation available to malicious relayers, improve data quality for lending protocols that use narrow liquidation thresholds, and align StellarFlow with industry best practices observed on Chainlink and Pyth Network.\n\nAll existing relayers will be notified 48 hours before the change takes effect. Relayers unable to meet the tighter threshold will enter a probation period before potential slashing.",
    proposer: "GBC2VHZLKMNPQRSXYZABCDEFGHIJKLMLOPA",
    shortenedProposer: "GBC2...OPA",
    status: "Active",
    votesFor: 450000,
    votesAgainst: 410000,
    quorumThreshold: 60,
    endsInLedgers: 1150,
    submittedAt: "2026-10-03T14:00:00Z",
    category: "Protocol Parameters",
    discussionLink: "https://forum.stellarflow.io/t/sfp-11",
    votes: [
      { voter: "GA7DVHZLKMNPQRSXYZ000007", shortenedVoter: "GA7D...0007", vote: "For", weight: 250000, timestamp: "2026-10-04T07:00:00Z" },
      { voter: "GB8EVHZLKMNPQRSXYZ000008", shortenedVoter: "GB8E...0008", vote: "Against", weight: 210000, timestamp: "2026-10-04T09:30:00Z" },
      { voter: "GC9FVHZLKMNPQRSXYZ000009", shortenedVoter: "GC9F...0009", vote: "For", weight: 200000, timestamp: "2026-10-05T12:00:00Z" },
      { voter: "GD0GVHZLKMNPQRSXYZ000010", shortenedVoter: "GD0G...0010", vote: "Against", weight: 200000, timestamp: "2026-10-06T16:00:00Z" },
    ],
  },
  "SFP-10": {
    id: "SFP-10",
    title: "Upgrade Core Contract WASM to Release Version v1.2.0",
    description:
      "This proposal authorises the upgrade of the StellarFlow core oracle contract WASM binary from v1.1.3 to v1.2.0. The new version includes critical performance improvements to the submission aggregation logic, a fix for a potential reentrancy edge case in the dispute resolution module, and gas cost reductions of approximately 18% for standard price submissions.\n\nThe new WASM binary has been audited by Trail of Bits (report linked in discussion thread) and tested on Stellar Futurenet for 14 days without incident.",
    proposer: "GDRTVHZLKMNPQRSXYZABCDEFGHIJKLM1122",
    shortenedProposer: "GDRT...1122",
    status: "Passed",
    votesFor: 1200000,
    votesAgainst: 15000,
    quorumThreshold: 75,
    endsInLedgers: 0,
    submittedAt: "2026-09-20T10:00:00Z",
    category: "Contract Upgrade",
    discussionLink: "https://forum.stellarflow.io/t/sfp-10",
    votes: [
      { voter: "GA1XVHZLKMNPQRSXYZ000001", shortenedVoter: "GA1X...0001", vote: "For", weight: 400000, timestamp: "2026-09-21T08:00:00Z" },
      { voter: "GB2YVHZLKMNPQRSXYZ000002", shortenedVoter: "GB2Y...0002", vote: "For", weight: 500000, timestamp: "2026-09-22T10:00:00Z" },
      { voter: "GC3ZVHZLKMNPQRSXYZ000003", shortenedVoter: "GC3Z...0003", vote: "Against", weight: 15000, timestamp: "2026-09-23T14:00:00Z" },
      { voter: "GD4AVHZLKMNPQRSXYZ000004", shortenedVoter: "GD4A...0004", vote: "For", weight: 300000, timestamp: "2026-09-24T09:00:00Z" },
    ],
  },
  "SFP-09": {
    id: "SFP-09",
    title: "Increase Relayer Missed-Heartbeat Penalty Weight by 2%",
    description:
      "This proposal suggests increasing the slashing penalty applied to relayers who miss consecutive heartbeat submissions from the current 3% to 5% of bonded stake per missed window. Proponents argue that the current penalty is insufficient to incentivise high-uptime behaviour. Opponents note that the penalty increase could drive smaller relayers out of the network, reducing geographic decentralisation.",
    proposer: "GCXXVHZLKMNPQRSXYZABCDEFGHIJKLM7766",
    shortenedProposer: "GCXX...7766",
    status: "Defeated",
    votesFor: 110000,
    votesAgainst: 920000,
    quorumThreshold: 50,
    endsInLedgers: 0,
    submittedAt: "2026-09-10T08:00:00Z",
    category: "Slashing Policy",
    discussionLink: "https://forum.stellarflow.io/t/sfp-09",
    votes: [
      { voter: "GE5BVHZLKMNPQRSXYZ000005", shortenedVoter: "GE5B...0005", vote: "For", weight: 110000, timestamp: "2026-09-11T10:00:00Z" },
      { voter: "GF6CVHZLKMNPQRSXYZ000006", shortenedVoter: "GF6C...0006", vote: "Against", weight: 920000, timestamp: "2026-09-12T11:00:00Z" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ProposalDetail["status"] }) {
  const map: Record<ProposalDetail["status"], string> = {
    Active:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Passed:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Defeated: "bg-red-500/10 text-red-400 border-red-500/20",
    Queue:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${map[status]}`}>
      {status}
    </span>
  );
}

// Cast-vote panel — isolated so WalletProvider only wraps this section
function CastVoteContent({ proposalId, isActive }: { proposalId: string; isActive: boolean }) {
  const { wallet } = useWallet();
  const { isChecking } = useWalletStatus();
  const { refreshWalletState } = useWalletActions();
  const [voted, setVoted] = useState<"For" | "Against" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isConnected = !!wallet?.connected;

  async function handleVote(choice: "For" | "Against") {
    if (!isConnected || submitting || !isActive) return;
    setSubmitting(true);
    setMessage("Submitting vote…");
    // Simulated async submission
    await new Promise((r) => setTimeout(r, 1200));
    setVoted(choice);
    setSubmitting(false);
    setMessage(`Your vote (${choice}) has been recorded on-chain.`);
  }

  if (!isActive) {
    return (
      <div className="rounded-xl bg-[#161b22] border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Voting Closed</h3>
        <p className="text-xs text-gray-500">This proposal is no longer accepting votes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#161b22] border border-gray-800 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white">Cast Your Vote</h3>

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Connect your Freighter wallet to participate.</p>
          <button
            onClick={() => refreshWalletState()}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Icon id={ICON_IDS.wallet} size={16} />
            {isChecking ? "Connecting…" : "Connect Freighter Wallet"}
          </button>
        </div>
      ) : voted ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <CheckCircle size={16} />
          {message}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Voting power derived from your staked XLM balance.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleVote("For")}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} />
              Vote For
            </button>
            <button
              onClick={() => handleVote("Against")}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <XCircle size={15} />
              Vote Against
            </button>
          </div>
          {submitting && (
            <p className="text-xs text-gray-400 animate-pulse">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

function CastVotePanel({ proposalId, isActive }: { proposalId: string; isActive: boolean }) {
  return (
    <WalletProvider>
      <CastVoteContent proposalId={proposalId} isActive={isActive} />
    </WalletProvider>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const isHydrated = useIsHydrated();

  const proposal = MOCK_PROPOSALS[id] ?? null;

  // Voting breakdown stats
  const { totalVotes, forPct, againstPct } = useMemo(() => {
    if (!proposal) return { totalVotes: 0, forPct: 0, againstPct: 0 };
    const total = proposal.votesFor + proposal.votesAgainst;
    return {
      totalVotes: total,
      forPct: total > 0 ? (proposal.votesFor / total) * 100 : 0,
      againstPct: total > 0 ? (proposal.votesAgainst / total) * 100 : 0,
    };
  }, [proposal]);

  // Not found state
  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 flex flex-col items-center justify-center gap-6">
        <AlertTriangle size={40} className="text-yellow-500" />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proposal Not Found</h1>
          <p className="text-gray-500 text-sm">
            No proposal with ID <span className="font-mono text-gray-300">{id}</span> exists.
          </p>
        </div>
        <Link
          href="/governance"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Governance
        </Link>
      </div>
    );
  }

  const isActive = proposal.status === "Active";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/governance" className="hover:text-white transition-colors">
          Governance
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-300 font-mono">{proposal.id}</span>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Left column — proposal body */}
        <div className="space-y-6">
          {/* Title & meta */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-tight">
                {proposal.id}
              </span>
              <StatusBadge status={proposal.status} />
              <span className="text-xs bg-[#0d1117] border border-gray-700 text-gray-400 px-2 py-0.5 rounded font-medium">
                {proposal.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight leading-snug">
              {proposal.title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-800">
              <InfoItem
                label="Proposed by"
                value={
                  <span className="font-mono text-gray-300">
                    {proposal.shortenedProposer}
                  </span>
                }
              />
              <InfoItem
                label="Submitted"
                value={
                  isHydrated
                    ? new Date(proposal.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <InfoItem
                label="Status"
                value={
                  isActive ? (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Clock size={13} />
                      ~{proposal.endsInLedgers.toLocaleString()} ledgers left
                    </span>
                  ) : (
                    <span className="capitalize text-gray-400">{proposal.status}</span>
                  )
                }
              />
            </div>

            {/* Discussion link */}
            <a
              href={proposal.discussionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={12} />
              View forum discussion
            </a>
          </div>

          {/* Description */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Proposal Description
            </h2>
            <div className="space-y-4">
              {proposal.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-300 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Voting results */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Voting Results
              </h2>
              <span className="text-xs text-gray-500 font-mono">
                {totalVotes.toLocaleString()} total votes cast
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">
                  For — {forPct.toFixed(1)}%
                </span>
                <span className="text-red-400 font-bold">
                  Against — {againstPct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-red-950/40 border border-gray-800 flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${forPct}%` }}
                  aria-label={`${forPct.toFixed(1)}% for`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>{proposal.votesFor.toLocaleString()} XLM</span>
                <span>Quorum required: {proposal.quorumThreshold}%</span>
                <span>{proposal.votesAgainst.toLocaleString()} XLM</span>
              </div>
            </div>

            {/* Quorum indicator */}
            <div
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                forPct >= proposal.quorumThreshold
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}
            >
              {forPct >= proposal.quorumThreshold ? (
                <CheckCircle size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {forPct >= proposal.quorumThreshold
                ? `Quorum reached (${forPct.toFixed(1)}% ≥ ${proposal.quorumThreshold}%)`
                : `Quorum not yet met — needs ${(proposal.quorumThreshold - forPct).toFixed(1)}% more`}
            </div>
          </div>

          {/* Vote log */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Users size={14} />
                Vote Log
              </h2>
              <span className="text-xs text-gray-500">
                {proposal.votes.length} voters
              </span>
            </div>
            <div className="divide-y divide-gray-800">
              {proposal.votes.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        v.vote === "For" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                    />
                    <span className="font-mono text-xs text-gray-400">
                      {v.shortenedVoter}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs tabular-nums text-gray-300">
                      {v.weight.toLocaleString()} XLM
                    </span>
                    <span
                      className={`text-xs font-bold w-14 text-right ${
                        v.vote === "For"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {v.vote}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono w-28 text-right">
                      {isHydrated
                        ? new Date(v.timestamp).toLocaleString("en-GB", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          {/* Cast vote */}
          <CastVotePanel proposalId={proposal.id} isActive={isActive} />

          {/* Quick stats */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Quick Stats
            </h3>
            <QuickStat label="Votes For" value={proposal.votesFor.toLocaleString() + " XLM"} color="text-emerald-400" />
            <QuickStat label="Votes Against" value={proposal.votesAgainst.toLocaleString() + " XLM"} color="text-red-400" />
            <QuickStat label="Total Voters" value={String(proposal.votes.length)} color="text-gray-300" />
            <QuickStat label="Quorum Threshold" value={proposal.quorumThreshold + "%"} color="text-gray-300" />
            <div className="pt-1 border-t border-gray-800">
              <QuickStat
                label="Outcome"
                value={proposal.status}
                color={
                  proposal.status === "Passed"
                    ? "text-emerald-400"
                    : proposal.status === "Defeated"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              />
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/governance"
            className="flex items-center justify-center gap-2 w-full bg-[#161b22] border border-gray-800 text-gray-400 hover:text-white py-2.5 rounded-xl text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            All Proposals
          </Link>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Micro helpers
// ---------------------------------------------------------------------------

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
        {label}
      </p>
      <div className="text-sm text-gray-300">{value}</div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
