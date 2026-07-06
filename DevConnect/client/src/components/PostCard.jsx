import { useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FiHeart,
    FiMessageCircle,
    FiSend,
    FiMoreHorizontal,
    FiBookmark,
    FiTrash2,
    FiLink,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import CommentModal from "./CommentModal";

export default function PostCard({ post, onDeleted }) {

    const { user } = useAuth();

    const [likes, setLikes] = useState(post.likes?.length || 0);
    const [liked, setLiked] = useState(
        post.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
    );
    const [bookmarked, setBookmarked] = useState(
        user?.bookmarks?.includes(post._id) || false
    );
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(null);
    const [deleted, setDeleted] = useState(false);

    const isOwner = user?._id === post.user?._id;

    const likePost = async () => {

        try {

            const res = await API.put(`/posts/${post._id}/like`);

            setLikes(res.data.likes);
            setLiked(res.data.liked);

        } catch (error) {

            console.log(error);

        }

    };

    const toggleBookmark = async () => {

        try {

            await API.put(`/users/bookmark/${post._id}`);
            setBookmarked((prev) => !prev);

        } catch (error) {

            console.log(error);

        } finally {

            setShowMenu(false);

        }

    };

    const copyLink = async () => {

        try {

            const url = `${window.location.origin}/profile/${post.user.username}`;
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");

        } catch (error) {

            console.log(error);

        } finally {

            setShowMenu(false);

        }

    };

    const sharePost = async () => {

        const url = `${window.location.origin}/profile/${post.user.username}`;

        if (navigator.share) {

            try {
                await navigator.share({ title: "Check out this post on DevConnect", url });
            } catch (error) {
                console.log(error);
            }

        } else {

            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");

        }

    };

    const removePost = async () => {

        if (!window.confirm("Delete this post?")) return;

        try {

            await API.delete(`/posts/${post._id}`);
            setDeleted(true);
            onDeleted && onDeleted(post._id);

        } catch (error) {

            console.log(error);

        } finally {

            setShowMenu(false);

        }

    };

    if (deleted) return null;

    return (

        <div className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-xl">

            {/* Header */}

            <div className="flex justify-between items-center p-4">

                <Link
                    to={`/profile/${post.user.username}`}
                    className="flex items-center gap-3"
                >

                    <img
                        src={
                            post.user.profilePic ||
                            "/Ultimate.jpeg"
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>

                        <h3 className="font-semibold">
                            {post.user.fullName}
                        </h3>

                        <p className="text-gray-500 text-sm">
                            @{post.user.username}
                        </p>

                    </div>

                </Link>

                <div className="relative">

                    <button
                        onClick={() => setShowMenu((prev) => !prev)}
                        className="text-xl cursor-pointer text-gray-600 hover:text-gray-900"
                    >
                        <FiMoreHorizontal />
                    </button>

                    {showMenu && (

                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border overflow-hidden z-10">

                            <button
                                onClick={toggleBookmark}
                                className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-gray-100 text-sm"
                            >
                                {bookmarked ? <FaBookmark /> : <FiBookmark />}
                                {bookmarked ? "Remove bookmark" : "Bookmark"}
                            </button>

                            <button
                                onClick={copyLink}
                                className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-gray-100 text-sm"
                            >
                                <FiLink />
                                Copy link
                            </button>

                            {isOwner && (

                                <button
                                    onClick={removePost}
                                    className="w-full flex items-center gap-2 text-left px-4 py-3 hover:bg-red-50 text-red-600 text-sm"
                                >
                                    <FiTrash2 />
                                    Delete post
                                </button>

                            )}

                        </div>

                    )}

                </div>

            </div>

            {/* Caption */}

            {post.text && (

                <p className="px-4 pb-3 text-gray-800">
                    {post.text}
                </p>

            )}

            {/* Image */}

            {post.image && (

                <img
                    src={post.image}
                    alt=""
                    className="w-full max-h-600px object-cover"
                />

            )}

            {/* Actions */}

            <div className="flex justify-between items-center px-4 py-3">

                <div className="flex gap-6">

                    <button
                        onClick={likePost}
                        className={`text-2xl transition ${
                            liked
                                ? "text-red-500"
                                : "text-gray-700"
                        }`}
                    >

                        {liked ? <FaHeart /> : <FiHeart />}

                    </button>

                    <button
                        onClick={() => setShowComments(true)}
                        className="text-2xl text-gray-700 flex items-center gap-1"
                    >

                        <FiMessageCircle />

                        {commentCount !== null && (
                            <span className="text-sm">{commentCount}</span>
                        )}

                    </button>

                    <button
                        onClick={sharePost}
                        className="text-2xl text-gray-700"
                    >

                        <FiSend />

                    </button>

                </div>

                <button onClick={toggleBookmark} className="text-2xl text-gray-700">
                    {bookmarked ? <FaBookmark className="text-blue-600" /> : <FiBookmark />}
                </button>

            </div>

            {/* Likes */}

            <div className="px-4">

                <p className="font-semibold">
                    {likes} Likes
                </p>

            </div>

            {/* Time */}

            <div className="px-4 py-3 text-sm text-gray-500">

                {new Date(post.createdAt).toLocaleString()}

            </div>

            {showComments && (
                <CommentModal
                    targetType="post"
                    targetId={post._id}
                    onClose={() => setShowComments(false)}
                    onCommentAdded={() =>
                        setCommentCount((prev) => (prev === null ? 1 : prev + 1))
                    }
                />
            )}

        </div>

    );

}
