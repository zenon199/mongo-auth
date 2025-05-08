import jwt from 'jsonwebtoken'

export const isLogged = async (req ,res ,next) => {
    //token from cookie
    //validate token
    //decode the jwt

    try {
        const token = req.cookies?.token

        if(!token) {
            return res.status(400).json({
                message: "Auth failed",
                success: false
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:" , decoded)
        req.user = decoded
        next();
    } catch (error) {
        console.log('Auth middleware failure')
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
        

    }
    next();
}