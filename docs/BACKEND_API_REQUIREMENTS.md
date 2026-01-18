# CosyVoice Backend API 增强需求文档

## 概述

VoiceHub 前端需要与 CosyVoice 后端深度集成，实时获取服务状态和系统资源信息，以便：
1. 显示后端服务健康状态
2. 展示 NVIDIA GPU 使用情况（显存、温度、利用率）
3. 前端根据后端状态提供更好的用户体验

---

## 一、现有 Health Check 端点增强

### 1.1 当前状态

**已有端点**：`GET /health`

**当前响应**：
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "3",
  "speakers_count": 0,
  "available_modes": ["zero_shot", "cross_lingual", "instruct2"]
}
```

### 1.2 增强需求

**目标**：提供更详细的服务状态信息

**建议响应格式**：
```json
{
  "status": "healthy" | "unhealthy" | "loading",
  "model_loaded": true,
  "model_version": "3",
  "model_name": "CosyVoice-300M-SFT",
  "speakers_count": 5,
  "available_modes": ["zero_shot", "cross_lingual", "instruct2"],
  "uptime_seconds": 3600,
  "server_time": "2026-01-16T10:30:00Z"
}
```

### 1.3 实现建议

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if model_loaded else "loading",
        "model_loaded": model_loaded,
        "model_version": "3",
        "model_name": "CosyVoice-300M-SFT",
        "speakers_count": len(get_speaker_list()),
        "available_modes": ["zero_shot", "cross_lingual", "instruct2"],
        "uptime_seconds": int(time.time() - start_time),
        "server_time": datetime.utcnow().isoformat()
    }
```

---

## 二、系统资源监控 API

### 2.1 新增端点

**端点**：`GET /system/metrics`

**描述**：获取系统资源使用情况，特别是 NVIDIA GPU 信息

### 2.2 响应格式

```json
{
  "cpu": {
    "usage_percent": 25.5,
    "cores": 8
  },
  "memory": {
    "total_gb": 32.0,
    "used_gb": 12.5,
    "available_gb": 19.5
  },
  "gpu": {
    "available": true,
    "name": "NVIDIA GeForce RTX 3060",
    "driver_version": "536.99",
    "cuda_version": "12.2",
    "vram_total_mb": 12288,
    "vram_used_mb": 4300,
    "gpu_utilization_percent": 45.2,
    "temperature_celsius": 52,
    "power_draw_watts": 145.5,
    "processes": [
      {
        "pid": 1234,
        "name": "python",
        "vram_mb": 4096,
        "gpu_util_percent": 40.0
      }
    ]
  },
  "disk": {
    "total_gb": 512.0,
    "used_gb": 120.0,
    "available_gb": 392.0
  },
  "network": {
    "bytes_sent": 1024000,
    "bytes_recv": 2048000
  },
  "timestamp": "2026-01-16T10:30:00Z"
}
```

### 2.3 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `gpu.available` | boolean | GPU 是否可用 |
| `gpu.name` | string | GPU 型号名称 |
| `gpu.vram_total_mb` | int | 显存总量 (MB) |
| `gpu.vram_used_mb` | int | 已使用显存 (MB) |
| `gpu.gpu_utilization_percent` | float | GPU 利用率 (%) |
| `gpu.temperature_celsius` | int | GPU 温度 (°C) |
| `gpu.power_draw_watts` | float | 功耗 (W) |

### 2.4 实现建议

使用 `nvidia-smi` 命令获取 GPU 信息：

```python
import subprocess
import pynvml

def get_gpu_metrics():
    try:
        pynvml.nvmlInit()
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        
        info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        power = pynvml.nvmlDeviceGetPowerUsage(handle)
        
        return {
            "available": True,
            "name": pynvml.nvmlDeviceGetName(handle).decode('utf-8'),
            "vram_total_mb": info.total // 1024 // 1024,
            "vram_used_mb": info.used // 1024 // 1024,
            "gpu_utilization_percent": util.gpu,
            "temperature_celsius": temp,
            "power_draw_watts": power / 1000.0
        }
    except Exception as e:
        return {"available": False, "error": str(e)}
```

或者使用 `nvidia-smi` 命令行：

```bash
nvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu,power.draw --format=csv
```

### 2.5 依赖

需要安装 `pynvml` 库：

```bash
pip install pynvml
```

---

## 三、前端集成需求

### 3.1 前端调用方式

```typescript
// Health Check
const healthStatus = await fetch('/health').then(r => r.json());

// System Metrics (轮询间隔建议 2-5 秒)
const metrics = await fetch('/system/metrics').then(r => r.json());
```

### 3.2 前端显示需求

| 状态 | 前端显示 |
|------|----------|
| Backend Online | 绿色状态指示器，显示 GPU 名称和显存使用 |
| Backend Offline | 红色状态指示器，显示"无法连接后端服务" |
| GPU Loading | 显示进度条或显存使用百分比 |
| GPU Overheating | 温度 > 80°C 时显示警告 |

### 3.3 错误处理

当 `/system/metrics` 返回 `gpu.available: false` 时，前端应：
- 降级显示 CPU-only 模式
- 隐藏 GPU 相关信息
- 显示提示："未检测到 GPU，将使用 CPU 模式（性能较低）"

---

## 四、API 端点汇总

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 服务健康检查（增强版） |
| `/system/metrics` | GET | 系统资源监控 |
| `/speakers` | GET | 列出所有 speaker |
| `/speakers` | POST | 创建自定义 speaker |
| `/speakers/{id}` | DELETE | 删除 speaker |
| `/tts` | POST | 文字转语音 |

---

## 五、优先级

| 优先级 | 功能 | 说明 |
|--------|------|------|
| **P0** | `/health` 增强 | 快速实现，添加 model_name 和 uptime |
| **P0** | `/system/metrics` 基础 | GPU 名称、显存、温度 |
| **P1** | `/system/metrics` 完整 | 完整 GPU 监控 + CPU/内存/磁盘 |
| **P2** | 缓存优化 | metrics 端点添加 1-2 秒缓存 |

---

## 六、测试验证

### 6.1 Health Check 测试

```bash
curl http://localhost:9880/health
```

预期：返回包含 `model_loaded: true` 的 JSON 响应

### 6.2 System Metrics 测试

```bash
curl http://localhost:9880/system/metrics
```

预期：返回包含 GPU 信息的 JSON 响应

### 6.3 前端集成测试

1. 打开 VoiceHub 前端
2. 检查 Settings 页面是否显示连接状态
3. 检查 Header 是否显示 GPU 信息
4. 模拟后端离线，验证前端状态更新

---

## 七、注意事项

1. **性能影响**：`nvidia-smi` 和 `pynvml` 调用有轻微性能开销，建议 metrics 端点添加缓存（1-2 秒）
2. **GPU 不可用**：当没有 GPU 时，metrics 端点应返回 `gpu.available: false` 而非报错
3. **安全性**：metrics 端点可以公开访问，但不应暴露敏感系统信息
4. **兼容性**：`pynvml` 需要 NVIDIA 驱动 >= 340.xx

---

## 联系

如有疑问，请联系前端开发团队确认 API 格式需求。
