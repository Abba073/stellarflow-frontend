"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import Icon from "@/components/icons/Icon";
import { ICON_IDS } from "@/components/icons/iconIds";
import type { RelayerManagementRecord } from "./RelayerManagementRow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddRelayerFormState {
  name: string;
  address: string;
  region: string;
}

interface FieldError {
  name?: string;
  address?: string;
  region?: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

interface AddRelayerModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (relayer: RelayerManagementRecord) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REGIONS = [
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
  "Global",
] as const;

const STELLAR_ADDRESS_REGEX = /^G[A-Z2-7]{55}$/;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(form: AddRelayerFormState): FieldError {
  const errors: FieldError = {};

  if (!form.name.trim()) {
    errors.name = "Relayer name is required.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!form.address.trim()) {
    errors.address = "Stellar address is required.";
  } else if (!STELLAR_ADDRESS_REGEX.test(form.address.trim())) {
    errors.address = "Must be a valid 56-character Stellar G address.";
  }

  if (!form.region) {
    errors.region = "Please select a region.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddRelayerModal({ open, onClose, onAdded }: AddRelayerModalProps) {
  const [form, setForm] = useState<AddRelayerFormState>({
    name: "",
    address: "",
    region: "",
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

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => firstInputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (field: keyof AddRelayerFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
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

      // Simulate async network call (replace with real API call)
      await new Promise((r) => setTimeout(r, 900));

      const newRelayer: RelayerManagementRecord = {
        id: `r-${Date.now()}`,
        name: form.name.trim(),
        address: form.address.trim(),
        status: "active",
        uptime: "100.00%",
        latency: Math.floor(Math.random() * 60) + 20,
        successRate: 100,
      };

      setSubmitStatus("success");
      onAdded(newRelayer);

      timerRef.current = setTimeout(() => {
        setSubmitStatus("idle");
        setForm({ name: "", address: "", region: "" });
        onClose();
      }, 1200);
    },
    [form, onAdded, onClose]
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

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-relayer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 id="add-relayer-title" className="text-base font-semibold text-white">
              Add New Relayer
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Register a new oracle relay node on the network.
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

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="relayer-name"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Relayer Name <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="relayer-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Accra Node 1"
                disabled={isSubmitting || isSuccess}
                autoComplete="off"
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.name && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.name}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="relayer-address"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Stellar Address <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="relayer-address"
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value.toUpperCase())}
                placeholder="GXXXXXX… (56 characters)"
                disabled={isSubmitting || isSuccess}
                autoComplete="off"
                spellCheck={false}
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors ${
                  errors.address ? "border-red-500" : "border-gray-700"
                }`}
              />
              {errors.address && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.address}
                </p>
              )}
              <p className="mt-1 text-[10px] text-gray-600">
                Must be a valid Stellar public key starting with G.
              </p>
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="relayer-region"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5"
              >
                Region <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <select
                id="relayer-region"
                value={form.region}
                onChange={(e) => handleChange("region", e.target.value)}
                disabled={isSubmitting || isSuccess}
                className={`w-full bg-[#0d1117] border rounded-lg py-2.5 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer ${
                  errors.region ? "border-red-500" : "border-gray-700"
                } ${!form.region ? "text-gray-600" : "text-gray-200"}`}
              >
                <option value="" disabled>
                  Select a region…
                </option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={11} /> {errors.region}
                </p>
              )}
            </div>

            {/* Success banner */}
            {isSuccess && (
              <div
                role="status"
                className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg"
              >
                <CheckCircle size={15} />
                Relayer registered successfully.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
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
                  Registering…
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle size={14} />
                  Done
                </>
              ) : (
                <>
                  <Icon id={ICON_IDS.plus} size={14} />
                  Register Relayer
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
