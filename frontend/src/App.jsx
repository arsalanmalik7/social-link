import { useState, useEffect, useContext } from 'react';
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from './pages/home/home';
import About from './pages/about/about';
import Chat from './pages/chat/chat';
import Login from './pages/login/login';
import Signup from './pages/siginup/signup';
import Prfile from './pages/profile/profile';
import { GlobalContext } from './context/context';
import { baseUrl } from './core.mjs';
import axios from 'axios';
import './App.css';
import { House, ChatDots, FilePerson } from 'react-bootstrap-icons';
import Profile from './pages/profile/profile';





const App = () => {


  const instance = axios.create({
    baseURL: `${baseUrl}/api`,

  });


  const { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {

    const loginStatus = async () => {

      try {

        const response = await instance.get(`/profile`, {
          withCredentials: true,
        })

        console.log(response.data);

        dispatch({
          type: "USER_LOGIN",
          payload: response.data.data
        })

        console.log(state);
      } catch (error) {
        console.log(error);
        dispatch({ type: "USER_LOGOUT" })
        return;
      }

    }

    console.log(state);

    loginStatus();

  }, [])

  const logoutHandler = async () => {
    try {
      const response = await instance.post(`/logout`, {}, {
        withCredentials: true,
      })

      console.log(response.data);
      dispatch({ type: "USER_LOGOUT" })
    } catch (error) {
      console.log(error);
    }

    console.log(state);

  }

  return (
    <>



      {state?.isLogin === true && state?.role === "admin" ?

        (
          <>

            <nav className="me-auto">
              <Link to={`/`}>Admin Home</Link>
              <Link to={`/chat`}>Admin Chat</Link>
              <Link to={`about`}>Admin About</Link>
            </nav>
            <div>
              <button onClick={logoutHandler}> Logout</button>
            </div>



            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="chat" element={<Chat />} />
              <Route path="about" element={<About />} />

              <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>

          </>
        )
        :
        null
      }


      {state?.isLogin === true && state?.role === "user" ?

        (
          <>

            <nav className=' flex justify-between bg-slate-100 p-4'>
              <div>rfvcrf</div>
              <ul className='flex items-center justify-center gap-40'>
                <Link className=' transition-all ease-in-out border border-b-blue-500 delay-75 hover:bg-gray-300 text-stone-800 text-3xl px-8 py-3 rounded selection:text-blue-500' to={`/`}><House /></Link>
                <Link className=' transition-all ease-in-out border border-b-blue-500 delay-75 hover:bg-gray-300 text-stone-800 text-3xl px-8 py-3 rounded ' to={`/chat`}><ChatDots /></Link>
                <Link className=' transition-all ease-in-out border border-b-blue-500 delay-75 hover:bg-gray-300 text-stone-800 text-3xl px-8 py-3 rounded' to={`about`}><FilePerson /></Link>
              </ul>
              <button className=' bg-red-600 py-2 px-4 text-white font-bold rounded hover:bg-red-500 ' onClick={logoutHandler}> Logout</button>
            </nav>




            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="chat" element={<Chat />} />
              <Route path="about" element={<Profile />} />

              <Route path="*" element={<Navigate to="/" replace={true} />} />
            </Routes>

          </>
        )
        :
        null
      }


      {state?.isLogin === false ?

        <>

          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            <Route path="*" element={<Navigate to="/login" replace={true} />} />
          </Routes>



        </>
        :
        null
      }


      {
        state?.isLogin === null ?

          <span className="loader"></span>

          :
          null
      }
    </>
  )
}

export default App;