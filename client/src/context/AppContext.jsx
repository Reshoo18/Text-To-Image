import { createContext,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

import {toast} from "react-toastify"

import axios from 'axios'

export const AppContext =createContext();



const AppContextProvider =(props)=>{
   const [user,setUser]=useState(null);
   const [showLogin,setShowLogin]= useState(false);
   const [token,setToken]=useState(localStorage.getItem('token'));
   const [image, setImage] = useState(null);


   const [credit,setCredit]=useState(false);

   const backendUrl=import.meta.env.VITE_BACKEND_URL
   const navigate= useNavigate()

   const loadCreditsData = async ()=>{
      try {
        const {data}=await axios.get(backendUrl + '/api/user/credits',{headers : {token}})
        if(data.success){
          setCredit(data.credits)
          setUser(data.user)

        }
        
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
   }
    
 

   const generateImage = async (prompt) => {
  try {
    const { data } = await axios.post(
      backendUrl + "/api/image/generate-image",
      { prompt },
      { headers: { token } }
    );

    // ✅ success case
    if (data.success) {
      setImage(data.image);
      setCredit(data.creditBalance);
      return true;
    }

  } catch (error) {
    // ✅ CREDIT FINISHED → REDIRECT
    if (error.response?.status === 402) {
      toast.error("No credits left. Please buy more credits.");
      navigate("/buy");
      return false;
    }

    toast.error(error.message);
    return false;
  }
};


   const logout = ()=>{
    localStorage.removeItem('token');
    setToken('')
    setUser(null)

   }

   useEffect(()=>{
      if(token){
        loadCreditsData()
      }
   },[token])

   const value = {
    user,setUser,showLogin,setShowLogin,backendUrl,token,setToken,credit,setCredit,image,setImage,loadCreditsData,logout,generateImage
   }

   return(
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
   )
}

export default AppContextProvider