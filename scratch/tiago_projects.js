
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('bd.csv', 'utf8');
const issues = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true
});

const tiagoProjects = {};
issues.forEach(issue => {
    if ((issue['Assignee'] || '').includes('Tiago Neves')) {
        const rawParent = issue['parent'] || issue['Parent'] || issue['Parent Link'];
        const parent = rawParent ? rawParent.trim() : (issue['Epic Link'] ? issue['Epic Link'].trim() : 'No Parent');
        
        let points = parseFloat(issue['Story Points']);
        if (isNaN(points)) points = 0;
        
        if (!tiagoProjects[parent]) tiagoProjects[parent] = { total: 0, count: 0, name: issue['Epic Link.Name'] || '' };
        tiagoProjects[parent].total += points;
        tiagoProjects[parent].count++;
    }
});

console.log(JSON.stringify(tiagoProjects, null, 2));
