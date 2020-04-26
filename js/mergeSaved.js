const fs = require('fs');
import {returnAssignments, returnMeetings} from './classroom.js';
import {sortBasedOnTime} from './googleAuth.js';


export function mergeAssignments(){
  let classroomAssignments;
  let customAssignments;
  return new Promise((resolve, reject) =>{
    fs.readFile('customAssignments.json', (err, res) =>{
        customAssignments = JSON.parse(res);
        returnAssignments().then((response, error) =>{
          classroomAssignments = response;
          if(classroomAssignments && customAssignments){

            console.log("1", customAssignments);

            for(let assignment of customAssignments){
              sortBasedOnTime(classroomAssignments.due, assignment);
            }
            console.log("2" ,classroomAssignments);
            resolve(classroomAssignments);
          }
          else if(classroomAssignments){
            console.log("3" ,classroomAssignments);
            resolve(classroomAssignments);
          }
          else if(customAssignments){
            let newArray = [];
            for(let assignment of customAssignments){
              console.log("4",assignment);
              sortBasedOnTime(newArray, assignment);
            }
            console.log("5", newArray);
            resolve(newArray);
          }
          else{
            console.log('no assignments found at all');
            reject(undefined);
          }
        });
    });
  });





}


export function mergeMeetings(){
  let classroomMeetings;
  let customMeetings;
  return new Promise((resolve, reject) =>{
    fs.readFile('customMeetings.json', (err, res) =>{
        if(err){
          console.log(err);
        }
        else{
          customMeetings = JSON.parse(res);
        }
        returnMeetings().then((response, error) =>{
          classroomMeetings = response;
          if(classroomMeetings && customMeetings){
            for(let meeting of classroomMeetings){
              for(let customMeeting of customMeetings){
                if (customMeeting.courseName == meeting.courseName){
                  customMeeting.link = meeting.link;
                }
              }
            }
            let newArray = [];
            for(let meeting of customMeetings){
              sortBasedOnTime(newArray, meeting);
            }
            resolve(newArray);
          }
          else if(customMeetings){
            let newArray = [];
            for(let meeting of customMeetings){
              sortBasedOnTime(newArray, meeting);
            }
            console.log("5", newArray);
            resolve(newArray);
          }
          else{
            console.log('no assignments found at all');
            reject(undefined);
          }
        });
    });
  });
}
