import { useState } from "react";
import API from "../api/axios";
import { FiX, FiUploadCloud } from "react-icons/fi";

export default function CreateReel({ onClose, onCreated }) {

    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState("");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVideo = (e) => {

        const file = e.target.files[0];
        if (!file) return;

        setVideo(file);
        setPreview(URL.createObjectURL(file));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!video) return;

        try {

            setLoading(true);

            const formData = new FormData();
            formData.append("video", video);
            formData.append("caption", caption);

            await API.post("/reels", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onCreated && onCreated();
            onClose();

        } catch (error) {

            console.log(error);
            alert(error.response?.data?.message || "Failed to upload reel");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">

                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="font-semibold text-lg">Create Reel</h3>
                    <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-800">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {preview ? (

                        <video
                            src={preview}
                            controls
                            className="w-full rounded-xl max-h-80 bg-black"
                        />

                    ) : (

                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer text-gray-500 hover:border-blue-500">

                            <FiUploadCloud className="text-3xl" />
                            <span className="text-sm">Choose a video to upload</span>

                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={handleVideo}
                            />

                        </label>

                    )}

                    <textarea
                        rows={2}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full resize-none bg-gray-100 rounded-xl p-3 outline-none"
                    />

                    <button
                        disabled={loading || !video}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-full disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Share Reel"}
                    </button>

                </form>

            </div>

        </div>

    );

}
