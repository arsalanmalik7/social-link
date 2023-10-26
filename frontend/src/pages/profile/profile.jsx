import React from "react";
import { useContext } from "react";
import { GlobalContext } from "../../context/context";

const Profile = () => {

    const { state } = useContext(GlobalContext);



    return (
        <>
            <div>
                <h1>Profile</h1>
            </div>
            <div>
                <h1>{state.user.firstName} {state.user.lastName}</h1>
                <p>{state.user.email}</p>
            </div>
        </>
    )
};

export default Profile;