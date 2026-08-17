export interface MilestoneInput {
  id?: string;
  label: string;
  percentage: number;
  paymentMethod?: string;
  description?: string;
  orderIndex?: number;
}

export interface CalculatedMilestone extends MilestoneInput {
  amount: number;
}

export function calculatePaymentMilestones(
  finalTotal: number,
  milestones: MilestoneInput[]
): CalculatedMilestone[] {
  if (!milestones || milestones.length === 0) {
    const depositPct = 25;
    const balancePct = 75;
    const depositAmount = Math.round(finalTotal * (depositPct / 100) * 100) / 100;
    const balanceAmount = Math.round((finalTotal - depositAmount) * 100) / 100;

    return [
      {
        id: "ms-1",
        label: "Upfront Deposit",
        percentage: depositPct,
        amount: depositAmount,
        paymentMethod: "Bank Transfer / Card",
        description: "Paid upon proposal acceptance to secure hardware and scheduling.",
        orderIndex: 1,
      },
      {
        id: "ms-2",
        label: "After Installation & Commissioning",
        percentage: balancePct,
        amount: balanceAmount,
        paymentMethod: "Bank Transfer",
        description: "Paid after MCS installation, testing and commissioning completion.",
        orderIndex: 2,
      },
    ];
  }

  let runningSum = 0;
  const calculated: CalculatedMilestone[] = milestones.map((m, idx) => {
    const amount = Math.round(finalTotal * (m.percentage / 100) * 100) / 100;
    runningSum += amount;
    return {
      ...m,
      amount,
      orderIndex: m.orderIndex || idx + 1,
    };
  });

  // Reconcile rounding difference on final milestone
  const diff = Math.round((finalTotal - runningSum) * 100) / 100;
  if (Math.abs(diff) > 0 && calculated.length > 0) {
    const lastIdx = calculated.length - 1;
    calculated[lastIdx].amount = Math.round((calculated[lastIdx].amount + diff) * 100) / 100;
  }

  return calculated;
}
