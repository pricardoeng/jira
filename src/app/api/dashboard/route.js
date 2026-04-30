import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'bd.csv');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the CSV
    const records = parse(fileContent, { 
      skip_empty_lines: true, 
      trim: true,
      columns: header => {
        const counts = {};
        return header.map(col => {
          counts[col] = (counts[col] || 0) + 1;
          return counts[col] > 1 ? `${col}_${counts[col]}` : col;
        });
      }
    });

    const response = NextResponse.json({ data: records });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return response;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return NextResponse.json({ error: 'Failed to parse data' }, { status: 500 });
  }
}
