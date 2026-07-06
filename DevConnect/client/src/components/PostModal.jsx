import { FiX } from "react-icons/fi";
import PostCard from "./PostCard";

export default function PostModal({ post, onClose, onDeleted }) {

    return (

        <div
            className="fixed inset-0 bg-black/70 z-90 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >

            <div
                className="w-full max-w-lg my-8"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex justify-end mb-2">
                    <button
                        onClick={onClose}
                        className="text-white text-2xl bg-black/40 rounded-full p-2"
                    >
                        <FiX />
                    </button>
                </div>

                <PostCard
                    post={post}
                    onDeleted={(id) => {
                        onDeleted && onDeleted(id);
                        onClose();
                    }}
                />

            </div>

        </div>

    );

}
