import { useState, useRef, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PersonCircle, ArrowLeft } from "react-bootstrap-icons";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import { GlobalContext } from "../../context/context";
import { SendFill } from "react-bootstrap-icons";
import moment from "moment";
import io from 'socket.io-client';


const ChatScreen = () => {

    const instance = axios.create({
        baseURL: `${baseUrl}`
    });

    const { state, dispatch } = useContext(GlobalContext);

    const [toggle, setToggle] = useState(false);


    const [user, setUser] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    const { chatUser } = location.state;



    useEffect(() => {

        const socket = io(baseUrl, {
            secure: true,
            withCredentials: true
        })
        socket.on('connect', function () {
            console.log("connected")
        });
        socket.on('disconnect', function (message) {
            console.log("Socket disconnected from server: ", message);
        });

        socket.on("NEW_MESSAGE", (e) => {
            console.log("a new message for you: ", e);
            setMessages((prev) => {
                return [e, ...prev]
            });

        });

        setUser(chatUser);


        return () => {
            socket.close();
            console.log("chat socket closed");
        }
    }, []);

    const params = useParams();
    const [messages, setMessages] = useState([]);
    const msgInputRef = useRef();




    const getChat = async () => {

        try {
            const response = await instance.get(`/api/messages/${params.userId}`, { withCredentials: true });

            setMessages([...response.data.messages]);
        } catch (error) {
            console.log(error);

        }

    }

    useEffect(() => {
        getChat();
    }, [toggle]);


    const sendMessage = async (e) => {

        e.preventDefault();

        console.log(params.userId);

        try {

            let formData = new FormData();

            formData.append('receiver_id', params.userId);
            formData.append('messageText', msgInputRef.current.value);

            const response = await instance.post(`/api/message`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                }
            );
            // console.log(response.data);
            setToggle(!toggle);
            msgInputRef.current.value = '';
            msgInputRef.current.style.height = 'auto';
        } catch (error) {
            console.log(error);
        }


    }

    document.querySelector('body').style.overflowX = 'hidden';



    return (
        <>




            <main className=" relative w-[50rem] mx-auto bg-slate-400 h-screen container px-0 z-50">


                <div className=" p-2 flex justify-between items-center bg-green-400">
                    <div onClick={() => { navigate(-1) }}
                        title="Go back"
                        className=" text-2xl bg-slate-300 rounded-full p-2 m-2 hover:cursor-pointer ">
                        <ArrowLeft />
                    </div>
                    {
                        user?.profilePic ?
                            <div className=" flex items-center gap-2 justify-center ">
                                <img src={user?.profilePic} alt="profile" className=" w-20 rounded-full" />
                                <p className=" sm:text-2xl text-3xl text-center p-2">{user.firstName} {user.lastName}</p>

                            </div>
                            :
                            <div className=" flex items-center gap-2 justify-center">
                                <h3 className=" text-5xl"><PersonCircle /></h3>
                                <p className=" sm:text-2xl text-3xl text-center p-2">{user.firstName} {user.lastName}</p>
                            </div>
                    }
                    <div></div>
                </div>
                <div className=" flex flex-col-reverse overflow-y-scroll max-h-[81vh] sm:max-h-[76vh] h-full  px-2 pt-[5rem] bg-neutral-900  ">


                    {
                        messages.map((eachMessage, index) => {
                            return (
                                <div key={index} className={`flex ${eachMessage.sender_id === state.user._id ? ' justify-end  ' : ' justify-start '} p-3 transition-all `}>
                                    <p style={{
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        hyphens: 'auto',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,

                                    }} className={` p-3 font-medium  ${eachMessage.sender_id === state.user._id ? ' bg-slate-300  rounded-t-2xl rounded-bl-2xl' : ' bg-blue-300  rounded-t-2xl rounded-br-2xl'} max-w-xs  min-w-[5rem] transition-all`}>{eachMessage.messageText}
                                        <br />
                                        <span className=" text-xs text-slate-600">{moment(eachMessage.createdAt).format('LT')}</span>

                                    </p>
                                </div>
                            )


                        })
                    }

                </div>

                <div className=" flex justify-center bg-slate-400 z-30 absolute bottom-0 w-full left-0 ">
                    <form onSubmit={sendMessage} className=" flex justify-center items-center flex-grow w-full p-3">

                        <textarea type="text" name="message" ref={msgInputRef} required className=" text-lg p-2 rounded-l flex-grow focus:outline-blue-500  resize-none overflow-y-scroll max-h-32 "
                            rows={1} placeholder="Write message...."
                            onInput={(e) => {
                                const scrollHeight = e.target.scrollHeight;
                                e.target.style.height = 'auto';
                                e.target.style.height = scrollHeight + 'px';
                                e.target.scrollTop = e.target.scrollHeight;
                            }}
                            onKeyDown={
                                (e) => {
                                    if (e.keyCode === 13 && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(e);
                                        e.target.value = '';
                                        e.target.style.height = 'auto'


                                    } else if (e.target.value) {
                                        e.target.style.height = 'auto'
                                    }
                                    else {
                                        return;
                                    }

                                }
                            }
                        />

                        <button type="submit" className=" bg-blue-500 px-3 py-[0.95rem] hover:bg-blue-400 rounded-r text-white font-bold flex items-center text-xl"><SendFill /></button>
                    </form>
                </div>
            </main>


        </>
    )
}

export default ChatScreen;