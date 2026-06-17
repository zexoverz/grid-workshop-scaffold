# Setup From Zero — Get Your Laptop Ready

**New to coding tools?** Start here. This guide gets a blank laptop ready for the
workshop: a GitHub account, Git, Node.js, the CodeBuddy IDE, and the workshop
code downloaded. No prior experience assumed. Budget ~20–30 minutes.

When you finish, continue with [`getting-started.md`](./getting-started.md).

> Throughout this guide, **"terminal"** means: Windows → **Git Bash** (installed
> in step 2) or **PowerShell**; macOS → **Terminal** app; Linux → your terminal.

**Checklist** — you'll tick all of these:

- [ ] GitHub account created
- [ ] Git installed
- [ ] Node.js 20 installed
- [ ] CodeBuddy IDE installed (or VS Code on Linux)
- [ ] Workshop code downloaded

---

## 1 · Create a GitHub account

GitHub stores the workshop code and is how you log in to several tools.

1. Go to **https://github.com/signup**.
2. Enter your email, pick a password and a username.
3. Verify your email (check your inbox for the code).

That's it — you don't need to know Git yet. Keep the username/password handy;
you'll use "Sign in with GitHub" later.

---

## 2 · Install Git

Git is the tool that downloads (and later updates) the workshop code.

| OS | How |
|---|---|
| **Windows** | Download **Git for Windows** from https://git-scm.com/download/win — run the installer and click **Next** through every screen (the defaults are fine). This also gives you **Git Bash**, the terminal you'll use. |
| **macOS** | Open the **Terminal** app and run `xcode-select --install` → click **Install**. (Or, if you use Homebrew: `brew install git`.) |
| **Linux** | Debian/Ubuntu: `sudo apt update && sudo apt install -y git` · Fedora: `sudo dnf install -y git` · Arch: `sudo pacman -S git` |

**Verify** — open a terminal and run:

```bash
git --version
# git version 2.x.x
```

**First-time setup** (so your work is labelled with your name) — run once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 3 · Install Node.js 20

The archetypes run on Node.js. The workshop needs **version 20 or newer**.

| OS | How |
|---|---|
| **Windows** | Download the **LTS** installer (`.msi`) from https://nodejs.org → run it, click **Next** through the wizard. |
| **macOS** | Download the **LTS** installer (`.pkg`) from https://nodejs.org → run it. (Or Homebrew: `brew install node@20`.) |
| **Linux** | Debian/Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo bash - && sudo apt install -y nodejs` · Fedora: `sudo dnf install -y nodejs` |

**Verify** — in a terminal:

```bash
node --version      # v20.x.x  (or higher)
npm --version       # 10.x.x
```

> If `node --version` shows v18 or lower, install the LTS from nodejs.org again
> and reopen the terminal.

---

## 4 · Install the CodeBuddy IDE

The **CodeBuddy IDE** is the editor you'll use to vibe-code your archetype's
persona. It's an AI-powered code editor from Tencent.

### Windows & macOS

1. Go to **https://www.codebuddy.ai/ide**.
2. Download the installer **for your system**:
   - **Windows** → the `.exe` installer.
   - **macOS** → choose **Apple Silicon** (M1/M2/M3/M4) or **Intel** — if unsure,
     click the Apple menu →  **About This Mac** and read the "Chip" line.
3. Install:
   - **Windows** — run the `.exe`, accept the user-only install prompt, tick
     **"I accept this agreement"**, pick a folder, finish the wizard.
   - **macOS** — open the `.dmg` and **drag CodeBuddy into Applications**.
4. Launch CodeBuddy IDE, click **Login**, and authenticate with **GitHub**
   (the account from step 1), Google, or email.

Update later via **Account menu → Check for Updates**.

### Linux

> Heads-up: the standalone CodeBuddy IDE is **Windows/macOS only** right now.
> On Linux, use one of these instead — both give you the same CodeBuddy AI help:
>
> - **VS Code + CodeBuddy extension** — install VS Code
>   (https://code.visualstudio.com/Download), open the Extensions panel
>   (`Ctrl+Shift+X`), search **"CodeBuddy"**, click Install, then sign in.
> - **CodeBuddy CLI** — the terminal tool in step 5 (works great on Linux).

---

## 5 · (Optional) Install the CodeBuddy CLI

If you'd rather drive CodeBuddy from the terminal (like Claude Code or Cursor),
the scaffold's main guide already has the full walkthrough:
[`getting-started.md` §7](./getting-started.md#7--install-the-codebuddy-cli-recommended-for-editing).
You can skip this and come back to it later.

---

## 6 · Download the workshop code

In a terminal, go to where you keep projects (e.g. your Desktop) and clone the repo:

```bash
cd ~/Desktop                                   # Windows Git Bash: cd ~/Desktop works too
git clone https://github.com/zexoverz/grid-workshop-scaffold.git
cd grid-workshop-scaffold
```

**Verify** you're in the right place:

```bash
ls
# you should see: archetypes  docs  mocks  scripts  shared  package.json  README.md ...
```

> Prefer clicking over typing? In the CodeBuddy IDE / VS Code, use
> **File → Clone Repository**, paste
> `https://github.com/zexoverz/grid-workshop-scaffold.git`, and pick a folder.

---

## You're ready

Everything is installed and the code is on your laptop. Open the
`grid-workshop-scaffold` folder in the CodeBuddy IDE, then follow
[`getting-started.md`](./getting-started.md) from **§1 · Install** — it picks up
exactly where this leaves off (`npm install`, configure `.env`, run an archetype).

### Stuck?

| Problem | Fix |
|---|---|
| `git: command not found` | Git didn't install or the terminal is stale. Reopen the terminal (Windows: use **Git Bash**), redo step 2. |
| `node: command not found` | Reopen the terminal after installing Node. Still missing → reinstall the LTS from https://nodejs.org. |
| `node --version` shows v18 or lower | Install the **LTS** (20+) from https://nodejs.org and reopen the terminal. |
| CodeBuddy IDE won't download on Linux | Expected — it's Windows/macOS only. Use VS Code + the CodeBuddy extension (step 4, Linux). |
| `git clone` asks for a password | Use the `https://…` URL shown above (not SSH); it shouldn't prompt for a public repo. Re-copy the command. |
