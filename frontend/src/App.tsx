import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="container">
      <h1>Code Judge</h1>
      <p>
        Create a coding challenge, share a link, and see how candidates solve
        it.
      </p>
      <Link to="/create">
        <button className="submit-btn">Create a Challenge</button>
      </Link>
    </div>
  )
}

export default App
