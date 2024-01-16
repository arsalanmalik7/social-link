import React from "react";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import { PersonCircle, BoxArrowUpRight, } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../context/context";


const Chat = () => {

    const { state } = useContext(GlobalContext);

    const instance = axios.create({
        baseURL: `${baseUrl}/api`

    })

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await instance.get('/users', {
                    withCredentials: true,
                })
                console.log(response.data);
                setUsers(response.data.data);
            } catch (error) {
                console.log(error);
            }


        }
        getUsers();
    }, []);

    const searchFriendHandler = async (e) => {
        e.preventDefault();

        const searchText = e.target[0].value;

        const response = await instance.get(`/users/search/${searchText}`, {
            withCredentials: true,
        })

        console.log(response.data);

        setUsers(response.data.data);


    }


    return (
        <>
            <div className=" bg-blue-200 p-3">
                <h1 className="text-center text-4xl font-bold">Chat</h1>


                <form onSubmit={searchFriendHandler}>
                    <div className="flex justify-center items-center gap-2">
                        <input type="text" placeholder="Search friend..." className="w-full rounded-lg p-2" />
                        <button type="submit" className="bg-blue-500 text-white rounded-lg p-2">Search</button>
                    </div>
                </form>


                {
                    users?.length > 0 ?

                        users.map((user, index) => {
                            return (

                                <div key={index} onClick={() => {
                                    navigate(
                                        `/chat/${user?._id}`, {
                                        state: {
                                            chatUser: user,
                                        }
                                    }
                                    )
                                }} className="flex justify-between  m-3 cursor-pointer p-2" style={{
                                    background: 'rgba(255, 255, 255, 0.41)',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(13px)',
                                    WebkitBackdropFilter: 'blur(11.6px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}>
                                    <div className=" flex items-center gap-2  p-2 rounded " >
                                        {
                                            user?.profilePic ?
                                                <>
                                                    <div className=' w-12  rounded-full'>
                                                        <img src={user?.profilePic} className='rounded-full' alt="profile-pic" />
                                                    </div>
                                                </>
                                                :
                                                <p className="text-5xl m-auto text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>

                                        }
                                        <h2 >{user?.firstName} {user?.lastName}{state?.user._id === user?._id ? '(You)' : null}</h2>
                                    </div>
                                    <p className=" text-2xl sm:hidden"><BoxArrowUpRight /></p>
                                </div>

                            )

                        })
                        :
                        <div className=" p-2 m-3">
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                            <div className=" pt-3 border-b-slate-500 border-b-2 animate-pulse flex items-center gap-1">
                                <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                <h2 className="text-2xl h-6 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                            </div>
                        </div>
                }
            </div>
        </>
    )
}

export default Chat;