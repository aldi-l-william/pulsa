import { Outlet, Link } from 'react-router';
const Dashboard = () => {
    return(
        <>
          <div className="px-4 py-2 bg-white rounded mx-4 my-4">
            <div className='grid grid-cols-12'>
              <div className='col-span-2 h-screen'>
                    <ul className='my-4'>
                        <li className='px-6 py-3 hover:text-blue-200 mx-2 rounded text-sm'><Link to="/info">Info</Link></li>
                        <li className='px-6 py-3 hover:text-blue-200 mx-2 rounded text-sm'><Link to="/domain-setup">domain-setup</Link></li>
                        <li className='px-6 py-3 hover:text-blue-200 mx-2 rounded text-sm'><Link to="/mailbox-users">mailbox-users</Link></li>
                        <li className='px-6 py-3 hover:text-blue-200 mx-2 rounded text-sm'><Link to="/aliases">aliases</Link></li>
                        <li className='px-6 py-3 hover:text-blue-200 mx-2 rounded text-sm'><Link to="/help">help</Link></li>
                    </ul>
              </div>
              <div className='col-span-10 my-6'>
                <Outlet />
              </div>
            </div>
             
          </div>
        </>
    );
}
export default Dashboard