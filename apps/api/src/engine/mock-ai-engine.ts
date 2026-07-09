import { supabaseAdmin } from '../config/supabase.js';
import { getQuote, getAllSymbols } from './mock-market-data.js';
import type { AISettings, AIAnalysis, SignalAction } from '@tradescope/shared-types';

const SYMBOLS = getAllSymbols();

/**
 * Generate a realistic AI analysis for a given symbol
 */
export function generateAnalysis(symbol: string, settings: AISettings): AIAnalysis {
  const quote = getQuote(symbol);

  // Generate scores influenced by the "risk level"
  const riskMultiplier =
    settings.risk_level === 'aggressive' ? 1.5 :
    settings.risk_level === 'conservative' ? 0.6 : 1.0;

  const trendScore = Math.round((40 + Math.random() * 50) * riskMultiplier);
  const momentumScore = Math.round((35 + Math.random() * 55) * riskMultiplier);
  const volatilityScore = Math.round((30 + Math.random() * 40) * riskMultiplier);
  const volumeScore = Math.round((45 + Math.random() * 45));
  const sentimentScore = Math.round((40 + Math.random() * 50));

  // Determine action based on overall score
  const totalScore = trendScore + momentumScore + volatilityScore + volumeScore + sentimentScore;
  const avgScore = totalScore / 5;

  let action: SignalAction;
  if (avgScore > 65) action = 'buy';
  else if (avgScore > 45) action = 'hold';
  else if (avgScore > 30) action = 'sell';
  else action = 'hold';

  const confidence = Math.round(50 + Math.random() * 40);

  // Calculate price levels based on settings
  const stopLossPct = settings.stop_loss_pct / 100;
  const takeProfitPct = settings.take_profit_pct / 100;

  const entryPrice = quote.price;
  const stopLoss = action === 'buy'
    ? entryPrice * (1 - stopLossPct)
    : entryPrice * (1 + stopLossPct);
  const takeProfit = action === 'buy'
    ? entryPrice * (1 + takeProfitPct)
    : entryPrice * (1 - takeProfitPct);

  const positionSize = Math.round(settings.max_position_size);

  const reasons: Record<SignalAction, string> = {
    buy: `${symbol} showing strong ${action === 'buy' ? 'bullish' : ''} momentum with favorable technical indicators. Trend score: ${trendScore}/100 suggests upward movement. Entry at ${entryPrice.toFixed(2)} offers attractive risk/reward.`,
    sell: `${symbol} displaying bearish signals with weakening momentum. Technical analysis suggests a potential downside. Consider exiting or reducing exposure at current levels.`,
    hold: `${symbol} is in a consolidation phase with mixed signals. Current risk/reward ratio does not justify new entry. Waiting for clearer directional confirmation.`,
    close: `Closing signal for ${symbol}. Market conditions have shifted, and the original thesis no longer holds. Recommended to take profits/cut losses at current levels.`,
  };

  return {
    symbol,
    action,
    confidence,
    entry_price: Math.round(entryPrice * 100) / 100,
    stop_loss: Math.round(stopLoss * 100) / 100,
    take_profit: Math.round(takeProfit * 100) / 100,
    position_size: positionSize,
    reason: reasons[action],
    analysis_breakdown: {
      trend_score: trendScore,
      momentum_score: momentumScore,
      volatility_score: volatilityScore,
      volume_score: volumeScore,
      sentiment_score: sentimentScore,
    },
  };
}

/**
 * Run AI engine for a random selection of users
 * This is called by the scheduler
 */
export async function runAIEngine() {
  try {
    // Check for emergency stop
    const { data: emergencySetting } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'ai_global_params')
      .single();

    if (emergencySetting?.value?.emergency_stop) {
      console.log('[AI Engine] Emergency stop active - skipping run');
      return;
    }

    // Update market prices
    const { updateAllPrices } = await import('./mock-market-data.js');
    updateAllPrices();

    // Get users with AI enabled
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('ai_enabled', true)
      .eq('is_active', true)
      .limit(20);

    if (!users || users.length === 0) {
      console.log('[AI Engine] No eligible users for AI trading');
      return;
    }

    // Process a random subset (3-8 users per run)
    const batchSize = Math.min(users.length, 3 + Math.floor(Math.random() * 6));
    const shuffled = users.sort(() => Math.random() - 0.5).slice(0, batchSize);

    for (const user of shuffled) {
      await processUserAI(user.id);
    }

    console.log(`[AI Engine] Processed ${batchSize} users`);
  } catch (err) {
    console.error('[AI Engine] Error:', err);
  }
}

async function processUserAI(userId: string) {
  try {
    // Get AI settings
    const { data: settings } = await supabaseAdmin
      .from('ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!settings || !settings.is_active) return;

    // Check daily limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayTrades } = await supabaseAdmin
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', 'ai')
      .gte('opened_at', today.toISOString());

    if (todayTrades && todayTrades >= (settings.max_daily_trades || 50)) return;

    // Check daily loss limit
    const { data: todayTradesData } = await supabaseAdmin
      .from('trades')
      .select('pnl_realized')
      .eq('user_id', userId)
      .gte('closed_at', today.toISOString());

    const dailyLoss = (todayTradesData || [])
      .reduce((sum, t) => sum + Math.min(0, Number(t.pnl_realized)), 0);

    if (Math.abs(dailyLoss) >= Number(settings.daily_loss_limit)) return;

    // Get user's active accounts
    const { data: accounts } = await supabaseAdmin
      .from('trading_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(3);

    if (!accounts || accounts.length === 0) return;

    const account = accounts[Math.floor(Math.random() * accounts.length)]!;

    // Pick a random symbol
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;

    // Generate analysis
    const analysis = generateAnalysis(symbol, settings);

    // Skip if hold or low confidence
    if (analysis.action === 'hold' || analysis.confidence < 55) return;

    // Create AI signal
    const { data: signal } = await supabaseAdmin
      .from('ai_signals')
      .insert({
        account_id: account.id,
        user_id: userId,
        symbol: analysis.symbol,
        action: analysis.action,
        confidence: analysis.confidence,
        entry_price: analysis.entry_price,
        stop_loss: analysis.stop_loss,
        take_profit: analysis.take_profit,
        position_size: analysis.position_size,
        reason: analysis.reason,
        analysis_data: analysis.analysis_breakdown,
        status: 'executed',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select('*')
      .single();

    if (!signal) return;

    // Execute the trade
    // Skip if buying power is too low
    if (Number(account.buying_power) < 10) return;
    const quantity = Math.min(Number(account.buying_power) * settings.max_position_size / 100, Number(account.buying_power) * 0.1) / analysis.entry_price;    const entryPrice = analysis.entry_price;

    const { data: trade } = await supabaseAdmin
      .from('trades')
      .insert({
        account_id: account.id,
        user_id: userId,
        symbol: analysis.symbol,
        side: analysis.action,
        status: 'open',
        source: 'ai',
        quantity: Math.round(quantity * 10000) / 10000,
        entry_price: entryPrice,
        current_price: entryPrice,
        stop_loss: analysis.stop_loss,
        take_profit: analysis.take_profit,
        ai_signal_id: signal.id,
        opened_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (trade) {
      // Update account
      const marginUsed = Number(account.margin_used) + quantity * entryPrice * 0.01;
      await supabaseAdmin
        .from('trading_accounts')
        .update({
          margin_used: marginUsed,
          buying_power: Number(account.buying_power) - quantity * entryPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      // Update leaderboard
      await updateLeaderboard(userId, 'buy', analysis.symbol, quantity, entryPrice);
    }

    // Also close some open AI trades randomly
    await closeRandomTrade(userId);

    // Update open trades with current prices
    await updateOpenTradePrices(userId);
  } catch (err) {
    console.error(`[AI Engine] Error processing user ${userId}:`, err);
  }
}

async function closeRandomTrade(userId: string) {
  const { data: openTrades } = await supabaseAdmin
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'ai')
    .eq('status', 'open')
    .limit(5);

  if (!openTrades || openTrades.length === 0) return;

  // 30% chance of closing a trade
  if (Math.random() > 0.3) return;

  const trade = openTrades[Math.floor(Math.random() * openTrades.length)]!;
  const quote = getQuote(trade.symbol);
  const exitPrice = quote.price;

  const pnlRealized =
    trade.side === 'buy'
      ? (exitPrice - Number(trade.entry_price)) * Number(trade.quantity)
      : (Number(trade.entry_price) - exitPrice) * Number(trade.quantity);

  const totalReturn =
    Number(trade.entry_price) > 0
      ? ((exitPrice - Number(trade.entry_price)) / Number(trade.entry_price)) * 100
      : 0;

  await supabaseAdmin
    .from('trades')
    .update({
      status: 'closed',
      exit_price: exitPrice,
      current_price: exitPrice,
      pnl_realized: Math.round(pnlRealized * 100) / 100,
      pnl_unrealized: 0,
      total_return: Math.round(totalReturn * 100) / 100,
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', trade.id);

  // Update account
  const { data: account } = await supabaseAdmin
    .from('trading_accounts')
    .select('balance, equity, margin_used, buying_power, daily_pnl')
    .eq('id', trade.account_id)
    .single();

  if (account) {
    const newBalance = Number(account.balance) + pnlRealized;
    const marginReleased = Number(account.margin_used) * 0.1; // Approximate
    await supabaseAdmin
      .from('trading_accounts')
      .update({
        balance: newBalance,
        equity: newBalance,
        buying_power: Number(account.buying_power) + marginReleased,
        margin_used: Math.max(0, Number(account.margin_used) - marginReleased),
        daily_pnl: Number(account.daily_pnl || 0) + pnlRealized,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trade.account_id);
  }

  // Update leaderboard
  const action = pnlRealized > 0 ? 'profit' : 'loss';
  await updateLeaderboardActivity(userId, 'close', trade.symbol, null, exitPrice, Math.round(pnlRealized * 100) / 100, Math.round(totalReturn * 100) / 100);
}

async function updateOpenTradePrices(userId: string) {
  const { data: openTrades } = await supabaseAdmin
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open');

  if (!openTrades) return;

  for (const trade of openTrades) {
    const quote = getQuote(trade.symbol);
    const unrealizedPnl =
      trade.side === 'buy'
        ? (quote.price - Number(trade.entry_price)) * Number(trade.quantity)
        : (Number(trade.entry_price) - quote.price) * Number(trade.quantity);

    await supabaseAdmin
      .from('trades')
      .update({
        current_price: quote.price,
        pnl_unrealized: Math.round(unrealizedPnl * 100) / 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trade.id);
  }
}

async function updateLeaderboard(userId: string, action: string, symbol: string, quantity: number | null, price: number | null) {
  const { data: entry } = await supabaseAdmin
    .from('leaderboard_entries')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (entry) {
    await supabaseAdmin
      .from('leaderboard_entries')
      .update({
        total_trades: Number(entry.total_trades) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);
  }

  await updateLeaderboardActivity(userId, action, symbol, quantity, price, null, null);
}

async function updateLeaderboardActivity(
  userId: string,
  action: string,
  symbol: string,
  quantity: number | null,
  price: number | null,
  pnl: number | null,
  pnlPct: number | null,
) {
  // Get or create leaderboard entry
  let { data: entry } = await supabaseAdmin
    .from('leaderboard_entries')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!entry) {
    // Create new leaderboard entry
    const traderId = `TRADER-${userId.slice(0, 4).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data: newEntry } = await supabaseAdmin
      .from('leaderboard_entries')
      .insert({
        user_id: userId,
        trader_id: traderId,
        total_trades: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        total_profit: 0,
        total_profit_pct: 0,
        current_streak: 0,
        best_trade: 0,
      })
      .select('*')
      .single();

    entry = newEntry;
  }

  if (!entry) return;

  // Insert activity
  await supabaseAdmin.from('trader_activity_feed').insert({
    leaderboard_id: entry.id,
    action,
    symbol,
    quantity,
    price,
    pnl,
    pnl_pct: pnlPct,
  });

  // Update stats if this is a close action
  if (action === 'close' && pnl !== null) {
    const isWin = pnl > 0;
    const newWins = Number(entry.wins) + (isWin ? 1 : 0);
    const newLosses = Number(entry.losses) + (isWin ? 0 : 1);
    const newTotal = newWins + newLosses;

    await supabaseAdmin
      .from('leaderboard_entries')
      .update({
        wins: newWins,
        losses: newLosses,
        win_rate: newTotal > 0 ? Math.round((newWins / newTotal) * 100 * 100) / 100 : 0,
        total_profit: Number(entry.total_profit) + pnl,
        current_streak: isWin ? Number(entry.current_streak) + 1 : (Number(entry.current_streak) > 0 ? 0 : Number(entry.current_streak) - 1),
        best_trade: Math.max(Number(entry.best_trade), pnl),
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id);
  }
}

export { updateLeaderboard, updateLeaderboardActivity };
