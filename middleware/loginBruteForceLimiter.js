const failedLogins = new Map();

// Helper to calculate block duration in milliseconds
const getBlockDuration = (tier, previousBlockDuration) => {
    if (tier === 1) return 5 * 60 * 1000; // 5 mins
    if (tier === 2) return 15 * 60 * 1000; // 15 mins
    if (tier === 3) return 60 * 60 * 1000; // 60 mins
    return previousBlockDuration * 2; // tier 4 and above (multiply by 2)
};

// Helper to determine max attempts allowed for the current tier
const getMaxAttempts = (tier) => {
    if (tier === 1) return 5;
    if (tier === 2) return 5;
    return 2; // tier 3 and above
};

/**
 * Custom Rate Limiter Middleware for Login
 * Tracks only failed login attempts (wrong password/user not found)
 */
const loginBruteForceLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    let record = failedLogins.get(ip);

    if (!record) {
        record = {
            attemptsInCurrentTier: 0,
            tier: 1,
            blockUntil: null,
            currentBlockDuration: 0
        };
        failedLogins.set(ip, record);
    }

    // Unblock if the block time has expired
    if (record.blockUntil && record.blockUntil <= Date.now()) {
        record.blockUntil = null;
        // Keep the tier and currentBlockDuration so the next failure triggers the NEXT tier limits
    }

    // Check if currently blocked
    if (record.blockUntil && record.blockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((record.blockUntil - Date.now()) / 60000);
        return res.status(429).json({
            message: `Too many failed attempts. Account blocked for this IP. Please try again after ${remainingMinutes} minute(s).`
        });
    }

    // Inject failure callback for controller
    req.loginFailed = () => {
        record.attemptsInCurrentTier += 1;
        const maxAttempts = getMaxAttempts(record.tier);

        if (record.attemptsInCurrentTier >= maxAttempts) {
            const duration = getBlockDuration(record.tier, record.currentBlockDuration);
            record.blockUntil = Date.now() + duration;
            record.currentBlockDuration = duration;
            record.tier += 1; // Move to the next tier for future offenses
            record.attemptsInCurrentTier = 0; // Reset attempts for the next tier
        }
    };

    // Inject success callback for controller
    req.loginSucceeded = () => {
        failedLogins.delete(ip);
    };

    next();
};

module.exports = loginBruteForceLimiter;
