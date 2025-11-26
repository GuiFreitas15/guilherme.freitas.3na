import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity({ name: "lembrete_categorias" })
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nome!: string;

  @Column({ length: 255, nullable: true })
  descricao?: string;

  @ManyToOne(() => User, user => user.categorias, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
