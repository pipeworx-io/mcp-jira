# mcp-jira

Jira MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `jira_search` | Search Jira issues using JQL queries. Returns issue keys, summaries, status, assignee, and priority. Use to find tasks by project, status, assignee, or custom criteria. |
| `jira_get_issue` | Get full details for a Jira issue by key (e.g., \'PROJ-123\'). Returns description, status, assignee, priority, comments, attachments, and linked issues. |
| `jira_list_projects` | List all accessible Jira projects. Returns project keys, names, descriptions, and types. Use before searching to discover available projects. |
| `jira_get_project` | Get details for a specific Jira project by key (e.g., \'PROJ\') or ID. Returns name, description, lead, issue types, and custom fields. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "jira": {
      "url": "https://gateway.pipeworx.io/jira/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Jira data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
