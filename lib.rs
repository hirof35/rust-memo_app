use std::fs;

#[tauri::command]
fn save_memo(path: String, content: String) -> Result<String, String> {
    // JavaScriptから渡されたフルパスに保存する
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(format!("保存しました"))
}

// --- 追加: 読み込み用コマンド ---
#[tauri::command]
fn load_memo() -> Result<String, String> {
    let file_path = "my_memo.txt";
    if std::path::Path::new(file_path).exists() {
        fs::read_to_string(file_path).map_err(|e| e.to_string())
    } else {
        Ok("".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // dialog と fs のプラグインを初期化
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_memo, load_memo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
