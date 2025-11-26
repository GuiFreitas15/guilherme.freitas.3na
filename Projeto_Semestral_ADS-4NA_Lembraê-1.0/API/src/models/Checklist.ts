import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Lembrete } from "./Lembrete";

@Entity({ name: "lembrete_checklist" })
export class Checklist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "text", type: "text" })
  text!: string;

  @Column({ name: "checked", type: "tinyint", width: 1, default: 0 })
  checked!: boolean;

  @ManyToOne(() => Lembrete, (lembrete) => lembrete.checklist, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "lembrete_id" })
  lembrete!: Lembrete;
}