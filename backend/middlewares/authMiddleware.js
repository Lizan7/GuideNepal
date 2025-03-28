const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authenticateUser = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Check for Authorization header
      const authorizationHeaderValue = req.headers["authorization"];
      if (!authorizationHeaderValue || !authorizationHeaderValue.startsWith("Bearer ")) {
        console.error("❌ Access Denied: Missing or invalid Authorization header");
        return res.status(401).json({ error: "Access Denied: No token provided" });
      }

      // Extract token from "Bearer <token>"
      const token = authorizationHeaderValue.split("Bearer ")[1];
      if (!token) {
        console.error("❌ Access Denied: Token missing from Authorization header");
        return res.status(401).json({ error: "Access Denied: Token missing" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user details from the database
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        console.error(`❌ Invalid Token: User with ID ${decoded.id} not found`);
        return res.status(401).json({ error: "Invalid Token: User not found" });
      }

      // Attach user details to request object
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // Include role for authorization checks
      };

      console.log(`✅ User Authenticated: ${user.email}, Role: ${user.role}`);

      // Check if user has required role
      if (roles.length && !roles.includes(req.user.role)) {
        console.error(`❌ Forbidden: User with role '${req.user.role}' not authorized`);
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      next(); // Move to next middleware or route handler
    } catch (error) {
      console.error("❌ Token validation error:", error);
      return res.status(401).json({ error: "Invalid Token" });
    }
  };
};

module.exports = { authenticateUser };
