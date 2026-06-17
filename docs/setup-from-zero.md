# Setup From Zero — Get Your Laptop Ready

**New to coding tools?** Start here. This guide gets a blank laptop ready for the
workshop: a GitHub account, Git, Node.js, the CodeBuddy IDE, and your own copy of
the workshop code. No prior experience assumed. Budget ~20–30 minutes.

In this workshop you'll **fork** the repo (make your own copy on GitHub), work on
it locally, and **push** your changes back to *your* fork — so this guide also
connects Git to your GitHub account so pushing works.

When you finish, continue with [`getting-started.md`](./getting-started.md).

> Throughout this guide, **"terminal"** means: Windows → **Git Bash** (installed
> in step 2) or **PowerShell**; macOS → **Terminal** app; Linux → your terminal.

**Checklist** — you'll tick all of these:

- [ ] GitHub account created
- [ ] Git installed
- [ ] Node.js 20 installed
- [ ] CodeBuddy IDE installed (or VS Code — see §4)
- [ ] Repo **forked** to your GitHub account
- [ ] Your fork **cloned** to your laptop
- [ ] Git **signed in** to GitHub (so `git push` works)

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

> **Prefer VS Code?** It works just as well for this workshop — install VS Code
> and add the CodeBuddy extension for the same AI help. Jump to
> [**§4b · (Optional) Use VS Code instead**](#4b--optional-use-vs-code-instead).
> On **Linux**, VS Code is the recommended path (the standalone IDE is
> Windows/macOS only).

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
> - **VS Code + CodeBuddy extension** — see
>   [**§4b**](#4b--optional-use-vs-code-instead) below for install steps.
> - **CodeBuddy CLI** — the terminal tool in step 5 (works great on Linux).

---

## 4b · (Optional) Use VS Code instead

Rather use **VS Code**? It's a free, popular editor from Microsoft, and with the
CodeBuddy extension it gives you the same AI help inside the workshop. This is
also the **recommended path on Linux**.

### Install VS Code

| OS | How |
|---|---|
| **Windows** | Download from https://code.visualstudio.com/Download → run the `.exe` (the "User Installer" is fine) and click **Next** through the wizard. |
| **macOS** | Download from https://code.visualstudio.com/Download → open the `.zip` and **drag Visual Studio Code into Applications**. |
| **Linux** | Debian/Ubuntu: download the `.deb` from https://code.visualstudio.com/Download → `sudo apt install ./code_*.deb` · Fedora: install the `.rpm` → `sudo dnf install ./code-*.rpm` · Arch: `yay -S visual-studio-code-bin` |

### Add the CodeBuddy extension

1. Launch VS Code.
2. Open the **Extensions** panel — click the squares icon in the left bar, or
   press `Ctrl+Shift+X` (macOS: `Cmd+Shift+X`).
3. Search **"CodeBuddy"**, click **Install** on the official extension.
4. Click the **CodeBuddy** icon in the left bar and **sign in** with GitHub (the
   account from step 1), Google, or email.

That's it — everywhere this guide says "CodeBuddy IDE", you can use VS Code instead.

---

## 5 · (Optional) Install the CodeBuddy CLI

If you'd rather drive CodeBuddy from the terminal (like Claude Code or Cursor),
the scaffold's main guide already has the full walkthrough:
[`getting-started.md` §7](./getting-started.md#7--install-the-codebuddy-cli-recommended-for-editing).
You can skip this and come back to it later.

---

## 6 · Fork the workshop repo (Optional)

A **fork** is your own copy of the repo under your GitHub account. You'll make
your changes there and push to it — you don't need write access to the original.

Do this in your **web browser**:

1. **Sign in to GitHub** (the account from step 1) at https://github.com/login.
2. Open the workshop repo:
   **https://github.com/zexoverz/grid-workshop-scaffold**.
3. Near the **top-right** of the page, click the **Fork** button.
   *(It sits next to **Star** and **Watch**. Click the word "Fork" itself, not
   the small number beside it.)*
4. The **"Create a new fork"** page opens. You can leave everything as-is:
   - **Owner** → your username (already selected).
   - **Repository name** → leave it as `grid-workshop-scaffold` (don't rename it).
   - **"Copy the `master` branch only"** → leave it **checked** (the default).
5. Click the green **Create fork** button and wait a few seconds.
6. You'll land on **`https://github.com/<your-username>/grid-workshop-scaffold`** —
   the URL and the title at the top-left now show **your** username, with a small
   *"forked from zexoverz/grid-workshop-scaffold"* note underneath. That's your
   fork. ✅

> Already forked it before and want a fresh copy? Open your fork → **Settings** →
> scroll to the bottom → **Delete this repository**, then redo the steps above.

---

## 7 · Download (clone) your fork

In a terminal, go to where you keep projects (e.g. your Desktop) and clone
**your fork** (replace `<your-username>` with your GitHub username):

```bash
cd ~/Desktop                                   # Windows Git Bash: cd ~/Desktop works too
git clone https://github.com/<your-username>/grid-workshop-scaffold.git
cd grid-workshop-scaffold
```

**Verify** you're in the right place:

```bash
ls
# you should see: archetypes  docs  mocks  scripts  shared  package.json  README.md ...
```

> Prefer clicking over typing? In the CodeBuddy IDE / VS Code, use
> **File → Clone Repository**, paste your fork's URL
> (`https://github.com/<your-username>/grid-workshop-scaffold.git`), and pick a folder.

---

## 8 · Connect Git to GitHub (so `git push` works)

Cloning a public repo needs no login, but **pushing does** — and GitHub no longer
accepts your account password on the command line. Set up sign-in **once** now so
pushes "just work" later. Pick the path that matches how you'll work:

### Easiest — sign in through the IDE (recommended)

If you'll use the **CodeBuddy IDE / VS Code**: open the **Source Control** panel
(the branch icon in the left bar), and the first time you push it pops up a
**"Sign in to GitHub"** button → click it and approve in the browser. The IDE
saves the login for you. Nothing else to install.

### Terminal — GitHub CLI (one command, works everywhere)

If you prefer the terminal, the GitHub CLI is the smoothest:

1. Install it from **https://cli.github.com** (Windows `.msi` / macOS `.pkg`, or
   `brew install gh`, or Linux package).
2. Sign in — follow the prompts (choose **GitHub.com → HTTPS → Login with a web
   browser**):

   ```bash
   gh auth login
   ```

That's it — `gh` configures Git's credentials, so `git push` won't prompt again.

> **Windows shortcut:** Git for Windows (step 2) ships with **Git Credential
> Manager**, so your *first* `git push` just opens a browser to log in — you can
> skip the steps above and push when you reach **"You're ready"** below.

> **Note:** if a push ever asks for a "Password", GitHub means a **Personal Access
> Token**, *not* your account password. The two paths above avoid that entirely —
> use one of them instead of typing a password.

---

## You're ready

Everything is installed and your fork is on your laptop. Open the
`grid-workshop-scaffold` folder in the CodeBuddy IDE, then follow
[`getting-started.md`](./getting-started.md) from **§1 · Install** — it picks up
exactly where this leaves off (`npm install`, configure `.env`, run an archetype).

When you've made changes you want to keep, save them back to **your fork**:

```bash
git add -A
git commit -m "my archetype changes"
git push
```

The first `git push` triggers the sign-in from step 8; after that it's silent.
Your changes then show up at `https://github.com/<your-username>/grid-workshop-scaffold`.

### Stuck?

| Problem | Fix |
|---|---|
| `git: command not found` | Git didn't install or the terminal is stale. Reopen the terminal (Windows: use **Git Bash**), redo step 2. |
| `node: command not found` | Reopen the terminal after installing Node. Still missing → reinstall the LTS from https://nodejs.org. |
| `node --version` shows v18 or lower | Install the **LTS** (20+) from https://nodejs.org and reopen the terminal. |
| CodeBuddy IDE won't download on Linux | Expected — it's Windows/macOS only. Use VS Code + the CodeBuddy extension (§4b). |
| `git clone` asks for a password | You're cloning over SSH or a private URL. Use the `https://…` URL for **your fork** (step 7); cloning a public fork shouldn't prompt. |
| `git push` asks for a username/password | You haven't signed in yet — do step 8 (`gh auth login`, or sign in via the IDE). When asked for a "Password", that means a Personal Access Token, never your account password. |
| `git push` → "Permission denied" / 403 | You're pushing to the original repo, not your fork. Confirm `git remote -v` shows **your** username; if not, re-clone your fork (step 7). |
