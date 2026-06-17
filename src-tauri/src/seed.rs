use crate::error::AppResult;
use rusqlite::Connection;

const DEFAULTS: &[(&str, &str)] = &[
    ("timer.work_secs", "1500"),
    ("timer.break_secs", "300"),
    ("timer.long_break_secs", "900"),
    ("timer.long_break_every", "4"),
    ("timer.auto_continue", "false"),
    ("notify.system", "true"),
    ("notify.sound", "true"),
    ("notify.sound_file", "\"ding.mp3\""),
    ("notify.fullscreen", "true"),
    ("notify.taskbar", "true"),
    ("theme", "\"acid\""),
];

pub fn seed_defaults(conn: &Connection) -> AppResult<()> {
    for (key, value) in DEFAULTS {
        conn.execute(
            "INSERT OR IGNORE INTO settings(key, value) VALUES(?1, ?2)",
            [key, value],
        )?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;

    #[test]
    fn seed_inserts_defaults() {
        let db = db::open_memory().unwrap();
        seed_defaults(&db.lock()).unwrap();
        let count: i64 = db
            .lock()
            .query_row("SELECT count(*) FROM settings", [], |r| r.get(0))
            .unwrap();
        assert_eq!(count, 11);
    }

    #[test]
    fn seed_is_idempotent() {
        let db = db::open_memory().unwrap();
        seed_defaults(&db.lock()).unwrap();
        seed_defaults(&db.lock()).unwrap();
        let count: i64 = db
            .lock()
            .query_row("SELECT count(*) FROM settings", [], |r| r.get(0))
            .unwrap();
        assert_eq!(count, 11);
    }
}
