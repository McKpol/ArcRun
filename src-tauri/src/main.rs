// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::{self, OpenOptions}, io::Write};
use walkdir::WalkDir;
use whoami;

fn cache_programs<>() -> Result<(), Box<dyn std::error::Error>> {

  // Data
  let user_name = whoami::username();
  let program_path = format!("C:/Users/{}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/", user_name);
  let path_file = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let chpro_file = format!("{}/chpro", path_file);
  
  // Creating dir and file
  fs::create_dir_all(path_file)?;
  let mut file = OpenOptions::new().read(true).write(true).create(true).append(true).open(chpro_file.clone())?;

  // Empting a file
  fs::write(chpro_file, "")?;

  // Search folder, subfolder and files. Then Write to the file chpro_file. 
  for programlist in WalkDir::new(program_path).into_iter().filter_map(|file| file.ok()) {
    
    if programlist.metadata().unwrap().is_file() {
    let programlist = format!("{}", programlist.path().display());
    writeln!(file, "{}", programlist)?;
    }
  }
  
  Ok(())
}

fn main() {

  match cache_programs(){
    Ok(_) => println!("Cashed program list"),
    Err(_) => println!("Cannot cached program list")
  }
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}