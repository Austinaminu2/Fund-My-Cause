import type { CampaignStatus } from "@fund-my-cause/types";

export interface CampaignActionEligibilityInput {
  address: string | null;
  creator: string;
  campaignStatus: CampaignStatus;
  deadlinePassed: boolean;
  goalMet: boolean;
  userContribution: number;
}

export interface CampaignActionEligibility {
  isCreator: boolean;
  canWithdraw: boolean;
  canRefund: boolean;
}

export function deriveCampaignActionEligibility({
  address,
  creator,
  campaignStatus,
  deadlinePassed,
  goalMet,
  userContribution,
}: CampaignActionEligibilityInput): CampaignActionEligibility {
  const isCreator = !!address && address === creator;

  const canWithdraw =
    isCreator &&
    (campaignStatus === "Successful" ||
      (deadlinePassed && goalMet && campaignStatus === "Active"));

  const canRefund =
    !!address &&
    userContribution > 0 &&
    campaignStatus !== "Refunded" &&
    (campaignStatus === "Cancelled" || (deadlinePassed && !goalMet));

  return { isCreator, canWithdraw, canRefund };
}
