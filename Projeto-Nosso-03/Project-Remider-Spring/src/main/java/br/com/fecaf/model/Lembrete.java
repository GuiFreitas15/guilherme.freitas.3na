package br.com.fecaf.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "tbl_lembrete")
public class Lembrete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private LocalDate data;
    private LocalTime hora;
    private String prioridade;

    @Enumerated(EnumType.STRING)
    private TipoConteudo tipoConteudo;

    private String descricao;

    @OneToMany(mappedBy = "lembrete", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<LembreteChecklist> checklist;


    @ElementCollection
    @CollectionTable(name = "lembrete_categorias", joinColumns = @JoinColumn(name = "lembrete_id"))
    @Column(name = "categoria")
    private List<String> categorias;

    private String cor;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User usuario;

    public enum TipoConteudo {
        DESCRICAO,
        CHECKLIST
    }

    @Column(nullable = false)
    private boolean concluido = false;

    // Getters e Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getPrioridade() { return prioridade; }
    public void setPrioridade(String prioridade) { this.prioridade = prioridade; }

    public TipoConteudo getTipoConteudo() { return tipoConteudo; }
    public void setTipoConteudo(TipoConteudo tipoConteudo) { this.tipoConteudo = tipoConteudo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCor() { return cor; }
    public void setCor(String cor) { this.cor = cor; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }

    public List<LembreteChecklist> getChecklist() {
        return checklist;
    }

    public void setChecklist(List<LembreteChecklist> checklist) {
        this.checklist = checklist;
    }

    public List<String> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<String> categorias) {
        this.categorias = categorias;
    }

    public boolean isConcluido() {
        return concluido;
    }

    public void setConcluido(boolean concluido) {
        this.concluido = concluido;
    }
}