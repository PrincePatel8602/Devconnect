import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

export default function Search() {

    const [keyword, setKeyword] = useState("");
    const [users, setUsers] = useState([]);

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

    return (

        <>
            <Navbar />

            <div className="max-w-2xl mx-auto mt-8">

                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search users..."
                    className="border w-full p-3 rounded"
                />

                <div className="mt-6">

                    {
                        users.length === 0 && keyword && (
                            <p className="text-gray-500">
                                No users found.
                            </p>
                        )
                    }

                    {
                        users.map((user) => (

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
                                    alt=""
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

                        ))
                    }

                </div>

            </div>

        </>

    );

}