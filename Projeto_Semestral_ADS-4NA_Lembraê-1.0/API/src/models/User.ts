import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { Lembrete } from "./Lembrete";
import { Categoria } from "./Categoria";

@Entity({ name: "tbl_user" })
export class User {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ unique: true, length: 200 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 50, default: "user" })
  role!: string;

  @CreateDateColumn({ name: "data_criacao" })
  data_criacao!: Date;

  @Column({ type: "date" })
  data_nascimento!: string;

  @Column({ name: "palavra_chave", length: 150, nullable: true })
  palavra_chave!: string;

  @OneToMany(() => Lembrete, (l) => l.user)
  lembretes!: Lembrete[];

  @OneToMany(() => Categoria, (categoria) => categoria.user)
  categorias!: Categoria[];
}