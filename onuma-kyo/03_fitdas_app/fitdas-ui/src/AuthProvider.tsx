import { createContext, useContext, useEffect, useState } from 'react';
import { type Me } from './generated/graphql';
import * as graphqlClient from './utils/GraphQLClient';

export type ContextType = {
  userId: string;
  loading: Boolean;
  isAuthenticated: boolean;
  isCompletedRegistration: boolean;
};
const AuthContext = createContext<ContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

const ME = `
    query Me {
        me {
            userId
            migratingStatus
        }
    }
          `;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Me>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const meResponse = await graphqlClient.graphqlFetch(ME);
      console.log('meResponse');
      console.log(meResponse);
      const me = Object.values(meResponse)[0] as Me;
      if (me.userId) {
        setUser(me);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      alert('サーバーとの通信に失敗しました');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId: user?.userId!,
        loading,
        isAuthenticated: !!user,
        isCompletedRegistration: user?.migratingStatus !== 'PENDING',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
