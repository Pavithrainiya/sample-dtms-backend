import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import smtplib

print("=" * 60)
print("DTMS EMAIL CONFIGURATION DIAGNOSTIC TEST")
print("=" * 60)

# Step 1: Check configuration
print("\n[STEP 1] Checking Django Email Settings...")
print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"  EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

# Check if backend is console
if 'console' in settings.EMAIL_BACKEND.lower():
    print("\n⚠️  WARNING: EMAIL_BACKEND is set to 'console'!")
    print("   Emails will be printed to console, not sent!")
    print("   Update your .env file with:")
    print("   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend")
    sys.exit(1)

# Check if credentials are set
if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
    print("\n❌ ERROR: Email credentials not configured!")
    print("   Please set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env file")
    sys.exit(1)

print("✅ Configuration looks good!")

# Step 2: Test SMTP connection directly
print("\n[STEP 2] Testing Direct SMTP Connection...")
try:
    server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
    server.set_debuglevel(1)  # Show detailed SMTP conversation
    server.ehlo()
    
    if settings.EMAIL_USE_TLS:
        print("  Starting TLS...")
        server.starttls()
        server.ehlo()
    
    print(f"  Logging in as {settings.EMAIL_HOST_USER}...")
    server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
    print("✅ SMTP connection and authentication successful!")
    server.quit()
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ AUTHENTICATION FAILED: {e}")
    print("\nPossible causes:")
    print("  1. Wrong email or password")
    print("  2. Not using App Password (required for Gmail)")
    print("  3. 2-Step Verification not enabled")
    print("\nHow to fix:")
    print("  1. Go to https://myaccount.google.com/security")
    print("  2. Enable 2-Step Verification")
    print("  3. Generate App Password: https://myaccount.google.com/apppasswords")
    print("  4. Use the 16-digit app password (no spaces)")
    sys.exit(1)
except smtplib.SMTPException as e:
    print(f"\n❌ SMTP ERROR: {e}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ CONNECTION ERROR: {e}")
    print("\nPossible causes:")
    print("  1. Firewall blocking port 587")
    print("  2. Network connectivity issues")
    print("  3. Wrong EMAIL_HOST or EMAIL_PORT")
    sys.exit(1)

# Step 3: Send test email via Django
print("\n[STEP 3] Sending Test Email via Django...")
test_recipient = input("Enter recipient email address (press Enter to use EMAIL_HOST_USER): ").strip()
if not test_recipient:
    test_recipient = settings.EMAIL_HOST_USER

try:
    email = EmailMessage(
        subject='[DTMS] Email Configuration Test',
        body='🎉 Success! Your DTMS email notification system is working correctly.\n\n'
             'This test email confirms that:\n'
             '✅ SMTP connection is established\n'
             '✅ Authentication is successful\n'
             '✅ Emails can be sent from your Django application\n\n'
             'You can now receive task notifications from the Digital Talent Management System.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[test_recipient],
    )
    
    result = email.send(fail_silently=False)
    
    if result == 1:
        print(f"\n✅ SUCCESS! Test email sent to {test_recipient}")
        print("\nNext steps:")
        print("  1. Check your inbox (and spam folder)")
        print("  2. If not received within 2 minutes, check Gmail's 'Sent' folder")
        print("  3. Try creating a task in DTMS to test automatic notifications")
    else:
        print(f"\n⚠️  Email send returned {result} (expected 1)")
        
except Exception as e:
    print(f"\n❌ FAILED TO SEND EMAIL: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("DIAGNOSTIC TEST COMPLETE")
print("=" * 60)
