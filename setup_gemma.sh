#!/bin/bash
set -e

# Setup huggingface hub
export HF_HUB_ENABLE_HF_TRANSFER=1

echo "Cloning llama.cpp..."
if [ ! -d "llama.cpp" ]; then
    git clone https://github.com/ggml-org/llama.cpp
fi

echo "Building llama.cpp for MacOS (Metal GPU support)..."
cmake llama.cpp -B llama.cpp/build -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=OFF
cmake --build llama.cpp/build --config Release -j --clean-first --target llama-cli llama-mtmd-cli llama-server llama-gguf-split
cp llama.cpp/build/bin/llama-* llama.cpp/

echo "Downloading Gemma-4-E4B model..."
# Using the recommended 'hf' tool
hf download unsloth/gemma-4-E4B-it-GGUF --local-dir unsloth/gemma-4-E4B-it-GGUF --include "*Q8_0*"

echo "Setup complete! You can start the server with:"
echo "./llama.cpp/llama-server --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf --port 8001 --reasoning on"
