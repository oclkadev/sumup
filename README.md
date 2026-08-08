<div align="center">
  <img src="https://oclka.dev/images/logo.svg" alt="Logo" width="100" />
  <h1>Sumup</h1>
  <p>Gather scattered code, diffs, and docs into clean, zero-fluff context for AIs and dev teams.</p>
</div>

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=oclkadev_sumup&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=oclkadev_sumup)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=oclkadev_sumup&metric=coverage)](https://sonarcloud.io/summary/new_code?id=oclkadev_sumup)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Foclkadev%2Fsumup%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/oclkadev/sumup/main)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=oclkadev_sumup&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=oclkadev_sumup)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=oclkadev_sumup&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=oclkadev_sumup)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=oclkadev_sumup&metric=bugs)](https://sonarcloud.io/summary/new_code?id=oclkadev_sumup)
![CI](https://github.com/oclkadev/sumup/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/oclkadev/sumup/actions/workflows/release.yml/badge.svg)

sumup is a CLI that aggregates files and diffs into a single clean document. No config, no presets, no daemon. `sumup src -s -c` → clipboard → paste into your web LLM. That's it!

---

## 📖 Table of Contents

- [Who is it for](#-who-is-it-for)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Use Cases](#-use-cases)
- [API](#-api)
- [Security](#-security)
- [stdout/stderr Behavior](#-stdoutstderr-behavior)
- [Upcoming](#-upcoming)
- [Contributing](#-contributing)
- [Support the Project](#-support-the-project)
- [License](#-license)

---

## 🎯 Who is it for

Any developer or team that needs to share code context — whether human or machine.

- **Feed a web LLM** with the right context: web interfaces are free or nearly free, you copy/paste as much as you want, whereas your IDE charges you per token.
- **Share with a human**: code review, onboarding, PR summary, chat discussion — a clean `.md` file to drop anywhere.
- **Automate in CI**: JSON output to feed an LLM pipeline (auto-review, auto-fix, PR description generation).
- `sumup` + paste = the exact context, at the right time, zero friction.

`sumup` is simple, concise, and **relentlessly efficient!**

---

## 📦 Installation

```bash
npm install -g @oclkadev/sumup
```

or

```bash
pnpm add -g @oclkadev/sumup
```

or

```bash
bun add -g @oclkadev/sumup
```

Or use it directly without installation:

```bash
npx @oclkadev/sumup src
```

> **Prerequisite:** Node.js >= 24 — Stack: Commander, near-instant execution.

---

## 🚀 Quick Start

```bash
# Bundle a folder → file + clipboard
sumup src

# Bundle staged files
sumup src -s -c

# Bundle diff against main
sumup src -b main

# Bundle a folder → clipboard only -> Estimate token cost
sumup src -c -k
```

---

## 🌟 Use Cases

```
                       ┌──► 🤖 Web LLM (free or near-free interface)
                       │
  [ Codebase / Git ] ──┼──► 👥 Peer review & chat (drop a .md file)
        + sumup        │
                       ├──► 📚 Onboarding & architecture digests
                       │
                       └──► 🔌 CI & scripting (JSON → LLM API)
```

- **🤖 Web LLMs:** Bundle relevant files, paste into chat. Free, precise, no IDE subscription.
- **👥 Collaboration:** A readable `.md` file to share in your chat or for a PR draft.
- **📚 Onboarding:** An architecture digest with glossary (`-g`) and tree (`-t`) for a newcomer.
- **🔌 CI & scripting:** JSON output (`-j`) to feed an LLM for auto-review, auto-fix, or PR description generation.

---

## 📦 API

By default, `sumup` writes to a `.sumup_<timestamp>.md` file **and** copies to the clipboard.

### 📋 Default Usage

Gathers all files from a folder (recursive) into a single Markdown document.

```bash
sumup src
```

```txt
✅ 13 files sumuprized
   in `.sumup_20260806_180000.md`
   and copied to clipboard!
```

### 📋 Multi-targets

Multiple folders passed as positional arguments. Files are aggregated into a single bundle.

```bash
sumup src scripts
```

### 📋 Output

#### 📋 `-c` or `--copy-only`

Copies the result to the clipboard only. No file written to disk. Useful for a quick paste into a chat or editor.

```bash
sumup src -c
```

```txt
✅ 13 files sumuprized in clipboard!
```

#### 📋 `-f` or `--file-only`

Writes the result to a `.sumup_<timestamp>.md` file only. No clipboard copy. For a custom path, use shell redirection: `sumup src -f > foo.md`.

```bash
sumup src -f
```

```txt
✅ 13 files sumuprized in `.sumup_20260806_180000.md`
```

> **Note:** `-c` and `-f` are mutually exclusive. Error: *"Error: --copy-only and --file-only are mutually exclusive"*.

### 📋 Git

#### 📋 `-d` or `--diff`

Filters files based on `git diff` (uncommitted changes). Only modified files are included in the bundle, with their current content and the diff patch as a header.

```bash
sumup src -d
```

#### 📋 `-s` or `--staged`

Filters files based on `git diff --staged` (indexed changes). Only staged files are included in the bundle.

```bash
sumup src -s
```

#### 📋 `-b` or `--branch`

Filters files based on the diff against a parent branch (e.g. `main`). Only files modified between the current branch and the target branch are included.

```bash
sumup src -b main
```

> **Note:** `-d`, `-s`, and `-b` are mutually exclusive. Error: *"Error: --diff, --staged and --branch are mutually exclusive"*.

### 📋 Filters

#### 📋 `-e` or `--exclude`

Excludes files via a comma-separated list of glob patterns. Applied after the initial selection (folder or git).

```bash
sumup src -e "foo/**,bar/**/*.md"
```

#### 📋 `-i` or `--include`

Includes only files matching the comma-separated list of glob patterns. Applied after the initial selection.

```bash
sumup src -i "foo/**,bar/**/*.md"
```

#### 📋 `-l` or `--lexicon`

Loads a collection of previously saved patterns (include/exclude) from a file. Lets you reuse a recurring selection without retyping patterns.

```bash
sumup src -l .sumup/files-for-ia.txt
```

### 📋 Format

#### 📋 `-g` or `--glossary`

Adds a glossary at the top of the document with links to the corresponding sections. Makes navigation in the bundle easier for a human or an LLM.

```bash
sumup src -g
```

#### 📋 `-t` or `--tree`

Adds a file and folder tree at the top of the document (after the glossary if present). Provides an overview of the structure before the content.

```bash
sumup src -t
```

#### 📋 `-j` or `--json`

Outputs JSON instead of Markdown. The JSON contains metadata (files, size, tokens) and the aggregated content. Designed for direct integration with LLM APIs — the payload is ready to send without transformation.

In CI, combined with git flags, feeds an LLM for auto-review, auto-fix, or PR description generation:

```bash
# JSON payload of staged files, ready to send to an LLM API
sumup src -s -j | curl -X POST https://api.llm.example.com/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -d @-
```

```bash
sumup src -j
```

### 📋 Info

#### 📋 `-k` or `--tokens`

Displays an estimate of the token volume of the generated bundle (based on cl100k_base encoding). Helps anticipate consumption before sending to an LLM.

> **Note:** The estimate is based on `cl100k_base`. Drift depending on the target LLM may vary by 5 to 15%.

```bash
sumup src -k
```

### ✅ Execution

#### `--dry-run`

Simulates execution without writing any file or copying to the clipboard. Only displays what would be generated (file list, estimated size). Useful for verifying a selection before running.

```bash
sumup src --dry-run
```

#### `--verbose`

Enables verbose output: lists each processed file, timings, resolved paths. Useful for debugging.

```bash
sumup src --verbose
```

#### `--quiet`

Suppresses all non-essential output. Only errors and the final result are shown. Useful in CI or in a pipe.

```bash
sumup src --quiet
```

---

⚙️ Config

Manages persistent `sumup` preferences (default output format, naming pattern, base branch for `-b`, etc.). Config is stored locally in `.sumup/config.json` (project-level) or `~/.config/sumup/config.json` (user-level).

### 📋 `sumup config init`

Initializes a config file with default values. If a file already exists, asks for confirmation before overwriting (or use `--force`).

```bash
sumup config init
```

```txt
✅ Config created at `.sumup/config.json`
```

```bash
sumup config init --force
```

### 📋 `sumup config list`

Lists all key/value pairs of the active config (project + user merged, with the source of each key).

```bash
sumup config list
```

```txt
output.format     markdown   (project)
output.mode       both       (default)
naming.pattern    .sumup_<timestamp>.md   (default)
git.baseBranch    main       (user)
tokens.encoding   cl100k_base   (default)
```

### 📋 `sumup config get <key>`

Retrieves the value of a given key. Returns the resolved value (project > user > default).

```bash
sumup config get output.format
```

```txt
markdown
```

> **Note:** Key not found → error: *"Error: unknown config key 'foo.bar'"*.

### 📋 `sumup config set <key> <value>`

Sets the value of a key. By default writes to the project config. Use `--global` to write to the user config.

```bash
sumup config set output.format json
```

```txt
✅ output.format = json (project)
```

```bash
sumup config set git.baseBranch develop --global
```

```txt
✅ git.baseBranch = develop (user)
```

> **Note:** Unknown key → error: *"Error: unknown config key 'foo.bar'"*. Invalid value → error: *"Error: invalid value 'xyz' for output.format (expected: markdown | json)"*.

> **Legend:** ✅ Implemented · 🚧 In progress · 📋 Planned

---

## 🔒 Security

### `.gitignore` respected by default

`sumup` reads and respects the project's `.gitignore`. Ignored files (`node_modules`, `dist`, `.env`, etc.) are never included in the bundle.

A hardcoded security list also excludes sensitive files by default: `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, etc.

---

## 📡 stdout/stderr Behavior

`sumup` follows the Unix convention:

- **stdout**: the generated content (Markdown or JSON). Enables clean redirection and piping.
- **stderr**: info logs (`✅ 13 files sumuprized`), warnings, and errors.

```bash
# foo.md contains only the bundle, no logs
sumup src -f > foo.md

# The pipe receives only the JSON
sumup src -s -j | curl -X POST https://api.llm.example.com/...
```
---

## 🔮 Upcoming

- `--max-tokens N` — Warning or cutoff if the bundle exceeds a threshold
- Monorepo workspace support
- Plugin system for custom formats

👉 [Full roadmap and voting](https://github.com/oclkadev/sumup/projects/1)

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

### Setup

```bash
git clone https://github.com/oclkadev/sumup.git
cd sumup
corepack enable
pnpm install
```

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run the CLI in development mode |
| `pnpm build` | Compile with tsup |
| `pnpm test:coverage` | Unit tests with coverage |
| `pnpm test:e2e` | End-to-end tests |
| `pnpm test:mutate` | Mutation testing (Stryker) |
| `pnpm lint` | ESLint |
| `pnpm check:all` | All checks (types, lint, tests, build, size, secrets) |
| `pnpm check:fast` | Fast checks (types, lint, tests, knip) |

### Commits

The project uses Conventional Commits via commitizen:

```bash
pnpm commit
```

---

## ☕ Support the Project

> 5 minutes saved per month? 5 euros per month helps me keep going.

[GitHub Sponsors](https://github.com/sponsors/oclkadev) · [Buy Me a Coffee](https://www.buymeacoffee.com/oclka)

---

## 📄 License

[MIT](LICENSE) © [oclkadev](https://oclka.dev)
