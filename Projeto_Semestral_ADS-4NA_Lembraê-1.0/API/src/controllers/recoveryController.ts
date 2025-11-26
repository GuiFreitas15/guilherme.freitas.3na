import { Request, Response } from "express";
import { verifyRecovery, resetPassword } from "../services/recoveryService";

export class RecoveryController {

    static async verifyUser(req: Request, res: Response) {
        try {
            const { email, data_nascimento, palavra_chave } = req.body;

            const result = await verifyRecovery(
                email,
                data_nascimento,
                palavra_chave
            );

            return res.status(200).json(result);

        } catch (error: any) {
            return res
                .status(error.status || 500)
                .json({ message: error.message });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { email, newPassword } = req.body;

            const result = await resetPassword(email, newPassword);

            return res.status(200).json(result);

        } catch (error: any) {
            return res
                .status(error.status || 500)
                .json({ message: error.message });
        }
    }
}