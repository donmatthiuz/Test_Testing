import { useState, useEffect, createContext, useContext, useMemo, ReactNode } from 'react';
import PropTypes from 'prop-types';
type Props = {
  children: ReactNode;
};
type TokenContextType = {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  isLoggedIn: boolean;
  getRawToken: () => any; // Puedes tipar mejor si sabes qué datos devuelve tu JWT
};

// Función para decodificar un JWT de forma segura
function parseJwt(token: string | null) {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Array.from(window.atob(base64))
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token format:', error);
    return null;
  }
}

// Contexto para el manejo del token
const TokenContext = createContext<TokenContextType>({
  token: null,
  setToken: () => {},
  isLoggedIn: false,
  getRawToken: () => null,
});

const TokenProvider =  ({ children }: Props) => {
  const [token, setToken] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  );

  // Sincroniza el token con localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }, [token]);

  const isLoggedIn = !!token;

  // Decodifica el token JWT
  const getRawToken = useMemo(() => () => parseJwt(token), [token]);

  // Memoriza el valor del contexto para evitar recrearlo en cada render
  const contextValue = useMemo(
    () => ({ token, setToken, isLoggedIn, getRawToken }),
    [token, isLoggedIn, getRawToken]
  );
 
  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

TokenProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook para usar el contexto del token
const useToken = () => useContext(TokenContext);

export default useToken;
export { TokenContext, TokenProvider, parseJwt };