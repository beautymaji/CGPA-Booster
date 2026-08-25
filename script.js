/* =====================================================
   CGPA BOOSTER - VANILLA JAVASCRIPT
   All data is stored in localStorage for this demo.
===================================================== */

const $ = id => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);

const SUBJECTS = [
  {code:"CS501", name:"Core Java", grade:8.5, credits:4},
  {code:"CS502", name:"DBMS", grade:8.0, credits:4},
  {code:"CS503", name:"Computer Networks", grade:7.5, credits:3},
  {code:"CS504", name:"Software Engineering", grade:7.0, credits:3},
  {code:"CS505", name:"Web Technology", grade:9.0, credits:3},
  {code:"CS506", name:"Data Structures", grade:7.5, credits:4}
];

const TOPICS = [
  ["Java","OOP Concepts"],["Java","Inheritance"],["Java","Polymorphism"],["Java","Abstraction"],
  ["Java","Encapsulation"],["Java","Exception Handling"],["Java","Collections Framework"],["Java","Strings"],
  ["Java","ArrayList vs LinkedList"],["Java","HashMap"],["DBMS","DBMS Fundamentals"],["DBMS","Primary and Foreign Keys"],
  ["DBMS","Functional Dependency"],["DBMS","Normalization"],["DBMS","1NF, 2NF and 3NF"],["DBMS","BCNF"],
  ["DBMS","SQL Joins"],["DBMS","Subqueries"],["DBMS","Indexes"],["DBMS","Transactions"],
  ["Computer Networks","OSI Model"],["Computer Networks","TCP/IP Model"],["Computer Networks","IP Addressing"],
  ["Computer Networks","TCP Handshake"],["Computer Networks","UDP vs TCP"],["Computer Networks","HTTP and HTTPS"],
  ["Computer Networks","DNS"],["Computer Networks","Routing"],["Computer Networks","DHCP DORA"],["Computer Networks","Network Security"],
  ["Web Technology","HTML Basics"],["Web Technology","CSS Box Model"],["Web Technology","JavaScript DOM"],
  ["Web Technology","Events"],["Web Technology","LocalStorage"],["Web Technology","Responsive Design"]
];

const QUIZ_BANK = {
  "Java":[
    {q:"Which OOP concept allows a child class to acquire properties of a parent class?",o:["Encapsulation","Inheritance","Abstraction","Compilation"],a:1,t:"Inheritance"},
    {q:"Which keyword creates an object in Java?",o:["class","new","this","object"],a:1,t:"Objects"},
    {q:"Which collection stores key-value pairs?",o:["ArrayList","HashSet","HashMap","Stack"],a:2,t:"HashMap"},
    {q:"Which keyword is used to inherit a class?",o:["implements","extends","inherits","super"],a:1,t:"Inheritance"},
    {q:"Which method starts a Java program?",o:["start()","run()","main()","init()"],a:2,t:"Java Basics"},
    {q:"Which concept hides internal implementation details?",o:["Inheritance","Abstraction","Overloading","Casting"],a:1,t:"Abstraction"},
    {q:"Which collection does not allow duplicate elements?",o:["ArrayList","HashSet","Vector","LinkedList"],a:1,t:"Collections"}
  ],
  "DBMS":[
    {q:"Which normal form removes partial dependency?",o:["1NF","2NF","3NF","BCNF"],a:1,t:"Normalization"},
    {q:"Which key uniquely identifies a row?",o:["Foreign Key","Primary Key","Candidate only","Composite only"],a:1,t:"Keys"},
    {q:"Which SQL command retrieves data?",o:["GET","SELECT","FETCHROW","READ"],a:1,t:"SQL"},
    {q:"Which join returns matching rows from both tables?",o:["INNER JOIN","FULL JOIN","CROSS JOIN","SELF JOIN"],a:0,t:"SQL Joins"},
    {q:"A foreign key usually references which key?",o:["Primary Key","Random Key","Index only","View"],a:0,t:"Keys"},
    {q:"Which normal form removes transitive dependency?",o:["1NF","2NF","3NF","4NF"],a:2,t:"Normalization"},
    {q:"Which property means a transaction is all-or-nothing?",o:["Consistency","Isolation","Atomicity","Durability"],a:2,t:"Transactions"}
  ],
  "Computer Networks":[
    {q:"Which protocol provides reliable transport?",o:["IP","UDP","TCP","ARP"],a:2,t:"TCP"},
    {q:"How many layers are in the OSI model?",o:["5","6","7","8"],a:2,t:"OSI Model"},
    {q:"Which protocol translates domain names to IP addresses?",o:["DHCP","DNS","HTTP","FTP"],a:1,t:"DNS"},
    {q:"What does HTTPS add to HTTP?",o:["Compression","Encryption","Routing","Caching only"],a:1,t:"HTTP and HTTPS"},
    {q:"Which protocol automatically assigns IP configuration?",o:["DNS","DHCP","ARP","TCP"],a:1,t:"DHCP"},
    {q:"TCP connection establishment uses which process?",o:["Two-way handshake","Three-way handshake","Four-way handshake","One-way handshake"],a:1,t:"TCP Handshake"},
    {q:"Which device forwards packets between networks?",o:["Hub","Switch","Router","Repeater"],a:2,t:"Routing"}
  ],
  "Web Technology":[
    {q:"Which language structures a web page?",o:["CSS","HTML","SQL","Java"],a:1,t:"HTML Basics"},
    {q:"Which CSS model controls spacing around an element?",o:["Box Model","Grid Model","DOM Model","Event Model"],a:0,t:"CSS Box Model"},
    {q:"Which JavaScript API selects an element by id?",o:["getElementById","selectId","findById","queryId"],a:0,t:"JavaScript DOM"},
    {q:"Which browser API can store simple key-value data?",o:["sessionSQL","LocalStorage","BrowserDB","DOMStore"],a:1,t:"LocalStorage"},
    {q:"Which CSS approach helps layouts adapt to screen sizes?",o:["Responsive Design","Static Design","Server Design","Database Design"],a:0,t:"Responsive Design"}
  ]
};

let currentQuiz = null;
let quizIndex = 0;
let quizScore = 0;
let selectedOption = null;

/* ---------- STORAGE ---------- */

function getUsers(){ return JSON.parse(localStorage.getItem("cgpa_users") || "[]"); }
function saveUsers(users){ localStorage.setItem("cgpa_users", JSON.stringify(users)); }
function currentUser(){ return localStorage.getItem("cgpa_current_user"); }
function userKey(name,key){ return `cgpa_${name}_${key}`; }
function getData(key, fallback){ const n=currentUser(); if(!n) return fallback; return JSON.parse(localStorage.getItem(userKey(n,key)) || JSON.stringify(fallback)); }
function setData(key,value){ const n=currentUser(); if(n) localStorage.setItem(userKey(n,key), JSON.stringify(value)); }

function defaultTopics(){
  return TOPICS.map((x,i)=>({id:i+1,subject:x[0],name:x[1],status:"notstarted"}));
}
function defaultSchedule(){
  return [
    {id:1,date:today,start:"08:00",end:"09:00",subject:"DBMS",topic:"Normalization",done:false},
    {id:2,date:today,start:"17:00",end:"18:00",subject:"Java",topic:"OOP Concepts",done:false}
  ];
}
function ensureUserData(){
  if(!getData("topics",null)) setData("topics",defaultTopics());
  if(!getData("schedule",null)) setData("schedule",defaultSchedule());
  if(!getData("cgpa",null)) setData("cgpa",7.34);
  if(!getData("quizHistory",null)) setData("quizHistory",[]);
  if(!getData("streak",null)) setData("streak",{count:0,last:""});
}

/* ---------- AUTH ---------- */

document.querySelectorAll(".auth-tab").forEach(tab=>{
  tab.addEventListener("click",()=>{
    document.querySelectorAll(".auth-tab").forEach(x=>x.classList.remove("active"));
    tab.classList.add("active");
    $("loginForm").classList.toggle("hidden",tab.dataset.auth!=="login");
    $("signupForm").classList.toggle("hidden",tab.dataset.auth!=="signup");
    $("authMessage").textContent="";
  });
});

$("signupForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("signupName").value.trim();
  const email=$("signupEmail").value.trim().toLowerCase();
  const password=$("signupPassword").value;
  const users=getUsers();
  if(users.some(u=>u.email===email)){ $("authMessage").textContent="An account with this email already exists."; return; }
  users.push({name,email,password});
  saveUsers(users);
  localStorage.setItem("cgpa_current_user",name);
  ensureUserData();
  enterApp();
  toast("Account created successfully 🎉");
});

$("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=$("loginEmail").value.trim().toLowerCase();
  const password=$("loginPassword").value;
  const user=getUsers().find(u=>u.email===email && u.password===password);
  if(!user){ $("authMessage").textContent="Invalid email or password."; return; }
  localStorage.setItem("cgpa_current_user",user.name);
  ensureUserData();
  enterApp();
  toast("Welcome back! 👋");
});

$("logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem("cgpa_current_user");
  $("app").classList.add("hidden");
  $("authScreen").classList.remove("hidden");
  $("loginForm").reset();
});

function enterApp(){
  $("authScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
  renderUser();
  renderAll();
}

if(currentUser()){
  ensureUserData();
  enterApp();
}

/* ---------- NAVIGATION ---------- */

const sections=document.querySelectorAll(".section");
const navItems=document.querySelectorAll(".nav-item[data-section]");

function showSection(id){
  sections.forEach(s=>s.classList.toggle("active-section",s.id===id));
  navItems.forEach(n=>n.classList.toggle("active",n.dataset.section===id));
  if(id==="quiz") renderQuiz();
  if(id==="schedule") renderSchedule();
  if(id==="topics") renderTopics();
  window.scrollTo({top:0,behavior:"smooth"});
}
navItems.forEach(item=>item.addEventListener("click",()=>showSection(item.dataset.section)));

/* ---------- USER ---------- */

function renderUser(){
  const user=getUsers().find(u=>u.name===currentUser());
  const name=user?.name || currentUser() || "Student";
  $("userName").textContent=name;
  $("welcomeName").textContent=name.split(" ")[0];
  $("avatar").textContent=name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
}

/* ---------- DASHBOARD ---------- */

function renderAll(){
  renderSubjects();
  renderCalculatorRows();
  renderSchedule();
  renderTopics();
  renderDashboard();
  updateStats();
  fillSubjectSelect();
}

function renderDashboard(){
  const sessions=getData("schedule",[]).filter(x=>x.date===today).sort((a,b)=>a.start.localeCompare(b.start));
  const box=$("dashboardSchedule");
  if(!sessions.length){box.innerHTML='<div class="empty-state">No sessions today. Add your first study session.</div>';}
  else box.innerHTML=sessions.map(s=>`
    <div class="schedule-row">
      <div class="time-box">${formatTime(s.start)}</div>
      <div class="schedule-dot"></div>
      <div class="schedule-row-main"><b>${escapeHtml(s.subject)} · ${escapeHtml(s.topic)}</b><small>${formatTime(s.start)} - ${formatTime(s.end)}</small></div>
      <button class="status-btn ${s.done?'done':''}" onclick="toggleSchedule(${s.id})">${s.done?'Done':'Complete'}</button>
    </div>`).join("");

  const first=sessions.find(x=>!x.done)||sessions[0];
  $("dashboardQuizSubject").textContent=first ? `${first.subject} · ${first.topic}` : "Ready for today's quiz?";
}

/* ---------- SUBJECTS ---------- */

function renderSubjects(){
  $("subjectCards").innerHTML=SUBJECTS.map(s=>`
    <div class="subject-card">
      <div class="subject-top"><span class="subject-code">${s.code}</span><span class="grade">${s.grade}</span></div>
      <h3>${s.name}</h3><p>Current performance and revision progress.</p>
      <div class="marks"><span>Credits <b>${s.credits}</b></span><span>Grade Point <b>${s.grade}</b></span></div>
    </div>`).join("");
}

/* ---------- CALCULATOR ---------- */

function addCalcRow(name="",grade="",credits=""){
  const row=document.createElement("div");
  row.className="calc-row";
  row.innerHTML=`
    <input class="subject-name" placeholder="Subject name" value="${escapeAttr(name)}">
    <input class="grade-input" type="number" min="0" max="10" step=".1" placeholder="0 - 10" value="${grade}">
    <input class="credit-input" type="number" min="1" max="10" placeholder="Credits" value="${credits}">
    <button class="remove">×</button>`;
  row.querySelector(".remove").onclick=()=>row.remove();
  $("calcRows").appendChild(row);
}
function renderCalculatorRows(){
  $("calcRows").innerHTML="";
  SUBJECTS.slice(0,5).forEach(s=>addCalcRow(s.name,s.grade,s.credits));
}
$("addSubject").addEventListener("click",()=>addCalcRow());
$("calculateBtn").addEventListener("click",()=>{
  let points=0,credits=0;
  document.querySelectorAll(".calc-row").forEach(row=>{
    const g=parseFloat(row.querySelector(".grade-input").value)||0;
    const c=parseFloat(row.querySelector(".credit-input").value)||0;
    if(g>=0 && c>0){points+=g*c;credits+=c;}
  });
  const gpa=credits ? points/credits : 0;
  $("gpaResult").textContent=gpa.toFixed(2);
  $("totalCredits").textContent=credits;
  $("gap").textContent=Math.max(0,8-gpa).toFixed(2);
  setData("cgpa",Number(gpa.toFixed(2)));
  updateStats();
  toast("CGPA updated successfully.");
});

/* ---------- SCHEDULE ---------- */

function fillSubjectSelect(){
  $("scheduleSubject").innerHTML=SUBJECTS.map(s=>`<option value="${s.name}">${s.name}</option>`).join("");
}
$("scheduleDate").value=today;

$("scheduleForm").addEventListener("submit",e=>{
  e.preventDefault();
  const sessions=getData("schedule",[]);
  sessions.push({
    id:Date.now(),
    date:$("scheduleDate").value,
    start:$("startTime").value,
    end:$("endTime").value,
    subject:$("scheduleSubject").value,
    topic:$("scheduleTopic").value.trim(),
    done:false
  });
  setData("schedule",sessions);
  e.target.reset();
  $("scheduleDate").value=today;
  renderSchedule(); renderDashboard(); updateStats();
  toast("Study session added 📚");
});

function renderSchedule(){
  const sessions=getData("schedule",[]).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  $("todaySessionCount").textContent=sessions.filter(s=>s.date===today).length;
  const todaySessions=sessions.filter(s=>s.date===today);
  const completed=todaySessions.filter(s=>s.done).length;
  const percent=todaySessions.length ? Math.round(completed/todaySessions.length*100) : 0;
  $("scheduleProgress").style.width=percent+"%";
  $("scheduleProgressText").textContent=percent+"% completed";

  if(!sessions.length){$("scheduleList").innerHTML='<div class="empty-state">No study sessions yet.</div>';return;}
  $("scheduleList").innerHTML=sessions.map(s=>`
    <div class="schedule-item">
      <div class="schedule-time">${s.date}<br>${formatTime(s.start)}-${formatTime(s.end)}</div>
      <div class="schedule-line"></div>
      <div class="schedule-content"><b>${escapeHtml(s.subject)} · ${escapeHtml(s.topic)}</b><small>${s.done?"Completed":"Planned study session"}</small></div>
      <div>
        <button class="complete-btn" onclick="toggleSchedule(${s.id})">${s.done?"Undo":"Done"}</button>
        <button class="delete-btn" onclick="deleteSchedule(${s.id})">Delete</button>
      </div>
    </div>`).join("");
}
function toggleSchedule(id){
  const sessions=getData("schedule",[]);
  const s=sessions.find(x=>x.id===id);
  if(!s)return;
  s.done=!s.done;
  setData("schedule",sessions);
  if(s.done) markTopicLearning(s.subject,s.topic);
  renderSchedule();renderDashboard();updateStats();
  toast(s.done?"Study session completed 🎉":"Session reopened.");
}
function deleteSchedule(id){
  setData("schedule",getData("schedule",[]).filter(s=>s.id!==id));
  renderSchedule();renderDashboard();updateStats();toast("Session deleted.");
}
$("clearCompleted").addEventListener("click",()=>{
  setData("schedule",getData("schedule",[]).filter(s=>!s.done));
  renderSchedule();renderDashboard();toast("Completed sessions cleared.");
});

/* ---------- TOPIC MEMORY ---------- */

function statusLabel(status){
  return status==="mastered"?"Memorized":status==="learning"?"Learning":"Not Started";
}
function renderTopics(){
  const q=($("topicSearch")?.value||"").toLowerCase();
  const filter=$("topicFilter")?.value||"all";
  const topics=getData("topics",defaultTopics()).filter(t=>
    (!q || t.name.toLowerCase().includes(q)||t.subject.toLowerCase().includes(q)) &&
    (filter==="all" || t.status===filter)
  );
  $("topicGrid").innerHTML=topics.length ? topics.map(t=>`
    <div class="topic-card">
      <div class="topic-card-top"><span class="subject-code">${escapeHtml(t.subject)}</span><span class="status-pill pill-${t.status}">${statusLabel(t.status)}</span></div>
      <h3>${escapeHtml(t.name)}</h3>
      <p>Update your memory level after revision.</p>
      <select class="memory-select" onchange="updateTopic(${t.id},this.value)">
        <option value="notstarted" ${t.status==="notstarted"?"selected":""}>Not Started</option>
        <option value="learning" ${t.status==="learning"?"selected":""}>Learning</option>
        <option value="mastered" ${t.status==="mastered"?"selected":""}>Memorized</option>
      </select>
    </div>`).join("") : '<div class="empty-state">No topics found.</div>';

  updateMemorySummary();
}
function updateTopic(id,status){
  const topics=getData("topics",defaultTopics());
  const t=topics.find(x=>x.id===id);
  if(t)t.status=status;
  setData("topics",topics);
  renderTopics();updateStats();
  toast(status==="mastered"?"Topic mastered! 🧠":"Topic status updated.");
}
function markTopicLearning(subject,topic){
  const topics=getData("topics",defaultTopics());
  const found=topics.find(t=>t.subject===subject && t.name.toLowerCase()===topic.toLowerCase());
  if(found && found.status==="notstarted"){found.status="learning";setData("topics",topics);}
}
$("topicSearch").addEventListener("input",renderTopics);
$("topicFilter").addEventListener("change",renderTopics);

function filterTopics(subject){
  showSection("topics");
  $("topicSearch").value=subject;
  $("topicFilter").value="all";
  renderTopics();
}
function updateMemorySummary(){
  const topics=getData("topics",defaultTopics());
  const mastered=topics.filter(t=>t.status==="mastered").length;
  const learning=topics.filter(t=>t.status==="learning").length;
  const not=topics.length-mastered-learning;
  const percent=topics.length?Math.round(mastered/topics.length*100):0;
  $("memoryPercent").textContent=percent+"%";
  $("memoryRing").style.background=`conic-gradient(#6c4bf4 ${percent}%,#ecebf2 0)`;
  $("memMastered").textContent=mastered;
  $("memLearning").textContent=learning;
  $("memNotStarted").textContent=not;
}

/* ---------- QUIZ ---------- */

function getDailyQuizSubject(){
  const sessions=getData("schedule",[]).filter(s=>s.date===today);
  const first=sessions.find(s=>!s.done)||sessions[0];
  return first?.subject || "Java";
}
function getQuestions(subject){
  const bank=QUIZ_BANK[subject]||QUIZ_BANK["Java"];
  return [...bank].sort(()=>Math.random()-.5).slice(0,5);
}
function renderQuiz(){
  const subject=getDailyQuizSubject();
  if(!currentQuiz || currentQuiz.subject!==subject){
    $("quizContainer").innerHTML=`
      <div class="quiz-card">
        <div class="quiz-top"><div><span class="quiz-subject">${subject.toUpperCase()}</span><h2>Daily Memory Quiz</h2></div><span class="goal-badge">5 QUESTIONS</span></div>
        <p style="color:var(--muted);font-size:12px;line-height:1.7">Today's quiz is based on your scheduled subject. Use it for active recall instead of simply rereading notes.</p>
        <button class="primary" onclick="startDailyQuiz()">Start Today's Quiz →</button>
      </div>`;
  }else{
    renderQuestion();
  }
}
function startDailyQuiz(){
  const subject=getDailyQuizSubject();
  currentQuiz={subject,questions:getQuestions(subject)};
  quizIndex=0;quizScore=0;selectedOption=null;
  showSection("quiz");
  renderQuestion();
}
function renderQuestion(){
  const q=currentQuiz.questions[quizIndex];
  $("quizContainer").innerHTML=`
    <div class="quiz-card">
      <div class="quiz-top">
        <div><span class="quiz-subject">${currentQuiz.subject.toUpperCase()}</span><h2>Daily Memory Quiz</h2></div>
        <span class="goal-badge">${quizIndex+1}/${currentQuiz.questions.length}</span>
      </div>
      <div class="quiz-progress"><span style="width:${((quizIndex)/currentQuiz.questions.length)*100}%"></span></div>
      <div class="question-number">QUESTION ${quizIndex+1}</div>
      <h2 class="question">${escapeHtml(q.q)}</h2>
      <div class="options">${q.o.map((o,i)=>`<button class="option" data-option="${i}" onclick="chooseOption(${i})">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join("")}</div>
      <div class="quiz-actions">
        <span style="font-size:10px;color:var(--muted)">Topic: ${escapeHtml(q.t)}</span>
        <button class="primary small" onclick="nextQuestion()"> ${quizIndex===currentQuiz.questions.length-1?"Finish Quiz":"Next →"} </button>
      </div>
    </div>`;
}
function chooseOption(index){
  selectedOption=index;
  document.querySelectorAll(".option").forEach((b,i)=>b.classList.toggle("selected",i===index));
}
function nextQuestion(){
  if(selectedOption===null){toast("Choose an answer first.");return;}
  const q=currentQuiz.questions[quizIndex];
  if(selectedOption===q.a)quizScore++;
  const topics=getData("topics",defaultTopics());
  const topic=topics.find(t=>t.name===q.t || (q.t==="Java Basics"&&t.subject==="Java"));
  if(topic && selectedOption===q.a)topic.status="mastered";
  else if(topic && topic.status==="notstarted")topic.status="learning";
  setData("topics",topics);
  selectedOption=null;
  quizIndex++;
  if(quizIndex>=currentQuiz.questions.length){finishQuiz();return;}
  renderQuestion();
}
function finishQuiz(){
  const total=currentQuiz.questions.length;
  const accuracy=Math.round(quizScore/total*100);
  const history=getData("quizHistory",[]);
  history.push({date:today,subject:currentQuiz.subject,score:quizScore,total,accuracy});
  setData("quizHistory",history.slice(-30));
  updateStreak();
  $("quizContainer").innerHTML=`
    <div class="quiz-card quiz-result">
      <span class="goal-badge">QUIZ COMPLETE</span>
      <div class="result-score">${quizScore}/${total}</div>
      <h2>${accuracy>=80?"Excellent work! 🎉":accuracy>=60?"Good job! Keep revising.":"Keep practicing — you can improve! 💪"}</h2>
      <p>Your accuracy is <b>${accuracy}%</b>. Correct answers help move related topics toward Memorized status.</p>
      <div class="result-badges">
        <span class="result-badge">Accuracy ${accuracy}%</span>
        <span class="result-badge">${currentQuiz.subject}</span>
      </div>
      <button class="primary" onclick="startDailyQuiz()">Try Again</button>
      <button class="outline" style="margin-left:8px" onclick="showSection('topics')">Review Topics</button>
    </div>`;
  currentQuiz=null;
  renderTopics();updateStats();
}
function updateStreak(){
  const data=getData("streak",{count:0,last:""});
  if(data.last===today)return;
  const previous=new Date();
  previous.setDate(previous.getDate()-1);
  const prev=previous.toISOString().slice(0,10);
  data.count=data.last===prev?data.count+1:1;
  data.last=today;
  setData("streak",data);
}

/* ---------- STATS ---------- */

function updateStats(){
  const cgpa=getData("cgpa",7.34);
  $("statCgpa").textContent=Number(cgpa).toFixed(2);
  $("heroCgpa").textContent=Number(cgpa).toFixed(2);
  $("goalCurrentCgpa").textContent=Number(cgpa).toFixed(2);

  const topics=getData("topics",defaultTopics());
  $("masteredCount").textContent=topics.filter(t=>t.status==="mastered").length;

  const history=getData("quizHistory",[]);
  const accuracy=history.length?Math.round(history.reduce((a,x)=>a+x.accuracy,0)/history.length):0;
  $("accuracyStat").textContent=accuracy+"%";

  const streak=getData("streak",{count:0});
  $("streakStat").textContent=streak.count+" days";
  $("sideStreak").textContent=streak.count+" day streak";

  updateMemorySummary();
}

/* ---------- THEME ---------- */

$("themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  const dark=document.body.classList.contains("dark");
  $("themeBtn").innerHTML=dark?"<span>☀</span> Light mode":"<span>☾</span> Dark mode";
  localStorage.setItem("cgpa_theme",dark?"dark":"light");
  const ring=$("memoryRing");
  if(ring)ring.style.background=ring.style.background;
});
if(localStorage.getItem("cgpa_theme")==="dark"){
  document.body.classList.add("dark");
  $("themeBtn").innerHTML="<span>☀</span> Light mode";
}

/* ---------- SEARCH ---------- */

$("searchInput").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase();
  if(!q)return;
  const topicMatch=TOPICS.some(t=>t.join(" ").toLowerCase().includes(q));
  const subjectMatch=SUBJECTS.some(s=>s.name.toLowerCase().includes(q));
  if(topicMatch||subjectMatch)showSection("topics");
});

/* ---------- HELPERS ---------- */

function formatTime(time){
  const [h,m]=time.split(":").map(Number);
  const ap=h>=12?"PM":"AM";
  const hh=h%12||12;
  return `${hh}:${String(m).padStart(2,"0")} ${ap}`;
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function escapeAttr(value){return escapeHtml(value);}
function toast(message){
  const t=$("toast");
  t.textContent=message;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400);
}

/* Make ring id available after HTML load */
Object.defineProperty(window,"memoryRing",{get:()=>document.querySelector(".memory-ring")});

/* Initial setup */
if(currentUser()){
  ensureUserData();
  renderAll();
}
