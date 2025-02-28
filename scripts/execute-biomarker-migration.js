#!/usr/bin/env node

/**
 * This script reads the biomarker migration SQL file and formats it 
 * for easy copying and pasting into the Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

// Path to the SQL migration file
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_biomarkers.sql');

// Read the SQL file
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Print header
console.log('=============================================');
console.log('BIOMARKER MIGRATION SQL');
console.log('=============================================');
console.log('Copy and paste the following SQL into the Supabase SQL Editor at:');
console.log('https://supabase.com/dashboard/project/_/sql');
console.log('=============================================\n');

// Print the SQL content
console.log(sqlContent);

console.log('\n=============================================');
console.log('After running the SQL, verify the biomarkers exist by running:');
console.log('SELECT COUNT(*) FROM biomarker_references;');
console.log('=============================================');

// Split the SQL into smaller chunks if needed
const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

console.log(`\nThe SQL file contains ${statements.length} statements.`);
console.log('If you have issues executing the entire file at once, you can run it in smaller chunks:');

// Create chunks directory if it doesn't exist
const chunksDir = path.join(__dirname, '..', 'supabase', 'sql-chunks');
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
  console.log(`Created directory: ${chunksDir}`);
}

// Function to chunk SQL statements into groups
function chunkStatements(statements, size) {
  const chunks = [];
  for (let i = 0; i < statements.length; i += size) {
    chunks.push(statements.slice(i, i + size));
  }
  return chunks;
}

// Create smaller SQL files (chunks)
const chunks = chunkStatements(statements, 10); // 10 statements per chunk
for (let i = 0; i < chunks.length; i++) {
  const chunkContent = chunks[i].join(';\n\n') + ';';
  const chunkPath = path.join(chunksDir, `biomarker-chunk-${i+1}.sql`);
  fs.writeFileSync(chunkPath, chunkContent);
  console.log(`\nChunk ${i+1} written to: ${chunkPath}`);
  console.log(`Contains ${chunks[i].length} statements`);
}

console.log('\nDONE! You can now execute the SQL to create and populate the biomarker_references table.'); 