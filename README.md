# LOR-CryptoMSG

**Description**: Crypto-Messages for [Linux.Org.Ru](https://linux.org.ru)

Use this [link](http://travistidwell.com/jsencrypt/demo/index.html) to generate RS key pair.

1) Set up your private RSA key into script after it have been installed in TemperMonkey.

2) Set up your public RSA key into your profile description field on LOR like:

```
[PUBLICKEY]
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHRD82iMTlM0BQf0Rq5Al6KRX8
x4niisa/LBeGONDNY6F2whCbN1X4hvQZMxLfqi3COu0WiprgVNkSE0VISoAe3a2T
u5+knJJjOmFXchy735Fu4MUYUX4D8LxXI0xbiEeNyB9fqcQ03cwqAusttxvExgO8
C92iJ3a7BytbHlDeqwIDAQAB
-----END PUBLIC KEY-----
[/PUBLICKEY]
```

2) Set up your interlocutors' RSA keys into your profile description field on LOR like:

```
[USERKEYS]
[USERKEY user=maxcom]
-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgE8GvwA6g0U5eDhPVq20nGdYxFjv
mFtrNF7QzlLmnXQRVDeuDfWFgCzwDRruMuK+jZBxo4aqnVKH3h44iK026d1SQtgW
9qnqsXlhd4/KeDKY8pPGrPlX9bVkRXawcMPkJ3bqq1AXuVFpaJzF2xHvnpjZsN8Z
ZXhrdoRcVeTo/RSfAgMBAAE=
-----END PUBLIC KEY-----
[/USERKEY]
[/USERKEYS]
```

3) Use it!