/**
 * Utility to export JSON data to a downloadable CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file (e.g., 'users-report')
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  // extract headers
  const headers = Object.keys(data[0]);
  
  // convert to CSV string
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header] ?? '';
        // handle strings with commas or quotes
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""');
          if (val.includes(',') || val.includes('"')) val = `"${val}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  // create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
