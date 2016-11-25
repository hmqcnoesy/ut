'use strict';

function getSavedInfo() {
	if (localStorage.savedInfo) return JSON.parse(localStorage.savedInfo);
	
	var langs = tryGetLangsFromQueryString();
	
	return {
		lang1: langs.lang1,
		lang2: langs.lang2,
		book: 'welcome',
		chapterNo: 1,
		fontSize: '100%',
		verseLayout: 'side'
	};
}


function tryGetLangsFromQueryString() {
	var langs = { lang1: 'eng', lang2: 'eng' };
	
	var qs = window.location.search;
	var idx = qs.indexOf('lang1=');
	if (idx >= 0 && qs.length >= idx+9) {
		var lang1 = qs.substr(idx + 6, 3);
		if (document.querySelector('#selLang1 option[value=' + lang1 + ']')) {
			langs.lang1 = lang1;
		}
	}
	
	idx = qs.indexOf('lang2=');
	if (idx >= 0 && qs.length >= idx+9) {
		var lang2 = qs.substr(idx + 6, 3);
		if (document.querySelector('#selLang2 option[value=' + lang2 + ']')) {
			langs.lang2 = lang2;
		}
	}
	
	return langs;
}


function setSavedInfo(infoToSave) {
	var savedInfo = localStorage.savedInfo || '{}';
	savedInfo = JSON.parse(savedInfo);
	if (infoToSave.lang1) savedInfo.lang1 = infoToSave.lang1;
	if (infoToSave.lang2) savedInfo.lang2 = infoToSave.lang2;
	if (infoToSave.book) savedInfo.book = infoToSave.book;
	if (infoToSave.chapterNo) savedInfo.chapterNo = infoToSave.chapterNo;
	if (infoToSave.fontSize) savedInfo.fontSize = infoToSave.fontSize;
	if (infoToSave.verseLayout) savedInfo.verseLayout = infoToSave.verseLayout;
	localStorage.savedInfo = JSON.stringify(savedInfo);
}


function loadChapter(lang1, lang2, book, chapterNo) {	
	var ajaxCallsComplete = 0;
	
	var xhr1 = new XMLHttpRequest();
	xhr1.onreadystatechange = function() { if (xhr1.readyState == 4 && xhr1.status == 200) ajaxCallComplete(); };
	xhr1.open('GET', 'data/' + lang1 + '/' + book + '/' + chapterNo + '.json');
	xhr1.send();
	var xhr2 = new XMLHttpRequest();
	xhr2.onreadystatechange = function() { if (xhr2.readyState == 4 && xhr2.status == 200) ajaxCallComplete(); };
	xhr2.open('GET', 'data/' + lang2 + '/' + book + '/' + chapterNo + '.json');
	xhr2.send();
	
	function ajaxCallComplete() {
		ajaxCallsComplete++;
		if (ajaxCallsComplete == 2) {
			removeChapter();
			displayChapter(JSON.parse(xhr1.response), JSON.parse(xhr2.response));
			var infoToSave = {
				lang1: lang1,
				lang2: lang2,
				book: book,
				chapterNo: chapterNo
			};
			setSavedInfo(infoToSave);
			syncSettingsWithSavedInfo(infoToSave);
			updateDisplayedChapterNos();
			deactivateNavButtons();
		}
	}
}


function deactivateNavButtons() {
	document.getElementById('btnPrev').classList.remove('active');
	document.getElementById('btnNext').classList.remove('active');	
    document.querySelector('input[name=no]:checked+label').classList.remove('active');
}


function removeChapter() {
	document.getElementById('divSectionHeading').innerHTML = '';
	document.getElementById('divChapterHeading').innerHTML = '';

	var divVerses = document.getElementById('divVerses');
	if (divVerses && divVerses.firstChild) {
		divVerses.removeChild(divVerses.firstChild);
	}
}


function displayChapter(chapterLang1, chapterLang2) {
	setupNavigationButtons(chapterLang1, chapterLang2);
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
		
		if (chapterLang1.verses[i].vNo) {
			lang1VerseNo = document.createElement('span');
			lang1VerseNo.classList.add('verseNo');
			lang1VerseNo.appendChild(document.createTextNode(chapterLang1.verses[i].vNo));
			lang1Div.appendChild(lang1VerseNo);
		}
		
		if (chapterLang2.verses[i] && chapterLang2.verses[i].vNo) {
			lang2VerseNo = document.createElement('span');
			lang2VerseNo.classList.add('verseNo');
			lang2VerseNo.appendChild(document.createTextNode(chapterLang2.verses[i].vNo));
			lang2Div.appendChild(lang2VerseNo);			
		}
		
		lang1Text = document.createElement('span');
		lang1Text.classList.add('verseText');
		lang1Text.innerHTML = chapterLang1.verses[i].txt;
		if (chapterLang2.verses[i] && chapterLang2.verses[i].txt) {
			lang2Text = document.createElement('span');
			lang2Text.classList.add('verseText');
			lang2Text.innerHTML = chapterLang2.verses[i].txt;
		} else {
			lang2Text = null;
		}
		
		lang1Div.appendChild(lang1Text);
		if (lang2Text) lang2Div.appendChild(lang2Text);
		
		rowDiv.appendChild(lang1Div);
		rowDiv.appendChild(lang2Div);
		container.appendChild(rowDiv);
	}
	document.getElementById('divVerses').appendChild(container);
}


function setupNavigationButtons(chapterLang1, chapterLang2) {
	var btnPrev = document.getElementById('btnPrev');
	btnPrev.setAttribute('data-book', chapterLang1.prevAbbr);
	btnPrev.setAttribute('data-no', chapterLang1.prevNo);
	
	var btnNext =document.getElementById('btnNext');
	btnNext.setAttribute('data-book', chapterLang1.nextAbbr);
	btnNext.setAttribute('data-no', chapterLang1.nextNo);
	
	var btnNextBottom = document.getElementById('btnNextBottom');
	btnNextBottom.innerHTML = (chapterLang1.nextTitle || '') + ' &gt;&gt;';	
	btnNextBottom.setAttribute('data-book', chapterLang1.nextAbbr);
	btnNextBottom.setAttribute('data-no', chapterLang1.nextNo);
}


function displayChapterHeader(chapterLang1, chapterLang2) {
	document.getElementById('h1Title').innerHTML = chapterLang1.chapterTitle;
	document.getElementById('h2Title').innerHTML = chapterLang2.chapterTitle;
	
	var sectionHeading = document.getElementById('divSectionHeading');
	if (chapterLang1.sectionHeading || chapterLang2.sectionHeading) {
		sectionHeading.style.display = '';
		var sectionLang1 = document.createElement('div')
		sectionLang1.classList.add('lang1');
		if (chapterLang1.sectionHeading) sectionLang1.appendChild(document.createTextNode(chapterLang1.sectionHeading));
		var sectionLang2 = document.createElement('div')
		sectionLang2.classList.add('lang2');
		if (chapterLang2.sectionHeading) sectionLang2.appendChild(document.createTextNode(chapterLang2.sectionHeading));
		sectionHeading.appendChild(sectionLang1);
		sectionHeading.appendChild(sectionLang2);
	} else {
		sectionHeading.style.display = 'none';
	}
	
	var chapterHeading = document.getElementById('divChapterHeading');
	if (chapterLang1.heading || chapterLang2.heading) {
		chapterHeading.style.display = '';
		var headingLang1 = document.createElement('div')
		headingLang1.classList.add('lang1');
		if (chapterLang1.heading) headingLang1.appendChild(document.createTextNode(chapterLang1.heading));
		var headingLang2 = document.createElement('div')
		headingLang2.classList.add('lang2');
		if (chapterLang2.heading) headingLang2.appendChild(document.createTextNode(chapterLang2.heading));
		chapterHeading.appendChild(headingLang1);
		chapterHeading.appendChild(headingLang2);
	} else {
		chapterHeading.style.display = 'none';
	}
}


function syncSettingsWithSavedInfo(savedInfo) {	
	if (savedInfo && savedInfo.lang1) {
		document.getElementById('selLang1').value = savedInfo.lang1;
	}
	
	if (savedInfo && savedInfo.lang2) {
		document.getElementById('selLang2').value =  savedInfo.lang2;
	}
	
	if (savedInfo && savedInfo.book) {
		document.getElementById('selBook').value = savedInfo.book;
	}
	
	if (savedInfo && savedInfo.chapterNo) {
		document.getElementById('rb' + savedInfo.chapterNo).checked = true;
	}
}


function updateSelectedLanguages() {
	var selLang1 = document.getElementById('selLang1');
	if (selLang1.value) {
		setSavedInfo({lang1: selLang1.value});
		var books = selLang1.options[selLang1.selectedIndex].getAttribute('data-books').split(',');
		var selBook = document.getElementById('selBook');
		for (var i = 0; i < books.length; i++) {
			selBook.options[i].innerHTML = books[i];
		}
	}
	
	var selLang2 = document.getElementById('selLang2');
	if (selLang2.value) {
		setSavedInfo({lang2: selLang2.value});
	}
}


function selBookChanged() {
    updateDisplayedChapterNos();
    loadSelectedChapter();
}


function updateDisplayedChapterNos() {
	var selBook = document.getElementById('selBook');
	var chapterCount = parseInt(selBook.options[selBook.selectedIndex].getAttribute('data-chapters'));
	var chapterNoButtons = document.querySelectorAll('#tblChapterNo input[type=radio]');
	for (var i = 0; i < chapterNoButtons.length; i++) {
		if (i < chapterCount) {
			chapterNoButtons[i].parentNode.removeAttribute('style');
		} else {
			chapterNoButtons[i].parentNode.style.display = 'none';
		}
	}
	
	if (document.querySelector('#tblChapterNo input[type=radio]:checked + label').parentNode.style.display === 'none') {
		document.getElementById('rb1').checked = true;
	}
}


function setupHamburger() {
	document.getElementById("hamburger").addEventListener('click', function(e) {
		e.preventDefault();
		if (this.classList.contains('active') === true) {
			document.getElementById('divOptions').classList.remove('active');
			this.classList.remove('active');
		} else {
			this.classList.add('active');
			document.getElementById('divOptions').classList.add('active');
		}
	});
}


function chapterNumberClicked(evt) {
    if(evt.target.tagName.toUpperCase() !== 'LABEL') return;
    evt.target.classList.add('active');
	var lang1 = document.getElementById('selLang1').value;
    var lang2 = document.getElementById('selLang2').value;
    var book = document.getElementById('selBook').value;
    var chapterNo = document.getElementById(evt.target.getAttribute('for')).value;
    loadChapter(lang1, lang2, book, chapterNo);
}


function loadSelectedChapter() {
	var lang1 = document.getElementById('selLang1').value;
    var lang2 = document.getElementById('selLang2').value;
    var book = document.getElementById('selBook').value;
    var chapterNo = document.querySelector('input[name=no]:checked').value;
    console.log(lang1);
    loadChapter(lang1, lang2, book, chapterNo);
}


function toggleNavVisibility() {
	document.getElementById('divNavTab').classList.add('hidden');
	document.getElementById('divSettingsTab').classList.add('hidden');
	document.getElementById('divAboutTab').classList.add('hidden');
	
	if (document.getElementById('btnShowNav').checked) document.getElementById('divNavTab').classList.remove('hidden');
	if (document.getElementById('btnShowSettings').checked) document.getElementById('divSettingsTab').classList.remove('hidden');
	if (document.getElementById('btnShowAbout').checked) document.getElementById('divAboutTab').classList.remove('hidden');
}


function setVerseLayoutStyle(style) {
	var styleElement = document.getElementById('styleVerseLayout');
	if (style != 'side' && style != 'top' && style != 'single') style = 'side';
	
	if (style == 'side') {
		styleElement.innerHTML = '.lang1,.lang2{display:inline-block;width:50%;}';
	} else if (style == 'top') {
		styleElement.innerHTML = '.lang1,.lang2{display:block;padding-bottom: 1em;}';
	} else if (style == 'single') {
		styleElement.innerHTML = '.lang1{display:block} .lang2{display:none}';
	}
	document.getElementById('btnVerseLayout' + style).checked = true;
}

function verseLayoutOptionChanged(e) {
	if (!e.target.value) return;
	setSavedInfo({ verseLayout: e.target.value });
	setVerseLayoutStyle(e.target.value);
}


function setRowFontSizeStyle(fontSize) {
	if (!fontSize) return;
	document.getElementById('styleFontSize').innerHTML = '.lang1,.lang2{font-size:' + fontSize + '}';
	document.getElementById('btnFontSize' + fontSize).checked = true;
}


function fontSizeOptionChanged(e) {
	if (!e.target.value) return;
	setSavedInfo({ fontSize: e.target.value });
	setRowFontSizeStyle(e.target.value);
}


function setupEventHandlers() {
	document.getElementById('selLang1').addEventListener('change', updateSelectedLanguages);
	document.getElementById('selLang1').addEventListener('change', loadSelectedChapter);
	document.getElementById('selLang2').addEventListener('change', updateSelectedLanguages);
	document.getElementById('selLang2').addEventListener('change', loadSelectedChapter);
	document.getElementById('selBook').addEventListener('change', selBookChanged);
	document.getElementById('tblChapterNo').addEventListener('click', chapterNumberClicked);
	document.getElementById('btnShowNav').addEventListener('change', toggleNavVisibility);
	document.getElementById('btnShowSettings').addEventListener('change', toggleNavVisibility);
	document.getElementById('btnShowAbout').addEventListener('change', toggleNavVisibility);
	document.getElementById('divFontSizes').addEventListener('click', fontSizeOptionChanged);
	document.getElementById('divVerseLayouts').addEventListener('click', verseLayoutOptionChanged);
	
	var buttons = document.querySelectorAll('button.nav');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() {
			if (this.id === 'btnNextBottom') window.scrollTo(window.pageXOffset, 0);
			this.classList.add('active');
			var savedInfo = getSavedInfo();
			var book = this.getAttribute('data-book');
			var no = this.getAttribute('data-no');
			loadChapter(savedInfo.lang1, savedInfo.lang2, book, no);
		});
	}
}


var savedInfo = getSavedInfo();
setVerseLayoutStyle(savedInfo.verseLayout);
setRowFontSizeStyle(savedInfo.fontSize);
loadChapter(savedInfo.lang1, savedInfo.lang2, savedInfo.book, savedInfo.chapterNo);
setupEventHandlers();
setupHamburger();
syncSettingsWithSavedInfo(savedInfo);
updateSelectedLanguages();
updateDisplayedChapterNos();
