import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import lembreteRoutes from "./routes/lembreteRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import categoriaRoutes from "./routes/categoriaRoutes";
import chatbotRoutes from "./routes/chatbot";
import recoveryRoutes from "./routes/recoveryRoutes";


const app = express();
const PORT = 4000;

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// 🔵 ROTAS CORRETAS
app.use("/auth", authRoutes);  
app.use("/user", userRoutes);     
app.use("/lembretes", lembreteRoutes);
app.use("/checklist", checklistRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/", chatbotRoutes);
app.use("/recovery", recoveryRoutes);


AppDataSource.initialize()
    .then(() => {
        console.log("✅ Banco conectado");
        app.listen(PORT, () => console.log(`✅ Server rodando na porta ${PORT}`));
    })
    .catch((err) => console.error("❌ Erro ao conectar banco:", err));
