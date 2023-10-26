import { useState, useEffect, useRef, useCallback } from 'react';
import { baseUrl } from '../../core.mjs';
import axios from 'axios';
import Post from '../../components/posts/post';


const Home = () => {
    const titleInputRef = useRef(null);
    const textInputRef = useRef(null);
    const [allPosts, setAllPosts] = useState([]);
    const searchInputRef = useRef(null);


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


    return (
        <>
            <form onSubmit={searchHandler}>
                <input type="text" className=' bg-gray-200 border border-black' ref={searchInputRef} placeholder="Search" required={true} />
                <button type='submit' className=' bg-gray-200 border border-black'>Search</button>
            </form>
            <form onSubmit={createPost}>
                <input type="text" className=' bg-gray-200 border border-black' ref={titleInputRef} placeholder="Title" required={true} />
                <textarea id="text" className=' bg-gray-200 border border-black' ref={textInputRef} placeholder="Text" cols="30" rows="10" required={true}></textarea>
                <button type='submit' className=' bg-gray-200 border border-black'>Create Post</button>

            </form>



            {

                allPosts.map((eachPost, index) => {
                    return <Post key={index} eachPost={eachPost} onDelete={handleDeletePost} onUpdate={handleUpdatePost} />
                })

            }

        </>


    )
}

export default Home;