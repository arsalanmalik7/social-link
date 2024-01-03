import { useState, useContext, useCallback, useRef } from 'react';
import { baseUrl } from '../core.mjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from "../context/context";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/button';
import { PersonCircle, ThreeDots, HandThumbsUp, Chat, Share, PencilSquare, Trash, HandThumbsUpFill } from "react-bootstrap-icons";
import moment from 'moment';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const ProfilePosts = ({ posts, profile, handleDeletePost, handleUpdatePost }) => {

    const { state } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [editeShow, setEditShow] = useState(false);

    const editeHandleClose = () => setEditShow(false);
    const editHandleShow = () => setEditShow(true);

    const instance = axios.create({
        baseURL: `${baseUrl}/api`

    })

    const [deleteShow, deleteSetShow] = useState(false);
    const deleteHandleClose = () => deleteSetShow(false);
    const deleteHandleShow = () => deleteSetShow(true);
    const [deletePost, setDeletePost] = useState(true);
    const [showPostFullImage, setShowPostFullImage] = useState(false);


    const [prevText, setPrevText] = useState("");

    const postIdRef = useRef(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const ITEM_HEIGHT = 48;

    const handleDeleteClick = () => {
        postIdRef.current = posts._id;

        deleteHandleShow()
        handleClose();

    }

    const handleSaveClick = async () => {
        const postId = postIdRef.current;

        const response = await instance.delete(`/post/${postId}`, { withCredentials: true })
        try {
            setDeletePost(response.data);
            handleDeletePost(postId);
        } catch (error) {
            console.log(error.data)
        }

        deleteHandleClose()
    }

    const handleEditClick = async (e) => {


        setPrevText(posts.text);

        editHandleShow();
        handleClose();

    }

    const updateClick = async () => {

        const postId = posts._id;

        try {
            const response = await instance.put(`/post/${postId}`, {

                text: prevText,
            }, { withCredentials: true })

            console.log(response.data);

            const updatedPost = {
                _id: postId,

                text: prevText
            }


            handleUpdatePost(updatedPost);

            editeHandleClose();
        } catch (error) {
            console.log(error.data)

        }
    }


    const showPostImage = () => {
        setShowPostFullImage(!showPostFullImage);
        console.log(showPostFullImage);
    };

    const hidePostImage = () => {
        setShowPostFullImage(!showPostFullImage);

    }

    const likeSubmitHandler = async () => {

        const postId = posts._id;
        try {
            const response = await instance.post(`/post/${postId}/like`, {}, { withCredentials: true });
            // console.log(response.data);

        } catch (error) {
            console.log(error.response.data);

        }



    }
    const unlikeSubmitHandler = async () => {
        const postId = posts._id;
        try {
            const response = await instance.post(`/post/${postId}/unlike`, {}, { withCredentials: true });
            // console.log(response.data);

        } catch (error) {
            console.log(error.response.data);

        }

    }

    return (
        <>
            <>
                <div className="post mb-16 flex justify-center  mt-4">
                    <div className="p-3 rounded bg-white w-9/12 md:w-full">
                        <div className="flex justify-between ">

                            <div className="flex  items-center gap-3 ">
                                {
                                    profile?.profilePic ?
                                        <>
                                            <div className=' w-12 rounded-full'>
                                                <img src={profile?.profilePic} className='rounded-full' alt="profile-pic" />
                                            </div>
                                        </>
                                        :
                                        <p className=" text-3xl pt-3"><PersonCircle /></p>
                                }
                                <div className="">
                                    <span className=" text-xl p-0">{profile?.firstName} {profile?.lastName}</span><br />
                                    <span>{moment(posts.createdOn).startOf('hour').fromNow()}</span>
                                </div>
                            </div>
                            <div>
                                <IconButton
                                    aria-label="more"
                                    id="long-button"
                                    aria-controls={open ? 'long-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-haspopup="true"
                                    onClick={handleClick}
                                >
                                    <ThreeDots />
                                </IconButton>
                                <Menu
                                    id="long-menu"
                                    MenuListProps={{
                                        'aria-labelledby': 'long-button',
                                    }}
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    PaperProps={{
                                        style: {
                                            maxHeight: ITEM_HEIGHT * 4.5,
                                            width: '20ch',
                                        },
                                    }}
                                >
                                    <div className=" z-10">
                                        {posts.authorId === state.user._id ?
                                            <>
                                                <MenuItem className="flex gap-1" onClick={handleEditClick}><PencilSquare /> Edit</MenuItem>
                                                <MenuItem className="flex gap-1" onClick={handleDeleteClick}><Trash /> Delete</MenuItem>
                                                <MenuItem className="flex gap-1"><Share />Share</MenuItem>
                                            </>
                                            :
                                            <MenuItem className="flex gap-1">
                                                <Share />Share
                                            </MenuItem>
                                        }
                                    </div>
                                </Menu>
                            </div>

                        </div>

                        {
                            posts.img ?

                                <>

                                    {showPostFullImage === true && (
                                        <Modal show={showPostImage} onHide={hidePostImage}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Post Image</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <img src={posts.img} alt="post" className=" w-full px-0 py-2 object-cover" />
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={hidePostImage}>
                                                    Close
                                                </Button>
                                            </Modal.Footer>


                                        </Modal>
                                    )}

                                    <p>{posts?.text}</p>
                                    <div className=" bg-slate-300  z-50 overflow-hidden">
                                        <img src={posts?.img} onClick={showPostImage} alt="post" className=" w-full px-0 py-2 h-96 object-cover" />
                                    </div>

                                </>

                                :
                                (
                                    posts?.text?.length > 100 ?
                                        (
                                            <div>
                                                <p className=" text-xl">{posts?.text}</p>
                                            </div>


                                        )
                                        :
                                        (
                                            <div className=" flex justify-center items-center bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-500 p-6 h-80 mt-2 ">
                                                <p className=" text-white text-4xl font-bold">{posts?.text}</p>
                                            </div>
                                        )

                                )
                        }

                        <div className=" flex justify-around border-t-2 border-gray-400 pt-2 ">

                            {
                                posts?.likes?.includes(state?.user?._id) ?

                                    <div onClick={unlikeSubmitHandler} className="flex items-center py-1 px-3 gap-1 hover:bg-slate-200 rounded-sm hover:cursor-pointer flex-grow justify-center text-blue-500">
                                        <HandThumbsUpFill /> Like {posts?.likes?.length}

                                    </div>
                                    :
                                    <div onClick={likeSubmitHandler} className="flex items-center py-1 px-3 gap-1 hover:bg-slate-200 rounded-sm hover:cursor-pointer flex-grow justify-center">
                                        <HandThumbsUp /> Like {posts?.likes?.length}

                                    </div>
                            }
                            <div onClick={() => {
                                navigate(`/post/${posts._id}`,
                                    {
                                        state: {
                                            postId: posts._id,
                                        }
                                    })
                            }} className="flex items-center py-1 px-3 gap-1 hover:bg-slate-200 rounded-sm hover:cursor-pointer flex-grow justify-center">
                                <Chat /> Comment

                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={deleteShow} onHide={deleteHandleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Post</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Delete Post Permenently?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={deleteHandleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSaveClick}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>

            {
                deletePost && (

                    <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>

                        </Modal.Header>
                        <Modal.Body>

                            <h1>
                                {deletePost}
                            </h1>
                        </Modal.Body>

                    </Modal>)
            }

            <Modal show={editeShow} onHide={editeHandleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>

                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>text of Post</Form.Label>
                            <Form.Control as="textarea" rows={3} value={prevText} onChange={(e) => setPrevText(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={editeHandleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={updateClick}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal >
        </>
    )


}

export default ProfilePosts;