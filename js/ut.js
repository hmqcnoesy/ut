function loadChapter(lang1, lang2, book, chapterNumber) {
	var ajaxCallsComplete = 0;
	
	removeChapter();
	var xhr1 = new XMLHttpRequest();
	xhr1.onreadystatechange = function() { if (xhr1.readyState == 4 && xhr1.status == 200) ajaxCallComplete(); };
	xhr1.open('GET', 'data/' + lang1 + '/' + book + '/' + chapterNumber + '.json');
	xhr1.send();
	var xhr2 = new XMLHttpRequest();
	xhr2.onreadystatechange = function() { if (xhr2.readyState == 4 && xhr2.status == 200) ajaxCallComplete(); };
	xhr2.open('GET', 'data/' + lang2 + '/' + book + '/' + chapterNumber + '.json');
	xhr2.send();
	
	function ajaxCallComplete() {
		ajaxCallsComplete++;
		if (ajaxCallsComplete == 2) displayChapter(JSON.parse(xhr1.response), JSON.parse(xhr2.response));
	}
}


function removeChapter() {
	document.getElementById('h1Title').innerHTML = '';
	document.getElementById('h2Title').innerHTML = '';

	document.getElementById('divSectionHeading').innerHTML = '';
	document.getElementById('divChapterHeading').innerHTML = '';

	var divVerses = document.getElementById('divVerses');
	if (divVerses && divVerses.firstChild) {
		divVerses.removeChild(divVerses.firstChild);
	}
}


function displayChapter(chapterLang1, chapterLang2) {
	displayChapterHeader(chapterLang1, chapterLang2);
		
	var container = document.createElement('div');
	container.setAttribute('id', 'divContainer');
	
	var rowDiv, lang1Div, lang1VerseNo, lang1Text, lang2Div, lang2VerseNo, lang2Text;
	for (var i = 0; i < chapterLang1.verses.length; i++) {
		rowDiv = document.createElement('div');
		rowDiv.classList.add('row');
		rowDiv.setAttribute('id', 'row' + i);
		
		lang1Div = document.createElement('div');
		lang1Div.classList.add('lang1');
		lang2Div = document.createElement('div');
		lang2Div.classList.add('lang2');
		
		lang1VerseNo = document.createElement('span');
		lang1VerseNo.classList.add('verseNo');
		lang1VerseNo.appendChild(document.createTextNode(chapterLang1.verses[i].vNo));
		lang2VerseNo = document.createElement('span');
		lang2VerseNo.classList.add('verseNo');
		lang2VerseNo.appendChild(document.createTextNode(chapterLang2.verses[i].vNo));
		
		lang1Div.appendChild(lang1VerseNo);
		lang2Div.appendChild(lang2VerseNo);
		
		lang1Text = document.createElement('span');
		lang1Text.classList.add('verseText');
		lang1Text.appendChild(document.createTextNode(chapterLang1.verses[i].txt));
		lang2Text = document.createElement('span');
		lang2Text.classList.add('verseText');
		lang2Text.appendChild(document.createTextNode(chapterLang2.verses[i].txt));
		
		lang1Div.appendChild(lang1Text);
		lang2Div.appendChild(lang2Text);
		
		rowDiv.appendChild(lang1Div);
		rowDiv.appendChild(lang2Div);
		container.appendChild(rowDiv);
	}
	document.getElementById('divVerses').appendChild(container);
	document.getElementById('btnNextBottom').innerHTML = chapterLang1.nextTitle;	
}


function displayChapterHeader(chapterLang1, chapterLang2) {
	
	document.getElementById('h1Title').innerHTML = chapterLang1.chapterTitle;
	document.getElementById('h2Title').innerHTML = chapterLang2.chapterTitle;
	
	var sectionHeading = document.getElementById('divSectionHeading');
	var sectionLang1 = document.createElement('div')
	sectionLang1.classList.add('lang1');
	if (chapterLang1.sectionHeading) sectionLang1.appendChild(document.createTextNode(chapterLang1.sectionHeading));
	var sectionLang2 = document.createElement('div')
	sectionLang2.classList.add('lang2');
	if (chapterLang2.sectionHeading) sectionLang2.appendChild(document.createTextNode(chapterLang2.sectionHeading));
	sectionHeading.appendChild(sectionLang1);
	sectionHeading.appendChild(sectionLang2);
	
	var chapterHeading = document.getElementById('divChapterHeading');
	var headingLang1 = document.createElement('div')
	headingLang1.classList.add('lang1');
	if (chapterLang1.heading) headingLang1.appendChild(document.createTextNode(chapterLang1.heading));
	var headingLang2 = document.createElement('div')
	headingLang2.classList.add('lang2');
	if (chapterLang2.heading) headingLang2.appendChild(document.createTextNode(chapterLang2.heading));
	chapterHeading.appendChild(headingLang1);
	chapterHeading.appendChild(headingLang2);
}

loadChapter('rus', 'eng', '1-ne', 1);