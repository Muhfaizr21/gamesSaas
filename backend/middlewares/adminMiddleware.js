const jwt = require('jsonwebtoken');

const adminMiddleware = async (req, res, next) => {
    const { User } = req.db.models;
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        } catch (err) {
            decoded = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET || 'superadmin-jwt-very-secret-2026');
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        // Security: Ensure token's subdomain matches current tenant
        const currentSubdomain = req.tenant?.subdomain || 'budi';
        if (!decoded.isSuperAdmin && decoded.subdomain !== currentSubdomain) {
            return res.status(401).json({ message: 'Token is for a different store. Please login again.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You do not have admin privileges.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token verification failed, authorization denied.' });
    }
};

module.exports = adminMiddleware;
