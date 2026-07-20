from fastapi import Request

MESSAGES = {
    "tr": {
        "username_taken": "Kullanıcı adı veya e-posta zaten alınmış.",
        "invalid_credentials": "E-posta veya şifre hatalı.",
        "quota_exceeded": (
            "Kullanım kotası doldu. Haftalık kotanız en fazla "
            "3 tarama ile sınırlıdır."
        ),
        "db_not_configured": "Veritabanı bağlantısı yapılandırılmamış.",
        "key_required": "API anahtarı gereklidir.",
        "decryption_error": "API anahtarınız çözümlenirken hata oluştu.",
        "no_custom_key": "Kullanıcıya ait özel Roboflow anahtarı bulunamadı.",
        "job_not_found": "İş bulunamadı.",
        "invalid_strategy": (
            "Geçersiz strateji '{strategy}'. " "Desteklenen stratejiler: {supported}"
        ),
        "internal_error": "Sistem içi bir hata oluştu: {error}",
        "roboflow_403": "API anahtarınız hatalı, lütfen kontrol edin.",
        "roboflow_429": ("Roboflow limitsiz kullanım kotanız doldu veya limit aşıldı."),
        "roboflow_error": "Roboflow hatası: {error}",
    },
    "en": {
        "username_taken": "Username or email is already taken.",
        "invalid_credentials": "Invalid email or password.",
        "quota_exceeded": (
            "Quota exceeded. Weekly quota limits you to " "3 image extractions."
        ),
        "db_not_configured": "Database client not configured.",
        "key_required": "API Key is required.",
        "decryption_error": "Error decrypting your custom API key.",
        "no_custom_key": "Custom Roboflow key not configured for user.",
        "job_not_found": "Job not found.",
        "invalid_strategy": (
            "Invalid strategy '{strategy}'. " "Supported strategies: {supported}"
        ),
        "internal_error": "An internal server error occurred: {error}",
        "roboflow_403": "Your API key is incorrect, please check.",
        "roboflow_429": ("Roboflow unlimited quota has been reached or rate limited."),
        "roboflow_error": "Roboflow error: {error}",
    },
}


def get_language(request: Request) -> str:
    lang = request.headers.get("x-language") or request.headers.get(
        "accept-language", "en"
    )
    lang_lower = lang.lower()
    if lang_lower.startswith("tr"):
        return "tr"
    return "en"


def get_message(request: Request, key: str, **kwargs) -> str:
    lang = get_language(request)
    template = MESSAGES.get(lang, MESSAGES["en"]).get(key, MESSAGES["en"].get(key, key))
    return template.format(**kwargs)
