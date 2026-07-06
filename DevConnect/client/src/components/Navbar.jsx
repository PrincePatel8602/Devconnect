        
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import {
    FaHome,
    FaSearch ,
    FaFacebookMessenger,
    FaBell,
    FaSignOutAlt
} from "react-icons/fa";
import { PiFilmReel } from "react-icons/pi";

export default function Navbar() {

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();

    const [open, setOpen] = useState(false);

    const handleLogout = () => {

        logout();

        navigate("/");

    };

    const active = (path) =>
        location.pathname === path
            ? "text-blue-600"
            : "text-gray-600 hover:text-blue-600";

    return (

        <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">

            <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-6 h-14 sm:h-16">

                {/* Logo */}

                <Link
                    to="/Home"
                    className="text-lg sm:text-3xl font-extrabold text-blue-600 tracking-wide shrink-0"
                >
                    DevConnect
                </Link>

                {/* Center Icons */}

                <div className="flex items-center gap-2 sm:gap-6 md:gap-10 text-lg sm:text-2xl">

                    <Link
                        to="/Home"
                        className={active("/Home")}
                    >
                        <FaHome />
                    </Link>
                    <Link
    to="/search"
    className={active("/search")}
>
    <FaSearch />
</Link>
                    <Link
                        to="/reels"
                        className={active("/reels")}
                    >
                        <PiFilmReel />
                    </Link>

                    <Link
                        to="/chat"
                        className={active("/chat")}
                    >
                        <FaFacebookMessenger />
                    </Link>

                    <Link
                        to="/notifications"
                        className={active("/notifications")}
                    >
                        <div className="relative">

                            <FaBell />

                            {/* Notification Badge */}

                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                                0
                            </span>

                        </div>

                    </Link>

                </div>

                {/* Right Profile */}

                <div className="relative shrink-0">

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3"
                    >

                        <img
                            src={
                                user?.profilePic ||
                                "https://via.placeholder.com/40"
                            }
                            alt=""
                            className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-blue-500"
                        />

                        <div className="hidden md:block text-left">

                            <p className="font-semibold">
                                {user?.fullName}
                            </p>

                            <p className="text-xs text-gray-500">
                                @{user?.username}
                            </p>

                        </div>

                    </button>

                    {open && (

                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border overflow-hidden">

                            <Link
                                to={`/profile/${user?.username}`}
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3 hover:bg-gray-100"
                            >
                                👤 My Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </nav>

    );

}