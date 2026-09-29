import request from 'supertest';
import app from '../src/app.js';
import bcrypt from 'bcryptjs';

describe('TeenSpend API Integration Tests', () => {
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let testExpenseId = '';

  const userAData = {
    name: 'Teen User A',
    email: `teena_${Date.now()}@example.test`,
    password: 'password123',
    age: 15,
    currency: 'USD',
    monthly_income: 150
  };

  const userBData = {
    name: 'Teen User B',
    email: `teenb_${Date.now()}@example.test`,
    password: 'password456',
    age: 17,
    currency: 'USD',
    monthly_income: 200
  };

  // 1. Health check
  test('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 2. Auth: Register User A
  test('POST /api/auth/register registers User A and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userAData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(userAData.email.toLowerCase());
    expect(res.body.data.user.password_hash).toBeUndefined(); // Password hash must NEVER be leaked
    expect(res.body.data.token).toBeDefined();

    userAToken = res.body.data.token;
    userAId = res.body.data.user.id;
  });

  // 3. Auth: Duplicate registration prevention
  test('POST /api/auth/register rejects duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userAData);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 4. Auth: Register User B
  test('POST /api/auth/register registers User B', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userBData);

    expect(res.status).toBe(201);
    userBToken = res.body.data.token;
    userBId = res.body.data.user.id;
  });

  // 5. Auth: Login with valid credentials
  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userAData.email,
        password: userAData.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  // 6. Auth: Login with invalid password
  test('POST /api/auth/login fails with invalid password (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userAData.email,
        password: 'wrong_password'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 7. Protected route without token fails
  test('GET /api/expenses without token rejects with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(401);
  });

  // 8. Expense Creation for User A
  test('POST /api/expenses creates an expense for User A', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 8.50,
        category: 'Food',
        description: 'Lunch with school friends',
        payment_method: 'Debit Card',
        notes: 'Burgers'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(8.50);
    expect(res.body.data.user_id).toBe(userAId);
    testExpenseId = res.body.data.id;
  });

  // 9. Negative or zero amount rejection
  test('POST /api/expenses rejects negative or 0 amount with 422 Validation Error', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: -5.00,
        category: 'Food',
        description: 'Invalid negative test'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  // 10. CRITICAL SECURITY TEST: Authorization / Data Isolation
  // User B MUST NOT be able to view or delete User A's expense!
  test('CRITICAL SECURITY: User B cannot access User A expense', async () => {
    const res = await request(app)
      .get(`/api/expenses/${testExpenseId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Expect 404 or 403 (Resource not found for User B)
    expect([403, 404]).toContain(res.status);
  });

  test('CRITICAL SECURITY: User B cannot delete User A expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${testExpenseId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect([403, 404]).toContain(res.status);

    // Verify it still exists for User A
    const verifyRes = await request(app)
      .get(`/api/expenses/${testExpenseId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    expect(verifyRes.status).toBe(200);
  });

  // 11. Income recording & balance calculation
  test('POST /api/income records income for User A', async () => {
    const res = await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 50.00,
        source: 'Allowance',
        notes: 'Chores completed'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(50.00);
  });

  // 12. Dashboard Unified Analytics
  test('GET /api/analytics/dashboard returns calculated summary, categories, and insights', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    // User A has 50 income and 8.50 expense -> balance = 41.50
    expect(res.body.data.summary.balance).toBe(41.50);
    expect(Array.isArray(res.body.data.categoryBreakdown)).toBe(true);
    expect(Array.isArray(res.body.data.insights)).toBe(true);
  });

  // 13. Budgets & Alert calculation
  test('POST /api/budgets sets category budget', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'Food',
        amount: 20.00
      });

    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('Food');
    expect(res.body.data.amount).toBe(20.00);
  });

  // 14. Savings Goal & Contribution
  test('POST /api/goals creates goal and accepts contribution', async () => {
    const createRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'Gaming Headset',
        target_amount: 80.00,
        current_amount: 20.00
      });

    expect(createRes.status).toBe(201);
    const goalId = createRes.body.data.id;

    const contribRes = await request(app)
      .post(`/api/goals/${goalId}/contribute`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 15.00 });

    expect(contribRes.status).toBe(200);
    expect(contribRes.body.data.current_amount).toBe(35.00);
  });
});
