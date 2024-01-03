import { useState, useRef, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ArrowReturnLeft, PersonCircle } from "react-bootstrap-icons";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import { GlobalContext } from "../../context/context";
import { SendFill } from "react-bootstrap-icons";
import io from 'socket.io-client';


const ChatScreen = () => {

    const instance = axios.create({
        baseURL: `${baseUrl}`
    });

    const { state, dispatch } = useContext(GlobalContext);

    const [toggle, setToggle] = useState(false);


    const [user, setUser] = useState({});

    const location = useLocation();

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





            <div className=" fixed bottom-0 flex justify-center bg-slate-400 w-full mt-12 z-50">
                <form onSubmit={sendMessage} className=" flex justify-center items-center flex-grow w-full p-3">

                    <textarea type="text" name="message" ref={msgInputRef} className=" text-lg p-2 rounded-l flex-grow focus:outline-blue-500  resize-none overflow-y-scroll max-h-32 "
                        rows={1} placeholder="Write message...."
                        onInput={(e) => {
                            e.target.style.height = 'auto'
                            e.target.style.height = e.target.scrollHeight + 'px'
                        }}
                        onKeyDown={
                            (e) => {
                                if (e.keyCode === 13 && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                    e.target.value = '';
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
            <div className=" flex flex-col-reverse overflow-y-scroll sm:h-[47rem] h-[42.5rem]  px-2 pt-[5rem] bg-neutral-900  ">
                <div className="fixed z-20 top-[9.3rem] left-0 w-full  p-2 flex gap2 justify-between items-center backdrop-blur-md bg-white/50">
                    <div className=" text-2xl ">
                        <ArrowReturnLeft />
                    </div>
                    {
                        user?.profilePic ?
                            <div className=" flex items-center gap-2 justify-center ">
                                <img src={user?.profilePic} alt="profile" className=" w-20 rounded-full" />
                                <p className=" text-3xl text-center p-2">{user.firstName} {user.lastName}</p>

                            </div>
                            :
                            <div className=" flex items-center gap-2 justify-center">
                                <h3 className=" text-5xl"><PersonCircle /></h3>
                                <p className=" text-3xl text-center p-2">{user.firstName} {user.lastName}</p>
                            </div>
                    }
                    <div></div>
                </div>

                {
                    messages.map((eachMessage, index) => {
                        return (
                            <div key={index} className={`flex ${eachMessage.sender_id === state.user._id ? ' justify-end  ' : ' justify-start '} p-3 transition-all `}>
                                <p className={` p-3  ${eachMessage.sender_id === state.user._id ? ' bg-slate-300  rounded-t-2xl rounded-bl-2xl' : ' bg-blue-300  rounded-t-2xl rounded-br-2xl'} max-w-xs sm:max-w-[15rem] min-w-[5rem]  transition-all`}>{eachMessage.messageText}</p>
                            </div>
                        )


                    })
                }

            </div>


        </>
    )
}

export default ChatScreen;