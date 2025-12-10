// 文件：scripts/ipaTool/modules/BackgroundManager.ts
// 说明：后台保活管理类，对 BackgroundKeeper 进行二次封装

/**
 * 后台保活管理器
 * 使用 Set 管理所有实例，根据实例状态自动控制后台保活
 */
export class BackgroundManager {
  /** Set 容器，存储所有实例 */
  private static instances = new Set<BackgroundManager>();

  /**
   * 默认规则回调
   * 规则：只要有一个实例状态为 true，就启动后台保活
   */
  private static callback: () => void | Promise<void> = async () => {
    // 遍历所有实例状态
    for (const { status } of BackgroundManager.instances) {
      if (status) {
        await BackgroundKeeper.keepAlive();
        return;
      }
    }

    // 所有实例都是 false，停止后台保活
    await BackgroundKeeper.stopKeepAlive();
  };

  /**
   * 设置自定义规则
   * @param callback 自定义规则回调函数
   */
  static setRule(callback: () => void | Promise<void>) {
    this.callback = callback;
  }

  /**
   * 启动保活检查
   * 执行规则回调，根据所有实例状态决定是否启动后台保活
   */
  static async run() {
    await this.callback();
  }

  constructor() {
    // 实例化时自动加入容器
    BackgroundManager.instances.add(this);
  }

  /** 实例状态 */
  status: boolean = false;

  /**
   * 修改实例状态
   * 每次修改都会触发全局保活检查
   * @param status 新的状态值
   */
  async setActive(status: boolean) {
    this.status = status;
    await BackgroundManager.run();
  }

  /**
   * 清除实例
   */
  clear() {
    BackgroundManager.instances.delete(this);
  }

  /**
   * 获取全局后台保活状态
   * @returns Promise<boolean> 后台保活是否激活
   */
  getBackgroundStatus() {
    return BackgroundKeeper.isActive;
  }
}
