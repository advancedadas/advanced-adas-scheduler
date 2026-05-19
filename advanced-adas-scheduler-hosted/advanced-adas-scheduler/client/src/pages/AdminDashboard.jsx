// force vercel rebuild
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, SERVER_BASE } from '../api/client';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employeeId: '', status: '', startDate: '', endDate: '' });
  const [overview, setOverview] = useState({ totals: { scheduled: 0, completed: 0, pending: 0 }, jobs: [] });

  async function load() {
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
    const [{ data: employeeData }, { data: overviewData }] = await Promise.all([api.get('/users/employees'), api.get('/admin/overview', { params })]);
    setEmployees(employeeData.employees); setOverview(overviewData);
  }
  useEffect(() => { load(); }, []);

  function update(key, value) { setFilters(prev => ({ ...prev, [key]: value })); }

  return <Layout><div className="page-head"><div><h1>Admin Dashboard</h1><p>Filter jobs, monitor completion, and review uploaded calibration photos.</p></div><button onClick={load}>Apply Filters</button></div><section className="stats"><div><span>Scheduled</span><strong>{overview.totals.scheduled}</strong></div><div><span>Completed</span><strong>{overview.totals.completed}</strong></div><div><span>Pending</span><strong>{overview.totals.pending}</strong></div></section><section className="filters"><select value={filters.employeeId} onChange={e => update('employeeId', e.target.value)}><option value="">All employees</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><select value={filters.status} onChange={e => update('status', e.target.value)}><option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option></select><input type="date" value={filters.startDate} onChange={e => update('startDate', e.target.value)} /><input type="date" value={filters.endDate} onChange={e => update('endDate', e.target.value)} /></section><div className="table-card"><table><thead><tr><th>Date</th><th>Time</th><th>Shop</th><th>Employee</th><th>Job</th><th>Status</th><th>Photos</th></tr></thead><tbody>{overview.jobs.map(job => <tr key={job.id}><td>{job.date}</td><td>{job.time?.slice(0,5)}</td><td>{job.shopName}</td><td>{job.assignedTo?.name}</td><td>{job.job}</td><td><span className={job.completed ? 'pill done' : 'pill pending'}>{job.completed ? 'Complete' : 'Pending'}</span></td><td><div className="photo-links">{job.photos.map(p => <a key={p.id} href={`${SERVER_BASE}${p.url}`} target="_blank" rel="noreferrer">Photo</a>)}</div></td></tr>)}</tbody></table></div></Layout>;
}
