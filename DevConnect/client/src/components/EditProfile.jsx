import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function EditProfile({ profile, onUpdate }) {

    const [form, setForm] = useState({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        skills: profile.skills ? profile.skills.join(", ") : "",
    });

    const [image, setImage] = useState(null);
    const { user, updateUser } = useAuth();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        await API.put("/users/update", {
            ...form,
            skills: form.skills
                .split(",")
                .map(skill => skill.trim())
        });

        // Update AuthContext immediately
        updateUser({
            ...user,
            fullName: form.fullName,
            bio: form.bio,
            location: form.location,
            website: form.website,
            skills: form.skills
                .split(",")
                .map(skill => skill.trim()),
        });

        if (image) {

            const formData = new FormData();

            formData.append("image", image);

            const imageRes = await API.put(
                "/users/profile-picture",
                formData
            );

            updateUser({
                ...user,
                fullName: form.fullName,
                bio: form.bio,
                location: form.location,
                website: form.website,
                skills: form.skills
                    .split(",")
                    .map(skill => skill.trim()),
                profilePic: imageRes.data.profilePic,
            });

        }

        onUpdate();

        alert("Profile Updated");

    } catch (error) {

        console.log(error);

    }
};

    return (

        <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded p-6 mt-6"
        >

            <h2 className="text-xl font-bold mb-4">
                Edit Profile
            </h2>

            <input
                className="border p-2 w-full mb-3"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full Name"
            />

            <textarea
                className="border p-2 w-full mb-3"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Bio"
            />

            <input
                className="border p-2 w-full mb-3"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location"
            />

            <input
                className="border p-2 w-full mb-3"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="Website"
            />

            <input
                className="border p-2 w-full mb-3"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node, MongoDB"
            />

            <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="mb-4"
            />

            <button
                className="bg-green-600 text-white px-5 py-2 rounded"
            >
                Save Changes
            </button>

        </form>

    );

}