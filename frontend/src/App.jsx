import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-blue-500 text-white p-5 text-center">
      <h1 className="text-3xl font-bold">Tailwind CSS is Working!</h1>
    </div>
  )
}

export default App
