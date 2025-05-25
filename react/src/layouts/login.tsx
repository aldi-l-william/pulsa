import { useState } from 'react';
import { useNavigate } from 'react-router';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Dummy auth: anggap login sukses
    if (form.username === 'admin' && form.password === '1234') {
      localStorage.setItem('auth', 'true'); // simpan auth state
      navigate('/'); // redirect ke dashboard
    } else {
      alert('Login gagal');
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
