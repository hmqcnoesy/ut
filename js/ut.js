'use strict';

function getSavedInfo() {
	if (localStorage.savedInfo) return JSON.parse(localStorage.savedInfo);
	
	return {
		lang1: 'eng',
		lang2: 'eng',
		book: 'bofm-title',
		chapterNo: 1
	};
}


function setSavedInfo(infoToSave) {
	var savedInfo = localStorage.savedInfo || '{}';
	savedInfo = JSON.parse(savedInfo);
	if (infoToSave.lang1) savedInfo.lang1 = infoToSave.lang1;
	if (infoToSave.lang2) savedInfo.lang2 = infoToSave.lang2;
	if (infoToSave.book) savedInfo.book = infoToSave.book;
	if (infoToSave.chapterNo) savedInfo.chapterNo = infoToSave.chapterNo;
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
			updateBtnNavigateText();
			updateDisplayedChapterNos();
			deactivateNavButtons();
		}
	}
}


function deactivateNavButtons() {
	document.getElementById('btnPrev').classList.remove('active');
	document.getElementById('btnNext').classList.remove('active');	
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
		
		if (!chapterLang1.verses[i].hideNumber) {
			lang1VerseNo = document.createElement('span');
			lang1VerseNo.classList.add('verseNo');
			lang1VerseNo.appendChild(document.createTextNode(chapterLang1.verses[i].vNo));
			lang2VerseNo = document.createElement('span');
			lang2VerseNo.classList.add('verseNo');
			lang2VerseNo.appendChild(document.createTextNode(chapterLang2.verses[i].vNo));
			lang1Div.appendChild(lang1VerseNo);
			lang2Div.appendChild(lang2VerseNo);
		}
		
		lang1Text = document.createElement('span');
		lang1Text.classList.add('verseText');
		lang1Text.appendChild(document.createTextNode(chapterLang1.verses[i].txt));
		if (chapterLang2.verses[i] && chapterLang2.verses[i].txt) {
			lang2Text = document.createElement('span');
			lang2Text.classList.add('verseText');
			lang2Text.appendChild(document.createTextNode(chapterLang2.verses[i].txt));
		}
		
		lang1Div.appendChild(lang1Text);
		lang2Div.appendChild(lang2Text);
		
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
	
	updateBtnNavigateText();
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
		if (this.classList.contains('is-active') === true) {
			document.getElementById('divNav').classList.remove('is-active');
			this.classList.remove('is-active');
		} else {
			this.classList.add('is-active');
			document.getElementById('divNav').classList.add('is-active');
		}
	});
}


function updateBtnNavigateText() {
	var book = document.querySelector('#selBook option:checked');
	var chapterNo = document.querySelector('#tblChapterNo input[type=radio]:checked');
	
	if (!book || !chapterNo) return;
	
	var btn = document.getElementById('btnNavigate');
	btn.setAttribute('data-book', book.value);
	btn.setAttribute('data-no', chapterNo.value);
	btn.innerHTML = book.innerHTML + ' ' + chapterNo.value + ' &gt;&gt;';
}


function handleEvents() {
	document.getElementById('selLang1').addEventListener('change', updateSelectedLanguages);
	document.getElementById('selLang2').addEventListener('change', updateSelectedLanguages);
	document.getElementById('selBook').addEventListener('change', updateDisplayedChapterNos);
	document.getElementById('selBook').addEventListener('change', updateBtnNavigateText);
	document.getElementById('tblChapterNo').addEventListener('click', updateBtnNavigateText);
	
	var buttons = document.querySelectorAll('button.nav');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', function() {
			this.classList.add('active');
			var savedInfo = getSavedInfo();
			var book = this.getAttribute('data-book');
			var no = this.getAttribute('data-no');
			loadChapter(savedInfo.lang1, savedInfo.lang2, book, no);
			if (this.id === 'btnNextBottom') window.scrollTo(0, 0);
		});
	}
}


var savedInfo = getSavedInfo();
loadChapter(savedInfo.lang1, savedInfo.lang2, savedInfo.book, savedInfo.chapterNo);
handleEvents();
setupHamburger();
syncSettingsWithSavedInfo(savedInfo);
updateSelectedLanguages();
updateDisplayedChapterNos();
updateBtnNavigateText();