var store = {};
var chirps = {};

var chars = [];
var tones = [];
var ids = [];

var currentChirp = '';
var chirpDataURI = '';

if( typeof console == 'undefined' || console == null )
{
  var console = { log: function( msg ) {  } };
}

window.onload = function()
{
  store = new Persist.Store( 'Chirp' );
  store.get( 'chirps', function( ok, val ) {
    if( ok ) {
      if( val == '' || val == null  || typeof val == 'undefined' ) val = '{}';
      chirps = eval( '( ' + val + ' )' );
      init();
    }
  } );
}

function init()
{
  // generate frequency table (could be hard-coded)
  
  var sfreq = 1760;
  var stone = 1.05946; 
  
  for( var i = 0; i < 10; i++ )
  {
    chars[ i ] = String.fromCharCode( 48 + i );
    ids[ 48 + i ] = i;
    tones[ i ] = parseInt( sfreq );
    sfreq *= stone;
  }
  for( var i = 10; i < 32; i++ )
  {
    chars[ i ] = String.fromCharCode( 97 + i - 10 );
    ids[ 97 + i - 10 ] = i;
    tones[ i ] = parseInt( sfreq );
    sfreq *= stone;
  }
  
  setTimeout( function() {
    chirpList();
    chirpType( document.getElementById( 'chirp_type' ) );
  }, 500 );
}

function toggle( id )
{
  var el = document.getElementById( id );
  if( el.style.display == 'block' )
  {
    el.style.display = 'none';
  }
    else
  {
    el.style.display = 'block';
  }
}

function photoUpload()
{
  document.getElementById( 'done_button' ).innerHTML = '<div class="button" style="width: 100%;">Uploading...</div>';
  var form = document.getElementById( 'chirp_form' );
  form.action = 'upload.php';
  form.target = 'upload_frame';
  form.submit();
}

function chirpPhoto( frame )
{
  if( new String( frame.contentWindow.location ).indexOf( 'upload.php' ) != -1 )
  {
    console.log( 'Upload response: ' + frame.contentWindow.document.body.innerHTML );
    var id = '';
    if( typeof frame.contentWindow.document.getElementById( 'id' ) != 'undefined' && frame.contentWindow.document.getElementById( 'id' ) != null ) id = frame.contentWindow.document.getElementById( 'id' ).innerHTML;
    if( id == '' )
    {
      alert( 'Could not upload, unsupported image format or file is too big.' );
      toggle( 'create_chirp' );
      setTimeout( function() { toggle( 'list' ); chirpList(); }, 500 );
      return;
    }
    chirpDataURI = '';
    if( typeof frame.contentWindow.document.getElementById( 'datauri' ) != 'undefined' && frame.contentWindow.document.getElementById( 'datauri' ) != null ) chirpDataURI = unescape( frame.contentWindow.document.getElementById( 'datauri' ).innerHTML );    
    chirpOut( 'http://widgit.tk/piu-piu/i/' + id + '.jpg', 'image/jpeg', function() { toggle( 'create_chirp' ); setTimeout( function() { if( chirpDataURI != '' ) { store.set( 'thumb_' + currentChirp, chirpDataURI ); chirpDataURI = ''; } toggle( 'list' ); chirpList(); }, 500 ); } );
    frame.src = 'blank.php'; 
  }
}

function chirpType()
{
  var list = document.getElementById( 'chirp_type' );
  if( list.options.selectedIndex == -1 ) return;
  var t = list.options[ list.options.selectedIndex ].value;
  if( t == 'text/plain' )
  {
    document.getElementById( 'done_button' ).innerHTML = '<div class="button" style="width: 100%;" onclick="chirpNew();">Done</div>';
    document.getElementById( 'chirp_edit' ).innerHTML = '<textarea id="content" rows="5" style="width: 100%;"></textarea>';
  }
  if( t == 'text/x-url' )
  {
    document.getElementById( 'done_button' ).innerHTML = '<div class="button" style="width: 100%;" onclick="chirpNew();">Done</div>';
    document.getElementById( 'chirp_edit' ).innerHTML = '<input id="content" style="width: 100%;" value="http://" />';
  }
  if( t == 'image/jpeg' )
  {
    document.getElementById( 'chirp_edit' ).innerHTML = '<div class="input"><input type="file" name="file" id="file" /><iframe src="blank.php" id="upload_frame" name="upload_frame" onload="chirpPhoto( this );"></iframe>';
    if( navigator.userAgent.match( /(iPad|iPhone|iPod)/i ) )  document.getElementById( 'chirp_edit' ).innerHTML += '<span id="loading"><img src="loading.gif" align="absmiddle" style="margin-right: 15px;" />Loading...</span>';
    document.getElementById( 'chirp_edit' ).innerHTML += '</div>';
    setTimeout( function() {
      document.getElementById( 'done_button' ).innerHTML = '<div class="button" style="width: 100%;" onclick="photoUpload();">Done</div>';
      if( navigator.userAgent.match( /(iPad|iPhone|iPod)/i ) ) {
        Picup2.convertFileInput( document.getElementById( 'file' ), {
          'ismultiselectforbidden': escape( 'true' ),
          'mediatypesallowed': escape( 'image' ),
          'posturl': escape( 'http://widgit.tk/piu-piu/upload.php' ),
          'returnserverresponse': escape( 'true' ),
          'callbackurl': escape( 'http://widgit.tk/piu-piu/' ),
          'referrername' : escape( 'piu-piu' ),
          'referrerfavicon' : escape( 'http://widgit.tk/piu-piu/favicon.ico' ),
          'purpose': escape( 'Upload Photo to piu-piu to chirp it' ),
          'returnthumbnaildataurl': escape( 'true' ),
        } );
        document.getElementById( 'loading' ).innerHTML = '';
        Picup2.callbackHandler = function( data ) {
          var id = '';
          chirpDataURI = '';
          for( var key in data ) {
            console.log( key + " = " + data[ key ] );
            if( unescape( key ) == 'file[0][serverResponse]' )
            {
              var html = unescape( data[ key ] );
              if( html.indexOf( '<div id="id">' ) != 1 )
              {
                id = html.substring( html.indexOf( '<div id="id">' ) + 13 );
                if( id.indexOf( '</div>' ) != -1 )
                {
                  id = id.substring( 0, id.indexOf( '</div>' ) ); 
                }
                  else
                {
                  id = '';
                }
              }
            }
            if( unescape( key ) == 'file[0][thumbnailDataURL]' ) chirpDataURI = unescape( data[ key ] );
          }
          if( id == '' )
          {
            alert( 'Could not upload, unsupported image format or file is too big.' );
            toggle( 'create_chirp' );
            setTimeout( function() { toggle( 'list' ); chirpList(); }, 500 );
            return;
          }
          window.location = '#';
          chirpOut( 'http://widgit.tk/piu-piu/i/' + id + '.jpg', 'image/jpeg', function() { toggle( 'create_chirp' ); setTimeout( function() { if( chirpDataURI != '' ) { store.set( 'thumb_' + currentChirp, chirpDataURI ); chirpDataURI = ''; } toggle( 'list' ); chirpList(); }, 500 ); } );
        }        
      }
    }, 1000 );
  }
}

function chirpNew()
{
  var list = document.getElementById( 'chirp_type' );
  if( list.options.selectedIndex == -1 ) return;
  var t = list.options[ list.options.selectedIndex ].value;
  var content = '';
  if( t == 'text/plain' )
  {
    chirpOut( document.getElementById( 'content' ).value, t, function() {  document.getElementById( 'content' ).value = ''; toggle( 'create_chirp' ); setTimeout( function() { toggle( 'list' ); chirpList(); }, 500 ); } );
  }
  if( t == 'text/x-url' )
  {
    chirpOut( document.getElementById( 'content' ).value, t, function() {  document.getElementById( 'content' ).value = 'http://'; toggle( 'create_chirp' ); setTimeout( function() { toggle( 'list' ); chirpList(); }, 500 ); } );
  }
}

function chirpList()
{
  var html = '';
  var count = 0;
  for( var i in chirps )
  {
    var now = new Date().getTime();
    var chirp = chirps[ i ];
    if( typeof chirp.title == 'undefined' || chirp.title == null || chirp.title == '' ) chirp.title = chirp.content;
    if( typeof chirp.date == 'undefined' || chirp.date == null || chirp.title == '' ) chirp.date = now;
    var d = new Date();
    d.setTime( chirp.date );
    var d_txt = d;
    if( d.getTime() == now ) d_txt = 'Unknow date-time';
    var ico = 'ico_' + chirp.mimetype.replace( '/', '_' ) + '.png';
    html += '<div class="chirp" onclick="chirpView( \'' + i + '\' );" style="height: 32px;">';
    html += '<div style="float: left; width: 32px; height: 32px;"><input style="width: 24px; height: 24px;" type="checkbox" id="sel_' + i + '" onclick="try { event.stopPropagation(); } catch( e ) { event.cancelBubble = true; }" /></div>'
    html += '<div style="float: left; width: 32px; height: 32px;"><img id="ico_' + i + '" src="' + ico + '" width="32" height="32"" /></div>';
    html += '<div style="float: left; margin-left: 15px;">';
    html += '<b style="text-shadow: 1px 1px 1px white;">' + chirp.title + '</b><br />';
    html += '<font style="font-size: 10pt; color: #999999; font-weight: normal;">' + d_txt + '</font>';
    html += '</div>';
    html += '</div>';
    count++;
  }
  if( count == 0 ) html += '<div class="chirp">You have no chirp. To begin, click "Add something to Chirp" button above.</div>';
  document.getElementById( 'list' ).innerHTML = html;
  setTimeout( function() {
    for( var i in chirps )
    {
      var ico = document.getElementById( 'ico_' + i );
      ico.style.border = 'none 1px'
      store.get( 'thumb_' + i, function( ok, val ) {
        if( ok ) {
          ico.src = val;
          ico.className = 'ico';
        }
      } );
    }
  }, 500 );
}

function chirpDel()
{
  var del = [];
  var count = 0;
  for( var i in chirps )
  {
    var el = document.getElementById( 'sel_' + i );
    if( el.checked )
    {
      del[ count ] = i;
      count++;
    }
  }
  if( count == 0 )
  {
    alert( 'No chirp selected!' );
    return;
  }
  if( confirm( 'Delete ' + count + ' chirp' + ( ( count > 1 ) ? 's' : '' ) + '?\n\nThis can\'t be canceled after confirmation.' ) )
  {
    for( var i in del )
    {
      delete chirps[ del[ i ] ];
    }
    store.set( 'chirps', JSON.stringify( chirps ) );
    setTimeout( 'chirpList();', 500 );
  }
}

function chirpView( id )
{
  var chirp = chirps[ id ];
  if( typeof chirp == 'undefined' || chirp == null ) return;
  toggle( 'list' ); 
  toggle( 'view_chirp' );
  if( typeof chirp.title == 'undefined' || chirp.title == null ) chirp.title = chirp.content;
  document.getElementById( 'chirp_title' ).innerHTML = chirp.title;
  document.getElementById( 'chirp_url' ).innerHTML = 'chirp.io/' + chirp.shortcode;
  if( chirp.mimetype == 'text/plain' ) document.getElementById( 'chirp_content' ).innerHTML = chirp.content.replace( /  /g, '&nbsp;&nbsp;' ).replace( /\n/g, '<br />' );
  if( chirp.mimetype == 'text/x-url' ) document.getElementById( 'chirp_content' ).innerHTML = '<a style="color: blue;" href="' + chirp.content + '" target="_blank">' + chirp.content + '</a>';
  if( chirp.mimetype == 'image/jpeg' )
  {
    document.getElementById( 'chirp_content' ).innerHTML = '<img id="content_image" src="' + chirp.content + '" width="100%" />';
    setTimeout( function() {
      document.getElementById( 'content_image' ).onerror = function() { document.getElementById( 'content_image' ).src = 'err.png'; }
    }, 500 );
  }
  currentChirp = id;
  if( navigator.userAgent.match( /(iPad|iPhone|iPod|Android)/i ) ) 
  {
    document.getElementById( 'play_button' ).innerHTML = '<div class="button" style="width: 100%;">Loading...</div>';
    store.get( 'datauri_' + chirp.shortcode, function( ok, val ) {
      if( ok ) {
        xhr( 'POST', 'audio_old.php', 'datauri=' + escape( val ), function( r ) {
          if( r.readyState == 4 ) {
            console.log( 'Old sound id: ' + r.responseText );
            setTimeout( function() {
              var html = '';
              html += '<div type="button" class="button" style="width: 100%;" onclick="var audio = document.getElementById( \'audio_old\' ); audio.load(); audio.play();">Chirp!</div>';
              html += '<audio id="audio_old" src="tmp/' + r.responseText + '.wav" controls="controls"></audio>';
              document.getElementById( 'play_button' ).innerHTML = html;
            }, 500 );
          }         
        } );        
      }
    } );
  }
}

function chirpPlay()
{
  if( currentChirp == '' ) return;
  var chirp = chirps[ currentChirp ];
  if( typeof chirp == 'undefined' || chirp == null ) return;
  store.get( 'datauri_' + chirp.shortcode, function( ok, val ) {
    if( ok ) {
      try
      {
        var audio = new Audio();       
        audio.src = val;
        try
        {
          var dancer = new Dancer();
          dancer.waveform( document.getElementById( 'waveform' ), { strokeStyle: '#ffffff', strokeWidth: 2 } );
          dancer.load( audio );
          dancer.play();           
        }
          catch( e2 )
        {
          audio.play();
        }          
      }
        catch( e )
      {
        xhr( 'POST', 'audio_old.php', 'datauri=' + escape( val ), function( r ) {
          if( r.readyState == 4 ) {
            setTimeout( function() {
              // flash fallback
              var so = new SWFObject( 'WAVPlayerProject.swf', 'WAVPlayerProject', '425', '32', '9', '#000000' );
              so.addVariable( 'sound_url', 'tmp/' + r.responseText + '.wav' );
              so.write( 'waveform_container' );
            }, 500 );
          }         
        } );          
      }
    }
  } );
}

function xhr( method, url, data, callback )
{
  var req = null;
  if( window.XMLHttpRequest ) req = new XMLHttpRequest();
  if( window.ActiveXObject )
  {
    var names =
    [
      'Msxml2.XMLHTTP.6.0',
      'Msxml2.XMLHTTP.3.0',
      'Msxml2.XMLHTTP',
      'Microsoft.XMLHTTP'
    ];
    for( var i in names )
    {
      try{ req = new ActiveXObject( names[ i ] ); }
      catch( e ){}
    }
  }
  if( req == null ) return;
  req.open( method, url ,true );
  if( method == 'POST' ) req.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
  if( typeof data == 'object' ) data = 'json=' + escape( JSON.stringify( data ) );
  req.onreadystatechange = function() { callback( req ); }  
  req.send( data );
}

function chirpOut( content, mime, callback )
{
  var t = 'chirp';
  if( typeof mime == 'undefined' || mime == null ) mime = 'text/plain';
  var data = {};
  if( mime == 'text/plain' )
  {
    var parts = content.split( '\n' );
    var t = parts[ 0 ].substring( 0, 47 );
    if( parts[ 0 ].length > 47 ) t += '...';
    if( content.length > 252 ) content = content.substring( 0, 252 ) + '...';
    data = { mimetype: mime, body: content, title: t };  
  }
  if( mime == 'text/x-url' )
  {
    var a = document.createElement( 'a' );
    a.setAttribute( 'href', content );
    t = new String( a.href );
    t = t.replace( a.pathname, '' );
    t = t.replace( 'http:', '' );
    t = t.replace( 'https:', '' );
    t = t.replace( '/', '' );
    //t = t + ' ' + new String( a.pathname ).replace( /[^a-zA-Z0-9]/g, ' ' );
    t = t.replace( '/', '' );
    data = { mimetype: mime, url: content, title: t };
  }
  if( mime == 'image/jpeg' )
  {
    t = 'Photo';
    data = { mimetype: mime, url: content, title: t };
  }
  console.log( 'Chirp request: ' + JSON.stringify( data ) );
  xhr( 'POST', 'chirp.php', data, function( r ) {
    if( r.readyState == 4 )
    {
      var t = 'chirp'; // to be fixed
      if( typeof mime == 'undefined' || mime == null ) mime = 'text/plain';
      if( mime == 'text/plain' )
      {
        var parts = content.split( '\n' );
        var t = parts[ 0 ].substring( 0, 47 );
        if( parts[ 0 ].length > 47 ) t += '...';
        if( content.length > 252 ) content = content.substring( 0, 252 ) + '...';
      }
      if( mime == 'text/x-url' )
      {
        var a = document.createElement( 'a' );
        a.setAttribute( 'href', content );
        t = new String( a.href );
        t = t.replace( a.pathname, '' );
        t = t.replace( 'http:', '' );
        t = t.replace( 'https:', '' );
        t = t.replace( '/', '' );
        //t = t + ' ' + new String( a.pathname ).replace( /[^a-zA-Z0-9]/g, ' ' );
        t = t.replace( '/', '' );
      }
      if( mime == 'image/jpeg' )
      {
        t = 'Photo';
      }
      var json = r.responseText;
      console.log( 'Chirp response: ' + json );
      if( json == '' || json.substring( 0, 1 ) != '{' )
      {
        alert( 'ERROR: ' + json );
        return;
      }
      var chirp = eval( '( ' + json + ' )' );
      chirp.mimetype = mime;
      chirp.content = content;
      chirp.title = t;
      chirp.date = new Date().getTime();
      currentChirp = 'chirp_' + chirp.shortcode;
      chirps[ currentChirp ] = chirp;
      store.set( 'chirps', JSON.stringify( chirps ) );
      var code = 'hj' + chirp.longcode;
      var wave = new RIFFWAVE(); 
      var data = [];
      wave.header.sampleRate = 44100; 
      wave.header.numChannels = 1; 
      var samples = parseInt( ( wave.header.sampleRate / 1000 ) * 87.2 ) * wave.header.numChannels;
      var j = 0;
      for( var n = 0; n < code.length; n++ )
      {
        var c = code.charCodeAt( n ) % 0xff;
        var i = 0;
        while (i < samples) { 
          for( var nc = 0; nc < wave.header.numChannels; nc++ ) {
            var t = i / wave.header.sampleRate;
            data[ j ] = 128 + Math.round( 127 * Math.cos( tones[ ids[ c ] ] * ( 2 * Math.PI ) * t ) );
            data[ j ] *= ( 1 - t );
            j++;
            i++;
          }
        }
      }
      wave.Make( data );
      var dataURI = wave.dataURI;
      try
      {
        var audio = new Audio();       
        audio.src = dataURI;
        try
        {
          var dancer = new Dancer();
          dancer.waveform( document.getElementById( 'waveform' ), { strokeStyle: '#ffffff', strokeWidth: 2 } );
          dancer.load( audio );
          dancer.play();           
        }
          catch( e )
        {
          audio.play();
        }
      }
      catch( e )
      {
        console.log( e );
        xhr( 'POST', 'audio_old.php', 'datauri=' + escape( dataURI ), function( r ) {
          if( r.readyState == 4 ) {
            var so = new SWFObject( 'WAVPlayerProject.swf', 'WAVPlayerProject', '425', '32', '9', '#000000' );
            so.addVariable( 'sound_url', 'tmp/' + r.responseText + '.wav' );
            so.write( 'waveform_container' );
          }         
        } );
      }
      if( chirp.is_new == 1 ) store.set( 'datauri_' + chirp.shortcode, dataURI );
      setTimeout( callback, 1500 );
      if( navigator.userAgent.match( /(iPad|iPhone|iPod|Android)/i ) ) setTimeout( function() { chirpView(); }, 2000 );
    }
  } );
}