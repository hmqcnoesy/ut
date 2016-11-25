# uandt.net

To add a new language:  

1. Download, process, and verify the data using the bomhog.
2. Copy the JSON data output from bomhog into `./data` in this repository.
3. Add an `<option>` for the new language to `select#selLang1` in `index.html`.
The `data-books` attribute value can be pulled from `nav.json` using.  I paste
the contents into a browsers dev tools like `var d = <pasted contents>;` and 
then `var str = '';  for (var i = 0; i < d.books.length; i++) { str += d.books[i].text + ','; }`
4. Add an `<option>` for the new language to `select#selLang2` also.