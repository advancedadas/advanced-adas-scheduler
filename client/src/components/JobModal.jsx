import { useEffect, useState } from 'react';
import { api, SERVER_BASE } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyJob = { shopName: '', date: '', time: '09:00', job: '', assignedToId: '', completed: false };

export default function JobModal({ selectedJob, selectedDate, employees, onClose, onSaved }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState(emptyJob);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedJob) {
      setForm({
        shopName: selectedJob.shopName,
        date: selectedJob.date,
        time: selectedJob.time?.slice(0,5),
        job: selectedJob.job,
        assignedToId: selectedJob.assignedToId,
        completed: selectedJob.completed
      });
    } else {
      setForm({ ...emptyJob, date: selectedDate || new Date().toISOString().slice(0,10), assignedToId: employees[0]?.id || '' });
    }
  }, [selectedJob, selectedDate, employees]);

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let jobResponse;
      if (selectedJob?.id) jobResponse = await api.put(`/jobs/${selectedJob.id}`, form);
      else jobResponse = await api.post('/jobs', form);
      const jobId = jobResponse.data.job.id;
      if (files.length) {
        const data = new FormData();
        [...files].forEach(file => data.append('photos', file));
        await api.post(`/jobs/${jobId}/photos`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save job');
    } finally { setSaving(false); }
  }

  async function deleteJob() {
    if (!confirm('Delete this job permanently?')) return;
    await api.delete(`/jobs/${selectedJob.id}`);
    onSaved();
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={save}>
        <header><h2>{selectedJob ? 'Job Details' : 'New Calibration Job'}</h2><button type="button" onClick={onClose}>×</button></header>
        {error && <p className="error">{error}</p>}
        <label>Shop Name<input disabled={!isAdmin} value={form.shopName} onChange={e => update('shopName', e.target.value)} required /></label>
        <div className="grid-2"><label>Date<input disabled={!isAdmin} type="date" value={form.date} onChange={e => update('date', e.target.value)} required /></label><label>Time<input disabled={!isAdmin} type="time" value={form.time} onChange={e => update('time', e.target.value)} required /></label></div>
        <label>Job<textarea disabled={!isAdmin} value={form.job} onChange={e => update('job', e.target.value)} placeholder="Front radar calibration, windscreen camera calibration..." required /></label>
        {isAdmin && <label>Assigned Employee<select value={form.assignedToId} onChange={e => update('assignedToId', e.target.value)} required>{employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></label>}
        <label className="check"><input type="checkbox" checked={form.completed} onChange={e => update('completed', e.target.checked)} /> Job Completed</label>
        <label>Upload job photos<input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} /></label>
        {selectedJob?.photos?.length > 0 && <div><strong>Uploaded Photos</strong><div className="photo-grid">{selectedJob.photos.map(photo => { const photoUrl = photo.url?.startsWith('http') ? photo.url : `${SERVER_BASE}${photo.url}`; return <a key={photo.id} href={photoUrl} target="_blank" rel="noreferrer"><img src={photoUrl} alt={photo.originalName} /></a>; })}</div></div>}
        <footer><button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Job'}</button>{isAdmin && selectedJob && <button type="button" className="danger" onClick={deleteJob}>Delete</button>}<button type="button" className="secondary" onClick={onClose}>Cancel</button></footer>
      </form>
    </div>
  );
}
