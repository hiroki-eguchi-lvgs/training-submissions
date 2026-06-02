import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = () => {
  const { isAuthenticated, isCompletedRegistration, loading } = useAuth();

  // ローディング中は読み込み画面を表示
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  // 未認証の場合はリダイレクト
  if (!isAuthenticated) {
    return <Navigate to={'/login'} replace />;
  }

  // アカウント作成途中の場合は登録画面へリダイレクト
  if (!isCompletedRegistration) {
    return <Navigate to={'/stampMigration'} replace />;
  }

  return <Outlet />; // 子ルートを描画
};

export default ProtectedRoute;
