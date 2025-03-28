// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// /**
//  * @desc Get All Users (Admin Only)
//  * @route GET /api/users
//  * @access Private (Admin Only)
//  */
// const getAllUsers = async (req, res) => {
//   try {
//     // Ensure only admins can access this route
//     if (req.user.role !== "ADMIN") {
//       return res.status(403).json({ error: "Access denied. Admins only." });
//     }

//     // Fetch all users from the database
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//       },
//     });

//     return res.status(200).json({ users });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// module.exports = { getAllUsers };
