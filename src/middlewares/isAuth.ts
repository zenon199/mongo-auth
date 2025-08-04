import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) {
        res.status(401).json({
            message: "Unauthorized",
            success: false
        })
        return
    }
    try {
         
        function isJwtPayload(payload: unknown): payload is { id: string } {
            return (
                typeof payload === 'object' &&
                payload !== null &&
                'id' in payload
            );
        }
         const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string)

    
         if (!isJwtPayload(decoded)) {
            res.status(401).json({ message: "Invalid token", success: false });
            return
        }

        req.user = decoded;

         next();



     } catch (error) {
        console.log('Invalid or expired access token', error)
        res.status(500).json({
            message: 'Internal server error',
            success: false
        })
     }


}