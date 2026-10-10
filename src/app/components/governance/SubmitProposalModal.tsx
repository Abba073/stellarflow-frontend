"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle, FilePlus } from "lucide-react";
import Icon from "@/components/icons/Icon";
import { ICON_IDS } from "@/components/icons/iconIds";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubmitProposalFormState {
  title: string;
  category: string;
  description: string;
  discussionLink: string;
}

interface FieldError {
  title?: string;
  category?: string;
  description?: string;
  discussionLink?: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export interface NewProposalPayload {
  id: string;
  title: string;
  category: string;
  description: string;
  discussionLink: string;
}

interface SubmitProposalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: (proposal: NewProposalPayload) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROPOSAL_CATEGORIES = [
  "Asset Onboarding",
  "Protocol Parameters",
  "Contract Upgrade",
  "Slashing Policy",
  "Fee Structure",
  "Network Governance",
  "Emergency Action",
] as const;

const URL_REGEX = /^https?:\/\/.+/;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(form: SubmitProposalFormState): FieldError {
  const errors: FieldError = {};

  if (!form.title.trim()) {
    errors.title = "Proposal title is required.";
  } else if (form.title.trim().length < 10) {
    errors.title = "Title must be at least 10 characters.";
  } else if (form.title.trim().length > 120) {
    errors.title = "Title must be 120 characters or fewer.";
  }

  if (!form.category) {
    errors.category = "Please select a proposal category.";
  }

  if (!form.description.trim()) {
    errors.description = "A description is required.";
  } else if (form.description.trim().length < 50) {
    errors.description = "Description must be at least 50 characters.";
  }

  if (form.discussionLink.trim() && !URL_REGEX.test(form.discussionLink.trim())) {
    errors.discussionLink = "Must be a valid URL starting with http(s)://.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubmitProposalModal({
  open,
  onClose,
  onSubmitted,
}: SubmitProposalModalProps) {
  const [form, setForm] = useState<SubmitProposalFormState>({
    title: "",
    category: "",
    description: "",
    discussionLink: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [mounted, setMounted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => firstInputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (field: keyof SubmitProposalFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitStatus("submitting");
      setErrors({});

      // Simulated async submission (replace with real on-chain call)
      await new Promise((r) => setTimeout(r, 1100));

      const newProposal: NewProposalPayload = {
        id: `SFP-${Math.floor(Math.random() * 90) + 10}`,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        discussionLink: form.discussionLink.trim(),
      };

      setSubmitStatus("success");
      onSubmitted(newProposal);

      timerRef.current = setTimeout(() => {
        setSubmitStatus("idle");
        setForm({ title: "", category: "", description: "", discussionLink: "" });
        onClose();
      }, 1400);
    },
    [form, onSubmitted, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!mounted || !open) return null;

  const isSubmitting = submitStatus === "submitting";
  const isSuccess = submitStatus === "success";
  const charCount = form.title.length;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-proposal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2
              id="submit-proposal-title"
              className="text-base font-semibold text-white flex items-center gap-2"
            >
              <FilePlus size={16} className="text-blue-400" />
              Submit New Proposal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Proposals require a connected wallet with sufficient staking power.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="proposal-title"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-400"
                >
                  Proposal Title <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[10px] tabular-nums ${
                    charCount > 120 ? "text-red-400" : "text-gray-600"
                  }`}
                >
                  {charCount}/120
                </span>
              </div>
              <input
                ref={firstInputRef}
                id="proposal-title"
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Whitelist KES/XLM Asset Pair Feed"
                disabled={isSubmitting || isSuccess}
                autoComplete="off"
                maxLength={140}
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.title ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.title && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.title}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="proposal-category"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Category <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="proposal-category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                disabled={isSubmitting || isSuccess}
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer ${
                  errors.category ? "border-red-500" : "border-gray-700"
                } ${!form.category ? "text-gray-600" : "text-gray-200"}`}
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {PROPOSAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="proposal-description"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Description <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <textarea
                id="proposal-description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the motivation, technical changes, and expected impact of this proposal…"
                disabled={isSubmitting || isSuccess}
                rows={5}
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.description && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.description}
                </p>
              )}
              <p className="mt-1 text-[10px] text-gray-600">
                Minimum 50 characters. Be clear and specific.
              </p>
            </div>

            {/* Discussion link (optional) */}
            <div>
              <label
                htmlFor="proposal-discussion"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Forum Discussion Link{" "}
                <span className="text-gray-600 normal-case font-normal">(optional)</span>
              </label>
              <input
                id="proposal-discussion"
                type="url"
                value={form.discussionLink}
                onChange={(e) => handleChange("discussionLink", e.target.value)}
                placeholder="https://forum.stellarflow.io/t/…"
                disabled={isSubmitting || isSuccess}
                autoComplete="off"
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.discussionLink ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.discussionLink && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.discussionLink}
                </p>
              )}
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 text-xs text-gray-400 bg-blue-500/5 border border-blue-500/15 px-3 py-2.5 rounded-lg">
              <Icon id={ICON_IDS.alertTriangle} size={13} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                Submitting a proposal requires your connected wallet to hold a minimum bond of{" "}
                <strong className="text-blue-300">5,000 XLM</strong> staking power. The proposal will
                enter a 48-hour review queue before going live.
              </span>
            </div>

            {/* Success */}
            {isSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg"
              >
                <CheckCircle size={15} />
                Proposal submitted successfully. It will appear in the queue shortly.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-[#0d1117] border border-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Submitting…
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle size={14} />
                  Submitted
                </>
              ) : (
                <>
                  <Icon id={ICON_IDS.filePlus} size={14} />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
