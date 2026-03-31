<?php

// Copy this file to config.php and fill in the values below.
// config.php is gitignored and must be created manually on each server/environment.

// SMTP account used to send contact form emails
$config['smtpemail']   = "your-smtp-username@example.com";
$config['smtppassword'] = "your-smtp-password";
$config['smtpserver']  = "your.smtp.server.com";

// Address that contact form submissions are delivered to
$config['mailto'] = "info@farmsinternational.com";

// Google reCAPTCHA v2 secret key (server-side)
// Get one at https://www.google.com/recaptcha/admin
$config['recaptchaprivatekey'] = "your-recaptcha-secret-key";
