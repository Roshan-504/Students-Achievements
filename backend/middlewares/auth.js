import { verifyToken } from "../utils/jwtToken.js";

// Token verification middleware
export const authenticate = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
  req.user = decoded.user; // user info can be accessed through req
  next();
};

// authorize role before preceding request
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}