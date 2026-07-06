import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Search() {
    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState([]);
    const [reels, setReels] = useState([]);
    const [history, setHistory] = useState([]);

    // ---------------- FETCH REELS FIRST ----------------
    useEffect(() => {
        const fetchReels = async () => {
            try {
                const res = await API.get("/reels");
                setReels(res.data.reels);
            } catch (err) {
                console.log(err);
            }
        };

        fetchReels();
    }, []);

    // ---------------- SEARCH USERS ----------------
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!keyword.trim()) {
                setUsers([]);
                return;
            }

            try {
                const res = await API.get(
                    `/users/search?keyword=${keyword}`
                );

                setUsers(res.data.users);
            } catch (error) {
                console.log(error);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [keyword]);

    // ---------------- SEARCH HISTORY (localStorage) ----------------
    const saveToHistory = (item) => {
        const old = JSON.parse(localStorage.getItem("searchHistory") || "[]");

        const updated = [item, ...old.filter((i) => i !== item)].slice(0, 10);

        localStorage.setItem("searchHistory", JSON.stringify(updated));
        setHistory(updated);
    };

    useEffect(() => {
        const h = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        setHistory(h);
    }, []);

    return (
        <>
            <Navbar />

            <div className="max-w-2xl mx-auto mt-6 px-4">

                {/* SEARCH BAR */}
                <input
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        saveToHistory(e.target.value);
                    }}
                    placeholder="Search users, reels..."
                    className="border w-full p-3 rounded-xl"
                />

                {/* ================= REELS FIRST (INSTAGRAM STYLE) ================= */}
               {/* REELS SUGGESTION (INSTAGRAM STYLE) */}
{!keyword && (
    <div className="mt-6">
        <h2 className="font-semibold text-lg mb-3">Reels</h2>

        <div className="grid grid-cols-3 gap-2">
            {reels.map((reel) => (
                <Link
                    key={reel._id}
                    to="/reels"
                    state={{ reelId: reel._id }}
                    className="relative aspect-9/16 rounded-xl overflow-hidden bg-gray-200"
                >
                    <img
                        src={reel.thumbnail}
                        className="w-full h-full object-cover"
                    />

                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

                    {/* user info */}
                    <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
                        @{reel.user.username}
                    </div>
                </Link>
            ))}
        </div>
    </div>
)}
                {/* ================= SEARCH RESULTS ================= */}
                {keyword && (
                    <div className="mt-6">

                        {/* USERS */}
                        {users.map((user) => (
                            <Link
                                key={user._id}
                                to={`/profile/${user.username}`}
                                className="flex items-center gap-4 p-3 rounded hover:bg-gray-100"
                            >
                                <img
                                    src={
                                        user.profilePic ||
                                        "https://via.placeholder.com/50"
                                    }
                                    className="w-12 h-12 rounded-full object-cover"
                                />

                                <div>
                                    <h3 className="font-bold">
                                        {user.fullName}
                                    </h3>
                                    <p className="text-gray-500">
                                        @{user.username}
                                    </p>
                                </div>
                            </Link>
                        ))}

                        {users.length === 0 && (
                            <p className="text-gray-500 mt-4">
                                No users found
                            </p>
                        )}
                    </div>
                )}

                {/* ================= HISTORY ================= */}
                {!keyword && history.length > 0 && (
                    <div className="mt-8">
                        <h2 className="font-bold mb-3">Recent Searches</h2>

                        {history.map((item, i) => (
                            <div
                                key={i}
                                className="flex justify-between p-2 text-gray-600"
                            >
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </>
    );
}