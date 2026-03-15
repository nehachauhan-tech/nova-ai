# Nova AI Integration Plan

## Core Architecture
- **AI Model**: Amazon Nova via AWS Bedrock
- **Backend & Database**: Supabase PostgreSQL database and Storage.
- **Client Application**: Next.js App Router (TypeScript)

## Requirements & Features
1. **Multi-modal Inputs**: 
   - Support for text input.
   - Support for voice/audio input and other input formats supported by Nova AI.
   
2. **Setup Rules (configured in `.agent/rules`)**:
   - `pull_before_git_add`: Execute `git pull` before `git add` to prevent conflicting commits.
   - `use_skills_first`: Force the use of Agent Skills, even if there's only a 1% chance they apply.
   - `supabase_mcp_migrations`: Supabase MCP handles backend migrations. Do NOT apply any migrations that drop or remove data without explicitly confirming with the user first.
