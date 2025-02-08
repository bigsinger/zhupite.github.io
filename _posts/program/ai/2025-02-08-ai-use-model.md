---
layout:		post
category:	"program"
title:		"使用AI模型"

tags:		[ai]
---
- Content
{:toc}


# 模型类型

AI 模型可以按照功能和应用领域进行分类，以下是 **完整的 AI 模型分类**，涵盖 **计算机视觉、自然语言处理、语音、推荐系统、生成模型、强化学习、医疗 AI、代码 AI、金融 AI、科学计算、网络安全等领域**。

------

## **1. 计算机视觉模型（Computer Vision, CV）** 👁️📷

这些模型用于 **图像识别、目标检测、图像分割、OCR（光学字符识别）等** 任务。

- **图像分类（Image Classification）**
  - 例子：ResNet、EfficientNet、ConvNeXt
  - 作用：识别图像的类别（如猫、狗、人）。
- **目标检测（Object Detection）**
  - 例子：YOLOv8、Faster R-CNN、OwlViT
  - 作用：在图像中检测并标注特定物体（如行人、车辆）。
- **图像分割（Image Segmentation）**
  - 例子：U-Net、DeepLabV3+、Segment Anything Model（SAM）
  - 作用：精确划分图像中的对象区域（如医学影像分析）。
- **光学字符识别（OCR, Optical Character Recognition）**
  - 例子：Tesseract OCR、EAST、PaddleOCR
  - 作用：将图片中的文字转换为可编辑文本。
- **图像生成（Image Generation）**
  - 例子：Stable Diffusion、DALL·E 3、Imagen
  - 作用：生成 AI 绘画、艺术风格转换。

------

## **2. 自然语言处理模型（Language Models, LLM）** 📖🗣️

这些模型用于 **文本理解、对话、翻译、摘要、情感分析** 等任务。

- **文本生成（Text Generation）**
  - 例子：GPT-4、Llama 2、Mistral 7B
  - 作用：自动生成高质量文本，如文章、代码。
- **机器翻译（Machine Translation）**
  - 例子：MarianMT、mBART、NLLB-200
  - 作用：自动翻译多种语言。
- **问答系统（Question Answering）**
  - 例子：BERT、T5、Gemini
  - 作用：从文本中提取答案，或回答用户问题。
- **情感分析（Sentiment Analysis）**
  - 例子：DistilBERT、RoBERTa
  - 作用：分析文本情感（正面/负面/中性）。
- **文档摘要（Text Summarization）**
  - 例子：BART、PEGASUS
  - 作用：自动提取文章或文档的核心内容。

------

## **3. 语音处理模型（Speech Processing）** 🎙️🔊

用于 **语音识别（ASR）、语音合成（TTS）、语音增强** 等任务。

- **语音识别（ASR, Automatic Speech Recognition）**
  - 例子：Whisper（OpenAI）、DeepSpeech、Wav2Vec 2.0
  - 作用：将语音转换为文本（语音转录）。
- **语音合成（TTS, Text-to-Speech）**
  - 例子：Tacotron 2、FastSpeech 2、XTTS
  - 作用：将文本转换为语音。
- **语音增强（Speech Enhancement）**
  - 例子：DeepFilterNet、Conv-TasNet
  - 作用：去除背景噪音，提高语音质量。

------

## **4. 推荐系统模型（Recommender Systems）** 🎯📺

用于 **个性化推荐电影、商品、新闻、音乐等**。

- **协同过滤（Collaborative Filtering）**
  - 例子：ALS、Matrix Factorization
  - 作用：基于用户行为推荐内容。
- **深度学习推荐模型（DL-based Recommenders）**
  - 例子：Wide & Deep、DeepFM、Transformer4Rec
  - 作用：结合深度学习进行精准推荐。

------

## **5. 生成模型（Generative Models）** 🎨🖌️

用于 **图像、文本、音乐、视频生成**。

- **生成对抗网络（GAN, Generative Adversarial Networks）**
  - 例子：StyleGAN、CycleGAN
  - 作用：图像生成、换脸、风格转换。
- **扩散模型（Diffusion Models）**
  - 例子：Stable Diffusion、Imagen、DALLE-3
  - 作用：高质量 AI 绘画、视频生成。
- **音乐生成（Music Generation）**
  - 例子：MusicLM、Jukebox
  - 作用：AI 生成旋律和音乐。

------

## **6. 强化学习与机器人模型（RL & Robotics）** 🎮🤖

用于 **自动驾驶、游戏 AI、机器人控制**。

- **强化学习（Reinforcement Learning, RL）**
  - 例子：AlphaZero、PPO、DQN
  - 作用：游戏 AI、自动驾驶。
- **机器人智能体（Robotics AI）**
  - 例子：Gato（DeepMind）、RT-2（Google）
  - 作用：机器人自主决策。

------

## **7. 医疗与生物 AI（Medical & Bioinformatics）** 🏥🧬

- **蛋白质结构预测（Protein Folding）**
  - 例子：AlphaFold、RoseTTAFold
  - 作用：药物研发、生物研究。
- **医学影像分析（Medical Imaging）**
  - 例子：UNet、CheXNet
  - 作用：X-ray、MRI 影像诊断。

------

## **8. 代码生成与编程 AI（Code AI）** 💻

- **代码生成（Code Generation）**
  - 例子：Codex（GPT-4 Turbo）、StarCoder
  - 作用：自动写代码，提高编程效率。
- **代码补全（Code Completion）**
  - 例子：GitHub Copilot、TabNine
  - 作用：智能补全代码。

------

## **9. 金融与风控 AI（Finance & Risk Management）** 💰

- **金融文本分析（Financial NLP）**
  - 例子：FinBERT、BloombergGPT
  - 作用：财经新闻分析、市场预测。
- **信用评分与欺诈检测（Risk & Fraud Detection）**
  - 例子：XGBoost、LightGBM
  - 作用：检测信用卡欺诈、金融风险评估。

------

## **10. 科学计算与物理模拟（Scientific Computing）** 🔬

- **天气与气候预测（Weather Prediction）**
  - 例子：GraphCast、FourCastNet
  - 作用：高精度天气预报。
- **量子计算 AI（Quantum Computing）**
  - 例子：QAOA、Quantum BERT
  - 作用：量子算法优化。

------

## **11. 网络安全 AI（Cybersecurity）** 🛡️

- **恶意软件检测（Malware Detection）**
  - 例子：MalBERT、DeepLocker
  - 作用：分析网络攻击行为。
- **入侵检测（Intrusion Detection Systems, IDS）**
  - 例子：HIDS、NIDS
  - 作用：检测异常网络流量，防止黑客攻击。

------

## **总结**

这份分类涵盖了 AI 模型的主要领域，每个类别都有其代表性模型，适用于不同的实际应用！



# 模型网站

- **通用AI模型**：适用于多种任务，如自然语言处理、计算机视觉等。
- **AI绘画与生成**：专注于AI绘画和图像生成，适合艺术创作和设计。
- **3D模型**：提供3D模型资源，适用于建筑、游戏开发、工业设计等。
- **其他垂类模型**：特定领域的模型资源，如AI绘画、3D模型等。





### **通用AI模型资源**

1. **Hugging Face**
   - **简介**：开源AI模型和数据集共享平台，涵盖自然语言处理（NLP）、计算机视觉（CV）等多个领域。
   - **网址**：[huggingface.co](https://huggingface.co/)
   - **特点**：提供丰富的预训练模型，支持多种任务和语言，社区活跃。
2. **ModelScope（魔搭社区）**
   - **简介**：阿里达摩院推出的AI模型社区，提供视觉、语音、NLP等领域的模型。
   - **网址**：[community.modelscope.cn](https://community.modelscope.cn/)
   - **特点**：支持多种模型格式，提供详细的使用指南，适合企业级应用。
3. **ChaosGPT**
   - **简介**：全球最全面的AI模型聚合网站，涵盖GPT、Llama、BERT等模型。
   - **网址**：[github.com/0a00/ChaosGPT](https://github.com/0a00/ChaosGPT)
   - **特点**：提供多种AI功能，包括文本、图像、视频生成等，适合研究和开发者。

### **AI绘画与生成模型**

1. **Tensor.Art**
   - **简介**：基于Stable Diffusion等技术的在线AI图像生成平台，支持模型共享和训练。
   - **网址**：[tensor.art](https://tensor.art/)
   - **特点**：提供Checkpoint、Embedding、ControlNet等多种模型类型，支持在线运行。
2. **吐司AI**
   - **简介**：AI绘画与模型创作社区，支持多种AI模型格式。
   - **网址**：[tusi.art](https://tusi.art/)
   - **特点**：支持LoRA技术、模型训练指导和插件扩展，适合个性化创作。
3. **LiblibAI（哩布哩布AI）**
   - **简介**：国内AI绘画模型分享社区，提供基于Stable Diffusion的资源。
   - **网址**：[liblibai.com](https://www.liblibai.com/)
   - **特点**：丰富的模型和图片灵感，支持多种风格创作。
4. **EverArt**
   - **简介**：AI绘画平台，支持根据用户上传的图片风格训练AI模型。
   - **网址**：[everart.ai](https://everart.ai/)
   - **特点**：支持多模型生成、姿势转换、图像放大等功能。

### **3D模型下载网站**

1. **Open3DModel**
   - **简介**：提供大量免费3D模型资源，支持多种文件格式。
   - **网址**：[open3dmodel.com/zh-CN/](https://open3dmodel.com/zh-CN/)
   - **特点**：涵盖建筑、室内装饰、动画、游戏等多种场景。
2. **GrabCAD**
   - **简介**：机械工程师的“GitHub”，提供大量3D模型资源。
   - **网址**：[grabcad.com](https://grabcad.com/)
   - **特点**：数据精准，适合机械设计和工程制造。
3. **PARTcommunity**

- **简介**：提供高质量的3D零件模型，由供应商上传。
- **网址**：[partcommunity.com](https://www.partcommunity.com/)
- **特点**：数据质量高，适合工业设计和制造业。

### **其他垂类模型资源**

1. **Civitai**

- **简介**：专注于AI绘画和Stable Diffusion模型的平台，提供海量底模和LoRA模型。
- **网址**：[civitai.com](https://civitai.com/)
- **特点**：社区活跃，支持免费注册、上传和下载。

1. **Civitai中国镜像**

- **简介**：Civitai的中国镜像网站，解决国内访问问题。
- **网址**：[civitai.work](https://civitai.work/)
- **特点**：资源与Civitai同步，适合国内用户。

1. **炼丹阁**

- **简介**：专业的AI绘画模型平台社区，提供丰富的资源。
- **网址**：[liandange.com](https://www.liandange.com/)
- **特点**：无需登录即可下载，适合多种风格创作。



# 模型开发与运行软件

AI 模型的开发、训练和运行需要 **专门的软件**，以下是一些常见的软件工具，涵盖 **本地运行、云端部署、开源框架、微调工具等**。

------

## **1. 本地 AI 模型运行工具** 🖥️

这些工具可以 **在个人电脑上直接运行 AI 模型**，适合 **LLM（大语言模型）、计算机视觉、音频 AI 等**。

- **Ollama**
  - 网址：https://ollama.com/
  - 作用：本地运行 AI 模型，支持 Llama 2、Mistral、Gemma、CodeLlama 等。
  - 适用系统：Windows / macOS / Linux
- **LM Studio**
  - 网址：https://lmstudio.ai/
  - 作用：支持本地部署 LLM，提供 GUI 界面，适用于 Mistral、Llama 等模型。
  - 适用系统：Windows / macOS
- **GPT4All**
  - 网址：https://gpt4all.io/
  - 作用：本地运行 LLM，支持 QLoRA、Mistral、Llama2、CodeLlama 等。
  - 适用系统：Windows / macOS / Linux
- **Text Generation WebUI**
  - 网址：https://github.com/oobabooga/text-generation-webui
  - 作用：支持运行和微调 LLM，如 Llama 2、GPT-J，提供 Web 界面。
  - 适用系统：Windows / Linux
- **KoboldAI**
  - 网址：https://github.com/KoboldAI/KoboldAI-Client
  - 作用：用于本地运行文本生成 AI，支持 AI 角色扮演、写作等任务。
  - 适用系统：Windows / Linux

------

## **2. 云端 AI 开发与训练平台** ☁️

这些平台提供 **AI 模型的在线训练、推理和微调**，适用于企业和开发者。

- **Hugging Face Spaces**
  - 网址：https://huggingface.co/spaces
  - 作用：在线运行 LLM、CV 模型，支持 Gradio / Streamlit 部署。
- **Google Vertex AI**
  - 网址：https://cloud.google.com/vertex-ai
  - 作用：谷歌云 AI 平台，支持大模型微调和 API 访问。
- **OpenAI API**
  - 网址：https://platform.openai.com/
  - 作用：在线使用 GPT-4、DALL·E 3、Whisper 等模型。
- **Replicate**
  - 网址：https://replicate.com/
  - 作用：在线运行 AI 模型（如 SD、Llama 2），提供 API 调用。
- **ModelScope 魔搭**（阿里巴巴）
  - 网址：https://modelscope.cn/
  - 作用：支持在线运行、微调 AI 模型（视觉、语音、NLP）。
- **DeepInfra**
  - 网址：https://deepinfra.com/
  - 作用：低成本 API 访问 LLM，如 Llama 2、Mixtral。

------

## **3. 深度学习框架（训练 & 开发）** 🏗️

这些是 **AI 模型的基础框架**，适用于 **训练、微调、推理**。

- **PyTorch**
  - 网址：https://pytorch.org/
  - 作用：Facebook 研发，灵活、易用，适用于 LLM、CV、RL。
- **TensorFlow**
  - 网址：https://www.tensorflow.org/
  - 作用：Google 研发，适用于大规模 AI 训练和部署。
- **JAX**
  - 网址：https://jax.readthedocs.io/en/latest/
  - 作用：Google 研发，适用于高效并行计算，AI 研究常用。
- **MindSpore**（华为）
  - 网址：https://www.mindspore.cn/
  - 作用：华为推出的深度学习框架，支持 AI 训练和部署。

------

## **4. AI 模型微调 & 量化工具** 🔧

这些工具用于 **微调 LLM（如 LoRA、QLoRA）或降低计算成本（如 量化 4-bit、8-bit）**。

- **PEFT（Parameter Efficient Fine-Tuning）**
  - 网址：https://github.com/huggingface/peft
  - 作用：微调大模型，支持 LoRA / QLoRA。
- **AutoGPTQ**
  - 网址：https://github.com/PanQiWei/AutoGPTQ
  - 作用：量化 LLM，减少显存占用（4-bit / 8-bit）。
- **llama.cpp**
  - 网址：https://github.com/ggerganov/llama.cpp
  - 作用：轻量化运行 LLM，无需 GPU，支持 CPU 推理。
- **bitsandbytes**
  - 网址：https://github.com/TimDettmers/bitsandbytes
  - 作用：高效量化 AI 模型（支持 4-bit 训练）。

------

## **5. AI 可视化与分析工具** 📊

这些工具用于 **模型监控、训练过程分析**。

- **Weights & Biases**（W&B）
  - 网址：https://wandb.ai/
  - 作用：跟踪 AI 训练过程，适用于 PyTorch / TensorFlow。
- **TensorBoard**
  - 网址：https://www.tensorflow.org/tensorboard
  - 作用：可视化 AI 训练日志。

------

## **总结**

不同的软件适用于不同 AI 任务：

| 软件类型          | 代表软件                | 适用任务          |
| ----------------- | ----------------------- | ----------------- |
| **本地运行**      | Ollama、LM Studio       | 运行 LLM、CV 模型 |
| **云端 AI**       | Hugging Face、Vertex AI | 在线部署 & 训练   |
| **深度学习框架**  | PyTorch、TensorFlow     | AI 训练 & 开发    |
| **微调 & 量化**   | PEFT、llama.cpp         | LLM 微调 & 量化   |
| **可视化 & 监控** | W&B、TensorBoard        | 训练分析 & 监控   |

如果你是开发者，可以选择 PyTorch + Ollama 进行本地运行；
如果你要部署在线应用，可以使用 Hugging Face 或 Google Vertex AI。

# Python

这里使用`google/owlvit-base-patch32`模型（计算机视觉模型）做一个简单的物体识别。这个模型通常用于 PyTorch 或 TensorFlow，并不是一个典型的 **LLM（大语言模型）**，因此在 **LM Studio** 或 **Ollama** 这样主要用于 **文本生成** 的平台上，不能直接运行。

参考：[huggingface模型下载最全指南_huggingface下载模型](https://blog.csdn.net/qq_40734883/article/details/143922095) 注册 [huggingface](https://huggingface.co/)并申请token，然后命令行下载模型到本地：

```bash
export HF_ENDPOINT=https://hf-mirror.com
huggingface-cli download --resume-download google/owlvit-base-patch32 --local-dir 保存模型的本地路径 --local-dir-use-symlinks False --resume-download --token 申请的huggingface的token
```

这里把模型下载到了本地`E:\models\shibie`目录下。

该模型的[官方示例代码](https://huggingface.co/google/owlvit-base-patch32)（[国内镜像](https://hf-mirror.com/google/owlvit-base-patch32)）：

```python
import requests
from PIL import Image
import torch

from transformers import OwlViTProcessor, OwlViTForObjectDetection

processor = OwlViTProcessor.from_pretrained("google/owlvit-base-patch32")
model = OwlViTForObjectDetection.from_pretrained("google/owlvit-base-patch32")

url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)
texts = [["a photo of a cat", "a photo of a dog"]]
inputs = processor(text=texts, images=image, return_tensors="pt")
outputs = model(**inputs)

# Target image sizes (height, width) to rescale box predictions [batch_size, 2]
target_sizes = torch.Tensor([image.size[::-1]])
# Convert outputs (bounding boxes and class logits) to COCO API
results = processor.post_process_object_detection(outputs=outputs, threshold=0.1, target_sizes=target_sizes)

i = 0  # Retrieve predictions for the first image for the corresponding text queries
text = texts[i]
boxes, scores, labels = results[i]["boxes"], results[i]["scores"], results[i]["labels"]

# Print detected objects and rescaled box coordinates
for box, score, label in zip(boxes, scores, labels):
    box = [round(i, 2) for i in box.tolist()]
    print(f"Detected {text[label]} with confidence {round(score.item(), 3)} at location {box}")
```

需要安装库：

```
pip install transformers torch pillow requests
```

代码稍作修改下：

- 将模型的路径修改为刚刚模型的下载路径：`E:\models\shibie`
- 讲识别出的坐标在图片上绘制红色矩形并重新保存为图片
- 打印输出耗时

```python
import requests
from PIL import Image, ImageDraw
import torch
import time

from transformers import OwlViTProcessor, OwlViTForObjectDetection

# 指定本地模型路径
model_path = "E:\\models\\shibie"

# 加载预训练模型和处理器
processor = OwlViTProcessor.from_pretrained(model_path)
model = OwlViTForObjectDetection.from_pretrained(model_path)

url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)
texts = [["a photo of a cat", "a photo of a dog"]]
inputs = processor(text=texts, images=image, return_tensors="pt")

# 开始计时
start_time = time.time()

# 进行目标检测
outputs = model(**inputs)

# Target image sizes (height, width) to rescale box predictions [batch_size, 2]
target_sizes = torch.Tensor([image.size[::-1]])
# Convert outputs (bounding boxes and class logits) to COCO API
results = processor.post_process_object_detection(outputs=outputs, threshold=0.1, target_sizes=target_sizes)

# 结束计时
end_time = time.time()
elapsed_time = end_time - start_time  # 计算耗时


i = 0  # Retrieve predictions for the first image for the corresponding text queries
text = texts[i]
boxes, scores, labels = results[i]["boxes"], results[i]["scores"], results[i]["labels"]

# Print detected objects and rescaled box coordinates
for box, score, label in zip(boxes, scores, labels):
    box = [round(i, 2) for i in box.tolist()]
    print(f"Detected {text[label]} with confidence {round(score.item(), 3)} at location {box}")
    
    # 绘制矩形
    draw = ImageDraw.Draw(image)
    draw.rectangle(box, outline="red", width=2)  # 绘制红色矩形
    
# 保存新的图片
output_image_path = "detected_image.jpg"  # 输出图片的路径
image.save(output_image_path)
print(f"Saved detected image to {output_image_path}")

# 输出耗时
print(f"Detection took {elapsed_time:.2f} seconds.")
```

输出：

```
Detected a photo of a cat with confidence 0.707 at location [324.97, 20.44, 640.58, 373.29]
Detected a photo of a cat with confidence 0.717 at location [1.46, 55.26, 315.55, 472.17]
Saved detected image to detected_image.jpg
```



# LM Studio

[LM Studio](https://lmstudio.ai/)，主要是用于 **本地运行 LLM（大语言模型）**（如 Llama、Mistral、GPTQ 量化模型等），它 **不支持** 计算机视觉模型（如 `OwlViT`），因为 `OwlViT` 需要处理 **图像输入**，但 LM Studio 仅支持 **文本输入/输出**。

LMStudio 的模型下载地址为 Hugging Face 平台，修改镜像：

- \resources\app\.webpack\renderer\main_window.js
- \resources\app\.webpack\main\index.js

```
https://huggingface.co/

https://hf-mirror.com/
```

# Ollama
