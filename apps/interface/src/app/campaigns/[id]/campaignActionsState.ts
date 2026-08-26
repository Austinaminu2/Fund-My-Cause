export type CampaignStatus = "Active" | "Successful" | "Refunded" | "Cancelled";

export type TxStatus = "idle" | "pending" | "done" | "error";

export interface CampaignActionEligibilityInput {
  address: string | null;
  creator: string;
  status: CampaignStatus;
  deadlinePassed: boolean;
  goalMet: boolean;
  userContribution: number;
}

export interface CampaignActionEligibility {
  isCreator: boolean;
  canPledge: boolean;
  canRefund: boolean;
  canWithdraw: boolean;
}

export function deriveCampaignActionEligibility({
  address,
  creator,
  status,
  deadlinePassed,
  goalMet,
  userContribution,
}: CampaignActionEligibilityInput): CampaignActionEligibility {
  const isCreator = !!address && address === creator;

  return {
    isCreator,
    canPledge: status === "Active" && !deadlinePassed,
    canRefund: !!address && deadlinePassed && !goalMet && userContribution > 0,
    canWithdraw: isCreator && status === "Successful",
  };
}
