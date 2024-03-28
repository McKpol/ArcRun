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
use native_dialog::{MessageDialog, MessageType};


fn cache_programs<>() -> Result<(), Box<dyn std::error::Error>> {
  let user_name =  whoami::username();
  let programs_path = format!("C:/Users/{}/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/", user_name);
  let path_files = format!("C:/Users/{}/AppData/Roaming/arcrun/", user_name);
  let path_path = format!("{}/listpath", path_files);
  let path_cache = format!("{}/listcache", path_files);

  // Creating dir and file
  fs::create_dir_all(path_files)?;
  let mut file = OpenOptions::new().read(true).write(true).create(true).append(true).open(path_path.clone())?;
  OpenOptions::new().read(true).write(true).create(true).append(true).open(path_cache.clone())?;
  // Empting a file
  fs::write(path_path.clone(), "")?;
  // Search folder
  for programlist in WalkDir::new(programs_path).into_iter().filter_map(|file| file.ok()) {
    if programlist.metadata().unwrap().is_file() && programlist.path().extension().unwrap().to_str().unwrap() != "ini" {
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
    }
    if programlist.metadata().unwrap().is_dir(){
      writeln!(file, "{}", format!("{}", programlist.path().display()))?;
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
    Err(e) => println!("Cannot cached program list: {}", e)
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
    
    let _ = tauri::window::Window::hide(&app.get_window("main").unwrap());
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
    .invoke_handler(tauri::generate_handler![search, open, cant_set_hotkey])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
  Ok(())
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
  let mut listadir: Vec<String> = Vec::new();
  file_path.unwrap().read_to_string(&mut buf).unwrap();

  let mut path: &Path;
  let mut file;
  let mut name = "ERROR";
  // Search in file chprocut_file
  for line in buf.lines(){
    path = Path::new(line);
    if let Some(fina) = path.file_stem().unwrap().to_str(){
      name = fina;
    };
    file = path.is_file();

    if line.to_lowercase().contains(&search){
      nb_result += 1;

      if file {
        lista.push(nline.to_string());
        lista.push(name.to_string());
        lista.push("0".to_string());
      } else {
        listadir.push(nline.to_string());
        listadir.push(name.to_string());
        listadir.push("1".to_string());
      }

      if nb_result == 8{
        break;
      }
    }
    nline += 1;
  }
  lista.extend(listadir);

  lista.into()
}