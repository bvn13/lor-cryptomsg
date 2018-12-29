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
MIICWwIBAAKBgQDHRD82iMTlM0BQf0Rq5Al6KRX8x4niisa/LBeGONDNY6F2whCb
N1X4hvQZMxLfqi3COu0WiprgVNkSE0VISoAe3a2Tu5+knJJjOmFXchy735Fu4MUY
UX4D8LxXI0xbiEeNyB9fqcQ03cwqAusttxvExgO8C92iJ3a7BytbHlDeqwIDAQAB
AoGAdcMshIMhsb6vNKNyAKXRwANF/kTChUK0oEhjgqxTIf7ObovUGpcCVMUUv0vC
zLIbJt2CPj8dtpQOUTNYT5fPzOLmi1i1V5U1yR+o8R7vh4yFdQUN6m4rSU47fjOV
QeFRkPxtffAxt+o+RxIMhuZ6GOI1tAqlGXcC/qIhMjijvBkCQQDpOMX86KOwzn3e
KgzU2cylkT8deNtlaBDloX059kfAB/9mUM2tXc78pPNcdqBkzCJ2Pq6s0586ZDfJ
Z9gr2YU3AkEA2rp+ocQ25g8Bm2rcmnfGmLDuyvcpUuvUTFtrHoqOH7K6YgCGHfP7
xIuPTBjKPje2DzBszmlXoOfh6uzyAsksLQJAHdT8Rlh/r7sKEKPyVjux2K/Wke+G
qNcB6k2Y1hQxo1eijLTjSjzIoDp9QqON6rbN5bAo6cR8Bp0RIbsdxKYjSwJAZAVe
PPkuJZv9HyYJxTU6gr5+JCBMLFgdV+GCJZA0l7gyVPhqXC4jFmi/WYwIh9UQEvgQ
+X7gjHsdK0G5FZ8K7QJAc17hFMU6eQKJcufH7zDTzCJ6I45dS6oKywxVh/v6t1P5
d8W1OZtjDjoVj0X2shvBtc/kVDGI176rothpYJU0WA==
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
            var encryptedRegexp = /(\[ENCRYPTED\](.+?)\[\/ENCRYPTED\])/mig;
            var regexp;

            Array.prototype.forEach.call(msg, function(p) {
                var msg = p.innerText;

                for (var res = encryptedRegexp.exec(msg); res; res = encryptedRegexp.exec(msg)) {

                    var encMsg = res[2];
                    var decrypt = new JSEncrypt.JSEncrypt();
                    decrypt.setPrivateKey(privateKey);
                    var decryptedMsg = decrypt.decrypt(encMsg);
                    if (decryptedMsg) {
                        msg = msg.replace(res[1], '[DECRYPTED]'+decryptedMsg+'[/DECRYTED]');
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

        $.get('https://linux.org.ru/people/'+_username+'/profile', function(data) {
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
