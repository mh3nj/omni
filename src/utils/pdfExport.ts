import type { OmniData } from './dataManager';

// Simple PDF generation using browser print
export const exportToPDF = (
  data: OmniData,
  selectedTrackers: string[],
  dateRange?: { from: string; to: string },
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
      h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
      h2 { color: #34495e; margin-top: 30px; background: #ecf0f1; padding: 10px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #3498db; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .header { text-align: center; margin-bottom: 30px; }
      .date-range { color: #7f8c8d; font-size: 12px; text-align: center; margin-bottom: 20px; }
      footer { margin-top: 50px; text-align: center; font-size: 10px; color: #95a5a6; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
  `;

  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Omni Health Report</title>
      ${styles}
    </head>
    <body>
      <div class="header">
        <h1>Omni - Life Balance Health Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
  `;

  if (dateRange && (dateRange.from || dateRange.to)) {
    content += `<div class="date-range">Date Range: ${dateRange.from || 'Start'} to ${dateRange.to || 'Today'}</div>`;
  }

  // Helper to filter by date range
  const filterByDateRange = (items: any[], dateField: string = 'date') => {
    if (!dateRange || (!dateRange.from && !dateRange.to)) return items;
    return items.filter((item) => {
      const itemDate =
        item[dateField] || item.date || item.timestamp?.split('T')[0];
      if (!itemDate) return true;
      if (dateRange.from && itemDate < dateRange.from) return false;
      if (dateRange.to && itemDate > dateRange.to) return false;
      return true;
    });
  };

  // Glucose
  if (selectedTrackers.includes('glucose') && data.glucose?.length > 0) {
    const filtered = filterByDateRange(data.glucose, 'timestamp');
    if (filtered.length > 0) {
      content += `<h2>Blood Glucose</h2><table><tr><th>Date</th><th>Value (mg/dL)</th><th>Type</th><th>Insulin</th><th>Notes</th></tr>`;
      filtered.forEach((g: any) => {
        content += `<tr>
          <td>${new Date(g.timestamp).toLocaleDateString()}</td>
          <td>${g.value}</td>
          <td>${g.type || '—'}</td>
          <td>${g.insulinDose || '—'}</td>
          <td>${g.notes || '—'}</td>
        </tr>`;
      });
      content += `</table>`;
    }
  }

  // Blood Pressure
  if (
    selectedTrackers.includes('bloodPressure') &&
    data.bloodPressure?.length > 0
  ) {
    const filtered = filterByDateRange(data.bloodPressure, 'timestamp');
    if (filtered.length > 0) {
      content += `<h2>Blood Pressure</h2><table><tr><th>Date</th><th>Systolic/Diastolic</th><th>Pulse</th><th>Notes</th></tr>`;
      filtered.forEach((bp: any) => {
        content += `<tr>
          <td>${new Date(bp.timestamp).toLocaleDateString()}</td>
          <td>${bp.systolic}/${bp.diastolic}</td>
          <td>${bp.pulse || '—'}</td>
          <td>${bp.notes || '—'}</td>
        </tr>`;
      });
      content += `</table>`;
    }
  }

  // Water
  if (selectedTrackers.includes('water') && data.water?.length > 0) {
    const filtered = filterByDateRange(data.water);
    if (filtered.length > 0) {
      const totalWater = filtered.reduce(
        (sum: number, w: any) => sum + w.amount,
        0,
      );
      content += `<h2>Water Intake</h2><p>Total: ${totalWater} ml (${(totalWater / 1000).toFixed(1)} L)</p><table><tr><th>Date</th><th>Amount (ml)</th><th>Time</th></tr>`;
      filtered.forEach((w: any) => {
        content += `<tr><td>${w.date}</td><td>${w.amount}</td><td>${w.timestamp || '—'}</td></tr>`;
      });
      content += `</table>`;
    }
  }

  // Sleep
  if (selectedTrackers.includes('sleep') && data.sleep?.length > 0) {
    const filtered = filterByDateRange(data.sleep);
    if (filtered.length > 0) {
      const avgDuration =
        filtered.reduce((sum: number, s: any) => sum + s.duration, 0) /
        filtered.length;
      content += `<h2>Sleep</h2><p>Average Sleep Duration: ${avgDuration.toFixed(1)} hours</p><table><tr><th>Date</th><th>Duration (h)</th><th>Quality</th><th>Notes</th></tr>`;
      filtered.forEach((s: any) => {
        content += `<tr><td>${s.date}</td><td>${s.duration}</td><td>${s.quality}/5</td><td>${s.notes || '—'}</td></tr>`;
      });
      content += `</table>`;
    }
  }

  // Activity
  if (selectedTrackers.includes('activity') && data.activity?.length > 0) {
    const filtered = filterByDateRange(data.activity);
    if (filtered.length > 0) {
      const totalMinutes = filtered.reduce(
        (sum: number, a: any) => sum + a.duration,
        0,
      );
      content += `<h2>Physical Activity</h2><p>Total Activity: ${totalMinutes} minutes (${(totalMinutes / 60).toFixed(1)} hours)</p><table><tr><th>Date</th><th>Type</th><th>Duration (min)</th><th>Calories</th></tr>`;
      filtered.forEach((a: any) => {
        content += `<tr><td>${a.date}</td><td>${a.type}</td><td>${a.duration}</td><td>${a.calories || '—'}</td></tr>`;
      });
      content += `</table>`;
    }
  }

  // Weight
  if (selectedTrackers.includes('weight') && data.weight?.length > 0) {
    const filtered = filterByDateRange(data.weight);
    if (filtered.length > 0) {
      const latest = filtered[0];
      content += `<h2>Weight & BMI</h2><p>Latest: ${latest.weight} kg | BMI: ${latest.bmi}</p><table><tr><th>Date</th><th>Weight (kg)</th><th>BMI</th><th>Body Fat %</th></tr>`;
      filtered.forEach((w: any) => {
        content += `<tr><td>${w.date}</td><td>${w.weight}</td><td>${w.bmi}</td><td>${w.bodyFat || '—'}</td></tr>`;
      });
      content += `</table>`;
    }
  }

  // Habits
  if (selectedTrackers.includes('habits') && data.habits?.length > 0) {
    const filtered = filterByDateRange(data.habits);
    if (filtered.length > 0) {
      content += `<h2>Daily Habits</h2><table><tr><th>Date</th><th>No Smoking</th><th>No Alcohol</th><th>No Gambling</th><th>No Fast Food</th><th>Sports</th></tr>`;
      filtered.forEach((h: any) => {
        content += `<tr>
          <td>${h.date}</td>
          <td>${h.noSmoking ? '✓' : '✗'}</td>
          <td>${h.noAlcohol ? '✓' : '✗'}</td>
          <td>${h.noGambling ? '✓' : '✗'}</td>
          <td>${h.noFastFood ? '✓' : '✗'}</td>
          <td>${h.didSports ? '✓' : '✗'}</td>
        </tr>`;
      });
      content += `</table>`;
    }
  }

  content += `<footer>Omni - Life Balance Health Tracker | This report is for informational purposes only. Always consult your healthcare provider.</footer></body></html>`;
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

// Export to TXT
export const exportToTXT = (data: OmniData, selectedTrackers: string[]) => {
  let content = `OMNI - LIFE BALANCE HEALTH REPORT\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `${'='.repeat(60)}\n\n`;

  if (selectedTrackers.includes('glucose') && data.glucose?.length > 0) {
    content += `BLOOD GLUCOSE\n${'-'.repeat(30)}\n`;
    data.glucose.forEach((g: any) => {
      content += `${new Date(g.timestamp).toLocaleDateString()}: ${g.value} mg/dL (${g.type || '—'})\n`;
    });
    content += `\n`;
  }

  if (
    selectedTrackers.includes('bloodPressure') &&
    data.bloodPressure?.length > 0
  ) {
    content += `BLOOD PRESSURE\n${'-'.repeat(30)}\n`;
    data.bloodPressure.forEach((bp: any) => {
      content += `${new Date(bp.timestamp).toLocaleDateString()}: ${bp.systolic}/${bp.diastolic} mmHg\n`;
    });
    content += `\n`;
  }

  if (selectedTrackers.includes('water') && data.water?.length > 0) {
    const totalWater = data.water.reduce(
      (sum: number, w: any) => sum + w.amount,
      0,
    );
    content += `WATER INTAKE\n${'-'.repeat(30)}\n`;
    content += `Total: ${totalWater} ml (${(totalWater / 1000).toFixed(1)} L)\n\n`;
  }

  if (selectedTrackers.includes('weight') && data.weight?.length > 0) {
    const latest = data.weight[0];
    content += `WEIGHT & BMI\n${'-'.repeat(30)}\n`;
    content += `Latest: ${latest.weight} kg | BMI: ${latest.bmi}\n`;
    if (data.weight.length > 1) {
      const first = data.weight[data.weight.length - 1];
      const change = latest.weight - first.weight;
      content += `Change: ${change > 0 ? '+' : ''}${change.toFixed(1)} kg\n`;
    }
    content += `\n`;
  }

  content += `\n${'='.repeat(60)}\n`;
  content += `Omni - Life Balance | Track everything, master your health\n`;

  // Download as .txt file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omni_health_report_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
