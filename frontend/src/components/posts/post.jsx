import { useState, useRef, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/button';
import { PersonCircle } from "react-bootstrap-icons";
import moment from 'moment';

import { GlobalContext } from "../../context/context";



const Post = ({ eachPost, onDelete, onUpdate }) => {


    const instance = axios.create({
        baseURL: `${baseUrl}/api`
    })

    const { state } = useContext(GlobalContext);

    const [editeShow, setEditShow] = useState(false);

    const editeHandleClose = () => setEditShow(false);
    const editHandleShow = () => setEditShow(true);



    const [deleteShow, deleteSetShow] = useState(false);
    const deleteHandleClose = () => deleteSetShow(false);
    const deleteHandleShow = () => deleteSetShow(true);
    const [deletePost, setDeletePost] = useState(true);

    const [prevTitle, setPrevTitle] = useState("");
    const [prevText, setPrevText] = useState("");

    const postIdRef = useRef(null);

    const handleDeleteClick = () => {
        postIdRef.current = eachPost._id;

        deleteHandleShow()

    }

    const handleSaveClick = async () => {
        const postId = postIdRef.current;

        const response = await instance.delete(`/post/${postId}`, { withCredentials: true })
        try {
            setDeletePost(response.data);
            onDelete(postId);
        } catch (error) {
            console.log(error.data)
        }

        deleteHandleClose()
    }

    const handleEditClick = async (e) => {

        setPrevTitle(eachPost.title);
        setPrevText(eachPost.text);

        editHandleShow();

    }

    const updateClick = async () => {

        const postId = eachPost._id;

        try {
            const response = await instance.put(`/post/${postId}`, {
                title: prevTitle,
                text: prevText,
            }, { withCredentials: true })

            console.log(response.data);

            const updatedPost = {
                _id: postId,
                title: prevTitle,
                text: prevText
            }


            onUpdate(updatedPost);

            editeHandleClose();
        } catch (error) {
            console.log(error.data)

        }
    }


    return (
        <>

            <div className="post mb-16 flex justify-center border-2 border-black mt-4">
                <div className="p-3 border-2 border-gray-600 bg-neutral-400 w-96">
                    <div className="flex  items-center gap-3 border-1 border-black ">
                        <p className=" text-3xl"><PersonCircle /></p>
                        <div className="">
                            <span className=" text-xl p-0">{eachPost.authorObject.firstName} {eachPost.authorObject.lastName}</span><br />
                            <span>{moment(eachPost.authorObject.createdOn).format("MM Do YY")}</span>
                        </div>
                    </div>
                    <h3>{eachPost.title}</h3>
                    <p>{eachPost.text}</p>
                    {eachPost.authorObject._id === state.user._id ?
                        <div>
                            <button className="bg-blue-300 p-3 m-3 rounded " onClick={handleEditClick}>Edit</button>
                            <button className="bg-blue-300 p-3 m-3 rounded " onClick={handleDeleteClick}>Delete</button>
                        </div>
                        :
                        null
                    }

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

            {deletePost && (

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

                </Modal>)}

            <Modal show={editeShow} onHide={editeHandleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Title of Post</Form.Label>
                            <Form.Control
                                type="text"
                                value={prevTitle}
                                onChange={(e) => setPrevTitle(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
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

export default Post;