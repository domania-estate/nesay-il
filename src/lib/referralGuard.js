const db = require('../../config/db');

// Настройки анти-фрода для реферальной программы.
const REFERRER_BONUS = 50;
const REFERRED_BONUS = 20;
const MAX_REFERRAL_EARNINGS = 400; // потолок кредитов, которые можно заработать за рефералов
const MAX_REWARDED_PER_IP = 2; // сколько раз с одного IP разрешаем начислить бонус рефереру

// Добавляем недостающие колонки один раз при старте — по той же схеме, что
// и остальные lib/seed*.js в проекте (без отдельных миграционных файлов).
async function ensureReferralGuardSchema() {
  try {
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_ip TEXT');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_device_id TEXT');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_credits_earned INTEGER NOT NULL DEFAULT 0');
    await db.query('ALTER TABLE referrals ADD COLUMN IF NOT EXISTS credit_skipped_reason TEXT');
  } catch (err) {
    console.error('ensureReferralGuardSchema error:', err.message);
  }
}

// Решает, начислять ли рефереру бонус за нового приглашённого, и начисляет
// его, если всё чисто. Приглашённый получает свой бонус всегда — он ни в чём
// не виноват, штрафуем только реферера, если похоже на накрутку.
// Возвращает { referrerCredited, referredCredited, reason }.
async function creditReferralIfEligible({ referrerId, referredId, refCode, referredIp, referredDeviceId }) {
  let reason = null;

  const referrerRow = await db.query('SELECT referral_credits_earned, signup_ip, signup_device_id FROM users WHERE id=$1', [referrerId]);
  const referrer = referrerRow.rows[0];

  if (!referrer) {
    return { referrerCredited: false, referredCredited: false, reason: 'referrer_not_found' };
  }

  if (referrer.referral_credits_earned + REFERRER_BONUS > MAX_REFERRAL_EARNINGS) {
    reason = 'earnings_cap_reached';
  } else if (referredIp && referrer.signup_ip && referredIp === referrer.signup_ip) {
    // Приглашённый регистрируется с того же IP, что и сам реферер — похоже на
    // самонакрутку через альтернативные аккаунты на своём же устройстве/сети.
    reason = 'same_ip_as_referrer';
  } else if (referredDeviceId && referrer.signup_device_id && referredDeviceId === referrer.signup_device_id) {
    // То же самое, но по device-id (cookie/устройство) — ловит случай, когда
    // IP меняется (VPN, мобильная сеть), а браузер/устройство то же самое.
    reason = 'same_device_as_referrer';
  } else if (referredDeviceId) {
    const sameDeviceRewards = await db.query(
      `SELECT COUNT(*) AS c FROM referrals r
       JOIN users u ON u.id = r.referred_id
       WHERE r.referrer_id = $1 AND r.bonus_credited = true AND u.signup_device_id = $2`,
      [referrerId, referredDeviceId]
    );
    if (parseInt(sameDeviceRewards.rows[0].c, 10) >= MAX_REWARDED_PER_IP) {
      reason = 'device_reward_limit';
    }
  }

  if (!reason && referredIp) {
    const sameIpRewards = await db.query(
      `SELECT COUNT(*) AS c FROM referrals r
       JOIN users u ON u.id = r.referred_id
       WHERE r.referrer_id = $1 AND r.bonus_credited = true AND u.signup_ip = $2`,
      [referrerId, referredIp]
    );
    if (parseInt(sameIpRewards.rows[0].c, 10) >= MAX_REWARDED_PER_IP) {
      // Уже наградили за нескольких приглашённых с этого же IP — дальше похоже
      // на ферму аккаунтов в одной сети, а не на разных реальных друзей.
      reason = 'ip_reward_limit';
    }
  }

  await db.query('UPDATE users SET credits=credits+$1 WHERE id=$2', [REFERRED_BONUS, referredId]);
  await db.query('UPDATE referrals SET bonus_credited=true, credit_skipped_reason=$1 WHERE referred_id=$2', [reason, referredId]);

  if (reason) {
    return { referrerCredited: false, referredCredited: true, reason };
  }

  await db.query('UPDATE users SET credits=credits+$1, referral_credits_earned=referral_credits_earned+$1 WHERE id=$2', [REFERRER_BONUS, referrerId]);
  return { referrerCredited: true, referredCredited: true, reason: null };
}

module.exports = { ensureReferralGuardSchema, creditReferralIfEligible, REFERRER_BONUS, REFERRED_BONUS, MAX_REFERRAL_EARNINGS };
