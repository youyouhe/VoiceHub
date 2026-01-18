# VoiceCraft Community Token System

## 系统概述

一个去中心化的 GPU 资源共享和 Token 经济系统，让社区成员可以互助完成 TTS 任务。

## 核心角色

| 角色 | 描述 | 收益 |
|------|------|------|
| **Provider** | 贡献 GPU 算力 | 获得 Token |
| **Consumer** | 消费 TTS 服务 | 消耗 Token |
| **Validator** | 验证任务结果 | 获得小费 |

## Token 经济

### Token 分配

```
总供应量: 1,000,000,000 VC

分配比例:
├── 社区激励池 (40%) - 400,000,000
│   ├── Provider 挖矿奖励 (30%) - 300,000,000
│   └── 任务验证奖励 (10%) - 100,000,000
│
├── 初始发行 (30%) - 300,000,000
│   └── 团队 + 社区空投
│
├── 生态系统基金 (20%) - 200,000,000
│   └── 开发者激励 + 合作伙伴
│
└── 国库 (10%) - 100,000,000
    └── 系统维护 + 紧急修复
```

### Provider 收益模型

```typescript
interface ProviderConfig {
  gpuModel: string;          // GPU 型号
  vramGB: number;            // 显存 (GB)
  computePower: number;      // 计算能力 (TFLOPS)
  onlineHours: number;       // 每日在线时长
}

interface Earnings {
  baseReward: number;        // 基础奖励
  performanceBonus: number;  // 性能加成
  reliabilityBonus: number;  // 可靠性加成
  totalDaily: number;        // 日收益
}

// 收益计算公式
dailyEarnings = baseReward * performanceFactor * reliabilityFactor

// 示例配置
const providerConfig: ProviderConfig = {
  gpuModel: 'RTX 4090',
  vramGB: 24,
  computePower: 82.6,
  onlineHours: 12
};
```

### TTS 任务定价

```typescript
interface TaskPricing {
  basePrice: number;           // 基础价格 (VC)
  perCharacter: number;        // 每个字符价格
  maxCharacters: number;       // 单次最大字符
  premiumMultiplier: number;   // 紧急任务倍率

  calculate(textLength: number, urgency: 'normal' | 'fast' | 'urgent'): number {
    let price = this.basePrice + textLength * this.perCharacter;
    if (urgency === 'fast') price *= 1.5;
    if (urgency === 'urgent') price *= 2.0;
    return price;
  }
}

const pricing = new TaskPricing({
  basePrice: 10,              // 10 VC
  perCharacter: 0.1,          // 0.1 VC/字符
  maxCharacters: 5000,        // 最大5000字符
  premiumMultiplier: 2.0      // 紧急任务2倍
});
```

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    VoiceCraft Network                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│   │  Provider   │     │  Provider   │     │  Provider   │        │
│   │  (GPU Node) │     │  (GPU Node) │     │  (GPU Node) │        │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘        │
│          │                  │                  │                 │
│          └──────────────────┼──────────────────┘                 │
│                             │                                    │
│                             ▼                                    │
│              ┌──────────────────────────────┐                   │
│              │      Task Dispatcher         │                   │
│              │   (Match tasks to providers) │                   │
│              └──────────────┬───────────────┘                   │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                 │
│          ▼                  ▼                  ▼                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│   │  Consumer   │     │  Consumer   │     │  Consumer   │      │
│   │  (Request)  │     │  (Request)  │     │  (Request)  │      │
│   └─────────────┘     └─────────────┘     └─────────────┘      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     Smart Contract Layer                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Token       │ │ Task        │ │ Reputation  │            │
│  │ Contract    │ │ Registry    │ │ Contract    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Provider Node

```typescript
interface ProviderNode {
  id: string;
  config: ProviderConfig;
  status: 'online' | 'offline' | 'busy';
  reputation: number;
  totalEarnings: number;
  completedTasks: number;
  failedTasks: number;

  // 核心功能
  startServing(): Promise<void>;
  stopServing(): void;
  acceptTask(task: TaskRequest): Promise<TaskResult>;
  submitResult(result: TaskResult): Promise<void>;
  claimRewards(): Promise<void>;
}

class GPUProvider implements ProviderNode {
  async startServing() {
    // 连接到网络，注册为可用节点
    await network.registerProvider(this.config);
    this.status = 'online';
  }

  async processTTSTask(input: TTSInput): Promise<TTSOutput> {
    const result = await this.cosyVoiceClient.textToSpeech(input);
    
    // 计算收益
    const reward = this.calculateReward(result.duration);
    await this.wallet.transfer(reward);
    
    return result;
  }
}
```

### 2. Task Dispatcher

```typescript
class TaskDispatcher {
  async dispatch(task: TaskRequest): Promise<DispatchResult> {
    // 1. 验证消费者余额
    const balance = await this.tokenContract.balanceOf(task.consumerId);
    if (balance < task.estimatedCost) {
      throw new Error('Insufficient balance');
    }

    // 2. 锁定 Token
    await this.tokenContract.lock(task.consumerId, task.estimatedCost);

    // 3. 选择最佳 Provider
    const provider = await this.selectBestProvider(task);

    // 4. 分配任务
    const assignment = await this.assignTask(provider, task);

    // 5. 设置超时和验证
    return this.setupVerification(assignment);
  }

  private async selectBestProvider(task: TaskRequest): Promise<ProviderNode> {
    const candidates = await this.getOnlineProviders();
    
    // 评分排序
    const scored = candidates.map(p => ({
      provider: p,
      score: this.calculateScore(p, task)
    }));
    
    return scored.sort((a, b) => b.score - a.score)[0].provider;
  }
}
```

### 3. Token Contract (简化版)

```typescript
// VoiceCraft Token Contract
contract VoiceCraftToken {
  string public name = "VoiceCraft";
  string public symbol = "VC";
  uint8 public decimals = 18;
  uint256 public totalSupply;
  
  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;
  
  // Provider 挖矿奖励
  mapping(address => uint256) public miningRewards;
  
  // 任务押金
  mapping(bytes32 => TaskEscrow) public taskEscrows;
  
  struct TaskEscrow {
    address consumer;
    uint256 amount;
    address provider;
    uint256 deadline;
    bool completed;
  }
  
  event Transfer(address indexed from, address indexed to, uint256 value);
  event MiningReward(address indexed provider, uint256 amount);
  event TaskEscrowCreated(bytes32 indexed taskId, uint256 amount);
  event TaskCompleted(bytes32 indexed taskId, uint256 providerReward);
  
  // 转账
  function transfer(address to, uint256 amount) public returns (bool) {
    balanceOf[msg.sender] -= amount;
    balanceOf[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
  }
  
  // 授权
  function approve(address spender, uint256 amount) public returns (bool) {
    allowance[msg.sender][spender] = amount;
    return true;
  }
  
  // Provider 领取挖矿奖励
  function claimMiningReward() public {
    uint256 reward = miningRewards[msg.sender];
    require(reward > 0, "No reward to claim");
    
    miningRewards[msg.sender] = 0;
    balanceOf[msg.sender] += reward;
    
    emit MiningReward(msg.sender, reward);
  }
  
  // 创建任务押金
  function createTaskEscrow(
    bytes32 taskId,
    uint256 amount,
    address provider,
    uint256 duration
  ) public {
    balanceOf[msg.sender] -= amount;
    taskEscrows[taskId] = TaskEscrow({
      consumer: msg.sender,
      amount: amount,
      provider: provider,
      deadline: block.timestamp + duration,
      completed: false
    });
    
    emit TaskEscrowCreated(taskId, amount);
  }
  
  // 完成并分配奖励
  function completeTask(bytes32 taskId, uint256 providerShare) public {
    TaskEscrow storage escrow = taskEscrows[taskId];
    require(msg.sender == escrow.provider, "Not assigned provider");
    
    uint256 platformFee = escrow.amount * 5 / 100; // 5% 平台费
    uint256 providerReward = providerShare - platformFee;
    
    balanceOf[escrow.provider] += providerReward;
    balanceOf[address(this)] += platformFee;
    
    escrow.completed = true;
    emit TaskCompleted(taskId, providerReward);
  }
}
```

### 4. 声誉系统

```typescript
interface ReputationSystem {
  // Provider 声誉评分 (0-100)
  calculateProviderScore(provider: ProviderNode): number {
    const completionRate = provider.completedTasks / 
      (provider.completedTasks + provider.failedTasks);
    const speedScore = this.calculateSpeedScore(provider);
    const reliabilityScore = this.calculateReliabilityScore(provider);
    
    return completionRate * 40 + speedScore * 30 + reliabilityScore * 30;
  }
  
  // 奖励加成
  getRewardMultiplier(score: number): number {
    if (score >= 90) return 1.5;   // 优秀
    if (score >= 70) return 1.2;   // 良好
    if (score >= 50) return 1.0;   // 一般
    return 0.8;                    // 需改进
  }
}

class ReputationContract {
  mapping(address => uint256) public reputationScore;
  mapping(address => uint256) public totalTasks;
  mapping(address => uint256) public successfulTasks;
  mapping(address => uint256) public ratings;
  
  // Provider 完成任务后更新声誉
  function updateReputation(address provider, uint8 rating) {
    totalTasks[provider]++;
    successfulTasks[provider]++;
    ratings[provider] = (ratings[provider] * (totalTasks[provider] - 1) + rating) 
      / totalTasks[provider];
    
    // 计算综合评分
    reputationScore[provider] = calculateFinalScore(provider);
  }
  
  // Provider 失败任务
  function penalizeProvider(address provider) {
    totalTasks[provider]++;
    reputationScore[provider] = Math.max(0, reputationScore[provider] - 5);
  }
}
```

### 5. 任务验证

```typescript
interface TaskVerification {
  // 结果验证
  async verifyResult(task: TaskRequest, result: TaskResult): Promise<VerificationResult> {
    // 1. 基础验证
    const basicValid = this.basicValidation(result);
    
    // 2. 音频质量检测
    const qualityValid = await this.checkAudioQuality(result.audio);
    
    // 3. 内容一致性检测
    const contentValid = await this.checkContentConsistency(task.text, result.audio);
    
    // 4. 统计验证（随机抽样）
    const statisticalValid = await this.statisticalCheck(result);
    
    return {
      isValid: basicValid && qualityValid && contentValid && statisticalValid,
      confidence: this.calculateConfidence(result),
      report: this.generateReport(basicValid, qualityValid, contentValid, statisticalValid)
    };
  }
  
  // 争议处理
  async handleDispute(taskId: string, appeal: DisputeAppeal): Promise<DisputeResolution> {
    // 1. 重新验证
    const result = await this.verifyAgain(taskId);
    
    // 2. 社区投票
    const votes = await this.collectVotes(taskId);
    
    // 3. 仲裁委员会裁决
    return this.arbitrationCouncil.judge(votes, result);
  }
}
```

## API 设计

### Provider API

```yaml
# Provider 注册
POST /api/v1/provider/register
Body: {
  "gpuModel": "RTX 4090",
  "vramGB": 24,
  "computePower": 82.6,
  "apiEndpoint": "http://provider:9880"
}

# Provider 状态更新
POST /api/v1/provider/status
Body: {
  "status": "online" | "offline",
  "availableVRAM": 20
}

# 领取奖励
POST /api/v1/provider/claim
Response: {
  "amount": 1500,
  "txHash": "0x..."
}
```

### Consumer API

```yaml
# 提交任务
POST /api/v1/task/submit
Body: {
  "text": "Hello world",
  "language": "en",
  "voiceId": "preset_1",
  "priority": "normal"
}
Response: {
  "taskId": "0x1234...",
  "estimatedCost": 100,
  "estimatedTime": 30
}

# 查询任务状态
GET /api/v1/task/{taskId}
Response: {
  "status": "pending" | "processing" | "completed" | "failed",
  "resultUrl": "https://...",
  "providerId": "0xabcd..."
}

# 争议申诉
POST /api/v1/task/{taskId}/dispute
Body: {
  "reason": "audio_quality",
  "evidence": "..."
}
```

### Token API

```yaml
# 查询余额
GET /api/v1/token/balance/{address}
Response: {
  "balance": 10000,
  "locked": 500
}

# 转移 Token
POST /api/v1/token/transfer
Body: {
  "to": "0x...",
  "amount": 1000
}

# 查询 Provider 排名
GET /api/v1/providers/top?limit=10
Response: {
  "providers": [
    {
      "address": "0x...",
      "reputation": 95,
      "totalEarnings": 50000,
      "gpuModel": "RTX 4090"
    }
  ]
}
```

## 安全机制

### 1. Provider 验证

```typescript
// 硬件真实性验证
async verifyHardware(providerId: string): Promise<boolean> {
  const benchmark = await this.runBenchmark(providerId);
  const claimed = await this.getClaimedSpecs(providerId);
  
  return this.isConsistent(benchmark, claimed);
}

// 运行时完整性证明 (TEE)
async verifyTEE(providerId: string): Promise<boolean> {
  const attestation = await this.getAttestation(providerId);
  return this.verifyAttestation(attestation);
}
```

### 2. 任务结果验证

```typescript
// 双重验证机制
async doubleVerification(taskId: string): Promise<VerificationResult> {
  // 1. 分配给主 Provider
  const primaryResult = await this.dispatchToPrimary(taskId);
  
  // 2. 随机分配给验证 Provider
  const verificationResult = await this.dispatchForVerification(taskId);
  
  // 3. 对比结果
  return this.compareResults(primaryResult, verificationResult);
}
```

### 3. 惩罚机制

```typescript
enum ViolationType {
  PROVIDER_OFFLINE,      // Provider 离线
  PROVIDER_TIMEOUT,      // 任务超时
  LOW_QUALITY,           // 结果质量低
  MALICIOUS_BEHAVIOR    // 恶意行为
}

const penalties = {
  [ViolationType.PROVIDER_OFFLINE]: 5,           // 声誉-5
  [ViolationType.PROVIDER_TIMEOUT]: 10,          // 声誉-10
  [ViolationType.LOW_QUALITY]: 15,              // 声誉-15 + 退还费用
  [ViolationType.MALICIOUS_BEHAVIOR]: 50        // 声誉-50 + 罚没押金
};

function applyPenalty(providerId: string, violation: ViolationType) {
  const penalty = penalties[violation];
  reputationContract.penalize(providerId, penalty);
  
  // 严重违规：踢出网络
  if (penalty >= 50) {
    network.banProvider(providerId);
  }
}
```

## 经济模型参数

```typescript
const ECONOMIC_PARAMS = {
  // Token
  totalSupply: 1_000_000_000,
  initialSupply: 300_000_000,
  
  // Provider 收益
  baseDailyReward: 100,           // 基础日收益
  performanceBonusThreshold: 0.9,  // 性能奖励阈值
  reliabilityBonusThreshold: 0.95, // 可靠性奖励阈值
  
  // 任务定价
  baseTaskPrice: 10,              // 基础价格 (VC)
  perCharacterRate: 0.1,          // 字符单价
  platformFeePercent: 5,          // 平台费
  
  // 惩罚
  timeoutPenalty: 10,            // 超时惩罚
  qualityPenalty: 15,            // 质量惩罚
  reputationDecayRate: 0.01,      // 声誉衰减率
  
  // 验证
  verificationProbability: 0.1,  // 验证概率
  doubleVerificationThreshold: 1000 // 大额任务双验证
};
```

## 实施路线图

### Phase 1: MVP (Month 1-2)
- [ ] 基础 Token 合约
- [ ] Provider 注册和状态管理
- [ ] 简单任务分配
- [ ] 基础声誉系统

### Phase 2: 经济模型 (Month 2-3)
- [ ] Provider 挖矿奖励计算
- [ ] 任务定价系统
- [ ] 争议解决机制
- [ ] Token 交易功能

### Phase 3: 去中心化 (Month 3-4)
- [ ] 完全去中心化任务分发
- [ ] 多重验证机制
- [ ] 社区治理
- [ ] 跨链支持

### Phase 4: 生态完善 (Month 4-6)
- [ ] API 网关
- [ ] 移动端 App
- [ ] 开发者工具
- [ ] 合作伙伴集成
