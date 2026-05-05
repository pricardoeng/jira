import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Basic Security: Check for Auth Token
    const authToken = process.env.DASHBOARD_AUTH_TOKEN;
    if (authToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader !== `Bearer ${authToken}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const files = ['bd.csv', 'bd2.csv'];
    let allRecords = [];

    for (const fileName of files) {
      const filePath = path.join(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, { 
          skip_empty_lines: true, 
          trim: true,
          relax_column_count: true,
          columns: header => {
            const counts = {};
            return header.map(col => {
              counts[col] = (counts[col] || 0) + 1;
              return counts[col] > 1 ? `${col}_${counts[col]}` : col;
            });
          }
        });
        allRecords = [...allRecords, ...records];
      }
    }

    if (allRecords.length === 0) {
      return NextResponse.json({ error: 'No data files found' }, { status: 404 });
    }

    const response = NextResponse.json({ data: allRecords });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return NextResponse.json({ error: 'Failed to parse data' }, { status: 500 });
  }
}
