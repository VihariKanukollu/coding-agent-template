# Browzy Code - AI Coding Agent Platform

Multi-agent AI coding platform by Browzy.ai that supports Claude, Codex, Cursor, and opencode to automatically execute coding tasks on your repositories using isolated sandboxes.

![Browzy Code Screenshot](screenshot.png)

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/browzy-code.git
cd browzy-code
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
pnpm db:generate
pnpm db:push

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✨ Features

- **Multi-Agent Support**: Choose from Claude Code, OpenAI Codex CLI, Cursor CLI, or opencode
- **Isolated Sandboxes**: Secure execution via Vercel sandboxes
- **AI-Generated Branch Names**: Descriptive branch names with conflict prevention
- **Real-time Task Tracking**: Live logs and progress updates
- **PostgreSQL Storage**: Persistent task history
- **Automated Git Workflow**: Branch creation and commits

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or hosted)
- GitHub account with personal access token
- Vercel account (for sandbox environments)
- Anthropic API key (for Claude)
- AI Gateway API key (for branch naming and Codex)

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/browzy-code.git
cd browzy-code
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy and customize the environment file:

```bash
cp .env.example .env.local
```

**Required variables:**

| Variable | Description | How to get |
|----------|-------------|------------|
| `POSTGRES_URL` | PostgreSQL connection string | [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or local instance |
| `ANTHROPIC_API_KEY` | Claude API key | [Anthropic Console](https://console.anthropic.com/) |
| `GITHUB_TOKEN` | GitHub PAT with repo access | [GitHub Settings](https://github.com/settings/tokens) |
| `VERCEL_TEAM_ID` | Vercel team ID | Found in Vercel team settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Found in Vercel project settings |
| `VERCEL_TOKEN` | Vercel API token | [Vercel Settings](https://vercel.com/account/tokens) |
| `AI_GATEWAY_API_KEY` | AI Gateway key | For branch naming and Codex |

**Optional variables:**

| Variable | Description |
|----------|-------------|
| `CURSOR_API_KEY` | Cursor agent support |
| `NPM_TOKEN` | Private npm packages |

### 4. Set up the database

Generate and run database migrations:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a Task

1. Open the app at `http://localhost:3000`
2. Enter your GitHub repository URL
3. Select an AI agent (Claude, Codex, Cursor, or opencode)
4. Describe what you want the AI to do
5. Click "Create Task"

### Monitoring Progress

- **Real-time logs**: Watch the agent work in the main panel
- **Task sidebar**: View all tasks with status indicators
- **Branch info**: See the generated branch name and commit details

### Example Tasks

```
"Add input validation to the login form using Zod"
"Refactor the API routes to use middleware for authentication"
"Fix the TypeScript errors in src/components/Header.tsx"
"Add unit tests for the user service with 80% coverage"
"Update dependencies and fix breaking changes"
```

## 🏗️ Architecture

### System Flow

```
User Input → Task Creation → Branch Generation → Sandbox Setup → Agent Execution → Git Commit → Cleanup
```

1. **Task Creation**: Task stored in PostgreSQL with initial metadata
2. **AI Branch Name**: Parallel generation of semantic branch name
3. **Sandbox Provisioning**: Vercel creates isolated environment with repo clone
4. **Agent Execution**: Selected AI agent analyzes and modifies code
5. **Git Operations**: Changes committed and pushed to generated branch
6. **Cleanup**: Sandbox terminated, resources freed

### Project Structure

```
browzy-code/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   ├── db/              # Database schema and queries
│   └── types/           # TypeScript type definitions
├── drizzle/             # Database migrations
└── public/              # Static assets
```

### Key Files

- `src/app/api/tasks/route.ts` - Task creation endpoint
- `src/app/api/tasks/[id]/route.ts` - Task status and logs
- `src/lib/agents/` - AI agent implementations
- `src/lib/sandbox.ts` - Vercel sandbox management
- `src/db/schema.ts` - Database schema

## 🌿 Branch Naming

AI-generated branch names follow this pattern: `<type>/<description>-<hash>`

**Examples:**
- `feature/add-user-auth-K3mP9n` → "Add JWT authentication"
- `fix/resolve-memory-leak-B7xQ2w` → "Fix memory leak in parser"
- `refactor/simplify-api-M4nR8s` → "Simplify API structure"
- `docs/api-endpoints-F9tL5v` → "Document REST endpoints"

**Features:**
- Non-blocking generation (fallback to timestamp if needed)
- Conventional commit types (feature, fix, refactor, docs, chore, test)
- 6-character hash prevents conflicts
- Context-aware using task description and repo info

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | PostgreSQL, Drizzle ORM |
| **AI Agents** | Claude Code, OpenAI Codex, Cursor, opencode |
| **Sandboxes** | Vercel isolated environments |
| **Git** | Automated workflows with AI naming |

## 🧑‍💻 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server on localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio (GUI)

# Type checking
pnpm type-check       # Run TypeScript compiler
```

### Local Development Workflow

1. Make changes to code
2. Test in local dev server (`pnpm dev`)
3. Run type checks (`pnpm type-check`)
4. Generate DB migrations if schema changed (`pnpm db:generate`)
5. Test database changes (`pnpm db:push`)
6. Commit and push

### Adding a New AI Agent

1. Create agent implementation in `src/lib/agents/your-agent.ts`
2. Implement the `AgentInterface` from `src/types/agent.ts`
3. Add agent to the agent selector in `src/components/TaskForm.tsx`
4. Add any required environment variables to `.env.example`

### Database Schema Changes

```bash
# 1. Modify schema in src/db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Review migration in drizzle/ folder
# 4. Apply to database
pnpm db:push

# 5. View changes in Drizzle Studio
pnpm db:studio
```

## 🐛 Troubleshooting

### Common Issues

**"Failed to connect to database"**
```bash
# Check your POSTGRES_URL format
# Should be: postgresql://user:password@host:5432/database
```

**"Sandbox creation failed"**
- Verify `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID` are correct
- Check Vercel account has sandbox creation permissions

**"Agent not responding"**
- Verify API keys are valid (`ANTHROPIC_API_KEY`, etc.)
- Check API key has sufficient credits/quota

**"Branch already exists"**
- Delete the branch in GitHub or locally
- The 6-char hash should prevent this, but may occur with manual branch names

**"Cannot clone private repository"**
- Ensure `GITHUB_TOKEN` has `repo` scope
- Check the token hasn't expired

### Debug Mode

Enable verbose logging by adding to `.env.local`:
```
DEBUG=true
LOG_LEVEL=verbose
```

### Logs Location

- **Application logs**: Check terminal output from `pnpm dev`
- **Database queries**: Enable in Drizzle Studio
- **Agent logs**: Stored in database `tasks` table

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add TypeScript types for all new code
- Update documentation for new features
- Test thoroughly before submitting
- Keep PRs focused on a single feature/fix

## 🔒 Security

### Best Practices

- **Never commit** `.env` or `.env.local` files
- **Rotate API keys** regularly (every 90 days recommended)
- **Use minimal permissions** for GitHub tokens (only `repo` scope)
- **Secure your database** with strong credentials and SSL
- **Review sandbox logs** for sensitive data before sharing
- **Enable 2FA** on all service accounts (GitHub, Vercel, Anthropic)

### Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] API keys stored in environment variables only
- [ ] Database uses SSL connection
- [ ] GitHub token has minimal required scopes
- [ ] Vercel project has appropriate permissions
- [ ] Regular security updates via `pnpm update`

## 📚 API Reference

### REST Endpoints

**Create Task**
```http
POST /api/tasks
Content-Type: application/json

{
  "repoUrl": "https://github.com/username/repo",
  "prompt": "Add unit tests for auth service",
  "agent": "claude"
}
```

**Get Task Status**
```http
GET /api/tasks/:id
```

**Get All Tasks**
```http
GET /api/tasks
```

**Stream Task Logs** (Server-Sent Events)
```http
GET /api/tasks/:id/logs
```

## 🔗 Useful Links

- [Documentation](https://browzy.ai/docs)
- [Report Issues](https://github.com/yourusername/browzy-code/issues)
- [Discussions](https://github.com/yourusername/browzy-code/discussions)
- [Browzy.ai](https://browzy.ai)

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

Built with ❤️ by [Browzy.ai](https://browzy.ai)