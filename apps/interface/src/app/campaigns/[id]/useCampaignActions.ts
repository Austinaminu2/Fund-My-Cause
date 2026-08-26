import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { fetchContribution } from "@/lib/soroban";
import {
  CampaignStatus,
  TxStatus,
  deriveCampaignActionEligibility,
} from "./campaignActionsState";

interface UseCampaignActionsArgs {
  contractId: string;
  creator: string;
  deadlinePassed: boolean;
  goalMet: boolean;
  status: CampaignStatus;
}

export function useCampaignActions({
  contractId,
  creator,
  deadlinePassed,
  goalMet,
  status,
}: UseCampaignActionsArgs) {
  const { address, connect, networkMismatch } = useWallet();
  const [pledging, setPledging] = useState(false);
  const [userContribution, setUserContribution] = useState(0);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");

  useEffect(() => {
    if (address) {
      fetchContribution(contractId, address)
        .then(setUserContribution)
        .catch(() => setUserContribution(0));
    }
  }, [address, contractId]);

  const eligibility = deriveCampaignActionEligibility({
    address,
    creator,
    status,
    deadlinePassed,
    goalMet,
    userContribution,
  });

  async function handleRefund() {
    setTxStatus("pending");
    try {
      // TODO: invoke refund_single via Soroban RPC + Freighter signing
      await new Promise((r) => setTimeout(r, 1500)); // placeholder
      setTxStatus("done");
    } catch {
      setTxStatus("error");
    }
  }

  async function handleWithdraw() {
    setTxStatus("pending");
    try {
      // TODO: invoke withdraw via Soroban RPC + Freighter signing
      await new Promise((r) => setTimeout(r, 1500)); // placeholder
      setTxStatus("done");
    } catch {
      setTxStatus("error");
    }
  }

  function handlePledgeClick() {
    if (address) {
      setPledging(true);
    } else {
      connect();
    }
  }

  return {
    address,
    networkMismatch,
    pledging,
    setPledging,
    userContribution,
    txStatus,
    ...eligibility,
    handleRefund,
    handleWithdraw,
    handlePledgeClick,
  };
}
