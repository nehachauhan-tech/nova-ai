# Supabase MCP Migrations Safety

When using the Supabase MCP to manage the database schema:
1. You may apply additive migrations (creating tables, columns, policies) automatically.
2. DO NOT apply any migration that could drop tables, drop columns, or otherwise remove/alter data.
3. If an action could cause data loss, you MUST explicitly confirm the changes with the user before executing the migration via MCP.
