// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::{fs::{self, File, OpenOptions}, io::{Read, Write}};
use walkdir::WalkDir;
use whoami;
use std::path::Path;
use std::path::PathBuf;
use tauri::{CustomMenuItem, SystemTrayMenu, SystemTray};
use tauri::SystemTrayEvent;
use tauri_plugin_autostart::MacosLauncher;
use std::env;
use auto_launch::AutoLaunchBuilder;
use tauri::AppHandle;
use native_dialog::{MessageDialog, MessageType};
use tauri::SystemTrayMenuItem;
use pelite::{FileMap, PeFile};

static CONFIG_FILL: [&str; 6] = ["4", "10", "10", "Search with ArcRun", "/image.svg", "deafult"];

fn cache_programs<>() -> Result<(), Box<dyn std::error::Error>> {
  let user_name = whoami::username();
  let mut programs_path = format!("C:/Users/{}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/", user_name);
  let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let path_path = format!("{}/listpath", path_files);
  let path_cache = format!("{}/listcache", path_files);
  let path_icon = format!("{}/icons", path_files);
  
  // Creating dir and file
  fs::create_dir_all(path_icon)?;
  let mut file = OpenOptions::new().read(true).write(true).create(true).append(true).open(path_path.clone())?;
  OpenOptions::new().read(true).write(true).create(true).append(true).open(path_cache.clone())?;
  // Empting a file
  fs::write(path_path.clone(), "")?;
  
  // Search folder
  for programlist in WalkDir::new(programs_path).into_iter().filter_map(|file| file.ok()) {
    if programlist.metadata().unwrap().is_file() && programlist.path().extension() != None && programlist.path().extension().unwrap().to_str().unwrap() != "ini" {
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
    }
    if programlist.metadata().unwrap().is_dir(){
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
    }
  }

  programs_path = "C:/ProgramData/Microsoft/Windows/Start Menu/Programs".to_string();
  for programlist in WalkDir::new(programs_path).into_iter().filter_map(|file| file.ok()) {
    if programlist.metadata().unwrap().is_file() && programlist.path().extension() != None && programlist.path().extension().unwrap().to_str().unwrap() != "ini" {
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
    }
    if programlist.metadata().unwrap().is_dir(){
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
    }
  }
  Ok(())
}

fn settings() -> Result<(), Box<dyn std::error::Error>>{
    // CONFIG FILE

    let mut config_fill = CONFIG_FILL; // Deafult Settings

    let user_name = whoami::username();
    let config_file = format!("C:/Users/{}/AppData/Roaming/arcrun/config", user_name);
    let mut config_open = OpenOptions::new().read(true).write(true).create(true).append(true).open(config_file.clone())?;
    let mut config_string = String::new();
    config_open.read_to_string(&mut config_string)?;
  
    let mut i = 0;
    for lines in config_string.lines(){
        config_fill[i] = lines;
        i += 1;
    }
  
    fs::write(config_file.clone(), "")?;
  
    for lines in config_fill{
      writeln!(config_open, "{}", lines)?;
    }
  Ok(())
}

fn reset_settings() -> Result<(), Box<dyn std::error::Error>>{
  // CONFIG FILE

  let config_fill = CONFIG_FILL; // Deafult Settings

  let user_name = whoami::username();
  let config_file = format!("C:/Users/{}/AppData/Roaming/arcrun/config", user_name);
  let mut config_open = OpenOptions::new().read(true).write(true).create(true).append(true).open(config_file.clone())?;

  fs::write(config_file.clone(), "")?;

  for lines in config_fill{
    writeln!(config_open, "{}", lines)?;
  }
Ok(())
}

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  println!("Script started");

  match cache_programs(){
    Ok(_) => println!("Cashed program list"),
    Err(e) => println!("Cannot cached program list: {}", e)
  }

  match settings(){
    Ok(_) => println!("Settings file set"),
    Err(e) => println!("Cannot set setting file: {}", e)
  }

  let settings = CustomMenuItem::new("settings".to_string(), "Settings");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");

  let tray_menu = SystemTrayMenu::new()
  .add_item(settings)
  .add_native_item(SystemTrayMenuItem::Separator)
  .add_item(quit);

  let tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
  .setup(move | _app |{
    Ok(())
  })
  .system_tray(tray)
  .on_system_tray_event(move |app, event| match event {
    SystemTrayEvent::LeftClick {
      position: _,
      size: _,
      ..
    } => {
      let main_window = app.get_window("main").unwrap();
      let _ = main_window.emit("show", "nothing");
    }
    SystemTrayEvent::MenuItemClick { id, .. } => {
      match id.as_str() {
          "quit" => {
          AppHandle::exit(app, 0);
        }
          "settings" => {
            let _ = tauri::window::Window::show(&app.get_window("settings").unwrap());
        }
        _ => {}
      }
    }
    _ => {}
  })
  .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
  .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
      println!("{}, {argv:?}, {cwd}", app.package_info().name);
      app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();
  }))
    .invoke_handler(tauri::generate_handler![search, open, cant_set_hotkey, set_auto_start, check_auto_start, read_settings, write_settings, cache_programs_tauri, settings_tauri, reset_settings_tauri, get_username])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
  Ok(())
}

#[tauri::command]
fn cache_programs_tauri(){
  match cache_programs(){
    Ok(_) => println!("Cashed program list"),
    Err(e) => println!("Cannot cached program list: {}", e)
  }
}

#[tauri::command]
fn settings_tauri(){
  match settings(){
    Ok(_) => println!("Settings file set"),
    Err(e) => println!("Cannot set setting file: {}", e)
  }
}

#[tauri::command]
fn reset_settings_tauri(){
  match reset_settings(){
    Ok(_) => println!("Settings file reset"),
    Err(e) => println!("Cannot reset settings file: {}", e)
  }
}

#[tauri::command]
fn cant_set_hotkey() -> bool{
  let yes = MessageDialog::new()
    .set_type(MessageType::Warning)
    .set_title("ArcRun - HotKey error")
    .set_text("Some app is already using Alt + Space hotkey! Do you want to try again?")
    .show_confirm()
    .unwrap();

  yes
  }

  #[tauri::command]
  fn open(number: String, whataction: String){
    // Data
    let user_name = whoami::username();
    let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
    let path_path = format!("{}/listpath", path_files);
    let mut file_path = File::open(path_path).unwrap();

    let mut buf = String::new();
    file_path.read_to_string(&mut buf).unwrap();

      if whataction == "1"{
        match open_with::show_in_folder(PathBuf::from(buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string())){
          Ok(()) => print!(""),
          Err(e) => println!("{}", e),
        }
      } else if whataction == "2"{
        match open_with::show_properties(PathBuf::from(buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string())){
          Ok(()) => print!(""),
          Err(e) => println!("{}", e),
        }
      } else if whataction == "0"{
        match open_with::open(PathBuf::from(buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string())){
          Ok(()) => print!(""),
          Err(e) => println!("{}", e),
        }
      }
  }

#[tauri::command]
fn read_settings(line: usize) -> String{

  fn yes(line: usize) -> Result<String, Box<dyn std::error::Error>> {
    let user_name = whoami::username();
    let config_file = format!("C:/Users/{}/AppData/Roaming/arcrun/config", user_name);
    let mut config_open = OpenOptions::new().read(true).write(true).create(true).append(true).open(config_file.clone())?;
    let mut config_string = String::new();
    config_open.read_to_string(&mut config_string)?;
  
    let smth = config_string.lines().nth(line).map(str::to_string).as_deref().unwrap_or("deafult string").to_string();
    return Ok(smth)
  }
  
  match yes(line) {
    Ok(smth) => smth,
    Err(_e) => "Error".to_string(),
  }
}

#[tauri::command]
fn write_settings(line: usize, content: String){
  fn yes(line: usize, content: String) -> Result<(), Box<dyn std::error::Error>>{
    let mut config_fill = CONFIG_FILL; // Deafult Settings
    
    let user_name = whoami::username();
    let config_file = format!("C:/Users/{}/AppData/Roaming/arcrun/config", user_name);
    let mut config_open = OpenOptions::new().read(true).write(true).create(true).append(true).open(config_file.clone())?;
    let mut config_string = String::new();
    config_open.read_to_string(&mut config_string)?;
  
    let mut i = 0;
    for lines in config_string.lines(){
      config_fill[i] = lines;
      i += 1;
    }

    if config_fill[line] == content{
      println!("Skipped");
      return Ok(());
    }

    config_fill[line] = &content;

    fs::write(config_file.clone(), "")?;
  
    for lines in config_fill{
      writeln!(config_open, "{}", lines)?;
    }
    Ok(())
  }
  
  match yes(line, content) {
    Ok(_) => println!("Success writing settings"),
    Err(e) => println!("{}", e)
  }
}

fn lnk(line: &str, name: &str) -> Option<String> {
  println!("{}", line);
  match lnk::ShellLink::open(line) {
      Ok(lnk) => {
          if let Some(iconlocation) = lnk::ShellLink::icon_location(&lnk) {
              let user_name =  whoami::username();
              let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/icons", user_name);
              let mut result = "".to_string();
              let mut other = iconlocation.to_string();
              if iconlocation.contains("%"){
              let mut count = 0;
              other = "".to_string();
              for letter in iconlocation.chars(){
                if letter == '%'{
                  count += 1;
                  if count == 2 {let key = std::env::var(result.clone());other.push_str(&key.unwrap())}
                } else {
                  if count == 1{
                  result.push(letter);
                } else {
                  other.push(letter);
                }
                }
              }
            }
            
            let map = FileMap::open(&other).unwrap();
            match PeFile::from_bytes(&map){
              Ok(_) => print!(""),
              Err(_) => {
                match std::fs::copy(other.to_string(), format!("{}/{}.ico", path_files, name)){
                Ok(_) => print!(""),
                Err(e) => println!("{}", e)
              }
            },
            }

            return Some(other);
          } else if let Some(link_info) = lnk.link_info() {
            return Some(link_info.local_base_path().as_ref()?.to_string());
          }
          None
      }
      Err(_) => {
          println!("Wrong location");
          None
      }
  }
}

fn url(line: &str, name: &str) {
  let user_name =  whoami::username();
  let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/icons", user_name);
  let mut file = fs::File::open(line).unwrap();
  let mut contents = String::new();
  let mut output = "".to_string();
  let mut number = 0;
  file.read_to_string(&mut contents).unwrap();

  for line in contents.lines() {
    if line.contains("IconFile="){
      for char in line.chars(){
        if number == 1{
          output.push(char);
        }
        if char == '='{
          number += 1;
        }
      }
  }
  }
  match std::fs::copy(output, format!("{}/{}.ico", path_files, name)){
    Ok(_) => print!(""),
    Err(e) => println!("{}", e)
  }
}

#[tauri::command]
fn search(search: String) -> Vec<String> {
  let user_name =  whoami::username();
  let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let path_path = format!("{}/listpath", path_files);

  let file_path = File::open(path_path);
  // Data
  let mut buf = String::new();
  let mut nline = 0;
  let mut nb_result = 0;
  let mut lista: Vec<String> = Vec::new();
  file_path.unwrap().read_to_string(&mut buf).unwrap();

  let mut path: &Path;
  let mut file;
  let mut ext;
  let mut name = "ERROR";
  // Search in file chprocut_file
  for line in buf.lines(){
    path = Path::new(line);
    if let Some(fina) = path.file_stem().unwrap().to_str(){
      name = fina;
    };
    file = path.is_file();

    if name.to_lowercase().contains(&search){
      nb_result += 1;

      if file {
        lista.push(nline.to_string());
        lista.push(name.to_string());
        lista.push("0".to_string());
        ext = path.extension().unwrap().to_str().unwrap();
        if ext == "lnk" && Path::new(&format!("C:/Users/{}/AppData/Roaming/arcrun/icons/{}.ico", user_name, nline)).exists() == false && line.contains("PowerShell") == false && lnk(&line, &nline.to_string()) != None {
          match get_icon(&lnk(&line, &nline.to_string()).unwrap().replace("\\", "/"), &nline.to_string()){
            Ok(()) => print!(""),
            Err(e) => println!("Cannot write an icon: {}", e)
          }
        }
        if ext == "url" && Path::new(&format!("C:/Users/{}/AppData/Roaming/arcrun/icons/{}.ico", user_name, nline)).exists() == false {
          url(&line, &nline.to_string());
        }
      } else {
        lista.push(nline.to_string());
        lista.push(name.to_string());
        lista.push("1".to_string());
      }

      if nb_result == 25{
        break;
      }
    }
    nline += 1;
  }

  lista.into()
}

#[tauri::command]
fn check_auto_start() -> bool{
  let mut autostart = false;

  match env::current_exe() {
    Ok(exe_path) => {
      let auto = AutoLaunchBuilder::new()
      .set_app_name("ArcRun")
      .set_app_path(exe_path.display().to_string().as_str())
      .set_use_launch_agent(true)
      .build()
      .unwrap();

      if auto.is_enabled().unwrap() {
        autostart = true;
      } else {
        autostart = false;
      }
    },
    Err(e) => {
      println!("{}", e);
    },
};

  autostart
}

#[tauri::command]
fn set_auto_start(){
  match env::current_exe() {
    Ok(exe_path) => {
      let auto = AutoLaunchBuilder::new()
      .set_app_name("ArcRun")
      .set_app_path(exe_path.display().to_string().as_str())
      .set_use_launch_agent(true)
      .build()
      .unwrap();
    
      if auto.is_enabled().unwrap() {
        println!("disabling");
        auto.disable().unwrap();
      } else {
        println!("enabling");
        auto.enable().unwrap();
      }
    },
    Err(e) => {
      println!("{}", e)
    },
};

}

fn get_icon(path: &str, name: &str) -> Result<(), Box<dyn std::error::Error>>{
  let user_name =  whoami::username();
  let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/icons", user_name);

  let map = FileMap::open(&path)?;
  
    let file = PeFile::from_bytes(&map)?;
    let loca = PathBuf::from(&path_files);
    let resources = file.resources()?;
  
    for (_name, group) in resources.icons().filter_map(Result::ok) {
    
    // Write the ICO file
    let mut contents = Vec::new();
    group.write(&mut contents)?;
    let path = loca.join(&format!("{}/{}.ico", path_files, name));
    println!("{}", path.display());
    let _ = std::fs::write(&path, &contents)?;
  }

Ok(())
}

#[tauri::command]
fn get_username() -> String {
  whoami::username()
}