import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ReelCard from "../components/ReelCard";
import CreateReel from "../components/CreateReel";
import { FiPlus } from "react-icons/fi";

export default function Reels() {

    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [muted, setMuted] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    const containerRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        fetchReels();
    }, []);
     useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reelId = params.get("reel");

    if (reelId && reels.length > 0) {
        const index = reels.findIndex((r) => r._id === reelId);
        if (index !== -1) {
            containerRef.current.scrollTop =
                index * containerRef.current.clientHeight;
            setActiveIndex(index);
        }
    }
}, [reels]);
    const fetchReels = async () => {

        try {

            const res = await API.get("/reels");
            setReels(res.data.reels || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const handleScroll = () => {

        const container = containerRef.current;
        if (!container) return;

        const index = Math.round(container.scrollTop / container.clientHeight);
        setActiveIndex(index);

    };

    const handleDeleted = (id) => {
        setReels((prev) => prev.filter((r) => r._id !== id));
    };

    return (

        <>
            <Navbar />

            <div className="bg-black min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-64px)] flex justify-center relative">

                {loading ? (

                    <Loader />

                ) : reels.length === 0 ? (

                    <div className="text-white text-center mt-20">
                        <p className="text-xl mb-4">No reels yet.</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="bg-blue-600 px-5 py-2 rounded-full"
                        >
                            Upload the first reel
                        </button>
                    </div>

                ) : (

                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] w-full max-w-[480px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                    >

                        {reels.map((reel, index) => (

                            <div key={reel._id} className="h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] w-full snap-start">

                                <ReelCard
                                    reel={reel}
                                    active={index === activeIndex}
                                    muted={muted}
                                    onToggleMute={() => setMuted((prev) => !prev)}
                                    onDeleted={handleDeleted}
                                />

                            </div>

                        ))}

                    </div>

                )}

                <button
                    onClick={() => setShowCreate(true)}
                    className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg text-2xl"
                    title="Upload a reel"
                >
                    <FiPlus />
                </button>

            </div>

            {showCreate && (
                <CreateReel
                    onClose={() => setShowCreate(false)}
                    onCreated={fetchReels}
                />
            )}

        </>

    );

}
