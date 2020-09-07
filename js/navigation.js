
const page = $('#page');
let currentPage = "html/calendarBase.html"

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
