import { useState, useEffect, useRef, useCallback } from 'react';
import { baseUrl } from '../../core.mjs';
import axios from 'axios';
import Post from '../../components/posts/post';
import { PersonCircle, XLg } from 'react-bootstrap-icons';


const Home = () => {
    const titleInputRef = useRef(null);
    const textInputRef = useRef(null);
    const [allPosts, setAllPosts] = useState([]);
    const searchInputRef = useRef(null);
    const [showForm, setShowForm] = useState(false)


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

    })



    const retriveData = useCallback(async () => {
        try {
            const response = await instance.get(`/feed`, {
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


        const newTitle = titleInputRef.current.value;
        const newText = textInputRef.current.value;


        const response = await instance.post(`/post`, {
            title: newTitle,
            text: newText

        },
            {
                withCredentials: true,
            }
        )

        try {
            retriveData();
            console.log(response.data)
            e.target.reset();
        } catch (error) {
            console.log(error.data)
        }


    }


    const searchHandler = async (e) => {
        e.preventDefault()
        try {

            const response = await instance.get(`/search?q=${searchInputRef.current.value}`, {
                withCredentials: true
            });
            console.log(response.data);

            setAllPosts([...response.data]);
        } catch (error) {
            console.log(error.data);

        }
    }


    useEffect(() => {
        retriveData();
    }, [retriveData]);

    const showPostForm = () => {

        setShowForm(!showForm)
    }


    return (
        <>

            <form onSubmit={searchHandler} className=' lg:mt-24'>
                <input type="text" className=' bg-gray-200 border border-black' ref={searchInputRef} placeholder="Search" required={true} />
                <button type='submit' className=' bg-gray-200 border border-black'>Search</button>
            </form>

            <div className='bg-slate-300 p-4 flex items-center gap-2 w-5/12 mt-3 m-auto rounded'>
                <h3><PersonCircle /></h3>
                <button onClick={showPostForm} className=' bg-neutral-200 p-2 rounded-full flex-grow hover:bg-neutral-300'>Whats on your mind, Arsalan?</button>
            </div>
            <div className={`${showForm ? 'block' : 'hidden'} absolute  w-full h-full top-0 backdrop-blur-sm flex justify-center items-center`}>
                <form onSubmit={createPost} className='bg-slate-50 p-5 rounded  '>
                    <XLg onClick={showPostForm} size={40} color='black'
                        style={{ cursor: 'pointer' }}
                        className='ml-auto' />
                    <h2 className='text-center border-b-2 border-b-black'>Create Post</h2>

                    <textarea id="text" className=' text-2xl p-2' ref={textInputRef} placeholder="Whats on your mind, Arsalan?" cols="30" rows="10" required={true}></textarea>
                </form>
            </div>



            {

                allPosts.map((eachPost, index) => {
                    return <Post key={index} eachPost={eachPost} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />
                })

            }

        </>


    )
}

export default Home;