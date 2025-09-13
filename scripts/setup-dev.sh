#!/bin/bash

echo "🚀 Setting up tourista for development..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build once to ensure dist exists
echo "🔨 Building library..."
pnpm run build

# Link globally
echo "🔗 Creating global link..."
pnpm link --global

echo ""
echo "✅ Setup complete! Starting watch mode..."
echo ""
echo "👉 In your app: pnpm link tourista --global"
echo ""

# Start watch mode
pnpm run dev