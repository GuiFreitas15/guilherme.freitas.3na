import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Checklist } from "./Checklist";

@Entity({ name: "tbl_lembrete" })
export class Lembrete {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "titulo" })
  titulo!: string;

  @Column({ name: "descricao", type: "text", nullable: true })
  descricao?: string;

  @Column({ name: "data", type: "date", nullable: true })
  data?: string; // formato YYYY-MM-DD

  @Column({ name: "hora", type: "varchar", length: 5, nullable: true })
  hora?: string; // formato HH:MM

  @Column({ name: "prioridade", nullable: true })
  prioridade?: string;

  @Column({ name: "tipo_conteudo", nullable: true })
  tipo_conteudo?: string;

  get tipoConteudo() {
    return this.tipo_conteudo;
  }

  @Column({ name: "cor", nullable: true })
  cor?: string;

  @Column("simple-array", { name: "categorias", nullable: true })
  categorias?: string[]; // simples array compatível com front

  @Column({ name: "concluido", type: "tinyint", width: 1, default: 0 })
  concluido!: boolean;

  @ManyToOne(() => User, (user) => user.lembretes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Checklist, (check) => check.lembrete, {
    cascade: true,
    eager: true,
    orphanedRowAction: "delete",
  })
  checklist!: Checklist[];
}