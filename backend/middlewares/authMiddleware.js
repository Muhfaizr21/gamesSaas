const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        } catch (err) {
            decoded = jwt.verify(token, process.env.SUPERADMIN_JWT_SECRET || 'superadmin-jwt-very-secret-2026');
        }

        req.user = decoded; // { id, role, subdomain }

        // Security: Ensure token's subdomain matches current tenant
        // Exception for SuperAdmins who can access all tenants
        const currentSubdomain = req.tenant?.subdomain || 'budi';
        if (!decoded.isSuperAdmin && decoded.subdomain !== currentSubdomain) {
            return res.status(401).json({ message: 'Token is for a different store. Please login again.' });
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
