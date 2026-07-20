import { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import BackendWakingToast from './components/BackendWakingToast';
import { useStore } from './store/store';

function App() {
  const { initBackendCheck, isBackendWaking } = useStore();

  useEffect(() => {
    initBackendCheck();
  }, [initBackendCheck]);

  return (
    <>
      {isBackendWaking && <BackendWakingToast />}
      <Dashboard />
    </>
  );
}

export default App;
