import React from "react";
import { useState, useRef } from "react";
import { baseUrl } from "../../core";
import axios from "axios";
import "./signup.css"

const Signup = () => {

    const firstNameInputRef = useRef(null);
    const lastNameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const repeatPasswordInputRef = useRef(null);
    const [result, setResult] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [hideBlur, setHideBlur] = useState(false);


    const [passwordErrorClass, setPasswordErrorClass] = useState("");

    const instance = axios.create({
        baseURL: `${baseUrl}/api`

    })


    const fetchSignup = async (e) => {

        e.preventDefault();



        if (passwordInputRef.current.value !== repeatPasswordInputRef.current.value) {
            setPasswordErrorClass('pssword not matched');
            return;
        } else {
            setPasswordErrorClass("");
        }

        try {
            const response = await instance.post(`/signup`, {
                firstName: firstNameInputRef.current.value,
                lastName: lastNameInputRef.current.value,
                email: emailInputRef.current.value,
                password: passwordInputRef.current.value,
            });

            console.log("resp: ", response.data.message);
            setResult(response.data.message);
            setHideBlur(true);
            console.log("result: ", result);

            setTimeout(() => {
                setResult("");
                setHideBlur(false);

            }, 3000);

        } catch (error) {
            console.log(error.response.data.message);
            setErrorMsg(error.response.data.message);


        }
    }

    return (
        <>
            <div className="flex justify-center mt-10">
                <div className=" bg-slate-100 w-max p-7 rounded-2xl shadow-2xl ">
                    <div className="flex justify-center p-5">
                        <h1 className="text-3xl font-bold text-cyan-500">Signup</h1>
                    </div>
                    <div className="signup flex justify-center items-start ">

                        <form onSubmit={fetchSignup} className="flex flex-col gap-6 lg:w-96 sm:w-80">
                            <input className="bg bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " required type="text" placeholder="First Name" ref={firstNameInputRef} />
                            <input className="bg bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " required type="text" placeholder="Last Name" ref={lastNameInputRef} />
                            <input className="bg bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " required type="email" placeholder="Email" ref={emailInputRef} />
                            <input className="bg bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " required type="password" placeholder="Password" ref={passwordInputRef} />
                            <input className="bg bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " required type="password" placeholder="Repeat Password" ref={repeatPasswordInputRef} />
                            <button type="submit" className="bg-cyan-500 p-4 rounded-full text-white font-bold hover:bg-cyan-700">Signup</button>
                            <div>
                                <p className=" text-center">Already have an account? <a href="/login" className="text-cyan-500 hover:text-cyan-700">Login</a></p>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
            {
                hideBlur &&
                <div className="flex justify-center absolute left-0 top-0 bg w-full h-full backdrop-blur-md">
                <h1 className=" bg-slate-100 p-3 rounded text-center mt-5 self-center text-green-500 font-bold text-2xl" hidden={!result}>{result}</h1>
            
            </div>
            }
            <div>
                <p className=" text-center mt-5 text-red-500 font-bold text-2xl" hidden={!passwordErrorClass}>{passwordErrorClass}</p>
                <h3 className=" text-center mt-5 text-red-500 font-bold text-2xl" hidden={!errorMsg}>{errorMsg}</h3>
            </div>
        </>
    )

}

export default Signup;