<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include('config.php');

    $email = $_POST['email'];
    if ($email || filter_var($email, FILTER_VALIDATE_EMAIL)) {
        //SMTP needs accurate times, and the PHP timezone MUST be set
        //This should be done in your php.ini, but this is how to do it if you don't have access to that
        date_default_timezone_set('Etc/UTC');

        require 'PHPMailerAutoload.php';
        //Create a new PHPMailer instance
        $mail = new PHPMailer;

        //Tell PHPMailer to use SMTP
        $mail->isSMTP();
        //Enable SMTP debugging
        // 0 = off (for production use)
        // 1 = client messages
        // 2 = client and server messages
        $mail->SMTPDebug = 0;
        //Ask for HTML-friendly debug output
        $mail->Debugoutput = 'html';

        //Set the hostname of the mail server
        $mail->Host = "SMTP.FARMSINTERNATIONAL.COM";
        //Set the SMTP port number - likely to be 25, 465 or 587
        $mail->Port = 587;
        //Whether to use SMTP authentication
        $mail->SMTPAuth = true;
        $mail->SMTPAutoTLS = false;
        //Username to use for SMTP authentication
        $mail->Username = $config['smtpemail'];
        //Password to use for SMTP authentication
        $mail->Password = $config['smtppassword'];
        //Set who the message is to be sent from
        $mail->setFrom("info@farmsinternational.com", "FARMS International");
        //Set an alternative reply-to address
        $mail->addReplyTo('info@farmsinternational.com');
        //Set who the message is to be sent to
        $mail->addAddress($email);
        //Set the subject line
        $mail->Subject = "FARMS International Informational Booklet";

        echo 'test';
        //if you want to include text in the body.
        $mail->Body    = file_get_contents('premiumemail.html');

        echo 'test';
        //send the message, check for errors
        if ($mail->send()) {
            $responseJson = "{ \"success\": true }";
            $responseHtmlMsg = "Submission successful!";
        } else {
            http_response_code(500);
            $responseJson = "{ error: $mail->ErrorInfo }";
            $responseHtmlMsg = "Submission failed, please try emailing us at info@farmsinternational.com.";
        }

        if (isset($_POST['subscribe-email'])) {
            //Set who the message is to be sent from
            $mail->setFrom("info@farmsinternational.com", "FARMS International");
            //Set an alternative reply-to address
            $mail->addReplyTo($email);
            //Set who the message is to be sent to
            $mail->addAddress("info@farmsinternational.com");
            //Set the subject line
            $mail->Subject = 'New Marketing Form Submission';
            //if you want to include text in the body.
            $mail->Body    = "A user with the following email address has requested to be added to our mailing list from the marketing campaign's contact form: $email";
            //send the message, check for errors
            $mail->send();
        }
    } else {
        http_response_code(422);
        $responseJson = "{ \"emailValidationFailed\": $errEmail }";
        $responseHtmlMsg = "Submission failed, your email address was incorrect or missing.";
    }

    if (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header('Content-Type: application/json');
        echo $responseJson;
    } else {
        header('Content-Type: text/html; charset=UTF-8');
        echo "<html><head><meta http-equiv=\"refresh\" content=\"10;url=http://www.farmsinternational.com/givegood.html\" /></head>".
        "<body style=\"text-align:center;\"><strong>$responseHtmlMsg</strong><br /> Returning to previous page in 10 seconds.<br />".
        "If not redirected, click here to contine: <a href=\"http://www.farmsinternational.com/givegood.html\">http://www.farmsinternational.com/givegood.html</a></body><html>";
    }
}
