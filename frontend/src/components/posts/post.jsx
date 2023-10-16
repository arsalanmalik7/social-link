import { useState, useRef } from "react";
import axios from "axios";
import { baseUrl } from "../../core.mjs";

const Post = ({ eachPost, onDelete, onUpdate }) => {

  



    const instance = axios.create({
        baseURL: `${baseUrl}/api`
    })

  
    const [deletePost, setDeletePost] = useState(true);

    const [prevTitle, setPrevTitle] = useState("");
    const [prevText, setPrevText] = useState("");

    const postIdRef = useRef(null);

    const handleDeleteClick = () => {
        postIdRef.current = eachPost._id;

        

    }

    const handleSaveClick = async () => {
        const postId = postIdRef.current;

        const response = await instance.delete(`/post/${postId}`)
        try {
            setDeletePost(response.data);
            onDelete(postId);
        } catch (error) {
            console.log(error.data)
        }

        
    }

    const handleEditClick = async (e) => {

        setPrevTitle(eachPost.title);
        setPrevText(eachPost.text);

        

    }

    const updateClick = async () => {

        const postId = eachPost._id;

        try {
            const response = await instance.put(`/post/${postId}`, {
                title: prevTitle,
                text: prevText
            })

            console.log(response.data);

            const updatedPost = {
                _id: postId,
                title: prevTitle,
                text: prevText
            }


            onUpdate(updatedPost);

           
        } catch (error) {
            console.log(error.data)

        }
    }


    return (
        <>

            <div className="post">
                <h3>{eachPost.title}</h3>
                <p>{eachPost.text}</p>
                <button onClick={handleEditClick}>Edit</button>
                <button onClick={handleDeleteClick}>Delete</button>
            </div>
            
        </>
    )
}

export default Post;