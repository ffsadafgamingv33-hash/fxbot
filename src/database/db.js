const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class BotDatabase {
  constructor() {
    this.db = new Database(path.join(dataDir, 'bot.db'));
    this.init();
  }

  init() {
    // Users table (economy, XP, levels)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        credits INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        daily_claimed INTEGER DEFAULT 0,
        total_gambled INTEGER DEFAULT 0,
        total_won INTEGER DEFAULT 0,
        total_lost INTEGER DEFAULT 0,
        dollars REAL DEFAULT 0,
        ltc REAL DEFAULT 0,
        messages INTEGER DEFAULT 0,
        vc_minutes INTEGER DEFAULT 0,
        UNIQUE(guild_id, user_id)
      )
    `);

    // Migrations - Add missing columns if they don't exist
    this.addColumnIfMissing('users', 'dollars', 'REAL DEFAULT 0');
    this.addColumnIfMissing('users', 'ltc', 'REAL DEFAULT 0');
    this.addColumnIfMissing('users', 'messages', 'INTEGER DEFAULT 0');
    this.addColumnIfMissing('users', 'vc_minutes', 'INTEGER DEFAULT 0');

    // Inventory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        purchased_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(guild_id, user_id, item_id)
      )
    `);

    // Shop items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        role_id TEXT,
        stock INTEGER DEFAULT -1,
        UNIQUE(guild_id, item_id)
      )
    `);

    // Invites table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        inviter_id TEXT NOT NULL,
        invited_id TEXT NOT NULL,
        invite_code TEXT,
        invited_at INTEGER DEFAULT (strftime('%s', 'now')),
        valid INTEGER DEFAULT 1
      )
    `);

    // Warnings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS warnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT,
        warned_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Mutes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mutes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        moderator_id TEXT NOT NULL,
        reason TEXT,
        muted_at INTEGER DEFAULT (strftime('%s', 'now')),
        unmute_at INTEGER
      )
    `);

    // Crate keys table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS crate_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        crate_type TEXT NOT NULL,
        amount INTEGER DEFAULT 1,
        UNIQUE(guild_id, user_id, crate_type)
      )
    `);

    // Guild settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id TEXT PRIMARY KEY,
        xp_channels TEXT,
        blacklisted_users TEXT,
        owners TEXT,
        mute_role_id TEXT
      )
    `);

    // Giveaways table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS giveaways (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT UNIQUE,
        prize INTEGER NOT NULL,
        winners INTEGER DEFAULT 1,
        ends_at INTEGER,
        ended INTEGER DEFAULT 0
      )
    `);

    // VIP whitelist table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vip_whitelist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        added_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(guild_id, user_id)
      )
    `);

    // Redeem codes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS redeem_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        credits INTEGER NOT NULL,
        used_by TEXT,
        used_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Future shop table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS future_shop (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        credits_reserved INTEGER NOT NULL,
        reserved_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(guild_id, user_id, item_name)
      )
    `);
  }

  addColumnIfMissing(tableName, columnName, columnDefinition) {
    try {
      const info = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columnExists = info.some(col => col.name === columnName);
      
      if (!columnExists) {
        this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      }
    } catch (err) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, err.message);
    }
  }

  // User methods
  getUser(guildId, userId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE guild_id = ? AND user_id = ?');
    let user = stmt.get(guildId, userId);
    if (!user) {
      this.db.prepare('INSERT OR IGNORE INTO users (guild_id, user_id) VALUES (?, ?)').run(guildId, userId);
      user = stmt.get(guildId, userId);
    }
    return user;
  }

  addCredits(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET credits = credits + ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  }

  removeCredits(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET credits = MAX(0, credits - ?) WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  }

  setCredits(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET credits = ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  }

  getBalance(guildId, userId) {
    const user = this.getUser(guildId, userId);
    return user?.credits || 0;
  }

  getBalanceTop(guildId, limit = 10) {
    return this.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY credits DESC LIMIT ?').all(guildId, limit);
  }

  // XP methods
  addXP(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET xp = xp + ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
    
    const user = this.getUser(guildId, userId);
    const xpNeeded = this.getXPForLevel(user.level + 1);
    
    if (user.xp >= xpNeeded) {
      this.db.prepare('UPDATE users SET level = level + 1, xp = xp - ? WHERE guild_id = ? AND user_id = ?').run(xpNeeded, guildId, userId);
      return true;
    }
    return false;
  }

  getXPForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  getLevelTop(guildId, limit = 10) {
    return this.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT ?').all(guildId, limit);
  }

  // Daily claim
  claimDaily(guildId, userId) {
    const user = this.getUser(guildId, userId);
    const now = Date.now();
    const lastClaim = user.daily_claimed || 0;
    const cooldown = 24 * 60 * 60 * 1000;
    
    if (now - lastClaim < cooldown) {
      return { success: false, nextClaim: lastClaim + cooldown };
    }
    
    const reward = 100;
    this.db.prepare('UPDATE users SET credits = credits + ?, daily_claimed = ? WHERE guild_id = ? AND user_id = ?').run(reward, now, guildId, userId);
    return { success: true, reward };
  }

  // Gambling stats
  updateGambleStats(guildId, userId, wagered, won) {
    this.getUser(guildId, userId);
    const netResult = won - wagered;
    if (netResult >= 0) {
      this.db.prepare('UPDATE users SET total_gambled = total_gambled + ?, total_won = total_won + ? WHERE guild_id = ? AND user_id = ?').run(wagered, won, guildId, userId);
    } else {
      this.db.prepare('UPDATE users SET total_gambled = total_gambled + ?, total_lost = total_lost + ? WHERE guild_id = ? AND user_id = ?').run(wagered, wagered - won, guildId, userId);
    }
  }

  getGambleTop(guildId, limit = 10) {
    return this.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY total_won DESC LIMIT ?').all(guildId, limit);
  }

  // Shop methods
  getShopItems(guildId) {
    return this.db.prepare('SELECT * FROM shop_items WHERE guild_id = ?').all(guildId);
  }

  addShopItem(guildId, itemId, name, description, price, roleId = null, stock = -1) {
    this.db.prepare('INSERT OR REPLACE INTO shop_items (guild_id, item_id, name, description, price, role_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?)').run(guildId, itemId, name, description, price, roleId, stock);
  }

  removeShopItem(guildId, itemId) {
    this.db.prepare('DELETE FROM shop_items WHERE guild_id = ? AND item_id = ?').run(guildId, itemId);
  }

  buyItem(guildId, userId, itemId) {
    const item = this.db.prepare('SELECT * FROM shop_items WHERE guild_id = ? AND item_id = ?').get(guildId, itemId);
    if (!item) return { success: false, error: 'Item not found' };
    
    const user = this.getUser(guildId, userId);
    if (user.credits < item.price) return { success: false, error: 'Not enough credits' };
    
    if (item.stock === 0) return { success: false, error: 'Out of stock' };
    
    const existing = this.db.prepare('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ? AND item_id = ?').get(guildId, userId, itemId);
    if (existing) return { success: false, error: 'You already own this item' };
    
    this.removeCredits(guildId, userId, item.price);
    this.db.prepare('INSERT INTO inventory (guild_id, user_id, item_id, item_name) VALUES (?, ?, ?, ?)').run(guildId, userId, itemId, item.name);
    
    if (item.stock > 0) {
      this.db.prepare('UPDATE shop_items SET stock = stock - 1 WHERE guild_id = ? AND item_id = ?').run(guildId, itemId);
    }
    
    return { success: true, item };
  }

  getInventory(guildId, userId) {
    return this.db.prepare('SELECT * FROM inventory WHERE guild_id = ? AND user_id = ?').all(guildId, userId);
  }

  // Invite methods
  addInvite(guildId, inviterId, invitedId, code) {
    this.db.prepare('INSERT INTO invites (guild_id, inviter_id, invited_id, invite_code) VALUES (?, ?, ?, ?)').run(guildId, inviterId, invitedId, code);
  }

  incrementMessageCount(guildId, userId) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET messages = messages + 1 WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
  }

  addVCMinutes(guildId, userId, minutes) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET vc_minutes = vc_minutes + ? WHERE guild_id = ? AND user_id = ?').run(minutes, guildId, userId);
  }

  getChatTop(guildId, limit = 10) {
    return this.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY messages DESC LIMIT ?').all(guildId, limit);
  }

  getVCTop(guildId, limit = 10) {
    return this.db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY vc_minutes DESC LIMIT ?').all(guildId, limit);
  }

  getInviteStats(guildId, userId) {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM invites WHERE guild_id = ? AND inviter_id = ?').get(guildId, userId);
    const valid = this.db.prepare('SELECT COUNT(*) as count FROM invites WHERE guild_id = ? AND inviter_id = ? AND valid = 1').get(guildId, userId);
    return { total: total.count, valid: valid.count };
  }

  getInvited(guildId, userId) {
    return this.db.prepare('SELECT * FROM invites WHERE guild_id = ? AND inviter_id = ?').all(guildId, userId);
  }

  // Moderation methods
  addWarning(guildId, userId, moderatorId, reason) {
    this.db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)').run(guildId, userId, moderatorId, reason);
  }

  removeLastWarning(guildId, userId) {
    this.db.prepare('DELETE FROM warnings WHERE id = (SELECT id FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1)').run(guildId, userId);
  }

  getWarnings(guildId, userId) {
    return this.db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY warned_at DESC').all(guildId, userId);
  }

  clearHistory(guildId, userId) {
    this.db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
    this.db.prepare('DELETE FROM mutes WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
  }

  addMute(guildId, userId, moderatorId, reason, duration) {
    const unmuteAt = Date.now() + duration;
    this.db.prepare('INSERT INTO mutes (guild_id, user_id, moderator_id, reason, unmute_at) VALUES (?, ?, ?, ?, ?)').run(guildId, userId, moderatorId, reason, unmuteAt);
  }

  // Crate methods
  getCrateKeys(guildId, userId) {
    return this.db.prepare('SELECT * FROM crate_keys WHERE guild_id = ? AND user_id = ?').all(guildId, userId);
  }

  addCrateKey(guildId, userId, crateType, amount = 1) {
    const existing = this.db.prepare('SELECT * FROM crate_keys WHERE guild_id = ? AND user_id = ? AND crate_type = ?').get(guildId, userId, crateType);
    if (existing) {
      this.db.prepare('UPDATE crate_keys SET amount = amount + ? WHERE guild_id = ? AND user_id = ? AND crate_type = ?').run(amount, guildId, userId, crateType);
    } else {
      this.db.prepare('INSERT INTO crate_keys (guild_id, user_id, crate_type, amount) VALUES (?, ?, ?, ?)').run(guildId, userId, crateType, amount);
    }
  }

  useCrateKey(guildId, userId, crateType) {
    const key = this.db.prepare('SELECT * FROM crate_keys WHERE guild_id = ? AND user_id = ? AND crate_type = ? AND amount > 0').get(guildId, userId, crateType);
    if (!key) return false;
    this.db.prepare('UPDATE crate_keys SET amount = amount - 1 WHERE guild_id = ? AND user_id = ? AND crate_type = ?').run(guildId, userId, crateType);
    return true;
  }

  // Guild settings
  getGuildSettings(guildId) {
    let settings = this.db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
    if (!settings) {
      this.db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)').run(guildId);
      settings = this.db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
    }
    return settings;
  }

  updateGuildSettings(guildId, key, value) {
    const allowedKeys = ['xp_channels', 'blacklisted_users', 'owners', 'mute_role_id'];
    if (!allowedKeys.includes(key)) {
      throw new Error('Invalid settings key');
    }
    this.getGuildSettings(guildId);
    const stmt = {
      'xp_channels': this.db.prepare('UPDATE guild_settings SET xp_channels = ? WHERE guild_id = ?'),
      'blacklisted_users': this.db.prepare('UPDATE guild_settings SET blacklisted_users = ? WHERE guild_id = ?'),
      'owners': this.db.prepare('UPDATE guild_settings SET owners = ? WHERE guild_id = ?'),
      'mute_role_id': this.db.prepare('UPDATE guild_settings SET mute_role_id = ? WHERE guild_id = ?')
    };
    stmt[key].run(value, guildId);
  }

  // VIP methods
  addVIPWhitelist(guildId, userId) {
    this.db.prepare('INSERT OR IGNORE INTO vip_whitelist (guild_id, user_id) VALUES (?, ?)').run(guildId, userId);
  }

  removeVIPWhitelist(guildId, userId) {
    this.db.prepare('DELETE FROM vip_whitelist WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
  }

  getVIPWhitelist(guildId) {
    return this.db.prepare('SELECT * FROM vip_whitelist WHERE guild_id = ?').all(guildId);
  }

  isVIPWhitelisted(guildId, userId) {
    const result = this.db.prepare('SELECT * FROM vip_whitelist WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
    return !!result;
  }

  // Giveaway methods
  createGiveaway(guildId, channelId, messageId, prize, winners, endsAt) {
    this.db.prepare('INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winners, ends_at) VALUES (?, ?, ?, ?, ?, ?)').run(guildId, channelId, messageId, prize, winners, endsAt);
  }

  getActiveGiveaways(guildId) {
    return this.db.prepare('SELECT * FROM giveaways WHERE guild_id = ? AND ended = 0').all(guildId);
  }

  endGiveaway(messageId) {
    this.db.prepare('UPDATE giveaways SET ended = 1 WHERE message_id = ?').run(messageId);
  }

  // Dollar methods
  addDollars(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET dollars = dollars + ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  }

  getDollars(guildId, userId) {
    const user = this.getUser(guildId, userId);
    return user?.dollars || 0;
  }

  // LTC methods
  addLTC(guildId, userId, amount) {
    this.getUser(guildId, userId);
    this.db.prepare('UPDATE users SET ltc = ltc + ? WHERE guild_id = ? AND user_id = ?').run(amount, guildId, userId);
  }

  getLTC(guildId, userId) {
    const user = this.getUser(guildId, userId);
    return user?.ltc || 0;
  }

  // Redeem code methods
  initializeRedeemCodes(codes) {
    try {
      for (const code of codes) {
        this.db.prepare('INSERT OR IGNORE INTO redeem_codes (code, credits) VALUES (?, ?)').run(code.code, code.credits);
      }
    } catch (err) {
      console.error('Error initializing redeem codes:', err);
    }
  }

  redeemCode(code, userId) {
    const codeRecord = this.db.prepare('SELECT * FROM redeem_codes WHERE code = ?').get(code.toUpperCase());
    if (!codeRecord) return { success: false, error: 'Invalid redeem code' };
    if (codeRecord.used_by) return { success: false, error: 'This code has already been redeemed' };
    
    this.db.prepare('UPDATE redeem_codes SET used_by = ?, used_at = ? WHERE code = ?').run(userId, Date.now(), code.toUpperCase());
    return { success: true, credits: codeRecord.credits };
  }

  getRedeemCodeStats() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM redeem_codes').get();
    const used = this.db.prepare('SELECT COUNT(*) as count FROM redeem_codes WHERE used_by IS NOT NULL').get();
    return { total: total.count, used: used.count, available: total.count - used.count };
  }

  getRandomUnusedRedeemCode() {
    const code = this.db.prepare('SELECT * FROM redeem_codes WHERE used_by IS NULL ORDER BY RANDOM() LIMIT 1').get();
    return code || null;
  }

  getSpecificRedeemCode(creditValue) {
    const code = this.db.prepare('SELECT * FROM redeem_codes WHERE credits = ? AND used_by IS NULL ORDER BY RANDOM() LIMIT 1').get(creditValue);
    return code || null;
  }

  // Future shop methods
  addFutureShopItem(guildId, userId, itemName, creditsReserved) {
    this.getUser(guildId, userId);
    const user = this.getUser(guildId, userId);
    if (user.credits < creditsReserved) return { success: false, error: 'Not enough credits' };
    
    this.db.prepare('INSERT OR REPLACE INTO future_shop (guild_id, user_id, item_name, credits_reserved) VALUES (?, ?, ?, ?)').run(guildId, userId, itemName, creditsReserved);
    this.removeCredits(guildId, userId, creditsReserved);
    return { success: true };
  }

  getFutureShopItems(guildId, userId) {
    return this.db.prepare('SELECT * FROM future_shop WHERE guild_id = ? AND user_id = ?').all(guildId, userId);
  }

  removeFutureShopItem(guildId, userId, itemName) {
    const item = this.db.prepare('SELECT * FROM future_shop WHERE guild_id = ? AND user_id = ? AND item_name = ?').get(guildId, userId, itemName);
    if (!item) return { success: false, error: 'Item not found' };
    
    this.addCredits(guildId, userId, item.credits_reserved);
    this.db.prepare('DELETE FROM future_shop WHERE guild_id = ? AND user_id = ? AND item_name = ?').run(guildId, userId, itemName);
    return { success: true };
  }

  transferCredits(guildId, fromUserId, toUserId, amount) {
    const fromUser = this.getUser(guildId, fromUserId);
    this.getUser(guildId, toUserId);
    
    if (fromUser.credits < amount) return { success: false, error: 'Not enough credits' };
    if (amount <= 0) return { success: false, error: 'Transfer amount must be positive' };
    
    this.removeCredits(guildId, fromUserId, amount);
    this.addCredits(guildId, toUserId, amount);
    return { success: true };
  }
}

module.exports = BotDatabase;
