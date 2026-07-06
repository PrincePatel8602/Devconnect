import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import EditProfile from "../components/EditProfile";
import PostModal from "../components/PostModal";
import FollowListModal from "../components/FollowListModal";
import ReelCard from "../components/ReelCard";
import { useAuth } from "../context/AuthContext";
import { FiGrid, FiFilm, FiBookmark, FiX } from "react-icons/fi";

export default function Profile() {

    const { username } = useParams();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reels, setReels] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [following, setFollowing] = useState(false);

    const [tab, setTab] = useState("posts");
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedReel, setSelectedReel] = useState(null);
    const [reelMuted, setReelMuted] = useState(true);
    const [listModal, setListModal] = useState(null); // "followers" | "following" | null

    const isOwnProfile = user?.username === username;

    useEffect(() => {
        setTab("posts");
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const fetchProfile = async () => {

        try {

            setLoading(true);

            const userRes = await API.get(`/users/profile/${username}`);
            setProfile(userRes.data.user);
            setFollowing(
                userRes.data.user.followers?.some((id) => id === user?._id) || false
            );

            const postRes = await API.get(`/posts/user/${username}`);
            setPosts(postRes.data.posts || []);

            const reelRes = await API.get(`/reels/user/${username}`);
            setReels(reelRes.data.reels || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const fetchBookmarks = async () => {

        try {

            const res = await API.get("/users/bookmarks");
            setBookmarks(res.data.bookmarks || []);

        } catch (error) {

            console.log(error);

        }

    };

    const openTab = (nextTab) => {

        setTab(nextTab);

        if (nextTab === "saved" && bookmarks.length === 0) {
            fetchBookmarks();
        }

    };

    const handleFollow = async () => {

        try {

            const res = await API.put(`/users/follow/${profile._id}`);
            setFollowing(res.data.following);

            setProfile((prev) => ({
                ...prev,
                followers: res.data.following
                    ? [...prev.followers, user._id]
                    : prev.followers.filter((id) => id !== user._id),
            }));

        } catch (error) {

            console.log(error);

        }

    };

    const handlePostDeleted = (id) => {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        setBookmarks((prev) => prev.filter((p) => p._id !== id));
    };

    const handleReelDeleted = (id) => {
        setReels((prev) => prev.filter((r) => r._id !== id));
        setSelectedReel(null);
    };

    if (loading) {
        return <Loader />;
    }

    if (!profile) {
        return (
            <>
                <Navbar />
                <div className="text-center mt-10 text-xl">
                    User not found.
                </div>
            </>
        );
    }

    const gridItemsForTab = () => {
        if (tab === "posts") return posts;
        if (tab === "reels") return reels;
        if (tab === "saved") return bookmarks;
        return [];
    };

    const items = gridItemsForTab();

    return (
        <>
            <Navbar />

            <div className="max-w-3xl mx-auto mt-8 px-4">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow p-6">

                    <div className="flex flex-col md:flex-row gap-8">

                        <img
                            src={
                                profile.profilePic ||
                                "https://via.placeholder.com/150"
                            }
                            alt="Profile"
                            className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border mx-auto md:mx-0"
                        />

                        <div className="flex-1">

                            <div className="flex flex-col md:flex-row md:items-center gap-4 text-center md:text-left items-center md:items-start">

                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {profile.fullName}
                                    </h1>
                                    <p className="text-gray-500">
                                        @{profile.username}
                                    </p>
                                </div>

                                {isOwnProfile ? (

                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-full font-semibold text-sm"
                                    >
                                        {editing ? "Cancel" : "Edit Profile"}
                                    </button>

                                ) : (

                                    <button
                                        onClick={handleFollow}
                                        className={`px-5 py-2 rounded-full font-semibold text-sm ${
                                            following
                                                ? "bg-gray-200 hover:bg-gray-300"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                        }`}
                                    >
                                        {following ? "Following" : "Follow"}
                                    </button>

                                )}

                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 sm:gap-8 mt-5 justify-center md:justify-start text-sm sm:text-base">

                                <span>
                                    <b>{posts.length}</b> Posts
                                </span>

                                <button onClick={() => setListModal("followers")}>
                                    <b>{profile.followers.length}</b> Followers
                                </button>

                                <button onClick={() => setListModal("following")}>
                                    <b>{profile.following.length}</b> Following
                                </button>

                            </div>

                            <p className="mt-4">
                                {profile.bio || "No bio added"}
                            </p>

                            <p className="mt-2 text-gray-600">
                                📍 {profile.location || "Location not added"}
                            </p>

                            {profile.website && (
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline block mt-2"
                                >
                                    {profile.website}
                                </a>
                            )}

                            {profile.skills && profile.skills.length > 0 && (

                                <div className="mt-4">

                                    <h3 className="font-semibold mb-2">Skills</h3>

                                    <div className="flex flex-wrap gap-2">

                                        {profile.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                {/* Edit Profile Form */}
                {editing && (
                    <EditProfile
                        profile={profile}
                        onUpdate={() => {
                            fetchProfile();
                            setEditing(false);
                        }}
                    />
                )}

                {/* Tabs */}
                <div className="flex justify-center gap-10 border-b mt-8">

                    <button
                        onClick={() => openTab("posts")}
                        className={`flex items-center gap-2 py-3 text-sm font-semibold uppercase tracking-wide border-t-2 ${
                            tab === "posts"
                                ? "border-black text-black"
                                : "border-transparent text-gray-400"
                        }`}
                    >
                        <FiGrid /> Posts
                    </button>

                    <button
                        onClick={() => openTab("reels")}
                        className={`flex items-center gap-2 py-3 text-sm font-semibold uppercase tracking-wide border-t-2 ${
                            tab === "reels"
                                ? "border-black text-black"
                                : "border-transparent text-gray-400"
                        }`}
                    >
                        <FiFilm /> Reels
                    </button>

                    {isOwnProfile && (

                        <button
                            onClick={() => openTab("saved")}
                            className={`flex items-center gap-2 py-3 text-sm font-semibold uppercase tracking-wide border-t-2 ${
                                tab === "saved"
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-400"
                            }`}
                        >
                            <FiBookmark /> Saved
                        </button>

                    )}

                </div>

                {/* Grid */}
                <div className="py-6">

                    {items.length === 0 ? (

                        <div className="text-center text-gray-500 py-10">
                            Nothing here yet.
                        </div>

                    ) : (

                        <div className="grid grid-cols-3 gap-2">

                            {items.map((item) => (

                                tab === "reels" ? (

                                    <button
                                        key={item._id}
                                        onClick={() => setSelectedReel(item)}
                                        className="relative aspect-square bg-black rounded overflow-hidden group"
                                    >
                                        <video
                                            src={item.video}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                        <span className="absolute bottom-1 left-1 text-white text-xs flex items-center gap-1">
                                            <FiFilm />
                                        </span>
                                    </button>

                                ) : (

                                    <button
                                        key={item._id}
                                        onClick={() => setSelectedPost(item)}
                                        className="relative aspect-square bg-gray-200 rounded overflow-hidden"
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-600 bg-gray-100">
                                                {item.text?.slice(0, 60) || "Post"}
                                            </div>
                                        )}
                                    </button>

                                )

                            ))}

                        </div>

                    )}

                </div>

            </div>

            {selectedPost && (
                <PostModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onDeleted={handlePostDeleted}
                />
            )}

            {selectedReel && (

                <div
                    className="fixed inset-0 bg-black/80 z-[95] flex items-center justify-center"
                    onClick={() => setSelectedReel(null)}
                >

                    <div
                        className="relative w-full max-w-[420px] h-[80dvh]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            onClick={() => setSelectedReel(null)}
                            className="absolute -top-10 right-0 text-white text-2xl"
                        >
                            <FiX />
                        </button>

                        <ReelCard
                            reel={selectedReel}
                            active={true}
                            muted={reelMuted}
                            onToggleMute={() => setReelMuted((prev) => !prev)}
                            onDeleted={handleReelDeleted}
                        />

                    </div>

                </div>

            )}

            {listModal && (
                <FollowListModal
                    type={listModal}
                    userId={profile._id}
                    onClose={() => setListModal(null)}
                />
            )}

        </>
    );

}
