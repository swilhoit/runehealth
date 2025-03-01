#!/usr/bin/env python3
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import urllib.parse
from datetime import datetime, timedelta
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase connection details from environment
SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF")
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")

if not SUPABASE_PROJECT_REF or not SUPABASE_DB_PASSWORD:
    print("Error: Missing Supabase credentials. Set SUPABASE_PROJECT_REF and SUPABASE_DB_PASSWORD environment variables.")
    sys.exit(1)

# Construct the database URL
encoded_password = urllib.parse.quote_plus(SUPABASE_DB_PASSWORD)
db_host = f"{SUPABASE_PROJECT_REF}.supabase.co"
db_url = f"postgresql://postgres:{encoded_password}@{db_host}:5432/postgres"

# Helper function to format timestamps
def format_timestamp(ts):
    if not ts:
        return "NULL"
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace('Z', '+00:00'))
        except ValueError:
            return ts
    return ts.strftime("%Y-%m-%d %H:%M:%S")

# Connect to the database
try:
    print(f"Connecting to database at {db_host}...")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    print("Connected successfully!")
except Exception as e:
    print(f"Error connecting to database: {e}")
    sys.exit(1)

# Create a cursor with dictionary results
cursor = conn.cursor(cursor_factory=RealDictCursor)

print("\n=== Diagnosing PDF Extraction and Lab Report Processing ===\n")

# Phase 1: Check reports that are stuck in 'processing'
print("1. Checking reports stuck in 'processing' status:")
cursor.execute("""
    SELECT id, user_id, status, file_path, pdf_url, created_at, updated_at
    FROM lab_reports
    WHERE status = 'processing'
    ORDER BY created_at DESC
    LIMIT 10
""")
stuck_reports = cursor.fetchall()

if not stuck_reports:
    print("No reports stuck in 'processing' status found.")
else:
    print(f"Found {len(stuck_reports)} reports stuck in 'processing' status:")
    for report in stuck_reports:
        duration = datetime.now() - report['created_at'] if report['created_at'] else "unknown"
        print(f"  - Report ID: {report['id']}")
        print(f"    User ID: {report['user_id']}")
        print(f"    Created: {format_timestamp(report['created_at'])}")
        print(f"    Updated: {format_timestamp(report['updated_at'])}")
        print(f"    Age: {duration}")
        print(f"    Has PDF URL: {'Yes' if report['pdf_url'] else 'No'}")
        print(f"    File path: {report['file_path']}")
        print()

        # Check if the file exists in storage
        file_path = report['file_path']
        if file_path:
            cursor.execute("""
                SELECT name, id FROM storage.objects
                WHERE name = %s
            """, (file_path,))
            storage_file = cursor.fetchone()
            if storage_file:
                print(f"    File found in storage: {storage_file['name']} (ID: {storage_file['id']})")
            else:
                print(f"    WARNING: File not found in storage: {file_path}")

        print()

# Phase 2: Check if there's any biomarker processing data for these reports
if stuck_reports:
    report_ids = [report['id'] for report in stuck_reports]
    placeholders = ','.join(['%s'] * len(report_ids))
    
    print("\n2. Checking for biomarker data for these reports:")
    cursor.execute(f"""
        SELECT report_id, COUNT(*) as biomarker_count
        FROM biomarkers
        WHERE report_id IN ({placeholders})
        GROUP BY report_id
    """, report_ids)
    
    biomarker_data = cursor.fetchall()
    if not biomarker_data:
        print("No biomarker data found for any of these reports.")
    else:
        print("Biomarker data found:")
        for data in biomarker_data:
            print(f"  - Report ID: {data['report_id']}")
            print(f"    Biomarker count: {data['biomarker_count']}")
            print()

# Phase 3: Check distribution of report statuses
print("\n3. Distribution of report statuses:")
cursor.execute("""
    SELECT status, COUNT(*) as count
    FROM lab_reports
    GROUP BY status
    ORDER BY count DESC
""")
status_distribution = cursor.fetchall()

for status in status_distribution:
    print(f"  - {status['status']}: {status['count']} reports")

# Phase 4: Check processing time statistics
print("\n4. Processing time statistics:")
cursor.execute("""
    SELECT 
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_seconds,
        MIN(EXTRACT(EPOCH FROM (updated_at - created_at))) as min_seconds,
        MAX(EXTRACT(EPOCH FROM (updated_at - created_at))) as max_seconds
    FROM lab_reports
    WHERE updated_at IS NOT NULL
    GROUP BY status
    ORDER BY count DESC
""")
processing_stats = cursor.fetchall()

for stat in processing_stats:
    if stat['avg_seconds'] is not None:
        print(f"  - {stat['status']}:")
        print(f"    Count: {stat['count']} reports")
        print(f"    Average processing time: {stat['avg_seconds']:.2f} seconds")
        print(f"    Min processing time: {stat['min_seconds']:.2f} seconds")
        print(f"    Max processing time: {stat['max_seconds']:.2f} seconds")
        print()

# Phase 5: Check recent successful reports for comparison
print("\n5. Recent successfully completed reports:")
cursor.execute("""
    SELECT id, user_id, status, file_path, pdf_url, created_at, updated_at
    FROM lab_reports
    WHERE status = 'completed'
    ORDER BY created_at DESC
    LIMIT 5
""")
completed_reports = cursor.fetchall()

for report in completed_reports:
    processing_time = report['updated_at'] - report['created_at'] if report['updated_at'] and report['created_at'] else "unknown"
    print(f"  - Report ID: {report['id']}")
    print(f"    User ID: {report['user_id']}")
    print(f"    Created: {format_timestamp(report['created_at'])}")
    print(f"    Completed: {format_timestamp(report['updated_at'])}")
    print(f"    Processing time: {processing_time}")
    print(f"    Has PDF URL: {'Yes' if report['pdf_url'] else 'No'}")
    print()

# Phase 6: Check for missing transition to analyze-new endpoint
print("\n6. Check for routes.ts or background processing:")
print("  • The current analyze-new route uploads files and creates reports with 'processing' status")
print("  • However, there is no automatic transition from 'processing' to 'completed'")
print("  • Missing components:")
print("    - No background processing task was found to handle the PDF extraction")
print("    - No callback registration to update report status after upload")
print("    - No webhook or event mechanism to trigger biomarker extraction")
print("  • Expected fixes:")
print("    - Add extraction code to the analyze-new route that was present in the BAK files")
print("    - Update lab report status to 'completed' after extraction finishes")

# Phase 7: Diagnose specific problematic report IDs
print("\n7. Checking specific problematic report IDs:")
problematic_ids = [
    "b2e5611c-0b32-44c0-8fdd-8c06cf8d7ff3",
    "05e8faed-d5d2-4d19-a22d-7f5eb1f22129"
]

for report_id in problematic_ids:
    print(f"  - Looking for report ID: {report_id}")
    cursor.execute("""
        SELECT * FROM lab_reports
        WHERE id = %s
    """, (report_id,))
    report = cursor.fetchone()
    
    if report:
        print(f"    Report found!")
        print(f"    Status: {report['status']}")
        print(f"    Created: {format_timestamp(report['created_at'])}")
        print(f"    Updated: {format_timestamp(report['updated_at'])}")
        print(f"    File path: {report['file_path']}")
    else:
        print(f"    Report not found in database.")

        # Check if it might be in storage without a database entry
        cursor.execute("""
            SELECT * FROM storage.objects
            WHERE name LIKE %s
        """, (f"%{report_id}%",))
        storage_object = cursor.fetchone()
        
        if storage_object:
            print(f"    Found file in storage: {storage_object['name']}")
        else:
            print(f"    No files found in storage containing this ID.")
    
    print()

# Phase 8: Provide recommended fix
print("\n=== DIAGNOSIS ===")
print("1. PROBLEM: PDF upload and report creation work correctly.")
print("2. PROBLEM: No biomarker extraction happens after upload.")
print("3. PROBLEM: Reports stay in 'processing' status indefinitely.")
print("\nRECOMMENDED FIX:")
print("You need to update app/api/analyze-new/route.ts to include the biomarker extraction code")
print("from the .bak2 file, which will:")
print("  a. Extract biomarkers from the PDF")
print("  b. Save biomarkers to the database")
print("  c. Update report status to 'completed'")
print("\nAlternatively, implement a background processing task that:")
print("  a. Periodically checks for reports in 'processing' status")
print("  b. Processes them by extracting biomarkers")
print("  c. Updates their status to 'completed'")

# Close the connection
cursor.close()
conn.close()

print("\nDiagnostic script completed.") 