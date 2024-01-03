import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { baseUrl } from '../../core.mjs';
import axios from 'axios';
import Post from '../../components/posts/post';
import { PersonCircle, XLg, CardImage, CheckCircleFill } from 'react-bootstrap-icons';
import { GlobalContext } from "../../context/context";
import io from 'socket.io-client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Modal } from 'react-bootstrap';


const Home = () => {

    const textInputRef = useRef(null);
    const [allPosts, setAllPosts] = useState([]);
    const [showForm, setShowForm] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null);
    const [formIsValid, setFormIsValid] = useState(true);
    const [hasMoreData, setHasMoreData] = useState(true);
    const postImageInput = useRef("");

    const { state, dispatch } = useContext(GlobalContext);

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

                if (index !== -1 && !newPosts[index].likes.some(like => like.userId === e.like.userId)) {
                    newPosts[index].likes.push(e.like);
                }

                return newPosts;
            });
        });

        socket.on('postUnlike', (e) => {
            // console.log('postUnlike', e);
            setAllPosts((prevPosts) => {
                const index = prevPosts.findIndex((post) => post._id === e.postId);
                const newPosts = [...prevPosts];

                if (index !== -1) {
                    const likeIndex = newPosts[index].likes.findIndex((like) => like.userId === e.like.userId);

                    if (likeIndex !== -1) {
                        newPosts[index].likes.splice(likeIndex, 1);
                    }
                }

                return newPosts;
            });
        });


        return () => {
            socket.off('postLike');
            socket.off('postUnlike');
            socket.close();
            console.log('home socket closed');
        }

    }, [])



    const retriveData = useCallback(async () => {
        try {
            const response = await instance.get(`/feed?page=0`, {
                withCredentials: true
            });
            setAllPosts(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }, [setAllPosts]);




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

    const [scrollData, setScrollData] = useState("");


    useEffect(() => {
        retriveData();

    }, [retriveData]);

    const showPostForm = () => {

        setShowForm(!showForm)

    }


    const loadMore = async () => {


        try {
            const response = await instance.get(`/feed?page=${allPosts.length}`, { withCredentials: true })

            if (response.data.length > 0) {
                setAllPosts((prevPosts) => [...prevPosts, ...response.data]);
                setScrollData(response.data);
                console.log(response.data);
            } else {
                setHasMoreData(false);
            }

        } catch (error) {
            console.log(error);
        }

    }



    return (
        <>

            {/* <div className={`${showForm ? 'block' : 'hidden'} absolute z-50  w-full h-full top-2 backdrop-blur-sm flex justify-center sm:left-5 items-center`}> */}
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
            {/* </div> */}

            <div className=' bg-blue-100 flex justify-center'>
                <div className=' w-2/4 sm:w-11/12 mt-3'>



                    <div className='bg-white  p-4 flex items-center gap-2 w-3/4 mt-4 m-auto rounded '>
                        {state.user.profilePic ?
                            <img src={state.user.profilePic} alt="" className=' w-10 h-10 object-cover rounded-full' />
                            :
                            <h3><PersonCircle /></h3>

                        }
                        <button onClick={showPostForm} className=' bg-neutral-200 p-2 rounded-full flex-grow hover:bg-neutral-300'>Whats on your mind, {state.user.firstName} {state.user.lastName}?</button>
                    </div>



                    <InfiniteScroll
                        dataLength={allPosts.length}
                        next={loadMore}
                        hasMore={hasMoreData}
                        loader={
                            <>
                                <div className=' flex justify-center m-1'>
                                    <div
                                        className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                        role="status">
                                        <span
                                            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                        >Loading...</span>
                                    </div>
                                </div>
                            </>
                        }
                        endMessage={
                            <p className=' flex items-center gap-2 justify-center'>
                                <b>You have seen it all</b><CheckCircleFill className=' text-green-600' />
                            </p>
                        }
                        scrollableTarget="scrollableDiv"
                        pullDownToRefresh
                        pullDownToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                        }
                        releaseToRefreshContent={
                            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                        }
                        refreshFunction={retriveData}
                    >


                        {allPosts && allPosts.length > 0 ?

                            allPosts.map((eachPost, index) => {
                                return <Post key={index} eachPost={eachPost} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />
                            })
                            :
                            <div className=' flex justify-center flex-col items-center'>
                                <div className=" mt-5 w-9/12 gap-5 m-3 p-2 rounded bg-white ">
                                    <div className=" pt-3 animate-pulse flex items-center gap-1">
                                        <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                        <div>
                                            <h2 className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                            <h2 className="text-lg h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                        </div>
                                    </div>

                                    <div className=" pt-3 animate-pulse flex items-center gap-1 m-2">
                                        <p className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></p>
                                    </div>
                                </div>

                                <div className=" mt-5 w-9/12  gap-5 m-3 p-2 rounded bg-white ">
                                    <div className=" pt-3 animate-pulse flex items-center gap-1">
                                        <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                        <div>
                                            <h2 className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                            <h2 className="text-lg h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                        </div>
                                    </div>

                                    <div className='pt-3 animate-pulse flex items-center m-2 bg-slate-400 dark:bg-slate-500 h-96'>

                                    </div>
                                </div>
                                <div className=" mt-5 w-9/12 gap-5 m-3 p-2 rounded bg-white ">
                                    <div className=" pt-3 animate-pulse flex items-center gap-1">
                                        <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                        <div>
                                            <h2 className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                            <h2 className="text-lg h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                        </div>
                                    </div>

                                    <div className=" pt-3 animate-pulse flex items-center gap-1 m-2">
                                        <p className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></p>
                                    </div>
                                </div>

                                <div className=" mt-5 w-9/12  gap-5 m-3 p-2 rounded bg-white ">
                                    <div className=" pt-3 animate-pulse flex items-center gap-1">
                                        <p className="text-5xl text-slate-400 bg-neutral-200 w-fit rounded-full"><PersonCircle /></p>
                                        <div>
                                            <h2 className="text-xl h-4 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                            <h2 className="text-lg h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-48 "></h2>
                                        </div>
                                    </div>

                                    <div className='pt-3 animate-pulse flex items-center m-2 bg-slate-400 dark:bg-slate-500 h-96'>

                                    </div>
                                </div>
                            </div>
                        }
                    </InfiniteScroll>
                </div>
            </div>
        </>


    )
}

export default Home;