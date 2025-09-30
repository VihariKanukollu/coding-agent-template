# Browzy Code - AI Coding Agent Platform

Multi-agent AI coding platform by Browzy.ai that supports Claude, Codex, Cursor, and opencode to automatically execute coding tasks on your repositories using isolated sandboxes.

![Browzy Code Screenshot](screenshot.png)

## Features

- **Multi-Agent Support**: Choose from Claude Code, OpenAI Codex CLI, Cursor CLI, or opencode to execute coding tasks
- **Isolated Sandboxes**: Runs code in secure, isolated sandbox environments
- **AI-Generated Branch Names**: Automatically generates descriptive Git branch names
- **Task Management**: Track task progress with real-time updates
- **Persistent Storage**: Tasks stored in PostgreSQL database
- **Git Integration**: Automatically creates branches and commits changes
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/browzy-code.git
cd browzy-code
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `POSTGRES_URL`: Your PostgreSQL connection string (works with any PostgreSQL database)
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude
- `GITHUB_TOKEN`: GitHub personal access token (for repository access)
- `VERCEL_TEAM_ID`: Your Vercel team ID (for sandbox creation)
- `VERCEL_PROJECT_ID`: Your Vercel project ID (for sandbox creation)
- `VERCEL_TOKEN`: Your Vercel API token (for sandbox creation)
- `AI_GATEWAY_API_KEY`: Your AI Gateway API key for AI-generated branch names and Codex agent support

Optional environment variables:

- `CURSOR_API_KEY`: For Cursor agent support
- `NPM_TOKEN`: For private npm packages

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

## Usage

1. **Create a Task**: Enter a repository URL and describe what you want the AI to do
2. **Monitor Progress**: Watch real-time logs as the agent works
3. **Review Results**: See the changes made and the branch created
4. **Manage Tasks**: View all your tasks in the sidebar with status updates

## How It Works

1. **Task Creation**: When you submit a task, it's stored in the database
2. **AI Branch Name Generation**: AI automatically generates a descriptive branch name based on your task
3. **Sandbox Setup**: An isolated sandbox is created with your repository
4. **Agent Execution**: Your chosen coding agent (Claude, Codex, Cursor, or opencode) analyzes your prompt and makes changes
5. **Git Operations**: Changes are committed and pushed to the AI-generated branch
6. **Cleanup**: The sandbox is shut down to free resources

## Environment Variables

### Required

- `POSTGRES_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API key
- `GITHUB_TOKEN`: GitHub token for repository access
- `VERCEL_TEAM_ID`: Vercel team ID for sandbox creation
- `VERCEL_PROJECT_ID`: Vercel project ID for sandbox creation
- `VERCEL_TOKEN`: Vercel API token for sandbox creation
- `AI_GATEWAY_API_KEY`: AI Gateway API key for branch name generation and Codex agent support

### Optional

- `CURSOR_API_KEY`: Cursor agent API key
- `NPM_TOKEN`: NPM token for private packages

## AI Branch Name Generation

The system automatically generates descriptive Git branch names using AI. This feature:

- **Non-blocking**: Generates names without delaying task creation
- **Descriptive**: Creates meaningful branch names like `feature/user-authentication-A1b2C3` or `fix/memory-leak-parser-X9y8Z7`
- **Conflict-free**: Adds a 6-character alphanumeric hash to prevent naming conflicts
- **Fallback**: Gracefully falls back to timestamp-based names if AI generation fails
- **Context-aware**: Uses task description, repository name, and agent context for better names

### Branch Name Examples

- `feature/add-user-auth-K3mP9n` (for "Add user authentication with JWT")
- `fix/resolve-memory-leak-B7xQ2w` (for "Fix memory leak in image processing")
- `chore/update-deps-M4nR8s` (for "Update all project dependencies")
- `docs/api-endpoints-F9tL5v` (for "Document REST API endpoints")

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **AI Agents**: Claude Code, OpenAI Codex CLI, Cursor CLI, opencode
- **Sandbox**: Isolated execution environments
- **Git**: Automated branching and commits with AI-generated branch names

## Development

### Database Operations

```bash
# Generate migrations
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Running the App

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- **Environment Variables**: Never commit `.env` files to version control. All sensitive data should be stored in environment variables.
- **API Keys**: Rotate your API keys regularly and use the principle of least privilege.
- **Database Access**: Ensure your PostgreSQL database is properly secured with strong credentials.
- **Sandboxes**: Sandboxes are isolated but ensure you're not exposing sensitive data in logs or outputs.
- **GitHub Token**: Use a personal access token with minimal required permissions for repository access.

## License

MIT License - see LICENSE file for details

---

Built with ❤️ by [Browzy.ai](https://browzy.ai)