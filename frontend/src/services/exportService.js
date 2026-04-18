import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

class ExportService {
  
  // Export complaints to Excel
  static exportToExcel(complaints, filename = 'complaints_report') {
    const worksheet = XLSX.utils.json_to_sheet(complaints.map(c => ({
      'ID': c.id,
      'Type': c.complaint_type,
      'Priority': c.priority,
      'Status': c.status,
      'Latitude': c.latitude,
      'Longitude': c.longitude,
      'Description': c.description,
      'Submitted': new Date(c.created_at).toLocaleString(),
      'Completed': c.completed_at ? new Date(c.completed_at).toLocaleString() : 'N/A'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
  
  // Export complaints to PDF
  static exportToPDF(complaints, stats, filename = 'complaints_report') {
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFillColor(27, 94, 32);
    doc.rect(0, 0, 297, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('CleanRoute-AI - Complaints Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    
    // Statistics Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Statistics Summary', 14, 55);
    
    const statsData = [
      ['Total Complaints', stats?.total_complaints || 0],
      ['Pending', stats?.pending_complaints || 0],
      ['Completed', stats?.completed_complaints || stats?.resolved_complaints || 0],
      ['Resolution Rate', `${stats?.resolution_rate || 0}%`]
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80], textColor: 255 },
      margin: { left: 14 }
    });
    
    // Complaints Table
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text('Complaints Details', 14, finalY);
    
    const tableData = complaints.map(c => [
      c.id,
      c.complaint_type,
      c.priority,
      c.status,
      c.latitude,
      c.longitude,
      new Date(c.created_at).toLocaleDateString()
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['ID', 'Type', 'Priority', 'Status', 'Latitude', 'Longitude', 'Date']],
      body: tableData.slice(0, 50),
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80], textColor: 255 },
      margin: { left: 14 }
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  // Export statistics to Excel
  static exportStatsToExcel(stats, complaintsByType, complaintsByPriority) {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Complaints', stats?.total_complaints || 0],
      ['Pending', stats?.pending_complaints || 0],
      ['Completed', stats?.completed_complaints || stats?.resolved_complaints || 0],
      ['Resolution Rate', `${stats?.resolution_rate || 0}%`]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // By Type sheet
    const typeSheet = XLSX.utils.json_to_sheet(complaintsByType || []);
    XLSX.utils.book_append_sheet(workbook, typeSheet, 'By Type');
    
    // By Priority sheet
    const prioritySheet = XLSX.utils.json_to_sheet(complaintsByPriority || []);
    XLSX.utils.book_append_sheet(workbook, prioritySheet, 'By Priority');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `statistics_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

export default ExportService;
