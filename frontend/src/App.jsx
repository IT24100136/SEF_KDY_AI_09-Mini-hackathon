import { useState, useEffect } from 'react';

function App() {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [view, setView] = useState('all'); // 'all' or 'add'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    title: '', assignee: '', priority: 'Medium', dueDate: '', status: 'To Do'
  });

  const API_URL = 'http://localhost:5000/api/tasks'; // Ensure this matches your backend port

  // --- EFFECTS ---
  // Load initial seed data from backend if local storage is empty
  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, []);

  // Sync to Local Storage automatically
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- API CALLS ---
  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.length > 0) setTasks(data);
    } catch (err) {
      console.error("Backend offline, using local storage");
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    
    // Validation: Title required, Date cannot be in past
    if (!formData.title || !formData.dueDate) return alert("Title and Due Date are required.");
    const today = new Date().toISOString().split('T')[0];
    if (formData.dueDate < today) return alert("Due date cannot be in the past.");

    const newTask = { ...formData, id: Date.now() }; // Optimistic ID
    setTasks(prev => [...prev, newTask]);
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchTasks(); // Refresh to get official backend ID
    } catch (err) {
      console.error("Saved to local storage only.");
    }
    
    setView('all');
    setFormData({ title: '', assignee: '', priority: 'Medium', dueDate: '', status: 'To Do' });
  };

  const updateStatus = async (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // --- DATA PROCESSING (Filtering, Sorting, Summaries) ---
  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterStatus === 'All' ? true : t.status === filterStatus)
    .filter(t => filterAssignee === 'All' ? true : t.assignee.toLowerCase().includes(filterAssignee.toLowerCase()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort by due date

  const summary = {
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  const uniqueAssignees = [...new Set(tasks.map(t => t.assignee))].filter(a => a);

  // --- RENDER ---
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Task Tracker</h2>
        <div>
          <button onClick={() => setView('all')} style={{ marginRight: '10px', padding: '8px 16px' }}>All Tasks</button>
          <button onClick={() => setView('add')} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>+ Add Task</button>
        </div>
      </div>

      {/* Task Count Summary (Stretch Goal) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <strong>Summary:</strong>
        <span style={{ color: '#dc3545' }}>{summary.todo} To Do</span> | 
        <span style={{ color: '#ffc107' }}>{summary.inProgress} In Progress</span> | 
        <span style={{ color: '#28a745' }}>{summary.done} Done</span>
      </div>

      {/* VIEW: ADD TASK */}
      {view === 'add' && (
        <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
          <h3>Create New Task</h3>
          <input type="text" placeholder="Task Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '8px' }} />
          <input type="text" placeholder="Assignee Name" value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} style={{ padding: '8px' }} />
          <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ padding: '8px' }}>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Save Task</button>
        </form>
      )}

      {/* VIEW: ALL TASKS */}
      {view === 'all' && (
        <div>
          {/* Filters & Search (Stretch Goals) */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px', flexGrow: 1 }} />
            
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px' }}>
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={{ padding: '8px' }}>
              <option value="All">All Assignees</option>
              {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Responsive Task List */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f1f1' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Title</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Assignee</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Priority</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Due Date</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? <tr><td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>No tasks found.</td></tr> : null}
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}><strong>{task.title}</strong></td>
                    <td style={{ padding: '12px' }}>{task.assignee}</td>
                    <td style={{ padding: '12px' }}>{task.priority}</td>
                    <td style={{ padding: '12px' }}>{task.dueDate}</td>
                    <td style={{ padding: '12px' }}>
                      <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)} style={{ padding: '4px' }}>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => deleteTask(task.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;