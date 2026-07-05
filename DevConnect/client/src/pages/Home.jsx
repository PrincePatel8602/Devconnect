import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { useAuth } from "../context/AuthContext";

export default function Home() {

    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [followedIds, setFollowedIds] = useState([]);

    useEffect(() => {
        fetchPosts();
        fetchSuggestions();
    }, []);

    const fetchPosts = async () => {

        try {

            const res = await API.get("/posts/feed");

            setPosts(res.data.posts);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const fetchSuggestions = async () => {

        try {

            const res = await API.get("/users/suggested");
            setSuggestions(res.data.users || []);

        } catch (error) {

            console.log(error);

        }

    };

    const followUser = async (id) => {

        try {

            await API.put(`/users/follow/${id}`);
            setFollowedIds((prev) => [...prev, id]);

        } catch (error) {

            console.log(error);

        }

    };

    const handlePostDeleted = (id) => {
        setPosts((prev) => prev.filter((p) => p._id !== id));
    };

    if (loading) {
        return <Loader />;
    }

    const sidebarLinks = [
        { to: "/", icon: "🏠", label: "Home" },
        { to: "/search", icon: "🔍", label: "Search" },
        { to: "/reels", icon: "🎬", label: "Reels" },
        { to: "/chat", icon: "💬", label: "Messages" },
        { to: "/notifications", icon: "🔔", label: "Notifications" },
        { to: `/profile/${user?.username}`, icon: "👤", label: "Profile" },
    ];

    return (
        <>
            <Navbar />

            <div className="bg-gray-100 min-h-screen">

                <div className="max-w-7xl mx-auto flex gap-8 pt-8">

                    {/* LEFT SIDEBAR */}
                    <div className="hidden lg:block w-64 sticky top-20 h-fit">

                        <div className="bg-white rounded-2xl shadow p-5">

                            <h2 className="text-2xl font-bold mb-6">
                                DevConnect
                            </h2>

                            <div className="space-y-4">

                                {sidebarLinks.map((link) => (

                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-xl w-full text-left transition"
                                    >
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </Link>

                                ))}

                            </div>

                        </div>

                    </div>

                    {/* FEED */}
                    <div className="flex-1 max-w-2xl">

                        <CreatePost
                            onPostCreated={fetchPosts}
                        />

                        <div className="mt-6 space-y-6">

                            {
                                posts.length === 0 ? (

                                    <div className="bg-white rounded-2xl shadow p-8 text-center">

                                        <h2 className="text-xl font-semibold text-gray-500">
                                            No posts yet.
                                        </h2>

                                    </div>

                                ) : (

                                    posts.map(post => (

                                        <PostCard
                                            key={post._id}
                                            post={post}
                                            onDeleted={handlePostDeleted}
                                        />

                                    ))

                                )
                            }

                        </div>

                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="hidden xl:block w-80 sticky top-20 h-fit">

                        <div className="bg-white rounded-2xl shadow p-5">

                            <h2 className="font-bold text-lg mb-4">
                                Suggestions
                            </h2>

                            {suggestions.length === 0 ? (

                                <p className="text-gray-500 text-sm">
                                    No suggestions right now.
                                </p>

                            ) : (

                                <div className="space-y-4">

                                    {suggestions.slice(0, 6).map((s) => (

                                        <div key={s._id} className="flex justify-between items-center">

                                            <Link
                                                to={`/profile/${s.username}`}
                                                className="flex gap-3 items-center"
                                            >

                                                <img
                                                    src={s.profilePic || "https://via.placeholder.com/48"}
                                                    alt=""
                                                    className="w-12 h-12 rounded-full object-cover bg-gray-300"
                                                />

                                                <div>

                                                    <p className="font-semibold">
                                                        {s.fullName}
                                                    </p>

                                                    <p className="text-gray-500 text-sm">
                                                        @{s.username}
                                                    </p>

                                                </div>

                                            </Link>

                                            <button
                                                onClick={() => followUser(s._id)}
                                                disabled={followedIds.includes(s._id)}
                                                className="text-blue-600 font-semibold disabled:text-gray-400"
                                            >
                                                {followedIds.includes(s._id) ? "Following" : "Follow"}
                                            </button>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </>
    );

}
