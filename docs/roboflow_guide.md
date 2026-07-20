# Roboflow API Key ve Görsel Çözümleme Kurulum Rehberi

Bu rehber, Istaka Ustası uygulamasının görsel tarama (fotoğraftan taşları algılama) özelliğini kendi Roboflow hesabınız ve API anahtarınız ile nasıl çalıştıracağınızı adım adım açıklamaktadır.

---

## Neden Kendi API Anahtarımı Kullanmalıyım?
Istaka Ustası, güvenliğiniz ve sınırsız kullanımınız için **BYOK (Bring Your Own Key)** altyapısını destekler. API anahtarınız sunucu tarafında AES-256 algoritmasıyla güçlü bir şekilde şifrelenir ve asla ham haliyle saklanmaz. Kendi Roboflow anahtarınızı girerek ücretsiz plandaki kotalara takılmadan sınırsız görsel analiz gerçekleştirebilirsiniz.

---

## Adım Adım Roboflow Kurulumu

### Adım 1: Roboflow Hesabı Oluşturma
1. [Roboflow web sitesine](https://roboflow.com/) gidin.
2. Ücretsiz bir hesap oluşturun veya mevcut hesabınızla giriş yapın.

### Adım 2: API Anahtarını Alma
1. Sağ üst köşedeki profil ikonunuza tıklayın ve **"Settings" (Ayarlar)** seçeneğine gidin.
2. Sol menüden **"Workspaces"** sekmesinden çalışma alanınızı seçin.
3. Menüdeki **"API Keys"** seçeneğine tıklayın.
4. **"Private API Key"** başlığı altındaki gizli anahtarı kopyalayın (Örn: `rf_xxxxxxxxxxxxxxxxxxxxxxxx`).
   * *Not: Bu anahtarı kimseyle paylaşmayın.*

### Adım 3: Workspace Adını Öğrenme
1. Roboflow paneline (Dashboard) gidin.
2. Tarayıcı adres çubuğundaki URL'den veya Workspace ayarlarından workspace adını bulun.
   * Örneğin: `https://app.roboflow.com/ata-dc7ry/...` adresindeki `ata-dc7ry` sizin **Workspace** adınızdır.

### Adım 4: İş Akışı (Workflow) Oluşturma veya Tanımlama
Istaka Ustası, görselleri analiz etmek için Roboflow'un **Workflows** altyapısını kullanır.
1. Roboflow Workspace'inizde sol menüden **"Workflows"** sekmesine gidin.
2. Yeni bir iş akışı oluşturun veya projenizde tanımlı olan YOLOv8 tabanlı taş algılama modelini iş akışına bağlayın.
3. İş akışınızın benzersiz kimliğini (**Workflow ID**) kopyalayın.
   * Örneğin: `okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic` gibi bir isim olacaktır.

---

## Istaka Ustası Arayüzünde Yapılandırma

Kopyaladığınız bilgileri Istaka Ustası uygulamasına girmek için:
1. Uygulamada **Ayarlar** (profil) butonuna tıklayın.
2. Açılan panelde şu bilgileri doldurun:
   - **API Anahtarı (API Key):** Kopyaladığınız `rf_...` ile başlayan anahtar.
   - **Workspace:** Workspace adınız (örn: `ata-dc7ry`).
   - **Workflow ID:** İş akışı kimliğiniz.
   - **API URL:** Varsayılan olarak `https://serverless.roboflow.com` bırakabilirsiniz.
3. **Kaydet** butonuna tıklayın.

Bilgileriniz kaydedildikten sonra sistem görsel tarama işlemlerini doğrudan kendi hesabınız üzerinden yapacaktır.
