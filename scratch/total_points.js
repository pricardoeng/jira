
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('bd.csv', 'utf8');
const issues = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true
});

let totalPoints = 0;
issues.forEach(issue => {
    const issueType = (issue['Issue Type'] || '').toLowerCase();
    if (issueType === 'epic' || issueType === 'sub-task' || issueType === 'subtask') return;
    
    let points = parseFloat(issue['Story Points']);
    if (!isNaN(points)) totalPoints += points;
});

console.log("Total Points (Filtered): " + totalPoints);
