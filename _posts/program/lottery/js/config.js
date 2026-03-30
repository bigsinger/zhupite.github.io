/**
 * 配置管理模块
 * 负责配置的加载、保存和管理
 */

const ConfigManager = {
  // 默认配置
  defaultConfig: {
    title: '抽奖',
    prizes: [
      {
        id: 1,
        text: '一等奖',
        color: '#FF6B6B',
        weight: 1
      },
      {
        id: 2,
        text: '二等奖',
        color: '#4ECDC4',
        weight: 2
      },
      {
        id: 3,
        text: '三等奖',
        color: '#45B7D1',
        weight: 3
      },
      {
        id: 4,
        text: '四等奖',
        color: '#96CEB4',
        weight: 4
      },
      {
        id: 5,
        text: '五等奖',
        color: '#FFEAA7',
        weight: 5
      },
      {
        id: 6,
        text: '谢谢参与',
        color: '#DDA0DD',
        weight: 6
      }
    ],
    whitelist: [],
    blacklist: [],
    useWhitelist: false,
    useBlacklist: false
  },

  // 本地存储键名
  STORAGE_KEY: 'lottery_config',

  /**
   * 加载配置
   * @returns {Object} 配置对象
   */
  loadConfig() {
    try {
      const configStr = localStorage.getItem(this.STORAGE_KEY);
      if (configStr) {
        const config = JSON.parse(configStr);
        // 合并默认配置，确保所有字段都存在
        return this.mergeConfig(config);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
    return JSON.parse(JSON.stringify(this.defaultConfig));
  },

  /**
   * 保存配置
   * @param {Object} config 配置对象
   */
  saveConfig(config) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  },

  /**
   * 合并配置
   * @param {Object} config 用户配置
   * @returns {Object} 合并后的配置
   */
  mergeConfig(config) {
    const merged = JSON.parse(JSON.stringify(this.defaultConfig));

    // 合并标题
    if (config.title) {
      merged.title = config.title;
    }

    // 合并奖项
    if (config.prizes && Array.isArray(config.prizes)) {
      merged.prizes = config.prizes;
    }

    // 合并黑白名单
    if (config.whitelist && Array.isArray(config.whitelist)) {
      merged.whitelist = config.whitelist;
    }

    if (config.blacklist && Array.isArray(config.blacklist)) {
      merged.blacklist = config.blacklist;
    }

    // 合并开关
    if (typeof config.useWhitelist === 'boolean') {
      merged.useWhitelist = config.useWhitelist;
    }

    if (typeof config.useBlacklist === 'boolean') {
      merged.useBlacklist = config.useBlacklist;
    }

    return merged;
  },

  /**
   * 重置配置
   */
  resetConfig() {
    localStorage.removeItem(this.STORAGE_KEY);
    return JSON.parse(JSON.stringify(this.defaultConfig));
  },

  /**
   * 过滤奖项（黑白名单）
   * @param {Array} prizes 奖项列表
   * @param {Array} whitelist 白名单
   * @param {Array} blacklist 黑名单
   * @param {Boolean} useWhitelist 是否使用白名单
   * @param {Boolean} useBlacklist 是否使用黑名单
   * @returns {Array} 过滤后的奖项列表
   */
  filterPrizes(prizes, whitelist, blacklist, useWhitelist, useBlacklist) {
    let filtered = [...prizes];

    // 白名单过滤
    if (useWhitelist && whitelist.length > 0) {
      filtered = filtered.filter(prize => whitelist.includes(prize.text));
    }

    // 黑名单过滤
    if (useBlacklist && blacklist.length > 0) {
      filtered = filtered.filter(prize => !blacklist.includes(prize.text));
    }

    return filtered;
  },

  /**
   * 根据权重获取中奖奖项
   * @param {Array} prizes 奖项列表
   * @returns {Object} 中奖奖项
   */
  getPrizeByWeight(prizes) {
    if (prizes.length === 0) {
      return null;
    }

    const totalWeight = prizes.reduce((sum, prize) => sum + (prize.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const prize of prizes) {
      random -= (prize.weight || 1);
      if (random <= 0) {
        return prize;
      }
    }

    return prizes[prizes.length - 1];
  },

  /**
   * 生成唯一ID
   * @returns {Number} 唯一ID
   */
  generateId() {
    return Date.now() + Math.random();
  },

  /**
   * 验证配置
   * @param {Object} config 配置对象
   * @returns {Object} 验证结果 { valid: Boolean, errors: Array }
   */
  validateConfig(config) {
    const errors = [];

    // 验证标题
    if (!config.title || config.title.trim() === '') {
      errors.push('标题不能为空');
    }

    // 验证奖项
    if (!config.prizes || !Array.isArray(config.prizes) || config.prizes.length === 0) {
      errors.push('至少需要一个奖项');
    } else {
      config.prizes.forEach((prize, index) => {
        if (!prize.text || prize.text.trim() === '') {
          errors.push(`第 ${index + 1} 个奖项的名称不能为空`);
        }
        if (!prize.color || prize.color.trim() === '') {
          errors.push(`第 ${index + 1} 个奖项的颜色不能为空`);
        }
        if (prize.weight && (isNaN(prize.weight) || prize.weight <= 0)) {
          errors.push(`第 ${index + 1} 个奖项的权重必须大于0`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// 导出到全局
window.ConfigManager = ConfigManager;
