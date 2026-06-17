use crate::error::{AppError, AppResult};
use rodio::{Decoder, OutputStream, Sink};
use std::fs::File;
use std::io::BufReader;
use tauri::{path::BaseDirectory, AppHandle, Manager, UserAttentionType, Window};

#[tauri::command]
pub fn notify_system(title: String, body: String) -> AppResult<()> {
    notify_rust::Notification::new()
        .summary(&title)
        .body(&body)
        .show()
        .map_err(|err| AppError::Other(err.to_string()))?;
    Ok(())
}

#[tauri::command]
pub fn notify_sound(app: AppHandle, sound_file: String) -> AppResult<()> {
    let path = app
        .path()
        .resolve(format!("assets/{sound_file}"), BaseDirectory::Resource)
        .map_err(|err| AppError::Other(err.to_string()))?;
    if !path.exists() {
        return Ok(());
    }
    let (_stream, handle) = OutputStream::try_default()
        .map_err(|err| AppError::Other(err.to_string()))?;
    let sink = Sink::try_new(&handle).map_err(|err| AppError::Other(err.to_string()))?;
    let file = File::open(path)?;
    let source = Decoder::new(BufReader::new(file)).map_err(|err| AppError::Other(err.to_string()))?;
    sink.append(source);
    sink.sleep_until_end();
    Ok(())
}

#[tauri::command]
pub fn notify_focus_window(window: Window) -> AppResult<()> {
    window
        .set_focus()
        .map_err(|err| AppError::Other(err.to_string()))?;
    Ok(())
}

#[tauri::command]
pub fn notify_taskbar_flash(window: Window) -> AppResult<()> {
    window
        .request_user_attention(Some(UserAttentionType::Informational))
        .map_err(|err| AppError::Other(err.to_string()))?;
    Ok(())
}
