
const page = $('#page');
let currentPage = "html/calendarBase.html"

export default function allowNav(){
  $("#assignmentsCard").click(() => {
    navigateTo("html/assignments.html");
  });
  $("#meetingsCard").click(() => {
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
