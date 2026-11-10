RTLume — لنز راست‌چین برای چت‌های هوش مصنوعی

RTLume یک افزونه‌ی سبک، سریع و کاملاً آفلاین برای مرورگر فایرفاکس است که جهت متن (راست‌چین/چپ‌چین) را در سایت‌های هوش مصنوعی به صورت خودکار اصلاح می‌کند. این افزونه ترکیب نوشته‌های فارسی، انگلیسی و کدهای برنامه‌نویسی را در محیط چت به درستی نمایش می‌دهد.

    توسعه‌دهنده: Hossein Ahmadi | وب‌سایت: Ahmadi.pro

✨ ویژگی‌ها

    تشخیص هوشمند جهت: تشخیص خودکار راست‌چین یا چپ‌چین بودن هر بلوک متنی بر اساس اولین کاراکتر قوی (فارسی/انگلیسی).

    پشتیبانی از Shadow DOM: نفوذ به عمق DOM برای اعمال تغییرات در کادرهای تایپ پیچیده (مانند Claude.ai و DeepSeek).

    فونت وزیرمتن: استفاده از فونت محلی و زیبای وزیرمتن برای متون فارسی (بدون نیاز به اینترنت).

    حفاظت از کدها: کدهای برنامه‌نویسی همیشه چپ‌چین و با فونت مونواسپیس باقی می‌مانند.

    کنترل کامل: کلید فعال/غیرفعال کلی + کلید جداگانه برای هر سایت.

    حریم خصوصی مطلق: هیچ داده‌ای خوانده، ذخیره یا ارسال نمی‌شود. تنها تنظیمات در حافظه محلی مرورگر شما ذخیره می‌شود.

    سبک و سریع: بدون وابستگی به سرورهای خارجی و بدون درخواست شبکه‌ای.

🚀 نصب
نصب از فروشگاه Mozilla (به‌زودی)

پس از تأیید در addons.mozilla.org، می‌توانید افزونه را مستقیماً از آنجا نصب کنید.
نصب دستی (برای توسعه‌دهندگان)

    مخزن را کلون کنید یا فایل ZIP پروژه را دانلود کنید.

    در فایرفاکس به about:debugging#/runtime/this-firefox بروید.

    روی Load Temporary Add-on... کلیک کنید و فایل manifest.json را انتخاب کنید.

(برای نصب دائمی، افزونه باید در AMO امضا شود یا از Firefox Developer Edition استفاده کنید).
🛠️ ساختار پروژه

RTLume/
├── manifest.json # تنظیمات افزونه (Manifest V3)
├── background.js # مقداردهی اولیه و مدیریت storage
├── content.js # اسکریپت اصلی اصلاح جهت متن
├── popup.html / .js # پنجره پاپ‌آپ
├── options.html / .js # صفحه تنظیمات
├── styles.css # استایل مشترک
├── fonts/ # فونت وزیرمتن (محلی)
├── icons/ # آیکون‌های افزونه
├── README.md # همین فایل
└── LICENSE # مجوز استفاده
🔒 حریم خصوصی

این افزونه هیچ داده‌ای را جمع‌آوری، ذخیره یا به سرورهای خارجی ارسال نمی‌کند. تمام پردازش‌ها به صورت محلی در مرورگر شما انجام می‌شود. تنها اطلاعات ذخیره‌شده، وضعیت روشن/خاموش بودن افزونه و لیست سایت‌های انتخابی شماست که در storage.local مرورگر نگهداری می‌شود.
📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای اطلاعات بیشتر فایل LICENSE را ببینید.

فونت Vazirmatn تحت مجوز SIL Open Font License 1.1 منتشر شده است.

ساخته شده با ❤️ توسط Hossein Ahmadi — Ahmadi.pro
🇬🇧 English Description

RTLume is a lightweight, fast, and fully offline Firefox extension that automatically corrects the text direction (RTL/LTR) on AI chat websites. It properly displays mixed Persian, English, and code snippets in the chat environment.
Features

    Smart Direction Detection: Automatically detects RTL or LTR for each text block based on the first strong character.

    Shadow DOM Support: Penetrates deep into the DOM to apply changes to complex input fields (e.g., Claude.ai, DeepSeek).

    Vazirmatn Font: Uses the beautiful, local Vazirmatn font for Persian text (no internet required).

    Code Protection: Code snippets always remain LTR with a monospace font.

    Full Control: Global on/off toggle + individual toggle for each site.

    Absolute Privacy: No data is read, stored, or sent. Settings are stored locally in your browser.

Installation

    Clone the repository or download the ZIP file.

    Go to about:debugging#/runtime/this-firefox in Firefox.

    Click Load Temporary Add-on... and select manifest.json.

License

This project is licensed under the MIT License. See the LICENSE file for details. The Vazirmatn font is licensed under the SIL Open Font License 1.1.

Made with ❤️ by Hossein Ahmadi — Ahmadi.pro