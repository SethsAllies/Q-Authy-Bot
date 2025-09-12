import { PrismaClient } from '@prisma/client';

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient();
    this.cache = new Map(); // In-memory cache for frequent operations
  }

  async init() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
      
      // Initialize default items
      await this.initializeItems();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // User Management
  async getUser(userId) {
    const cacheKey = `user_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        inventory: {
          include: { item: true }
        }
      }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: userId,
          username: 'Unknown'
        },
        include: {
          inventory: {
            include: { item: true }
          }
        }
      });
    }

    this.cache.set(cacheKey, user);
    return user;
  }

  async updateUser(userId, data) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data
    });
    
    // Update cache
    this.cache.set(`user_${userId}`, user);
    return user;
  }

  // Economy Operations
  async getUserBalance(userId) {
    const user = await this.getUser(userId);
    return { wallet: user.wallet, bank: user.bank };
  }

  async updateBalance(userId, wallet = null, bank = null) {
    const updateData = {};
    if (wallet !== null) updateData.wallet = wallet;
    if (bank !== null) updateData.bank = bank;
    
    return await this.updateUser(userId, updateData);
  }

  async transferMoney(fromUserId, toUserId, amount) {
    return await this.prisma.$transaction(async (prisma) => {
      const fromUser = await this.getUser(fromUserId);
      const toUser = await this.getUser(toUserId);

      if (fromUser.wallet < amount) {
        throw new Error('Insufficient funds');
      }

      await prisma.user.update({
        where: { id: fromUserId },
        data: { wallet: fromUser.wallet - amount }
      });

      await prisma.user.update({
        where: { id: toUserId },
        data: { wallet: toUser.wallet + amount }
      });

      // Log transaction
      await prisma.transaction.create({
        data: {
          userId: fromUserId,
          amount: -amount,
          type: 'transfer',
          details: `Transfer to ${toUserId}`
        }
      });

      await prisma.transaction.create({
        data: {
          userId: toUserId,
          amount: amount,
          type: 'transfer',
          details: `Transfer from ${fromUserId}`
        }
      });
    });
  }

  // Cooldown Management
  async checkCooldown(userId, type) {
    const user = await this.getUser(userId);
    const cooldownField = `${type}Cooldown`;
    
    if (user[cooldownField]) {
      const now = new Date();
      const cooldownEnd = new Date(user[cooldownField]);
      if (now < cooldownEnd) {
        return cooldownEnd - now; // Return remaining time in ms
      }
    }
    return 0; // No cooldown
  }

  async setCooldown(userId, type, durationMs) {
    const cooldownEnd = new Date(Date.now() + durationMs);
    const updateData = {};
    updateData[`${type}Cooldown`] = cooldownEnd;
    
    await this.updateUser(userId, updateData);
  }

  // Transactions
  async addTransaction(userId, amount, type, details = null) {
    return await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        details
      }
    });
  }

  // Warnings
  async addWarning(userId, guildId, reason, moderator) {
    return await this.prisma.warning.create({
      data: {
        userId,
        guildId,
        reason,
        moderator
      }
    });
  }

  async getUserWarnings(userId, guildId) {
    return await this.prisma.warning.findMany({
      where: {
        userId,
        guildId,
        active: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Reminders
  async addReminder(userId, content, time, guildId = null) {
    return await this.prisma.reminder.create({
      data: {
        userId,
        content,
        time: new Date(time),
        guildId
      }
    });
  }

  async getActiveReminders() {
    return await this.prisma.reminder.findMany({
      where: {
        active: true,
        time: {
          lte: new Date()
        }
      }
    });
  }

  async completeReminder(id) {
    return await this.prisma.reminder.update({
      where: { id },
      data: { active: false }
    });
  }

  // Items & Inventory
  async initializeItems() {
    const defaultItems = [
      { name: 'Fishing Rod', description: 'Used for fishing', price: 500, emoji: '🎣', category: 'tools', usable: true },
      { name: 'Laptop', description: 'Increases work income', price: 2000, emoji: '💻', category: 'tools', usable: false },
      { name: 'Phone', description: 'Basic communication device', price: 800, emoji: '📱', category: 'electronics', usable: false },
      { name: 'Car', description: 'Transportation vehicle', price: 15000, emoji: '🚗', category: 'vehicles', usable: false },
      { name: 'Coffee', description: 'Restores energy', price: 50, emoji: '☕', category: 'consumables', usable: true },
      { name: 'Pizza', description: 'Delicious food', price: 100, emoji: '🍕', category: 'consumables', usable: true }
    ];

    for (const item of defaultItems) {
      await this.prisma.item.upsert({
        where: { name: item.name },
        update: {},
        create: item
      });
    }
  }

  async getShopItems() {
    return await this.prisma.item.findMany({
      orderBy: [{ category: 'asc' }, { price: 'asc' }]
    });
  }

  async getUserInventory(userId) {
    return await this.prisma.inventoryItem.findMany({
      where: { userId },
      include: { item: true }
    });
  }

  async addItemToInventory(userId, itemId, quantity = 1) {
    return await this.prisma.inventoryItem.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: { quantity: { increment: quantity } },
      create: { userId, itemId, quantity }
    });
  }

  // Guild Settings
  async getGuildSettings(guildId) {
    const cacheKey = `guild_${guildId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: { guildSettings: true }
    });

    if (!guild) {
      guild = await this.prisma.guild.create({
        data: {
          id: guildId,
          name: 'Unknown Guild'
        },
        include: { guildSettings: true }
      });
    }

    this.cache.set(cacheKey, guild);
    return guild;
  }

  async updateGuildSetting(guildId, key, value) {
    return await this.prisma.guildSettings.upsert({
      where: { guildId_key: { guildId, key } },
      update: { value },
      create: { guildId, key, value }
    });
  }

  // Leaderboards
  async getEconomyLeaderboard(limit = 10) {
    return await this.prisma.user.findMany({
      orderBy: [
        { wallet: 'desc' },
        { bank: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        wallet: true,
        bank: true
      }
    });
  }

  async getLevelLeaderboard(limit = 10) {
    return await this.prisma.user.findMany({
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        level: true,
        xp: true
      }
    });
  }
}

export default new DatabaseService();