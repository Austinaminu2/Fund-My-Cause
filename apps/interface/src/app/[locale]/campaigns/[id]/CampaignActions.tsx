"use client";

import React from "react";
import { PledgeModal } from "@/components/ui/PledgeModal";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import type { CampaignStatus } from "@fund-my-cause/types";
import { useCampaignActions } from "./useCampaignActions";

interface Props {
  contractId: string;
  creator: string;
  deadlinePassed: boolean;
  goalMet: boolean;
  campaignTitle: string;
  /** Total raised in XLM — used to display payout amount after withdraw. */
  raisedXlm?: number;
  /** Minimum contribution in stroops. */
  minContribution?: bigint;
  status: CampaignStatus;
  /** Called with contribution amount (XLM) immediately on submit for optimistic UI */
  onOptimisticContribute?: (amountXlm: number) => void;
  /** Called on tx failure to roll back optimistic update */
  onRollbackOptimistic?: () => void;
}

export function CampaignActions({
  contractId,
  creator,
  deadlinePassed,
  goalMet,
  campaignTitle,
  status,
  raisedXlm,
  minContribution,
  onOptimisticContribute,
  onRollbackOptimistic,
}: Props) {
  const {
    address,
    networkMismatch,
    pledging,
    setPledging,
    userContribution,
    campaignStatus,
    raised,
    txStatus,
    txHash,
    txError,
    isProcessing,
    canWithdraw,
    canRefund,
    handleWithdraw,
    handleRefund,
    handleDismiss,
    handlePledgeSuccess,
    handlePledgeClick,
  } = useCampaignActions({
    contractId,
    creator,
    deadlinePassed,
    goalMet,
    campaignTitle,
    status,
    raisedXlm,
  });

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Transaction status overlay for withdraw / refund */}
        {txStatus !== "idle" && (
          <TransactionStatus
            status={txStatus}
            txHash={txHash}
            errorMessage={txError}
            onDismiss={handleDismiss}
          />
        )}

        {/* Success message after withdraw */}
        {txStatus === "success" &&
          txHash &&
          campaignStatus === "Successful" &&
          raised > 0 && (
            <p className="text-green-400 text-sm text-center">
              Funds withdrawn successfully — {raised.toLocaleString()} XLM sent
              to your wallet.
            </p>
          )}

        {/* Pledge — visible while campaign is active */}
        {campaignStatus === "Active" && !deadlinePassed && (
          <button
            onClick={handlePledgeClick}
            disabled={networkMismatch || isProcessing}
            aria-label={
              address
                ? `Pledge to ${campaignTitle}`
                : "Connect wallet to pledge"
            }
            className="w-full py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 transition text-white disabled:opacity-50"
          >
            {address ? "Pledge Now" : "Connect Wallet to Pledge"}
          </button>
        )}

        {/* Paused — contributions disabled */}
        {campaignStatus === "Paused" && (
          <button
            disabled
            className="w-full py-3 rounded-xl font-medium bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
          >
            Contributions Paused
          </button>
        )}

        {/* Claim Refund */}
        {canRefund && (
          <button
            onClick={handleRefund}
            disabled={isProcessing}
            aria-label={`Claim refund of ${userContribution.toLocaleString()} XLM`}
            className="w-full py-3 rounded-xl font-medium bg-yellow-600 hover:bg-yellow-500 transition text-white disabled:opacity-50"
          >
            Claim Refund ({userContribution.toLocaleString()} XLM)
          </button>
        )}

        {/* Withdraw Funds — creator only, after deadline + goal met */}
        {canWithdraw && (
          <button
            onClick={handleWithdraw}
            disabled={isProcessing}
            aria-label="Withdraw campaign funds"
            className="w-full py-3 rounded-xl font-medium bg-green-600 hover:bg-green-500 transition text-white disabled:opacity-50"
          >
            Withdraw Funds
          </button>
        )}
      </div>

      {pledging && (
        <PledgeModal
          contractId={contractId}
          campaignTitle={campaignTitle}
          minContribution={minContribution}
          onClose={() => setPledging(false)}
          onSuccess={handlePledgeSuccess}
          onOptimisticContribute={onOptimisticContribute}
          onRollbackOptimistic={onRollbackOptimistic}
        />
      )}
    </>
  );
}
