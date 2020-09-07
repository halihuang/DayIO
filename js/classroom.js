import {sortDueDates, sortBasedOnTime} from './sorting_utils.js';

export function mergeAssignments(){
  let classroomAssignments = returnAssignments();
  let customAssignments = returnCustomAssignments();
  if(classroomAssignments && customAssignments){
    // console.log("1", customAssignments);
    for(let assignment of customAssignments){
      sortDueDates(assignment, classroomAssignments)
    }
    // console.log("2" ,classroomAssignments);
    return(classroomAssignments);
  }
  else if(classroomAssignments){
    // console.log("3" ,classroomAssignments);
    return(classroomAssignments);
  }
  else if(customAssignments){
    let custom = {due: [],
                  pastDue: []};
    for(let assignment of customAssignments){
      sortDueDates(assignment, custom)
    }
    // console.log("4", custom);
    return(custom);
  }
  else{
    console.log('no assignments found at all');
    return(undefined);
  }
}


export function mergeMeetings(){
  let classroomMeetings = returnMeetings();
  let customMeetings = returnCustomMeetings();
  // console.log(classroomMeetings)
  if(classroomMeetings && customMeetings){
    for(let meeting of classroomMeetings){
      for(let customMeeting of customMeetings){
        if (customMeeting.courseName == meeting.courseName){
          customMeeting.link = meeting.link;
          customMeeting.announcement = meeting.announcement
        }
      }
    }
    let newArray = [];
    for(let meeting of customMeetings){
      sortBasedOnTime(newArray, meeting);
    }
    // console.log(1)
    return(newArray);
  }
  else if(customMeetings){
    let newArray = [];
    for(let meeting of customMeetings){
      sortBasedOnTime(newArray, meeting);
    }
    // console.log("5", newArray);
    return(newArray);
  }
  else{
    console.log('no assignments found at all');
    reject(undefined);
  }
}

export function removeAssignment(assignment){
    if(assignment.submitted === false){
        var hidden = JSON.parse(localStorage.getItem("hiddenClassAssignments"));
        if(hidden == undefined){
          hidden = []
        }
        hidden.push(assignment.courseWorkId);
        localStorage.setItem("hiddenClassAssignments", JSON.stringify(hidden));
      }
      else{
        var assignments = returnCustomAssignments();
        for(var [i, item] of assignments.entries()){
          if(item.courseWorkId === assignment.courseWorkId){
            assignments.splice(i, 1);
            break;
          }
        }
        localStorage.setItem("customAssignments", JSON.stringify(assignments));
      }
}

export function removeMeeting(meeting){
    var meetings = returnCustomMeetings();
    for(var [i, item] of meetings.entries()){
        if(item.courseWorkId === meeting.courseWorkId){
        meetings.splice(i, 1);
        break;
        }
    }
    localStorage.setItem("customMeetings", JSON.stringify(meetings));
}


export function returnAssignments(){
  return JSON.parse(localStorage.getItem('classAssignments'));
}


export function returnMeetings(){
  return JSON.parse(localStorage.getItem('classMeetings'));
}

export function returnCourses(){
  return JSON.parse(localStorage.getItem("courses"));
}

export function returnCustomAssignments(){
  return JSON.parse(localStorage.getItem("customAssignments"));
}

export function returnCustomMeetings(){
  return JSON.parse(localStorage.getItem("customMeetings"));
}


// console.log(returnMeetings());
// console.log(returnCustomMeetings());