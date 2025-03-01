#!/usr/bin/env python3
"""
Verification script for Supabase MCP integration with RuneHealth.
This script tests the connection to the Supabase MCP server and retrieves database schema information.
"""

import requests
import json

def test_mcp_connection():
    """Test connection to the Supabase MCP server"""
    
    try:
        # Make a request to the MCP server
        response = requests.post(
            "http://localhost:8080/mcp",
            json={
                "request_id": "test-connection",
                "name": "get_db_schemas",
                "params": {}
            },
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        # Check response
        if response.status_code == 200:
            print("✅ Successfully connected to Supabase MCP Server!")
            data = response.json()
            print("\nDatabase schemas:")
            for schema in data.get('result', []):
                print(f"  - {schema.get('schema_name')}: {schema.get('tables_count')} tables, {schema.get('size_pretty')}")
            return True
        else:
            print(f"❌ Failed to connect to MCP Server: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error connecting to MCP Server: {str(e)}")
        return False

def test_biomarkers_query():
    """Test querying biomarker information from the database"""
    
    try:
        # Make a request to execute a SQL query
        response = requests.post(
            "http://localhost:8080/mcp",
            json={
                "request_id": "test-biomarkers",
                "name": "execute_sql_query",
                "params": {
                    "query": "SELECT COUNT(*) as biomarker_count FROM biomarker_definitions"
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        # Check response
        if response.status_code == 200:
            data = response.json()
            result = data.get('result', [])
            if result and len(result) > 0:
                biomarker_count = result[0].get('biomarker_count', 0)
                print(f"\n✅ Successfully queried biomarkers: Found {biomarker_count} biomarker definitions")
                return True
            else:
                print("⚠️ Query executed but returned no results")
                return True
        else:
            print(f"❌ Failed to execute biomarkers query: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error executing biomarkers query: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Supabase MCP Server Verification ===")
    
    connection_result = test_mcp_connection()
    if connection_result:
        test_biomarkers_query()
    
    print("\nVerification complete!") 