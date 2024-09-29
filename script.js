document.addEventListener('DOMContentLoaded', () => {
    const irrigationForm = document.getElementById('irrigation-form');
    const dataTableBody = document.querySelector('#data-table tbody');
    const waterChart = document.getElementById('waterChart').getContext('2d');
    const generatePdfButton = document.getElementById('generate-pdf');

    let fieldData = [];
    let chartInstance;

    irrigationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get input values
        const fieldName = document.getElementById('field-name').value;
        const waterUsage = parseFloat(document.getElementById('water-usage').value);
        const rainfall = parseFloat(document.getElementById('rainfall').value);

        // Add data to the table
        const row = document.createElement('tr');
        row.innerHTML = `<td>${fieldName}</td><td>${waterUsage}</td><td>${rainfall}</td>`;
        dataTableBody.appendChild(row);

        // Store the data for the chart
        fieldData.push({ fieldName, waterUsage, rainfall });

        // Update the chart with the new data
        updateChart();

        // Reset the form for new input
        irrigationForm.reset();
    });

    // Function to update the scatter plot chart
    function updateChart() {
        const waterData = fieldData.map((data, index) => ({
            x: index,
            y: data.waterUsage
        }));

        const rainfallData = fieldData.map((data, index) => ({
            x: index,
            y: data.rainfall
        }));

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(waterChart, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Water Usage (liters)',
                        data: waterData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        pointRadius: 5
                    },
                    {
                        label: 'Rainfall (mm)',
                        data: rainfallData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        pointRadius: 5
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: 'Field Index'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Water Usage vs Rainfall per Field'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Function to calculate statistics
    function calculateStatistics() {
        const waterUsages = fieldData.map(data => data.waterUsage);
        const mean = waterUsages.reduce((a, b) => a + b, 0) / waterUsages.length;

        const variance = waterUsages.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / waterUsages.length;
        const stdDev = Math.sqrt(variance);
        const max = Math.max(...waterUsages);
        const min = Math.min(...waterUsages);

        return { mean, variance, stdDev, max, min };
    }

    // Function to generate PDF report
    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(16);
        pdf.text("AgriTatva Water Usage Report", 10, 10); // Company name added
        pdf.setFontSize(12);
        
        // Create a table header
        pdf.text("Field Name", 10, 30);
        pdf.text("Water Usage (liters)", 80, 30);
        pdf.text("Rainfall (mm)", 150, 30);
        
        let yOffset = 40; // Starting position for the table rows
        
        // Populate the table rows
        fieldData.forEach(data => {
            pdf.text(data.fieldName, 10, yOffset);
            pdf.text(data.waterUsage.toString(), 80, yOffset);
            pdf.text(data.rainfall.toString(), 150, yOffset);
            yOffset += 10; // Move to the next row
        });

        // Calculate statistics
        const stats = calculateStatistics();
        
        // Add statistics to the PDF
        pdf.text(`\nTotal Fields: ${fieldData.length}`, 10, yOffset);
        yOffset += 10;
        pdf.text(`Mean Water Usage: ${stats.mean.toFixed(2)} liters`, 10, yOffset);
        yOffset += 10;
        pdf.text(`Max Water Usage: ${stats.max} liters`, 10, yOffset);
        yOffset += 10;
        pdf.text(`Min Water Usage: ${stats.min} liters`, 10, yOffset);
        yOffset += 10;

        // AI-generated tip
        pdf.text(`\nAI Tip:`, 10, yOffset);
        yOffset += 10;
        pdf.text("To enhance water conservation, consider implementing precision irrigation techniques.", 10, yOffset);
        yOffset += 10;
        pdf.text("Regularly monitor soil moisture levels and adjust irrigation schedules accordingly.", 10, yOffset);
        yOffset += 10;
        pdf.text("Utilize rainwater harvesting systems to supplement irrigation needs.", 10, yOffset);
        yOffset += 10;
        pdf.text("Educate farmers on water management practices for sustainable agriculture.", 10, yOffset);

        // Save the PDF
        pdf.save('water_usage_report.pdf');
    }

    // Add event listener for PDF generation
    generatePdfButton.addEventListener('click', generatePDF);
});
