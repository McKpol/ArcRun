// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::{self, OpenOptions, File}, io::{Write, Read}};
use walkdir::WalkDir;
use whoami;
use std::path::Path;


fn cache_programs<>() -> Result<(), Box<dyn std::error::Error>> {
  // Data
  let user_name = whoami::username();
  let program_path = format!("C:/Users/{}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/", user_name);
  let path_file = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let chpro_file = format!("{}/chpro", path_file);
  let chprocut_file = format!("{}/chprocut", path_file);
  
  // Creating dir and file
  fs::create_dir_all(path_file)?;
  let mut file = OpenOptions::new().read(true).write(true).create(true).append(true).open(chpro_file.clone())?;
  let mut filecut = OpenOptions::new().read(true).write(true).create(true).append(true).open(chprocut_file.clone())?;

  // Empting a file
  fs::write(chpro_file, "")?;
  fs::write(chprocut_file.clone(), "")?;

  // Search folder, subfolder and files. Then Write to the file chpro_file, chprocut_file. 
  for programlist in WalkDir::new(program_path).into_iter().filter_map(|file| file.ok()) {
    if programlist.metadata().unwrap().is_file() && programlist.path().extension().unwrap().to_str().unwrap() != "ini" {
      let programlist = format!("{}", programlist.path().display());
      writeln!(file, "{}", programlist)?;

      let path = Path::new(&programlist).file_stem().unwrap().to_str().unwrap();
      writeln!(filecut, "{}", path)?;
    }
  }
  
  Ok(())
}

fn main() {
  println!("Script started");
  
  match cache_programs(){
    Ok(_) => println!("Cashed program list"),
    Err(_) => println!("Cannot cached program list")
  }
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![search])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn search(search: String) -> String {
  let user_name = whoami::username();
  let path_file = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let chprocut_file = format!("{}/chprocut", path_file);
  
  let mut filecut_ = File::open(chprocut_file).unwrap();
  let mut buf = String::new();
  let mut nline = 0;
  filecut_.read_to_string(&mut buf).unwrap();
  
  for line in buf.lines(){
    if line.to_lowercase().contains(&search){
      println!("{} {}", search, nline);
      break;
    }
    nline += 1;
  }

  let mut prime = "";
  if nline != buf.lines().count() && nline != 0{
    prime = buf.lines().nth(nline).unwrap();
  }
  println!("{}", prime);

  prime.into()

}