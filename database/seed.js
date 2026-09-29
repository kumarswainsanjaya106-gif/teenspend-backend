import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabase.js';

async function runSeed() {
  console.log('Seeding TeenSpend database with realistic sample teenager data...');

  try {
    const password_hash = await bcrypt.hash('password123', 12);

    // 1. Insert or update Alex Chen user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: 'Alex Chen',
        email: 'alex@example.test',
        password_hash,
        age: 16,
        currency: 'USD',
        monthly_income: 240,
        savings_goal: 150
      })
      .select()
      .single();

    if (userError) {
      console.log('User note (may already exist):', userError.message);
    } else {
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    const userId = user ? user.id : '00000000-0000-0000-0000-000000000001';

    // 2. Insert Expenses
    const today = new Date();
    const dAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    };

    const expenses = [
      { user_id: userId, amount: 8.50, category: 'Food', description: "McDonald's with friends", date: dAgo(1), payment_method: 'Debit Card', notes: 'Weekend meal' },
      { user_id: userId, amount: 4.25, category: 'Snacks', description: 'Boba milk tea after school', date: dAgo(2), payment_method: 'Digital Wallet', notes: 'Taro pearls' },
      { user_id: userId, amount: 15.00, category: 'Gaming', description: 'Steam Indie Game', date: dAgo(4), payment_method: 'Digital Wallet', notes: 'Discounted title' },
      { user_id: userId, amount: 12.00, category: 'School', description: 'Notebooks and study pens', date: dAgo(6), payment_method: 'Cash', notes: 'Physics notes' },
      { user_id: userId, amount: 2.50, category: 'Transport', description: 'Bus pass top-up', date: dAgo(7), payment_method: 'Debit Card', notes: 'Transit' },
      { user_id: userId, amount: 5.99, category: 'Subscriptions', description: 'Spotify Student', date: dAgo(10), payment_method: 'Debit Card', notes: 'Monthly' },
      { user_id: userId, amount: 14.50, category: 'Entertainment', description: 'Movie ticket', date: dAgo(12), payment_method: 'Digital Wallet', notes: 'Evening showing' },
      { user_id: userId, amount: 18.00, category: 'Hobbies', description: 'Sketchbook and pens', date: dAgo(15), payment_method: 'Cash', notes: 'Drawing' },
      { user_id: userId, amount: 22.00, category: 'Shopping', description: 'Vintage hoodie', date: dAgo(18), payment_method: 'Debit Card', notes: 'Thrift shop' }
    ];

    for (const exp of expenses) {
      await supabase.from('expenses').insert(exp);
    }
    console.log(`Seeded ${expenses.length} sample expenses.`);

    // 3. Insert Income
    const income = [
      { user_id: userId, amount: 40.00, source: 'Weekly Allowance', date: dAgo(14), notes: 'Completed chores' },
      { user_id: userId, amount: 40.00, source: 'Weekly Allowance', date: dAgo(7), notes: 'Completed chores' },
      { user_id: userId, amount: 60.00, source: 'Neighborhood Dog Walking', date: dAgo(5), notes: 'Part-time chore' },
      { user_id: userId, amount: 50.00, source: 'Birthday Gift', date: dAgo(20), notes: 'Grandma birthday gift' }
    ];

    for (const inc of income) {
      await supabase.from('income').insert(inc);
    }
    console.log(`Seeded ${income.length} sample income records.`);

    // 4. Insert Budgets
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const budgets = [
      { user_id: userId, category: 'Food', amount: 50.00, month: currentMonth, year: currentYear },
      { user_id: userId, category: 'Snacks', amount: 25.00, month: currentMonth, year: currentYear },
      { user_id: userId, category: 'Entertainment', amount: 40.00, month: currentMonth, year: currentYear },
      { user_id: userId, category: 'Gaming', amount: 30.00, month: currentMonth, year: currentYear },
      { user_id: userId, category: 'Transport', amount: 20.00, month: currentMonth, year: currentYear }
    ];

    for (const b of budgets) {
      await supabase.from('budgets').insert(b);
    }
    console.log(`Seeded ${budgets.length} budgets.`);

    // 5. Insert Savings Goals
    const goals = [
      { user_id: userId, name: 'Sony Noise-Canceling Headphones', target_amount: 150.00, current_amount: 85.00, target_date: dAgo(-45), description: 'For studying and music' },
      { user_id: userId, name: 'Summer Skate Camp', target_amount: 250.00, current_amount: 110.00, target_date: dAgo(-120), description: 'Skate workshop with friends' }
    ];

    for (const g of goals) {
      await supabase.from('savings_goals').insert(g);
    }
    console.log(`Seeded ${goals.length} savings goals.`);

    // 6. Insert Recurring Expenses
    const recurring = [
      { user_id: userId, name: 'Spotify Premium Student', amount: 5.99, frequency: 'Monthly', next_payment_date: dAgo(-18), category: 'Subscriptions', is_active: true },
      { user_id: userId, name: 'Nintendo Switch Online', amount: 3.99, frequency: 'Monthly', next_payment_date: dAgo(-10), category: 'Gaming', is_active: true },
      { user_id: userId, name: 'iCloud 50GB Backup', amount: 0.99, frequency: 'Monthly', next_payment_date: dAgo(-5), category: 'Subscriptions', is_active: true }
    ];

    for (const r of recurring) {
      await supabase.from('recurring_expenses').insert(r);
    }
    console.log(`Seeded ${recurring.length} recurring expenses.`);

    console.log('✅ Seed completed successfully! Test account: alex@example.test / password123');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

runSeed();
