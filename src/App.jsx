import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Get the list from the backend
  async function loadTodos() {
    try {
      const res = await fetch(`${API_URL}/todos`)
      if (!res.ok) throw new Error()
      setTodos(await res.json())
      setError('')
    } catch {
      setError("Can't reach the server. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  // Load once on start, then refresh every 5 seconds
  // so changes made on another computer show up here too
  useEffect(() => {
    loadTodos()
    const timer = setInterval(loadTodos, 5000)
    return () => clearInterval(timer)
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error()
      const todo = await res.json()
      setTodos((current) => [...current, todo])
      setText('')
      setError('')
    } catch {
      setError("Couldn't add the task. Is the backend running?")
    }
  }

  async function toggleTodo(id) {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setTodos((current) => current.map((t) => (t.id === id ? updated : t)))
      setError('')
    } catch {
      setError("Couldn't update the task. Is the backend running?")
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTodos((current) => current.filter((t) => t.id !== id))
      setError('')
    } catch {
      setError("Couldn't delete the task. Is the backend running?")
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>To-Do List ✅</h1>

        <form onSubmit={addTodo} style={styles.form}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you need to do?"
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>Add</button>
        </form>

        {error && <p style={styles.error}>⚠️ {error}</p>}
        {loading && <p style={styles.muted}>Loading...</p>}
        {!loading && !error && todos.length === 0 && (
          <p style={styles.muted}>No tasks yet. Add your first one!</p>
        )}

        <ul style={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} style={styles.item}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span style={{ textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.5 : 1 }}>
                  {todo.text}
                </span>
              </label>
              <button onClick={() => deleteTodo(todo.id)} style={styles.deleteButton}>✕</button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #1e0a24, #4a153a)', fontFamily: 'system-ui, sans-serif', padding: 16 },
  card: { width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, color: 'white' },
  title: { margin: '0 0 16px', fontSize: '2rem' },
  form: { display: 'flex', gap: 8, marginBottom: 12 },
  input: { flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 16 },
  addButton: { padding: '10px 16px', borderRadius: 8, border: 'none', background: '#c084fc', color: 'white', fontWeight: 600, cursor: 'pointer' },
  error: { background: 'rgba(255,80,80,0.2)', padding: '8px 12px', borderRadius: 8 },
  muted: { opacity: 0.7 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  label: { display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' },
  deleteButton: { background: 'none', border: 'none', color: 'white', opacity: 0.6, cursor: 'pointer', fontSize: 16 },
}

export default App