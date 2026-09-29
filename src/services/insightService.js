/**
 * TeenSpend Smart Spending Insights & Recommendations Engine
 * Deterministic, teenager-tailored, educational, non-judgmental analysis.
 */

export const insightService = {
  /**
   * Analyzes actual financial data and returns personalized insight cards
   */
  async generateInsights({
    userId,
    user,
    monthExpenses = [],
    allExpenses = [],
    currentMonthIncome = 0,
    currentMonthExpenses = 0,
    budgets = [],
    goals = [],
    recurringData = { subscriptions: [], totalMonthlyCost: 0 },
    categoryBreakdown = []
  }) {
    const insights = [];

    // Helper to add insight item
    const addInsight = ({ id, type, title, message, reason, action, priority = 'normal', icon = '💡' }) => {
      insights.push({
        id,
        type, // 'budget' | 'category' | 'trend' | 'subscription' | 'goal' | 'tip'
        title,
        message,
        reason,
        action,
        priority, // 'high' | 'normal' | 'positive'
        icon
      });
    };

    // 1. Budget Warnings (Gentle, supportive notification)
    budgets.forEach((b) => {
      if (b.percentageUsed >= 100) {
        addInsight({
          id: `budget-exceeded-${b.category}`,
          type: 'budget',
          title: `${b.category} Budget Reached`,
          message: `You've used 100% of your ${b.category} budget for this month.`,
          reason: `You spent ${user?.currency || '$'}${b.spent} against your planned ${user?.currency || '$'}${b.amount} limit.`,
          action: 'You could pause discretionary spending in this category until next month or adjust your other category plans.',
          priority: 'high',
          icon: '⚠️'
        });
      } else if (b.percentageUsed >= 80) {
        addInsight({
          id: `budget-warning-${b.category}`,
          type: 'budget',
          title: `${b.category} Budget Notice`,
          message: `You've used about ${b.percentageUsed}% of your ${b.category} budget.`,
          reason: `You have ${user?.currency || '$'}${b.remaining} remaining for the rest of this month.`,
          action: 'You might want to check upcoming expenses in this category to stay within your goal.',
          priority: 'normal',
          icon: '📊'
        });
      }
    });

    // 2. High Category Concentration
    if (categoryBreakdown.length > 0 && currentMonthExpenses > 0) {
      const topCategory = categoryBreakdown[0];
      if (topCategory.percentage >= 30) {
        addInsight({
          id: `top-category-${topCategory.category}`,
          type: 'category',
          title: `Highest Spending: ${topCategory.category}`,
          message: `${topCategory.category} made up ${topCategory.percentage}% of your spending this month.`,
          reason: `You spent ${user?.currency || '$'}${topCategory.amount} on ${topCategory.category} out of ${user?.currency || '$'}${currentMonthExpenses} total.`,
          action: 'You could review these purchases to see if they align with what you value most right now.',
          priority: 'normal',
          icon: '🍕'
        });
      }
    }

    // 3. Small Frequent Purchases (Micro-transactions & snacks)
    const smallPurchases = monthExpenses.filter((e) => Number(e.amount) <= 7.00);
    if (smallPurchases.length >= 4) {
      const smallTotal = smallPurchases.reduce((sum, e) => sum + Number(e.amount), 0);
      addInsight({
        id: 'micro-purchases',
        type: 'trend',
        title: 'Frequent Small Purchases',
        message: `You have ${smallPurchases.length} small purchases (under ${user?.currency || '$'}7) totaling ${user?.currency || '$'}${smallTotal.toFixed(2)}.`,
        reason: 'Small daily items like snacks, drinks, or in-game microtransactions often add up quickly without noticing.',
        action: 'Try the 24-hour test before non-essential purchases to see if you still want them the next day.',
        priority: 'normal',
        icon: '🔍'
      });
    }

    // 4. Recurring Subscriptions Check
    const activeSubs = (recurringData.subscriptions || []).filter((s) => s.is_active);
    if (activeSubs.length >= 2) {
      addInsight({
        id: 'recurring-audit',
        type: 'subscription',
        title: 'Subscription Review',
        message: `You have ${activeSubs.length} recurring subscriptions totaling ${user?.currency || '$'}${recurringData.totalMonthlyCost}/month.`,
        reason: 'Recurring digital services (streaming, gaming passes, storage) renew automatically every billing cycle.',
        action: 'Take 2 minutes to review your active subscriptions and check if you are actively using each one.',
        priority: 'normal',
        icon: '🔄'
      });
    }

    // 5. Savings Goals Progress & Encouragement
    if (goals.length > 0) {
      const activeGoal = goals.find((g) => !g.isCompleted) || goals[0];
      if (activeGoal) {
        if (activeGoal.percentage >= 50) {
          addInsight({
            id: `goal-progress-${activeGoal.id}`,
            type: 'goal',
            title: `Great Progress on "${activeGoal.name}"!`,
            message: `You are ${activeGoal.percentage}% of the way toward your ${activeGoal.name} goal!`,
            reason: `You've saved ${user?.currency || '$'}${activeGoal.current_amount} of your ${user?.currency || '$'}${activeGoal.target_amount} target.`,
            action: activeGoal.suggestedWeeklyContribution
              ? `Putting aside about ${user?.currency || '$'}${activeGoal.suggestedWeeklyContribution}/week will help you reach it on schedule.`
              : 'Keep up the steady contributions to finish strong!',
            priority: 'positive',
            icon: '🎯'
          });
        } else {
          addInsight({
            id: `goal-boost-${activeGoal.id}`,
            type: 'goal',
            title: `Goal Target: ${activeGoal.name}`,
            message: `You have ${user?.currency || '$'}${activeGoal.remaining} left to reach your goal.`,
            reason: `Setting small recurring contributions makes larger purchases like this easy to achieve.`,
            action: 'Consider transferring a fraction of your next allowance or job earnings directly into this goal.',
            priority: 'normal',
            icon: '🌱'
          });
        }
      }
    }

    // 6. Positive Spending / Savings Health
    if (currentMonthIncome > 0 && currentMonthExpenses < currentMonthIncome) {
      const netSaved = currentMonthIncome - currentMonthExpenses;
      const savingsRate = Math.round((netSaved / currentMonthIncome) * 100);

      addInsight({
        id: 'positive-savings-rate',
        type: 'trend',
        title: 'Positive Cash Flow',
        message: `Your spending is currently lower than your income this month.`,
        reason: `You have retained ${user?.currency || '$'}${netSaved.toFixed(2)} (${savingsRate}% of your income) this month.`,
        action: 'Great work! You could allocate a portion of this surplus toward your savings goals or an emergency cushion.',
        priority: 'positive',
        icon: '🎉'
      });
    }

    // 7. General Financial Literacy Tip (Educational)
    const literacyTips = [
      {
        id: 'tip-50-30-20',
        title: 'The 50/30/20 Rule for Teens',
        message: 'A simple way to budget: 50% for Needs (school/transit), 30% for Wants (fun/games), and 20% for Savings.',
        reason: 'This gives you freedom to enjoy your money today while building real savings for tomorrow.',
        action: 'Check your category breakdown to see how your balance compares with this formula.'
      },
      {
        id: 'tip-emergency-fund',
        title: 'Building a Rainy Day Cushion',
        message: 'Having even $50 in personal savings protects you when unexpected expenses pop up.',
        reason: 'You won’t have to borrow or miss out on fun events when your friends make impromptu plans.',
        action: 'Try creating a "Rainy Day" savings goal in your Goals tab.'
      }
    ];

    const chosenTip = literacyTips[Math.floor(Math.random() * literacyTips.length)];
    addInsight({
      ...chosenTip,
      type: 'tip',
      priority: 'normal',
      icon: '📚'
    });

    return insights;
  }
};
