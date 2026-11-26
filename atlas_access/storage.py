"""Persistent Atlas mode, owner sessions, and audit events."""
from contextlib import contextmanager
import hashlib
import secrets
import sqlite3
import time


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


class AccessStore:
    def __init__(self, path, owner_scope, now=time.time):
        self.path = path
        self.owner_scope = owner_scope
        self.now = now
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS access_state (
                    id INTEGER PRIMARY KEY CHECK (id = 1), public_release TEXT
                );
                INSERT OR IGNORE INTO access_state VALUES (1, NULL);
                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expiry INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit (
                    id INTEGER PRIMARY KEY, at INTEGER NOT NULL, event TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS audit_lookup ON audit(event, at);
            """)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=5)
        try:
            with db:
                yield db
        finally:
            db.close()

    def session_key(self, token):
        return digest(self.owner_scope + token)

    def _audit(self, db, event):
        db.execute("INSERT INTO audit(at,event) VALUES (?,?)", (int(self.now()), event))

    def sign_in(self, valid, old_token, ttl):
        """Serialize attempts across workers and cap invalid logins per window."""
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            cutoff = int(self.now()) - 900
            attempts, first = db.execute(
                "SELECT count(*), min(at) FROM audit WHERE event='Sign-in denied' AND at>?",
                (cutoff,),
            ).fetchone()
            if attempts >= 12:
                return None, max(1, first - cutoff)
            if not valid:
                self._audit(db, "Sign-in denied")
                return None, 0
            token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
            db.execute("DELETE FROM sessions WHERE expiry<=? OR token=?", (int(self.now()), self.session_key(old_token)))
            db.execute("INSERT INTO sessions VALUES (?,?,?)", (self.session_key(token), csrf, int(self.now()) + ttl))
            self._audit(db, "Owner signed in")
            return token, 0

    def session(self, token):
        with self.connect() as db:
            row = db.execute(
                "SELECT csrf FROM sessions WHERE token=? AND expiry>?", (self.session_key(token), int(self.now()))
            ).fetchone()
            return row[0] if row else None

    def revoke(self, token):
        with self.connect() as db:
            db.execute("DELETE FROM sessions WHERE token=?", (self.session_key(token),))
            self._audit(db, "Owner signed out")

    def mode(self, release):
        if not release:
            return "RESTRICTED"
        with self.connect() as db:
            current = db.execute("SELECT public_release FROM access_state WHERE id=1").fetchone()[0]
            return "PUBLIC" if current == release else "RESTRICTED"

    def change_mode(self, token, release):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            active = db.execute(
                "SELECT 1 FROM sessions WHERE token=? AND expiry>?", (self.session_key(token), int(self.now()))
            ).fetchone()
            if not active:
                return False
            db.execute("UPDATE access_state SET public_release=? WHERE id=1", (release,))
            self._audit(db, "Owner enabled public access" if release else "Owner enabled restricted access")
            return True

    def audit(self):
        with self.connect() as db:
            return db.execute(
                "SELECT strftime('%Y-%m-%d %H:%M:%S', at, 'unixepoch'), event FROM audit "
                "ORDER BY id DESC LIMIT 20"
            ).fetchall()

    def audit_denial(self):
        with self.connect() as db:
            self._audit(db, "Mode change denied")
