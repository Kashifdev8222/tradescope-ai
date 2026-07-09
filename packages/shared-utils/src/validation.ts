import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  display_name: z.string().min(1).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
});

export const depositSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  source: z.string().optional(),
  reference_id: z.string().optional(),
});

export const withdrawalSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  destination: z.string().min(1, 'Destination is required'),
  reference_id: z.string().optional(),
});

export const tradeSchema = z.object({
  account_id: z.string().uuid(),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive('Quantity must be positive'),
  stop_loss: z.number().positive().optional(),
  take_profit: z.number().positive().optional(),
  source: z.enum(['manual', 'ai']).default('manual'),
});

export const aiSettingsSchema = z.object({
  risk_level: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  max_daily_trades: z.number().int().min(1).max(1000).optional(),
  max_position_size: z.number().min(0.1).max(100).optional(),
  daily_loss_limit: z.number().min(0).optional(),
  daily_profit_target: z.number().min(0).optional(),
  stop_loss_pct: z.number().min(0.1).max(100).optional(),
  take_profit_pct: z.number().min(0.1).max(1000).optional(),
  max_leverage: z.number().int().min(1).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type TradeInput = z.infer<typeof tradeSchema>;
export type AISettingsInput = z.infer<typeof aiSettingsSchema>;
