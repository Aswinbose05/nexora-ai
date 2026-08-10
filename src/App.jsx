import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import './App.css';

function App() {
  // Desktop: sidebar collapses to icon rail.
  // Mobile: sidebar becomes an overlay drawer, closed by default.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Main onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
}

export default App;
