import { useState } from 'react';
import { FileText, Clock } from 'lucide-react';
import { getIncidents, updateIncident } from '../lib/storage';
import EmptyState from '../components/common/EmptyState';
export default function IncidentsPage() {
  const [incidents, setIncidents] = useState(getIncidents);
  const [reportingId, setReportingId] = useState(null);
  const [report, setReport] = useState('');

  const handleSubmitReport = (id) => {
    updateIncident(id, { report: report.trim(), reportedAt: new Date().toISOString() });
    setIncidents(getIncidents());
    setReportingId(null);
    setReport('');
  };

  return (
    <div className="px-4 py-6 safe-area-top">
      <h1 className="text-2xl font-bold mb-1">Incident Log</h1>
      <p className="text-sm text-charcoal/60 dark:text-offwhite/60 mb-8">
        Review and document past SOS events
      </p>

      {incidents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No incidents recorded"
          description="When you use SOS, incidents are logged here for your records."
        />
      ) : (
        <ul className="space-y-4" role="list">
          {incidents.map((inc) => (
            <li key={inc.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold capitalize">{inc.type?.replace('_', ' ') || 'SOS'}</p>
                  <p className="text-xs text-charcoal/50 dark:text-offwhite/50 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {new Date(inc.startedAt).toLocaleString()}
                  </p>
                </div>
                {inc.report ? (
                  <span className="text-xs text-success font-semibold">Reported</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReportingId(inc.id)}
                    className="text-xs text-accent font-semibold"
                  >
                    Add report
                  </button>
                )}
              </div>
              <p className="text-xs text-charcoal/40 dark:text-offwhite/40">
                {inc.contactsNotified?.length || 0} contacts notified · {inc.locationTrail?.length || 0} location points
              </p>
              {inc.report && (
                <p className="text-sm mt-3 p-3 rounded-xl bg-charcoal/5 dark:bg-white/5">{inc.report}</p>
              )}
              {reportingId === inc.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    placeholder="Describe what happened (optional, stored locally)..."
                    className="w-full px-3 py-2 rounded-xl bg-charcoal/5 dark:bg-white/5 border border-transparent focus:border-accent focus:outline-none text-sm min-h-[80px] resize-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleSubmitReport(inc.id)} className="btn-primary text-sm py-2 flex-1">
                      Save report
                    </button>
                    <button type="button" onClick={() => setReportingId(null)} className="btn-ghost text-sm py-2 flex-1">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
