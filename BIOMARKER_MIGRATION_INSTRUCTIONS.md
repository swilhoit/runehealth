# Biomarker Migration Instructions

## Summary
The `biomarker_definitions` table needs to be created in your Supabase database. This table will store all standardized biomarker information, which is necessary for proper biomarker validation and normalization in the application.

## Current Status
- The application is referencing a `biomarker_definitions` table that doesn't exist yet
- This table is needed for validating biomarker names from lab reports
- 103 biomarkers are referenced in your application logs, but they might be stored in a different table or format

## Instructions for Creating the Table

### Option 1: Using the Supabase SQL Editor (Recommended)

1. Login to your Supabase dashboard: https://supabase.com/dashboard/project/renqczffpovkvkelvjvv/sql
2. Click on the SQL Editor
3. Copy and paste the SQL from the file `supabase/migrations/add_biomarkers.sql`
4. Click "Run" to execute the SQL
5. Verify the table was created by running: `SELECT COUNT(*) FROM biomarker_definitions;`

### Option 2: Using the Migration Scripts

If you have the Supabase service role key, you can run:

```bash
# Make sure you have the SUPABASE_SERVICE_ROLE_KEY in your .env file
chmod +x scripts/add-biomarkers.js
node scripts/add-biomarkers.js
```

## Biomarker List

The following biomarkers will be added to the table:

### Complete Blood Count (CBC)
- WBC
- RBC
- Hemoglobin
- Hematocrit
- MCV
- MCH
- MCHC
- RDW
- Platelets
- Neutrophils
- Lymphs
- Monocytes
- Eos
- Basos
- Neutrophils (Absolute)
- Lymphs (Absolute)
- Monocytes (Absolute)
- Eos (Absolute)
- Baso (Absolute)
- Immature Granulocytes
- Immature Grans (Abs)

### Comprehensive Metabolic Panel (CMP)
- Glucose
- BUN
- Creatinine
- eGFR
- BUN/Creatinine Ratio
- Sodium
- Potassium
- Chloride
- Carbon Dioxide, Total
- Calcium
- Protein, Total
- Albumin
- Globulin, Total
- A/G Ratio
- Bilirubin, Total
- Alkaline Phosphatase
- AST (SGOT)
- ALT (SGPT)
- GGT

### Lipid Panel
- Cholesterol, Total
- Triglycerides
- HDL Cholesterol
- VLDL Cholesterol Cal
- LDL Chol Calc (NIH)
- Apolipoprotein B

### Hormones
- Testosterone
- Free Testosterone (Direct)
- DHEA-Sulfate
- Cortisol
- Insulin

### Thyroid Panel
- T4, Free (Direct)
- TSH
- Triiodothyronine (T3)
- Thyroglobulin Antibody
- Thyroid Peroxidase (TPO) Ab

### Vitamins and Nutrients
- Folate (Folic Acid), Serum
- Vitamin D, 25-Hydroxy
- Vitamin B12
- Magnesium

### Iron Studies
- Iron
- Ferritin

### Inflammation Markers
- C-Reactive Protein, Cardiac
- Homocyst(e)ine

### Diabetes Markers
- Hemoglobin A1c

## Verifying the Migration

After creating the table, you can verify it's working correctly by:

1. Restarting your application: `npm run dev`
2. Checking the logs for biomarker-related errors
3. Running the verification script: `node scripts/check-biomarker-table.js`

## Next Steps

Once the biomarker_definitions table is created:

1. Your application will validate biomarker names properly
2. The biomarker normalization function will work correctly
3. You can continue adding more biomarkers to the reference table as needed 