# Deployment Guide

## Manual VM Deployment (Google Cloud) - Simple & Free

**Cost:** Free (e2-micro in free tier)
**IP:** Your VM will get a static IP you can point your domain to

### 1. Create the VM

```bash
# Create a small VM (e2-micro is free tier eligible)
gcloud compute instances create mateo-website \
  --zone=europe-west1-b \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server

# Allow HTTP/HTTPS traffic
gcloud compute firewall-rules create allow-http \
  --allow tcp:80,tcp:443 \
  --target-tags http-server

# Get your public IP
gcloud compute instances describe mateo-website \
  --zone=europe-west1-b \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### 2. SSH into the VM and setup

```bash
# SSH into the VM
gcloud compute ssh mateo-website --zone=europe-west1-b

# Install Docker
sudo apt update
sudo apt install -y docker.io git
sudo usermod -aG docker $USER
newgrp docker

# Clone your repo
git clone https://github.com/MateoVanDamme/website-node.git
cd website-node

# Create Dockerfile if not in repo
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Build and run
docker build -t website .
docker run -d -p 80:3000 --restart=always --name website-container website

# Check it's running
docker ps
curl http://localhost
```

### 3. Point your domain to the VM

In Cloudflare DNS:
- Add an **A record**
- Name: `@` (or `www`)
- Content: Your VM's IP address (from step 1)
- Proxy: On (orange cloud for DDoS protection)

### 4. Update the site (when you make changes)

```bash
# SSH back into VM
gcloud compute ssh mateo-website --zone=europe-west1-b

# Pull latest code
cd website-node
git pull

# Rebuild and restart
docker build -t website .
docker stop website-container
docker rm website-container
docker run -d -p 80:3000 --restart=always --name website-container website
```

### 5. Optional: Add HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update docker run to use certificates
# (requires nginx reverse proxy - ask Claude if needed)
```

---

## Azure Container Apps (Serverless)

### Prerequisites
- Azure account with subscription
- Docker installed locally (you have this)
- Azure CLI installed

### Install Azure CLI (if needed)
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Deploy to Azure Container Apps

1. **Login to Azure:**
```bash
az login
```

2. **Set variables:**
```bash
RESOURCE_GROUP="personal-website-rg"
LOCATION="westeurope"  # or eastus, northeurope, etc.
APP_NAME="mateo-website"  # must be globally unique
```

3. **Create resource group:**
```bash
az group create --name $RESOURCE_GROUP --location $LOCATION
```

4. **Deploy directly from source (easiest):**
```bash
az containerapp up \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --source . \
  --ingress external \
  --target-port 3000
```

That's it! Azure builds your Docker image and deploys it.

5. **Get your URL:**
```bash
az containerapp show \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### Cost
- Pay-per-use: ~$0.000024/second when active
- Scales to zero when not in use
- First 180,000 vCPU-seconds free per month
- Likely **free or <$5/month** for personal site

---

## Alternative: Azure App Service (Traditional PaaS)

If you want the more "classic" Azure App Engine-style deployment:

```bash
# Create App Service Plan
az appservice plan create \
  --name myAppServicePlan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan myAppServicePlan \
  --name $APP_NAME \
  --deployment-container-image-name node:20-alpine

# Deploy from local directory
az webapp up \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --runtime "NODE:20-lts"
```

**Cost:** ~$13/month (B1 tier), or use F1 (free tier with limitations)

---

## GitHub Actions (CI/CD) - Optional

Once deployed, you can set up auto-deployment:

1. In Azure Portal, go to your Container App
2. Navigate to "Continuous Deployment"
3. Connect to your GitHub repo
4. Azure auto-generates a workflow file

Or manually create `.github/workflows/azure-deploy.yml` (I can create this if you want)

---

## Local Testing

Test the Docker image locally first:

```bash
# Build
docker build -t website-node .

# Run
docker run -p 3000:3000 website-node

# Test
curl http://localhost:3000
```

---

## Cleanup (when done)

```bash
# Delete everything
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

---

## Google Cloud Run (Serverless - One Command)

**Cost:** Free tier (2M requests/month), then ~$0.00002 per request
**Auto-scales to zero** when not in use

```bash
# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Deploy (builds and deploys in one command)
gcloud run deploy mateo-website \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 3000

# Get your URL
gcloud run services describe mateo-website \
  --region europe-west1 \
  --format='value(status.url)'
```

Then point your Cloudflare domain to the Cloud Run URL using a CNAME record.

**Note:** Requires billing to be enabled on your GCP project.

---

## Migration Path (No Lock-in)

Since this is just a Docker container, you can move to:
- **GCP Cloud Run:** `gcloud run deploy --source .`
- **GCP Compute Engine VM:** (see manual VM deployment above)
- **Azure Container Apps:** See Azure section
- **AWS ECS/Fargate:** Push to ECR, deploy via ECS
- **Fly.io:** `fly launch` (reads Dockerfile automatically)
- **Any VPS:** `docker pull && docker run`

Your container image is portable - deploy anywhere!
