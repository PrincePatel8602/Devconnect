import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { FiX } from "react-icons/fi";

// type: "followers" | "following"
export default function FollowListModal({ type, userId, onClose }) {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, type]);

    const fetchList = async () => {

        try {

            const res = await API.get(`/users/${type}/${userId}`);
            setUsers(res.data[type] || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4"
            onClick={onClose}
        >

            <div
                className="bg-white rounded-2xl w-full max-w-sm max-h-[75vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="font-semibold text-lg capitalize">{type}</h3>
                    <button onClick={onClose} className="text-xl text-gray-500 hover:text-gray-800">
                        <FiX />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3">

                    {loading ? (

                        <p className="text-center text-gray-400 text-sm py-6">Loading...</p>

                    ) : users.length === 0 ? (

                        <p className="text-center text-gray-400 text-sm py-6">
                            No {type} yet.
                        </p>

                    ) : (

                        users.map((u) => (

                            <Link
                                key={u._id}
                                to={`/profile/${u.username}`}
                                onClick={onClose}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100"
                            >

                                <img
                                    src={u.profilePic || "/Ultimate.jpeg"}
                                    alt="Profile"
                                    className="w-11 h-11 rounded-full object-cover"
                                />

                                <div>
                                    <p className="font-semibold">{u.fullName}</p>
                                    <p className="text-gray-500 text-sm">@{u.username}</p>
                                </div>

                            </Link>

                        ))

                    )}

                </div>

            </div>

        </div>

    );

}
