# Mongoose Jumblator

A node.js module for encrypting Mongoose fields using AES.

## WELCOME TESTERS!

To test this unpublished plugin, simply create a schema. Then hook the plugin to it. The plugin options are:

- keySize --- Size of your key, defaults to 256
- keySalt --- salt for key generation, defaults to some lame value
- seed --- seed for creating the initial value hash, defaults to some extremely lame value.
- encoding --- encoding for the ciphertext, defaults to Hex. Can be Base64, Utf8, Utf16, or Hex.
- length --- length of the initial value, defautls to 512

If a field is indicated by "encrypt: true", it will be encrypted. If it's also indicated by "searchable: true", then it can be searched. Otherwise it can't be searched. Everything works the same. No need to change any queries or updates.

Mocha and Chai are ready to be served by me your faithful barista. Or you can forgo testing frameworsk and do it old style. You're the tester!

If you had any problems, contact me on Discord@Chubak#7400 or better yet, fork the repo, and open up an issue!
