import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userModel } from '../models/userModel.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errorHandler.js';

export const authService = {
  async register({ name, email, password, age, currency = 'USD', monthly_income = 0, savings_goal = 0 }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists.');
    }

    // Hash password with 12 salt rounds
    const password_hash = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      name,
      email,
      password_hash,
      age,
      currency,
      monthly_income,
      savings_goal
    });

    const { password_hash: _, ...safeUser } = user;

    // Generate JWT token with minimal claims
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return { user: safeUser, token };
  },

  async login({ email, password }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const { password_hash, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return user;
  },

  async updateProfile(userId, updates) {
    const allowedUpdates = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.age !== undefined) allowedUpdates.age = updates.age;
    if (updates.currency !== undefined) allowedUpdates.currency = updates.currency;
    if (updates.monthly_income !== undefined) allowedUpdates.monthly_income = updates.monthly_income;
    if (updates.savings_goal !== undefined) allowedUpdates.savings_goal = updates.savings_goal;

    const updatedUser = await userModel.update(userId, allowedUpdates);
    return updatedUser;
  }
};
