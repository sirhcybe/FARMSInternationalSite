<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    include('config.php');
	$url = 'https://www.google.com/recaptcha/api/siteverify';
	$data = array(
		'secret'   => $config['recaptchaprivatekey'],
        'response' => $_POST["g-recaptcha-response"],
        'remoteip' => $_SERVER["REMOTE_ADDR"]
	);
	$options = array(
		'http' => array (
			'method'  => 'POST',
			'content' => http_build_query($data)
		)
	);
	$context = stream_context_create($options);
	$verify  = file_get_contents($url, false, $context);
    $resp    = json_decode($verify);

    if (!$resp->success) {
        $responseJson = "{ 'error' : 'Captcha Failed' }";
        $responseHtmlMsg = "Submission failed, please try emailing us at info@farmsinternational.com.";
    } else {
        // Your code here to handle a successful verification
        $name = $_POST['name'] ?? '';
        $mailingAddress = $_POST['mailingaddress'] ?? '';
        $city = $_POST['city'] ?? '';
        $state = $_POST['state'] ?? '';
        $zip = $_POST['zip'] ?? '';
        $email = $_POST['email'];
        $country = $_POST['country'] ?? '';
        $note = $_POST['note'];

        $subject = trim($note) != "" ? 'New Contact Form Submission': 'New Mail Newsletter Subscription';

        $body ="From: $name\n";
        $body .= ($email ? "Email: $email\n" : "");
        $body .= ($mailingAddress ? "Mailing Address: $mailingAddress\n" : "");
        $body .= ($city ? "City: $city\n" : "");
        $body .= ($state ? "State: $state\n" : "");
        $body .= ($zip ? "Zip: $zip\n" : "");
        $body .= ($country ? "Country: $country\n" : "");
        $body .= ($note ? "Note:\n$note" : "");

        //SMTP needs accurate times, and the PHP timezone MUST be set
        //This should be done in your php.ini, but this is how to do it if you don't have access to that
        date_default_timezone_set('Etc/UTC');

        require_once __DIR__ . '/../vendor/autoload.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer();
        //Enable SMTP debugging
        // 0 = off (for production use)
        // 1 = client messages
        // 2 = client and server messages
        // 3 = verbose debug output
        $mail->SMTPDebug = 3;
        //Ask for HTML-friendly debug output
        $mail->Debugoutput = 'html';

        // Set mailer to use SMTP
        $mail->isSMTP();  
        //Set the hostname of the mail server                                    
        $mail->Host = $config['smtpserver'];
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
        $mail->setFrom("info@farmsinternational.com", "FARMS Contact Form");
        //Set an alternative reply-to address
        $mail->addReplyTo($email, $name);
        //Set who the message is to be sent to
        $mail->addAddress($config['mailto']);
        
        $mail->Subject = $subject;
        $mail->Body = $body;

       
        if ($mail->send()) {
            echo "success";
            // $responseJson = "{ 'success': true }";
            // $responseHtmlMsg = "Submission successful!";
        } else {
            echo "error: " . $mail->ErrorInfo . "\n";
            echo "SMTPDebug output:<br>";
            // Output SMTP debug info if available
            if (isset($mail->smtp) && isset($mail->smtp->getDebugOutput)) {
                echo nl2br($mail->smtp->getDebugOutput());
            }
            // Output full mail object for inspection (remove in production)
            echo '<pre>' . print_r($mail, true) . '</pre>';
            // http_response_code(500);
            // $responseJson = "{ 'error': '" . $mail->ErrorInfo . "' }";
            // $responseHtmlMsg = "Submission failed, please try emailing us at info@farmsinternational.com.";
        }
    }

    if (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        header('Content-Type: application/json');
        // echo $responseJson;
        echo 'here';
    } else {
        header('Content-Type: text/html; charset=UTF-8');
        // echo "<html><head><meta http-equiv=\"refresh\" content=\"10;url=http://www.farmsinternational.com\" /></head>".
        // "<body style=\"text-align:center;\"><strong>$responseHtmlMsg</strong><br /> Redirecting to FARMS homepage in 10 seconds.<br />".
        // "If not redirected, click here to contine: <a href=\"http://www.farmsinternational.com\">http://www.farmsinternational.com</a></body><html>";
        echo 'no here';
    }
}
?>
