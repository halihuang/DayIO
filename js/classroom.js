const fs = require('fs')

export function returnAssignments(){
  return new Promise((resolve, reject) => {
    fs.readFile('classroomAssignments.json', (err, content) =>{
      if(err){
        reject(console.log("error occured reading assignments", err));
      }
      let assignments = JSON.parse(content);
      resolve(assignments);
    });
  });
}


export function returnMeetings(){
  return new Promise((resolve, reject) => {
    fs.readFile('classroomMeetings.json', (err, content) =>{
      if(err){
        reject(console.log("error occured reading courses", err));
      }
      let meetings = JSON.parse(content);
      resolve(meetings);
    });
  });
}

export async function returnCourses(){
  return new Promise((resolve, reject) => {
    fs.readFile('courses.json', (err, content) =>{
      if(err){
        reject(console.log("error occured reading courses", err));
      }
      let courses = JSON.parse(content);
      resolve(courses);
    });
  });

}

returnCourses().then((response) => {
  console.log(response);
});
