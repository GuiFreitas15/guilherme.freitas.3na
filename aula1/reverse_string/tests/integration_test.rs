// Importa a biblioteca que contém a função 'reverse'
use reverse_string::reverse;

#[test]
fn test_normal_string() {
    // Testa uma string comum
    let input = "Rust";
    let expected = "tsuR";
    assert_eq!(reverse(input), expected);
}

#[test]
fn test_empty_string() {
    // Testa uma string vazia
    let input = "";
    let expected = "";
    assert_eq!(reverse(input), expected);
}

#[test]
fn test_single_char_string() {
    // Testa uma string com dois caracteres
    let input = "AB";
    let expected = "BA";
    assert_eq!(reverse(input), expected);
}
