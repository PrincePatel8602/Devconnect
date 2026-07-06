import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
    FiVolume2,
    FiVolumeX,
    FiMessageCircle,
    FiSend,
    FiPlay,
    FiTrash2,
} from "react-icons/fi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentModal from "./CommentModal";

export default function ReelCard({ reel, active, muted, onToggleMute, onDeleted }) {

    const { user } = useAuth();
    const videoRef = useRef(null);

    const [playing, setPlaying] = useState(true);
    const [liked, setLiked] = useState(
        reel.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
    );
    const [likes, setLikes] = useState(reel.likes?.length || 0);
    const [following, setFollowing] = useState(
        user?.following?.includes(reel.user?._id) || false
    );
    const [showComments, setShowComments] = useState(false);
    const [viewed, setViewed] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const isOwner = user?._id === reel.user?._id;

    useEffect(() => {

        const video = videoRef.current;
        if (!video) return;

        if (active) {

            video.play().catch(() => {});
            setPlaying(true);

            if (!viewed) {
                API.put(`/reels/${reel._id}/view`).catch(() => {});
                setViewed(true);
            }

        } else {

            video.pause();
            video.currentTime = 0;
            setPlaying(false);

        }

    }, [active]);

    const togglePlay = () => {

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => {});
            setPlaying(true);
        } else {
            video.pause();
            setPlaying(false);
        }

    };

    const likeReel = async (e) => {

        e.stopPropagation();

        try {

            const res = await API.put(`/reels/${reel._id}/like`);
            setLikes(res.data.likes);
            setLiked(res.data.liked);

        } catch (error) {

            console.log(error);

        }

    };

    const toggleFollow = async (e) => {

        e.stopPropagation();

        try {

            const res = await API.put(`/users/follow/${reel.user._id}`);
            setFollowing(res.data.following);

        } catch (error) {

            console.log(error);

        }

    };

    const shareReel = async (e) => {

        e.stopPropagation();

        const url = `${window.location.origin}/reels`;

        if (navigator.share) {

            try {
                await navigator.share({ title: "Check out this reel on DevConnect", url });
            } catch (error) {
                console.log(error);
            }

        } else {

            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard");

        }

    };

    const removeReel = async (e) => {

        e.stopPropagation();

        if (!window.confirm("Delete this reel?")) return;

        try {

            await API.delete(`/reels/${reel._id}`);
            setDeleted(true);
            onDeleted && onDeleted(reel._id);

        } catch (error) {

            console.log(error);

        }

    };

    if (deleted) return null;

    return (

        <div className="relative w-full h-full flex items-center justify-center bg-black snap-start">

            <video
                ref={videoRef}
                src={reel.video}
                loop
                muted={muted}
                playsInline
                onClick={togglePlay}
                className="h-full w-full max-w-480px object-contain bg-black cursor-pointer"
            />

            {!playing && (

                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center text-white text-5xl"
                >
                    <FiPlay />
                </button>

            )}

            {/* Mute toggle */}

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleMute();
                }}
                className="absolute top-4 right-4 text-white text-2xl bg-black/40 rounded-full p-2"
            >
                {muted ? <FiVolumeX /> : <FiVolume2 />}
            </button>

            {/* Bottom user info + caption */}

            <div className="absolute bottom-24 left-4 right-20 text-white">

                <div className="flex items-center gap-3 mb-3">

                    <Link to={`/profile/${reel.user?.username}`} className="flex items-center gap-2">

                        <img
                            src={reel.user?.profilePic || "https://via.placeholder.com/40"}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />

                        <span className="font-semibold">@{reel.user?.username}</span>

                    </Link>

                    {!isOwner && (

                        <button
                            onClick={toggleFollow}
                            className={`text-xs font-semibold px-3 py-1 rounded-full border border-white ${
                                following ? "bg-white/20" : "bg-white text-black"
                            }`}
                        >
                            {following ? "Following" : "Follow"}
                        </button>

                    )}

                </div>

                {reel.caption && (
                    <p className="text-sm leading-snug">{reel.caption}</p>
                )}

            </div>

            {/* Right action rail */}

            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-6 text-white">

                <button onClick={likeReel} className="flex flex-col items-center gap-1">
                    <span className="text-3xl">
                        {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    </span>
                    <span className="text-xs">{likes}</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(true);
                    }}
                    className="flex flex-col items-center gap-1"
                >
                    <span className="text-3xl"><FiMessageCircle /></span>
                    <span className="text-xs">Comment</span>
                </button>

                <button onClick={shareReel} className="flex flex-col items-center gap-1">
                    <span className="text-3xl"><FiSend /></span>
                    <span className="text-xs">Share</span>
                </button>

                {isOwner && (

                    <button onClick={removeReel} className="flex flex-col items-center gap-1">
                        <span className="text-3xl"><FiTrash2 /></span>
                        <span className="text-xs">Delete</span>
                    </button>

                )}

            </div>

            {showComments && (
                <CommentModal
                    targetType="reel"
                    targetId={reel._id}
                    onClose={() => setShowComments(false)}
                />
            )}

        </div>

    );

}
