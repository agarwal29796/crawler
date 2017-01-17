var express = require('express'); 
var request = require('request') ; 
var cheerio = require('cheerio') ; 
var URL = require('url-parse') ; 
var bodyParser = require('body-parser');
var q = require('q') ; 
var fs = require('fs') ;
var i = 0 ; 
var searchData = '' ; 
var finalArray = [] ; 
//************************************************
var absoluteLinks = [] ;  

var app = express() ;
app.use(express.static('./')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//-----------------------------------------------------------
function collectInternalLink($){
var defered = q.defer() ; 
var allAbsoluteLinks = [] ; 
var al = $('div #ires a') ; 
al.each(function(){
var temp = $(this).attr('href').split('q=')[1].split('&')[0];
//======================================================================WIKI LINKS ONLY
var temp1 = temp.split('.org')[0]; 
if(temp1 == 'https://en.wikipedia') 
{
temp = decodeURIComponent(temp) ;
allAbsoluteLinks.push(temp) ;	
}
//========================================================================
}); 
console.log('1 more request \n \n') ;
console.log(allAbsoluteLinks) ;	
if(allAbsoluteLinks.length !== 0){
getReferences(allAbsoluteLinks).then(function(result){

 defered.resolve({links : allAbsoluteLinks , references : result}) ;
});
} 
return defered.promise ; 
}
//=====================================================================
var getReferences = function(links){
var defered = q.defer() ; 	
console.log('==========in the reference section\n'); 
var referencesArray = [] ;
var refLength = 0  ; 

links.forEach(function(link){ 
console.log(refLength + " -> ========== reference url is \n" + link); 
request(link , function(error , response , body){
if(error){console.log("Error" + error) ; }http://localhost:3000/%5E%20See%20F.%20Simons,%20%22Proto-Sinaitic%20%E2%80%94%20Progenitor%20of%20the%20Alphabet%22%20Rosetta%209%20(2011):%20Figure%20Two:%20%22Representative%20selection%20of%20proto-Sinaitic%20characters%20with%20comparison%20to%20Egyptian%20hieroglyphs%22,%20(p.%2038)%20Figure%20Three:%20%22Chart%20of%20all%20early%20proto-Canaanite%20letters%20with%20comparison%20to%20proto-Sinaitic%20signs%22%20(p.%2039),%20Figure%20Four:%20%22Representative%20selection%20of%20later%20proto-Canaanite%20letters%20with%20comparison%20to%20early%20proto-Canaanite%20and%20proto-Sinaitic%20signs%22%20(p.%2040).%20See%20also:%20Goldwasser%20(2010),%20following%20Albright%20(1966),%20%22Schematic%20Table%20of%20Proto-Sinaitic%20Characters%22%20(fig.%201).
if(!response){console.log('no response') ; }
else{
var $ = cheerio.load(body) ; 
collectReferenceLink($).then(function(result){
refLength++ ;	
referencesArray = referencesArray.concat(result) ;

if(refLength === links.length){	
console.log('referenceArrayLength is ' + referencesArray.length+ ' now \n') ;
finalArray = referencesArray ; 	
defered.resolve(referencesArray) ;
} 

});	
}
}); 

})  ; 
return defered.promise ; 
}
//=====================================================================
var collectReferenceLink = function($){
var defered = q.defer() ; 	
var al = $('ol.references li'); 
var tempArray = [] ; 
al.each(function(){
var temp = $(this).find('a');
temp.each(function(){
var temp1 = $(this).attr('href'); 
var temp1_data = $(this).text() ;
if(temp1.indexOf('#') != 0)
{
tempArray.push({link : temp1 , text : temp1_data}) ;   
}
}) ;
});
defered.resolve(tempArray) ; 
//--------------------------------------------------------------WRITE FILE 	
var filename = 'dataFile/' + searchData + '.json' ; 
i++ ; 
fs.writeFile(filename,tempArray , function (err) {
  if (err) return console.log(err);
  console.log('Hello World >' + filename+ '\n');
});
return defered.promise ; 
}
//-----------------------------------------------------------
app.post('/data', function(req , res){
searchData = req.body.search ; 	
var urlPart = encodeURIComponent(req.body.search);
var url = 'https://www.google.co.in/search?q='+urlPart+'&ie=utf-8&oe=utf-8&gws_rd=cr&ei=dFY3WKDlOoeOvQSaua3wDQ' ;
var url1 = 'https://www.google.co.in/search?q='+urlPart+'&oq='+urlPart+'&aqs=chrome..69i57.58382j0j7&sourceid=chrome&ie=UTF-8' ;
//non working url ======= var url2 = 'https://www.google.co.in/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=' + urlPart ; 
console.log("url \n" + url); 
console.log("url1 \n" + url1); 
//=============================================================
var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
console.log("user ip address is " + ip + "\n"); 
//============================================================ 
console.log("using url1\n") ;    
request(url , function(error , response , body){
	if(error){
		console.log("Error : " + error) ; 
}
if(!response)
{
res.send('["cant connect"]') ; 	
}
else(response.statusCode === 200)
{
var $ = cheerio.load(body) ; 
collectInternalLink($).then(function(result){
res.send(result) ;	
}) ;	
//res.send($('div #ires h3').text()) ;


}
}) ;
}) ; 

//===========================================================
app.post('/keyWord' , function(req , res){
console.log(req.body.keyWord) ; 
console.log(finalArray) ;
}) ; 


//-----------------------------------------------------------
app.listen(3000 , function(){
console.log('we are listening on port 3000');
}); 