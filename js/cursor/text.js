// build time:Sat Sep 05 2020 23:13:07 GMT+0800 (GMT+08:00)
var a_idx=0;jQuery(document).ready(function(a){a("body").click(function(e){var i=new Array("富强","民主","文明","和谐","自由","平等","公正","法治","爱国","敬业","诚信","友善");var n=a("<span/>").text(i[a_idx]);a_idx=(a_idx+1)%i.length;var t=e.pageX,o=e.pageY;n.css({"z-index":99999,top:o-28,left:t-i[a_idx].length*8,position:"absolute",color:"#ff7a45"});a("body").append(n);n.animate({top:o-180,opacity:0},1500,function(){n.remove()});a_idx=(a_idx+1)%i.length})});
//rebuild by neat 