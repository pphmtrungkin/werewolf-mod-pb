import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <div className='w-screen min-h-screen flex items-center justify-center py-8 animate__animated animate__fadeInDown'>
      <div className='min-w-full px-4'>
        <Outlet />
      </div>
    </div>
  )
}
