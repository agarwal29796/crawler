var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
//*******************************************************************

//====================================================================
var startUrl = "https://www.fmovies.to" ;
var searchWord = "snowden" ; 
var pageVisited  = {} ; 
var numPagesVisited = 0 ;
var pageToVisit = [] ;  
var maxPage = 1000 ; 
var url = new URL(startUrl); 
var baseUrl = url.protocol + '//' + url.hostname ;
//====================================================================
pageToVisit.push(startUrl) ;
crawl() ;
//====================================================================
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
function crawl(){
if(numPagesVisited >= maxPage)
{
console.log('reached max number of page limit') ; 	
}
var nextPage = pageToVisit.pop() ; 
if(nextPage in pageVisited){
	crawl() ; 
}
else{
visitPage(nextPage , crawl) ;
}
}
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
function visitPage(url , callback){
pageVisited[url] = true ; 	
numPagesVisited++ ; 
console.log("visiting Page " + url) ; 
request(url , function(error , response, body){
console.log("Status code: " + response.statusCode);
if(response.statusCode !== 200)
{
	callback() ; 
	return ;
} 
var $ = cheerio.load(body) ; 
var isWordFound = searchForWord($ , searchWord) ;
if(isWordFound){
	console.log('word '  + searchWord + ' found at '+ url) ;    
}
else
{
collectInternalLinks($) ; 
callback() ;	
}
}) ; 
}
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
function searchForWord($ , word){
var bodyText = $('html > body').text().toLowerCase() ; 
return(bodyText.indexOf(word.toLowerCase()) !== -1) ; 	
}
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc

function collectInternalLinks($){
	var relativeLinks = $("a[href^='/']") ; 
	console.log("found " + relativeLinks.length + " relative links on page ; "); 
    relativeLinks.each(function(){
     pageToVisit.push(baseUrl + $(this).attr('href')) ;  
    }) ; 	
}
//cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc





//*******************************************************************


