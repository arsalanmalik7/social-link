import { useState, useRef, useEffect } from "react";
import { baseUrl } from "../../core.mjs";
import axios from "axios";
import { useNavigate } from 'react-router-dom'


const ForgetPassword = () => {


    const instance = axios.create({
        baseURL: `${baseUrl}/api`
    });

    const navigate = useNavigate();

    const emailInputRef = useRef("");

    const [errorMsg, setErrorMsg] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {

        setTimeout(() => {
            setErrorMsg("");
            setResult("");
        }, 3000);
    }, [])

    const forgetPasswordSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const reponse = await instance.post(`forget-password`, {
                email: emailInputRef?.current?.value,
            });
            setResult(reponse?.data?.message);
            setErrorMsg("");
            setTimeout(() => {
                setResult("");
                navigate(`/forget-password-complete`,{
                    state:{
                        email: emailInputRef?.current?.value,
                        otpCode: reponse?.data?.data.otpCode,
                    }
                })
            }, 3700)
        } catch (error) {
            console.log(error?.response?.data);
            setErrorMsg(error?.response?.data?.message);

        }
    }


    return (
        <>

            <div className="flex justify-center items-center h-screen">
                <div className=" bg-slate-100 w-max p-7  rounded-2xl shadow-2xl">

                    <form onSubmit={forgetPasswordSubmitHandler} className="flex flex-col gap-6 lg:w-96 sm:w-80">
                        <h1 className="text-center text-3xl font-bold text-cyan-500">Forget Password</h1>

                        <input name="email" ref={emailInputRef} className="focus:outline-blue-500 bg-neutral-200 p-3 focus:bg-neutral-300 rounded-md" type="email" placeholder="Enter your email..." required autoComplete="email" />

                        <button type="submit" className="bg-blue-500 p-4 rounded-full text-white font-bold hover:bg-blue-600">Next</button>

                    </form>

                    <div className="">
                        <p className=" text-center mt-5 text-red-500 font-bold text-2xl bg-red-200 p-2 rounded-lg" hidden={!errorMsg}>{errorMsg}</p>
                        {
                            result &&
                            <div className=" absolute w-full h-full top-0 left-0 backdrop-blur-md flex justify-center items-center">
                                <div className="">
                                    <p className=" flex justify-center items-center text-center mt-auto text-green-500 font-bold text-2xl bg-green-200 p-4" hidden={!result}>{result}</p>
                                </div>
                            </div>
                        }
                    </div>
                </div>

            </div>

        </>
    )

}

export default ForgetPassword;