safari.application.addEventListener( 'command', menuCommand, false );
safari.application.addEventListener( 'contextmenu', menuContext, false );
safari.application.addEventListener( 'validate', menuContext, false );

var url = 'http://widgit.tk/piu-piu/';

function menuCommand( event ) {
  var cmdURL = url;
  //console.log( event );
  switch( event.command ) {
    case 'menuURL':
      cmdURL += '#URL' + escape( safari.application.activeBrowserWindow.activeTab.url );
      break;
    case 'menuManage':
      break;
    case 'menuAbout':
      cmdURL += '#about';
      break;      
    default:
      return;
  }
  safari.application.activeBrowserWindow.openTab().url = cmdURL;
}

 
function menuContext( event ) {
  //console.log( event );
  // NOT YET
  return;
  if( event.target.indentifier == 'ctxMenu' ) {
    switch( event.userInfo ) {
      case 'IMG':
        event.target.title = 'piu-piu :: chirp image';
        break;
      default:
        event.target.title = 'piu-piu :: chirp current page URL';
        break;
    }
  }
}