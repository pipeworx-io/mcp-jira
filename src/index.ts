interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Jira MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.jira.
 * Tools: JQL search, get issue, list projects, get project.
 */


interface JiraContext {
  jira?: { accessToken: string; cloudId?: string };
}

async function jiraFetch(ctx: JiraContext, path: string) {
  if (!ctx.jira) {
    return { error: 'connection_required', message: 'Connect your Jira account at https://pipeworx.io/account' };
  }
  const { accessToken, cloudId } = ctx.jira;
  if (!cloudId) {
    return { error: 'missing_cloud_id', message: 'Jira Cloud ID not found in connection' };
  }
  const base = `https://api.atlassian.com/ex/jira/${cloudId}/rest`;
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API error (${res.status}): ${text}`);
  }
  return res.json();
}

async function jiraPost(ctx: JiraContext, path: string, body: unknown) {
  if (!ctx.jira) {
    return { error: 'connection_required', message: 'Connect your Jira account at https://pipeworx.io/account' };
  }
  const { accessToken, cloudId } = ctx.jira;
  if (!cloudId) {
    return { error: 'missing_cloud_id', message: 'Jira Cloud ID not found in connection' };
  }
  const base = `https://api.atlassian.com/ex/jira/${cloudId}/rest`;
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'jira_search',
    description: 'Search Jira issues using JQL (Jira Query Language). Returns matching issues with key fields.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        jql: { type: 'string', description: 'JQL query (e.g., "project = PROJ AND status = Open ORDER BY created DESC")' },
        max_results: { type: 'number', description: 'Maximum results to return (default 20, max 100)' },
        fields: { type: 'string', description: 'Comma-separated field names to include (e.g., "summary,status,assignee")' },
      },
      required: ['jql'],
    },
  },
  {
    name: 'jira_get_issue',
    description: 'Get a single Jira issue by its key (e.g., PROJ-123). Returns full issue details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        issue_key: { type: 'string', description: 'Issue key (e.g., "PROJ-123")' },
        fields: { type: 'string', description: 'Comma-separated field names to include (optional)' },
      },
      required: ['issue_key'],
    },
  },
  {
    name: 'jira_list_projects',
    description: 'List all Jira projects accessible to the authenticated user.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'jira_get_project',
    description: 'Get details for a specific Jira project by key or ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        project_key: { type: 'string', description: 'Project key (e.g., "PROJ") or numeric project ID' },
      },
      required: ['project_key'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as JiraContext;
  delete args._context;

  switch (name) {
    case 'jira_search': {
      const body: Record<string, unknown> = {
        jql: args.jql as string,
        maxResults: (args.max_results as number) ?? 20,
      };
      if (args.fields) body.fields = (args.fields as string).split(',').map(f => f.trim());
      return jiraPost(context, '/api/3/search/jql', body);
    }
    case 'jira_get_issue': {
      const issueKey = args.issue_key as string;
      const fields = args.fields as string | undefined;
      const path = fields
        ? `/api/3/issue/${encodeURIComponent(issueKey)}?fields=${encodeURIComponent(fields)}`
        : `/api/3/issue/${encodeURIComponent(issueKey)}`;
      return jiraFetch(context, path);
    }
    case 'jira_list_projects':
      return jiraFetch(context, '/api/3/project');
    case 'jira_get_project': {
      const projectKey = args.project_key as string;
      return jiraFetch(context, `/api/3/project/${encodeURIComponent(projectKey)}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 10 }, provider: 'jira' } satisfies McpToolExport;
