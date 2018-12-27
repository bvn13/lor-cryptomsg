// ==UserScript==
// @name       CryptoMessages for LOR
// @namespace  ru.bvn13.lor.cryptomsg
// @version    0.1
// @description  Brings private dialogs for LOR
// @include     https://www.linux.org.ru/*
// @grant       none
// @copyright  2018+, bvn13
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @require http://travistidwell.com/jsencrypt/bin/jsencrypt.js
// ==/UserScript==

(function() {


    var publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
gwQco1KRMDSmXSMkDwIDAQAB
-----END PUBLIC KEY-----`;

    var privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ
WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR
aY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB
AoGAfY9LpnuWK5Bs50UVep5c93SJdUi82u7yMx4iHFMc/Z2hfenfYEzu+57fI4fv
xTQ//5DbzRR/XKb8ulNv6+CHyPF31xk7YOBfkGI8qjLoq06V+FyBfDSwL8KbLyeH
m7KUZnLNQbk8yGLzB3iYKkRHlmUanQGaNMIJziWOkN+N9dECQQD0ONYRNZeuM8zd
8XJTSdcIX4a3gy3GGCJxOzv16XHxD03GW6UNLmfPwenKu+cdrQeaqEixrCejXdAF
z/7+BSMpAkEA8EaSOeP5Xr3ZrbiKzi6TGMwHMvC7HdJxaBJbVRfApFrE0/mPwmP5
rN7QwjrMY+0+AbXcm8mRQyQ1+IGEembsdwJBAN6az8Rv7QnD/YBvi52POIlRSSIM
V7SwWvSK4WSMnGb1ZBbhgdg57DXaspcwHsFV7hByQ5BvMtIduHcT14ECfcECQATe
aTgjFnqE/lQ22Rk0eGaYO80cc643BXVGafNfd9fcvwBMnk0iGX0XRsOozVt5Azil
psLBYuApa66NcVHJpCECQQDTjI2AQhFc1yRnCU/YgDnSpJVm1nASoRUnU8Jfm3Oz
uku7JUXcVpt08DFSceCEX9unCuMcT72rAQlLpdZir876
-----END RSA PRIVATE KEY-----`;

    var encryptedRegexp = /\[ENCRYPTED\]([\s\S]+)\[\/ENCRYPTED\]/mgi;

    var insertText = function(textarea, text) {

        var startPos = textarea.selectionStart;
        var endPos = textarea.selectionEnd;

        textarea.value = textarea.value.substring(0, startPos)
            + '\n\n' + text + '\n\n'
            + textarea.value.substring(endPos, textarea.value.length);

        textarea.selectionStart = startPos + text.length;
        textarea.selectionEnd = startPos + text.length;

    }

    var decryptFn = function(messageTag) {

        var msg = messageTag.querySelectorAll('p');

        if (msg && msg.length)  {

            Array.prototype.forEach.call(msg, function(p) {
                var msg = p.innerText;
                if (msg.trim() != '' && encryptedRegexp.test(msg)) {

                    msg = msg.replace(encryptedRegexp, '$1').trim();

                    var decrypt = new JSEncrypt.JSEncrypt();
                    decrypt.setPrivateKey(privateKey);

                    var decryptedMsg = decrypt.decrypt(msg);
                    p.innerText = '[DECRYPTED]'+decryptedMsg+'[/DECRYTED]';
                }
            });
        }
    }

    var insertEncryptButton = function(textarea) {

        var button = document.createElement('input');
        button.type = 'button';
        button.value = 'Encrypt it!';
        textarea.parentNode.insertBefore(button, textarea.nextSibling);

        button.addEventListener('click', function() {

            var startPos = textarea.selectionStart;
            var endPos = textarea.selectionEnd;
            var msg = textarea.value.substring(startPos, endPos);

            if (msg.trim() == '') {
                alert('Nothing to encrypt! Please select text.');
                return;
            }

            var encrypt = new JSEncrypt.JSEncrypt();
            encrypt.setPublicKey(publicKey);

            var encryptedMsg = encrypt.encrypt(msg);
            insertText(textarea, '\n\n[ENCRYPTED]' + encryptedMsg + '[/ENCRYPTED]\n\n');

        });

        var description = document.createElement('div');
        description.innerHTML = 'Зашифровать выделенный текст';
        textarea.parentNode.insertBefore(description, button);

    }


    window.addEventListener('load', function() {

        //loadProto(function() {
            console.log("JSEncrypt has been loaded");

            //autodecrypt
            var messages = $('.msg_body');
            if (messages && messages.length) {
                Array.prototype.forEach.call(messages, decryptFn);
            }

            //create Encrypt button
            var textareas = document.getElementsByTagName('textarea');
            if (textareas && textareas.length) {
                Array.prototype.forEach.call(textareas, insertEncryptButton);
            }

        //});


    });

})();
