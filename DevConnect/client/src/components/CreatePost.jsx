import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiImage, FiX } from "react-icons/fi";

export default function CreatePost({ onPostCreated }) {

    const { user } = useAuth();

    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImage = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));

    };

    const removeImage = () => {

        setImage(null);
        setPreview("");

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!text.trim() && !image) return;

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("text", text);

            if (image) {

                formData.append("image", image);

            }

            await API.post("/posts", formData);

            setText("");
            setImage(null);
            setPreview("");

            onPostCreated && onPostCreated();

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="bg-white rounded-2xl shadow-md p-5">

            <form onSubmit={handleSubmit}>

                <div className="flex gap-3">

                    <img
                        src={
                            user?.profilePic ||
                            "/Ultimate.jpeg"
                        }
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    <textarea
                        rows={3}
                        value={text}
                        onChange={(e) =>
                            setText(e.target.value)
                        }
                        placeholder="What's on your mind?"
                        className="flex-1 resize-none bg-gray-100 rounded-xl p-3 outline-none"
                    />

                </div>

                {
                    preview && (

                        <div className="relative mt-4">

                            <img
                                src={preview}
                                alt=""
                                className="rounded-xl max-h-500px w-full object-cover"
                            />

                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-3 right-3 bg-black text-white rounded-full p-2"
                            >

                                <FiX />

                            </button>

                        </div>

                    )
                }

                <div className="flex justify-between items-center mt-5">

                    <label className="cursor-pointer flex items-center gap-2 text-blue-600 font-semibold">

                        <FiImage className="text-2xl" />

                        Photo

                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImage}
                        />

                    </label>

                    <button
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-full"
                    >

                        {
                            loading
                                ? "Posting..."
                                : "Post"
                        }

                    </button>

                </div>

            </form>

        </div>

    );

}