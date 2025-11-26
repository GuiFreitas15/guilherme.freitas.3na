import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export interface AuthRequest extends Request {
userId?: number;
}


export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ message: "Token ausente" });
const [, token] = authHeader.split(" ");
if (!token) return res.status(401).json({ message: "Token mal formatado" });
try {
const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
req.userId = Number(payload.sub);
next();
} catch (err) {
return res.status(401).json({ message: "Token inválido" });
}
};