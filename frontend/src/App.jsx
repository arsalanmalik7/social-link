import { useState, useEffect, useContext, useRef } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useParams } from "react-router-dom";
import Home from './pages/home/home';
import ChatUsers from './pages/chat/chatUsers';
import ChatScreen from './pages/chat/chatScreen';
import Login from './pages/login/login';
import Notifications from './pages/notifications/notfication';
import Signup from './pages/siginup/signup';
import ForgetPassword from './pages/forgetPassword/forgetPassword';
import ForgetPasswordComplete from './pages/forgetPasswordComplete/forgetPassComplete';
import PostDetails from './pages/post-details/postDetails';
import { GlobalContext } from './context/context';
import { baseUrl } from './core.mjs';
import axios from 'axios';
import './App.css';
import { HouseFill, ChatDotsFill, PersonFill, Search, BellFill } from 'react-bootstrap-icons';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { io } from 'socket.io-client';
import Profile from './pages/profile/profile';
import slLogo from './assets/SL-logo.png';





const App = () => {

  const searchInputRef = useRef(null);

  const { userId } = useParams();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);

  const instance = axios.create({
    baseURL: `${baseUrl}/api`,

  });

  useEffect(() => {
    instance.interceptors.request.use(
      function (config) {
        config.withCredentials = true;
        return config;
      },
      function (error) {
        console.error('Axios request error:', error);
        return Promise.reject(error);
      }
    );
  }, []);


  useEffect(() => {
    const socket = io(baseUrl, {
      withCredentials: true,
      // secure: true
    });

    socket.on('connect', () => {
      console.log('Socket connected on app folder:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected on app folder:', socket.id);

    });

    socket.on('NOTIFICATIONS', (e) => {
      console.log('event: ', e);

      setNotifications((prev) => {
        return [e, ...prev];

      });

      const clearNotificationsOneByOne = () => {
        if (!notifications.length > 0) {
          setNotifications((prevNotifications) => prevNotifications.slice(1));
        } else {
          console.log('No more notifications to clear.');
        }
      };

      setTimeout(clearNotificationsOneByOne, 8000);

    });


    return () => {
      socket.close();
    }

  }, [])


  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    setActiveLink(location.pathname);
    // console.log(location.pathname);

    return () => {
      setActiveLink(location.pathname);
    }

  }, [location])




  const { state, dispatch } = useContext(GlobalContext);

  useEffect(() => {

    const loginStatus = async () => {

      try {

        const response = await instance.get(`/profile`, {
          withCredentials: true,
        })

        // console.log(response.data);

        dispatch({
          type: "USER_LOGIN",
          payload: response.data.data
        })

      } catch (error) {
        console.log(error);
        dispatch({ type: "USER_LOGOUT" })
        return;
      }

    }

    // console.log(state);

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

  const searchHandler = async (e) => {
    e.preventDefault()
    try {

      const response = await instance.get(`/search?q=${searchInputRef.current.value}`, {
        withCredentials: true
      });
      console.log(response.data);


    } catch (error) {
      console.log(error.data);

    }
  }


  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);





  return (
    <>



      {state?.isLogin === true && state?.role === "admin" ?

        (
          <>

            <nav className="me-auto">
              <Link to={`/`}>Admin Home</Link>
              <Link to={`/chat`}>Admin Chat</Link>
              <Link to={`profile`}>Admin About</Link>
            </nav>
            <div>
              <button onClick={logoutHandler}> Logout</button>
            </div>



            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="chat" element={<ChatUsers />} />
              <Route path="profile" element={<Profile />} />

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
            <div>

              {
                notifications?.length > 0 &&
                <div
                  className="modal show absolute top-0 "
                  style={{ display: 'block' }}
                >
                  {notifications?.map((item, index) => (
                    <Modal.Dialog key={index} className='bg-transparent'>
                      <Modal.Header className=' bg-opacity-50'>
                        <Modal.Title>Notification</Modal.Title>
                      </Modal.Header>

                      <Modal.Body className=' bg-opacity-50'>
                        <p>{item}</p>
                      </Modal.Body>

                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setNotifications(
                          (prev) => prev.filter((item, idx) => idx !== index)

                        )}>
                          Close
                        </Button>

                      </Modal.Footer>

                    </Modal.Dialog>


                  ))}
                </div>
              }

            </div>

            <nav className=' w-full flex items-center justify-between bg-slate-100 p-4 '>
              <img src={slLogo} alt="" />
              <div className=' flex  items-center gap-2'>
                <div className=' text-2xl hover:bg-slate-200 rounded-full hover:cursor-pointer p-2'>
                  <Search />
                </div>
                <button className=' bg-red-600 py-2 px-4 text-white font-bold rounded hover:bg-red-500 ' onClick={logoutHandler}> Logout</button>
              </div>

            </nav>
            <nav id='sticky-navbar' className={`${isSticky ? ' fixed top-0 w-full z-50' : ''} bg-slate-50`}>
              <ul className=' flex items-center justify-evenly mb-0' >

                <Link className={`${activeLink === '/' ? " text-stone-800  border-b-blue-500" : " border-b-slate-50 text-gray-400"}  border-b-2  transition-all ease-linear  hover:bg-gray-300  sm:text-2xl text-3xl px-8 py-3 mb-2  hover:rounded`} to={`/`}><HouseFill /></Link>
                <Link className={`${activeLink === '/chat' ? " text-stone-800  border-b-blue-500" : " border-b-slate-50 text-gray-400"}  border-b-2  transition-all ease-linear  hover:bg-gray-300  sm:text-2xl text-3xl px-8 py-3 mb-2  hover:rounded`} to={`/chat`}><ChatDotsFill /></Link>
                <Link className={`${activeLink === '/notifications' ? " text-stone-800  border-b-blue-500" : " border-b-slate-50 text-gray-400"}  border-b-2  transition-all ease-linear  hover:bg-gray-300  sm:text-2xl text-3xl px-8 py-3 mb-2  hover:rounded`} to={`/notifications`}><BellFill /></Link>
                <Link className={`${activeLink.startsWith(`/profile/`) ? " text-stone-800  border-b-blue-500" : " border-b-slate-50 text-gray-400"}  border-b-2  transition-all ease-linear  hover:bg-gray-300  sm:text-2xl text-3xl px-8 py-3 mb-2  hover:rounded`} to={`/profile/${state.user._id}`}><PersonFill /></Link>

              </ul>
            </nav>



            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="chat" element={<ChatUsers />} />
              <Route path="chat/:userId" element={<ChatScreen />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile/:userId" element={<Profile />} />

              <Route path='post/:postId' element={<PostDetails />} />

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
            <Route path="profile/:userId" element={<Profile />} />
            <Route path='forget-password' element={<ForgetPassword />} />
            <Route path='forget-password-complete' element={<ForgetPasswordComplete />} />

            <Route path="*" element={<Navigate to="/login" replace={true} />} />
          </Routes>



        </>
        :
        null
      }


      {
        state?.isLogin === null ?
          <div className='flex justify-center items-center w-full h-full absolute'>
            <div className=' flex justify-center m-1'>
              <div
                className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
                <span
                  className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                >Loading...</span>
              </div>
            </div>
          </div>
          :
          null
      }
    </>
  )
}

export default App;