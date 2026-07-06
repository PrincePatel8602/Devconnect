import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiX, FiSend, FiTrash2 } from "react-icons/fi";

// targetType: "post" | "reel"
export default function CommentModal({ targetType, targetId, onClose, onCommentAdded }) {
    const { user } = useAuth();

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const commentsUrl =
        targetType === "reel"
            ? `/reels/${targetId}/comments`
            : `/comments/${targetId}`;

    const postUrl =
        targetType === "reel"
            ? `/reels/${targetId}/comments`
            : `/comments/${targetId}`;

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await API.get(commentsUrl);
            setComments(res.data.comments || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();

        if (!text.trim()) return;

        try {
            setPosting(true);

            const res = await API.post(postUrl, { text });

            setComments((prev) => [res.data.comment, ...prev]);
            setText("");

            onCommentAdded && onCommentAdded();
        } catch (error) {
            console.log(error);
        } finally {
            setPosting(false);
        }
    };

    const removeComment = async (commentId) => {
        try {
            await API.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="font-semibold text-lg">Comments</h3>
                    <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-800">
                        <FiX />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-400 text-sm">Loading comments...</p>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm">
                            No comments yet. Be the first to comment.
                        </p>
                    ) : (
                        comments.map((c) => (
                            <div key={c._id} className="flex items-start gap-3">
                                <img
                                    src={c.user?.profilePic || "https://via.placeholder.com/36"}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover"
                                />

                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold mr-2">
                                            {c.user?.username}
                                        </span>
                                        {c.text}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(c.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                {c.user?._id === user?._id && (
                                    <button
                                        onClick={() => removeComment(c._id)}
                                        className="text-gray-400 hover:text-red-500 text-sm"
                                        title="Delete comment"
                                    >
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <form
                    onSubmit={submitComment}
                    className="border-t px-4 py-3 flex items-center gap-2"
                >
                    <img
                        src={user?.profilePic || "https://via.placeholder.com/32"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={posting || !text.trim()}
                        className="text-blue-600 text-xl disabled:text-gray-300"
                    >
                        <FiSend />
                    </button>
                </form>
            </div>
        </div>
    );
}
