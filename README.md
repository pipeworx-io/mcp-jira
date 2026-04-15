# mcp-jira

Jira MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `jira_search` | Search Jira issues using JQL (Jira Query Language). Returns matching issues with key fields. |
| `jira_get_issue` | Get a single Jira issue by its key (e.g., PROJ-123). Returns full issue details. |
| `jira_list_projects` | List all Jira projects accessible to the authenticated user. |
| `jira_get_project` | Get details for a specific Jira project by key or ID. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "jira": {
      "url": "https://gateway.pipeworx.io/jira/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use jira
```

## License

MIT
