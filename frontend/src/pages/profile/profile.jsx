import React from "react";
import { useContext } from "react";
import { GlobalContext } from "../../context/context";

const Profile = () => {

    const { state } = useContext(GlobalContext);

    console.log(state);


    return (
        <>
        <div className=" mt-16">
            <div>
                <h1>Profile</h1>
            </div>
            <div>
                <h1>{state.user.firstName} {state.user.lastName}</h1>
                <p>{state.user.email}</p>
            </div>
        </div>
        </>
    )
};

export default Profile;