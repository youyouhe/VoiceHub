import { CosyVoiceService } from '../services/cosyvoice';
import { EventEmitter } from 'events';

export interface ProviderConfig {
  id: string;
  gpuModel: string;
  vramGB: number;
  computePower: number;  // TFLOPS
  apiEndpoint: string;
  walletAddress: string;
}

export interface TaskRequest {
  taskId: string;
  text: string;
  language: string;
  voiceId?: string;
  mode: 'zero_shot' | 'cross_lingual' | 'instruct2';
  instructText?: string;
  priority: 'normal' | 'fast' | 'urgent';
}

export interface TaskResult {
  taskId: string;
  audioData: string;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ProviderStats {
  onlineSince: number;
  completedTasks: number;
  failedTasks: number;
  totalEarnings: number;
  averageTaskTime: number;
}

export class ProviderNode extends EventEmitter {
  private config: ProviderConfig;
  private status: 'offline' | 'online' | 'busy' = 'offline';
  private service: CosyVoiceService;
  private stats: ProviderStats;
  private taskStartTime: Map<string, number> = new Map();
  
  constructor(config: ProviderConfig) {
    super();
    this.config = config;
    this.service = new CosyVoiceService(config.apiEndpoint);
    this.stats = {
      onlineSince: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalEarnings: 0,
      averageTaskTime: 0
    };
  }
  
  // 启动 Provider 服务
  async start(): Promise<void> {
    console.log(`[Provider ${this.config.id}] Starting...`);
    
    try {
      // 健康检查
      const health = await this.service.healthCheck();
      if (health.status !== 'healthy') {
        throw new Error('Backend unhealthy');
      }
      
      this.status = 'online';
      this.stats.onlineSince = Date.now();
      
      // 注册到网络
      await this.registerToNetwork();
      
      // 启动心跳
      this.startHeartbeat();
      
      console.log(`[Provider ${this.config.id}] Started successfully`);
      this.emit('started');
      
    } catch (error) {
      console.error(`[Provider ${this.config.id}] Failed to start:`, error);
      throw error;
    }
  }
  
  // 停止 Provider 服务
  async stop(): Promise<void> {
    console.log(`[Provider ${this.config.id}] Stopping...`);
    
    this.status = 'offline';
    this.emit('stopped');
    console.log(`[Provider ${this.config.id}] Stopped`);
  }
  
  // 获取当前状态
  getStatus(): { status: string; config: ProviderConfig; stats: ProviderStats } {
    return {
      status: this.status,
      config: this.config,
      stats: this.stats
    };
  }
  
  // 接受并处理任务
  async acceptTask(request: TaskRequest): Promise<TaskResult> {
    if (this.status !== 'online') {
      throw new Error('Provider not online');
    }
    
    this.status = 'busy';
    this.taskStartTime.set(request.taskId, Date.now());
    
    console.log(`[Provider ${this.config.id}] Processing task ${request.taskId}`);
    
    try {
      // 构建 TTS 请求
      const ttsRequest = this.buildTTSRequest(request);
      
      // 执行 TTS
      const result = await this.service.textToSpeech(ttsRequest);
      
      // 更新统计
      this.updateStats(request.taskId, true);
      
      const taskResult: TaskResult = {
        taskId: request.taskId,
        audioData: result.audioData,
        duration: result.duration,
        success: true
      };
      
      console.log(`[Provider ${this.config.id}] Task ${request.taskId} completed in ${this.getTaskTime(request.taskId)}ms`);
      
      return taskResult;
      
    } catch (error) {
      this.updateStats(request.taskId, false);
      
      const taskResult: TaskResult = {
        taskId: request.taskId,
        audioData: '',
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      console.error(`[Provider ${this.config.id}] Task ${request.taskId} failed:`, error);
      
      return taskResult;
      
    } finally {
      this.status = 'online';
    }
  }
  
  // 计算任务收益
  calculateReward(taskResult: TaskResult): number {
    const baseReward = 10; // 基础奖励
    const durationBonus = Math.min(taskResult.duration * 0.5, 50); // 时长加成
    const successBonus = taskResult.success ? 5 : 0; // 成功加成
    
    // 性能加成基于 Provider 配置
    const performanceMultiplier = this.config.computePower / 80; // 归一化到 RTX 4090
    
    return Math.floor((baseReward + durationBonus + successBonus) * performanceMultiplier);
  }
  
  private async registerToNetwork(): Promise<void> {
    // TODO: 实现注册逻辑
    console.log(`[Provider ${this.config.id}] Registered to network`);
  }
  
  private startHeartbeat(): void {
    // 每 30 秒发送心跳
    setInterval(async () => {
      if (this.status === 'online') {
        await this.sendHeartbeat();
      }
    }, 30000);
  }
  
  private async sendHeartbeat(): Promise<void> {
    try {
      // TODO: 实现心跳逻辑
      // await network.heartbeat(this.config.id);
    } catch (error) {
      console.error(`[Provider ${this.config.id}] Heartbeat failed: }
  }
  
`, error);
     private buildTTSRequest(request: TaskRequest): object {
    const baseRequest = {
      text: request.text,
      mode: request.mode,
      speed: 1.0
    };
    
    // 根据模式添加特定参数
    if (request.mode === 'instruct2' && request.instructText) {
      return {
        ...baseRequest,
        instructText: request.instructText
      };
    }
    
    return baseRequest;
  }
  
  private updateStats(taskId: string, success: boolean): void {
    const taskTime = this.getTaskTime(taskId);
    this.taskStartTime.delete(taskId);
    
    if (success) {
      this.stats.completedTasks++;
      // 更新平均任务时间
      this.stats.averageTaskTime = 
        (this.stats.averageTaskTime * (this.stats.completedTasks - 1) + taskTime) 
        / this.stats.completedTasks;
    } else {
      this.stats.failedTasks++;
    }
  }
  
  private getTaskTime(taskId: string): number {
    const startTime = this.taskStartTime.get(taskId);
    return startTime ? Date.now() - startTime : 0;
  }
}

// Provider 管理器
export class ProviderManager {
  private providers: Map<string, ProviderNode> = new Map();
  
  addProvider(config: ProviderConfig): ProviderNode {
    const provider = new ProviderNode(config);
    this.providers.set(config.id, provider);
    return provider;
  }
  
  removeProvider(id: string): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.stop();
      this.providers.delete(id);
    }
  }
  
  getProvider(id: string): ProviderNode | undefined {
    return this.providers.get(id);
  }
  
  getAllProviders(): ProviderNode[] {
    return Array.from(this.providers.values());
  }
  
  getOnlineProviders(): ProviderNode[] {
    return this.getAllProviders().filter(p => p.getStatus().status === 'online');
  }
  
  async startAll(): Promise<void> {
    await Promise.all(this.getAllProviders().map(p => p.start()));
  }
  
  async stopAll(): Promise<void> {
    await Promise.all(this.getAllProviders().map(p => p.stop()));
  }
}

export default ProviderManager;
