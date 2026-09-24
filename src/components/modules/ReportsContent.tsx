'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Download,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  Modal,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

interface ReportHistoryItem {
  id: string;
  name: string;
  type: 'Vehicle Compliance' | 'Driver Safety' | 'Trip Summary';
  generatedDate: string;
  generatedBy: string;
  dateRange: string;
  recordCount: number;
}

const INITIAL_REPORTS: ReportHistoryItem[] = [
  {
    id: 'rep-1',
    name: 'Fleet Vehicle Compliance Audit Report',
    type: 'Vehicle Compliance',
    generatedDate: '2026-08-05 16:30',
    generatedBy: 'Sylborn Furtado',
    dateRange: '2026-07-01 to 2026-08-05',
    recordCount: 5
  },
  {
    id: 'rep-2',
    name: 'Driver Safety Telemetry & Risk Summary',
    type: 'Driver Safety',
    generatedDate: '2026-08-04 11:15',
    generatedBy: 'Rajesh Varma',
    dateRange: '2026-07-01 to 2026-07-31',
    recordCount: 4
  },
  {
    id: 'rep-3',
    name: 'Monthly Trip Dispatch & Toll Spend Digest',
    type: 'Trip Summary',
    generatedDate: '2026-08-01 09:00',
    generatedBy: 'Anil Deshmukh',
    dateRange: '2026-07-01 to 2026-07-31',
    recordCount: 8
  }
];

export function ReportsContent() {
  const { vehicles, drivers, trips, currentUser } = useApp();
  const [reports, setReports] = useState<ReportHistoryItem[]>(INITIAL_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [reportType, setReportType] = useState<'Vehicle Compliance' | 'Driver Safety' | 'Trip Summary'>('Vehicle Compliance');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-08-06');

  const handleTriggerExport = (type: ReportHistoryItem['type']) => {
    if (type === 'Vehicle Compliance') {
      const data = vehicles.map(v => ({
        Registration: v.regNumber,
        Category: v.category,
        Make: v.make,
        Model: v.model,
        DocStatus: v.docStatus,
        MaintenanceStatus: v.maintenanceStatus,
        RCExpiry: v.rcExpiry,
        InsuranceExpiry: v.insuranceExpiry,
        FitnessExpiry: v.fitnessExpiry
      }));
      exportToCSV(data, `vehicle_compliance_report_${new Date().toISOString().slice(0, 10)}`);
    } else if (type === 'Driver Safety') {
      const data = drivers.map(d => ({
        FullName: d.fullName,
        Phone: d.phone,
        LicenseNumber: d.licenseNumber,
        SafetyScore: d.safetyScore || 90,
        OverspeedEvents: d.safetyEvents?.overspeedCount || 0,
        HarshBrakingEvents: d.safetyEvents?.harshBrakingCount || 0,
        RapidAccelEvents: d.safetyEvents?.rapidAccelCount || 0,
        FatigueAlerts: d.safetyEvents?.fatigueAlertCount || 0,
        SeatbeltViolations: d.safetyEvents?.seatbeltViolationCount || 0
      }));
      exportToCSV(data, `driver_safety_report_${new Date().toISOString().slice(0, 10)}`);
    } else if (type === 'Trip Summary') {
      const data = trips.map(t => ({
        TripCode: t.tripCode,
        VehicleReg: t.vehicleReg,
        DriverName: t.driverName,
        Origin: t.origin.city,
        Destination: t.destination.city,
        Status: t.status,
        DistanceKm: t.distanceKm,
        EwayBillNumber: t.ewayBillNumber || '',
        TollSpendINR: t.tollSpendINR || 0,
        PODReceived: t.podReceived
      }));
      exportToCSV(data, `trip_summary_report_${new Date().toISOString().slice(0, 10)}`);
    }
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();

    let count = 0;
    let nameTitle = '';

    if (reportType === 'Vehicle Compliance') {
      count = vehicles.length;
      nameTitle = 'Fleet Vehicle Compliance Audit Report';
    } else if (reportType === 'Driver Safety') {
      count = drivers.length;
      nameTitle = 'Driver Safety Telemetry & Risk Summary';
    } else {
      count = trips.length;
      nameTitle = 'Trip Dispatch & Toll Spend Digest';
    }

    const newReport: ReportHistoryItem = {
      id: `rep-${Date.now()}`,
      name: nameTitle,
      type: reportType,
      generatedDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      generatedBy: currentUser?.name || 'Sylborn Furtado',
      dateRange: `${startDate} to ${endDate}`,
      recordCount: count
    };

    setReports([newReport, ...reports]);
    setIsModalOpen(false);

    // Trigger immediate CSV download
    handleTriggerExport(reportType);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Audits & Exports
            </span>
          }
          title="Reporting & Telemetry Export Center"
          description="Operational compliance audit logs, driver risk scorecards, GST E-Way Bill history, and enterprise CSV data exports."
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Generate New Report
            </Button>
          }
        />
      </motion.div>

      {/* 2. Reports History Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Generated Reports Archive</span>
          </div>
          <Badge variant="info">{reports.length} Reports Archived</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4">Report Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 font-mono">Date Range</th>
                <th className="py-3.5 px-4 font-mono">Generated Date</th>
                <th className="py-3.5 px-4">Generated By</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {reports.map(rep => (
                <tr key={rep.id} className="transition-colors hover:bg-surface-muted">
                  <td className="flex items-center gap-2.5 px-4 py-3.5 font-semibold text-text-primary">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{rep.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {rep.type === 'Vehicle Compliance' && <Badge variant="info">Vehicle Compliance</Badge>}
                    {rep.type === 'Driver Safety' && <Badge variant="success">Driver Safety</Badge>}
                    {rep.type === 'Trip Summary' && <Badge variant="warning">Trip Summary</Badge>}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-text-secondary">{rep.dateRange}</td>
                  <td className="px-4 py-3.5 font-mono text-text-secondary">{rep.generatedDate}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{rep.generatedBy}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriggerExport(rep.type)}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Download CSV
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 3. Generate New Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Telemetry Report"
        description="Select report type and date range to compile and export commercial fleet analytics."
        size="md"
      >
        <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Select Report Scope *</label>
            <select
              required
              value={reportType}
              onChange={e => setReportType(e.target.value as ReportHistoryItem['type'])}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <option value="Vehicle Compliance">Vehicle Compliance & RC/Insurance Vault</option>
              <option value="Driver Safety">Driver Safety Telemetry & Risk Scorecard</option>
              <option value="Trip Summary">Trip Dispatch, E-Way Bill & FASTag Toll Digest</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Download className="w-3.5 h-3.5" />}>
              Compile & Download CSV
            </Button>
          </div>
        </form>
      </Modal>
    </AnimatedPage>
  );
}
