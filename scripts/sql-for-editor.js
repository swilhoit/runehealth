#!/usr/bin/env node

/**
 * This script prepares SQL chunks to be copied and pasted into the Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');

// Split SQL into manageable chunks
function splitIntoChunks(sql) {
  // Split by lines to handle comments and statement separator detection
  const lines = sql.split('\n');
  
  const chunks = [];
  let currentChunk = '';
  let statementCount = 0;
  let inFunctionOrBlock = false;
  let blockDepth = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for start of function/DO block
    if (
      (trimmedLine.toUpperCase().includes('CREATE OR REPLACE FUNCTION') || 
       trimmedLine.toUpperCase().includes('CREATE FUNCTION') ||
       trimmedLine.toUpperCase().startsWith('DO')) && 
      !inFunctionOrBlock
    ) {
      inFunctionOrBlock = true;
    }
    
    // Count block depth with dollar-quoted strings
    if (trimmedLine.includes('$$')) {
      const dollarCount = (trimmedLine.match(/\$\$/g) || []).length;
      blockDepth += dollarCount % 2; // Toggle depth on odd number of $$ markers
      if (blockDepth === 0) {
        inFunctionOrBlock = false;
      }
    }
    
    // Add the line to current chunk
    currentChunk += line + '\n';
    
    // Check if statement ends with semicolon and we're not inside a function/block
    if (trimmedLine.endsWith(';') && !inFunctionOrBlock && blockDepth === 0) {
      statementCount++;
      
      // Split into a new chunk after 5-10 statements or if the chunk gets too big
      if ((statementCount >= 5 && !inFunctionOrBlock) || currentChunk.length > 5000) {
        chunks.push(currentChunk);
        currentChunk = '';
        statementCount = 0;
      }
    }
  }
  
  // Add any remaining SQL
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Main function
function main() {
  try {
    console.log('Preparing SQL chunks for the Supabase SQL Editor...');
    
    // Read the combined migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'combined_migration.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Read migration file from ${migrationPath}, file size: ${migrationSql.length} bytes`);
    
    // Split SQL into chunks
    const chunks = splitIntoChunks(migrationSql);
    console.log(`Split SQL into ${chunks.length} chunks`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'supabase', 'sql-chunks');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write each chunk to a separate file
    chunks.forEach((chunk, index) => {
      const chunkFile = path.join(outputDir, `chunk-${index + 1}.sql`);
      fs.writeFileSync(chunkFile, chunk);
      console.log(`Wrote chunk ${index + 1} to ${chunkFile} (${chunk.length} chars)`);
    });
    
    console.log('\nInstructions:');
    console.log('1. Go to the Supabase Dashboard: https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql');
    console.log('2. For each chunk:');
    console.log('   a. Create a new query');
    console.log('   b. Copy and paste the contents of the chunk file');
    console.log('   c. Click "Run" to execute the SQL');
    console.log('3. Execute chunks in order from chunk-1.sql to chunk-' + chunks.length + '.sql');
    console.log('\nAfter running all chunks, verify the tables were created by running:');
    console.log('SELECT COUNT(*) FROM biomarker_references;');
    console.log('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'profiles\' AND column_name = \'api_keys\';');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 