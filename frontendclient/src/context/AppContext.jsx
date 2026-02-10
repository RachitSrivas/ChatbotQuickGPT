import {createContext , useContext , useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {dummyUserData,  dummyChats } from '../assets/assets'

const AppContext = createContext() 

export const AppContextProvider = ({children})=>{

    const navigate = useNavigate()
    const [user,setuser] = useState(null) ;
    const [chats , setchats] = useState([]) ;
    const [selectedChat , setSelectedChat] = useState(null) ;
    const [theme , setTheme] = useState(localStorage.getItem('theme') || 'light') ;

     const fetchUser = async () =>{
        setuser(dummyUserData)
     }

     const fetchUsersChats = async()=>{
        setchats(dummyChats)
        setSelectedChat(dummyChats[0])
     }

     useEffect(()=>{
        if(theme==='dark'){
            document.documentElement.classList.add('dark') ;
        }
        else{
            document.documentElement.classList.remove('dark') ;
        }
        localStorage.setItem('theme',theme)
     },[theme])

     useEffect(()=>{
        if(user){
            fetchUsersChats() ;
        }
        else{
            setchats([]) ;
            setSelectedChat(null) ;
        }
     } , [user])

     useEffect(()=>{
        fetchUser() ;
     },[])



    const value = {
        navigate , user , setuser , fetchUser , chats , setchats , selectedChat , setSelectedChat , theme ,setTheme
    }



    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext) 
