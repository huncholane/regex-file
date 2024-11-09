pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
use regex::Regex;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn find_matches(pattern: &str, text: &str) -> Vec<String> {
    let re = Regex::new(pattern).expect("Invalid regex pattern");
    re.find_iter(text)
        .map(|mat| mat.as_str().to_string())
        .collect()
}
