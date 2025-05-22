//GLOBAL SECTION
let bulboard=document.getElementById("bulboard");
let undo=document.getElementById("undo");
let redo=document.getElementById("redo");
const now = new Date();
let gameOver=false;
let play=true;
let rTurn = true;
let gtime_min=0;
let gtime_sec=10;
let r_min=2;
let r_sec=30;
let b_min=2;
let b_sec=30;
let rInterval=null;
let bInterval=null;
let playbtn=document.getElementById("play");
let pausebtn=document.getElementById("pause");
let reset=document.getElementById("reset");
let nodes = document.querySelectorAll(".node");
let innerRing=['11','12','13','14','15','16'];
let rsc = document.querySelector("#rsc");
let bsc = document.querySelector("#bsc");
let rt = document.querySelector("#rt");
let bt = document.querySelector("#bt");
let gt = document.querySelector("#gtimer");
let rtm=document.getElementById("rtm");
let btm=document.getElementById("btm");
let rOccNodes = [];
let bOccNodes = [];
let red = [], blue = [];
let movesHistory=new Map();
let historyIndex=-1;
const moveAud = new Audio('move.mp3');
const elimAud = new Audio('eliminate.mp3');



rt.innerHTML = `Red Timer:${r_min}min ${r_sec}sec`;
bt.innerHTML = `Blue Timer:${b_min}min ${b_sec}sec`;

let occupiable = new Map([
  [11, [12, 16,21 ]],
  [12, [11, 13]],
  [13, [12, 14, 23]],
  [14, [13, 15]],
  [15, [16, 14, 25]],
  [16, [11, 15]],
  [21, [11, 22, 26]],
  [22, [21, 23, 32]],
  [23, [13, 22, 24]],
  [24, [23, 25, 34]],
  [25, [24, 26,15]],
  [26, [21, 25, 36]],
  [31, [32, 36]],
  [32, [22, 31, 33]],
  [33, [32, 34]],
  [34, [24, 33, 35]],
  [35, [34, 36]],
  [36, [26, 31, 35]],
]);

//SCORING SECTION
let redScore = 0,
  blueScore = 0;
let scoringParams = [
  [
    [31, 32],
    [32, 33],
    [35, 36],
    [22, 32],
    [24, 34],
    [26, 36],
    [11, 21],
    [13, 23],
    [15, 25],
  ],
  [
    [34, 35],
    [31, 36],
  ],
  [[33, 34]],
  [
    [23, 24],
    [25, 26],
  ],
  [
    [22, 23],
    [21, 26],
  ],
  [
    [21, 22],
    [24, 25],
  ],
  [],
  [
    [11, 12],
    [12, 13],
    [14, 15],
    [15, 16],
  ],
  [
    [13, 14],
    [11, 16],
  ],
];

function eliminateTitan(attackColor,defendColor,defendOccNodes,defendName){
  let copy = [...defendColor];
    copy.forEach((pos)=>{  //pos is a string
      let spots= occupiable.get(parseInt(pos)); //spots is the second array
      let flag=0;
      spots.forEach((spot)=>{
        if(!attackColor.includes(spot.toString()))flag=1;
      })
      if(!flag){
        elimAud.play();
        defendColor.splice(defendColor.indexOf(pos),1); //removed from color array
        defendOccNodes.splice(defendOccNodes.findIndex(node => node.id===pos),1); //emoved from colorOccNodes array
        document.getElementById(pos).style.backgroundColor="#1c1f2b";
        bulboard.innerHTML+= `${defendName} was removed at ${pos}`;
        setInterval(()=>{
          bulboard.innerHTML="";
        },5000);
      }
    })
}

function scoring(color, sc, c) {
  let colorScore = 0;
  for (let i = 0; i < color.length; i++) {
    for (let j = i + 1; j < color.length; j++) {
      let pair = [parseInt(color[i]), parseInt(color[j])];
      pair.sort();
      scoringParams.forEach((scoreGroup, idx) => {
        scoreGroup.forEach((doublet) => {
          if (doublet[0] === pair[0] && doublet[1] === pair[1]) {
            colorScore += idx + 1;
          }
        });
      });
    }
  }
  sc.innerHTML = `${c} score: ${colorScore}`;
  return colorScore;
}

function setTitans(nodes) {
  return new Promise((resolve) => {
    let curPlayer = 0;
    let outerCount = 0;
    const outerNodes = Array.from(nodes).slice(12, 18);
    const outerLessNodes = Array.from(nodes).slice(6, 12);
    outerNodes.forEach((node) => {
      const clickHandlerOuter = function () {
        node.style.backgroundColor = curPlayer === 0 ? "red" : "blue";
        let id = node.id;
        if (curPlayer === 0) {
          red.push(id);
          redScore = scoring(red, rsc, "Red");
          rOccNodes.push(node);
          curPlayer = 1;
        } else {
          blue.push(id);
          blueScore = scoring(blue, bsc, "Blue");
          bOccNodes.push(node);
          curPlayer = 0;
        }
        node.removeEventListener("click", clickHandlerOuter);
        outerCount++;
        if (outerCount === 6) activateInnerRing();
      };
      node.addEventListener("click", clickHandlerOuter);
    });

    function activateInnerRing() {
      let innerHandlers = [];
      outerLessNodes.forEach((node, i) => {
        const clickHandlerInner = function () {
          node.style.backgroundColor = curPlayer === 0 ? "red" : "blue";
          let id = node.id;
          if (curPlayer === 0) {
            red.push(id);
            redScore = scoring(red, rsc, "Red");
            rOccNodes.push(node);
            curPlayer = 1;
          } else {
            blue.push(id);
            blueScore = scoring(blue, bsc, "Blue");
            bOccNodes.push(node);
            curPlayer = 0;
          }
          node.removeEventListener("click",innerHandlers[i])
          outerCount++;
          if (outerCount === 8) {
            outerLessNodes.forEach((node, index) => {
              node.removeEventListener("click", innerHandlers[index]);
            });
            resolve("Titans have been set. Game begins");
          }
        };
        innerHandlers[i] = clickHandlerInner;
        node.addEventListener("click", clickHandlerInner);
      });
    }
  });
}

function game() {
  if(rInterval){
    clearInterval(rInterval);
    rInterval=null;
  }
  if(bInterval){
    clearInterval(bInterval);
    bInterval=null;
  }
  if(historyIndex<movesHistory.length-1){
    movesHistory=movesHistory.slice(0,historyIndex+1);
  }
  let union = [...new Set([...red, ...blue])].sort();
  if(union.length>=innerRing.length){
    let f=0;
    for(i=0;i<innerRing.length;i++){
      if(union[i]!=innerRing[i])f=1;
    }
    if(!f)gameOver=true;
  } 
  if(gameOver){
    handlegameOver();
    return;
  }
  if(red.length===0){
    alert("BLUE WON!");
    return;
  }
  else if(blue.length===0){
    alert("RED WON!");
    return;
  }
  let currNodeId;
  if (rTurn) {
    let move=[];
    eliminateTitan(red,blue,bOccNodes,"Blue");
    const tempCopy = [...rOccNodes];
    let rtime=20;
    rInterval = setInterval(() => {
      if(play)rtime--;
      if(r_min>=1 && r_sec==0){
        r_min--;r_sec=60;
      }
      else if(r_min==0 && r_sec==0){
        gtime_min=0;gtime_sec=0;return;
      }
      if(play)r_sec--;
      rt.innerHTML = `Red Timer:${r_min}min ${r_sec}sec`;
      rtm.innerHTML = `This Move: ${rtime}sec`;
      if (rtime === 0) {
        rTurn = false;
        clearInterval(rInterval);
        game();
      }
    }, 1000);
    let nodeEventHandlers = [];
    let posNodeEventHandlers = [];
    rOccNodes.forEach((node, i) => {
      // CHOSING THE TITAN TO BE MOVED FOR RED

      const choseTitanR = function () {
        //IF YOU HAVE CONTINUED WITH THE GAME NOW YOU CANT REDO
        if(historyIndex<movesHistory.length-1){
          movesHistory=movesHistory.slice(0,historyIndex+1);
        }
        // WHEN THIS FUNCTION IS ACTIVATED IT MEANS THE NODE TO BE MOVED HAS BEEN CHOSEN
        currNodeId = node.id;
        move.push(node.id);
        // ALTERING THE ROCCNODES AND RED ARRAYS AND DIMING THE SELECTED NODE
        node.style.backgroundColor = "#f69f9f";
        rOccNodes.splice(rOccNodes.indexOf(node), 1);
        red.splice(red.indexOf(currNodeId), 1);
        // NOW THAT NODE TO BE MOVED HAS BEEN CHOSEN, EVENT LISTENERS FOR ALL OTHER NODES HAVE TO BE REMOVED
        tempCopy.forEach((node, j) => {
          node.removeEventListener("click", nodeEventHandlers[j]);
        });

        // FINDING THE NODES THAT CAN BE OCCUPIED BY THE GIVEN SELECTED NODE
        let avpos = occupiable.get(parseInt(currNodeId));

        // FILTERING OUT THOSE NODES THAT HAVE ALREADY BEEN OCCUPIED
        let available = avpos.filter(
          (pos) =>
            !red.includes(pos.toString()) && !blue.includes(pos.toString())
        );

        // OUT OF THE FINAL OCCUPIABLE NODES
        available.forEach((pos, idx) => {
          let posNode = document.getElementById(pos.toString()); // GETTING THE OCCUPIABLE NODES

          const placeNewTitanR = function () {
            moveAud.play();
            move.push(posNode.id);
            rtm.innerHTML="This Move: 20sec"
            // RESPONSIBLE FOR PLACING THE DIMMED TITAN AT NEW PLACE
            // SETTING THE NEW TITAN
            posNode.style.backgroundColor = "red";
            red.push(posNode.id);
            redScore = scoring(red, rsc, "Red");
            rOccNodes.push(posNode);
            document.getElementById(currNodeId).style.backgroundColor =
            "#1c1f2b";
            clearInterval(rInterval);
            eliminateTitan(red,blue,bOccNodes,"Blue");
            rTurn = false;
            movesHistory.set("red", move);
            bulboard.innerHTML+=`
            Red: ${move}`;
            historyIndex++;
            // SINCE NEW POSITION HAS BEEN DECIDED, WE NEED TO REMOVE EVENT LISTENERS FROM OCCUPIABLE NODES
            available.forEach((pos, j) => {
              document
              .getElementById(pos.toString())
              .removeEventListener("click", posNodeEventHandlers[j]);
            });
            game();
          };
          posNodeEventHandlers[idx] = placeNewTitanR;
          posNode.addEventListener("click", placeNewTitanR);
        });
      }; // END OF CHOSE TITAN
      nodeEventHandlers[i] = choseTitanR;
      node.addEventListener("click", choseTitanR);
    });
  } else {
    eliminateTitan(blue,red,rOccNodes,"Red");
    let tempCopy = [...bOccNodes];
    let nodeEventHandlers = [];
    let posNodeEventHandlers = [];
    let move=[];
    let btime=20;
    bInterval = setInterval(() => {
      if(play)btime--;
      if(b_min>=1 && b_sec==0){
        b_min--;b_sec=60;
      }
      else if(b_min==0 && b_sec==0){
        gtime_min=0;gtime_sec=0;return;
      }
      if(play)b_sec--;
      bt.innerHTML = `Blue Timer:${b_min}min ${b_sec}sec`;
      btm.innerHTML = `This Move: ${btime}sec`;
      if (btime === 0) {
        rTurn = true;
        clearInterval(  bInterval);
        game();
      }
    }, 1000);
    bOccNodes.forEach((node, i) => {
      // CHOOSING THE TITAN TO BE MOVED FOR BLUE

      const choseTitanB = function () {
        //NOW YOU CANT UNDO
        if(historyIndex<movesHistory.length-1){
          movesHistory=movesHistory.slice(0,historyIndex+1);
        }
        // WHEN THIS FUNCTION IS ACTIVATED IT MEANS THE NODE TO BE MOVED HAS BEEN CHOSEN
        currNodeId = node.id;
        move.push(node.id);
        // ALTERING THE BOCCNODES AND BLUE ARRAYS AND DIMMING THE SELECTED NODE
        node.style.backgroundColor = "#8787f3";
        bOccNodes.splice(bOccNodes.indexOf(node), 1);
        blue.splice(blue.indexOf(currNodeId), 1);

        // NOW THAT NODE TO BE MOVED HAS BEEN CHOSEN, EVENT LISTENERS FOR ALL OTHER NODES HAVE TO BE REMOVED
        tempCopy.forEach((node, j) => {
          node.removeEventListener("click", nodeEventHandlers[j]);
        });

        // FINDING THE NODES THAT CAN BE OCCUPIED BY THE GIVEN SELECTED NODE
        let avpos = occupiable.get(parseInt(currNodeId));

        // FILTERING OUT THOSE NODES THAT HAVE ALREADY BEEN OCCUPIED
        let available = avpos.filter(
          (pos) =>
            !red.includes(pos.toString()) && !blue.includes(pos.toString())
        );

        // OUT OF THE FINAL OCCUPIABLE NODES
        available.forEach((pos, idx) => {
          let posNode = document.getElementById(pos.toString()); // GETTING THE OCCUPIABLE NODES

          const placeNewTitanB = function () {
            moveAud.play();
          btm.innerHTML="This Move: 20sec"
            // RESPONSIBLE FOR PLACING THE DIMMED TITAN AT NEW PLACE
            // SETTING THE NEW TITAN
            posNode.style.backgroundColor = "blue";
            blue.push(posNode.id);
            move.push(posNode.id);
            blueScore = scoring(blue, bsc, "Blue");
            bOccNodes.push(posNode);
            document.getElementById(currNodeId).style.backgroundColor =
              "#1c1f2b";
            clearInterval(bInterval);
            rTurn = true;
            eliminateTitan(blue,red,rOccNodes,"Red");
            movesHistory.set("blue",move);
            bulboard.innerHTML+=`
            Blue: ${move}`;

            historyIndex++;
            // SINCE NEW POSITION HAS BEEN DECIDED, WE NEED TO REMOVE EVENT LISTENERS FROM OCCUPIABLE NODES
            available.forEach((pos, j) => {
              document
              .getElementById(pos.toString())
              .removeEventListener("click", posNodeEventHandlers[j]);
            });
            game();
          };
          posNodeEventHandlers[idx] = placeNewTitanB;
          posNode.addEventListener("click", placeNewTitanB);
        });
      }; // END OF CHOSE TITAN
      nodeEventHandlers[i] = choseTitanB;
      node.addEventListener("click", choseTitanB);
    });
  }
}

function handlegameOver(){
  if(redScore===blueScore)alert("TIE!");
  else if(redScore>blueScore)alert("RED WON!");
  else alert("BLUE WON!");
  localStorage.setItem(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}` , redScore>=blueScore?redScore:blueScore);
}
async function gameSequence() {
  const message = await setTitans(nodes);
  console.log(message);
  game();

  undo.addEventListener("click",()=>{
    if(historyIndex>=0){
      console.log(movesHistory[historyIndex]);
      document.getElementById(movesHistory[historyIndex][1]).style.backgroundColor="#1c1f2b";
      if(!rTurn){  //RED JUST COMPLETED ITS MOVE
        rTurn=true;
        document.getElementById(movesHistory[historyIndex][0]).style.backgroundColor="red"; //PLACING RED BACK  
        red.splice(red.indexOf(movesHistory[historyIndex][1]),1);
        red.push(movesHistory[historyIndex][0]);
        redScore = scoring(red, rsc, "Red");
        rOccNodes.splice(rOccNodes.findIndex(node=> node.id===movesHistory[historyIndex][1]),1);
        rOccNodes.push(document.getElementById(movesHistory[historyIndex][0]));
      }
      else{
        rTurn=false;
        document.getElementById(movesHistory[historyIndex][0]).style.backgroundColor="blue"; //PLACING BLUE BACK  
        blue.splice(blue.indexOf(movesHistory[historyIndex][1]),1);
        blue.push(movesHistory[historyIndex][0]);
        blueScore = scoring(blue, bsc, "Blue");
        bOccNodes.splice(bOccNodes.findIndex(node=> node.id===movesHistory[historyIndex][1]),1);
        bOccNodes.push(document.getElementById(movesHistory[historyIndex][0]));
      }
      console.log(movesHistory);
      historyIndex--;
      game();
    }
    
  })
  
  redo.addEventListener("click",()=>{
    if(historyIndex<movesHistory.length-1){
      historyIndex++;
      console.log(movesHistory[historyIndex]);
      document.getElementById(movesHistory[historyIndex][0]).style.backgroundColor="#1c1f2b";
      if(!rTurn){  //RED JUST PLAYED ITS MOVE SO CHANGES ARE BEING MADE IN BLUE's TURN
        rTurn=true;
        document.getElementById(movesHistory[historyIndex][1]).style.backgroundColor="blue";
        blue.splice(blue.indexOf(movesHistory[historyIndex][0]),1);
        blue.push(movesHistory[historyIndex][1]);
        blueScore = scoring(blue, bsc, "Blue");
        bOccNodes.splice(bOccNodes.findIndex(node=> node.id===movesHistory[historyIndex][0]),1);
        bOccNodes.push(document.getElementById(movesHistory[historyIndex][1]));
      }
      else{
        rTurn=false;
        document.getElementById(movesHistory[historyIndex][1]).style.backgroundColor="red"; //PLACING RED BACK  
        red.splice(red.indexOf(movesHistory[historyIndex][0]),1);
        red.push(movesHistory[historyIndex][1]);
        redScore = scoring(red, rsc, "Red");
        rOccNodes.splice(rOccNodes.findIndex(node=> node.id===movesHistory[historyIndex][0]),1);
        rOccNodes.push(document.getElementById(movesHistory[historyIndex][1]));
      }
  game();
    }
  
  })
  playbtn.addEventListener("click", ()=>{
    play=true;
  })
  pausebtn.addEventListener("click",()=>{
    play=false;
  })
  gt.innerHTML=`Game Timer : ${gtime_min} min ${gtime_sec}sec`;
  let gametimer = setInterval(()=>{
    gt.innerHTML=`Game Timer : ${gtime_min} min ${gtime_sec}sec`;
    if(gtime_sec===0 && gtime_min>=1){
      gtime_sec=60;gtime_min--;
    }
    else if(gtime_sec===0 && gtime_min==0){
    handlegameOver();
    gameOver=true;
    clearInterval(gametimer);
  }
  if(play)gtime_sec--;
  },1000);
  
}

window.addEventListener("DOMContentLoaded", gameSequence);
reset.addEventListener("click",()=>{
  location.reload();
});
