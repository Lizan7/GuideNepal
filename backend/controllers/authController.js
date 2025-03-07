const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/emailService");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "Lizan@123";

// ✅ Register User
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name?.trim() || !email?.trim() || !password || !["USER", "GUIDE", "HOTEL"].includes(role)) {
        return res.status(400).json({ success: false, error: "Invalid input or role" });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if (existingUser) {
            return res.status(409).json({ success: false, error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: role,
            },
        });

        await sendMail(newUser.email, "Welcome to GuideNepal!", `Hello ${newUser.name}, welcome to GuideNepal!`);

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: "30d" });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: { user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, token },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, error: "Unable to complete registration" });
    }
};

// ✅ Login User (Detects Role Automatically)
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

        console.log("User Found:", user); // 🔹 Debugging log

        if (!user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isPasswordValid); // 🔹 Debugging log

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        console.log("User Role:", user.role); // 🔹 Debugging log

        if (!user.role) {
            return res.status(500).json({ success: false, error: "User role is missing" });
        }

        const token = jwt.sign({ id: user.id, email:user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: { user: { id: user.id, email: user.email, role: user.role }, token },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, error: "Unable to complete login" });
    }
};


// ✅ Refresh Token
const refreshToken = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "30d" });

        return res.status(200).json({ success: true, data: { token } });
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(500).json({ success: false, error: "Unable to refresh token" });
    }
};

module.exports = { register, login, refreshToken };
