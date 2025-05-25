import { Outlet, Link } from 'react-router';
import { useState } from 'react';

const DashboardLayout = () => {

    const [selectedValue, setSelectedValue] = useState('');

     const handleChange = (event: any) => {
        const val = event.target.value;
        setSelectedValue(val);
        console.log('Yang dipilih:', val);

        if (val === 'logout') {
            localStorage.setItem('auth', 'false');
            // Misal redirect ke login setelah logout
            window.location.href = '/';
        }
      };


    return(
        <>
            <div>
                <div className='max-w-[1280px] mx-auto'>
                    <div className='grid grid-cols-12'>
                        <div className='col-span-2 bg-[#0c2556] h-screen sticky top-0'>
                            <div className='flex justify-center'>
                                <h1 className='text-2xl text-white font-bold'>Amel Reload</h1>
                            </div>
                            <ul className='text-white my-4'> 
                                <li className='px-6 py-3 hover:bg-blue-200 mx-2 rounded text-sm'><Link to="/">Transaksi</Link></li>
                                <li className='px-6 py-3 hover:bg-blue-200 mx-2 rounded text-sm'><Link to="/sub-account">Laporan</Link></li>
                                <li className='px-6 py-3 hover:bg-blue-200 mx-2 rounded text-sm'><Link to="/broadcast">Atur Product</Link></li>
                                <li className='px-6 py-3 hover:bg-blue-200 mx-2 rounded text-sm'><Link to="/deposit">Deposit</Link></li>    
                            </ul>
                        </div>
                        <main className="col-span-10 bg-blue-200">
                            <div className='flex justify-between items-center px-4 py-2 border-b border-gray-200'>
                                <div>Dashboard</div>
                                <div className='flex justify-start gap-4'>
                                    <select value={selectedValue} onChange={handleChange}>
                                        <option value="">User</option>
                                        <option value="logout">
                                             Logout
                                        </option>
                                    </select>
                                    <div>
                                        <div className='bg-[#0c2556] text-white rounded-full px-3 py-2'>PA</div>
                                    </div>
                                </div>
                            </div>
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DashboardLayout