import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

print("=" * 60)
print("DIRECT SMTP TEST (Bypassing Django)")
print("=" * 60)

# Direct credentials (no .env caching issues)
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "pavijeevi56@gmail.com"
EMAIL_PASSWORD = "tozahdwzwyaewuyv"  # No spaces!

print(f"\nEmail: {EMAIL_USER}")
print(f"Password: {EMAIL_PASSWORD}")
print(f"Password length: {len(EMAIL_PASSWORD)} characters")
print(f"Has spaces: {' ' in EMAIL_PASSWORD}")

print("\n[STEP 1] Connecting to Gmail SMTP...")
try:
    server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10)
    print("✅ Connected to SMTP server")
    
    print("\n[STEP 2] Starting TLS encryption...")
    server.starttls()
    print("✅ TLS started")
    
    print("\n[STEP 3] Logging in...")
    server.login(EMAIL_USER, EMAIL_PASSWORD)
    print("✅ Authentication successful!")
    
    print("\n[STEP 4] Sending test email...")
    
    # Create email
    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = EMAIL_USER
    msg['Subject'] = "[DTMS] Direct SMTP Test - SUCCESS!"
    
    body = """🎉 Congratulations!

Your email configuration is working perfectly!

This email was sent directly via SMTP without Django to confirm your credentials are correct.

Next steps:
1. Your Django application will now be able to send emails
2. Restart your Django server
3. Create a task to test automatic notifications

- DTMS Email System"""
    
    msg.attach(MIMEText(body, 'plain'))
    
    server.send_message(msg)
    print(f"✅ Email sent successfully to {EMAIL_USER}")
    
    server.quit()
    print("\n" + "=" * 60)
    print("SUCCESS! Check your inbox (and spam folder)")
    print("=" * 60)
    
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ AUTHENTICATION FAILED!")
    print(f"Error: {e}")
    print("\nPossible issues:")
    print("1. The app password might be incorrect")
    print("2. Try generating a NEW app password")
    print("3. Make sure 2-Step Verification is enabled")
    print("\nGenerate new password at:")
    print("https://myaccount.google.com/apppasswords")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
