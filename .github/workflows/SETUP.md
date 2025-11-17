# GitHub Actions Deployment Setup (SSH Method)

This guide walks you through setting up automatic deployment using direct SSH access.

## Step 1: Generate SSH Key Pair

On your local machine:

```bash
# Generate a new SSH key specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions-deploy

# This creates:
# - Private key: ~/.ssh/github-actions-deploy
# - Public key: ~/.ssh/github-actions-deploy.pub
```

## Step 2: Add Public Key to VM

```bash
# Copy the public key
cat ~/.ssh/github-actions-deploy.pub

# SSH into your VM
gcloud compute ssh mateo-website --zone=europe-west1-b

# On the VM, add the public key to authorized_keys
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Add Secrets to GitHub

Go to your GitHub repo: https://github.com/MateoVanDamme/website-node

Click **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these three secrets:

1. **VM_HOST**
   - Value: `34.79.56.163`

2. **VM_USER**
   - Value: `mateovandamme1` (your username on the VM)

3. **VM_SSH_KEY**
   - Value: Copy the **entire contents** of the private key:
   ```bash
   cat ~/.ssh/github-actions-deploy
   ```
   - Include the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines

## Step 4: Test the Workflow

1. Make a small change to your code (add a comment, change text, etc.)
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Test automatic deployment"
   git push origin main
   ```
3. Go to GitHub → **Actions** tab
4. Watch the deployment run!

## Troubleshooting

**If the workflow fails with SSH connection errors:**

Make sure the public key was properly added to `~/.ssh/authorized_keys` on the VM:

```bash
# SSH into VM
gcloud compute ssh mateo-website --zone=europe-west1-b

# Check if the key is there
cat ~/.ssh/authorized_keys

# Fix permissions if needed
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**If it fails with "Host key verification failed":**

GitHub Actions doesn't know your VM's host key. The `appleboy/ssh-action` handles this automatically by default.

**If Docker commands fail:**

Make sure the user is in the docker group:
```bash
sudo usermod -aG docker $USER
```

**To view logs:**
- GitHub Actions tab shows real-time logs
- Check your VM: `docker logs website-container`

## Security Note

The SSH private key (`VM_SSH_KEY`) is stored securely in GitHub Secrets. Never commit this key to your repository!

Delete the local copy after adding to GitHub:
```bash
rm ~/.ssh/github-actions-deploy
```
