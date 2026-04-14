# DTMS Email Notification Setup Guide

## Quick Checklist

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated
- [ ] `.env` file created with correct credentials
- [ ] Email backend set to SMTP (not console)
- [ ] Test email sent successfully
- [ ] Django server restarted

## Step 1: Generate Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Enter "DTMS"
5. Click **Generate**
6. Copy the 16-digit password (format: `xxxx xxxx xxxx xxxx`)
7. Remove spaces when adding to `.env` file

## Step 2: Configure .env File

Edit `backend/.env` and update these lines:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-actual-email@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=DTMS Notifications <your-actual-email@gmail.com>
```

**IMPORTANT:** 
- Replace `your-actual-email@gmail.com` with your Gmail address
- Replace `xxxxxxxxxxxxxxxx` with the 16-digit app password (no spaces)
- Do NOT use your regular Gmail password

## Step 3: Test Email Configuration

Run the diagnostic test:

```bash
cd backend
python test_email.py
```

This will:
- ✅ Check your configuration
- ✅ Test SMTP connection
- ✅ Verify authentication
- ✅ Send a test email

## Step 4: Restart Django Server

After updating `.env`, restart your Django server:

```bash
# Stop the current server (Ctrl+C)
python manage.py runserver
```

## Step 5: Test Task Notification

1. Login as Admin
2. Create a new task
3. Check that users receive email notifications

## Troubleshooting

### Issue: "Authentication Failed"
**Cause:** Wrong credentials or not using App Password
**Fix:** 
- Ensure 2-Step Verification is enabled
- Generate a new App Password
- Use App Password, not regular password

### Issue: "Connection Refused" or "Timeout"
**Cause:** Firewall blocking port 587
**Fix:**
- Check firewall settings
- Try alternative configuration:
  ```env
  EMAIL_PORT=465
  EMAIL_USE_TLS=False
  EMAIL_USE_SSL=True
  ```

### Issue: "Email sent but not received"
**Possible causes:**
1. Check spam/junk folder
2. Gmail may be blocking automated emails
3. Recipient email address is incorrect
4. Check Django logs for errors

**Fix:**
- Check Django console for error messages
- Verify recipient email in database
- Check Gmail "Sent" folder to confirm email was sent

### Issue: "No emails sent when creating tasks"
**Cause:** No users assigned to task
**Fix:** Already fixed! Tasks now auto-assign to all users with role='User'

## Viewing Django Logs

To see detailed email logs, check your Django console output when:
- Creating tasks
- Running test_email.py

Look for messages like:
```
✅ Task notification sent successfully to 3 recipients: ['user1@example.com', 'user2@example.com']
```

## Alternative Email Providers

If Gmail doesn't work, you can use:

### SendGrid (Free tier: 100 emails/day)
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@your-domain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
```

## Support

If issues persist:
1. Run `python test_email.py` and share the output
2. Check Django console logs when creating tasks
3. Verify `.env` file is in the correct location (`backend/.env`)
4. Ensure Django server was restarted after changing `.env`
