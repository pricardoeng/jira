export async function fetchJiraData(config, jql = 'sprint in openSprints() AND issueType != Epic') {
  // We use the proxy route to avoid CORS
  const fetchFromJira = async (endpoint) => {
    const res = await fetch('/api/jira', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        config
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch from Jira');
    }
    
    return res.json();
  };

  try {
    // Search for issues in the current sprint
    // We request maxResults=100 (can implement pagination later if needed)
    const searchPayload = {
      jql,
      maxResults: 100,
      fields: [
        'summary',
        'status',
        'issuetype',
        'parent',
        config.storyPointField,
        'customfield_10014' // Sometimes Epic Link
      ]
    };

    const res = await fetch('/api/jira', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: '/rest/api/3/search',
        method: 'POST',
        config,
        payload: searchPayload
      })
    });

    if (!res.ok) {
      throw new Error('Failed to fetch issues');
    }

    const data = await res.json();
    return processSprintData(data.issues || [], config.storyPointField);
  } catch (error) {
    console.error("Error fetching Jira data:", error);
    throw error;
  }
}

function processSprintData(issues, storyPointField) {
  const metrics = {
    totalPoints: 0,
    todoPoints: 0,
    inProgressPoints: 0,
    donePoints: 0,
    blockedPoints: 0,
    totalCards: issues.length,
    todoCards: 0,
    inProgressCards: 0,
    doneCards: 0,
    blockedCards: 0
  };

  const epicsMap = new Map();

  issues.forEach(issue => {
    // Safely get points, treating null/undefined as 0
    const points = issue.fields[storyPointField] || 0;
    
    const statusCategory = issue.fields.status?.statusCategory?.key || 'new';
    const statusName = issue.fields.status?.name?.toLowerCase() || '';
    
    const isDone = statusCategory === 'done';
    const isBlocked = statusName.includes('block') || statusName.includes('imped');
    const isInProgress = statusCategory === 'indeterminate' && !isBlocked;
    const isTodo = statusCategory === 'new' && !isBlocked;

    metrics.totalPoints += points;

    if (isDone) {
      metrics.donePoints += points;
      metrics.doneCards++;
    } else if (isBlocked) {
      metrics.blockedPoints += points;
      metrics.blockedCards++;
    } else if (isInProgress) {
      metrics.inProgressPoints += points;
      metrics.inProgressCards++;
    } else {
      metrics.todoPoints += points;
      metrics.todoCards++;
    }

    // Epic / Parent Grouping
    // Modern Jira uses 'parent', older uses 'Epic Link' (customfield_10014)
    let parentKey = 'No Epic';
    let parentName = 'No Epic';

    if (issue.fields.parent) {
      parentKey = issue.fields.parent.key;
      parentName = issue.fields.parent.fields?.summary || parentKey;
    } else if (issue.fields.customfield_10014) {
      parentKey = issue.fields.customfield_10014;
      parentName = parentKey; // We'd need another API call to get the epic name, using key for now
    }

    if (!epicsMap.has(parentKey)) {
      epicsMap.set(parentKey, {
        id: parentKey,
        name: parentName,
        totalPoints: 0,
        resolvedPoints: 0,
        cards: 0,
        resolvedCards: 0
      });
    }

    const epic = epicsMap.get(parentKey);
    epic.totalPoints += points;
    epic.cards++;
    if (isDone) {
      epic.resolvedPoints += points;
      epic.resolvedCards++;
    }
  });

  const epics = Array.from(epicsMap.values())
    // Sort by total points descending
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return { metrics, epics };
}
