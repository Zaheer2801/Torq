#!/bin/bash

# Configuration file path
SETTINGS_FILE="$HOME/.claude/settings.json"

# Create the directory if it doesn't exist
mkdir -p "$HOME/.claude"

# Ensure the file exists with basic structure if it is missing
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "{ \"env\": {}, \"model\": \"\", \"smallModel\": \"\" }" > "$SETTINGS_FILE"
fi

if [ "$1" == "free" ]; then
    echo "Switching to Free/Fast Mode..."
    python3 -c "
import json
import sys

path = '$SETTINGS_FILE'
try:
    with open(path, 'r') as f:
        data = json.load(f)
except Exception:
    data = {}

if 'env' not in data:
    data['env'] = {}

data['env']['ANTHROPIC_BASE_URL'] = 'https://openrouter.ai/api/v1'
# If you don't have your key in there yet, add a placeholder or keep existing
if 'ANTHROPIC_API_KEY' not in data['env']:
    data['env']['ANTHROPIC_API_KEY'] = 'sk-or-v1-YOUR_OPENROUTER_KEY'

data['model'] = 'meta-llama/llama-3.3-70b-instruct:free'
data['smallModel'] = 'google/gemini-2.0-flash-exp:free'

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
"
    echo "Mode set to Free/Fast (Llama 3.3 70B & Gemini 2.0 Flash Exp)."
    echo "Run 'claude /status' to verify."

elif [ "$1" == "paid" ]; then
    echo "Switching to Paid/High Accuracy Mode..."
    python3 -c "
import json
import sys

path = '$SETTINGS_FILE'
try:
    with open(path, 'r') as f:
        data = json.load(f)
except Exception:
    data = {}

if 'env' not in data:
    data['env'] = {}

data['env']['ANTHROPIC_BASE_URL'] = 'https://openrouter.ai/api/v1'
if 'ANTHROPIC_API_KEY' not in data['env']:
    data['env']['ANTHROPIC_API_KEY'] = 'sk-or-v1-YOUR_OPENROUTER_KEY'

data['model'] = 'anthropic/claude-3-opus'
data['smallModel'] = 'anthropic/claude-3-haiku'

with open(path, 'w') as f:
    json.dump(data, f, indent=2)
"
    echo "Mode set to Paid/High Accuracy (Claude Opus & Haiku)."
    echo "Run 'claude /status' to verify."

else
    echo "Usage: ./claude_switcher.sh [free|paid]"
    echo ""
    echo "Available modes:"
    echo "  free  : Switch to OpenRouter free models (Llama 3.3 70B & Gemini 2.0 Flash Exp)"
    echo "  paid  : Switch to OpenRouter paid models (Claude Opus & Haiku)"
    echo ""
    echo "Current Configuration:"
    cat "$SETTINGS_FILE" | grep -E '\"model\"|\"smallModel\"' || echo "  Not yet configured."
fi
