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
  let chdircut_file = format!("{}/chdircut", path_file);
  let chdir_file = format!("{}/chdir", path_file);
  
  // Creating dir and file
  fs::create_dir_all(path_file)?;
  let mut file = OpenOptions::new().read(true).write(true).create(true).append(true).open(chpro_file.clone())?;
  let mut filecut = OpenOptions::new().read(true).write(true).create(true).append(true).open(chprocut_file.clone())?;
  let mut filedircut = OpenOptions::new().read(true).write(true).create(true).append(true).open(chdircut_file.clone())?;
  let mut filedir = OpenOptions::new().read(true).write(true).create(true).append(true).open(chdir_file.clone())?;

  // Empting a file
  fs::write(chpro_file, "")?;
  fs::write(chprocut_file.clone(), "")?;
  fs::write(chdircut_file.clone(), "")?;
  fs::write(chdir_file.clone(), "")?;

  // Search folder, subfolder and files. Then Write to the file chpro_file, chprocut_file. 
  for programlist in WalkDir::new(program_path).into_iter().filter_map(|file| file.ok()) {
    if programlist.metadata().unwrap().is_file() && programlist.path().extension().unwrap().to_str().unwrap() != "ini" {
      let programlist = format!("{}", programlist.path().display());
      writeln!(file, "{}", programlist)?;

      let path = Path::new(&programlist).file_stem().unwrap().to_str().unwrap();
      writeln!(filecut, "{}", path)?;
    }
    if programlist.metadata().unwrap().is_dir(){
      let programlist = format!("{}", programlist.path().display());
      writeln!(filedir, "{}", programlist)?;

      let dir = Path::new(&programlist).file_stem().unwrap().to_str().unwrap();
      writeln!(filedircut, "{}", dir)?;

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
fn search(search: String) -> Vec<String> {
  // Data
  let user_name = whoami::username();
  let path_file = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let chprocut_file = format!("{}/chprocut", path_file);
  let chdircut_file = format!("{}/chdircut", path_file);

  let mut filecut_ = File::open(chprocut_file).unwrap();
  let mut dircut_ = File::open(chdircut_file).unwrap();
  let mut buf = String::new();
  let mut bufdir = String::new();
  let mut nline = 0;
  let mut nb_result = 0;
  let mut lista: Vec<String> = Vec::new();
  filecut_.read_to_string(&mut buf).unwrap();
  
  // Search in file chprocut_file
  for line in buf.lines(){
    if line.to_lowercase().contains(&search){
      nb_result += 1;
      // println!("{} {} {}", search, nline, nb_result);
      lista.push(nline.to_string());
      lista.push(buf.lines().nth(nline).unwrap().to_string());
      lista.push("0".to_string());
      if nb_result == 5{
        break;
      }
    }
    nline += 1;
  }

  dircut_.read_to_string(&mut bufdir).unwrap();
  nb_result = 0;
  nline = 0;

  for line in bufdir.lines(){
    if line.to_lowercase().contains(&search){
      nb_result += 1;
      println!("{}", bufdir.lines().nth(nline).unwrap().to_string());
      lista.push(nline.to_string());
      lista.push(bufdir.lines().nth(nline).unwrap().to_string());
      lista.push("1".to_string());
      if nb_result == 3{
        break;
      }
    }
    nline += 1;
  }

//   println!();
//   println!();
//   for element in &lista {
//     println!("{}", element);
// }

  // Sending to FrontEnd
  // let mut prime = "";
  // if nline != buf.lines().count() && nline != 0{
  //   prime = buf.lines().nth(nline).unwrap();
  // }
  // println!("{}", prime);

  lista.into()

}