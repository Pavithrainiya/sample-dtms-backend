import os
import django
from django.core.mail import send_mail
from decouple import config

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_config():
    user = config('EMAIL_HOST_USER', default='Not Set')
    password = config('EMAIL_HOST_PASSWORD', default='Not Set')
    
    print(f"--- EMAIL CONFIG DIAGNOSTIC ---")
    print(f"EMAIL_HOST_USER: {user}")
    print(f"PASSWORD SET: {'Yes' if password != 'Not Set' and 'your-' not in password else 'No (Placeholder found)'}")
    print(f"--------------------------------")

    if 'your-email' in user or 'your-app-password' in password:
        print("\nERROR: You are still using placeholders in .env!")
        print("Please replace 'your-email@gmail.com' with your real Gmail.")
        print("Please replace 'your-app-password' with a valid 16-character Google App Password.")
        return

    try:
        print("\nAttempting to send a test email...")
        send_mail(
            '[DTMS] Configuration Test',
            'If you see this, your Gmail SMTP settings are correct!',
            user,
            [user], # Send to yourself
            fail_silently=False,
        )
        print("✅ SUCCESS! Check your inbox.")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        print("\nPossible solutions:")
        print("1. Enable 2-Step Verification in your Google Account.")
        print("2. Generate an 'App Password' specifically for this app.")
        print("3. Ensure EMAIL_USE_TLS=True in your settings.")

if __name__ == "__main__":
    test_config()
