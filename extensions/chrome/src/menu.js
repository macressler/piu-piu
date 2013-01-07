var url = 'http://widgit.tk/piu-piu/';

document.getElementById( 'menuURL' ).innerHTML = chrome.i18n.getMessage( 'menu_url' );
document.getElementById( 'menuURL' ).onclick = function() { 
  chrome.tabs.getSelected( null, function( tab ) {
    window.open( url + '#URL' + escape( tab.url ) );
  } );
}
document.getElementById( 'menuManage' ).innerHTML = chrome.i18n.getMessage( 'menu_manage' );
document.getElementById( 'menuManage' ).onclick = function() { window.open( url ); }
document.getElementById( 'menuAbout' ).innerHTML = chrome.i18n.getMessage( 'menu_about' ); 
document.getElementById( 'menuAbout' ).onclick = function() { window.open( url + '#about' ); }
