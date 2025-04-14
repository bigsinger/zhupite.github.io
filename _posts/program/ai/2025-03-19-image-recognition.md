---
layout:		post
category:	"program"
title:		"图片识别方案"

tags:		[ai]
---
- Content
{:toc}


# 需求

批量对图片进行识别并做重命名，要求免费且个人电脑能跑。

# 方案对比

以下是各模型与 BLIP-base 的对比（基于准确率、免费性、易用性）：

| 模型              | 准确率（相对 BLIP-base）  | 免费性 | 硬件需求          | 代码适配难度 | 推荐场景                 |
| ----------------- | ------------------------- | ------ | ----------------- | ------------ | ------------------------ |
| **BLIP-2**        | 更高（+5-10% CIDEr）      | 开源   | 高（16GB+ GPU）   | 低           | 高准确率需求，复杂场景   |
| **LLaVA**         | 更高（+3-8% CIDEr）       | 开源   | 很高（24GB+ GPU） | 中           | 上下文丰富描述，通用任务 |
| **mPLUG-Owl**     | 略高（+3-5% CIDEr）       | 开源   | 高（16GB+ GPU）   | 中           | 边缘案例，鲁棒性要求     |
| **Git-Captioner** | 相当或略低（-1-2% CIDEr） | 开源   | 低（8GB GPU）     | 低           | 简单场景，低资源环境     |

结论：电脑性能稍微好点的话推荐使用**BLIP-2**，我的个人电脑稍微差点，使用**BLIP**跑也是可以的，结果还是可以使用的。

# BLIP

`BLIP`（Bootstrapping Language-Image Pretraining）

效果还可以，个人电脑就可以使用。

安装依赖：

```bash
pip install transformers timm pillow torch torchvision
```

`blip_rename.py`：

```python
"""
批量识别并重命名图片

描述：
    本脚本使用 BLIP 模型为输入目录中的图片生成描述，将描述清理为合法的 Windows 文件名，
    并将图片复制到输出目录，以描述作为文件名。

依赖项：
    - Python 3.8+
    - transformers（用于 BLIP 模型）
    - Pillow（用于图片处理）
    - tqdm（用于进度条）
    - shutil, pathlib（标准库）

使用方法：
    python script.py --input <输入目录> --output <输出目录>

示例：
    python script.py --input ./images --output ./output

注意：
    - 支持常见图片格式：.jpg, .jpeg, .png, .bmp, .gif
    - 自动替换 Windows 非法文件名字符以确保兼容性
    - 跳过不支持的文件格式并优雅处理错误
"""

import os
import shutil
from pathlib import Path
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from tqdm import tqdm
import re

# -------- 初始化 BLIP 模型 --------
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", use_fast=True)
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# -------- 处理Windows非法文件名字符 --------
def valid_filename(caption: str) -> str:
    """
    将caption中的Windows非法字符替换为空格并清理，确保生成合法文件名
    """
    # Windows非法字符
    illegal_chars = r'[<>:"/\\|?*]'
    # 替换非法字符为空格
    caption_clean = re.sub(illegal_chars, ' ', caption)
    return caption_clean

# -------- 生成图片描述 --------
def generate_caption(img_path: Path) -> str:
    try:
        raw_image = Image.open(img_path).convert('RGB')
        inputs = processor(raw_image, return_tensors="pt")
        out = model.generate(**inputs, max_new_tokens=20)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"[ERROR] Failed to generate caption for {img_path.name}: {e}")
        return "error_caption"

# -------- 主函数：重命名并复制 --------
def caption_and_copy(input_dir: str, output_dir: str) -> None:
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 支持的图片扩展名
    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}

    for img_file in tqdm(list(input_dir.glob("*.*"))):
        if img_file.suffix.lower() not in valid_extensions:
            print(f"[SKIP] {img_file.name}: Unsupported file format")
            continue

        try:
            caption = generate_caption(img_file)
            caption_clean = valid_filename(caption)
            suffix = img_file.suffix.lower()
            dst_path = output_dir / f"{caption_clean}{suffix}"

            count = 1
            base_name = caption_clean
            while dst_path.exists():
                dst_path = output_dir / f"{base_name}_{count}{suffix}"
                count += 1

            shutil.copy2(img_file, dst_path)
            print(f"{img_file.name} → {dst_path.name} ({caption})")
        except Exception as e:
            print(f"[ERROR] Processing {img_file.name}: {e}")

# -------- 启动入口 --------
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Caption and copy images using BLIP model")
    parser.add_argument("--input", required=True, help="Input directory containing images")
    parser.add_argument("--output", required=True, help="Output directory for copied images")
    args = parser.parse_args()

    caption_and_copy(args.input, args.output)
```

# BLIP-2

模型：Salesforce/blip-2-opt-2.7b

推荐使用 NVIDIA GPU（16GB+ 显存）以获得最佳性能。如果只有 CPU 或低显存 GPU，建议测试后确认是否需要切换到 Salesforce/blip-image-captioning-large。



安装依赖：

```bash
pip install transformers torch torchvision Pillow tqdm

# 如果使用量化（load_in_4bit=True）以支持较低显存，需额外安装：
pip install bitsandbytes
```



**硬件需求**：BLIP-2 模型较大，推荐 GPU 环境。如果运行时内存不足，可尝试：

- 添加： `load_in_4bit=True`

  ```python
  model = Blip2ForConditionalGeneration.from_pretrained(    "Salesforce/blip-2-opt-2.7b", torch_dtype=torch.float16, load_in_4bit=True )
  ```

- 或回退到 `Salesforce/blip-image-captioning-large`（内存需求较低，但准确率略低于 BLIP-2）。



`blip2_rename.py`：

```python
"""
批量识别并重命名图片

描述：
    本脚本使用 BLIP 模型为输入目录中的图片生成描述，将描述清理为合法的 Windows 文件名，
    并将图片复制到输出目录，以描述作为文件名。

依赖项：
    - Python 3.8+
    - transformers（用于 BLIP-2 模型）
    - Pillow（用于图片处理）
    - tqdm（用于进度条）
    - shutil, pathlib（标准库）

使用方法：
    python script.py --input <输入目录> --output <输出目录>

示例：
    python script.py --input ./images --output ./output

注意：
    - 支持常见图片格式：.jpg, .jpeg, .png, .bmp, .gif
    - 自动替换 Windows 非法文件名字符以确保兼容性
    - 跳过不支持的文件格式并优雅处理错误
    - 建议使用 GPU（16GB+ 显存）以获得最佳性能
"""

import os
import shutil
from pathlib import Path
from PIL import Image
from transformers import Blip2Processor, Blip2ForConditionalGeneration
from tqdm import tqdm
import re
import torch

# -------- 初始化 BLIP-2 模型 --------
processor = Blip2Processor.from_pretrained("Salesforce/blip-2-opt-2.7b", use_fast=True)
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip-2-opt-2.7b", torch_dtype=torch.float16
)

# -------- 处理Windows非法文件名字符 --------
def valid_filename(caption: str) -> str:
    """
    将caption中的Windows非法字符替换为空格并清理，确保生成合法文件名
    """
    # Windows非法字符
    illegal_chars = r'[<>:"/\\|?*]'
    # 替换非法字符为空格
    caption_clean = re.sub(illegal_chars, ' ', caption)
    return caption_clean

# -------- 生成图片描述 --------
def generate_caption(img_path: Path) -> str:
    try:
        raw_image = Image.open(img_path).convert('RGB')
        inputs = processor(images=raw_image, return_tensors="pt")
        out = model.generate(**inputs, max_new_tokens=20)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"[错误] 无法为 {img_path.name} 生成描述: {e}")
        return "error_caption"

# -------- 主函数：重命名并复制 --------
def caption_and_copy(input_dir: str, output_dir: str) -> None:
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}

    for img_file in tqdm(list(input_dir.glob("*.*"))):
        if img_file.suffix.lower() not in valid_extensions:
            print(f"[跳过] {img_file.name}: 不支持的文件格式")
            continue

        try:
            caption = generate_caption(img_file)
            caption_clean = valid_filename(caption)
            suffix = img_file.suffix.lower()
            dst_path = output_dir / f"{caption_clean}{suffix}"

            count = 1
            base_name = caption_clean
            while dst_path.exists():
                dst_path = output_dir / f"{base_name}_{count}{suffix}"
                count += 1

            shutil.copy2(img_file, dst_path)
            print(f"{img_file.name} → {dst_path.name} ({caption})")
        except Exception as e:
            print(f"[错误] 处理 {img_file.name} 时出错: {e}")

# -------- 启动入口 --------
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="使用 BLIP-2 模型为图片生成描述并复制")
    parser.add_argument("--input", required=True, help="包含图片的输入目录")
    parser.add_argument("--output", required=True, help="复制图片的输出目录")
    args = parser.parse_args()

    caption_and_copy(args.input, args.output)
```

