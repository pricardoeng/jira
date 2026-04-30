import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { endpoint, method = 'GET', config, payload } = body;

    if (!config || !config.domain || !config.email || !config.apiToken) {
      return NextResponse.json({ error: 'Missing Jira configuration' }, { status: 400 });
    }

    const { domain, email, apiToken } = config;
    
    // Construct the Jira URL
    const baseUrl = `https://${domain}`;
    const url = `${baseUrl}${endpoint}`;

    // Create Basic Auth token
    const authToken = Buffer.from(`${email}:${apiToken}`).toString('base64');

    const headers = {
      'Authorization': `Basic ${authToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const fetchOptions = {
      method,
      headers,
    };

    if (payload && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(url, fetchOptions);
    
    // Some endpoints might return 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Jira API Error', details: data }, 
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Jira Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
