import { useState, useEffect, useRef } from 'react';
import { baseUrl } from '../../core.mjs';
import axios from 'axios';
import Post from '../../components/posts/post';


const Home = () => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
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




    async function retriveData() {

        try {
            const response = await instance.get(`/posts`, {
                withCredentials: true
            })
            setAllPosts(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const createPost = async (e) => {
        e.preventDefault();


        const newTitle = e.target[0].value;
        const newText = e.target[1].value;

        setTitle(newTitle)
        setText(newText)


        e.target.reset();

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
    }, []);


    return (
        <>
            <form>
                <input type="text" placeholder="Title" />
                <textarea id="text" placeholder="Text" cols="30" rows="10"></textarea>
                <button type="submit" onClick={createPost}>Create Post</button>

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