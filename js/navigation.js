
const page = $('#page');
let currentPage = "html/calendarBase.html"
  const shell = require('electron').shell;

export function allowNav(){
  $("#assignments").click(() => {
    navigateTo("html/assignments.html");
  });
  $("#meetings").click(() => {
    navigateTo("html/meetings.html");
  });
  $("#calendar").click(() =>{
    navigateTo("html/calendarBase.html")
  });
}


export function externalLinks(){


  // assuming $ is jQuery
  $(document).on('click', 'a[href^="http"]', function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
  });
}

function navigateTo(newPage){
    if(newPage == currentPage){
      // do nothing
    }
    else{
      page.html("");
      page.load(newPage);
      currentPage = newPage;
    }
}
