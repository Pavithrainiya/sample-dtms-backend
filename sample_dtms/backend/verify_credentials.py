print("=" * 60)
print("CREDENTIAL VERIFICATION")
print("=" * 60)

email = "pavithrakumaran010622@gmail.com"
password = "gheqlkftqqpygkun"

print(f"\nEmail: {email}")
print(f"Email length: {len(email)}")
print(f"Email has spaces: {' ' in email}")

print(f"\nPassword: {password}")
print(f"Password length: {len(password)}")
print(f"Password has spaces: {' ' in password}")
print(f"Password characters: {list(password)}")

print("\n" + "=" * 60)
print("IMPORTANT CHECKS:")
print("=" * 60)

# Check 1: Email format
if "@gmail.com" in email and " " not in email:
    print("✅ Email format looks correct")
else:
    print("❌ Email format issue detected")

# Check 2: Password length
if len(password) == 16:
    print("✅ Password length is correct (16 characters)")
else:
    print(f"❌ Password length is {len(password)}, should be 16")

# Check 3: No spaces
if " " not in password:
    print("✅ Password has no spaces")
else:
    print("❌ Password contains spaces!")

print("\n" + "=" * 60)
print("NEXT STEPS:")
print("=" * 60)
print("\n1. Go to: https://myaccount.google.com/apppasswords")
print("2. Check if you see 'DTMS_NEW' in the list")
print("3. If yes, the password should work")
print("4. If no, 2-Step Verification might not be enabled")
print("\n5. Alternative: Try Outlook instead (see OUTLOOK_SETUP.md)")
