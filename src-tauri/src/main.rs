// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::sync::Mutex;
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

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

enum TrayState {
  False,
  True,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  println!("Script started");

  match cache_programs(){
    Ok(_) => println!("Cashed program list"),
    Err(_) => println!("Cannot cached program list")
  }

  // CONFIG FILE (for later)

  // let mut config_fill = ["0"]; // Deafult Settings

  // let user_name = whoami::username();
  // let config_file = format!("C:/Users/{}/AppData/Roaming/arcrun/config", user_name);
  // let mut config_open = OpenOptions::new().read(true).write(true).create(true).append(true).open(config_file.clone())?;
  // let mut config_string = String::new();
  // config_open.read_to_string(&mut config_string)?;

  // let mut i = 0;
  // for lines in config_string.lines(){
  //   i += 1;
  // }

  // fs::write(config_file.clone(), "")?;

  // for lines in config_fill{
  //   writeln!(config_open, "{}", lines);
  // }

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
  
  let startup;
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");

  if autostart {
    startup = CustomMenuItem::new("startup".to_string(), "Run on startup").selected();
  } else {
    startup = CustomMenuItem::new("startup".to_string(), "Run on startup");
  }

  let tray_menu = SystemTrayMenu::new()
  .add_item(startup)
  .add_item(quit);

  let tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
  .setup(move |app|{
    if autostart {
      app.manage(Mutex::new(TrayState::True));
    } else {
      app.manage(Mutex::new(TrayState::False));
    }
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
      let item_handle = app.tray_handle().get_item(&id);
      match id.as_str() {
          "quit" => {
          AppHandle::exit(app, 0);
        }
        "startup" => {
          let tray_state_mutex = app.state::<Mutex<TrayState>>();
          let mut tray_state = tray_state_mutex.lock().unwrap();
          match *tray_state{
            TrayState::True => {
              match env::current_exe() {
                Ok(_e) => {
                  let _ = item_handle.set_selected(false);
                  *tray_state = TrayState::False;
                  set_auto_start();
                },
                Err(e) => println!("failed to get current exe path: {e}"),
            };
          }
            TrayState::False => {
              match env::current_exe() {
                Ok(_e) => {
                  let _ = item_handle.set_selected(true);
                  *tray_state = TrayState::True;
                  set_auto_start();
                },
                Err(e) => println!("failed to get current exe path: {e}"),
            };
            },
          };
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
    .invoke_handler(tauri::generate_handler![search, open])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
  Ok(())
}


#[tauri::command]
fn open(number: String, whattype: String){
  // Data
  let user_name = whoami::username();
  let path_file = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);

  // Program
  if whattype == "0".to_string(){
    // Data
    let chpro_file = format!("{}/chpro", path_file);
    let mut file_ = File::open(chpro_file).unwrap();
    let mut buf = String::new();
    file_.read_to_string(&mut buf).unwrap();
    
    // Run program
    match open_with::open(PathBuf::from(buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string())){
      Ok(()) => print!(""),
      Err(e) => println!("{}", e),
    }
  
  // Dir
  } else if whattype == "1".to_string() {

    let chdir_file = format!("{}/chdir", path_file);
    let mut dir_ = File::open(chdir_file).unwrap();
    let mut buf = String::new();
    dir_.read_to_string(&mut buf).unwrap();
    
    // Open directory
    match open_with::open(PathBuf::from(buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string())){
      Ok(()) => print!(""),
      Err(e) => println!("{}", e),
    }
    println!("start {}", buf.lines().nth(number.parse::<usize>().unwrap()).unwrap().to_string());
  }
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