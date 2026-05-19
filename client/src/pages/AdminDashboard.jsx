import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, SERVER_BASE, usersApi } from '../api/client';

export default function AdminDashboard() {
  const [overview, setOverview] = useState({
    totals: { scheduled: 0, completed: 0, pending: 0 },
    jobs: []
  });

  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    color: '#2563eb',
    active: true
  });

  const [userMessage, setUserMessage] = useState('');

  async function load() {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );

    const [{ data: employeeData }, { data: overviewData }] = await Promise.all([
      api.get('/users/employees'),
      api.get('/admin/overview', { params })
    ]);

    setEmployees(employeeData.employees);
    setOverview(overviewData);
  }

  useEffect(() => {
    load();
  }, []);

  function update(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setUserMessage('');

    try {
      await usersApi.create(newUser);

      setUserMessage('User created successfully.');

      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        color: '#2563eb',
        active: true
      });

      await load();
    } catch (err) {
      setUserMessage(err.response?.data?.message || 'Could not create user.');
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Filter jobs, monitor completion, and review uploaded calibration photos.</p>
        </div>

        <button onClick={load}>Apply Filters</button>
      </div>

      <section className="stats">
        <div>
          <span>Scheduled</span>
          <strong>{overview.totals.scheduled}</strong>
        </div>

        <div>
          <span>Completed</span>
          <strong>{overview.totals.completed}</strong>
        </div>

        <div>
          <span>Pending</span>
          <strong>{overview.totals.pending}</strong>
        </div>
      </section>

      <div className="table-card" style={{ marginBottom: 18 }}>
        <h2>Add New User</h2>

        {userMessage && <p style={{ marginBottom: 10 }}>{userMessage}</p>}

        <form onSubmit={handleCreateUser} className="grid-2">
          <label>
            Name
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </label>

          <label>
            Role
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label>
            Colour
            <input
              type="color"
              value={newUser.color}
              onChange={(e) => setNewUser({ ...newUser, color: e.target.value })}
            />
          </label>

          <label className="check">
            <input
              type="checkbox"
              checked={newUser.active}
              onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
            />
            Active
          </label>

          <button type="submit">Create User</button>
        </form>
      </div>

      <section className="filters">
        <select
          value={filters.employeeId}
          onChange={(e) => update('employeeId', e.target.value)}
        >
          <option value="">All employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update('startDate', e.target.value)}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update('endDate', e.target.value)}
        />
      </section>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Shop</th>
              <th>Employee</th>
              <th>Job</th>
              <th>Status</th>
              <th>Photos</th>
            </tr>
          </thead>

          <tbody>
            {overview.jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.date}</td>
                <td>{job.time?.slice(0, 5)}</td>
                <td>{job.shopName}</td>
                <td>{job.assignedTo?.name}</td>
                <td>{job.job}</td>
                <td>
                  <span className={job.completed ? 'pill done' : 'pill pending'}>
                    {job.completed ? 'Complete' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="photo-links">
                    {job.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={`${SERVER_BASE}${photo.url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Photo
                      </a>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
