import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Routes , Route, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import {Toaster} from 'react-hot-toast'

function App() {

    const {user , loadingUser} = useAppContext() ;



  const [ismenuopen , setismenuopen] = useState(false)
  const {pathname} = useLocation() ;

  if(pathname === '/loading' || loadingUser) return <Loading/>




  return (
  <>
  <Toaster/>
  {!ismenuopen && 
  <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert' 
  onClick={()=>setismenuopen(true)}
  />}


    {user ? (<div className='
  bg-white text-black
  dark:bg-gradient-to-b dark:from-[#242124] dark:to-[#000000]
  dark:text-white
'>
       <div className='flex h-screen w-screen'>
    <Sidebar ismenuopen={ismenuopen} setismenuopen={setismenuopen} />
    <Routes>
      <Route path='/' element={<ChatBox/>} />
      <Route path='/credits' element={<Credits/>} />
      <Route path='/community' element={<Community/>} />
    </Routes>  
      
  </div>
    </div>) : ( 
      <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'>
        <Login/>
      </div>
    ) }


    
  </>
  )
}

export default App
