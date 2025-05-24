package br.com.fecaf.controller;


import br.com.fecaf.model.User;
import br.com.fecaf.repository.LembreteRepository;
import br.com.fecaf.repository.UserRepository;
import br.com.fecaf.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5500", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    // Endpoint para login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User validUser = userService.validateUser(user.getEmail(), user.getPassword());
        if (validUser != null) {
            return ResponseEntity.ok(validUser); // retorna o JSON do usuário
        }
        return ResponseEntity.status(401).body("Erro! Usuário ou senha inválidos");
    }


    @Autowired
    private UserRepository userRepository;

    // Endpoint para registro de usuário
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            if (userRepository.findByEmail(user.getEmail()) == null) {
                userService.registerUser(user.getNome(), user.getEmail(), user.getPassword());
                return ResponseEntity.ok("Usuário registrado com sucesso");
            } else {
                return ResponseEntity.status(400).body("E-mail já cadastrado");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao registrar usuário");
        }
    }
}