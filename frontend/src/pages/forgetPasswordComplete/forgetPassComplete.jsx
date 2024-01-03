import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import { Modal } from "react-bootstrap";
import { Clipboard } from "react-bootstrap-icons";
import { Tooltip } from '@mui/material';


const ForgetPasswordComplete = () => {


    const instance = axios.create({
        baseURL: `${baseUrl}/api`,
    });

    const location = useLocation();
    const navigate = useNavigate();

    const { email } = location.state;
    const { otpCode } = location.state;

    const [show, setShow] = useState(true);
    const handleClose = () => setShow(false);

    const newPasswordInputRef = useRef("");
    const otpInputRef = useRef("");

    const resetPassword = async (e) => {
        e.preventDefault();

        console.log(email);
        console.log(otpInputRef?.current?.value);
        console.log(newPasswordInputRef?.current?.value);

        try {
            const response = await instance.post(`/forget-password-complete`, {
                email: email,
                otpCode: otpInputRef?.current?.value,
                newPassword: newPasswordInputRef?.current?.value,
            });
            console.log(response?.data?.message);
            navigate('/login');

        } catch (error) {
            console.log(error?.response?.data);
        }
    }


    const copyOtpCode = async () => {
        try {
            await navigator.clipboard.writeText(otpCode);
            console.log('Text copied successfully:');
            handleClose();

        } catch (err) {
            console.error('Unable to copy text:', err);
        }
    };


    return (
        <>

            <Modal show={show} onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                backdrop='static'
                keyboard='false'
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        <p>You OTP code</p>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className=" flex justify-between items-center ">
                    <p></p>
                    <p className=" text-2xl text-center">{otpCode}</p>
                    <Tooltip title='copy OTP'>
                        <p onClick={copyOtpCode} className=" p-3 bg-slate-200 hover:bg-slate-400 transition-colors hover:cursor-pointer rounded-full"><Clipboard /></p>
                    </Tooltip>
                </Modal.Body>
                <Modal.Footer>
                    <p className=" text-2xl text-red-600 bg-red-300 p-3 rounded-lg">PLEASE DO NOT SHARE THIS CODE WITH ANYONE!</p>
                </Modal.Footer>
            </Modal>

            <div className="flex justify-center mt-10">
                <div className=" bg-slate-100 w-max p-7 rounded-2xl shadow-2xl ">
                    <div className="flex justify-center p-5">
                        <h1 className="text-3xl font-bold text-cyan-500">Forget Password</h1>
                    </div>
                    <div className="signup flex justify-center items-start ">

                        <form onSubmit={resetPassword} className="flex flex-col gap-6 lg:w-96 sm:w-80">


                            <input defaultValue={email} type="email" required placeholder="Email" className=" focus:outline-blue-500 bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " />
                            <input ref={otpInputRef} type="text" required placeholder="Enter your otp here..." className=" focus:outline-blue-500 bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " />
                            <input ref={newPasswordInputRef} type="password" required placeholder="Password" className=" focus:outline-blue-500 bg-neutral-200 text-black p-3 rounded-md focus:bg-slate-300 " />


                            <button type="submit" className="bg-cyan-500 p-4 rounded-full text-white font-bold hover:bg-cyan-700">Change password</button>


                        </form>
                    </div>
                </div>

            </div>
        </>
    );

}

export default ForgetPasswordComplete;