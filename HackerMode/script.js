let grid = document.getElementById("grid");
let radius = 0.13 * window.innerHeight;
let centreX = window.innerWidth / 2;
let centreY = window.innerHeight / 2 + 50;
let ul=document.getElementsByClassName("ranking")[0];

let angles = [0, 60, 120, 180, 240, 300];
let rot = [120, 180, 240, 300, 0, 60];
let labelrot = [240, 180, 120, 60, 0, 300];
let labeltran = [-120, -180, 120, 60, 0];
let labels1 = [
  [8, 8, 9, 8, 8, 9],
  [6, 5, 4, 6, 4, 5],
  [1, 1, 3, 2, 1, 2],
];
let labels2= [
    [1,0,1,0,1,0],
    [0,1,0,1,0,1]
  ]
  let j, i;
  const array = [];
  for (j = 0; j < 3; j++) {
    const arr = [];
    for (i = 0; i < 6; i++) {
      plotNode(angles[i], i, j, arr);
    }
    array.push(arr);
  }
  for (j = 0; j < 3; j++) {
    for (i = 0; i < 6; i++) {
      plotEdge(rot, i, j, array);
    }
  }
  let pastScores=[];
  
  for(i=0;i<localStorage.length; i++){
    const myKey=localStorage.key(i);
    pastScores.push([myKey,localStorage[myKey]]);
  }

  pastScores.sort((a,b)=>b[1]-a[1]);
  // pastScores.reverse();

  for(i=0;i<3;i++){
    let li=document.createElement("li");
    li.innerHTML=`${pastScores[i][0]} | ${pastScores[i][1]}`;
    ul.appendChild(li);
  }
  
function plotNode(angle, i, j, arr) {
  r = radius * (j + 1);
  let x = centreX + r * Math.cos((angle * Math.PI) / 180);
  let y = centreY + r * Math.sin((angle * Math.PI) / 180);
  const node = document.createElement("button");
  node.className = "node";
  node.id = `${Math.floor(j + 1)}${Math.floor(i + 1)}`;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  grid.appendChild(node);
  arr.push([x, y]);
}
function plotEdge(rot, i, j, array) {
  const edge = document.createElement("div");
  edge.className = "edge";
  edge.style.width = `${radius * (j + 1)}px`;
  edge.style.left = `${array[j][i][0] + 15}px`;
  edge.style.top = `${array[j][i][1] + 15}px`;
  edge.style.transform = `rotate(${rot[i]}deg)`;

//label

  const label = document.createElement("p");
  label.innerHTML = `${labels1[j][i]}`;
  label.style.transform = `translate(${(radius * (j + 1)) / 2}px, -50%) rotate(${-rot[i]}deg)`;
  label.className = "label";
  edge.appendChild(label);
  grid.appendChild(edge);
  if (j == 0) {
    for (k = 0; k <= 5; k += 2) {
      const edge = document.createElement("div");
      const label = document.createElement("p");
      edge.className = "edge";
      edge.style.width = `${radius}px`;
      edge.style.left = `${array[0][k][0] + 15}px`;
      edge.style.top = `${array[0][k][1] + 15}px`;
      edge.style.transform = `rotate(${angles[k]}deg)`;
      label.innerHTML = `${labels2[j][k]}`;
      label.style.transform = `translate(${radius / 2}px, -50%) rotate(${-angles[k]}deg)`;
      label.className = "label";
      edge.appendChild(label);
      grid.appendChild(edge);
    }
  } else if (j == 1) {
    for (k = 1; k <= 5; k += 2) {
      const edge = document.createElement("div");
      const label = document.createElement("p");
      edge.className = "edge";
      edge.style.width = `${radius}px`;
      edge.style.left = `${array[1][k][0] + 15}px`;
      edge.style.top = `${array[1][k][1] + 15}px`;
      edge.style.transform = `rotate(${angles[k]}deg)`;
      label.innerHTML = `${labels2[j][k]}`;
      label.style.transform = `translate(${radius / 2}px, -50%) rotate(${-angles[k]}deg)`;
      label.className = "label";
      edge.appendChild(label);
      grid.appendChild(edge);
    }
  }
}