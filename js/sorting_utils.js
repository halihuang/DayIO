  export function sortBasedOnTime(arr, inserted){
    if(arr.length){
      var entered = false;
      for(let i = 0; i < arr.length; i++){
        let item = arr[i];
        var moment1 = getMoment(item);
        var moment2 = getMoment(inserted)
        if(compareDueDates(moment1, moment2)){
          arr.splice(i, 0, inserted);
          entered = true;
          break;
        }
      }
      if(!entered){
        arr.push(inserted)
      }
    }
    else{
      arr.push(inserted);
    }
  }

  function stillDue(assignment){
    return compareDueDates(getMoment(assignment), moment());
  }

  export function getMoment(item){
    if(item.dueDate){
      var dueDate = item.dueDate
      var dueTime = item.dueTime
      var assignmentMoment = moment([dueDate.year, dueDate.month-1, dueDate.day, dueTime.hours, dueTime.minutes])
      return assignmentMoment;
    }
    else{
      var meetingWeekday = item.weekday
      if(moment().day() > item.weekday){
        meetingWeekday += 7;
      }
      var meetingMoment = moment().day(meetingWeekday);
      meetingMoment.hour(item.dueTime.hours)
      meetingMoment.minute(item.dueTime.minutes)
      return meetingMoment;
    }
    
  }

  // compares if due date1 is due after duedate2
  function compareDueDates(moment1, moment2){
    if(moment1.isAfter(moment2)){
      return true;
    }
    return false;
  }

  function validPastDate(pastDate){
    let date = new Date();
    let year = date.getFullYear()
    let month = date.getMonth()
    let day = date.getDay();
    if((year - pastDate.year < 2) && ((year - pastDate.year) * 4 + month < 12)){
      return true;
    }
    return false;
  }

export function sortDueDates(assignment, sortedAssignments){
  if(stillDue(assignment)){
    sortBasedOnTime(sortedAssignments.due, assignment);
  }
  else if(validPastDate(assignment.dueDate)){
    sortBasedOnTime(sortedAssignments.pastDue, assignment);
  }
}