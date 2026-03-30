/**
 * 抽奖网页程序主逻辑
 */

// 全局变量
let config = null;
let isSpinning = false;

// DOM 元素
const elements = {
  lotteryTitle: document.getElementById('lottery-title'),
  startBtn: document.getElementById('start-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  helpBtn: document.getElementById('help-btn'),
  lotteryResult: document.getElementById('lottery-result'),
  settingsPanel: document.getElementById('settings-panel'),
  helpPanel: document.getElementById('help-panel'),
  titleInput: document.getElementById('title-input'),
  prizesList: document.getElementById('prizes-list'),
  addPrizeBtn: document.getElementById('add-prize-btn'),
  useWhitelist: document.getElementById('use-whitelist'),
  whitelistInput: document.getElementById('whitelist-input'),
  useBlacklist: document.getElementById('use-blacklist'),
  blacklistInput: document.getElementById('blacklist-input'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  cancelSettingsBtn: document.getElementById('cancel-settings-btn'),
  closeHelpBtn: document.getElementById('close-help-btn')
};

/**
 * 初始化应用
 */
function initApp() {
  // 加载配置
  config = ConfigManager.loadConfig();

  // 更新标题
  elements.lotteryTitle.textContent = config.title;

  // 初始化转盘
  Turntable.init('turntable', config);

  // 绑定事件
  bindEvents();
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 开始抽奖按钮
  elements.startBtn.addEventListener('click', startLottery);

  // 设置按钮
  elements.settingsBtn.addEventListener('click', openSettings);

  // 使用说明按钮
  elements.helpBtn.addEventListener('click', openHelp);

  // 添加奖项按钮
  elements.addPrizeBtn.addEventListener('click', addPrizeItem);

  // 保存设置按钮
  elements.saveSettingsBtn.addEventListener('click', saveSettings);

  // 取消设置按钮
  elements.cancelSettingsBtn.addEventListener('click', closeSettings);

  // 关闭使用说明按钮
  elements.closeHelpBtn.addEventListener('click', closeHelp);

  // 点击面板外部关闭
  elements.settingsPanel.addEventListener('click', (e) => {
    if (e.target === elements.settingsPanel) {
      closeSettings();
    }
  });

  elements.helpPanel.addEventListener('click', (e) => {
    if (e.target === elements.helpPanel) {
      closeHelp();
    }
  });
}

/**
 * 开始抽奖
 */
function startLottery() {
  if (isSpinning) {
    return;
  }

  // 过滤奖项
  const filteredPrizes = ConfigManager.filterPrizes(
    config.prizes,
    config.whitelist,
    config.blacklist,
    config.useWhitelist,
    config.useBlacklist
  );

  if (filteredPrizes.length === 0) {
    showResult('没有可抽奖的奖项，请检查配置');
    return;
  }

  // 获取中奖奖项
  const prize = ConfigManager.getPrizeByWeight(filteredPrizes);

  if (!prize) {
    showResult('抽奖失败，请重试');
    return;
  }

  // 获取中奖奖项在原始列表中的索引
  const prizeIndex = config.prizes.findIndex(p => p.id === prize.id);

  if (prizeIndex === -1) {
    showResult('抽奖失败，请重试');
    return;
  }

  // 开始旋转
  isSpinning = true;
  elements.startBtn.disabled = true;
  elements.lotteryResult.textContent = '抽奖中...';

  Turntable.spin(prizeIndex, () => {
    isSpinning = false;
    elements.startBtn.disabled = false;
    showResult(`恭喜抽中：${prize.text}`);
  });
}

/**
 * 显示结果
 * @param {String} text 结果文本
 */
function showResult(text) {
  elements.lotteryResult.textContent = text;
  elements.lotteryResult.style.animation = 'none';
  elements.lotteryResult.offsetHeight; // 触发重绘
  elements.lotteryResult.style.animation = 'fadeIn 0.5s ease';
}

/**
 * 打开设置面板
 */
function openSettings() {
  // 填充当前配置
  elements.titleInput.value = config.title;
  elements.useWhitelist.checked = config.useWhitelist;
  elements.whitelistInput.value = config.whitelist.join('\n');
  elements.useBlacklist.checked = config.useBlacklist;
  elements.blacklistInput.value = config.blacklist.join('\n');

  // 填充奖项列表
  renderPrizesList();

  // 显示面板
  elements.settingsPanel.classList.add('active');
}

/**
 * 关闭设置面板
 */
function closeSettings() {
  elements.settingsPanel.classList.remove('active');
}

/**
 * 渲染奖项列表
 */
function renderPrizesList() {
  elements.prizesList.innerHTML = '';

  config.prizes.forEach((prize, index) => {
    const prizeItem = createPrizeItem(prize, index);
    elements.prizesList.appendChild(prizeItem);
  });
}

/**
 * 创建奖项项
 * @param {Object} prize 奖项对象
 * @param {Number} index 索引
 * @returns {HTMLElement} 奖项项元素
 */
function createPrizeItem(prize, index) {
  const div = document.createElement('div');
  div.className = 'prize-item';
  div.dataset.index = index;

  div.innerHTML = `
    <input type="text" class="prize-text" value="${prize.text}" placeholder="奖项名称">
    <input type="color" class="prize-color" value="${prize.color}" title="选择颜色">
    <input type="number" class="prize-weight" value="${prize.weight}" placeholder="权重" min="1" title="权重（越大中奖概率越高）">
    <button class="btn btn-delete" data-index="${index}">删除</button>
  `;

  // 绑定删除事件
  const deleteBtn = div.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', () => deletePrize(index));

  return div;
}

/**
 * 添加奖项项
 */
function addPrizeItem() {
  const newPrize = {
    id: ConfigManager.generateId(),
    text: `奖项${config.prizes.length + 1}`,
    color: getRandomColor(),
    weight: 1
  };

  config.prizes.push(newPrize);
  renderPrizesList();
}

/**
 * 删除奖项
 * @param {Number} index 索引
 */
function deletePrize(index) {
  if (config.prizes.length <= 1) {
    alert('至少需要保留一个奖项');
    return;
  }

  config.prizes.splice(index, 1);
  renderPrizesList();
}

/**
 * 获取随机颜色
 * @returns {String} 颜色值
 */
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#FF6F61'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 保存设置
 */
function saveSettings() {
  // 获取标题
  const title = elements.titleInput.value.trim();
  if (!title) {
    alert('标题不能为空');
    return;
  }

  // 获取奖项
  const prizeItems = elements.prizesList.querySelectorAll('.prize-item');
  const prizes = [];

  prizeItems.forEach((item, index) => {
    const text = item.querySelector('.prize-text').value.trim();
    const color = item.querySelector('.prize-color').value;
    const weight = parseInt(item.querySelector('.prize-weight').value) || 1;

    if (text) {
      prizes.push({
        id: config.prizes[index] ? config.prizes[index].id : ConfigManager.generateId(),
        text,
        color,
        weight
      });
    }
  });

  if (prizes.length === 0) {
    alert('至少需要一个奖项');
    return;
  }

  // 获取黑白名单
  const useWhitelist = elements.useWhitelist.checked;
  const whitelist = elements.whitelistInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);

  const useBlacklist = elements.useBlacklist.checked;
  const blacklist = elements.blacklistInput.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);

  // 更新配置
  config = {
    title,
    prizes,
    whitelist,
    blacklist,
    useWhitelist,
    useBlacklist
  };

  // 验证配置
  const validation = ConfigManager.validateConfig(config);
  if (!validation.valid) {
    alert('配置验证失败：\n' + validation.errors.join('\n'));
    return;
  }

  // 保存配置
  if (ConfigManager.saveConfig(config)) {
    // 更新界面
    elements.lotteryTitle.textContent = config.title;
    Turntable.updatePrizes(config.prizes);

    // 关闭面板
    closeSettings();

    // 显示成功提示
    showResult('配置已保存');
  } else {
    alert('保存配置失败');
  }
}

/**
 * 打开使用说明
 */
function openHelp() {
  elements.helpPanel.classList.add('active');
}

/**
 * 关闭使用说明
 */
function closeHelp() {
  elements.helpPanel.classList.remove('active');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
