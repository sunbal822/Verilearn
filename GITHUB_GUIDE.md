# 🐙 VeriLearn — GitHub Setup & Version Control Guide

## Step 1 — First Time Setup (run once)

```bash
# Set your identity in git
git config --global user.name "Sunbal Ghayas"
git config --global user.email "your@email.com"
```

---

## Step 2 — Initialize Your Project

Inside your project folder:

```bash
git init
git add .
git commit -m "feat: initial commit — VeriLearn project setup"
```

---

## Step 3 — Create Repo on GitHub

1. Go to https://github.com/sunbal822
2. Click **New Repository**
3. Name it `verilearn`
4. Set to **Public**
5. Do NOT check "Add README" (you already have one)
6. Click **Create Repository**

---

## Step 4 — Push to GitHub

```bash
git remote add origin https://github.com/sunbal822/verilearn.git
git branch -M main
git push -u origin main
```

---

## Step 5 — Add Your Partner as Collaborator

1. Go to your repo on GitHub
2. **Settings → Collaborators → Add people**
3. Search for Arham's GitHub username and invite

---

## Step 6 — Daily Workflow

```bash
# Before starting work — pull latest changes
git pull origin main

# After making changes — save and push
git add .
git commit -m "feat: describe what you changed"
git push origin main
```

---

## ✅ Final Checklist Before Submission

- [ ] `.env` is in `.gitignore` and NOT pushed to GitHub
- [ ] `.env.example` IS pushed to GitHub
- [ ] `README.md` is complete and at the root of the repo
- [ ] All components are in `src/components/`
- [ ] Firebase config is in `src/firebase/firebase.js`
- [ ] Repo is set to **Public** so the evaluator can see it
- [ ] Recording link is added to README.md
