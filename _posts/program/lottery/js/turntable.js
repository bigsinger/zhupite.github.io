/**
 * 转盘模块
 * 负责转盘的绘制和动画
 */

const Turntable = {
  canvas: null,
  ctx: null,
  config: null,
  prizes: [],
  isSpinning: false,
  currentRotation: 0,
  targetRotation: 0,
  animationId: null,

  /**
   * 初始化转盘
   * @param {String} canvasId Canvas 元素ID
   * @param {Object} config 配置对象
   */
  init(canvasId, config) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.config = config;
    this.prizes = config.prizes;

    // 设置 Canvas 尺寸
    this.resizeCanvas();

    // 绘制转盘
    this.draw();

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.draw();
    });
  },

  /**
   * 调整 Canvas 尺寸
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const size = Math.min(container.offsetWidth, container.offsetHeight);

    this.canvas.width = size;
    this.canvas.height = size;
  },

  /**
   * 绘制转盘
   */
  draw() {
    if (!this.ctx || !this.prizes || this.prizes.length === 0) {
      return;
    }

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制外圈
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#667eea';
    this.ctx.fill();

    // 绘制每个奖项
    const anglePerPrize = (2 * Math.PI) / this.prizes.length;

    this.prizes.forEach((prize, index) => {
      const startAngle = index * anglePerPrize + this.currentRotation;
      const endAngle = startAngle + anglePerPrize;

      // 绘制扇形
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = prize.color;
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // 绘制文字
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(startAngle + anglePerPrize / 2);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(prize.text, radius - 20, 0);
      this.ctx.restore();
    });

    // 绘制中心圆
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#667eea';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // 绘制中心文字
    this.ctx.fillStyle = '#667eea';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('抽奖', centerX, centerY);
  },

  /**
   * 开始旋转
   * @param {Number} prizeIndex 中奖奖项索引
   * @param {Function} callback 回调函数
   */
  spin(prizeIndex, callback) {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;

    // 计算目标旋转角度
    const anglePerPrize = (2 * Math.PI) / this.prizes.length;
    const targetAngle = prizeIndex * anglePerPrize + anglePerPrize / 2;
    const spins = 5; // 旋转圈数
    this.targetRotation = this.currentRotation + spins * 2 * Math.PI + (2 * Math.PI - targetAngle);

    // 开始动画
    this.animate(callback);
  },

  /**
   * 动画函数
   * @param {Function} callback 回调函数
   */
  animate(callback) {
    const duration = 3000; // 动画时长（毫秒）
    const startTime = Date.now();
    const startRotation = this.currentRotation;

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startRotation + (this.targetRotation - startRotation) * easeOut;

      // 绘制转盘
      this.draw();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animateFrame);
      } else {
        this.isSpinning = false;
        this.currentRotation = this.targetRotation % (2 * Math.PI);

        if (callback) {
          callback();
        }
      }
    };

    animateFrame();
  },

  /**
   * 停止旋转
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isSpinning = false;
  },

  /**
   * 更新奖项
   * @param {Array} prizes 奖项列表
   */
  updatePrizes(prizes) {
    this.prizes = prizes;
    this.draw();
  },

  /**
   * 重置转盘
   */
  reset() {
    this.stop();
    this.currentRotation = 0;
    this.targetRotation = 0;
    this.draw();
  }
};

// 导出到全局
window.Turntable = Turntable;
