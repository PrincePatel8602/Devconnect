import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Register
export const registerUser = async (req, res) => {

    try {

        const {
            fullName,
            username,
            email,
            password,
        } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        const { password: pass, ...userData } = user._doc;

res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: userData,
});

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// Login

export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }

       const { password: pass, ...userData } = user._doc;

res.json({
    success: true,
    token: generateToken(user._id),
    user: userData,
});
    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};