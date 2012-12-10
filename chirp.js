var store = {};
var chirps = {};

var chars = [];
var tones = [];
var ids = [];

var currentChirp = '';

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
  
  chirpList();
  chirpType( document.getElementById( 'chirp_type' ) );
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

function chirpType()
{
  var list = document.getElementById( 'chirp_type' );
  if( list.options.selectedIndex == -1 ) return;
  var t = list.options[ list.options.selectedIndex ].value;
  if( t == 'text/plain' ) document.getElementById( 'chirp_edit' ).innerHTML = '<textarea id="content" rows="5" style="width: 100%;"></textarea>';
  if( t == 'text/x-url' ) document.getElementById( 'chirp_edit' ).innerHTML = '<input id="content" style="width: 100%;" value="http://" />';
}

function chirpNew()
{
  var list = document.getElementById( 'chirp_type' );
  if( list.options.selectedIndex == -1 ) return;
  var t = list.options[ list.options.selectedIndex ].value;
  if( t == 'text/plain' )
  {
    chirpOut( document.getElementById( 'content' ).value );
    document.getElementById( 'content' ).value = '';
  }
  if( t == 'text/x-url' )
  {
    chirpOut( document.getElementById( 'content' ).value, t );
    document.getElementById( 'content' ).value = 'http://';
  }
  toggle( 'create_chirp' );
  toggle( 'list' );   
  setTimeout( 'chirpList();', 500 );
  setTimeout( 'chirpList();', 1000 );
  setTimeout( 'chirpList();', 2000 );
}

function chirpList()
{
  var html = '';
  var count = 0;
  for( var i in chirps )
  {
    var chirp = chirps[ i ];
    html += '<div class="chirp" onclick="chirpView( \'' + i + '\' );">';
    html += '<input type="checkbox" id="sel_' + i + '" onclick="event.stopPropagation();" />'
    html += chirp.title;
    html += '</div>';
    count++;
  }
  if( count == 0 ) html += '<div class="chirp">You have no chirp. To begin, click "Add something to Chirp" button above.</div>';
  document.getElementById( 'list' ).innerHTML = html;
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
  if( confirm( 'Delete ' + count + ' chirps(s)?' ) )
  {
    for( var i in del )
    {
      delete chirps[ del[ i ] ];
    }
    store.set( 'chirps', JSON.stringify( chirps ) );
    setTimeout( 'chirpList();', 500 );
    setTimeout( 'chirpList();', 1000 );
    setTimeout( 'chirpList();', 2000 );    
  }
}

function chirpView( id )
{
  var chirp = chirps[ id ];
  if( typeof chirp == 'undefined' || chirp == null ) return;
  toggle( 'list' ); 
  toggle( 'view_chirp' );
  document.getElementById( 'chirp_title' ).innerHTML = chirp.title;
  document.getElementById( 'chirp_url' ).innerHTML = 'chirp.io/' + chirp.shortcode;
  if( chirp.mimetype == 'text/plain' ) document.getElementById( 'chirp_content' ).innerHTML = chirp.content.replace( /  /g, '&nbsp;&nbsp;' ).replace( /\n/g, '<br />' );
  if( chirp.mimetype == 'text/x-url' ) document.getElementById( 'chirp_content' ).innerHTML = '<a href="' + chirp.content + '" target="_blank">' + chirp.content + '</a>';
  currentChirp = id;
}

function chirpPlay()
{
  if( currentChirp == '' ) return;
  var chirp = chirps[ currentChirp ];
  if( typeof chirp == 'undefined' || chirp == null ) return;
  var audio = new Audio(); 
  audio.src = chirp.datauri;
  var dancer = new Dancer();
  dancer.waveform( document.getElementById( 'waveform' ), { strokeStyle: '#ffffff', strokeWidth: 2 } );
  dancer.load( audio );
  dancer.play();
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

function chirpOut( content, mime )
{
  var t = 'chirp';
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
  var data = { mimetype: mime, body: content, title: t };
  console.log( 'Chirp request: ' + JSON.stringify( data ) );
  xhr( 'POST', 'chirp.php', data, function( r ) {
    if( r.readyState == 4 )
    {
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
      if( chirp.is_new == 1 ) store.set( 'chirps', JSON.stringify( chirps ) ); 
      var code = 'hj' + chirp.longcode;
      var audio = new Audio(); 
      var wave = new RIFFWAVE(); 
      var data = [];
      wave.header.sampleRate = 44100; 
      wave.header.numChannels = 1; 
      var samples = parseInt( ( wave.header.sampleRate / 1000 ) * 87.2 );
      var j = 0;
      for( var n = 0; n < code.length; n++ )
      {
        var c = code.charCodeAt( n ) % 0xff;
        var i = 0;
        while (i < samples) { 
          for( var nc = 0; nc < wave.header.numChannels; nc++ ) {
            data[ j ] = 128 + Math.round( 127 * Math.cos( tones[ ids[ c ] ] * ( 2 * Math.PI ) * i / wave.header.sampleRate ) );
            j++;
            i++;
          }
        }
      }
      wave.Make( data );
      var dataURI = wave.dataURI;
      audio.src = dataURI;
      chirp.datauri = dataURI;
      chirps[ 'chirp_' + chirp.shortcode ] = chirp;      
      if( chirp.is_new == 1 ) store.set( 'chirps', JSON.stringify( chirps ) );
      var dancer = new Dancer();
      dancer.waveform( document.getElementById( 'waveform' ), { strokeStyle: '#ffffff', strokeWidth: 2 } );
      dancer.load( audio );
      dancer.play();
    }
  } );
}