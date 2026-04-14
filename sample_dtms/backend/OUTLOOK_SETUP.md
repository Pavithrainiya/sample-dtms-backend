# Alternative: Use Outlook Email (Easier than Gmail!)

Outlook/Hotmail is much simpler - no app passwords needed!

## Step 1: Create Outlook Account (if you don't have one)

1. Go to: https://outlook.live.com/
2. Click "Create free account"
3. Choose an email like: dtms-notifications@outlook.com
4. Complete the signup

## Step 2: Update .env File

Replace the email section in your `.env` file with:

```env
# Email Configuration (Outlook)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-outlook-email@outlook.com
EMAIL_HOST_PASSWORD=your-outlook-password
DEFAULT_FROM_EMAIL=DTMS Notifications <your-outlook-email@outlook.com>
```

## Step 3: Test

Run: `python test_email_direct.py`

## Why Outlook is Easier:

- ✅ No 2-Step Verification required
- ✅ No app passwords needed
- ✅ Just use your regular password
- ✅ Works immediately
- ✅ More reliable for automated emails

## Which Should You Use?

**Use Outlook if:**
- You want it to work quickly
- You're tired of Gmail issues
- This is for development/testing

**Stick with Gmail if:**
- You must use your existing Gmail
- You can verify 2-Step Verification is working
- You successfully generated app passwords before
