<?php
	if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		$name = $_POST['name'];
		$mailingAddress = $_POST['mailingaddress'];
		$city = $_POST['city'];
		$state = $_POST['state'];
		$zip = $_POST['zip'];
		$email = $_POST['email'];
		$country = $_POST['country'];
		$note = $_POST['note'];

		$subject = 'New Contact Form Submission';

		$body ="From: $name\nE-Mail: $email\n";
        $body .= ($mailingAddress ? "Mailing Address: $mailingAddress\n" : "");
        $body .= ($city ? "City: $city\n" : "");
        $body .= ($state ? "State: $state\n" : "");
        $body .= ($zip ? "Zip: $zip\n" : "");
        $body .= ($country ? "Country: $country\n" : "");
        $body .= (isset($_POST['subscribe-email']) ? "Requests email newsletter subscription\n" : "");
        $body .= (isset($_POST['subscribe-mail']) ? "Requests mail newsletter subscription\n" : "");
        $body .= (isset($_POST['request-dvd']) ? "Requests DVD\n" : "");
        $body .= (isset($_POST['estate-stewardship']) ? "Requests estate stewardship info\n" : "");
        $body .= (isset($_POST['farms-coffee']) ? "Requests FARMS Coffee materials\n" : "");
        $body .= (isset($_POST['request-presentation']) ? "Requests a church presentation\n" : "");
        $body .= (isset($_POST['request-prayer']) ? "Requests to be on the prayer team\n" : "");
        $body .= ($note ? "Note:\n$note" : "");


		// Check if name has been entered
		$errName = 'false';
		if (!$_POST['name']) {
			$errName = 'true';
		}

		// Check if email has been entered and is valid
        $errEmail = 'false';
		if (!$_POST['email'] || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
			$errEmail = 'true';
		}

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
        $mail->Username = "chris@farmsinternational.com";
        //Password to use for SMTP authentication
        $mail->Password = "FarmsEmail#1";
        //Set who the message is to be sent from
        $mail->setFrom("info@farmsinternational.com", "FARMS Contact Form");
        //Set an alternative reply-to address
        $mail->addReplyTo($email, $name);
        //Set who the message is to be sent to
        //$mail->addAddress('info@farmsinternational.com');
        $mail->addAddress('sirhcybe@gmail.com');

        //Set the subject line
        $mail->Subject = $subject;
        //if you want to include text in the body.
        $mail->Body    = $body;

        if ($errName != 'true' && $errEmail != 'true') {
            //send the message, check for errors
            if ($mail->send()) {
                $responseJson = "{ \"success\": true }";
                $responseHtmlMsg = "Submission successful!";
            } else {
                http_response_code(500);
                $responseJson = "{ error: $mail->ErrorInfo }";
                $responseHtmlMsg = "Submission failed, please try emailing us at info@farmsinternational.com.";
            }
        } else {
            http_response_code(422);
            $responseJson = "{ \"nameValidationFailed\": $errName, \"emailValidationFailed\": $errEmail }";
            if($errName === 'true'){
                $responseHtmlMsg = "Submission failed, your name was missing.";
            } else {
                $responseHtmlMsg = "Submission failed, your email address was incorrect or missing.";
            }
        }

        if(strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false){
            header('Content-Type: application/json');
            echo $responseJson;
        } else {
            header('Content-Type: text/html; charset=UTF-8');
            echo "<html><head><meta http-equiv=\"refresh\" content=\"10;url=http://www.farmsinternational.com\" /></head>".
                "<body style=\"text-align:center;\"><strong>$responseHtmlMsg</strong><br /> Redirecting to FARMS homepage in 10 seconds.<br />".
                "If not redirected, click here to contine: <a href=\"http://www.farmsinternational.com\">http://www.farmsinternational.com</a></body><html>";
        }
	}
?>
