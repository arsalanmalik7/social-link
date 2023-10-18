import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core";
import { GlobalContext } from "../../context/context";
import "./login.css"

const Login = () => {

    const instance = axios.create({
        baseURL: `${baseUrl}/api`


    })

    const { state, dispatch } = useContext(GlobalContext);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult] = useState("");


    const loginSubmitHandler = async (e) => {
        e.preventDefault();


        try {

            const response = await instance.post(`/login`, {
                email: emailInputRef.current.value,
                password: passwordInputRef.current.value,
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

    }



    return (
        <>
            <div className="flex justify-center mt-10">
                <div className=" bg-slate-100 w-max p-7 rounded-2xl shadow-2xl">
                    <div className="login">
                        <form onSubmit={loginSubmitHandler} className="flex flex-col gap-6 lg:w-96 sm:w-80">
                            <h1 className="text-center text-3xl font-bold text-cyan-500">Login</h1>

                            <input required autoComplete="email" autoCorrect="on" className=" bg-neutral-200 p-3 focus:bg-neutral-300 rounded-md" type="email" placeholder="Email" ref={emailInputRef} />
                            <input required autoComplete="current-password" className=" bg-neutral-200 p-3 focus:bg-neutral-300 rounded-md" type="password" placeholder="Password" ref={passwordInputRef} />
                            <button type="submit" className="bg-cyan-500 p-4 rounded-full text-white font-bold hover:bg-cyan-700">Login</button>
                            <p className="text-center">Don't have an account? <a href="/signup" className="text-cyan-500 hover:text-cyan-700">Signup</a></p>
                        </form>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-5">
                <p className=" text-center mt-5 text-red-500 font-bold text-2xl" hidden={!errorMsg}>{errorMsg}</p>
                <p className=" text-center mt-5 text-green-500 font-bold text-2xl" hidden={!result}>{result}</p>
            </div>
        </>
    )

}

export default Login;