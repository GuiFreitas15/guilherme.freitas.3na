package br.com.fecaf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Entity
@Table(name = "lembrete_checklist")
public class LembreteChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private boolean checked;
    private String text;

    @ManyToOne
    @JoinColumn(name = "lembrete_id")
    @JsonIgnore
    private Lembrete lembrete;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public Lembrete getLembrete() {
        return lembrete;
    }

    public void setLembrete(Lembrete lembrete) {
        this.lembrete = lembrete;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}