# Deploy scripts

Single-VM continuous deploy for the live public scaffold.

## Files

| File | Where it runs | Purpose |
|---|---|---|
| `launch.sh` | target VM | Starts/restarts the mock server and all 5 archetypes via `nohup`. |
| `server-deploy.sh` | target VM | Fetches a git ref as a tarball, replaces `~/scaffold` (preserving `.env`), `npm install`, then runs `launch.sh` and health-checks. |
| `../../.github/workflows/deploy.yml` | GitHub Actions | On push to `master` (canonical repo only), SSH into the VM and pipe `server-deploy.sh` into `bash -s`. |

## How a push becomes a deploy

```
git push origin master
        │
        ▼
GitHub Actions: .github/workflows/deploy.yml
        │ checks out repo at <sha>
        │ writes deploy key from secrets.DEPLOY_SSH_KEY
        │ ssh -i key user@host "REF='<sha>' bash -s" < scripts/deploy/server-deploy.sh
        ▼
VM (faisalfirdani01@35.192.185.103):
        bash receives the script on stdin (so no on-disk dependency)
        │ tar-fetches https://github.com/.../archive/<sha>.tar.gz
        │ swaps ~/scaffold (keeps .env, keeps 3 backups)
        │ npm install
        │ bash scripts/deploy/launch.sh   ← kills prior tsx + respawns 6 services
        │ curl /health on 5599, 8080-8084
        ▼
exit 0 = green check on the PR/commit
```

## First-time server setup (already done; documented for fork users)

1. Provision a small linux VM with HTTP egress.
2. SSH in as a user with passwordless sudo not required (everything runs in `$HOME`).
3. Install Node 20 (official tarball — no curl-pipe-bash needed):
   ```bash
   cd ~
   curl -fsSLO https://nodejs.org/dist/v20.18.1/node-v20.18.1-linux-x64.tar.xz
   tar -xf node-v20.18.1-linux-x64.tar.xz
   mkdir -p ~/bin
   ln -sf ~/node-v20.18.1-linux-x64/bin/{node,npm,npx} ~/bin/
   echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
   ```
4. Bootstrap the scaffold once (subsequent updates come from CI):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/zexoverz/grid-workshop-scaffold/master/scripts/deploy/server-deploy.sh \
     | REF=master bash
   ```
5. Open firewall ports `8080-8084` (the mock port 5599 is bound to loopback only). For GCP:
   ```bash
   gcloud compute firewall-rules create workshop-archetypes-8080-8084 \
     --network=default --direction=INGRESS --action=ALLOW \
     --rules=tcp:8080-8084 --source-ranges=0.0.0.0/0 \
     --target-tags=workshop-archetypes
   gcloud compute instances add-tags <vm-name> --zone=<zone> --tags=workshop-archetypes
   ```
6. Edit `~/scaffold/.env` and set `LLM_API_KEY=sk-…` (only archetype D works without it).

## GitHub repo secrets

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | The private half of an ed25519 keypair whose public half is in `~/.ssh/authorized_keys` on the VM. |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -t ed25519,rsa,ecdsa <host>` output for the VM. |
| `DEPLOY_SSH_USER` | SSH login user on the VM (e.g. `faisalfirdani01`). |
| `DEPLOY_SSH_HOST` | VM hostname or public IP (e.g. `35.192.185.103`). |

Generate a deploy key locally and install it:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/scaffold_deploy -N "" -C "github-actions-deploy@scaffold"
ssh-copy-id -i ~/.ssh/scaffold_deploy.pub <user>@<host>

gh secret set DEPLOY_SSH_KEY      < ~/.ssh/scaffold_deploy
gh secret set DEPLOY_KNOWN_HOSTS -b "$(ssh-keyscan -t ed25519,rsa,ecdsa <host>)"
gh secret set DEPLOY_SSH_USER    -b "<user>"
gh secret set DEPLOY_SSH_HOST    -b "<host>"
```

## Operating

Trigger a deploy manually:
```bash
gh workflow run deploy.yml --ref master
gh run watch  # follow the latest run
```

Check the most recent deploy log on the VM:
```bash
ssh <user>@<host> 'ls -t ~/scaffold/logs/deploy-*.log | head -1 | xargs tail -50'
```

Roll back (the previous version is kept in `~/scaffold.bak.<ts>`):
```bash
ssh <user>@<host> 'cd $HOME && bak=$(ls -dt scaffold.bak.* | head -1) && mv scaffold scaffold.failed.$(date +%s) && mv "$bak" scaffold && bash scaffold/scripts/deploy/launch.sh'
```
