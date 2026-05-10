import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [schoolData, setSchoolData] = useState(null)

  return (
    <div>
      {user ? (
        <Dashboard user={user} setUser={setUser} schoolData={schoolData} />
      ) : (
        <Login setUser={setUser} setSchoolData={setSchoolData} />
      )}
    </div>
  )
}

export default App