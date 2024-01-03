import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { baseUrl } from '../../core.mjs';
import axios from 'axios';
import { GlobalContext } from "../../context/context";
import { PersonCircle, ThreeDots, CardImage, PencilFill, XLg } from "react-bootstrap-icons";
import ProfilePosts from '../../components/profilePosts';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Tooltip } from '@mui/material';
import { Modal, Button } from 'react-bootstrap'
import spider from '../../assets/spider.jpg';



const Profile = () => {

    const { state } = useContext(GlobalContext);

    const { userId } = useParams();

    const [allPosts, setAllPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [showEditProfileForm, setShowEditProfileForm] = useState(false);

    const [updatedFirstName, setUpdatedFirstName] = useState("");
    const [updatedLastName, setUpdatedLastName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [updatedProfileImage, setUpdatedProfileImage] = useState("");

    const coverPicInputRef = useRef("");
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [coverPic, setCoverPic] = useState("");


    const textInputRef = useRef(null);
    const [showForm, setShowForm] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null);
    const [formIsValid, setFormIsValid] = useState(true);
    const [hasMoreData, setHasMoreData] = useState(true);
    const postImageInput = useRef("");


    const handleDeletePost = (postId) => {
        setAllPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    };


    const handleUpdatePost = (updatedPost) => {
        setAllPosts((prevPosts) => {
            const index = prevPosts.findIndex((post) => post._id === updatedPost._id);

            const newPosts = [...prevPosts];
            newPosts[index] = updatedPost;

            return newPosts;
        })

    }





    const instance = axios.create({
        baseURL: `${baseUrl}/api`

    });

    useEffect(() => {

        const socket = io(baseUrl, {
            withCredentials: true,
            secure: true,
        });


        socket.on('postLike', (e) => {
            // console.log('postLike', e);
            setAllPosts((prevPosts) => {

                const index = prevPosts.findIndex((post) => post._id === e.postId);

                const newPosts = [...prevPosts];

                if (index !== -1 && !newPosts[index].likes.includes(e.userId)) {
                    newPosts[index].likes.push(e.userId);
                }


                return newPosts;

            })
        });

        socket.on('postUnlike', (e) => {
            // console.log('postUnlike', e);
            setAllPosts((prevPosts) => {

                const index = prevPosts.findIndex((post) => post._id === e.postId);

                const newPosts = [...prevPosts];

                if (index !== -1 && newPosts[index].likes.includes(e.userId)) {
                    newPosts[index].likes = newPosts[index].likes.filter((id) => id !== e.userId);
                }


                return newPosts;

            })

        })

        return () => {
            socket.off('postLike');
            socket.off('postUnlike');
            socket.close();
            console.log('home socket closed');
        }

    }, [])


    const getProfile = async () => {
        try {
            const response = await instance.get(`/profile/${userId || ""}`, {
                withCredentials: true
            });
            console.log(response.data.data);
            setProfile(response.data.data);
        } catch (error) {
            console.log(error);
        }

    }

    const retriveData = useCallback(async () => {
        try {
            const response = await instance.get(`/posts?_id=${userId || ''}`, {
                withCredentials: true
            });
            setAllPosts(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }, [setAllPosts]);


    useEffect(() => {
        retriveData();
        getProfile();

    }, [retriveData]);


    const showPostForm = () => {

        setShowForm(!showForm)

    }

    const createPost = async (e) => {
        e.preventDefault();



        const formData = new FormData();

        formData.append('text', textInputRef.current.value);
        formData.append('image', postImageInput.current.files[0]);


        const response = await instance.post(`/post`, formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            },
        )

        try {
            retriveData();
            console.log(response.data)
            e.target.reset();

            setShowForm(!showForm)


        } catch (error) {
            console.log(error.data)
        }


    }



    const fileInputRef = useRef(null);



    const editProfileForm = () => {
        setUpdatedFirstName(state.user.firstName);
        setUpdatedLastName(state.user.lastName);
        setUpdatedEmail(state.user.email);
        setUpdatedProfileImage(state.user.profilePicture);
        setShowEditProfileForm(!showEditProfileForm);
    }

    const handleShowEditProfileForm = () => {
        setShowEditProfileForm(true)
        editProfileForm();
    };
    const handleCloseEditProfileForm = () => {
        setShowEditProfileForm(false)
        document.querySelector('body').style.overflow = 'auto';
    };



    const updateProfile = async (e) => {
        e.preventDefault();
        let formData = new FormData();


        formData.append('profilePicture', fileInputRef.current.files[0]);

        formData.append('firstName', updatedFirstName);
        formData.append('lastName', updatedLastName);
        formData.append('email', updatedEmail);

        try {
            const response = await instance.put(`/profile/${state.user._id}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
            console.log('updated Profile: ', response.data);
            setShowEditProfileForm(!showEditProfileForm);


        } catch (error) {
            console.log(error);
        }

    }

    const handleCoverPic = async (e) => {
        e.preventDefault();

        let formData = new FormData();

        formData.append('coverPic', coverPicInputRef.current.files[0]);

        try {
            const response = await instance.put(`/profile/${state.user._id}/coverPic`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
            console.log('updated Profile: ', response.data);
            handleClose();


        } catch (error) {
            console.log(error);
        }
    }



    return (
        <>


            <Modal show={showForm} onHide={showPostForm}>
                <Modal.Body>
                    <Modal.Header>
                        <Modal.Title>
                            <h2 >Create Post</h2>
                        </Modal.Title>
                        <Modal.Title>
                            <XLg onClick={showPostForm} className='ml-auto text-xl text-black cursor-pointer'
                            />
                        </Modal.Title>

                    </Modal.Header>
                    <form onSubmit={createPost} className=' bg-white p-3 m-3'>

                        <div className="flex  items-center gap-3 ">
                            {state.user.profilePic ?
                                <img src={state.user.profilePic} alt="" className=' w-10 h-10 object-cover rounded-full' />
                                :
                                <p className=" text-3xl pt-3"><PersonCircle /></p>

                            }
                            <div className="">
                                <span className=" text-xl p-0">{state.user.firstName} {state.user.lastName}</span>
                            </div>
                        </div>

                        <div className=' flex flex-col gap-5'>
                            <textarea id="text" className=' text-2xl p-2 focus:outline-none' ref={textInputRef} placeholder={`Whats on your mind, ${state.user.firstName + " " + state.user.lastName}?`} cols="30" rows="10" onChange={() => {
                                setFormIsValid(textInputRef.current.value.length > 0 ? false : true)

                            }} />
                            <div className=' sm:w-3/4 m-auto'>
                                {selectedImage && <img src={selectedImage} alt="profilepic" className=' object-contain' />}
                            </div>
                            <input type="file" id='post-image' name="image" ref={postImageInput} className='hidden' accept="image/*" onChange={(e) => {
                                const base64Url = URL.createObjectURL(e.target.files[0])
                                setSelectedImage(base64Url)
                            }} />
                            <label htmlFor='post-image' className=' bg-blue-700 p-2 rounded-lg cursor-pointer text-white font-bold hover:bg-blue-500 flex justify-center text-3xl items-center gap-1'><CardImage />Add Image</label>
                            <button type="submit" disabled={formIsValid && postImageInput.current?.files?.length === 0}
                                className='bg-blue-500 p-2 rounded-full text-white font-bold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed'>Post
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>


            <Modal show={showEditProfileForm} onHide={handleClose}>
                <Modal.Header >
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {state.profilePicture && <img src={updatedProfileImage} alt="" className=' w-full h-full object-cover' />}
                    </div>
                    <form onSubmit={updateProfile} className=' bg-white px-5 py-3 rounded  border-2 border-neutral-500 max-h-[35rem] overflow-auto relative '>

                        <div className=' flex justify-center flex-col gap-4 mt-3 mb-14 relative'>

                            {
                                state.user.profilePic ?
                                    <>
                                        <div className=' flex justify-center rounded-full'>
                                            <img src={state.user.profilePic} className=' w-28 rounded-full ' alt="profilepic" />
                                        </div>

                                        <label htmlFor="profile-image" className=' flex justify-end'><PencilFill /></label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className=' hidden'
                                            onChange={() => {
                                                const base64Url = URL?.createObjectURL(fileInputRef.current.files[0]);
                                                setProfileImage(base64Url);
                                            }}
                                            id='profile-image'
                                            accept="image/*"
                                        />


                                        {profileImage &&
                                            <>
                                                <div className=' m-auto'>
                                                    <img src={profileImage} alt="profile" />
                                                </div>
                                            </>
                                        }

                                    </>
                                    :
                                    <>
                                        <div className=' flex justify-center'>
                                            <h1 className="text-8xl  text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></h1>
                                        </div>

                                        <label htmlFor="profile-image" className=' flex justify-end'><PencilFill /></label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className=' hidden'
                                            onChange={() => {
                                                const base64Url = URL?.createObjectURL(fileInputRef.current.files[0]);
                                                setProfileImage(base64Url);
                                            }}
                                            id='profile-image'
                                            accept="image/*"
                                        />
                                        {profileImage &&
                                            <>
                                                <div className=''>
                                                    <img src={profileImage} alt="profile" />


                                                </div>
                                            </>
                                        }

                                    </>

                            }


                            <input
                                required
                                type="text"
                                placeholder="First Name"
                                value={updatedFirstName}
                                onChange={(e) => {
                                    setUpdatedFirstName(e.target.value);
                                }}
                                className=' p-2 text-lg bg-slate-200 rounded focus:outline-blue-500'
                            />

                            <input
                                required
                                type="text"
                                placeholder="Last Name"
                                value={updatedLastName}
                                onChange={(e) => {
                                    setUpdatedLastName(e.target.value);

                                }}
                                className=' p-2 text-lg bg-slate-200 rounded focus:outline-blue-500'
                            />
                            <input
                                required
                                type="text"
                                placeholder="Email"
                                value={updatedEmail}
                                onChange={(e) => {
                                    setUpdatedEmail(e.target.value);
                                }}
                                className=' p-2 text-lg bg-slate-200 rounded focus:outline-blue-500'
                            />
                        </div>
                        <div className=' '>

                            <div className=' flex justify-center mt-4 '>
                                <button type='submit' className=' font-bold py-2 px-4 text-white bg-blue-500 text-center rounded'>Update Profile</button>
                            </div>

                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditProfileForm}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>



            <div className="relative sm:w-full w-9/12 m-auto p-3">


                {
                    profile?.coverPic ?
                        <>

                            <img src={profile?.coverPic} alt="cover" className=" -cover rounded sm:w-full" />
                            {
                                state?.user?._id === profile?._id ?
                                    <div className='flex justify-center mt-5'>
                                        <Button variant='primary' onClick={handleShow}>Change coverPic</Button>
                                    </div>
                                    :
                                    null
                            }

                            <Modal show={show} onHide={handleClose} >
                                <Modal.Header>
                                    <Modal.Title>
                                        Upload Cover Image
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <form onSubmit={handleCoverPic} className=' flex flex-col justify-center'>
                                        <div>
                                            <input type="file" id="cover-pic" hidden accept="image/*" ref={coverPicInputRef} onChange={(e) => {
                                                const base64Url = URL?.createObjectURL(coverPicInputRef.current.files[0]);
                                                setCoverPic(base64Url);
                                            }} />
                                            <label htmlFor="cover-pic" className=' flex text-4xl text-black hover:cursor-pointer '><CardImage /><span className=' text-2xl pl-2'>Select Image</span></label>
                                        </div>
                                        {
                                            coverPic &&
                                            <>
                                                <div className=' flex flex-col justify-center gap-5'>
                                                    <div className=' flex justify-center mt-10'>
                                                        <img src={coverPic} alt="cover" />

                                                    </div>
                                                    <div className='m-auto'>
                                                        <Button type='submit' variant='primary'>Update</Button>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    </form>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                        </>
                        :

                        <>
                            <div className=' flex justify-end p-2 items-end  bg-slate-400 w-full h-96'>
                                <div onClick={handleShow} className='text-white p-2 text-2xl hover:cursor-pointer'>
                                    <PencilFill />
                                </div>
                            </div>

                            <Modal show={show} onHide={handleClose} >
                                <Modal.Header>
                                    <Modal.Title>
                                        Upload Cover Image
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <form onSubmit={handleCoverPic} className=' flex flex-col justify-center'>
                                        <div>
                                            <input type="file" id="cover-pic" hidden accept="image/*" ref={coverPicInputRef} onChange={(e) => {
                                                const base64Url = URL?.createObjectURL(coverPicInputRef.current.files[0]);
                                                setCoverPic(base64Url);
                                            }} />
                                            <label htmlFor="cover-pic" className=' flex text-4xl text-black hover:cursor-pointer '><CardImage /><span className=' text-2xl pl-2'>Select Image</span></label>
                                        </div>
                                        {
                                            coverPic &&
                                            <>
                                                <div className=' flex flex-col justify-center gap-5'>
                                                    <div className=' flex justify-center mt-10'>
                                                        <img src={coverPic} alt="cover" />

                                                    </div>
                                                    <div className='m-auto'>
                                                        <Button type='submit' variant='primary'>Update</Button>
                                                    </div>
                                                </div>
                                            </>
                                        }
                                    </form>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                }

                <div className={`absolute top-1/2 left-1/2 sm:-translate-y-[70%] transform -translate-x-1/2 -translate-y-1/2 mt-1 sm:mt-0 p-3 flex justify-center backdrop-blur-sm sm:backdrop-blur-0  sm:w-9/12  border-1 border-white rounded-md`}>
                    <div>
                        {state.isLogin && state.user._id === profile?._id &&
                            <div className=' flex justify-end'>
                                <div onClick={handleShowEditProfileForm} className=' rounded-full p-1 hover:bg-neutral-500 w-max text-white text-2xl hover:cursor-pointer'>
                                    <Tooltip title="Edit Profile">
                                        <ThreeDots />
                                    </Tooltip>

                                </div>
                            </div>
                        }
                        {profile?.profilePic ?

                            <div className="flex justify-center relative items-end">
                                <img src={profile?.profilePic} className="rounded-full w-24 h-24  object-contain bg-white" alt="profile" />
                            </div>
                            :
                            <div className="flex justify-center relative items-end">
                                <h1 className="text-8xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle />
                                </h1>
                            </div>
                        }
                        <div className="text-center text-white flex flex-col">
                            <div className=' flex'>
                                <p className=" text-4xl sm:text-2xl font-bold drop-shadow-lg ">{profile?.firstName} {profile?.lastName}</p>
                            </div>
                            <div className=' flex items-center justify-center'>
                                <p className=" drop-shadow-lg">{profile?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className=' flex justify-center bg-blue-100'>
                <div className=' w-2/4 sm:w-11/12 mt-3'>

                    {
                        state.isLogin && state.user._id === profile?._id &&
                        <div className='bg-white  p-4 flex items-center gap-2 w-3/4 mt-4 m-auto rounded '>
                            {state.user.profilePic ?
                                <img src={state.user.profilePic} alt="" className=' w-10 h-10 object-cover rounded-full' />
                                :
                                <h3><PersonCircle /></h3>

                            }
                            <button onClick={showPostForm} className=' bg-neutral-200 p-2 rounded-full flex-grow hover:bg-neutral-300'>Whats on your mind, Arsalan?</button>
                        </div>
                    }


                    {allPosts && allPosts.length > 0 ?

                        allPosts.map((posts, index) => {

                            return <ProfilePosts key={index} posts={posts} profile={profile} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />

                        })

                        :
                        <div className=' flex justify-center items-center'>
                            <h1 className=' text-3xl font-bold'>No Post Found</h1>
                        </div>

                    }
                </div>
            </div>
        </>
    )
};


export default Profile;