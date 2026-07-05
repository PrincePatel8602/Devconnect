import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [errors, setErrors] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    const validate = () => {

        let newErrors = {};

        if (!form.fullName.trim()) {

            newErrors.fullName = "Full Name is required";

        }

        if (!form.username.trim()) {

            newErrors.username = "Username is required";

        }

        if (!form.email.trim()) {

            newErrors.email = "Email is required";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {

            newErrors.email = "Invalid email address";

        }

        if (!form.password) {

            newErrors.password = "Password is required";

        } else if (form.password.length < 6) {

            newErrors.password =
                "Password must be at least 6 characters";

        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setError("");

        try {

            const res = await API.post(
                "/auth/register",
                form
            );

            login(res.data);

            navigate("/");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-gray-100">

            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm"
            >

                <h2 className="text-3xl font-bold text-center mb-6">
                    Register
                </h2>

                {error && (

                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4">

                        {error}

                    </div>

                )}

                <input
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    className="border p-3 rounded-lg w-full mb-2"
                />

                {errors.fullName && (

                    <p className="text-red-500 text-sm mb-2">

                        {errors.fullName}

                    </p>

                )}

                <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="border p-3 rounded-lg w-full mb-2"
                />

                {errors.username && (

                    <p className="text-red-500 text-sm mb-2">

                        {errors.username}

                    </p>

                )}

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="border p-3 rounded-lg w-full mb-2"
                />

                {errors.email && (

                    <p className="text-red-500 text-sm mb-2">

                        {errors.email}

                    </p>

                )}

                <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="border p-3 rounded-lg w-full mb-2"
                />

                {errors.password && (

                    <p className="text-red-500 text-sm mb-2">

                        {errors.password}

                    </p>

                )}

                <button
                    type="button"
                    onClick={() =>
                        setShowPassword(!showPassword)
                    }
                    className="text-blue-600 text-sm mb-4"
                >
                    {showPassword
                        ? "Hide Password"
                        : "Show Password"}
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg w-full disabled:bg-gray-400"
                >
                    {loading
                        ? "Creating Account..."
                        : "Register"}
                </button>

                <p className="text-center mt-5 text-gray-600">

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Login
                    </Link>

                </p>

            </form>

        </div>

    );

}