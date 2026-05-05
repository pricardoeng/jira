
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('bd.csv', 'utf8');
const issues = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true
});

const parents = {};
issues.forEach(issue => {
    const rawParent = issue['parent'] || issue['Parent'] || issue['Parent Link'];
    const parent = rawParent ? rawParent.trim() : (issue['Epic Link'] ? issue['Epic Link'].trim() : 'No Parent');
    
    let points = parseFloat(issue['Story Points']);
    if (isNaN(points)) points = 0;
    
    if (!parents[parent]) parents[parent] = { total: 0, count: 0, name: issue['Epic Link.Name'] || '' };
    parents[parent].total += points;
    parents[parent].count++;
});

// Sort by total points
const sorted = Object.entries(parents).sort((a, b) => b[1].total - a[1].total);
console.log(JSON.stringify(sorted.slice(0, 30), null, 2));
