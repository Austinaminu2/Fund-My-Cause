import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { TxStatus } from "@/components/ui/TransactionStatus";
import { withdraw, refundSingle, getCampaignStats } from "@/lib/contract";
import { fetchContribution } from "@/lib/graphql/client";
import type { CampaignStatus } from "@fund-my-cause/types";
import { useNotifications } from "@/hooks/useNotifications";
import { deriveCampaignActionEligibility } from "./campaignActionsState";

interface UseCampaignActionsArgs {
  contractId: string;
  creator: string;
  deadlinePassed: boolean;
  goalMet: boolean;
  campaignTitle: string;
  status: CampaignStatus;
  raisedXlm?: number;
}

function trackContributionLocally(address: string, contractId: string) {
  try {
    const raw = localStorage.getItem("fmc:contributions");
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const existing = map[address] ?? [];
    if (!existing.includes(contractId)) {
      map[address] = [...existing, contractId];
      localStorage.setItem("fmc:contributions", JSON.stringify(map));
    }
  } catch {
    // non-critical
  }
}

export function useCampaignActions({
  contractId,
  creator,
  deadlinePassed,
  goalMet,
  campaignTitle,
  status: initialStatus,
  raisedXlm = 0,
}: UseCampaignActionsArgs) {
  const { address, connect, signTx, networkMismatch } = useWallet();
  const { addNotification } = useNotifications();
  const [pledging, setPledging] = useState(false);
  const [userContribution, setUserContribution] = useState(0);
  const [campaignStatus, setCampaignStatus] = useState(initialStatus);
  const [raised, setRaised] = useState(raisedXlm);
  const [pendingTx, setPendingTx] = useState(false);

  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  useEffect(() => {
    if (address) {
      fetchContribution(contractId, address)
        .then(setUserContribution)
        .catch(() => setUserContribution(0));
    }
  }, [address, contractId]);

  const { isCreator, canWithdraw, canRefund } = deriveCampaignActionEligibility(
    {
      address,
      creator,
      campaignStatus,
      deadlinePassed,
      goalMet,
      userContribution,
    },
  );

  async function handleWithdraw() {
    if (!address || pendingTx) return;
    setPendingTx(true);
    setTxError("");
    setTxStatus("signing");
    try {
      const hash = await withdraw(contractId, address, async (xdr) => {
        const signed = await signTx(xdr);
        setTxStatus("submitting");
        return signed;
      });
      setTxStatus("confirming");
      setTxHash(hash);
      setTxStatus("success");
      setCampaignStatus("Successful");

      try {
        const stats = await getCampaignStats(contractId);
        setRaised(Number(stats.totalRaised) / 1e7);
      } catch {
        // non-critical
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Withdraw failed.";
      setTxError(msg);
      setTxStatus("error");
    } finally {
      setPendingTx(false);
    }
  }

  async function handleRefund() {
    if (!address || pendingTx) return;
    setPendingTx(true);
    setTxError("");
    setTxStatus("signing");
    try {
      const hash = await refundSingle(contractId, address, async (xdr) => {
        const signed = await signTx(xdr);
        setTxStatus("submitting");
        return signed;
      });
      setTxStatus("confirming");
      setTxHash(hash);
      setTxStatus("success");
      setUserContribution(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refund failed.";
      setTxError(msg);
      setTxStatus("error");
    } finally {
      setPendingTx(false);
    }
  }

  function handleDismiss() {
    setTxStatus("idle");
    setTxHash("");
    setTxError("");
  }

  async function handlePledgeSuccess() {
    if (address) {
      trackContributionLocally(address, contractId);
    }

    try {
      const stats = await getCampaignStats(contractId);
      const newRaised = Number(stats.totalRaised) / 1e7;
      setRaised(newRaised);
      if (stats.progressBps >= 10000) {
        addNotification({
          type: "goal_reached",
          title: "Goal Reached! 🎉",
          message: `"${campaignTitle}" has been fully funded with ${newRaised.toLocaleString()} XLM!`,
          campaignId: contractId,
        });
      }
    } catch {
      // non-critical
    }
  }

  function handlePledgeClick() {
    if (address) {
      setPledging(true);
    } else {
      connect();
    }
  }

  const isProcessing = txStatus !== "idle" || pendingTx;

  return {
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
    isCreator,
    canWithdraw,
    canRefund,
    handleWithdraw,
    handleRefund,
    handleDismiss,
    handlePledgeSuccess,
    handlePledgeClick,
  };
}
