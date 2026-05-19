import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import Layout from '../components/Layout';
import JobModal from '../components/JobModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CalendarPage() {
  const { isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(null);

  async function load() {
    const [{ data: jobData }, empResult] = await Promise.all([
      api.get('/jobs'),
      isAdmin ? api.get('/users/employees') : Promise.resolve({ data: { employees: [] } })
    ]);
    setJobs(jobData.jobs);
    setEmployees(empResult.data.employees);
  }
  useEffect(() => { load(); }, []);

  const events = useMemo(() => jobs.map(job => ({
    id: job.id,
    title: `${job.completed ? '✓ ' : ''}${job.shopName}`,
    start: `${job.date}T${job.time}`,
    backgroundColor: job.completed ? '#16a34a' : (job.assignedTo?.color || '#64748b'),
    borderColor: job.completed ? '#16a34a' : (job.assignedTo?.color || '#64748b'),
    extendedProps: job
  })), [jobs]);

  return <Layout><div className="page-head"><div><h1>Job Calendar</h1><p>{isAdmin ? 'All assigned calibration jobs, colour-coded by employee.' : 'Your assigned calibration jobs only.'}</p></div>{isAdmin && <button onClick={() => setModal({})}>New Job</button>}</div><div className="calendar-card"><FullCalendar plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} initialView="timeGridWeek" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }} events={events} selectable={isAdmin} dateClick={info => isAdmin && setModal({ date: info.dateStr.slice(0,10) })} eventClick={info => setModal({ job: info.event.extendedProps })} height="auto" /></div>{modal && <JobModal selectedJob={modal.job} selectedDate={modal.date} employees={employees} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}</Layout>;
}
