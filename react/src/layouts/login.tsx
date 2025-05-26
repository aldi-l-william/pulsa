import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      return alert('Username dan password wajib diisi');
    }
    try {
      setLoading(true);
      const res = await api.post('/login', { username:form.username, password:form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('auth', 'true');
      navigate('/');
    } catch (err:any) {
      alert('Login gagal: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleSubmit} className='px-4 py-2'>
        <h2 className='mb-4'>Login</h2>
        <input name="username" onChange={handleChange} placeholder="Username" className='px-4 py-2 border border-black mb-4'/>
        <br />
        <input name="password" type="password" onChange={handleChange} placeholder="Password" className='px-4 py-2 border border-black mb-4' />
        <br />
        <button type="submit" className='px-4 py-2 bg-blue-500 text-white'>Login</button>
        </form>
    </div>
  );
}

export default Login;
