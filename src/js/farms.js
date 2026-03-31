function validateRequired(selector) {
  var requiredInputs = document.querySelectorAll('input[required]' + selector + ',textarea[required]' + selector);
  var isFormValid = true;
  $.each(requiredInputs, function (index, element) {
    if (!element.value) {
      $(element).siblings('.required-error').show();
      isFormValid = false;
    } else {
      $(element).siblings('.required-error').hide();
    }
  });
  return isFormValid;
}

$('#note').on('change keyup paste', function (event) { validateRequired('.email[name="note"]'); });
$('#email').on('change keyup paste', function (event) { validateRequired('.email[name="email"]'); });
$('#name').on('change keyup paste', function (event) { validateRequired('.mailing[name="name"]'); });
$('#mailingaddress').on('change keyup paste', function (event) { validateRequired('.mailing[name="mailingaddress"]'); });
$('#city').on('change keyup paste', function (event) { validateRequired('.mailing[name="city"]'); });
$('#state').on('change keyup paste', function (event) { validateRequired('.mailing[name="state"]'); });
$('#zip').on('change keyup paste', function (event) { validateRequired('.mailing[name="zip"]'); });
$('#country').on('change keyup paste', function (event) { validateRequired('.mailing[name="country"]'); });


var FARMS = {};

function validateEmail(event) {
  event.preventDefault();
  if (validateRequired('.email')) {
    grecaptcha.execute(FARMS.emailRecaptcha);
  }
}
function validateMailingSubscription(event) {
  event.preventDefault();
  if (validateRequired('.mailing')) {
    grecaptcha.execute(FARMS.recaptchaMailing);
  }
}
function onSubmitEmail() {
  onSubmit('#email-form')
}
function onSubmitMailing() {
  onSubmit('#mailing-form')
}
function onSubmit(selector) {
  $(selector + ' .contact-form-button-group').hide();
  $(selector + ' .contact-form-sending').show();
  $.ajax({
    url: 'contactsubmit.php',
    type: 'POST',
    data: $(selector).serialize(),
    dataType: 'json',
    success: function (result) {
      $(selector + ' .contact-form-success').show();
      setTimeout(function () {
        $(selector + ' .contact-form-success').fadeOut();
      }, 5000);
      $(selector + ' .contact-form-button-group').show();
      $(selector + ' .contact-form-sending').hide();
      $(selector)[0].reset();
    },
    error: function (response) {
      $(selector + ' .contact-form-failure').show();
      setTimeout(function () {
        $(selector + ' .contact-form-failure').fadeOut();
      }, 5000);
      $(selector + ' .contact-form-button-group').show();
      $(selector + ' .contact-form-sending').hide();
    }
  });
}

function captchaCallback() {
  FARMS.emailRecaptcha = grecaptcha.render('emailRecaptcha', {
    'sitekey': '6Lc8_TYUAAAAANc47TO81_x4gGwS8IPHQZRRAMg2',
    'callback': 'onSubmitEmail',
    'badge': 'inline',
    'size': 'invisible'
  });
  FARMS.recaptchaMailing = grecaptcha.render('recaptchaMailing', {
    'sitekey': '6Lc8_TYUAAAAANc47TO81_x4gGwS8IPHQZRRAMg2',
    'callback': 'onSubmitMailing',
    'badge': 'inline',
    'size': 'invisible'
  });
}

$('#message-submit').click(function (event) { validateEmail(event) });
$('#mc-embedded-subscribe').on('click', function(event) { 
  if ($('.mc-email').val() == undefined || $('.mc-email').val() == "") {
    $('.mc-email-error').toggle();
    return false;
  }
  return true;
});
$('#mail-submit').click(function (event) { validateMailingSubscription(event) });
// $('.country-title').textfill(100);
// window.onresize = function () { $('.country-title').textfill(100); };
$('#farmsAge').text((new Date().getFullYear()) - 1961);