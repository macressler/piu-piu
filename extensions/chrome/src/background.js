var piupiuMenu = chrome.contextMenus.create( { title: 'piu-piu', contexts: [ 'all' ] } );
var urlMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: chrome.i18n.getMessage( 'menu_url' ), contexts: [ 'page' ], onclick: menuClick } );
var frameMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: 'Chirp frame URL', contexts: [ 'frame' ], onclick: menuClick } );
var linkMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: 'Chirp link URL', contexts: [ 'link' ], onclick: menuClick } );
var imageMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: 'Chirp image', contexts: [ 'image' ], onclick: menuClick } );
var textMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: 'Chirp selected text', contexts: [ 'selection' ], onclick: menuClick } );
var manageMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: chrome.i18n.getMessage( 'menu_manage' ), contexts: [ 'all' ], onclick: menuClick } );
var aboutMenu = chrome.contextMenus.create( { parentId: piupiuMenu, title: chrome.i18n.getMessage( 'menu_about' ), contexts: [ 'all' ], onclick: menuClick } );

function menuClick( info, tab ) {
  var url = 'http://widgit.tk/piu-piu/';
  switch( info.menuItemId ) {
    case urlMenu:
      url += '#URL' + escape( info.pageUrl );
      break;
    case frameMenu:
      url += '#URL' + escape( info.frameUrl );
      break;
    case linkMenu:
      url += '#URL' + escape( info.linkUrl );
      break;
    case imageMenu:
      url += '#IMAGE' + escape( info.srcUrl );
      break;
    case textMenu:
      url += '#TEXT' + escape( info.selectionText );
      break;
    case manageMenu:
      break;
    case aboutMenu:
      url += '#about';
      break;
    default:
      alert( 'Not supported yet!' );
      return;
  }
  window.open( url );
}