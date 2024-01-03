import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../core.mjs";
import { useParams, useNavigate } from "react-router-dom";
import { GlobalContext } from "../../context/context";
import { HandThumbsUpFill, XLg, BoxArrowInUpRight } from 'react-bootstrap-icons'
import { Modal } from "react-bootstrap";
import Post from "../../components/posts/post";


const PostDetails = () => {

    const insatance = axios.create({
        baseURL: `${baseUrl}/api`,
    });


    const { state } = useContext(GlobalContext);

    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState([]);
    const commentInputRef = useRef("");

    const [show, setShow] = useState(false);



    useEffect(() => {
        const getPost = async () => {
            try {
                const response = await insatance.get(`/post/${postId}`, { withCredentials: true });
                console.log(response.data);
                setPost(response.data[0]);
                console.log(post);
            } catch (error) {
                console.log(error);
            }
        }

        getPost();
    }, [setPost]);

    const showWhoLiked = () => {
        setShow(!show);
    }

    const commentSubmitHandler = async (e) => {
        e.preventDefault();
        console.log(commentInputRef?.current?.value);

        try {

            const response = await insatance.post(`/post/${postId}/comment`, {
                text: commentInputRef?.current?.value,
                firstName: state?.user?.firstName,
                lastName: state?.user?.lastName,
                profilePic: state?.user?.profilePic,

            }, { withCredentials: true });

            console.log(response.data);
            setPost((prevPost) => ({
                ...prevPost,
                comments: [
                    ...prevPost.comments,
                    {
                        text: commentInputRef?.current?.value,
                        authorName: state?.user?.firstName + ' ' + state?.user?.lastName,
                        authorProfilePic: state?.user?.profilePic,
                    },
                ],
            }));


        } catch (error) {
            console.log(error);
        }

        setTimeout(() => {
            e.target.reset();
        }, 0);

    }


    return (
        <>

            <Modal show={show} onHide={showWhoLiked} centered>
                <Modal.Header>
                    <Modal.Title>
                        <h2 >Who liked this post?</h2>
                    </Modal.Title>
                    <Modal.Title>
                        <XLg onClick={showWhoLiked} className='ml-auto text-xl text-black cursor-pointer'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className=" flex flex-col gap-2">
                        {
                            post?.likes?.length > 0 ?
                                post.likes.map((like, index) => {
                                    return (
                                        <div key={index} onClick={() => {
                                            navigate(`/profile/${like.userId}`)
                                        }} className=" flex items-center justify-between  ">
                                            <div className=" flex gap-1">
                                                <img src={like.likedByProfilePic} className=" w-12 h-12 rounded-full" alt="profile" />
                                                <p className=" text-xl ">{like.likedByFirstName} {like.likedByLastName}</p>
                                            </div>
                                            <p className="text-2xl self-end"><BoxArrowInUpRight /></p>
                                        </div>
                                    )
                                })
                                :
                                <p className=" text-xl font-bold ">No one liked this post yet!</p>
                        }
                    </div>


                </Modal.Body>

            </Modal>

            <div className="">

                <Post eachPost={post} />

                <div onClick={showWhoLiked} className=" mx-3 flex  bg-blue-100 px-2 font-semibold text-2xl items-center gap-1 hover:cursor-pointer">
                    <p className="mb-0 pb-2">{post?.likes?.length} {post?.likes?.length === 1 ? 'like' : 'likes'} </p> <div className="pb-2"><HandThumbsUpFill /></div>
                </div>

                <div className=" flex justify-center px-3 py-2">

                    <form onSubmit={commentSubmitHandler} className="  bg-slate-200 p-2 flex justify-center flex-grow gap-3 ">
                        <input ref={commentInputRef} name="comment" id="comment" className=" p-2 flex-grow focus:outline-blue-500" required type="text" placeholder="write a comment..." />
                        <button className=" bg-blue-500 p-2 rounded-md text-white font-bold hover:bg-blue-600" type="submit">Comment</button>
                    </form>

                </div>
            </div>
            <main className=" bg-neutral-600">


                <div className="mb-1 flex flex-col-reverse">
                    {
                        post?.comments?.length > 0 ?
                            post.comments.map((comment, index) => {
                                return (
                                    <div key={index} className=" p-2  flex  justify-start items-center gap-2 m-3 backdrop-blur-md">
                                        <div className=" flex gap-1 items-center self-start ">
                                            <img src={comment.authorProfilePic} className=" w-12 h-12 rounded-full" alt="profile" />
                                        </div>
                                        <div className=" px-2  bg-blue-300 rounded self-start">
                                            <span className=" text-xl font-bold ">{comment.authorName}</span>
                                            <p className=" text-xl pt-2 ">{comment.text}</p>
                                        </div>
                                    </div>
                                )


                            })
                            :
                            <div className=" flex justify-center items-center p-2 ">
                                <h1 className=" bg-blue-200 font-bold rounded-md border-2 border-blue-500 p-2">No Comments Yet</h1>
                            </div>
                    }
                </div>


            </main>
        </>
    );

}

export default PostDetails;