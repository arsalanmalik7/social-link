import { useState, useRef, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ForgetPassword from "../forgetPassword/forgetPassword";
import { baseUrl } from "../../core.mjs";
import { GlobalContext } from "../../context/context";
import social_link from "../../assets/social_link.png"
import background from "../../assets/background.avif"
import "./login.css"

const Login = () => {

    const instance = axios.create({
        baseURL: `${baseUrl}/api`


    })

    const { state, dispatch } = useContext(GlobalContext);

    const emailInputRef = useRef("");
    const passwordInputRef = useRef("");
    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult] = useState("");


    const loginSubmitHandler = async (e) => {
        e.preventDefault();


        try {

            const response = await instance.post(`/login`, {
                email: e.target[0].value,
                password: e.target[1].value,
            }, {
                withCredentials: true
            });

            dispatch({
                type: "USER_LOGIN",
                payload: response.data.data
            })

            console.log(response?.data);
            setResult(response?.data?.message)


        } catch (error) {
            setErrorMsg(error.response?.data?.message)
        }

        console.log(state)
    }


    // const body = document.body;
    // body.style.backgroundImage = `url(${background})`;

    return (
        <>
            <div className=" flex justify-center md:hidden">
                <div className="flex justify-center gap-10 items-center mt-10 mx-4 p-5 border-4 border-white " style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    WebkitBackdropFilter: 'blur(8.3px)',
                    backdropFilter: 'blur(9.3px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                    <div>
                        <img src={social_link} alt="" />
                    </div>
                    <div className=" bg-black border-r-4 border-black h-full ">

                    </div>
                    <div className="flex justify-center mt-10">
                        <div className=" bg-slate-100 w-max p-7 rounded-2xl shadow-2xl">
                            <div className="login">
                                <form onSubmit={loginSubmitHandler} className="flex flex-col gap-6 w-96 sm:w-80">
                                    <h1 className="text-center text-3xl font-bold text-cyan-500">Login</h1>

                                    <input ref={emailInputRef} name="email" className="focus:outline-blue-500 bg-neutral-200 p-3 focus:bg-neutral-300 rounded-md" type="email" placeholder="Email" required autoComplete="email" />
                                    <input ref={passwordInputRef} name="password" required autoComplete="current-password" className="focus:outline-blue-500 bg-neutral-200 p-3 focus:bg-neutral-300 rounded-md" type="password" placeholder="Password" />

                                    <div>
                                        <Link to={`/forget-password`} className=" text-cyan-500">Forget password?</Link>
                                    </div>



                                    <button type="submit" className="bg-blue-500 p-4 rounded-full text-white font-bold hover:bg-blue-600">Login</button>

                                    <p className="text-center">Don't have an account? <a href="/signup" className="text-cyan-500 hover:text-cyan-700">Signup</a></p>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-5">
                        <p className=" text-center mt-5 text-red-500 font-bold text-2xl" hidden={!errorMsg}>{errorMsg}</p>
                        <p className=" text-center mt-5 text-green-500 font-bold text-2xl" hidden={!result}>{result}</p>

                    </div>
                </div>
            </div>


            <div className=" hidden md:flex md:flex-col justify-center items-center self-end mt-24 p-5 m-3 border-4 border-white"
                style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    WebkitBackdropFilter: 'blur(8.3px)',
                    backdropFilter: 'blur(9.3px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                <div>
                    <img src={social_link} alt="" />
                </div>
                <div className="flex justify-center mt-10">
                    <div className=" bg-slate-100 w-max p-7 sm:w-72 rounded-2xl shadow-2xl">
                        <div className="login">
                            <form onSubmit={loginSubmitHandler} className="flex flex-col gap-6 lg:w-96 sm:w-62">
                                <h1 className="text-center text-3xl font-bold text-cyan-500">Login</h1>

                                <input ref={emailInputRef} className=" bg-neutral-200 p-3 focus:bg-neutral-300 focus:outline-blue-500 rounded-md" type="email" placeholder="Email" required autoComplete="email" />
                                <input ref={passwordInputRef} required autoComplete="current-password" className=" bg-neutral-200 p-3 focus:bg-neutral-300 focus:outline-blue-500 rounded-md" type="password" placeholder="Password" />
                                
                                <div>
                                    <Link to={`/forget-password`} className=" text-cyan-500">Forget password?</Link>
                                </div>


                                <button type="submit" className="bg-blue-500 p-4 rounded-full text-white font-bold hover:bg-blue-600">Login</button>
                                <p className="text-center">Don't have an account? <a href="/signup" className="text-blue-500 hover:text-cyan-700">Signup</a></p>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-5">
                    <p className=" text-center mt-5 text-red-500 font-bold text-2xl" hidden={!errorMsg}>{errorMsg}</p>
                    <p className=" text-center mt-5 text-green-500 font-bold text-2xl" hidden={!result}>{result}</p>

                </div>
            </div>
        </>
    )

}

export default Login;