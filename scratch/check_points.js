
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('bd.csv', 'utf8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true
});

const team = [
  'david oliveira soares',
  'Alan Dantas Bernardo',
  'Tiago Neves',
  'Iago Jants David',
  'Raphael Fonseca Rodrigues dos Santos'
];

const stats = {};
team.forEach(name => stats[name] = { total: 0, count: 0, types: {} });

records.forEach(r => {
  const assignee = r['Assignee'];
  if (team.includes(assignee)) {
    let pts = parseFloat(r['Story Points']);
    if (isNaN(pts)) pts = 0;
    stats[assignee].total += pts;
    stats[assignee].count++;
    const type = r['Issue Type'];
    stats[assignee].types[type] = (stats[assignee].types[type] || 0) + pts;
  }
});

console.log(JSON.stringify(stats, null, 2));
