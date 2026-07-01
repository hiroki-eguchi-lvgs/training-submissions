import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './AuthProvider';
import EditGroup from './EditGroup';
import Executor from './Executor';
import Home from './Home';
import ProtectedRoute from './ProtectedRoute';
import SocialLogin from './SocialLogin';
import StampExecutor from './StampExecutor';
import StampMigration from './StampMigration';
import GroupDetailScreen from './GroupDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<SocialLogin />} />
          <Route path="/stampMigration" element={<StampMigration />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/editGroup/:id?" element={<EditGroup />} />
            <Route path="/groupDetail/:id?" element={<GroupDetailScreen />} />
            <Route path="/executor/:id?" element={<Executor />} />
            <Route path="/stampExecutor/:id?" element={<StampExecutor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
