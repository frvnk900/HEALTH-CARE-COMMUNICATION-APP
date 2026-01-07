from xhtml2pdf import pisa

# HTML template for a medical report
html_template = """
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.4; }
.header { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
.section { margin-bottom: 15px; }
.section-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
.table { width: 100%; border-collapse: collapse; margin-top: 5px; }
.table th, .table td { border: 1px solid black; padding: 5px; text-align: left; }
</style>
</head>
<body>
<div class="header">Medical Report</div>

<div class="section">
<div class="section-title">Patient Information</div>
<p>Name: John Doe</p>
<p>Age: 45</p>
<p>Gender: Male</p>
<p>Patient ID: 123456</p>
</div>

<div class="section">
<div class="section-title">Symptoms</div>
<ul>
<li>Fever</li>
<li>Cough</li>
<li>Shortness of breath</li>
</ul>
</div>

<div class="section">
<div class="section-title">Examination Findings</div>
<table class="table">
<tr><th>Test</th><th>Result</th><th>Normal Range</th></tr>
<tr><td>Blood Pressure</td><td>130/85 mmHg</td><td>120/80 mmHg</td></tr>
<tr><td>Temperature</td><td>38.2 °C</td><td>36.5-37.5 °C</td></tr>
<tr><td>Heart Rate</td><td>95 bpm</td><td>60-100 bpm</td></tr>
</table>
</div>

<div class="section">
<div class="section-title">Recommendations</div>
<p>Patient advised to rest, stay hydrated, and monitor temperature. Follow-up in 3 days or sooner if symptoms worsen.</p>
</div>

</body>
</html>
"""

# Generate PDF
output_file = "medical_report.pdf"
with open(output_file, "wb") as result_file:
    pisa_status = pisa.CreatePDF(html_template, dest=result_file)

if pisa_status.err:
    print("Error: PDF generation failed")
else:
    print(f"PDF generated successfully: {output_file}")
