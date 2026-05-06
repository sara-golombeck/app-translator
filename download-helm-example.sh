#!/bin/bash

# Download Helm Example for Students
echo "📦 Downloading Helm Chart Exercise..."

# Create directories
mkdir -p helm-example/app-translator/templates

# Base URL
BASE="https://raw.githubusercontent.com/sara-golombeck/app-translator/kube/helm-example/app-translator"

# Download Chart.yaml
echo "⬇️  Downloading Chart.yaml..."
curl -s $BASE/Chart.yaml -o helm-example/app-translator/Chart.yaml

# Download values.yaml
echo "⬇️  Downloading values.yaml..."
curl -s $BASE/values.yaml -o helm-example/app-translator/values.yaml

# Download templates
echo "⬇️  Downloading templates..."
curl -s $BASE/templates/backend.yaml -o helm-example/app-translator/templates/backend.yaml
curl -s $BASE/templates/frontend.yaml -o helm-example/app-translator/templates/frontend.yaml
curl -s $BASE/templates/database.yaml -o helm-example/app-translator/templates/database.yaml
curl -s $BASE/templates/translator.yaml -o helm-example/app-translator/templates/translator.yaml
curl -s $BASE/templates/ingress.yaml -o helm-example/app-translator/templates/ingress.yaml

echo "✅ Download complete!"
echo ""
echo "📂 Files downloaded to: helm-example/"
echo ""
echo "🎯 Next steps:"
echo "   1. cd helm-example/app-translator"
echo "   2. nano values.yaml  (fill in the ???)"
echo "   3. helm lint ."
echo "   4. helm install app-translator ."
echo ""
echo "Good luck! 🚀"
