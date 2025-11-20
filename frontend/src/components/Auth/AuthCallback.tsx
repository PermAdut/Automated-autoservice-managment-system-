import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userParam = searchParams.get('user');

    if (accessToken && refreshToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        dispatch(setCredentials({
          user,
          accessToken,
          refreshToken,
        }));
        navigate('/');
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login?error=invalid_response');
      }
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div>Загрузка...</div>
    </div>
  );
};

export default AuthCallback;

