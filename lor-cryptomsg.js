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

    var _username = '';
    var _keyset = [];
    var publicKey = '';

/*
    var publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
gwQco1KRMDSmXSMkDwIDAQAB
-----END PUBLIC KEY-----`;
*/


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

    var getAllowedUsers = function() {
        var users = [];
        if (_keyset) {
            for (var userkey in _keyset) {
                if (!users[_keyset[userkey]['user']]) {
                    users.push(_keyset[userkey]['user']);
                }
            }
        }
        return users;
    }

    var getUserKey = function(user) {

        for (var userkey in _keyset) {
            if (_keyset[userkey]['user'] && _keyset[userkey]['user'] === user) {
                return _keyset[userkey]['key'];
            }
        }

        return '';

    }

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
        var author = $(messageTag).find('.sign a[itemprop="creator"]').text();

        if (msg && msg.length && author.trim() != '')  {
            var encryptedRegexp = /(\[ENCRYPTED\][\s\S]+\[\/ENCRYPTED\])+?/mi;
            var encryptedMsgRegexp = /\[ENCRYPTED\]([\s\S]+)\[\/ENCRYPTED\]/mi;

            Array.prototype.forEach.call(msg, function(p) {
                var msg = p.innerText;
                if (msg.trim() != '' && encryptedRegexp.test(msg)) {

                    var result = msg.match(encryptedRegexp);
                    if (result && result.length >= 1) {

                        for (var i=1; i<result.length; i++) {
                            var encBlock = result[i];

                            if (encBlock && encryptedMsgRegexp.test(encBlock)) {
                                var resultMsg = encBlock.match(encryptedMsgRegexp);

                                if (resultMsg && resultMsg.length) {
                                    var decrypt = new JSEncrypt.JSEncrypt();
                                    decrypt.setPrivateKey(privateKey);

                                    var decryptedMsg = decrypt.decrypt(resultMsg[1]);
                                    msg = msg.replace(encBlock, '[DECRYPTED]'+decryptedMsg+'[/DECRYTED]');
                                }

                            }
                        }

                    }

                }
                p.innerText = msg;
            });
        }
    }

    var insertEncryptButton = function(textarea) {

        var users = getAllowedUsers();
        if (users && users.length) {

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

                var userTag = document.getElementById("userCrypt");
                var user = userTag.options[userTag.selectedIndex].value;

                var userkey = getUserKey(user);
                if (userkey.trim() == '') {
                    alert('You have not public key for user: '+user);
                    return;
                }

                var encrypt = new JSEncrypt.JSEncrypt();
                encrypt.setPublicKey(userkey.trim());
                var encryptMy = new JSEncrypt.JSEncrypt();
                encryptMy.setPublicKey(publicKey.trim());

                var encryptedMsg = encrypt.encrypt(msg);
                var encryptedMsgMy = encryptMy.encrypt(msg);
                insertText(textarea, '[ENCRYPTED]' + encryptedMsg + '[/ENCRYPTED]' + '[ENCRYPTED]' + encryptedMsgMy + '[/ENCRYPTED]');

            });

            var space = document.createElement("span");
            space.innerHTML = '&nbsp;';
            textarea.parentNode.insertBefore(space, button);

            //Create and append select list
            var selectList = document.createElement("select");
            selectList.id = "userCrypt";
            textarea.parentNode.insertBefore(selectList, space);
            //Create and append the options
            for (var i = 0; i < users.length; i++) {
                var option = document.createElement("option");
                option.value = users[i];
                option.text = users[i];
                selectList.appendChild(option);
            }

            var description = document.createElement('div');
            description.innerHTML = 'Зашифровать выделенный текст';
            textarea.parentNode.insertBefore(description, selectList);

        }
    }


    var checkLoggedIn = function(callback) {
        var regmenu = $('#regmenu');
        if (regmenu && regmenu.length) {
            _username = '';
            return;
        }
        var login = $('#loginGreating a').text();
        if (login.trim() != '' && login.trim() != 'РегистрацияВход') {
            _username = login.trim();
            if (callback) {
                callback();
            }
        }
    }

    var readMyKeyset = function(callback) {
        _keyset = [];

        $.get('http://127.0.0.1:8080/people/'+_username+'/profile', function(data) {
            var regexpKeysetMy = /\[PUBLICKEY\]([\s\S]+)\[\/PUBLICKEY\]/mi;
            var regexpKeyset = /\[USERKEYS\]([\s\S]+)\[\/USERKEYS\]/mgi;
            var regexpKey = /\[USERKEY user=(\w+)\]([\s\S]+)\[\/USERKEY\]/mi;

            if (regexpKeysetMy.test(data)) {
                var resultPublicKey = data.match(regexpKeysetMy);
                if (resultPublicKey && resultPublicKey.length) {
                    publicKey = resultPublicKey[1];
                }
            }

            if (regexpKeyset.test(data)) {
                var resultKeyset = data.match(regexpKeyset);
                if (resultKeyset && resultKeyset.length) {
                    var keyset = resultKeyset[0];
                    if (regexpKey.test(keyset)) {
                        var resultKeys = keyset.match(regexpKey);
                        while (resultKeys && resultKeys.length > 1) {
                            _keyset.push({
                                'user' : resultKeys[1],
                                'key' : resultKeys[2]
                            });
                            keyset = keyset.replace(resultKeys[0], '');
                            resultKeys = keyset.match(regexpKey);
                        }
                        if (callback) {
                            callback();
                        }
                    }
                }
            }
        });
    }

    var insertAllButtons = function() {

        //create Encrypt button
        var textareas = document.getElementsByTagName('textarea');
        if (textareas && textareas.length) {
            Array.prototype.forEach.call(textareas, insertEncryptButton);
        }

    }


    window.addEventListener('load', function() {

        checkLoggedIn(function() {

            readMyKeyset(insertAllButtons);

            //autodecrypt
            var messages = $('.msg_body');
            if (messages && messages.length) {
                Array.prototype.forEach.call(messages, decryptFn);
            }

        });

    });

})();
