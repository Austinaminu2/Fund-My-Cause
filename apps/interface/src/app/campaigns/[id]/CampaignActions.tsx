"use client";

import React from "react";
import { PledgeModal } from "@/components/ui/PledgeModal";
import { CampaignStatus } from "./campaignActionsState";
import { useCampaignActions } from "./useCampaignActions";

interface Props {
  contractId: string;
  creator: string;
  deadlinePassed: boolean;
  goalMet: boolean;
  campaignTitle: string;
  status: CampaignStatus;
}

export function CampaignActions({
  contractId,
  creator,
  deadlinePassed,
  goalMet,
  campaignTitle,
  status,
}: Props) {
  const {
    address,
    networkMismatch,
    pledging,
    setPledging,
    userContribution,
    txStatus,
    canPledge,
    canRefund,
    canWithdraw,
    handleRefund,
    handleWithdraw,
    handlePledgeClick,
  } = useCampaignActions({ contractId, creator, deadlinePassed, goalMet, status });

  if (txStatus === "done") {
    return <p className="text-green-500 dark:text-green-400 text-center py-4">Transaction submitted successfully!</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Pledge — always visible when campaign is active */}
        {canPledge && (
          <button
            onClick={handlePledgeClick}
            disabled={networkMismatch}
            className="w-full py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 transition text-white disabled:opacity-50"
          >
            {address ? "Pledge Now" : "Connect Wallet to Pledge"}
          </button>
        )}

        {/* Claim Refund */}
        {canRefund && (
          <button
            onClick={handleRefund}
            disabled={txStatus === "pending"}
            className="w-full py-3 rounded-xl font-medium bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 transition text-white"
          >
            {txStatus === "pending" ? "Processing…" : `Claim Refund (${userContribution.toLocaleString()} XLM)`}
          </button>
        )}

        {/* Withdraw Funds */}
        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={txStatus === "pending"}
            className="w-full py-3 rounded-xl font-medium bg-green-600 hover:bg-green-500 disabled:opacity-50 transition text-white"
          >
            {txStatus === "pending" ? "Processing…" : "Withdraw Funds"}
          </button>
        )}

        {txStatus === "error" && (
          <p className="text-red-500 dark:text-red-400 text-sm text-center">Transaction failed. Please try again.</p>
        )}
      </div>

      {pledging && (
        <PledgeModal campaignTitle={campaignTitle} onClose={() => setPledging(false)} />
      )}
    </>
  );
}
