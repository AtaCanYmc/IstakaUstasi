import base64
import hashlib
import os
from typing import Optional

import structlog
from cryptography.fernet import Fernet

logger = structlog.get_logger("okey_bridge_server.services.encryption")


class EncryptionService:
    _fernet: Optional[Fernet] = None

    @classmethod
    def _get_fernet(cls) -> Fernet:
        if cls._fernet is None:
            # Stable 32-byte key derived from SUPABASE_KEY
            base_secret = os.getenv(
                "SUPABASE_KEY", "default-fallback-insecure-secret-key-salt"
            )
            key_hash = hashlib.sha256(base_secret.encode()).digest()
            fernet_key = base64.urlsafe_b64encode(key_hash)
            cls._fernet = Fernet(fernet_key)
        return cls._fernet

    @classmethod
    def encrypt(cls, text: str) -> str:
        if not text:
            return ""
        try:
            f = cls._get_fernet()
            encrypted_bytes = f.encrypt(text.encode())
            return encrypted_bytes.decode()
        except Exception as e:
            logger.exception("Encryption failed", error=str(e))
            raise ValueError("Failed to encrypt sensitive data.")

    @classmethod
    def decrypt(cls, encrypted_text: str) -> str:
        if not encrypted_text:
            return ""
        try:
            f = cls._get_fernet()
            decrypted_bytes = f.decrypt(encrypted_text.encode())
            return decrypted_bytes.decode()
        except Exception as e:
            logger.exception("Decryption failed", error=str(e))
            raise ValueError("Failed to decrypt sensitive data.")
