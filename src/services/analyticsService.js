import { expenseModel } from '../models/expenseModel.js';
import { incomeModel } from '../models/incomeModel.js';
import { budgetService } from './budgetService.js';
import { goalService } from './goalService.js';
import { recurringService } from './recurringService.js';
import { userModel } from '../models/userModel.js';
import { insightService } from './insightService.js';

export const analyticsService = {
  /**
   * Complete unified dashboard payload in a single fast call
   */
  async getDashboard(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Start of current month
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // 1. Fetch user data, current month expenses & all income
    const [user, monthExpenses, allExpenses, allIncome, budgets, goals, recurringData] = await Promise.all([
      userModel.findById(userId),
      expenseModel.getRange(userId, startOfMonth, endOfMonth),
      expenseModel.findAll(userId, { page: 1, limit: 100, sortBy: 'date', sortOrder: 'desc' }),
      incomeModel.findAll(userId),
      budgetService.getBudgets(userId, currentMonth, currentYear),
      goalService.getGoals(userId),
      recurringService.getRecurring(userId)
    ]);

    // Financial totals (lifetime or current period)
    const totalLifetimeIncome = allIncome.reduce((acc, item) => acc + Number(item.amount), 0);
    const totalLifetimeExpenses = allExpenses.expenses.reduce((acc, item) => acc + Number(item.amount), 0);

    const currentMonthExpenses = monthExpenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const currentMonthIncome = allIncome
      .filter((inc) => inc.date >= startOfMonth && inc.date <= endOfMonth)
      .reduce((acc, item) => acc + Number(item.amount), 0);

    // Current balance = all income - all expenses (or user allowance baseline)
    const currentBalance = totalLifetimeIncome - totalLifetimeExpenses;
    const totalSavingsInGoals = goals.reduce((acc, g) => acc + Number(g.current_amount), 0);

    // Category breakdown for current month
    const categoryMap = {};
    monthExpenses.forEach((exp) => {
      const cat = exp.category;
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => {
      const percentage = currentMonthExpenses > 0 ? Number(((amount / currentMonthExpenses) * 100).toFixed(1)) : 0;
      return {
        category,
        amount: Number(amount.toFixed(2)),
        percentage
      };
    }).sort((a, b) => b.amount - a.amount);

    // Monthly trends (past 6 months)
    const monthlyTrend = this.calculateMonthlyTrend(allExpenses.expenses, allIncome, 6);

    // Daily spending trend for current month (for line charts)
    const dailySpending = this.calculateDailySpending(monthExpenses, currentYear, currentMonth);

    // Recent 5 expenses
    const recentExpenses = allExpenses.expenses.slice(0, 5);

    // Average daily spending this month
    const dayOfMonth = Math.max(1, now.getDate());
    const avgDailySpending = Number((currentMonthExpenses / dayOfMonth).toFixed(2));
    const avgWeeklySpending = Number((avgDailySpending * 7).toFixed(2));

    // Generate smart data-driven insights
    const insights = await insightService.generateInsights({
      userId,
      user,
      monthExpenses,
      allExpenses: allExpenses.expenses,
      currentMonthIncome,
      currentMonthExpenses,
      budgets,
      goals,
      recurringData,
      categoryBreakdown
    });

    return {
      summary: {
        balance: Number(currentBalance.toFixed(2)),
        income: Number(currentMonthIncome.toFixed(2)),
        expenses: Number(currentMonthExpenses.toFixed(2)),
        savings: Number(totalSavingsInGoals.toFixed(2)),
        totalLifetimeIncome: Number(totalLifetimeIncome.toFixed(2)),
        totalLifetimeExpenses: Number(totalLifetimeExpenses.toFixed(2)),
        monthlyBudget: budgets.reduce((acc, b) => acc + Number(b.amount), 0),
        avgDailySpending,
        avgWeeklySpending,
        currency: user?.currency || 'USD'
      },
      categoryBreakdown,
      monthlyTrend,
      dailySpending,
      budgetProgress: budgets,
      goals,
      recurring: recurringData,
      recentExpenses,
      insights
    };
  },

  calculateMonthlyTrend(expenses, incomeList, monthsCount = 6) {
    const result = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const monthExp = expenses
        .filter((e) => e.date >= startStr && e.date <= endStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const monthInc = incomeList
        .filter((inc) => inc.date >= startStr && inc.date <= endStr)
        .reduce((sum, inc) => sum + Number(inc.amount), 0);

      result.push({
        month: monthLabel,
        year,
        expenses: Number(monthExp.toFixed(2)),
        income: Number(monthInc.toFixed(2)),
        netSavings: Number((monthInc - monthExp).toFixed(2))
      });
    }

    return result;
  },

  calculateDailySpending(monthExpenses, year, month) {
    const lastDay = new Date(year, month, 0).getDate();
    const daysMap = {};

    for (let d = 1; d <= lastDay; d++) {
      daysMap[d] = 0;
    }

    monthExpenses.forEach((e) => {
      const dayNum = parseInt(e.date.split('-')[2], 10);
      if (daysMap[dayNum] !== undefined) {
        daysMap[dayNum] += Number(e.amount);
      }
    });

    const todayDate = new Date().getDate();
    return Object.entries(daysMap)
      .filter(([day]) => parseInt(day, 10) <= todayDate)
      .map(([day, amount]) => ({
        day: `Day ${day}`,
        dayNumber: Number(day),
        amount: Number(amount.toFixed(2))
      }));
  }
};
