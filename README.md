# Deployment Guide

## Local Development (with hot reload)

Uses `docker-compose` with a volume mount and `nodemon` so changes are reflected instantly without rebuilding.

```bash
docker-compose up
```

Visit http://localhost:3000. Edit files locally — nodemon restarts the server automatically.

---

## Local Testing of Production Image

Test the production Docker image locally before deploying:

```bash
# Build (targets the production stage)
docker build --target production -t website-node .

# Run
docker run -p 3000:3000 website-node

# Test
curl http://localhost:3000
```

---

## Manual VM Deployment (Google Cloud) - Simple & Free

**Cost:** Free (e2-micro in free tier)
**IP:** Your VM will get a static IP you can point your domain to

### 1. Create the VM

```bash
# Create a small VM (e2-micro is free tier eligible)
gcloud compute instances create mateo-website \
  --zone=us-east1-c \
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
  --zone=us-east1-c \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

### 2. SSH into the VM and setup

```bash
# SSH into the VM
gcloud compute ssh mateo-website --zone=us-east1-c

# Install Docker
sudo apt update
sudo apt install -y docker.io git
sudo usermod -aG docker $USER
newgrp docker

# Clone your repo
git clone https://github.com/MateoVanDamme/website-node.git
cd website-node

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
gcloud compute ssh mateo-website --zone=us-east1-c

# Pull latest code
cd website-node
git pull

# Rebuild and restart
docker build -t website .
docker stop website-container
docker rm website-container
docker run -d -p 80:3000 --restart=always --name website-container website
```
